CREATE TABLE `datasets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`file_name` text NOT NULL,
	`columns` text NOT NULL,
	`row_count` integer DEFAULT 0 NOT NULL,
	`nulls_cleaned` integer DEFAULT 0 NOT NULL,
	`uploaded_at` integer NOT NULL,
	`status` text NOT NULL,
	`error_message` text
);
--> statement-breakpoint
CREATE TABLE `generic_data` (
	`id` text PRIMARY KEY NOT NULL,
	`dataset_id` text NOT NULL,
	`row_index` integer NOT NULL,
	`data` text NOT NULL,
	FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `generic_data_dataset_idx` ON `generic_data` (`dataset_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `generic_data_dataset_row_idx` ON `generic_data` (`dataset_id`,`row_index`);