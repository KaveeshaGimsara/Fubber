import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import {
  initialUser,
  initialAccounts,
  initialPages,
  initialMediaAssets,
  initialPosts,
  initialAnalyticsSnapshots,
} from "./mock-data";
import {
  PostWithVariants,
  SocialAccount,
  SocialPage,
  MediaAsset,
  AnalyticsSnapshot,
  User,
} from "./types";

// Check if a real Neon PostgreSQL connection string is provided
const connectionString = process.env.DATABASE_URL;

export const isLiveDb = Boolean(
  connectionString &&
    (connectionString.startsWith("postgres://") ||
      connectionString.startsWith("postgresql://"))
);

const sql = isLiveDb ? neon(connectionString!) : null;
export const db = isLiveDb ? drizzle(sql!, { schema }) : null;

/**
 * In-Memory fallback store that persists across API calls during the server lifecycle
 * or when DATABASE_URL is not yet connected. This guarantees that SocialHub runs
 * out-of-the-box locally and on preview deployments.
 */
class InMemoryDatabase {
  private user: User = { ...initialUser };
  private accounts: SocialAccount[] = [...initialAccounts];
  private pages: SocialPage[] = [...initialPages];
  private media: MediaAsset[] = [...initialMediaAssets];
  private posts: PostWithVariants[] = JSON.parse(JSON.stringify(initialPosts));
  private analytics: AnalyticsSnapshot[] = [...initialAnalyticsSnapshots];

  // User
  getUser() {
    return this.user;
  }
  updateUser(data: Partial<User>) {
    this.user = { ...this.user, ...data, updatedAt: new Date() };
    return this.user;
  }

