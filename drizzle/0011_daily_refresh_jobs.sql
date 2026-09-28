ALTER TABLE `newsletter_subscriptions` ADD `interests_json` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
CREATE TABLE `data_refresh_runs` (
	`key` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`cadence` text NOT NULL,
	`status` text NOT NULL,
	`last_started_at` text NOT NULL,
	`last_completed_at` text,
	`last_success_at` text,
	`record_count` integer,
	`error` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `data_refresh_runs_status_idx` ON `data_refresh_runs` (`status`,`last_completed_at`);
