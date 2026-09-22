import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
  status: text("status").notNull(),
  reliability: text("reliability").notNull(),
  reason: text("reason").notNull(),
  visitorHash: text("visitor_hash"),
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
