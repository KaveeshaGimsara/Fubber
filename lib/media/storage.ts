import { put, del } from "@vercel/blob";
import { MediaAsset } from "../db/types";

export interface UploadResult {
  url: string;
  storageKey: string;
  size: number;
  mimeType: string;
  filename: string;
}

export async function uploadMedia(
  file: File | Blob,
  filename: string
): Promise<UploadResult> {
  const mimeType = file.type || "image/jpeg";
  const size = file.size;

  // 1. If Vercel Blob token is configured, upload directly to Vercel Blob
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const blob = await put(`socialhub/${Date.now()}-${filename}`, file, {
        access: "public",
        addRandomSuffix: true,
      });

      return {
        url: blob.url,
        storageKey: blob.pathname,
        size,
        mimeType,
        filename,
      };
    } catch (error) {
      console.warn("Vercel Blob upload failed, falling back to data URL:", error);
    }
  }

  // 2. Fallback: Convert to data URL or object reference for local development/preview
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64 street,${base64}`;

  return {
    url: `data:${mimeType};base64,${base64}`,
    storageKey: `local/${Date.now()}-${filename}`,
    size,
    mimeType,
    filename,
  };
}

export async function deleteMediaAsset(urlOrKey: string): Promise<boolean> {
  if (!urlOrKey) return true;

  if (process.env.BLOB_READ_WRITE_TOKEN && urlOrKey.startsWith("http")) {
    try {
      await del(urlOrKey);
      return true;
    } catch (error) {
      console.warn("Failed to delete media from Vercel Blob:", error);
      return false;
    }
  }

  return true;
}

