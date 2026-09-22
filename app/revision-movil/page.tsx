import type { Metadata } from "next";
import MobileEmailReview from "../components/mobile-email-review";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Revisión segura · Cuenta pública", robots: { index: false, follow: false, nocache: true }, referrer: "no-referrer" };

export default function MobileReviewPage() { return <MobileEmailReview />; }
