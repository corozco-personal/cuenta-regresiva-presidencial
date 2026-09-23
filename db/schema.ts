import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const opinions = sqliteTable("opinions", {
  id: text("id").primaryKey(),
  contentHash: text("content_hash").notNull(),
  displayName: text("display_name"),
  isAnonymous: text("is_anonymous").notNull().default("1"),
  country: text("country").notNull(),
  department: text("department"),
  municipality: text("municipality"),
  stance: text("stance").notNull(),
  comment: text("comment").notNull(),
  status: text("status").notNull(),
  moderationReason: text("moderation_reason"),
  visitorHash: text("visitor_hash"),
  emailReviewTokenHash: text("email_review_token_hash"),
  emailReviewExpiresAt: text("email_review_expires_at"),
  emailNotifiedAt: text("email_notified_at"),
  emailReviewedAt: text("email_reviewed_at"),
  emailMessageId: text("email_message_id"),
  emailDeliveryStatus: text("email_delivery_status").notNull().default("not_sent"),
  emailLastError: text("email_last_error"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("opinions_content_hash_unique").on(table.contentHash),
  index("opinions_status_created_idx").on(table.status, table.createdAt),
  index("opinions_visitor_created_idx").on(table.visitorHash, table.createdAt),
]);

export const newsSubmissions = sqliteTable("news_submissions", {
  id: text("id").primaryKey(),
  urlHash: text("url_hash").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  title: text("title"),
  submitterName: text("submitter_name"),
  isAnonymous: text("is_anonymous").notNull().default("1"),
  country: text("country").notNull(),
  department: text("department"),
  municipality: text("municipality"),
  status: text("status").notNull(),
  reliability: text("reliability").notNull(),
  reason: text("reason").notNull(),
  visitorHash: text("visitor_hash"),
  emailReviewTokenHash: text("email_review_token_hash"),
  emailReviewExpiresAt: text("email_review_expires_at"),
  emailNotifiedAt: text("email_notified_at"),
  emailReviewedAt: text("email_reviewed_at"),
  emailMessageId: text("email_message_id"),
  emailDeliveryStatus: text("email_delivery_status").notNull().default("not_sent"),
  emailLastError: text("email_last_error"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("news_submissions_url_hash_unique").on(table.urlHash),
  index("news_submissions_status_created_idx").on(table.status, table.createdAt),
  index("news_submissions_domain_idx").on(table.domain),
  index("news_submissions_visitor_created_idx").on(table.visitorHash, table.createdAt),
]);

export const newsArticles = sqliteTable("news_articles", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  source: text("source").notNull(),
  url: text("url").notNull(),
  publishedAt: text("published_at").notNull(),
  scope: text("scope").notNull(),
  kind: text("kind").notNull(),
  category: text("category").notNull(),
  stage: text("stage").notNull(),
  decision: text("decision").notNull(),
  decisionReason: text("decision_reason").notNull(),
  evidenceLevel: text("evidence_level").notNull(),
  processStatus: text("process_status").notNull(),
  sourcesJson: text("sources_json").notNull(),
  country: text("country"),
  language: text("language"),
  linkStatus: text("link_status"),
  finalUrl: text("final_url"),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
}, (table) => [
  uniqueIndex("news_articles_url_unique").on(table.url),
  index("news_articles_published_idx").on(table.publishedAt),
  index("news_articles_category_idx").on(table.category, table.publishedAt),
  index("news_articles_scope_idx").on(table.scope, table.publishedAt),
]);

export const monitorRuns = sqliteTable("monitor_runs", {
  id: text("id").primaryKey(),
  startedAt: text("started_at").notNull(),
  completedAt: text("completed_at").notNull(),
  providers: text("providers").notNull(),
  discoveredCount: text("discovered_count").notNull(),
  publishedCount: text("published_count").notNull(),
  rejectedCount: text("rejected_count").notNull(),
  countries: text("countries").notNull(),
  languages: text("languages").notNull(),
  status: text("status").notNull(),
  errorSummary: text("error_summary"),
}, (table) => [index("monitor_runs_completed_idx").on(table.completedAt)]);

export const correctionRequests = sqliteTable("correction_requests", {
  id: text("id").primaryKey(),
  requestType: text("request_type").notNull(),
  subject: text("subject").notNull(),
  relatedUrl: text("related_url").notNull(),
  explanation: text("explanation").notNull(),
  evidenceUrl: text("evidence_url"),
  displayName: text("display_name"),
  contactHash: text("contact_hash"),
  visitorHash: text("visitor_hash").notNull(),
  status: text("status").notNull(),
  classification: text("classification").notNull(),
  publicSummary: text("public_summary").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("correction_requests_status_created_idx").on(table.status, table.createdAt),
  index("correction_requests_visitor_created_idx").on(table.visitorHash, table.createdAt),
]);

export const analyticsSessions = sqliteTable("analytics_sessions", {
  sessionId: text("session_id").primaryKey(),
  firstSeenAt: text("first_seen_at").notNull(),
  lastSeenAt: text("last_seen_at").notNull(),
  currentPage: text("current_page").notNull(),
}, (table) => [
  index("analytics_sessions_last_seen_idx").on(table.lastSeenAt),
]);

export const analyticsEvents = sqliteTable("analytics_events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(),
  eventName: text("event_name").notNull(),
  page: text("page").notNull(),
  day: text("day").notNull(),
  occurredAt: text("occurred_at").notNull(),
}, (table) => [
  index("analytics_events_day_type_idx").on(table.day, table.eventType),
  index("analytics_events_page_day_idx").on(table.page, table.day),
  index("analytics_events_session_day_idx").on(table.sessionId, table.day),
]);

