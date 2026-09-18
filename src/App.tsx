import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, List, Search, Target, Users, PenTool, Settings,
  TrendingUp, Bookmark, History, BarChart3, Zap, Menu,
  RefreshCw, LogOut, Store, Sparkles, AlertTriangle, Activity
} from 'lucide-react';
import type { NavPage, EtsyListing } from './types';
import { Dashboard } from './components/Dashboard';
import { ListingsPage } from './components/ListingsPage';
import { ListingAnalyzer } from './components/ListingAnalyzer';
import { KeywordResearch } from './components/KeywordResearch';
import { NicheFinder } from './components/NicheFinder';
import { CompetitorResearch } from './components/CompetitorResearch';
import { ListingBuilder } from './components/ListingBuilder';
import { BulkOptimizer } from './components/BulkOptimizer';
import { SalesIntelligence } from './components/SalesIntelligence';
import { SavedResearch } from './components/SavedResearch';
import { OptimizationHistory } from './components/OptimizationHistory';
import { SettingsPage } from './components/SettingsPage';
import { SetupWizard } from './components/SetupWizard';
import { EtsyDiagnostics } from './components/EtsyDiagnostics';
import {
  getConnectionState,
  getEtsyConfig,
  saveEtsyConfig,
  startOAuthFlow,
  handleOAuthCallback,
  verifyShop,
  performSync,
  fetchListingsForDashboard,
  disconnect as disconnectEtsy,
  type ConnectionState,
  type SyncResult,
} from './lib/etsy/connection';
import { getTokens } from './lib/etsy/client';

