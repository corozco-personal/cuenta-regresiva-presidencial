import { turnstileConfiguration } from "../../data/edge-security";

export async function GET() {
  const configuration = turnstileConfiguration();
  return Response.json(configuration, { headers: { "Cache-Control": "private, no-store, max-age=0" } });
}
