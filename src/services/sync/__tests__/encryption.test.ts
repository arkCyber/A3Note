import { describe, it, expect, beforeEach } from 'vitest';
import { SyncEncryption } from '../encryption';

describe('SyncEncryption', () => {
  let encryption: SyncEncryption;
  const testPassword = 'test-password-123';
  const testContent = 'This is test content for encryption';

  beforeEach(() => {
    encryption = SyncEncryption.getInstance();
  });

  describe('Initialization', () => {
    it('should initialize with password', async () => {
      await encryption.initialize(testPassword);
      expect(encryption.isInitialized()).toBe(true);
    });

    it('should throw error when encrypting without initialization', async () => {
      const uninitializedEncryption = new (SyncEncryption as any)();
      await expect(
        uninitializedEncryption.encryptFile(testContent)
      ).rejects.toThrow('Encryption not initialized');
    });
  });

  describe('File Encryption', () => {
    beforeEach(async () => {
      await encryption.initialize(testPassword);
    });

    it('should encrypt file content', async () => {
      const encrypted = await encryption.encryptFile(testContent);
      
      expect(encrypted.content).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.content).not.toBe(testContent);
    });

    it('should produce different encrypted content each time', async () => {
      const encrypted1 = await encryption.encryptFile(testContent);
      const encrypted2 = await encryption.encryptFile(testContent);
      
      expect(encrypted1.content).not.toBe(encrypted2.content);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('should decrypt encrypted content correctly', async () => {
      const encrypted = await encryption.encryptFile(testContent);
      const decrypted = await encryption.decryptFile(encrypted);
      
      expect(decrypted).toBe(testContent);
    });

    it('should handle empty content', async () => {
      const encrypted = await encryption.encryptFile('');
      const decrypted = await encryption.decryptFile(encrypted);
      
      expect(decrypted).toBe('');
    });

    it('should handle large content', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB
      const encrypted = await encryption.encryptFile(largeContent);
      const decrypted = await encryption.decryptFile(encrypted);
      
      expect(decrypted).toBe(largeContent);
    });

    it('should handle unicode content', async () => {
      const unicodeContent = '你好世界 🌍 مرحبا العالم';
      const encrypted = await encryption.encryptFile(unicodeContent);
      const decrypted = await encryption.decryptFile(encrypted);
      
      expect(decrypted).toBe(unicodeContent);
    });
  });

  describe('Metadata Encryption', () => {
    beforeEach(async () => {
      await encryption.initialize(testPassword);
    });

    it('should encrypt metadata', async () => {
      const metadata = { path: '/test/file.md', timestamp: Date.now() };
      const encrypted = await encryption.encryptMetadata(metadata);
      
      expect(encrypted.content).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.content).not.toContain('/test/file.md');
    });

    it('should decrypt metadata correctly', async () => {
      const metadata = { path: '/test/file.md', timestamp: 123456789 };
      const encrypted = await encryption.encryptMetadata(metadata);
      const decrypted = await encryption.decryptMetadata(encrypted);
      
      expect(decrypted).toEqual(metadata);
    });
  });

  describe('Content Hashing', () => {
    beforeEach(async () => {
      await encryption.initialize(testPassword);
    });

    it('should generate consistent hash for same content', async () => {
      const hash1 = await encryption.hashContent(testContent);
      const hash2 = await encryption.hashContent(testContent);
      
      expect(hash1).toBe(hash2);
    });

    it('should generate different hash for different content', async () => {
      const hash1 = await encryption.hashContent('content1');
      const hash2 = await encryption.hashContent('content2');
      
      expect(hash1).not.toBe(hash2);
    });

    it('should verify content correctly', async () => {
      const hash = await encryption.hashContent(testContent);
      const isValid = await encryption.verifyContent(testContent, hash);
      
      expect(isValid).toBe(true);
    });

    it('should detect modified content', async () => {
      const hash = await encryption.hashContent(testContent);
      const isValid = await encryption.verifyContent('modified content', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await encryption.initialize(testPassword);
    });

    it('should throw error for invalid encrypted data', async () => {
      const invalidData = {
        content: 'invalid-base64',
        iv: 'invalid-iv',
        salt: 'invalid-salt'
      };
      
      await expect(
        encryption.decryptFile(invalidData)
      ).rejects.toThrow();
    });

    it('should throw error for wrong password', async () => {
      const encrypted = await encryption.encryptFile(testContent);
      
      // Re-initialize with different password
      await encryption.initialize('wrong-password');
      
      await expect(
        encryption.decryptFile(encrypted)
      ).rejects.toThrow();
    });
  });

  describe('Key Derivation', () => {
    it('should derive same key from same password and salt', async () => {
      const encryption1 = SyncEncryption.getInstance();
      await encryption1.initialize(testPassword);
      const encrypted1 = await encryption1.encryptFile(testContent);
      
      const encryption2 = SyncEncryption.getInstance();
      await encryption2.initialize(testPassword);
      
      // Should be able to decrypt with same password
      const decrypted = await encryption2.decryptFile(encrypted1);
      expect(decrypted).toBe(testContent);
    });
  });

  describe('Performance', () => {
    beforeEach(async () => {
      await encryption.initialize(testPassword);
    });

    it('should encrypt and decrypt within reasonable time', async () => {
      const content = 'x'.repeat(100000); // 100KB
      
      const startEncrypt = Date.now();
      const encrypted = await encryption.encryptFile(content);
      const encryptTime = Date.now() - startEncrypt;
      
      const startDecrypt = Date.now();
      await encryption.decryptFile(encrypted);
      const decryptTime = Date.now() - startDecrypt;
      
      // Should complete within 1 second each
      expect(encryptTime).toBeLessThan(1000);
      expect(decryptTime).toBeLessThan(1000);
    });
  });
});
