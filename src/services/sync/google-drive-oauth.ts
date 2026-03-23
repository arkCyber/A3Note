// Google Drive OAuth Flow - Aerospace Grade
// OAuth 2.0 authentication for Google Drive

import { log } from '../../utils/logger';

export interface GoogleDriveTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface GoogleDriveConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * Google Drive OAuth Service
 * Handles OAuth 2.0 authentication flow
 */
export class GoogleDriveOAuth {
  private static instance: GoogleDriveOAuth;
  private config: GoogleDriveConfig | null = null;
  private tokens: GoogleDriveTokens | null = null;

  private readonly AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
  private readonly TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
  private readonly SCOPES = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata'
  ];

  private constructor() {
    this.loadTokens();
  }

  static getInstance(): GoogleDriveOAuth {
    if (!GoogleDriveOAuth.instance) {
      GoogleDriveOAuth.instance = new GoogleDriveOAuth();
    }
    return GoogleDriveOAuth.instance;
  }

  /**
   * Initialize OAuth configuration
   */
  initialize(config: GoogleDriveConfig): void {
    this.config = config;
    log.info('[GoogleDriveOAuth] Initialized');
  }

  /**
   * Start OAuth flow
   */
  async startAuthFlow(): Promise<void> {
    if (!this.config) {
      throw new Error('OAuth not initialized');
    }

    const authUrl = this.buildAuthUrl();
    
    // Open auth URL in browser
    window.open(authUrl, '_blank');
    
    log.info('[GoogleDriveOAuth] Auth flow started');
  }

  /**
   * Build authorization URL
   */
  private buildAuthUrl(): string {
    if (!this.config) {
      throw new Error('OAuth not initialized');
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.AUTH_ENDPOINT}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(code: string): Promise<void> {
    if (!this.config) {
      throw new Error('OAuth not initialized');
    }

    try {
      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          code,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.redirectUri,
          grant_type: 'authorization_code'
        })
      });

      if (!response.ok) {
        throw new Error(`OAuth failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      this.tokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      };

      this.saveTokens();
      log.info('[GoogleDriveOAuth] Authentication successful');
    } catch (error) {
      log.error('[GoogleDriveOAuth] Failed to handle callback:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<void> {
    if (!this.config || !this.tokens?.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(this.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          refresh_token: this.tokens.refreshToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data = await response.json();
      
      this.tokens = {
        ...this.tokens,
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000)
      };

      this.saveTokens();
      log.info('[GoogleDriveOAuth] Token refreshed');
    } catch (error) {
      log.error('[GoogleDriveOAuth] Failed to refresh token:', error);
      throw error;
    }
  }

  /**
   * Get valid access token
   */
  async getAccessToken(): Promise<string> {
    if (!this.tokens) {
      throw new Error('Not authenticated');
    }

    // Check if token is expired or will expire in next 5 minutes
    if (Date.now() >= this.tokens.expiresAt - 300000) {
      await this.refreshAccessToken();
    }

    return this.tokens.accessToken;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.tokens !== null;
  }

  /**
   * Revoke tokens and logout
   */
  async logout(): Promise<void> {
    if (this.tokens?.accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.tokens.accessToken}`, {
          method: 'POST'
        });
      } catch (error) {
        log.error('[GoogleDriveOAuth] Failed to revoke token:', error);
      }
    }

    this.tokens = null;
    this.clearTokens();
    log.info('[GoogleDriveOAuth] Logged out');
  }

  /**
   * Save tokens to localStorage
   */
  private saveTokens(): void {
    if (this.tokens) {
      localStorage.setItem('gdrive_tokens', JSON.stringify(this.tokens));
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadTokens(): void {
    try {
      const stored = localStorage.getItem('gdrive_tokens');
      if (stored) {
        this.tokens = JSON.parse(stored);
        log.info('[GoogleDriveOAuth] Tokens loaded from storage');
      }
    } catch (error) {
      log.error('[GoogleDriveOAuth] Failed to load tokens:', error);
    }
  }

  /**
   * Clear tokens from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem('gdrive_tokens');
  }
}

// Export singleton instance
export const googleDriveOAuth = GoogleDriveOAuth.getInstance();
