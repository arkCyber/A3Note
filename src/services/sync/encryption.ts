// Sync Encryption Service - Aerospace Grade
// End-to-end encryption for sync data

import { log } from '../../utils/logger';

export interface EncryptedData {
  iv: number[];
  data: number[];
  salt?: number[];
}

export interface EncryptionKey {
  key: CryptoKey;
  salt: Uint8Array;
}

/**
 * Sync Encryption Service
 * Provides end-to-end encryption for sync data
 */
export class SyncEncryption {
  private static instance: SyncEncryption;
  private encryptionKey: CryptoKey | null = null;
  private salt: Uint8Array | null = null;

  private constructor() {}

  static getInstance(): SyncEncryption {
    if (!SyncEncryption.instance) {
      SyncEncryption.instance = new SyncEncryption();
    }
    return SyncEncryption.instance;
  }

  /**
   * Initialize encryption with user password
   */
  async initialize(password: string, existingSalt?: Uint8Array): Promise<void> {
    try {
      this.salt = existingSalt || crypto.getRandomValues(new Uint8Array(16));
      this.encryptionKey = await this.deriveKey(password, this.salt);
      
      log.info('[SyncEncryption] Encryption initialized');
    } catch (error) {
      log.error('[SyncEncryption] Failed to initialize encryption:', error);
      throw error;
    }
  }

  /**
   * Derive encryption key from password using PBKDF2
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt file content
   */
  async encryptFile(content: string): Promise<EncryptedData> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encoder = new TextEncoder();
      const data = encoder.encode(content);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      return {
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted)),
        salt: this.salt ? Array.from(this.salt) : undefined
      };
    } catch (error) {
      log.error('[SyncEncryption] Failed to encrypt file:', error);
      throw error;
    }
  }

  /**
   * Decrypt file content
   */
  async decryptFile(encrypted: EncryptedData): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized');
    }

    try {
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(encrypted.iv) },
        this.encryptionKey,
        new Uint8Array(encrypted.data)
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      log.error('[SyncEncryption] Failed to decrypt file:', error);
      throw error;
    }
  }

  /**
   * Encrypt metadata (file paths, timestamps, etc.)
   */
  async encryptMetadata(metadata: any): Promise<EncryptedData> {
    const json = JSON.stringify(metadata);
    return this.encryptFile(json);
  }

  /**
   * Decrypt metadata
   */
  async decryptMetadata(encrypted: EncryptedData): Promise<any> {
    const json = await this.decryptFile(encrypted);
    return JSON.parse(json);
  }

  /**
   * Generate hash for content verification
   */
  async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify content integrity
   */
  async verifyContent(content: string, expectedHash: string): Promise<boolean> {
    const actualHash = await this.hashContent(content);
    return actualHash === expectedHash;
  }

  /**
   * Get salt for storage
   */
  getSalt(): Uint8Array | null {
    return this.salt;
  }

  /**
   * Clear encryption key (logout)
   */
  clear(): void {
    this.encryptionKey = null;
    this.salt = null;
    log.info('[SyncEncryption] Encryption cleared');
  }
}

// Export singleton instance
export const syncEncryption = SyncEncryption.getInstance();
