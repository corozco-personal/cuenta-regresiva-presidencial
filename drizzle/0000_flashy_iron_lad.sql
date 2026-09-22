CREATE TABLE `news_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`url_hash` text NOT NULL,
	`url` text NOT NULL,
	`domain` text NOT NULL,
	`title` text,
	`submitter_name` text,
	`is_anonymous` text DEFAULT '1' NOT NULL,
	`country` text NOT NULL,
	`status` text NOT NULL,
	`reliability` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `news_submissions_url_hash_unique` ON `news_submissions` (`url_hash`);--> statement-breakpoint
CREATE INDEX `news_submissions_status_created_idx` ON `news_submissions` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `news_submissions_domain_idx` ON `news_submissions` (`domain`);--> statement-breakpoint
CREATE TABLE `opinions` (
	`id` text PRIMARY KEY NOT NULL,
	`content_hash` text NOT NULL,
	`display_name` text,
	`is_anonymous` text DEFAULT '1' NOT NULL,
	`country` text NOT NULL,
	`department` text,
	`municipality` text,
	`stance` text NOT NULL,
	`comment` text NOT NULL,
	`status` text NOT NULL,
	`moderation_reason` text,
	`visitor_hash` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opinions_content_hash_unique` ON `opinions` (`content_hash`);--> statement-breakpoint
CREATE INDEX `opinions_status_created_idx` ON `opinions` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `opinions_visitor_created_idx` ON `opinions` (`visitor_hash`,`created_at`);