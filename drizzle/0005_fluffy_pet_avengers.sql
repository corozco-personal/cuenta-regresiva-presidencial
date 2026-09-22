CREATE TABLE `moderation_actions` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`from_status` text NOT NULL,
	`to_status` text NOT NULL,
	`reason` text NOT NULL,
	`reviewer` text DEFAULT 'automatic-policy' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moderation_actions_item_idx` ON `moderation_actions` (`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `moderation_actions_created_idx` ON `moderation_actions` (`created_at`);--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` text PRIMARY KEY NOT NULL,
	`endpoint` text NOT NULL,
	`category` text NOT NULL,
	`severity` text NOT NULL,
	`reason` text NOT NULL,
	`fingerprint_hash` text NOT NULL,
	`payload_digest` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `security_events_created_idx` ON `security_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `security_events_category_created_idx` ON `security_events` (`category`,`created_at`);--> statement-breakpoint
CREATE INDEX `security_events_endpoint_created_idx` ON `security_events` (`endpoint`,`created_at`);