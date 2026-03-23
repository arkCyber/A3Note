import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { GoogleDriveOAuth } from '../google-drive-oauth';

// Mock fetch
global.fetch = vi.fn();

// Mock window.open
global.window.open = vi.fn();

describe('GoogleDriveOAuth', () => {
  let oauth: GoogleDriveOAuth;
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback'
  };

  beforeEach(() => {
    oauth = GoogleDriveOAuth.getInstance();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with config', () => {
      oauth.initialize(mockConfig);
      expect(() => oauth.startAuthFlow()).not.toThrow();
    });

    it('should throw error when starting auth without initialization', async () => {
      const uninitializedOAuth = new (GoogleDriveOAuth as any)();
      await expect(uninitializedOAuth.startAuthFlow()).rejects.toThrow('OAuth not initialized');
    });
  });

  describe('Auth Flow', () => {
    beforeEach(() => {
      oauth.initialize(mockConfig);
    });

    it('should start auth flow and open browser', async () => {
      await oauth.startAuthFlow();
      
      expect(window.open).toHaveBeenCalled();
      const callArgs = (window.open as any).mock.calls[0];
      const url = callArgs[0];
      
      expect(url).toContain('accounts.google.com');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=');
    });

    it('should include correct scopes in auth URL', async () => {
      await oauth.startAuthFlow();
      
      const callArgs = (window.open as any).mock.calls[0];
      const url = callArgs[0];
      
      expect(url).toContain('scope=');
      expect(url).toContain('drive.file');
      expect(url).toContain('drive.appdata');
    });
  });

  describe('Token Handling', () => {
    beforeEach(() => {
      oauth.initialize(mockConfig);
    });

    it('should handle OAuth callback successfully', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await oauth.handleCallback('test-auth-code');
      
      expect(oauth.isAuthenticated()).toBe(true);
    });

    it('should save tokens to localStorage', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_in: 3600
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await oauth.handleCallback('test-auth-code');
      
      const stored = localStorage.getItem('gdrive_tokens');
      expect(stored).toBeTruthy();
      
      const tokens = JSON.parse(stored!);
      expect(tokens.accessToken).toBe('test-access-token');
      expect(tokens.refreshToken).toBe('test-refresh-token');
    });

    it('should throw error on failed callback', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      });

      await expect(oauth.handleCallback('invalid-code')).rejects.toThrow();
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      oauth.initialize(mockConfig);
    });

    it('should refresh access token', async () => {
      // Set initial tokens
      const initialTokens = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 1000 // Expired
      };
      localStorage.setItem('gdrive_tokens', JSON.stringify(initialTokens));

      const mockResponse = {
        access_token: 'new-access-token',
        expires_in: 3600
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await oauth.refreshAccessToken();
      
      const stored = localStorage.getItem('gdrive_tokens');
      const tokens = JSON.parse(stored!);
      expect(tokens.accessToken).toBe('new-access-token');
    });

    it('should auto-refresh expired token when getting access token', async () => {
      const expiredTokens = {
        accessToken: 'old-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() - 1000
      };
      localStorage.setItem('gdrive_tokens', JSON.stringify(expiredTokens));

      const mockResponse = {
        access_token: 'refreshed-token',
        expires_in: 3600
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      // Reload tokens
      const newOAuth = GoogleDriveOAuth.getInstance();
      newOAuth.initialize(mockConfig);
      
      const token = await newOAuth.getAccessToken();
      expect(token).toBe('refreshed-token');
    });
  });

  describe('Authentication Status', () => {
    it('should return false when not authenticated', () => {
      expect(oauth.isAuthenticated()).toBe(false);
    });

    it('should return true when authenticated', async () => {
      oauth.initialize(mockConfig);
      
      const mockResponse = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_in: 3600
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await oauth.handleCallback('test-code');
      expect(oauth.isAuthenticated()).toBe(true);
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      oauth.initialize(mockConfig);
    });

    it('should revoke tokens and clear storage', async () => {
      // Set tokens
      const tokens = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000
      };
      localStorage.setItem('gdrive_tokens', JSON.stringify(tokens));

      (global.fetch as any).mockResolvedValueOnce({
        ok: true
      });

      await oauth.logout();
      
      expect(oauth.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('gdrive_tokens')).toBeNull();
    });

    it('should handle revocation errors gracefully', async () => {
      const tokens = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        expiresAt: Date.now() + 3600000
      };
      localStorage.setItem('gdrive_tokens', JSON.stringify(tokens));

      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      await expect(oauth.logout()).resolves.not.toThrow();
      expect(oauth.isAuthenticated()).toBe(false);
    });
  });

  describe('Token Persistence', () => {
    it('should load tokens from localStorage on initialization', () => {
      const tokens = {
        accessToken: 'stored-token',
        refreshToken: 'stored-refresh',
        expiresAt: Date.now() + 3600000
      };
      localStorage.setItem('gdrive_tokens', JSON.stringify(tokens));

      const newOAuth = GoogleDriveOAuth.getInstance();
      expect(newOAuth.isAuthenticated()).toBe(true);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('gdrive_tokens', 'invalid-json');

      const newOAuth = GoogleDriveOAuth.getInstance();
      expect(newOAuth.isAuthenticated()).toBe(false);
    });
  });
});
