CREATE TABLE "campaigns" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"campaign_id" text NOT NULL,
	"campaign_name" text NOT NULL,
	"status" text NOT NULL,
	"objective" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"tool_calls" text,
	"tool_call_id" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "csv_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"file_name" text NOT NULL,
	"uploaded_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"rows_processed" integer,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "datasets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"file_name" text NOT NULL,
	"columns" text NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"nulls_cleaned" integer DEFAULT 0 NOT NULL,
	"uploaded_at" timestamp NOT NULL,
	"status" text NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "generic_data" (
	"id" text PRIMARY KEY NOT NULL,
	"dataset_id" text NOT NULL,
	"row_index" integer NOT NULL,
	"data" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" text PRIMARY KEY NOT NULL,
	"generated_at" timestamp NOT NULL,
	"trigger" text NOT NULL,
	"status" text NOT NULL,
	"date_range_start" text NOT NULL,
	"date_range_end" text NOT NULL,
	"summary" text,
	"findings" text,
	"recommendations" text,
	"raw_response" text,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" text PRIMARY KEY NOT NULL,
	"campaign_id" text NOT NULL,
	"date" text NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"spend" double precision DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"revenue" double precision,
	"ctr" double precision DEFAULT 0 NOT NULL,
	"cpc" double precision DEFAULT 0 NOT NULL,
	"cpa" double precision DEFAULT 0 NOT NULL,
	"roas" double precision
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"email_notifications" boolean DEFAULT true NOT NULL,
	"push_notifications" boolean DEFAULT true NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"currency" text DEFAULT 'IDR' NOT NULL,
	"language" text DEFAULT 'id' NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generic_data" ADD CONSTRAINT "generic_data_dataset_id_datasets_id_fk" FOREIGN KEY ("dataset_id") REFERENCES "public"."datasets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaigns_platform_idx" ON "campaigns" USING btree ("platform");--> statement-breakpoint
CREATE UNIQUE INDEX "campaigns_campaign_id_idx" ON "campaigns" USING btree ("campaign_id","platform");--> statement-breakpoint
CREATE INDEX "messages_session_idx" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "generic_data_dataset_idx" ON "generic_data" USING btree ("dataset_id");--> statement-breakpoint
CREATE UNIQUE INDEX "generic_data_dataset_row_idx" ON "generic_data" USING btree ("dataset_id","row_index");--> statement-breakpoint
CREATE UNIQUE INDEX "metrics_campaign_date_idx" ON "metrics" USING btree ("campaign_id","date");--> statement-breakpoint
CREATE INDEX "metrics_date_idx" ON "metrics" USING btree ("date");