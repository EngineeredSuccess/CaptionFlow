import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

/**
 * Encrypts sensitive data using AES-256-GCM.
 * (M2 - Security Remediation)
 */
export function encrypt(text: string): string {
  if (!text) return '';
  
  const keyStr = process.env.TOKEN_ENCRYPTION_KEY;
  if (!keyStr) {
    // If key is missing, return plaintext but log warning
    // In production, this should throw
    if (process.env.NODE_ENV === 'production') {
        throw new Error('TOKEN_ENCRYPTION_KEY is required in production');
    }
    console.warn('WARNING: TOKEN_ENCRYPTION_KEY is missing. Storing tokens in plaintext.');
    return text;
  }

  // Ensure key is 32 bytes (64 hex chars)
  const key = Buffer.from(keyStr, 'hex');
  if (key.length !== 32) {
    throw new Error('TOKEN_ENCRYPTION_KEY must be a 32-byte hex string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format: iv:tag:encrypted
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts sensitive data using AES-256-GCM.
 * (M2 - Security Remediation)
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return '';
  
  // If data doesn't follow the iv:tag:encrypted format, assume it's legacy plaintext
  if (!encryptedData.includes(':')) {
    return encryptedData;
  }

  const keyStr = process.env.TOKEN_ENCRYPTION_KEY;
  if (!keyStr) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('TOKEN_ENCRYPTION_KEY is required in production');
    }
    return encryptedData;
  }

  const key = Buffer.from(keyStr, 'hex');
  const [ivHex, tagHex, encryptedText] = encryptedData.split(':');
  
  if (!ivHex || !tagHex || !encryptedText) {
    return encryptedData; // Fallback to plaintext if format is invalid
  }

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Fallback to plaintext if decryption fails
  }
}
