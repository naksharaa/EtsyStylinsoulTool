import { useState } from 'react';
import { Settings as SettingsIcon, Store, Key, Brain, Shield, Database, RefreshCw, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';

interface SettingsPageProps {
  onDisconnect: () => void;
}

export function SettingsPage({ onDisconnect }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'shop' | 'api' | 'ai' | 'security' | 'sync'>('shop');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Configure your Etsy intelligence platform</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Connected</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-green-700">Shop: <strong>StylinSoulMetalArt</strong></p>
                    <p className="text-xs text-green-700">Shop ID: 12345</p>
                    <p className="text-xs text-green-700">Currency: USD</p>
                    <p className="text-xs text-green-700">Connected: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">Etsy API Scopes Granted:</p>
                  <div className="space-y-1">
                    {['listings_r', 'listings_w', 'transactions_r', 'shops_r', 'shops_w'].map((scope) => (
                      <div key={scope} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-gray-600 font-mono">{scope}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
              >
                Disconnect Etsy Shop
              </button>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Etsy API Configuration</h3>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                API credentials are stored in environment variables and never exposed to the browser.
                All Etsy API calls happen server-side.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-700">Etsy Keystring</label>
                <input type="password" value="••••••••••••••••" readOnly className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Shared Secret</label>
                <input type="password" value="••••••••••••••••" readOnly className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Redirect URI</label>
                <input type="text" value="http://localhost:3000/api/auth/etsy/callback" readOnly className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-gray-50" />
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Note:</strong> To update API credentials, edit your .env.local file and restart the application.
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
                Any OpenAI-compatible API is supported.
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
                  <span className="text-xs text-gray-500">{new Date().toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{10}</p>
                    <p className="text-xs text-gray-500">Listings</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{5}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{0}</p>
                    <p className="text-xs text-gray-500">Errors</p>
                  </div>
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
              <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 flex items-center gap-2">
                <RefreshCw className="w-3 h-3" /> Sync Now
              </button>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Rate Limits:</strong> Etsy API has QPS (queries per second) and QPD (queries per day) limits.
                The sync engine respects these limits with automatic backoff.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
