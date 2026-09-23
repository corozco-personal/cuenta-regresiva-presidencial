CREATE TABLE `moderation_backups` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_json` text NOT NULL,
	`item_count` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `moderation_backups_created_idx` ON `moderation_backups` (`created_at`);--> statement-breakpoint
CREATE TABLE `security_operations` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
