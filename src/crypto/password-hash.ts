import crypto from 'crypto';

/** NTA-style double SHA-256 password encoding (educational / authorized testing only). */
export function encryptPortalPassword(password: string, salt: string): string {
  const hash1 = crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
  return crypto.createHash('sha256').update(hash1 + salt).digest('hex').toUpperCase();
}
