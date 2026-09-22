import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../chatgpt-auth";

export async function getAuthorizedReviewer() {
  const user = await getChatGPTUser();
  const allowedEmail = env.REVIEWER_EMAIL?.trim().toLowerCase();
  if (!user || !allowedEmail || user.email.trim().toLowerCase() !== allowedEmail) return null;
  return user;
}
