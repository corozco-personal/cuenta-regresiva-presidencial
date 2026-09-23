const RESERVED_V4 = [
  /^0\./, /^10\./, /^127\./, /^169\.254\./, /^192\.168\./,
  /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
  /^172\.(?:1[6-9]|2\d|3[01])\./, /^198\.(?:18|19)\./,
  /^192\.0\.0\./, /^192\.0\.2\./, /^198\.51\.100\./, /^203\.0\.113\./,
  /^(?:22[4-9]|23\d|24\d|25[0-5])\./,
];

function isReservedAddress(value: string) {
  const address = value.toLowerCase().replace(/^\[|\]$/g, "");
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(address)) return RESERVED_V4.some((pattern) => pattern.test(address));
  if (!address.includes(":")) return false;
  if (["::", "::1"].includes(address) || address.startsWith("fc") || address.startsWith("fd")) return true;
  if (/^fe[89ab]/.test(address) || address.startsWith("ff")) return true;
  const mapped = address.match(/::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/)?.[1];
  return mapped ? isReservedAddress(mapped) : false;
}

async function resolve(hostname: string, type: "A" | "AAAA") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const endpoint = new URL("https://cloudflare-dns.com/dns-query");
    endpoint.searchParams.set("name", hostname);
    endpoint.searchParams.set("type", type);
    const response = await fetch(endpoint, { headers: { accept: "application/dns-json" }, signal: controller.signal });
    if (!response.ok) return [];
    const data = await response.json() as { Answer?: Array<{ type?: number; data?: string }> };
    const expected = type === "A" ? 1 : 28;
    return (data.Answer ?? []).filter((answer) => answer.type === expected).map((answer) => String(answer.data ?? ""));
  } finally { clearTimeout(timeout); }
}

export async function assertPublicHostname(hostname: string) {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (!host || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || isReservedAddress(host)) throw new Error("unsafe");
  const addresses = [...await resolve(host, "A"), ...await resolve(host, "AAAA")];
  if (!addresses.length) throw new Error("dns-unavailable");
  if (addresses.some(isReservedAddress)) throw new Error("unsafe");
  return addresses;
}

export async function readHtmlWithin(response: Response, maxBytes = 300_000) {
  if (!(response.headers.get("content-type") ?? "").toLowerCase().includes("text/html")) return "";
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (size < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      const remaining = maxBytes - size;
      const chunk = value.length > remaining ? value.slice(0, remaining) : value;
      chunks.push(chunk); size += chunk.length;
      if (value.length > remaining) break;
    }
  } finally { await reader.cancel().catch(() => undefined); }
  const merged = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { merged.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}
