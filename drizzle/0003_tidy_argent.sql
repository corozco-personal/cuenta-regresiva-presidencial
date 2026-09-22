CREATE TABLE `edge_rate_limits` (
	`bucket_key` text PRIMARY KEY NOT NULL,
	`scope` text NOT NULL,
	`window_started_at` integer NOT NULL,
	`request_count` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `edge_rate_limits_updated_idx` ON `edge_rate_limits` (`updated_at`);