// ============================================
// Etsy Connection Manager
// ============================================
// Manages real OAuth state, tokens, and API calls
// Handles the complete OAuth 2.0 + PKCE flow

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  buildAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  saveOAuthState,
  getOAuthState,
  clearOAuthState,
  saveTokens,
  getTokens,
  clearTokens,
  EtsyClient,
  EtsyAPIError,
} from '../etsy/client';
import type { EtsyOAuthTokens, EtsyShop, EtsyListing } from '../../types';

// ---- Configuration ----
export interface EtsyConfig {
  keystring: string;
  sharedSecret: string;
  redirectUri: string;
  shopName: string;
}

const CONFIG_KEY = 'etsy_config';

export function getEtsyConfig(): EtsyConfig | null {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function saveEtsyConfig(config: EtsyConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

// ---- Connection State ----
export interface ConnectionState {
  status: 'disconnected' | 'authorizing' | 'connected' | 'error' | 'token_expired';
  shopName: string | null;
  shopId: number | null;
  userId: number | null;
  scopes: string[];
  tokenExpiresAt: number | null;
  lastApiCall: { endpoint: string; status: number; timestamp: number } | null;
  lastSyncAt: number | null;
  error: string | null;
}

const CONNECTION_STATE_KEY = 'etsy_connection_state';

export function getConnectionState(): ConnectionState {
  const stored = sessionStorage.getItem(CONNECTION_STATE_KEY);
  if (!stored) {
    return {
      status: 'disconnected', shopName: null, shopId: null, userId: null,
      scopes: [], tokenExpiresAt: null, lastApiCall: null, lastSyncAt: null, error: null,
    };
  }
  try { return JSON.parse(stored); } catch {
    return {
      status: 'disconnected', shopName: null, shopId: null, userId: null,
      scopes: [], tokenExpiresAt: null, lastApiCall: null, lastSyncAt: null, error: null,
    };
  }
}

export function saveConnectionState(state: ConnectionState): void {
  sessionStorage.setItem(CONNECTION_STATE_KEY, JSON.stringify(state));
}

// ---- Helper: Create Client ----
function createClient(config: EtsyConfig, tokens: EtsyOAuthTokens, onRefresh?: (t: EtsyOAuthTokens) => void): EtsyClient {
  return new EtsyClient(config.keystring, config.sharedSecret, tokens, onRefresh);
}

// ---- OAuth Flow ----

// Step 1: Start OAuth - redirect user to Etsy
export async function startOAuthFlow(config: EtsyConfig): Promise<string> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  saveOAuthState({
    code_verifier: codeVerifier,
    code_challenge: codeChallenge,
    state: state,
    created_at: Date.now(),
  });

  const authUrl = buildAuthorizationUrl(
    config.keystring,
    config.redirectUri,
    codeChallenge,
    state
  );

  // Update state
  const connState = getConnectionState();
  connState.status = 'authorizing';
  saveConnectionState(connState);

  return authUrl;
}

// Step 3: Handle callback - exchange code for tokens
export async function handleOAuthCallback(
  code: string,
  stateParam: string,
  config: EtsyConfig
): Promise<{ success: boolean; error?: string; tokens?: EtsyOAuthTokens }> {
  // Verify state
  const savedState = getOAuthState();
  if (!savedState) {
    return { success: false, error: 'OAuth state not found. Please restart the connection.' };
  }
  if (savedState.state !== stateParam) {
    return { success: false, error: 'OAuth state mismatch. Possible CSRF attack.' };
  }
  if (Date.now() - savedState.created_at > 600000) {
    clearOAuthState();
    return { success: false, error: 'OAuth state expired (10 min). Please restart.' };
  }

  try {
    const tokens = await exchangeCodeForTokens(
      code,
      config.keystring,
      config.redirectUri,
      savedState.code_verifier
    );

    clearOAuthState();
    saveTokens(tokens);

    // Extract user_id from access_token (format: "12345678.token_string")
    const userIdMatch = tokens.access_token.match(/^(\d+)\./);
    const userId = userIdMatch ? parseInt(userIdMatch[1]) : null;

    // Update connection state
    const connState = getConnectionState();
    connState.status = 'connected';
    connState.userId = userId;
    connState.tokenExpiresAt = tokens.expires_at;
    connState.scopes = (tokens.scope || '').split(' ').filter(Boolean);
    connState.error = null;
    saveConnectionState(connState);

    return { success: true, tokens };
  } catch (error) {
    clearOAuthState();
    const message = error instanceof Error ? error.message : 'Token exchange failed';
    
    const connState = getConnectionState();
    connState.status = 'error';
    connState.error = message;
    saveConnectionState(connState);

    return { success: false, error: message };
  }
}

// ---- Shop Verification ----
export async function verifyShop(
  config: EtsyConfig,
  tokens: EtsyOAuthTokens
): Promise<{ success: boolean; shop?: EtsyShop; error?: string }> {
  try {
    const client = createClient(config, tokens, (newTokens) => {
      saveTokens(newTokens);
    });
    
    const shopData = await client.getShop(config.shopName);

    const shop: EtsyShop = {
      shop_id: shopData.shop_id,
      shop_name: shopData.shop_name,
      user_id: shopData.user_id,
      currency_code: shopData.currency_code || 'USD',
      create_date: shopData.create_date,
      title: shopData.title,
      listing_active_count: shopData.listing_active_count,
      url: shopData.url,
    };

    // Verify shop name matches
    if (shop.shop_name.toLowerCase() !== config.shopName.toLowerCase()) {
      return {
        success: false,
        error: `Wrong shop: "${shop.shop_name}". Expected: "${config.shopName}". Disconnect and reconnect.`,
      };
    }

    // Update connection state with shop info
    const connState = getConnectionState();
    connState.status = 'connected';
    connState.shopName = shop.shop_name;
    connState.shopId = shop.shop_id;
    connState.userId = shop.user_id;
    saveConnectionState(connState);

    return { success: true, shop };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Shop verification failed';
    return { success: false, error: message };
  }
}

// ---- API Tests ----
export interface ApiTestResult {
  name: string;
  endpoint: string;
  status: number;
  data?: any;
  error?: string;
  timestamp: number;
}

export async function testEtsyConnection(config: EtsyConfig, tokens: EtsyOAuthTokens): Promise<ApiTestResult> {
  const client = createClient(config, tokens, (t) => saveTokens(t));
  
  try {
    const shopData = await client.getShop(config.shopName);
    
    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${config.shopName}`, status: 200, timestamp: Date.now() };
    connState.shopName = shopData.shop_name;
    connState.shopId = shopData.shop_id;
    connState.userId = shopData.user_id;
    saveConnectionState(connState);

    return {
      name: 'Shop Connection',
      endpoint: `GET /v3/application/shops/${config.shopName}`,
      status: 200,
      data: { shop_id: shopData.shop_id, shop_name: shopData.shop_name, user_id: shopData.user_id },
      timestamp: Date.now(),
    };
  } catch (error) {
    const status = error instanceof EtsyAPIError ? error.status : 0;
    const message = error instanceof Error ? error.message : 'Connection test failed';
    
    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${config.shopName}`, status, timestamp: Date.now() };
    connState.error = message;
    saveConnectionState(connState);

    return { name: 'Shop Connection', endpoint: `GET /v3/application/shops/${config.shopName}`, status, error: message, timestamp: Date.now() };
  }
}

