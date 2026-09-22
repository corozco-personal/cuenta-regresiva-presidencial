declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    RATE_LIMIT_SALT?: string;
    TURNSTILE_SITE_KEY?: string;
    TURNSTILE_SECRET_KEY?: string;
    REVIEWER_EMAIL?: string;
    RESEND_API_KEY?: string;
    REVIEW_NOTIFICATION_EMAIL?: string;
    REVIEW_FROM_EMAIL?: string;
  }
}
