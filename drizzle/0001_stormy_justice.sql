CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`event_type` text NOT NULL,
	`event_name` text NOT NULL,
	`page` text NOT NULL,
	`day` text NOT NULL,
	`occurred_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_events_day_type_idx` ON `analytics_events` (`day`,`event_type`);--> statement-breakpoint
CREATE INDEX `analytics_events_page_day_idx` ON `analytics_events` (`page`,`day`);--> statement-breakpoint
CREATE INDEX `analytics_events_session_day_idx` ON `analytics_events` (`session_id`,`day`);--> statement-breakpoint
CREATE TABLE `analytics_sessions` (
	`session_id` text PRIMARY KEY NOT NULL,
	`first_seen_at` text NOT NULL,
	`last_seen_at` text NOT NULL,
	`current_page` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_sessions_last_seen_idx` ON `analytics_sessions` (`last_seen_at`);--> statement-breakpoint
PRAGMA optimize;
