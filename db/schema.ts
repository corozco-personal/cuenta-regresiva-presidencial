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
  createdAt: text("created_at").notNull(),
}, (table) => [
  uniqueIndex("news_submissions_url_hash_unique").on(table.urlHash),
  index("news_submissions_status_created_idx").on(table.status, table.createdAt),
  index("news_submissions_domain_idx").on(table.domain),
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