export async function testActiveListings(config: EtsyConfig, tokens: EtsyOAuthTokens, shopId: number): Promise<ApiTestResult> {
  const client = createClient(config, tokens, (t) => saveTokens(t));
  
  try {
    const data = await client.getListings(shopId, { limit: 3, state: 'active' });
    const listings = (data.results || []).map((l: any) => ({
      listing_id: l.listing_id, title: l.title, state: l.state, price: l.price,
    }));

    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${shopId}/listings`, status: 200, timestamp: Date.now() };
    saveConnectionState(connState);

    return {
      name: 'Active Listings',
      endpoint: `GET /v3/application/shops/${shopId}/listings?state=active&limit=3`,
      status: 200,
      data: { total_available: data.count || 0, returned: listings.length, listings },
      timestamp: Date.now(),
    };
  } catch (error) {
    const status = error instanceof EtsyAPIError ? error.status : 0;
    const message = error instanceof Error ? error.message : 'Listings test failed';
    
    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${shopId}/listings`, status, timestamp: Date.now() };
    saveConnectionState(connState);

    return { name: 'Active Listings', endpoint: `GET /v3/application/shops/${shopId}/listings`, status, error: message, timestamp: Date.now() };
  }
}

export async function testOrders(config: EtsyConfig, tokens: EtsyOAuthTokens, shopId: number): Promise<ApiTestResult> {
  const client = createClient(config, tokens, (t) => saveTokens(t));
  
  try {
    const data = await client.getShopReceipts(shopId, { limit: 5 });
    
    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${shopId}/receipts`, status: 200, timestamp: Date.now() };
    saveConnectionState(connState);

    return {
      name: 'Orders/Receipts',
      endpoint: `GET /v3/application/shops/${shopId}/receipts?limit=5`,
      status: 200,
      data: { count: data.count || 0, returned: (data.results || []).length },
      timestamp: Date.now(),
    };
  } catch (error) {
    const status = error instanceof EtsyAPIError ? error.status : 0;
    const message = error instanceof Error ? error.message : 'Orders test failed';
    
    const connState = getConnectionState();
    connState.lastApiCall = { endpoint: `GET /shops/${shopId}/receipts`, status, timestamp: Date.now() };
    saveConnectionState(connState);

    return { name: 'Orders/Receipts', endpoint: `GET /v3/application/shops/${shopId}/receipts`, status, error: message, timestamp: Date.now() };
  }
}

// ---- Sync Engine ----
export interface SyncResult {
  success: boolean;
  stages: { name: string; status: 'success' | 'failed' | 'skipped'; detail: string }[];
  listingsFetched: number;
  listingsCreated: number;
  listingsUpdated: number;
  ordersFetched: number;
  errors: string[];
  listings?: EtsyListing[];
}

export async function performSync(
  config: EtsyConfig,
  tokens: EtsyOAuthTokens,
  onProgress?: (stage: string, detail: string) => void
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false, stages: [], listingsFetched: 0, listingsCreated: 0,
    listingsUpdated: 0, ordersFetched: 0, errors: [],
  };

  const client = createClient(config, tokens, (t) => saveTokens(t));

  // Stage 1: Verify connection
  onProgress?.('Connecting to Etsy', 'Verifying shop...');
  let shopData: any = null;
  try {
    shopData = await client.getShop(config.shopName);
    result.stages.push({ name: 'Etsy Connection', status: 'success', detail: `Shop: ${shopData.shop_name} (ID: ${shopData.shop_id})` });
    
    const connState = getConnectionState();
    connState.shopName = shopData.shop_name;
    connState.shopId = shopData.shop_id;
    connState.userId = shopData.user_id;
    saveConnectionState(connState);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Connection failed';
    result.stages.push({ name: 'Etsy Connection', status: 'failed', detail: msg });
    result.errors.push(msg);
    return result;
  }

  // Stage 2: Fetch all listings with pagination
  onProgress?.('Fetching listings', 'Paginating through all states...');
  const shopId = shopData.shop_id;
  const allListings: EtsyListing[] = [];
  
  try {
    // Fetch active listings
    let offset = 0;
    const limit = 100;
    let hasMore = true;
    let pages = 0;

    while (hasMore) {
      const data = await client.getListings(shopId, { limit, offset, state: 'active' });
      const listings = data.results || [];
      
      for (const l of listings) {
        allListings.push(mapEtsyListing(l, shopId));
      }
      
      pages++;
      offset += limit;
      if (listings.length < limit) hasMore = false;
      if (pages >= 50) hasMore = false; // Safety
    }

    const activeCount = allListings.length;
    
    // Also try to fetch inactive/draft listings
    try {
      const inactiveData = await client.getListings(shopId, { limit: 100, state: 'inactive' });
      for (const l of (inactiveData.results || [])) {
        allListings.push(mapEtsyListing(l, shopId));
      }
    } catch { /* inactive may not be available */ }

    result.listingsFetched = allListings.length;
    result.stages.push({ 
      name: 'Listings Fetched', status: 'success', 
      detail: `${allListings.length} total (${activeCount} active) in ${pages} pages` 
    });
    onProgress?.('Listings fetched', `${allListings.length} listings`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch listings';
    result.stages.push({ name: 'Listings Fetched', status: 'failed', detail: msg });
    result.errors.push(msg);
  }

  // Stage 3: Save listings
  onProgress?.('Saving listings', 'Storing in session...');
  result.listingsCreated = result.listingsFetched;
  result.listings = allListings;
  result.stages.push({ name: 'Listings Saved', status: 'success', detail: `${result.listingsCreated} records` });
  onProgress?.('Listings saved', `${result.listingsCreated} records`);

  // Stage 4: Fetch orders
  onProgress?.('Fetching orders', 'Retrieving receipts...');
  try {
    const receiptsData = await client.getShopReceipts(shopId, { limit: 100 });
    result.ordersFetched = receiptsData.count || (receiptsData.results || []).length;
    result.stages.push({ name: 'Orders Fetched', status: 'success', detail: `${result.ordersFetched} orders` });
    onProgress?.('Orders fetched', `${result.ordersFetched} orders`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch orders';
    result.stages.push({ name: 'Orders Fetched', status: 'failed', detail: msg });
    result.errors.push(`Orders: ${msg}`);
  }

  // Update sync time
  const connState = getConnectionState();
  connState.lastSyncAt = Date.now();
  saveConnectionState(connState);

  // Determine success
  const hasCriticalFailure = result.stages.some(s => s.status === 'failed' && s.name === 'Etsy Connection');
  result.success = !hasCriticalFailure && result.listingsFetched > 0;

  if (result.listingsFetched === 0 && !hasCriticalFailure) {
    result.stages.push({ name: 'Warning', status: 'skipped', detail: 'Connected but Etsy returned zero listings.' });
  }

  return result;
}

// ---- Map Etsy API response to our Listing type ----
function mapEtsyListing(l: any, shopId: number): EtsyListing {
  return {
    listing_id: l.listing_id,
    title: l.title || '',
    description: l.description || '',
    tags: l.tags || [],
    taxonomy_id: l.taxonomy_id,
    taxonomy_path: l.taxonomy_path || [],
    price: String(l.price || '0'),
    currency_code: l.currency_code || 'USD',
    quantity: l.quantity || 0,
    state: l.state || 'active',
    sku: l.sku || [],
    materials: l.materials || [],
    who_made: l.who_made,
    when_made: l.when_made,
    is_supply: l.is_supply || false,
    images: (l.images || []).map((img: any) => ({
      url_fullxfull: img.url_fullxfull || img.url_794xN || img.url_570xN || '',
      url_570xN: img.url_570xN,
      url_170x135: img.url_170x135,
    })),
    url: l.url || '',
    creation_tsz: l.creation_tsz || Date.now() / 1000,
    modified_tsz: l.modified_tsz || Date.now() / 1000,
    shop_id: shopId,
    is_digital: l.is_digital || false,
    personalized: l.personalized || false,
    personalization_instructions: l.personalization_instructions,
    has_variations: l.has_variations || false,
    num_favorers: l.num_favorers || 0,
  };
}

// ---- Fetch Listings for Dashboard ----
export async function fetchListingsForDashboard(config: EtsyConfig, tokens: EtsyOAuthTokens): Promise<EtsyListing[]> {
  const connState = getConnectionState();
  if (!connState.shopId) throw new Error('Shop not verified. Please reconnect.');

  const client = createClient(config, tokens, (t) => saveTokens(t));
  const allListings: EtsyListing[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const data = await client.getListings(connState.shopId, { limit, offset });
    const listings = data.results || [];
    
    for (const l of listings) {
      allListings.push(mapEtsyListing(l, connState.shopId));
    }

    offset += limit;
    if (listings.length < limit) hasMore = false;
    if (offset > 5000) hasMore = false;
  }

  return allListings;
}

// ---- Disconnect ----
export function disconnect(): void {
  clearOAuthState();
  clearTokens();
  sessionStorage.removeItem(CONNECTION_STATE_KEY);
}