  // Social Accounts
  getAccounts() {
    return this.accounts;
  }
  getAccount(id: string) {
    return this.accounts.find((a) => a.id === id);
  }
  getAccountByPlatform(platform: string) {
    return this.accounts.find((a) => a.platform === platform && a.isConnected);
  }
  updateAccount(id: string, data: Partial<SocialAccount>) {
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.accounts[idx] = { ...this.accounts[idx], ...data, updatedAt: new Date() };
      return this.accounts[idx];
    }
    return null;
  }
  disconnectAccount(platform: string) {
    const acc = this.accounts.find((a) => a.platform === platform);
    if (acc) {
      acc.isConnected = false;
      acc.accessToken = null;
      acc.refreshToken = null;
      acc.updatedAt = new Date();
    }
    return acc;
  }
  connectAccount(platform: string, accountName: string, username: string, avatarUrl?: string) {
    let acc = this.accounts.find((a) => a.platform === platform);
    if (acc) {
      acc.isConnected = true;
      acc.accountName = accountName;
      acc.accountUsername = username;
      if (avatarUrl) acc.profileImageUrl = avatarUrl;
      acc.connectedAt = new Date();
      acc.apiStatus = "healthy";
      acc.lastApiRequestAt = new Date();
      acc.lastSyncAt = new Date();
      acc.updatedAt = new Date();
    } else {
      acc = {
        id: `acc_${platform}_${Date.now()}`,
        userId: this.user.id,
        platform,
        platformAccountId: `${platform}_${Date.now()}`,
        accountName,
        accountUsername: username,
        profileImageUrl: avatarUrl || `https://avatar.vercel.sh/${platform}`,
        accessToken: `enc_${platform}_token`,
        refreshToken: null,
        tokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        scopes: "standard",
        isConnected: true,
        apiStatus: "healthy",
        apiVersion:
          platform === "facebook" || platform === "instagram"
            ? "Graph API v20.0"
            : platform === "x"
            ? "API v2"
            : platform === "linkedin"
            ? "REST API v202401"
            : platform === "pinterest"
            ? "v5"
            : platform === "threads"
            ? "Threads API v1"
            : "Data API v3",
        lastApiRequestAt: new Date(),
        lastApiError: null,
        rateLimitRemaining: null,
        rateLimitLimit: null,
        rateLimitResetAt: null,
        lastSyncAt: new Date(),
        connectedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.accounts.push(acc);
    }
    return acc;
  }

  // Facebook Pages
  getPages(accountId?: string) {
    if (accountId) return this.pages.filter((p) => p.accountId === accountId);
    return this.pages;
  }
  addPage(page: SocialPage) {
    const existing = this.pages.find((p) => p.pageId === page.pageId);
    if (existing) {
      Object.assign(existing, page);
      return existing;
    }
    this.pages.push(page);
    return page;
  }
  selectPage(pageId: string) {
    this.pages.forEach((p) => {
      p.isSelected = p.pageId === pageId;
    });
    return this.pages.find((p) => p.pageId === pageId);
  }

  // Media
  getMedia() {
    return [...this.media].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  getMediaById(id: string) {
    return this.media.find((m) => m.id === id);
  }
  addMedia(asset: MediaAsset) {
    this.media.unshift(asset);
    return asset;
  }
  deleteMedia(id: string) {
    this.media = this.media.filter((m) => m.id !== id);
    return true;
  }

  // Posts
  getPosts() {
    return [...this.posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  getPost(id: string) {
    return this.posts.find((p) => p.id === id);
  }
  createPost(post: PostWithVariants) {
    this.posts.unshift(post);
    return post;
  }
  updatePost(id: string, updates: Partial<PostWithVariants>) {
    const idx = this.posts.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.posts[idx] = {
        ...this.posts[idx],
        ...updates,
        updatedAt: new Date(),
      };
      return this.posts[idx];
    }
    return null;
  }
  deletePost(id: string) {
    this.posts = this.posts.filter((p) => p.id !== id);
    return true;
  }

  // Scheduling & Serverless Execution
  getScheduledPosts() {
    return this.posts
      .filter((p) => p.status === "scheduled")
      .sort((a, b) => {
        const timeA = a.scheduledFor ? new Date(a.scheduledFor).getTime() : 0;
        const timeB = b.scheduledFor ? new Date(b.scheduledFor).getTime() : 0;
        return timeA - timeB;
      });
  }

  getDueScheduledPosts() {
    const now = new Date();
    return this.posts.filter(
      (p) => p.status === "scheduled" && p.scheduledFor && new Date(p.scheduledFor) <= now
    );
  }

  /**
   * Atomically claims due scheduled posts to guarantee idempotency.
   * Prevents duplicate execution if multiple Vercel cron instances trigger concurrently.
   */
  claimDueScheduledPosts(): PostWithVariants[] {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const claimed: PostWithVariants[] = [];

    this.posts.forEach((p) => {
      if (
        p.status === "scheduled" &&
        p.scheduledFor &&
        new Date(p.scheduledFor) <= now
      ) {
        // Only claim if not currently processing, or if processing stalled (>10 minutes)
        const isStalled =
          p.scheduleStatus === "processing" &&
          p.processingStartedAt &&
          new Date(p.processingStartedAt) < tenMinutesAgo;

        if (p.scheduleStatus !== "processing" || isStalled) {
          p.scheduleStatus = "processing";
          p.processingStartedAt = now;
          claimed.push(p);
        }
      }
    });

    return claimed;
  }

  cancelScheduledPost(id: string): PostWithVariants | null {
    const post = this.posts.find((p) => p.id === id);
    if (!post) return null;

    post.status = "cancelled";
    post.scheduleStatus = "cancelled";
    post.cancelledAt = new Date();
    post.updatedAt = new Date();
    return post;
  }

  duplicatePost(id: string): PostWithVariants | null {
    const orig = this.posts.find((p) => p.id === id);
    if (!orig) return null;

    const newId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const copy: PostWithVariants = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newId,
      title: orig.title ? `Copy of ${orig.title}` : "Copy of Scheduled Post",
      status: "draft",
      scheduleStatus: "idle",
      scheduledFor: null,
      processingStartedAt: null,
      publishedAt: null,
      cancelledAt: null,
      retryCount: 0,
      lastError: null,
      idempotencyKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: orig.variants.map((v, i) => ({
        ...v,
        id: `var_${newId}_${v.platform}_${i}`,
        postId: newId,
        publishStatus: "pending",
        publishedAt: null,
        externalPostId: null,
        externalPostUrl: null,
        errorMessage: null,
      })),
    };

    this.posts.unshift(copy);
    return copy;
  }

  // Storage and 1-Hour Auto-Purge
  private totalReclaimedBytes = 0;

  purgeExpiredMedia() {
    const now = new Date();
    let purgedPostsCount = 0;
    let purgedMediaCount = 0;
    let reclaimedBytes = 0;

    // 1. Check posts with expired media (1 hour after publish)
    this.posts.forEach((post) => {
      if (
        !post.mediaAutoDeleted &&
        post.mediaExpiresAt &&
        new Date(post.mediaExpiresAt) <= now
      ) {
        post.mediaAutoDeleted = true;
        // Keep note that media was purged to save storage
        if (post.mainMediaUrl && !post.mainMediaUrl.startsWith("[Purged")) {
          // If it was a data URL, calculate reclaimed bytes
          if (post.mainMediaUrl.startsWith("data:")) {
            reclaimedBytes += Math.round((post.mainMediaUrl.length * 3) / 4);
          }
          post.mainMediaUrl = "[Purged to preserve storage]";
        }

        post.variants.forEach((v) => {
          if (v.mediaUrl && !v.mediaUrl.startsWith("[Purged")) {
            v.mediaUrl = "[Purged to preserve storage]";
          }
        });

        purgedPostsCount++;
      }
    });

    // 2. Check media assets with expired timers or linked to purged posts
    this.media.forEach((asset) => {
      if (!asset.isPurged && asset.expiresAt && new Date(asset.expiresAt) <= now) {
        asset.isPurged = true;
        reclaimedBytes += asset.fileSize || 0;
        purgedMediaCount++;
      }
    });

    // Remove purged assets from active media array to free memory/storage
    this.media = this.media.filter((m) => !m.isPurged);

    this.totalReclaimedBytes += reclaimedBytes;

    return {
      purgedPostsCount,
      purgedMediaCount,
      reclaimedBytes,
      totalReclaimedBytes: this.totalReclaimedBytes,
    };
  }

  getStorageStats() {
    const currentBytes = this.media.reduce((sum, m) => sum + (m.fileSize || 0), 0);
    const purgedPosts = this.posts.filter((p) => p.mediaAutoDeleted).length;
    return {
      activeAssetsCount: this.media.length,
      currentBytes,
      totalReclaimedBytes: this.totalReclaimedBytes,
      purgedPostsCount: purgedPosts,
    };
  }

  // Analytics
  getAnalytics() {
    return this.analytics;
  }
  addAnalyticsSnapshot(snapshot: AnalyticsSnapshot) {
    this.analytics.push(snapshot);
    return snapshot;
  }
}

// Global in-memory singleton
const globalStore = globalThis as unknown as {
  __socialhub_store?: InMemoryDatabase;
};

if (!globalStore.__socialhub_store) {
  globalStore.__socialhub_store = new InMemoryDatabase();
}

export const store = globalStore.__socialhub_store;
