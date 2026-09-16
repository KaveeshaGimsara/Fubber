import crypto from "crypto";

// RFC 4648 Base32 alphabet
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encode buffer to RFC 4648 Base32 string (without padding)
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decode RFC 4648 Base32 string to Buffer
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[\s-]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const index = BASE32_CHARS.indexOf(char);
    if (index === -1) continue;

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generate an RFC 6238 TOTP code for a given time step and Base32 secret
 */
export function generateTotp(secretBase32: string, timeStepWindow = 0, stepSeconds = 30): string {
  const key = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / stepSeconds) + timeStepWindow;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation (RFC 4226)
  const offset = digest[digest.length - 1] & 0xf;
  const codeInt =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const code = (codeInt % 1_000_000).toString().padStart(6, "0");
  return code;
}

/**
 * Verify a 6-digit TOTP token against a Base32 secret with drift window tolerance
 */
export function verifyTotp(secretBase32: string, token: string, window = 1): boolean {
  const cleanToken = token.trim().replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleanToken)) {
    return false;
  }

  for (let i = -window; i <= window; i++) {
    const expected = generateTotp(secretBase32, i);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(cleanToken))) {
      return true;
    }
  }
  return false;
}

/**
 * Generate a new random 20-byte Base32 secret and OTPAuth URI
 */
export function generateTotpSetup(userEmail = "owner@fubber.io", issuer = "Fubber") {
  const randomBytes = crypto.randomBytes(20);
  const secretBase32 = base32Encode(randomBytes);
  
  // Format for Google Authenticator / Authy
  const formattedSecret = secretBase32.match(/.{1,4}/g)?.join(" ") || secretBase32;
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(userEmail);
  const otpauthUri = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secretBase32}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;

  // Generate 8 alphanumeric backup recovery codes
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const raw = crypto.randomBytes(4).toString("hex").toUpperCase();
    backupCodes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }

  return {
    secret: secretBase32,
    formattedSecret,
    otpauthUri,
    backupCodes,
  };
}
