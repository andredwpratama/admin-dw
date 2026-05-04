import { pgTable, text, integer, doublePrecision, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

// Campaigns Table
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  platform: text("platform").notNull(),         // 'meta' | 'google' | 'linkedin' | 'tiktok'
  campaignId: text("campaign_id").notNull(),    // ID from platform origin
  campaignName: text("campaign_name").notNull(),
  status: text("status").notNull(),             // 'active' | 'paused' | 'ended'
  objective: text("objective"),
  createdAt: timestamp("created_at").notNull().$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").notNull().$defaultFn(() => new Date()),
}, (table) => ({
  platformIdx: index("campaigns_platform_idx").on(table.platform),
  campaignIdIdx: uniqueIndex("campaigns_campaign_id_idx").on(table.campaignId, table.platform),
}));

// Metrics Table
export const metrics = pgTable("metrics", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  campaignId: text("campaign_id").notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  date: text("date").notNull(),                // "YYYY-MM-DD"
  impressions: integer("impressions").notNull().default(0),
  clicks: integer("clicks").notNull().default(0),
  spend: doublePrecision("spend").notNull().default(0),   // IDR
  conversions: integer("conversions").notNull().default(0),
  revenue: doublePrecision("revenue"),                    // IDR, optional
  // computed fields for query performance
  ctr: doublePrecision("ctr").notNull().default(0),       // clicks / impressions * 100
  cpc: doublePrecision("cpc").notNull().default(0),       // spend / clicks
  cpa: doublePrecision("cpa").notNull().default(0),       // spend / conversions
  roas: doublePrecision("roas"),                          // revenue / spend
}, (table) => ({
  campaignDateIdx: uniqueIndex("metrics_campaign_date_idx").on(table.campaignId, table.date),
  dateIdx: index("metrics_date_idx").on(table.date),
}));

// Insights Table
export const insights = pgTable("insights", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  generatedAt: timestamp("generated_at").notNull().$defaultFn(() => new Date()),
  trigger: text("trigger").notNull(),          // 'manual' | 'scheduled'
  status: text("status").notNull(),            // 'pending' | 'running' | 'completed' | 'failed'
  dateRangeStart: text("date_range_start").notNull(),
  dateRangeEnd: text("date_range_end").notNull(),
  summary: text("summary"),
  findings: text("findings"),                  // JSON string: Finding[]
  recommendations: text("recommendations"),    // JSON string: Recommendation[]
  rawResponse: text("raw_response"),
  errorMessage: text("error_message"),
});

// Chat Sessions Table
export const chatSessions = pgTable("chat_sessions", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").notNull().$defaultFn(() => new Date()),
  messageCount: integer("message_count").notNull().default(0),
});

// Chat Messages Table
export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  sessionId: text("session_id").notNull().references(() => chatSessions.id, { onDelete: 'cascade' }),
  role: text("role").notNull(),                // 'user' | 'assistant' | 'tool'
  content: text("content").notNull(),
  toolCalls: text("tool_calls"),               // JSON: tool calls from model
  toolCallId: text("tool_call_id"),            // for tool result messages
  createdAt: timestamp("created_at").notNull().$defaultFn(() => new Date()),
}, (table) => ({
  sessionIdx: index("messages_session_idx").on(table.sessionId),
}));

// CSV Uploads Table
export const csvUploads = pgTable("csv_uploads", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  platform: text("platform").notNull(),
  fileName: text("file_name").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().$defaultFn(() => new Date()),
  status: text("status").notNull(),            // 'processing' | 'completed' | 'failed'
  rowsProcessed: integer("rows_processed"),
  errorMessage: text("error_message"),
});

// Datasets Table (universal CSV uploads)
export const datasets = pgTable("datasets", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  fileName: text("file_name").notNull(),
  columns: text("columns").notNull(),              // JSON: string[] of column names
  rowCount: integer("row_count").notNull().default(0),
  nullsCleaned: integer("nulls_cleaned").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().$defaultFn(() => new Date()),
  status: text("status").notNull(),                // 'processing' | 'completed' | 'failed'
  errorMessage: text("error_message"),
});

// Generic Data Table (rows from universal uploads)
export const genericData = pgTable("generic_data", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  datasetId: text("dataset_id").notNull().references(() => datasets.id, { onDelete: 'cascade' }),
  rowIndex: integer("row_index").notNull(),
  data: text("data").notNull(),                    // JSON: { [columnName]: value }
}, (table) => ({
  datasetIdx: index("generic_data_dataset_idx").on(table.datasetId),
  datasetRowIdx: uniqueIndex("generic_data_dataset_row_idx").on(table.datasetId, table.rowIndex),
}));

// Notifications Table
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().$defaultFn(() => new Date()),
});

// User Settings Table
export const userSettings = pgTable("user_settings", {
  id: text("id").primaryKey(), // Using 'default' for now
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  theme: text("theme").notNull().default("light"),
  currency: text("currency").notNull().default("IDR"),
  language: text("language").notNull().default("id"),
  updatedAt: timestamp("updated_at").notNull().$defaultFn(() => new Date()),
});
