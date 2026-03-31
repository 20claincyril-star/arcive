export interface VaultManifest {
  version: 1;
  salt: string;
  kdf: KdfConfig;
  algorithm: 'aes-256-gcm';
  docs: Record<string, DocumentRecord>;
}

export interface KdfConfig {
  algorithm: 'argon2id' | 'pbkdf2-sha256';
  iterations?: number;
  keyLength: number;
  memoryCost?: number;
  parallelism?: number;
}

export interface DocumentRecord {
  id: string;
  name: string;
  searchableText: string;
  currentVersionId: string;
  versions: DocumentVersion[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface DocumentVersion {
  versionId: string;
  blobPath: string;
  size: number;
  sha256: string;
  createdAt: string;
  source: 'import' | 'edit' | 'restore';
  note?: string;
}

export interface SearchResult {
  id: string;
  name: string;
  tags: string[];
  updatedAt: string;
}
