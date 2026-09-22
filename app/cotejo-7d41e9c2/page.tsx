import type { Metadata } from "next";
import { env } from "cloudflare:workers";
import { notFound } from "next/navigation";
import { requireChatGPTUser } from "../chatgpt-auth";
import ReviewDashboard from "../components/review-dashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Centro de cotejo", robots: { index: false, follow: false, nocache: true } };
const RETURN_TO = "/cotejo-7d41e9c2";

export default async function ReviewPage() {
  const user = await requireChatGPTUser(RETURN_TO);
  const allowedEmail = env.REVIEWER_EMAIL?.trim().toLowerCase();
  if (!allowedEmail || user.email.trim().toLowerCase() !== allowedEmail) notFound();
  return <ReviewDashboard reviewerName={user.displayName} />;
}
