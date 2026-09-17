// ============================================
// Etsy Open API v3 Client
// ============================================
// All Etsy API calls must happen server-side
// This module handles OAuth, token refresh, rate limiting

import type { EtsyOAuthTokens, EtsyOAuthState } from '../../types';

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

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

// ---- OAuth URL Builder ----
export function buildAuthorizationUrl(keystring: string, redirectUri: string, codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: keystring,
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
    scope: 'listings_r listings_w transactions_r shops_r shops_w',
  });
  return `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

// ---- Token Exchange ----
export async function exchangeCodeForTokens(
  code: string,
  keystring: string,
  redirectUri: string,
  codeVerifier: string
): Promise<EtsyOAuthTokens> {
  const response = await fetch(`${ETSY_API_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': keystring,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
      client_id: keystring,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
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
  keystring: string,
  redirectUri: string
): Promise<EtsyOAuthTokens> {
  const response = await fetch(`${ETSY_API_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': keystring,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: redirectUri,
      client_id: keystring,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
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
  private minInterval = 100; // 100ms between requests (10 QPS safe)

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
export class EtsyClient {
  private keystring: string;
  private accessToken: string;
  private refreshToken: string;
  private expiresAt: number;
  private redirectUri: string;
  private onTokenRefresh?: (tokens: EtsyOAuthTokens) => void;

  constructor(
    keystring: string,
    tokens: EtsyOAuthTokens,
    redirectUri: string,
    onTokenRefresh?: (tokens: EtsyOAuthTokens) => void
  ) {
    this.keystring = keystring;
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    this.expiresAt = tokens.expires_at;
    this.redirectUri = redirectUri;
    this.onTokenRefresh = onTokenRefresh;
  }

  private async ensureValidToken(): Promise<void> {
    if (Date.now() >= this.expiresAt - 60000) { // 1 minute buffer
      const newTokens = await refreshAccessToken(this.refreshToken, this.keystring, this.redirectUri);
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

      const headers: Record<string, string> = {
        'x-api-key': this.keystring,
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
    return this.request<any>('GET', `/application/shops/${shopId}/receipts`, { params: params as any });
  }

  // ---- Listing Endpoints ----
  async getListings(shopId: number, params?: { limit?: number; offset?: number; state?: string }) {
    return this.request<any>('GET', `/application/shops/${shopId}/listings`, { params: params as any });
  }

  async getListing(shopId: number, listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}`);
  }

  async getListingImages(listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}/images`);
  }

  async getListingInventory(listingId: number) {
    return this.request<any>('GET', `/application/listings/${listingId}/inventory`);
  }

  async createListing(shopId: number, data: any) {
    return this.request<any>('POST', `/application/shops/${shopId}/listings`, { body: data });
  }

  async updateListing(listingId: number, data: any) {
    return this.request<any>('PUT', `/application/listings/${listingId}`, { body: data });
  }

  async updateListingInventory(listingId: number, data: any) {
    return this.request<any>('PUT', `/application/listings/${listingId}/inventory`, { body: data });
  }

  async deleteListing(listingId: number) {
    return this.request<any>('DELETE', `/application/listings/${listingId}`);
  }

  // ---- Transaction Endpoints ----
  async getShopTransactions(shopId: number, params?: { limit?: number; offset?: number }) {
    return this.request<any>('GET', `/application/shops/${shopId}/transactions`, { params: params as any });
  }

  async getListingTransactions(listingId: number, params?: { limit?: number; offset?: number }) {
    return this.request<any>('GET', `/application/listings/${listingId}/transactions`, { params: params as any });
  }

  // ---- Taxonomy Endpoints ----
  async getTaxonomyCategories() {
    return this.request<any>('GET', `/application/seller-taxonomy/nodes`);
  }

  async getTaxonomyProperties(taxonomyId: number) {
    return this.request<any>('GET', `/application/seller-taxonomy/nodes/${taxonomyId}/properties`);
  }

  // ---- Marketplace Search (public) ----
  async searchListings(params: { search_term: string; limit?: number; offset?: number; sort_on?: string }) {
    return this.request<any>('GET', `/application/listings/active`, { params: params as any });
  }

  // ---- Shipping Endpoints ----
  async getShippingProfiles(shopId: number) {
    return this.request<any>('GET', `/application/shops/${shopId}/shipping-profiles`);
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

// ---- Token Storage (Server-side only) ----
// In production, tokens are encrypted and stored in database
// This is a client-side simulation for the demo
const TOKEN_STORAGE_KEY = 'etsy_oauth_state';

export function saveOAuthState(state: EtsyOAuthState): void {
  sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(state));
}

export function getOAuthState(): EtsyOAuthState | null {
  const stored = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

// ---- Token Storage for Demo ----
const DEMO_TOKEN_KEY = 'etsy_demo_tokens';

export function saveDemoTokens(tokens: EtsyOAuthTokens): void {
  sessionStorage.setItem(DEMO_TOKEN_KEY, JSON.stringify(tokens));
}

export function getDemoTokens(): EtsyOAuthTokens | null {
  const stored = sessionStorage.getItem(DEMO_TOKEN_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearDemoTokens(): void {
  sessionStorage.removeItem(DEMO_TOKEN_KEY);
}
