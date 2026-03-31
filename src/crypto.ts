import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from 'node:crypto';
import argon2 from 'argon2';
import type { KdfConfig } from './types.js';

const NONCE_SIZE = 12;
const TAG_SIZE = 16;

export interface KeyMaterial {
  salt: Buffer;
  key: Buffer;
  kdf: KdfConfig;
}

const DEFAULT_PBKDF2_ITERATIONS = 210_000;
const DEFAULT_KEY_LENGTH = 32;

export async function deriveKey(password: string, salt?: Buffer): Promise<KeyMaterial> {
  const resolvedSalt = salt ?? randomBytes(16);
  const keyLength = DEFAULT_KEY_LENGTH;
  const iterations = DEFAULT_PBKDF2_ITERATIONS;
  const key = pbkdf2Sync(password, resolvedSalt, iterations, keyLength, 'sha256');
  return {
    salt: resolvedSalt,
    key,
    kdf: {
      algorithm: 'pbkdf2-sha256',
      iterations,
      keyLength
    }
  };
}

export async function deriveKeyArgon2id(password: string, salt?: Buffer): Promise<KeyMaterial> {
  const resolvedSalt = salt ?? randomBytes(16);
  const memoryCost = 2 ** 16;
  const timeCost = 3;
  const parallelism = 1;
  const keyLength = DEFAULT_KEY_LENGTH;
  const key = await argon2.hash(password, {
    type: argon2.argon2id,
    salt: resolvedSalt,
    hashLength: keyLength,
    memoryCost,
    timeCost,
    parallelism,
    raw: true
  });
  return {
    salt: resolvedSalt,
    key,
    kdf: {
      algorithm: 'argon2id',
      keyLength,
      iterations: timeCost,
      memoryCost,
      parallelism
    }
  };
}

export async function deriveKeyFromConfig(
  password: string,
  salt: Buffer,
  config: KdfConfig
): Promise<KeyMaterial> {
  if (config.algorithm === 'argon2id') {
    const key = await argon2.hash(password, {
      type: argon2.argon2id,
      salt,
      hashLength: config.keyLength,
      memoryCost: config.memoryCost ?? 2 ** 16,
      timeCost: config.iterations ?? 3,
      parallelism: config.parallelism ?? 1,
      raw: true
    });
    return { salt, key, kdf: config };
  }
  const key = pbkdf2Sync(
    password,
    salt,
    config.iterations ?? DEFAULT_PBKDF2_ITERATIONS,
    config.keyLength,
    'sha256'
  );
  return { salt, key, kdf: config };
}

export function encryptBuffer(plain: Buffer, key: Buffer): Buffer {
  const nonce = randomBytes(NONCE_SIZE);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, tag, ciphertext]);
}

export function decryptBuffer(payload: Buffer, key: Buffer): Buffer {
  const nonce = payload.subarray(0, NONCE_SIZE);
  const tag = payload.subarray(NONCE_SIZE, NONCE_SIZE + TAG_SIZE);
  const ciphertext = payload.subarray(NONCE_SIZE + TAG_SIZE);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}
