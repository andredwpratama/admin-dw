CREATE TABLE `campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`campaign_id` text NOT NULL,
	`campaign_name` text NOT NULL,
	`status` text NOT NULL,
	`objective` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `campaigns_platform_idx` ON `campaigns` (`platform`);--> statement-breakpoint
CREATE UNIQUE INDEX `campaigns_campaign_id_idx` ON `campaigns` (`campaign_id`,`platform`);--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`tool_calls` text,
	`tool_call_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `chat_sessions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `messages_session_idx` ON `chat_messages` (`session_id`);--> statement-breakpoint
CREATE TABLE `chat_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`message_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `csv_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`platform` text NOT NULL,
	`file_name` text NOT NULL,
	`uploaded_at` integer NOT NULL,
	`status` text NOT NULL,
	`rows_processed` integer,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` text PRIMARY KEY NOT NULL,
	`generated_at` integer NOT NULL,
	`trigger` text NOT NULL,
	`status` text NOT NULL,
	`date_range_start` text NOT NULL,
	`date_range_end` text NOT NULL,
	`summary` text,
	`findings` text,
	`recommendations` text,
	`raw_response` text,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`date` text NOT NULL,
	`impressions` integer DEFAULT 0 NOT NULL,
	`clicks` integer DEFAULT 0 NOT NULL,
	`spend` real DEFAULT 0 NOT NULL,
	`conversions` integer DEFAULT 0 NOT NULL,
	`revenue` real,
	`ctr` real DEFAULT 0 NOT NULL,
	`cpc` real DEFAULT 0 NOT NULL,
	`cpa` real DEFAULT 0 NOT NULL,
	`roas` real,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metrics_campaign_date_idx` ON `metrics` (`campaign_id`,`date`);--> statement-breakpoint
CREATE INDEX `metrics_date_idx` ON `metrics` (`date`);