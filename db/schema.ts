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
