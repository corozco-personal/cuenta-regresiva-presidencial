CREATE TABLE `correction_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`request_type` text NOT NULL,
	`subject` text NOT NULL,
	`related_url` text NOT NULL,
	`explanation` text NOT NULL,
	`evidence_url` text,
	`display_name` text,
	`contact_hash` text,
	`visitor_hash` text NOT NULL,
	`status` text NOT NULL,
	`classification` text NOT NULL,
	`public_summary` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `correction_requests_status_created_idx` ON `correction_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `correction_requests_visitor_created_idx` ON `correction_requests` (`visitor_hash`,`created_at`);--> statement-breakpoint
CREATE TABLE `monitor_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`started_at` text NOT NULL,
	`completed_at` text NOT NULL,
	`providers` text NOT NULL,
	`discovered_count` text NOT NULL,
	`published_count` text NOT NULL,
	`rejected_count` text NOT NULL,
	`countries` text NOT NULL,
	`languages` text NOT NULL,
	`status` text NOT NULL,
	`error_summary` text
);
--> statement-breakpoint
CREATE INDEX `monitor_runs_completed_idx` ON `monitor_runs` (`completed_at`);--> statement-breakpoint
CREATE TABLE `news_articles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`source` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text NOT NULL,
	`scope` text NOT NULL,
	`kind` text NOT NULL,
	`category` text NOT NULL,
	`stage` text NOT NULL,
	`decision` text NOT NULL,
	`decision_reason` text NOT NULL,
	`evidence_level` text NOT NULL,
	`process_status` text NOT NULL,
	`sources_json` text NOT NULL,
	`country` text,
	`language` text,
	`link_status` text,
	`final_url` text,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_articles_url_unique` ON `news_articles` (`url`);--> statement-breakpoint
CREATE INDEX `news_articles_published_idx` ON `news_articles` (`published_at`);--> statement-breakpoint
CREATE INDEX `news_articles_category_idx` ON `news_articles` (`category`,`published_at`);--> statement-breakpoint
CREATE INDEX `news_articles_scope_idx` ON `news_articles` (`scope`,`published_at`);--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `visitor_hash` text;--> statement-breakpoint
CREATE INDEX `news_submissions_visitor_created_idx` ON `news_submissions` (`visitor_hash`,`created_at`);