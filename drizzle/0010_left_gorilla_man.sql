CREATE TABLE `newsletter_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`email_hash` text NOT NULL,
	`email_ciphertext` text NOT NULL,
	`preferred_hour` integer NOT NULL,
	`timezone` text DEFAULT 'America/Bogota' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`confirmation_token_hash` text,
	`unsubscribe_token_hash` text NOT NULL,
	`unsubscribe_token_ciphertext` text NOT NULL,
	`verified_at` text,
	`unsubscribed_at` text,
	`last_sent_local_date` text,
	`last_message_id` text,
	`delivery_status` text DEFAULT 'not_sent' NOT NULL,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscriptions_email_hash_unique` ON `newsletter_subscriptions` (`email_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscriptions_unsubscribe_token_unique` ON `newsletter_subscriptions` (`unsubscribe_token_hash`);--> statement-breakpoint
CREATE INDEX `newsletter_subscriptions_schedule_idx` ON `newsletter_subscriptions` (`status`,`preferred_hour`,`last_sent_local_date`);--> statement-breakpoint
CREATE INDEX `newsletter_subscriptions_message_idx` ON `newsletter_subscriptions` (`last_message_id`);