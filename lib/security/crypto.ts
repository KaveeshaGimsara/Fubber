import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * Derives a 32-byte key from AUTH_SECRET or returns a fallback key.
 * In production on Vercel, AUTH_SECRET must be set in environment variables.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET || "fubber-default-dev-secret-key-32b!";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a string using AES-256-GCM.
 * Output format: hex(iv):hex(authTag):hex(encryptedData)
 */
export function encryptToken(text: string | null | undefined): string | null {
  if (!text) return null;
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to securely encrypt token");
  }
}

/**
 * Decrypts a string encrypted with AES-256-GCM.
 */
export function decryptToken(encryptedString: string | null | undefined): string | null {
  if (!encryptedString) return null;
  try {
    const parts = encryptedString.split(":");
    if (parts.length !== 3) {
      // If it's a mock or unencrypted string in dev
      return encryptedString;
    }

    const [ivHex, tagHex, dataHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(dataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
}
