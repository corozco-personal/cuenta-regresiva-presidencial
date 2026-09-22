ALTER TABLE `news_submissions` ADD `email_review_token_hash` text;--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_review_expires_at` text;--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_notified_at` text;--> statement-breakpoint
ALTER TABLE `news_submissions` ADD `email_reviewed_at` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_review_token_hash` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_review_expires_at` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_notified_at` text;--> statement-breakpoint
ALTER TABLE `opinions` ADD `email_reviewed_at` text;