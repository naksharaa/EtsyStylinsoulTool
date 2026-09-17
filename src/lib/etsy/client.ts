// ============================================
// Etsy Open API v3 Client
// ============================================
// Based on official Etsy OAuth 2.0 documentation:
// https://developer.etsy.com/documentation/essentials/authentication
//
// Token endpoint: POST https://api.etsy.com/v3/public/oauth/token
// Auth endpoint:  GET  https://www.etsy.com/oauth/connect
// API base:       https://api.etsy.com/v3

import type { EtsyOAuthTokens, EtsyOAuthState } from '../../types';

const ETSY_API_BASE = 'https://api.etsy.com/v3';
const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect';
const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';

// ---- PKCE Utilities ----
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

// ---- OAuth Authorization URL ----
export function buildAuthorizationUrl(
  keystring: string,
  redirectUri: string,
  codeChallenge: string,
  state: string,
  scopes: string[] = ['listings_r', 'listings_w', 'transactions_r', 'shops_r', 'shops_w']
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: keystring,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  return `${ETSY_AUTH_URL}?${params.toString()}`;
}

// ---- Token Exchange (Step 3 of OAuth flow) ----
// POST https://api.etsy.com/v3/public/oauth/token
// Body: application/x-www-form-urlencoded
// NOTE: No x-api-key header needed for token exchange per Etsy docs
export async function exchangeCodeForTokens(
  code: string,
  keystring: string,
  redirectUri: string,
  codeVerifier: string
): Promise<EtsyOAuthTokens> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: keystring,
    redirect_uri: redirectUri,
    code: code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.json();
      errorDetail = errorData.error_description || errorData.error || JSON.stringify(errorData);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Token exchange failed (HTTP ${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  
  // Etsy returns access_token with user_id prefix: "12345678.token_string"
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in * 1000),
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

// ---- Token Refresh ----
export async function refreshAccessToken(
  refreshToken: string,
  keystring: string
): Promise<EtsyOAuthTokens> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: keystring,
    refresh_token: refreshToken,
  });

  const response = await fetch(ETSY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorData = await response.json();
      errorDetail = errorData.error_description || errorData.error || JSON.stringify(errorData);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(`Token refresh failed (HTTP ${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token || refreshToken,
    expires_at: Date.now() + (data.expires_in * 1000),
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
  };
}

// ---- Rate Limiter ----
class RateLimiter {
  private queue: Array<() => Promise<void>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 200; // 200ms = 5 QPS (safe for Etsy)

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minInterval) {
            await new Promise(r => setTimeout(r, this.minInterval - timeSinceLastRequest));
          }
          this.lastRequestTime = Date.now();
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length > 0) {
      const fn = this.queue.shift()!;
      await fn();
    }
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// ---- Etsy API Client ----
// For all API calls AFTER authentication
// x-api-key header format: <keystring>:<shared_secret>
export class EtsyClient {
  private keystring: string;
  private sharedSecret: string;
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;
  private onTokenRefresh?: (tokens: EtsyOAuthTokens) => void;

  constructor(
    keystring: string,
    sharedSecret: string,
    tokens: EtsyOAuthTokens,
    onTokenRefresh?: (tokens: EtsyOAuthTokens) => void
  ) {
    this.keystring = keystring;
    this.sharedSecret = sharedSecret;
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = tokens.expires_at;
    this.onTokenRefresh = onTokenRefresh;
  }

  private async ensureValidToken(): Promise<void> {
    if (Date.now() >= this.expiresAt - 60000) {
      const newTokens = await refreshAccessToken(this.refreshToken, this.keystring);
      this.accessToken = newTokens.access_token;
      this.refreshToken = newTokens.refresh_token;
      this.expiresAt = newTokens.expires_at;
      this.onTokenRefresh?.(newTokens);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { body?: any; params?: Record<string, string> }
  ): Promise<T> {
    return rateLimiter.execute(async () => {
      await this.ensureValidToken();

      let url = `${ETSY_API_BASE}${path}`;
      if (options?.params) {
        const searchParams = new URLSearchParams(options.params);
        url += `?${searchParams.toString()}`;
      }

      // x-api-key format per Etsy docs: keystring:shared_secret
      const headers: Record<string, string> = {
        'x-api-key': `${this.keystring}:${this.sharedSecret}`,
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      };

      let retries = 0;
      const maxRetries = 3;

      while (retries <= maxRetries) {
        try {
          const response = await fetch(url, {
            method,
            headers,
            body: options?.body ? JSON.stringify(options.body) : undefined,
          });

          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('retry-after') || '5', 10);
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            retries++;
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new EtsyAPIError(response.status, errorText, path);
          }

          if (response.status === 204) return undefined as T;
          return await response.json() as T;
        } catch (error) {
          if (error instanceof EtsyAPIError && error.status === 429 && retries < maxRetries) {
            retries++;
            await new Promise(r => setTimeout(r, Math.pow(2, retries) * 1000));
            continue;
          }
          throw error;
        }
      }

      throw new Error(`Max retries exceeded for ${path}`);
    });
  }

  // ---- Shop Endpoints ----
  async getShop(shopName: string) {
    return this.request<any>('GET', `/application/shops/${shopName}`);
  }

  async getShopReceipts(shopId: number, params?: { limit?: number; offset?: number }) {
    const p: Record<string, string> = {};
    if (params?.limit) p.limit = String(params.limit);
    if (params?.offset) p.offset = String(params.offset);
    return this.request<any>('GET', `/application/shops/${shopId}/receipts`, { params: p });
  }

  // ---- Listing Endpoints ----
  async getListings(shopId: number, params?: { limit?: number; offset?: number; state?: string }) {
    const p: Record<string, string> = {};
    if (params?.limit) p.limit = String(params.limit);
    if (params?.offset) p.offset = String(params.offset);
    if (params?.state) p.state = params.state;
    return this.request<any>('GET', `/application/shops/${shopId}/listings`, { params: p });
  }

  async getListing(listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}`);
  }

  async getListingImages(listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}/images`);
  }

  async getListingInventory(listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}/inventory`);
  }

  async updateListing(listingId: number, data: any) {
    return this.request<any>('PUT', `/application/listings/${listingId}`, { body: data });
  }

  async updateListingInventory(listingId: number, data: any) {
    return this.request<any>('PUT', `/application/listings/${listingId}/inventory`, { body: data });
  }

  // ---- Transaction Endpoints ----
  async getShopTransactions(shopId: number, params?: { limit?: number; offset?: number }) {
    const p: Record<string, string> = {};
    if (params?.limit) p.limit = String(params.limit);
    if (params?.offset) p.offset = String(params.offset);
    return this.request<any>('GET', `/application/shops/${shopId}/transactions`, { params: p });
  }

  // ---- Taxonomy ----
  async getTaxonomyCategories() {
    return this.request<any>('GET', `/application/seller-taxonomy/nodes`);
  }

  // ---- Marketplace Search ----
  async searchListings(params: { search_term: string; limit?: number; offset?: number; sort_on?: string }) {
    const p: Record<string, string> = { search_term: params.search_term };
    if (params.limit) p.limit = String(params.limit);
    if (params.offset) p.offset = String(params.offset);
    if (params.sort_on) p.sort_on = params.sort_on;
    return this.request<any>('GET', `/application/listings/active`, { params: p });
  }
}

// ---- Error Class ----
export class EtsyAPIError extends Error {
  status: number;
  endpoint: string;
  
  constructor(status: number, message: string, endpoint: string) {
    super(`Etsy API Error (${status}): ${message}`);
    this.status = status;
    this.endpoint = endpoint;
  }
}

// ---- Storage Helpers ----
const OAUTH_STATE_KEY = 'etsy_oauth_state';
const TOKENS_KEY = 'etsy_tokens';

export function saveOAuthState(state: EtsyOAuthState): void {
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(state));
}

export function getOAuthState(): EtsyOAuthState | null {
  const stored = sessionStorage.getItem(OAUTH_STATE_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
}

export function saveTokens(tokens: EtsyOAuthTokens): void {
  sessionStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export function getTokens(): EtsyOAuthTokens | null {
  const stored = sessionStorage.getItem(TOKENS_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function clearTokens(): void {
  sessionStorage.removeItem(TOKENS_KEY);
}

// Legacy alias for compatibility
export const saveDemoTokens = saveTokens;
export const getDemoTokens = getTokens;
export const clearDemoTokens = clearTokens;
