import { env } from "cloudflare:workers";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
  };
};

const TOOL_DEFINITIONS = [
  {
    name: "estado_actualizaciones",
    description: "Consulta el estado reciente de las actualizaciones del sitio.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "actualizar_noticias",
    description: "Actualiza las noticias, el mapa global y el registro de actividad de noticias.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "actualizar_datos_diarios",
    description: "Actualiza indicadores, territorio, Congreso, gabinete y gestión.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
] as const;

function rpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result }, { headers: { "Cache-Control": "no-store" } });
}

function rpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status: code === -32603 ? 500 : 200, headers: { "Cache-Control": "no-store" } });
}

function originOf(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function isAuthorized(request: Request) {
  const configuredSecret = env.CRON_SECRET?.trim();
  const suppliedSecret = request.headers.get("x-cron-secret")?.trim();
  if (configuredSecret && suppliedSecret === configuredSecret) return true;

  const reviewerEmail = env.REVIEWER_EMAIL?.trim().toLowerCase();
  const callerEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  return Boolean(reviewerEmail && callerEmail && callerEmail === reviewerEmail);
}

async function fetchJson(origin: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${origin}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      "x-cron-secret": env.CRON_SECRET ?? "",
      "user-agent": "CuentaPublica-ScheduledUpdate/1.0",
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((payload as { error?: string }).error ?? `HTTP ${response.status}`);
  return payload;
}

async function callTool(request: Request, name: string | undefined) {
  if (!isAuthorized(request)) throw new Error("No autorizado.");
  if (!env.CRON_SECRET) throw new Error("Falta configurar la autorización interna de actualizaciones.");

  const origin = originOf(request);
  if (name === "estado_actualizaciones") return fetchJson(origin, "/api/actualizaciones");
  if (name === "actualizar_noticias") {
    const result = await fetchJson(origin, "/api/noticias-v2?refresh=1");
    const status = await fetchJson(origin, "/api/actualizaciones");
    return { ok: true, result, status };
  }
  if (name === "actualizar_datos_diarios") {
    const result = await fetchJson(origin, "/api/actualizaciones/diarias", { method: "POST" });
    const status = await fetchJson(origin, "/api/actualizaciones");
    return { ok: true, result, status };
  }
  throw new Error("Herramienta no disponible.");
}

export async function POST(request: Request) {
  let body: JsonRpcRequest;
  try {
    body = (await request.json()) as JsonRpcRequest;
  } catch {
    return rpcError(null, -32700, "Solicitud inválida.");
  }

  if (body.method === "initialize") {
    return rpcResult(body.id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "cuenta-regresiva-presidencial", version: "1.0.0" },
    });
  }

  if (body.method === "tools/list") {
    return rpcResult(body.id, { tools: TOOL_DEFINITIONS });
  }

  if (body.method === "tools/call") {
    try {
      const result = await callTool(request, body.params?.name);
      return rpcResult(body.id, { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] });
    } catch (error) {
      return rpcError(body.id, -32603, error instanceof Error ? error.message : "No fue posible ejecutar la actualización.");
    }
  }

  return rpcError(body.id, -32601, "Método no disponible.");
}
