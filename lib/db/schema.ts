import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Social Accounts
export const socialAccounts = pgTable(
  "social_accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(), // 'facebook' | 'instagram' | 'threads' | 'x' | 'pinterest' | 'youtube'
    platformAccountId: varchar("platform_account_id", { length: 255 }).notNull(),
    accountName: varchar("account_name", { length: 255 }).notNull(),
    accountUsername: varchar("account_username", { length: 255 }),
    profileImageUrl: text("profile_image_url"),
    accessToken: text("access_token"), // AES-256-GCM encrypted
    refreshToken: text("refresh_token"), // AES-256-GCM encrypted
    tokenExpiresAt: timestamp("token_expires_at"),
    scopes: text("scopes"), // space or comma separated
    isConnected: boolean("is_connected").default(true).notNull(),
    apiStatus: varchar("api_status", { length: 50 }).default("healthy").notNull(), // 'healthy' | 'warning' | 'auth_required' | 'rate_limited' | 'api_error' | 'disconnected'
    apiVersion: varchar("api_version", { length: 50 }),
    lastApiRequestAt: timestamp("last_api_request_at"),
    lastApiError: text("last_api_error"),
    rateLimitRemaining: integer("rate_limit_remaining"),
    rateLimitLimit: integer("rate_limit_limit"),
    rateLimitResetAt: timestamp("rate_limit_reset_at"),
    lastSyncAt: timestamp("last_sync_at"),
    connectedAt: timestamp("connected_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_social_accounts_user_platform").on(table.userId, table.platform),
  ]
);

// 3. Social Pages (e.g. Facebook Pages / Instagram linked pages)
export const socialPages = pgTable(
  "social_pages",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(),
    pageId: varchar("page_id", { length: 255 }).notNull(),
    pageName: varchar("page_name", { length: 255 }).notNull(),
    pageAccessToken: text("page_access_token"), // encrypted
    category: varchar("category", { length: 255 }),
    isSelected: boolean("is_selected").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_social_pages_account").on(table.accountId),
    index("idx_social_pages_selected").on(table.accountId, table.isSelected),
  ]
);

// 4. Media Assets
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 255 }).notNull(),
    url: text("url").notNull(),
    storageKey: varchar("storage_key", { length: 500 }),
    fileSize: integer("file_size").notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    width: integer("width"),
    height: integer("height"),
    format: varchar("format", { length: 50 }),
    expiresAt: timestamp("expires_at"),
    isPurged: boolean("is_purged").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_media_assets_user").on(table.userId)]
);

// 5. Posts (Master Post)
export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    mainCaption: text("main_caption").notNull(),
    mainMediaUrl: text("main_media_url"),
    mainMediaAssetId: text("main_media_asset_id").references(
      () => mediaAssets.id,
      { onDelete: "set null" }
    ),
    status: varchar("status", { length: 50 }).default("draft").notNull(), // 'draft' | 'scheduled' | 'published' | 'partially_published' | 'failed' | 'cancelled'
    scheduledFor: timestamp("scheduled_for"),
    timezone: varchar("timezone", { length: 100 }).default("UTC"),
    scheduleStatus: varchar("schedule_status", { length: 50 }).default("idle"), // 'idle' | 'queued' | 'processing' | 'published' | 'partially_published' | 'failed' | 'cancelled'
    processingStartedAt: timestamp("processing_started_at"),
    publishedAt: timestamp("published_at"),
    cancelledAt: timestamp("cancelled_at"),
    retryCount: integer("retry_count").default(0).notNull(),
    lastError: text("last_error"),
    idempotencyKey: varchar("idempotency_key", { length: 255 }),
    mediaExpiresAt: timestamp("media_expires_at"),
    mediaAutoDeleted: boolean("media_auto_deleted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_posts_user_status").on(table.userId, table.status),
    index("idx_posts_created_at").on(table.createdAt),
    index("idx_posts_scheduled").on(table.status, table.scheduledFor),
  ]
);

