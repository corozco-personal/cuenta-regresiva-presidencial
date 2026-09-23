CREATE TABLE `submission_audit_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`item_type` text NOT NULL,
	`item_id` text NOT NULL,
	`network_hash` text NOT NULL,
	`browser` text NOT NULL,
	`operating_system` text NOT NULL,
	`device_class` text NOT NULL,
	`country_code` text,
	`edge_location` text,
	`language` text,
	`contact_ciphertext` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `submission_audit_item_unique` ON `submission_audit_profiles` (`item_type`,`item_id`);--> statement-breakpoint
CREATE INDEX `submission_audit_network_created_idx` ON `submission_audit_profiles` (`network_hash`,`created_at`);--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_message_id` text;--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_delivery_status` text DEFAULT 'not_sent' NOT NULL;--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_last_error` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_message_id` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_delivery_status` text DEFAULT 'not_sent' NOT NULL;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_last_error` text;