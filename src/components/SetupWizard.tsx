import { useState } from 'react';
import { Sparkles, ArrowRight, Store, Database, Key, Brain, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { saveEtsyConfig, getEtsyConfig } from '../lib/etsy/connection';

interface SetupWizardProps {
  onComplete: () => void;
}

export function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [keystring, setKeystring] = useState('');
  const [sharedSecret, setSharedSecret] = useState('');
  const [shopName, setShopName] = useState('StylinSoulMetalArt');
  const [redirectUri, setRedirectUri] = useState(typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const totalSteps = 7;

  const steps = [
    { title: 'Database', icon: Database, desc: 'Configure your database connection' },
    { title: 'Etsy API', icon: Key, desc: 'Enter your Etsy API credentials' },
    { title: 'Connect Etsy', icon: Store, desc: 'Authorize your Etsy shop' },
    { title: 'Verify Shop', icon: CheckCircle2, desc: 'Confirm StylinSoulMetalArt' },
    { title: 'Configure AI', icon: Brain, desc: 'Set up AI provider for optimization' },
    { title: 'Initial Sync', icon: RefreshCw, desc: 'Sync your listings and data' },
    { title: 'Dashboard', icon: Sparkles, desc: 'Ready to go!' },
  ];

  const handleSaveAndContinue = () => {
    if (step === 2) {
      // Save Etsy configuration
      if (!keystring.trim()) {
        alert('Etsy Keystring is required to continue');
        return;
      }
      saveEtsyConfig({
        keystring: keystring.trim(),
        sharedSecret: sharedSecret.trim(),
        redirectUri: redirectUri.trim(),
        shopName: shopName.trim(),
      });
    }
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">StylinSoul Metal Art</h1>
          <p className="text-gray-400">Etsy Intelligence & Optimization Platform</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i + 1 < step ? 'bg-green-500 text-white' :
                i + 1 === step ? 'bg-amber-500 text-white ring-4 ring-amber-500/20' :
                'bg-gray-700 text-gray-400'
              }`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-green-500' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              {(() => { const Icon = steps[step - 1].icon; return <Icon className="w-6 h-6 text-amber-600" />; })()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Step {step}: {steps[step - 1].title}</h2>
              <p className="text-sm text-gray-500">{steps[step - 1].desc}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Your database will store listings, research data, and optimization history.</p>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">Database Configuration</p>
                  <p className="text-xs text-blue-600 mt-1">Set DATABASE_URL in your .env.local file</p>
                  <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-2 block text-blue-700">
                    DATABASE_URL=postgresql://user:pass@localhost:5432/stylinsoul
                  </code>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> This SPA requires a Next.js backend for database operations. 
                    Configure your server-side API routes for full functionality.
                  </p>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Register your app at{' '}
                  <a href="https://www.etsy.com/developers" className="text-amber-600 underline" target="_blank">
                    etsy.com/developers
                  </a>
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Etsy Keystring (API Key) *</label>
                  <input
                    type="text"
                    value={keystring}
                    onChange={(e) => setKeystring(e.target.value)}
                    placeholder="Enter your Etsy API keystring"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <label className="text-xs font-medium text-gray-700">Shared Secret *</label>
                  <input
                    type="password"
                    value={sharedSecret}
                    onChange={(e) => setSharedSecret(e.target.value)}
                    placeholder="Enter your Etsy shared secret"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <label className="text-xs font-medium text-gray-700">Redirect URI</label>
                  <input
                    type="text"
                    value={redirectUri}
                    onChange={(e) => setRedirectUri(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <label className="text-xs font-medium text-gray-700">Shop Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] text-gray-500">Required scopes: listings_r, listings_w, transactions_r, shops_r, shops_w</p>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Click below to authorize your Etsy shop. You'll be redirected to Etsy to grant permissions.</p>
                {getEtsyConfig() ? (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-800 font-medium">Configuration saved ✓</p>
                    <p className="text-xs text-green-700 mt-1">Shop: {shopName}</p>
                    <p className="text-xs text-green-700">Redirect: {redirectUri}</p>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-xs text-red-800 font-medium">⚠️ Configuration not saved</p>
                    <p className="text-xs text-red-700 mt-1">Go back and enter your Etsy API credentials first.</p>
                  </div>
                )}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>Important:</strong> In production, clicking "Authorize" redirects to Etsy's OAuth page.
                    The token exchange happens server-side via /api/auth/etsy/callback.
                    This SPA demonstrates the flow; full implementation requires the Next.js backend.
                  </p>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600">
                    After OAuth callback, the app will verify:
                  </p>
                  <ul className="text-xs text-gray-600 mt-2 space-y-1 ml-4">
                    <li>• Shop name matches: <strong>{shopName}</strong></li>
                    <li>• Shop ID is resolved from API</li>
                    <li>• All required scopes are granted</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    If the connected shop doesn't match {shopName}, you'll see an error and must reconnect.
                  </p>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Configure your AI provider for listing optimization, keyword research, and niche discovery.</p>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">AI Provider</label>
                  <select className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option>Qwen (OpenAI-compatible)</option>
                    <option>OpenAI</option>
                    <option>Custom Endpoint</option>
                  </select>
                  <label className="text-xs font-medium text-gray-700">API Key</label>
                  <input type="password" placeholder="AI_API_KEY (optional - app works without it)" className="w-full px-3 py-2 border rounded-lg text-sm" />
                  <label className="text-xs font-medium text-gray-700">Model</label>
                  <input type="text" defaultValue="qwen-plus" className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <p className="text-xs text-gray-500">AI is optional. The app uses built-in heuristics when no AI provider is configured.</p>
              </div>
            )}
            {step === 6 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Sync your listings, orders, and shop data from Etsy.</p>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-xs text-gray-500 mb-2">Sync will:</p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4">
                    <li>• Fetch ALL listings with pagination (active, draft, inactive, sold_out, expired)</li>
                    <li>• Fetch recent orders/receipts</li>
                    <li>• Store data in database</li>
                    <li>• Calculate SEO scores for each listing</li>
                  </ul>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-800">
                    Complete the setup to access the dashboard. You can sync from the sidebar at any time.
                  </p>
                </div>
              </div>
            )}
            {step === 7 && (
              <div className="space-y-3 text-center py-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Setup Complete!</h3>
                <p className="text-sm text-gray-500">
                  Your configuration is saved. Go to the dashboard and click "Sync Etsy" to import your real listings.
                </p>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-left mt-4">
                  <p className="text-xs text-blue-800 font-medium">Next Steps:</p>
                  <ol className="text-xs text-blue-700 mt-1 space-y-1 ml-4 list-decimal">
                    <li>Go to Dashboard</li>
                    <li>Click "Sync Etsy" in the sidebar</li>
                    <li>Check Diagnostics if any issues occur</li>
                    <li>Your real Etsy listings will appear</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30"
            >
              Back
            </button>
            {step < totalSteps ? (
              <button
                onClick={handleSaveAndContinue}
                className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
