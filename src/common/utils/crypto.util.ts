import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

export const generateSecureToken = (length: number = 32): string =>
  randomBytes(length).toString('hex');

export const generateOtp = (): string => {
  const num = randomBytes(3).readUIntBE(0, 3) % 1000000;
  return num.toString().padStart(6, '0');
};

export const generateDeviceFingerprint = (): string =>
  randomBytes(16).toString('hex');

const ALGORITHM = 'aes-256-gcm';

export const encryptAES = (
  text: string,
  secretKey: string,
): { encrypted: string; iv: string; authTag: string } => {
  const key = Buffer.from(secretKey.padEnd(32).slice(0, 32));
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
};

export const decryptAES = (
  encryptedHex: string,
  secretKey: string,
  ivHex: string,
  authTagHex: string,
): string => {
  const key = Buffer.from(secretKey.padEnd(32).slice(0, 32));
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
