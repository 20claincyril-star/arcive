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

// Paramètres KDF centralisés (plus facile à auditer / modifier).
const DEFAULT_PBKDF2_ITERATIONS = 210_000;
const DEFAULT_KEY_LENGTH = 32;
const ARGON2_MEMORY_COST = 2 ** 16; // 64 MiB
const ARGON2_TIME_COST = 3;
const ARGON2_PARALLELISM = 1;

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
  const keyLength = DEFAULT_KEY_LENGTH;
  const key = await argon2.hash(password, {
    type: argon2.argon2id,
    salt: resolvedSalt,
    hashLength: keyLength,
    memoryCost: ARGON2_MEMORY_COST,
    timeCost: ARGON2_TIME_COST,
    parallelism: ARGON2_PARALLELISM,
    raw: true
  });
  return {
    salt: resolvedSalt,
    key,
    kdf: {
      algorithm: 'argon2id',
      keyLength,
      iterations: ARGON2_TIME_COST,
      memoryCost: ARGON2_MEMORY_COST,
      parallelism: ARGON2_PARALLELISM
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
      memoryCost: config.memoryCost ?? ARGON2_MEMORY_COST,
      timeCost: config.iterations ?? ARGON2_TIME_COST,
      parallelism: config.parallelism ?? ARGON2_PARALLELISM,
      raw: true
    });
    return { salt, key, kdf: config };
  }
  const iterations = config.iterations ?? DEFAULT_PBKDF2_ITERATIONS;
  const key = pbkdf2Sync(password, salt, iterations, config.keyLength, 'sha256');
  return {
    salt,
    key,
    kdf: {
      algorithm: 'pbkdf2-sha256',
      iterations,
      keyLength: config.keyLength
    }
  };
}

export function encryptBuffer(plain: Buffer, key: Buffer): Buffer {
  const nonce = randomBytes(NONCE_SIZE);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, tag, ciphertext]);
}

export function decryptBuffer(payload: Buffer, key: Buffer): Buffer {
  if (payload.byteLength < NONCE_SIZE + TAG_SIZE + 1) {
    throw new Error('Ciphertext trop court ou corrompu.');
  }
  const nonce = payload.subarray(0, NONCE_SIZE);
  const tag = payload.subarray(NONCE_SIZE, NONCE_SIZE + TAG_SIZE);
  const ciphertext = payload.subarray(NONCE_SIZE + TAG_SIZE);
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('Echec de déchiffrement (données ou clé invalides).');
  }
}
