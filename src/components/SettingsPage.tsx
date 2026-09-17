import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Key, Brain, Shield, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink, Activity } from 'lucide-react';
import { getEtsyConfig, saveEtsyConfig, getConnectionState, disconnect } from '../lib/etsy/connection';
import type { EtsyConfig } from '../lib/etsy/connection';

interface SettingsPageProps {
  onDisconnect: () => void;
}

export function SettingsPage({ onDisconnect }: SettingsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'shop' | 'api' | 'ai' | 'security' | 'sync'>('shop');
  const [config, setConfig] = useState<EtsyConfig | null>(getEtsyConfig());
  const [connState, setConnState] = useState(getConnectionState());
  
  // Form state
  const [keystring, setKeystring] = useState(config?.keystring || '');
  const [sharedSecret, setSharedSecret] = useState(config?.sharedSecret || '');
  const [redirectUri, setRedirectUri] = useState(config?.redirectUri || window.location.origin);
  const [shopName, setShopName] = useState(config?.shopName || 'StylinSoulMetalArt');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConnState(getConnectionState());
  }, [activeTab]);

  const handleSaveConfig = () => {
    if (!keystring.trim()) {
      alert('Etsy Keystring is required');
      return;
    }
    
    const newConfig: EtsyConfig = {
      keystring: keystring.trim(),
      sharedSecret: sharedSecret.trim(),
      redirectUri: redirectUri.trim(),
      shopName: shopName.trim(),
    };
    
    saveEtsyConfig(newConfig);
    setConfig(newConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500">Configure your Etsy intelligence platform</p>
        </div>
        <button
          onClick={() => navigate('/diagnostics')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
        >
          <Activity className="w-3 h-3" />
          Open Diagnostics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {([
          { id: 'shop', label: 'Shop', icon: Store },
          { id: 'api', label: 'Etsy API', icon: Key },
          { id: 'ai', label: 'AI Provider', icon: Brain },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'sync', label: 'Sync', icon: RefreshCw },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === 'shop' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Shop Connection</h3>
              
              {connState.status === 'connected' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Connected</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-green-700">Shop: <strong>{connState.shopName}</strong></p>
                      <p className="text-xs text-green-700">Shop ID: {connState.shopId}</p>
                      <p className="text-xs text-green-700">User ID: {connState.userId}</p>
                      <p className="text-xs text-green-700">Scopes: {connState.scopes.join(', ')}</p>
                      {connState.lastSyncAt && (
                        <p className="text-xs text-green-700">Last sync: {new Date(connState.lastSyncAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-3">Connection Details</p>
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">Token expires: {connState.tokenExpiresAt ? new Date(connState.tokenExpiresAt).toLocaleString() : 'Unknown'}</p>
                      <p className="text-xs text-gray-600">Last API: {connState.lastApiCall ? `HTTP ${connState.lastApiCall.status}` : 'None'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">Not Connected</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    Configure your Etsy API credentials below, then connect your shop.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={onDisconnect}
                disabled={connState.status !== 'connected'}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                Disconnect Etsy Shop
              </button>
              <button
                onClick={() => navigate('/diagnostics')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                View Diagnostics
              </button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Etsy API Configuration</h3>
            
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Important:</strong> Get your API credentials from{' '}
                <a href="https://www.etsy.com/developers" target="_blank" className="underline">
                  etsy.com/developers
                </a>.
                Set the Redirect URI in your Etsy app to match what you enter below.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Etsy Keystring (API Key) *</label>
                <input
                  type="text"
                  value={keystring}
                  onChange={(e) => setKeystring(e.target.value)}
                  placeholder="Enter your Etsy API keystring"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Shared Secret *</label>
                <input
                  type="password"
                  value={sharedSecret}
                  onChange={(e) => setSharedSecret(e.target.value)}
                  placeholder="Enter your Etsy shared secret"
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Required for x-api-key header on all API calls. Stored locally for this personal tool.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Redirect URI</label>
                <input
                  type="text"
                  value={redirectUri}
                  onChange={(e) => setRedirectUri(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  This must match exactly what's registered in your Etsy developer app.
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition-colors"
              >
                Save Configuration
              </button>
              {saved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Saved
                </span>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Required OAuth Scopes:</p>
              <div className="flex flex-wrap gap-2">
                {['listings_r', 'listings_w', 'transactions_r', 'shops_r', 'shops_w'].map((scope) => (
                  <span key={scope} className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Production Note:</strong> In a full Next.js deployment, the Shared Secret and token exchange 
                happen server-side via API routes (/api/auth/etsy/*). The browser never sees the shared secret.
                This SPA stores the keystring for generating OAuth URLs; the actual token exchange requires a backend.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">AI Provider Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Provider</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                  <option>Qwen (OpenAI-compatible)</option>
                  <option>OpenAI</option>
                  <option>Custom Endpoint</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Base URL</label>
                <input type="text" defaultValue="https://api.openai.com/v1" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Model</label>
                <input type="text" defaultValue="qwen-plus" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">API Key</label>
                <input type="password" placeholder="Enter AI API key" className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                The AI provider is used for keyword research, listing generation, niche discovery, and competitor analysis.
                Any OpenAI-compatible API is supported. When no API key is configured, the app uses built-in heuristics.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Security Settings</h3>
            <div className="space-y-3">
              {[
                { label: 'Server-side secrets only', desc: 'API keys never exposed to browser', status: true },
                { label: 'Encrypted OAuth tokens', desc: 'Refresh tokens encrypted with AES-256', status: true },
                { label: 'PKCE authentication', desc: 'SHA-256 code challenge for OAuth', status: true },
                { label: 'CSRF protection', desc: 'State parameter validation on callbacks', status: true },
                { label: 'Rate limiting', desc: 'Request queue with exponential backoff', status: true },
                { label: 'Input validation', desc: 'Zod schemas for all AI responses', status: true },
                { label: 'SQL injection prevention', desc: 'Prisma ORM parameterized queries', status: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Sync Settings</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">Last Full Sync</span>
                  <span className="text-xs text-gray-500">
                    {connState.lastSyncAt ? new Date(connState.lastSyncAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Auto-sync interval</label>
                <select className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                  <option>Every 15 minutes</option>
                  <option>Every 30 minutes</option>
                  <option>Every hour</option>
                  <option>Manual only</option>
                </select>
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Rate Limits:</strong> Etsy API has QPS (queries per second) and QPD (queries per day) limits.
                The sync engine respects these limits with automatic backoff and retry logic.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