export const edgeRateLimits = sqliteTable("edge_rate_limits", {
  bucketKey: text("bucket_key").primaryKey(),
  scope: text("scope").notNull(),
  windowStartedAt: integer("window_started_at").notNull(),
  requestCount: integer("request_count").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, (table) => [
  index("edge_rate_limits_updated_idx").on(table.updatedAt),
]);

export const moderationActions = sqliteTable("moderation_actions", {
  id: text("id").primaryKey(),
  itemType: text("item_type").notNull(),
  itemId: text("item_id").notNull(),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  reason: text("reason").notNull(),
  reviewer: text("reviewer").notNull().default("automatic-policy"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("moderation_actions_item_idx").on(table.itemType, table.itemId),
  index("moderation_actions_created_idx").on(table.createdAt),
]);

export const securityEvents = sqliteTable("security_events", {
  id: text("id").primaryKey(),
  requestReference: text("request_reference"),
  endpoint: text("endpoint").notNull(),
  category: text("category").notNull(),
  severity: text("severity").notNull(),
  reason: text("reason").notNull(),
  fingerprintHash: text("fingerprint_hash").notNull(),
  payloadDigest: text("payload_digest"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  index("security_events_created_idx").on(table.createdAt),
  index("security_events_category_created_idx").on(table.category, table.createdAt),
  index("security_events_endpoint_created_idx").on(table.endpoint, table.createdAt),
]);

export const submissionAuditProfiles = sqliteTable("submission_audit_profiles", {
  id: text("id").primaryKey(),
  itemType: text("item_type").notNull(),
  itemId: text("item_id").notNull(),
  networkHash: text("network_hash").notNull(),
  browser: text("browser").notNull(),
  operatingSystem: text("operating_system").notNull(),
  deviceClass: text("device_class").notNull(),
  countryCode: text("country_code"),
  edgeLocation: text("edge_location"),
  language: text("language"),
  contactCiphertext: text("contact_ciphertext"),
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("submission_audit_item_unique").on(table.itemType, table.itemId),
  index("submission_audit_network_created_idx").on(table.networkHash, table.createdAt),
]);

export const moderationBackups = sqliteTable("moderation_backups", {
  id: text("id").primaryKey(),
  snapshotJson: text("snapshot_json").notNull(),
  itemCount: integer("item_count").notNull(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("moderation_backups_created_idx").on(table.createdAt)]);

export const securityOperations = sqliteTable("security_operations", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});
