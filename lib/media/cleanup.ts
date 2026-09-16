import { store, isLiveDb, db } from "../db";
import { deleteMediaAsset } from "./storage";
import { posts, mediaAssets, postVariants } from "../db/schema";
import { lte, eq, and } from "drizzle-orm";

export interface CleanupResult {
  purgedPostsCount: number;
  purgedMediaCount: number;
  reclaimedBytes: number;
  totalReclaimedBytes: number;
  timestamp: string;
}

/**
 * Purges media files and base64 binaries 1 hour after post publication.
 * Keeps post text, remote URLs, platform engagement, and analytics intact,
 * while reducing image storage footprints to 0 bytes.
 */
export async function runMediaCleanup(): Promise<CleanupResult> {
  const now = new Date();

  // 1. In-Memory Store Cleanup
  const storeResult = store.purgeExpiredMedia();

  // 2. Real Neon PostgreSQL cleanup if live DB is active
  if (isLiveDb && db) {
    try {
      // Find all posts where media has expired (1 hour after publish) and not yet auto-deleted
      const expiredPosts = await db
        .select()
        .from(posts)
        .where(
          and(
            eq(posts.mediaAutoDeleted, false),
            lte(posts.mediaExpiresAt, now)
          )
        );

      for (const p of expiredPosts) {
        // Delete from Vercel Blob if applicable
        if (p.mainMediaUrl && p.mainMediaUrl.startsWith("http")) {
          await deleteMediaAsset(p.mainMediaUrl);
        }

        // Mark post media as deleted and replace heavy URL with storage placeholder
        await db
          .update(posts)
          .set({
            mediaAutoDeleted: true,
            mainMediaUrl: "[Purged to preserve storage]",
            updatedAt: now,
          })
          .where(eq(posts.id, p.id));

        // Update post variants
        await db
          .update(postVariants)
          .set({
            mediaUrl: "[Purged to preserve storage]",
            updatedAt: now,
          })
          .where(eq(postVariants.postId, p.id));
      }

      // Find and remove expired media asset records
      const expiredAssets = await db
        .select()
        .from(mediaAssets)
        .where(
          and(
            eq(mediaAssets.isPurged, false),
            lte(mediaAssets.expiresAt, now)
          )
        );

      for (const asset of expiredAssets) {
        if (asset.url.startsWith("http")) {
          await deleteMediaAsset(asset.url);
        }

        await db
          .update(mediaAssets)
          .set({
            isPurged: true,
            updatedAt: now,
          })
          .where(eq(mediaAssets.id, asset.id));
      }
    } catch (err) {
      console.error("Live DB media cleanup encountered an error:", err);
    }
  }

  return {
    ...storeResult,
    timestamp: now.toISOString(),
  };
}