function App() {
  const [connState, setConnState] = useState<ConnectionState>(() => {
    try {
      return getConnectionState();
    } catch {
      return {
        status: 'disconnected',
        shopName: null,
        shopId: null,
        userId: null,
        scopes: [],
        tokenExpiresAt: null,
        lastApiCall: null,
        lastSyncAt: null,
        error: null,
      };
    }
  });
  
  const [listings, setListings] = useState<EtsyListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<EtsyListing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ stage: string; detail: string } | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load listings from real data source on mount
  useEffect(() => {
    const loadListings = async () => {
      try {
        const state = getConnectionState();
        const config = getEtsyConfig();
        const tokens = getTokens();

        if (state.status === 'connected' && config && tokens && state.shopId) {
          const realListings = await fetchListingsForDashboard(config, tokens);
          setListings(realListings);
        }
      } catch (err) {
        console.error('Failed to fetch listings:', err);
        setError(err instanceof Error ? err.message : 'Failed to load listings');
        setListings([]);
      }
    };

    loadListings();
  }, []);

  const handleConnect = useCallback(async () => {
    try {
      const config = getEtsyConfig();
      if (!config) {
        setError('Etsy API not configured. Please set your credentials in Settings first.');
        return;
      }
      if (!config.keystring || !config.sharedSecret) {
        setError('Both Keystring and Shared Secret are required. Please update Settings.');
        return;
      }
      
      // Validate redirect URI
      if (!config.redirectUri) {
        setError('Redirect URI is required. Please set it in Settings.');
        return;
      }
      if (!config.redirectUri.startsWith('https://')) {
        setError(`Redirect URI must use HTTPS. Current: ${config.redirectUri}. Please update in Settings.`);
        return;
      }

      const authUrl = await startOAuthFlow(config);
      
      // Show what we're sending for debugging
      console.log('Redirecting to Etsy OAuth:', authUrl);
      console.log('Redirect URI being used:', config.redirectUri);
      
      window.location.href = authUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start OAuth flow');
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectEtsy();
    setConnState(getConnectionState());
    setListings([]);
    setSelectedListing(null);
    setSyncResult(null);
    setError(null);
  }, []);

  const handleSync = useCallback(async () => {
    try {
      const config = getEtsyConfig();
      const tokens = getTokens();

      if (!config || !tokens) {
        setError('Not connected to Etsy. Please connect first.');
        return;
      }

      setIsSyncing(true);
      setSyncResult(null);
      setError(null);

      const result = await performSync(config, tokens, (stage, detail) => {
        setSyncProgress({ stage, detail });
      });

      setSyncResult(result);
      setConnState(getConnectionState());

      if (result.success && result.listings) {
        setListings(result.listings);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const stateParam = params.get('state');
        const errorParam = params.get('error');
        const errorDesc = params.get('error_description');

        if (errorParam) {
          setError(`Etsy authorization denied: ${errorParam}${errorDesc ? ' - ' + errorDesc : ''}`);
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }

        if (code && stateParam) {
          const cfg = getEtsyConfig();
          if (!cfg) {
            setError('No Etsy configuration found. Please configure API credentials in Settings.');
            window.history.replaceState({}, '', window.location.pathname);
            return;
          }

          window.history.replaceState({}, '', window.location.pathname);
          setError('Exchanging authorization code for access token...');
          
          const result = await handleOAuthCallback(code, stateParam, cfg);
          
          if (result.success && result.tokens) {
            const verifyResult = await verifyShop(cfg, result.tokens);
            if (verifyResult.success) {
              setConnState(getConnectionState());
              setError(null);
              handleSync();
            } else {
              setError(verifyResult.error || 'Shop verification failed');
            }
          } else {
            setError(result.error || 'Token exchange failed');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OAuth callback processing failed');
      }
    };

    handleCallback();
  }, []);

  const isConnected = connState.status === 'connected';
  const config = getEtsyConfig();

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onDisconnect={handleDisconnect}
          onSync={handleSync}
          isSyncing={isSyncing}
          isConnected={isConnected}
          lastSyncAt={connState.lastSyncAt}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <TopBar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onSync={handleSync}
            isSyncing={isSyncing}
            isConnected={isConnected}
            shopName={connState.shopName}
          />

          {isSyncing && syncProgress && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-amber-600 animate-spin" />
              <div>
                <p className="text-xs font-medium text-amber-800">{syncProgress.stage}</p>
                <p className="text-[10px] text-amber-600">{syncProgress.detail}</p>
              </div>
            </div>
          )}

          {syncResult && !isSyncing && (
            <div className={`border-b px-6 py-3 ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-3">
                {syncResult.success ? (
                  <span className="text-green-600 text-sm">✓</span>
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-xs font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    Sync {syncResult.success ? 'Completed' : 'Failed'}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {syncResult.stages.map((stage, i) => (
                      <p key={i} className="text-[10px] text-gray-600">
                        {stage.status === 'success' ? '✓' : stage.status === 'failed' ? '✗' : '○'} {stage.name}: {stage.detail}
                      </p>
                    ))}
                  </div>
                  {syncResult.errors.length > 0 && (
                    <div className="mt-2">
                      {syncResult.errors.map((err, i) => (
                        <p key={i} className="text-[10px] text-red-600">Error: {err}</p>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setSyncResult(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-xs text-red-800 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="text-xs text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          <div className="p-6">
            <Routes>
              <Route path="/" element={
                isConnected ? (
                  <Dashboard listings={listings} lastSyncAt={connState.lastSyncAt} />
                ) : (
                  <NotConnectedView config={config} onConnect={handleConnect} />
                )
              } />
              <Route path="/listings" element={
                isConnected ? (
                  <ListingsPage
                    listings={listings}
                    onSelectListing={setSelectedListing}
                    selectedListing={selectedListing}
                  />
                ) : (
                  <NotConnectedView config={config} onConnect={handleConnect} />
                )
              } />
              <Route path="/analyzer" element={<ListingAnalyzer listing={selectedListing} listings={listings} />} />
              <Route path="/keywords" element={<KeywordResearch />} />
              <Route path="/niches" element={<NicheFinder />} />
              <Route path="/competitors" element={<CompetitorResearch />} />
              <Route path="/builder" element={<ListingBuilder />} />
              <Route path="/bulk" element={<BulkOptimizer listings={listings} />} />
              <Route path="/sales" element={<SalesIntelligence listings={listings} />} />
              <Route path="/saved" element={<SavedResearch />} />
              <Route path="/history" element={<OptimizationHistory />} />
              <Route path="/settings" element={<SettingsPage onDisconnect={handleDisconnect} />} />
              <Route path="/diagnostics" element={<EtsyDiagnostics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}

function NotConnectedView({ config, onConnect }: { config: any; onConnect: () => void }) {
  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Connect Your Etsy Shop</h2>
        <p className="text-sm text-gray-500 mb-6">
          {config ? (
            <>Configure and authorize <strong>StylinSoulMetalArt</strong> to see your real listings, orders, and analytics.</>
          ) : (
            <>First, configure your Etsy API credentials in Settings, then connect your shop.</>
          )}
        </p>
        
        {!config && (
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4 text-left">
            <p className="text-xs text-amber-800 font-medium mb-1">Setup Required:</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>1. Go to Settings → Etsy API</li>
              <li>2. Enter your Etsy Keystring and Shared Secret</li>
              <li>3. Set Redirect URI</li>
              <li>4. Return here to connect</li>
            </ul>
          </div>
        )}

        <button
          onClick={onConnect}
          disabled={!config}
          className="px-6 py-3 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Connect Etsy Shop
        </button>

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">
            This application uses the Etsy Open API v3 with OAuth 2.0 + PKCE.
            All API calls happen server-side. No secrets are exposed to the browser.
          </p>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onDisconnect, onSync, isSyncing, isConnected, lastSyncAt }: {
  isOpen: boolean;
  onDisconnect: () => void;
  onSync: () => void;
  isSyncing: boolean;
  isConnected: boolean;
  lastSyncAt: number | null;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: { id: string; label: string; icon: any; path: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'listings', label: 'My Listings', icon: List, path: '/listings' },
    { id: 'analyzer', label: 'Listing Analyzer', icon: Search, path: '/analyzer' },
    { id: 'keywords', label: 'Keyword Research', icon: BarChart3, path: '/keywords' },
    { id: 'niches', label: 'Niche Finder', icon: Target, path: '/niches' },
    { id: 'competitors', label: 'Competitor Research', icon: Users, path: '/competitors' },
    { id: 'builder', label: 'Listing Builder', icon: PenTool, path: '/builder' },
    { id: 'bulk', label: 'Bulk Optimizer', icon: Zap, path: '/bulk' },
    { id: 'sales', label: 'Sales Intelligence', icon: TrendingUp, path: '/sales' },
    { id: 'saved', label: 'Saved Research', icon: Bookmark, path: '/saved' },
    { id: 'history', label: 'Optimization History', icon: History, path: '/history' },
    { id: 'diagnostics', label: 'Diagnostics', icon: Activity, path: '/diagnostics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        {isOpen && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold truncate">StylinSoul</h1>
            <p className="text-[10px] text-gray-400 truncate">Metal Art Intelligence</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-800 text-amber-400 border-r-2 border-amber-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-700 space-y-2">
        {isOpen && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-[10px] text-gray-400">
              {isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        )}
        {isOpen && lastSyncAt && (
          <p className="text-[10px] text-gray-500">
            Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
          </p>
        )}
        <button
          onClick={onSync}
          disabled={isSyncing || !isConnected}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isOpen && <span>{isSyncing ? 'Syncing...' : 'Sync Etsy'}</span>}
        </button>
        {isConnected && (
          <button
            onClick={onDisconnect}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3 h-3" />
            {isOpen && <span>Disconnect</span>}
          </button>
        )}
      </div>
    </aside>
  );
}

function TopBar({ onMenuToggle, onSync, isSyncing, isConnected, shopName }: {
  onMenuToggle: () => void;
  onSync: () => void;
  isSyncing: boolean;
  isConnected: boolean;
  shopName: string | null;
}) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-1 hover:bg-gray-100 rounded">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">
            {shopName || 'StylinSoulMetalArt'}
          </span>
          <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSync}
          disabled={isSyncing || !isConnected}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </header>
  );
}

export default App;
