import handler from "vinext/server/fetch-handler";

type WorkerEnvironment = {
  CRON_SECRET?: string;
};

type ExecutionContext = {
  waitUntil(promise: Promise<unknown>): void;
};

async function runHourlyNewsRefresh(env: WorkerEnvironment, context: ExecutionContext) {
  if (!env.CRON_SECRET) throw new Error("CRON_SECRET no está configurado");

  const request = new Request("https://cuenta-regresiva-presidencial.carlos940807.chatgpt.site/api/noticias-v2?refresh=1", {
    headers: {
      "x-cron-secret": env.CRON_SECRET,
      "user-agent": "CuentaPublica-Cloudflare-Cron/1.0",
    },
  });
  const response = await handler.fetch(request, env, context);
  if (!response.ok) throw new Error(`La actualización horaria respondió ${response.status}`);

  const payload = await response.json() as { updatedAt?: unknown; provider?: unknown; items?: unknown };
  if (typeof payload.updatedAt !== "string" || typeof payload.provider !== "string" || !Array.isArray(payload.items)) {
    throw new Error("La actualización horaria produjo una respuesta incompleta");
  }
  console.log("news-monitor", "Actualización horaria completada", {
    updatedAt: payload.updatedAt,
    provider: payload.provider,
    items: payload.items.length,
  });
}

const worker = {
  fetch(request: Request, env: WorkerEnvironment, context: ExecutionContext) {
    return handler.fetch(request, env, context);
  },
  scheduled(_controller: unknown, env: WorkerEnvironment, context: ExecutionContext) {
    context.waitUntil(runHourlyNewsRefresh(env, context));
  },
};

export default worker;