// 6. Post Variants (Platform-specific version)
export const postVariants = pgTable(
  "post_variants",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(), // 'facebook' | 'instagram' | 'threads' | 'x' | 'pinterest' | 'youtube'
    caption: text("caption").notNull(),
    mediaUrl: text("media_url"),
    mediaAssetId: text("media_asset_id").references(() => mediaAssets.id, {
      onDelete: "set null",
    }),
    cropSettings: jsonb("crop_settings"), // { x: number, y: number, width: number, height: number, zoom: number, rotation: number, aspect: string }
    aspectRatio: varchar("aspect_ratio", { length: 50 }).default("original"), // 'original' | '1:1' | '4:5' | '16:9' | '1.91:1' | '2:3' | '1:2'
    isEnabled: boolean("is_enabled").default(true).notNull(),
    publishStatus: varchar("publish_status", { length: 50 })
      .default("idle")
      .notNull(), // 'idle' | 'publishing' | 'published' | 'failed'
    publishedAt: timestamp("published_at"),
    externalPostId: varchar("external_post_id", { length: 255 }),
    externalPostUrl: text("external_post_url"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_post_variants_post_platform").on(table.postId, table.platform),
  ]
);

// 7. Publish Attempts
export const publishAttempts = pgTable(
  "publish_attempts",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    variantId: text("variant_id")
      .notNull()
      .references(() => postVariants.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(),
    attemptNumber: integer("attempt_number").default(1).notNull(),
    status: varchar("status", { length: 50 }).notNull(), // 'pending' | 'success' | 'failed'
    requestPayload: text("request_payload"), // sanitized JSON
    responsePayload: text("response_payload"), // sanitized JSON
    httpStatusCode: integer("http_status_code"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("idx_publish_attempts_post").on(table.postId)]
);

// 8. Analytics Snapshots
export const analyticsSnapshots = pgTable(
  "analytics_snapshots",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => socialAccounts.id, { onDelete: "cascade" }),
    platform: varchar("platform", { length: 50 }).notNull(),
    postId: text("post_id").references(() => posts.id, {
      onDelete: "set null",
    }),
    variantId: text("variant_id").references(() => postVariants.id, {
      onDelete: "set null",
    }),
    snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
    impressions: integer("impressions").default(0).notNull(),
    reach: integer("reach").default(0).notNull(),
    likes: integer("likes").default(0).notNull(),
    comments: integer("comments").default(0).notNull(),
    shares: integer("shares").default(0).notNull(),
    saves: integer("saves").default(0).notNull(),
    clicks: integer("clicks").default(0).notNull(),
    rawMetrics: jsonb("raw_metrics"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_analytics_account_platform").on(
      table.accountId,
      table.platform,
      table.snapshotDate
    ),
  ]
);

// 9. OAuth States
export const oauthStates = pgTable(
  "oauth_states",
  {
    id: text("id").primaryKey(),
    state: varchar("state", { length: 255 }).notNull().unique(),
    platform: varchar("platform", { length: 50 }).notNull(),
    userId: text("user_id").notNull(),
    codeVerifier: varchar("code_verifier", { length: 255 }),
    returnUrl: text("return_url"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_oauth_states_state").on(table.state)]
);

// 10. Audit Logs
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    metadata: jsonb("metadata"),
    ipAddress: varchar("ip_address", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_audit_logs_user_action").on(table.userId, table.action)]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(socialAccounts),
  posts: many(posts),
  mediaAssets: many(mediaAssets),
}));

export const socialAccountsRelations = relations(
  socialAccounts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [socialAccounts.userId],
      references: [users.id],
    }),
    pages: many(socialPages),
    analytics: many(analyticsSnapshots),
  })
);

export const socialPagesRelations = relations(socialPages, ({ one }) => ({
  account: one(socialAccounts, {
    fields: [socialPages.accountId],
    references: [socialAccounts.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  mediaAsset: one(mediaAssets, {
    fields: [posts.mainMediaAssetId],
    references: [mediaAssets.id],
  }),
  variants: many(postVariants),
  publishAttempts: many(publishAttempts),
}));

export const postVariantsRelations = relations(
  postVariants,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [postVariants.postId],
      references: [posts.id],
    }),
    mediaAsset: one(mediaAssets, {
      fields: [postVariants.mediaAssetId],
      references: [mediaAssets.id],
    }),
    publishAttempts: many(publishAttempts),
  })
);

export const mediaAssetsRelations = relations(mediaAssets, ({ one, many }) => ({
  user: one(users, {
    fields: [mediaAssets.userId],
    references: [users.id],
  }),
  posts: many(posts),
  variants: many(postVariants),
}));
