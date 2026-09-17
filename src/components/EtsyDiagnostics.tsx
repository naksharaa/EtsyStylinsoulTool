import { useState, useEffect } from 'react';
import { 
  Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, 
  ExternalLink, RefreshCw, Database, Wifi, Clock, Key, Store
} from 'lucide-react';
import {
  getConnectionState,
  getEtsyConfig,
  testEtsyConnection,
  testActiveListings,
  testOrders,
  type ConnectionState,
  type ApiTestResult,
} from '../lib/etsy/connection';
import { getTokens } from '../lib/etsy/client';

export function EtsyDiagnostics() {
  const [connState, setConnState] = useState<ConnectionState>(getConnectionState());
  const [config, setConfig] = useState(getEtsyConfig());
  const [tokens, setTokens] = useState(getTokens());
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [isTesting, setIsTesting] = useState<string | null>(null);

  useEffect(() => {
    setConnState(getConnectionState());
    setConfig(getEtsyConfig());
    setTokens(getTokens());
  }, []);

  const runTest = async (testName: string) => {
    if (!tokens || !config) return;
    setIsTesting(testName);

    try {
      let result: ApiTestResult;

      switch (testName) {
        case 'connection':
          result = await testEtsyConnection(config, tokens);
          break;
        case 'listings':
          if (!connState.shopId) {
            result = {
              name: 'Active Listings',
              endpoint: 'N/A',
              status: 0,
              error: 'Shop ID not available. Run "Test Connection" first.',
              timestamp: Date.now(),
            };
          } else {
            result = await testActiveListings(config, tokens, connState.shopId);
          }
          break;
        case 'orders':
          if (!connState.shopId) {
            result = {
              name: 'Orders',
              endpoint: 'N/A',
              status: 0,
              error: 'Shop ID not available. Run "Test Connection" first.',
              timestamp: Date.now(),
            };
          } else {
            result = await testOrders(config, tokens, connState.shopId);
          }
          break;
        default:
          return;
      }

      setTestResults(prev => [result, ...prev.slice(0, 9)]);
      
      // Refresh connection state
      setConnState(getConnectionState());
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Test failed';
      setTestResults(prev => [{
        name: testName,
        endpoint: 'unknown',
        status: 0,
        error: msg,
        timestamp: Date.now(),
      }, ...prev.slice(0, 9)]);
    }

    setIsTesting(null);
  };

  const maskSecret = (value: string | null | undefined): string => {
    if (!value) return 'Not set';
    if (value.length <= 8) return '••••••••';
    return value.substring(0, 4) + '••••••••' + value.substring(value.length - 4);
  };

  const requiredScopes = ['listings_r', 'shops_r', 'transactions_r'];
  const optionalScopes = ['listings_w', 'shops_w'];
  const missingRequired = requiredScopes.filter(s => !connState.scopes.includes(s));
  const hasAllRequired = missingRequired.length === 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Etsy Integration Diagnostics</h1>
        <p className="text-sm text-gray-500">Debug your Etsy API connection end-to-end</p>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wifi className="w-4 h-4" /> Connection Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusRow
            label="Connection Status"
            value={connState.status}
            status={connState.status === 'connected' ? 'success' : connState.status === 'error' ? 'error' : 'warning'}
          />
          <StatusRow
            label="Connected Shop Name"
            value={connState.shopName || 'Not connected'}
            status={connState.shopName ? 'success' : 'warning'}
          />
          <StatusRow
            label="Etsy Shop ID"
            value={connState.shopId ? String(connState.shopId) : 'Not resolved'}
            status={connState.shopId ? 'success' : 'warning'}
          />
          <StatusRow
            label="Etsy User ID"
            value={connState.userId ? String(connState.userId) : 'Not resolved'}
            status={connState.userId ? 'success' : 'warning'}
          />
          <StatusRow
            label="Access Token"
            value={tokens ? maskSecret(tokens.access_token) : 'Not present'}
            status={tokens ? 'success' : 'error'}
          />
          <StatusRow
            label="Refresh Token"
            value={tokens?.refresh_token ? 'Present (masked)' : 'Not present'}
            status={tokens?.refresh_token ? 'success' : 'error'}
          />
          <StatusRow
            label="Token Expires At"
            value={connState.tokenExpiresAt ? new Date(connState.tokenExpiresAt).toLocaleString() : 'Unknown'}
            status={connState.tokenExpiresAt && connState.tokenExpiresAt > Date.now() ? 'success' : 'error'}
          />
          <StatusRow
            label="Last API Call"
            value={connState.lastApiCall ? `${connState.lastApiCall.endpoint} → ${connState.lastApiCall.status}` : 'None'}
            status={connState.lastApiCall?.status === 200 ? 'success' : connState.lastApiCall ? 'error' : 'warning'}
          />
          <StatusRow
            label="Last Sync"
            value={connState.lastSyncAt ? new Date(connState.lastSyncAt).toLocaleString() : 'Never'}
            status={connState.lastSyncAt ? 'success' : 'warning'}
          />
          <StatusRow
            label="Error"
            value={connState.error || 'None'}
            status={connState.error ? 'error' : 'success'}
          />
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Key className="w-4 h-4" /> Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusRow
            label="Etsy Keystring"
            value={config?.keystring ? maskSecret(config.keystring) : 'NOT CONFIGURED'}
            status={config?.keystring ? 'success' : 'error'}
          />
          <StatusRow
            label="Shared Secret"
            value={config?.sharedSecret ? '•••••••• (configured)' : 'NOT CONFIGURED'}
            status={config?.sharedSecret ? 'success' : 'error'}
          />
          <StatusRow
            label="Redirect URI"
            value={config?.redirectUri || 'NOT CONFIGURED'}
            status={config?.redirectUri ? 'success' : 'error'}
          />
          <StatusRow
            label="Expected Shop Name"
            value={config?.shopName || 'NOT CONFIGURED'}
            status={config?.shopName ? 'success' : 'error'}
          />
          <StatusRow
            label="Environment"
            value={typeof window !== 'undefined' ? window.location.origin : 'unknown'}
            status="info"
          />
        </div>
        {!config && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-800 font-medium">
              ⚠️ Etsy API is not configured. Set your credentials in the Settings page or .env.local file.
            </p>
          </div>
        )}
      </div>

      {/* OAuth Scopes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" /> OAuth Scopes
        </h2>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 mb-3">Required scopes for this application:</p>
          <div className="flex flex-wrap gap-2">
            {requiredScopes.map((scope) => (
              <span
                key={scope}
                className={`text-xs px-2 py-1 rounded-full font-mono ${
                  connState.scopes.includes(scope)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {connState.scopes.includes(scope) ? '✓' : '✗'} {scope}
              </span>
            ))}
            {optionalScopes.map((scope) => (
              <span
                key={scope}
                className={`text-xs px-2 py-1 rounded-full font-mono ${
                  connState.scopes.includes(scope)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {connState.scopes.includes(scope) ? '✓' : '○'} {scope} (optional)
              </span>
            ))}
          </div>
          {!hasAllRequired && connState.status === 'connected' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-800 font-medium">
                ⚠️ Missing required scopes: {missingRequired.join(', ')}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Reconnect Etsy — existing tokens cannot gain new scopes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* API Tests */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Live API Tests
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          These tests make REAL requests to the Etsy Open API v3. Results show actual HTTP responses.
        </p>
        
        {!tokens || !config ? (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-800">
              Cannot run API tests — no valid OAuth tokens or configuration. 
              Complete the Etsy connection flow first.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <TestButton
                label="Test Connection"
                onClick={() => runTest('connection')}
                isLoading={isTesting === 'connection'}
                disabled={!tokens || !config}
              />
              <TestButton
                label="Test Shop"
                onClick={() => runTest('connection')}
                isLoading={isTesting === 'connection'}
                disabled={!tokens || !config}
              />
              <TestButton
                label="Test Active Listings"
                onClick={() => runTest('listings')}
                isLoading={isTesting === 'listings'}
                disabled={!tokens || !config || !connState.shopId}
              />
              <TestButton
                label="Test Orders"
                onClick={() => runTest('orders')}
                isLoading={isTesting === 'orders'}
                disabled={!tokens || !config || !connState.shopId}
              />
            </div>

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {testResults.map((result, i) => (
                  <TestResultCard key={i} result={result} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shop Verification */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Store className="w-4 h-4" /> Shop Verification
        </h2>
        {connState.shopName ? (
          <div className="space-y-2">
            {connState.shopName.toLowerCase() === (config?.shopName || '').toLowerCase() ? (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">
                    Connected shop matches expected: <strong>{connState.shopName}</strong>
                  </p>
                </div>
                <p className="text-xs text-green-700 mt-1 ml-6">
                  Shop ID: {connState.shopId} | User ID: {connState.userId}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-800 font-medium">
                    WRONG SHOP CONNECTED
                  </p>
                </div>
                <p className="text-xs text-red-700 mt-1 ml-6">
                  Connected: "{connState.shopName}" | Expected: "{config?.shopName}"
                </p>
                <p className="text-xs text-red-700 mt-1 ml-6">
                  Disconnect and reconnect with the correct shop.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              Shop not verified. Connect Etsy to verify your shop identity.
            </p>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" /> Data Pipeline Status
        </h2>
        <div className="space-y-2">
          <PipelineStep
            step="1. Etsy OAuth"
            status={tokens ? 'success' : 'pending'}
            detail={tokens ? 'Tokens present' : 'No tokens — connect Etsy first'}
          />
          <PipelineStep
            step="2. Shop Verified"
            status={connState.shopId ? 'success' : 'pending'}
            detail={connState.shopId ? `Shop ID: ${connState.shopId}` : 'Shop not resolved'}
          />
          <PipelineStep
            step="3. API Calls Working"
            status={connState.lastApiCall?.status === 200 ? 'success' : connState.lastApiCall ? 'error' : 'pending'}
            detail={connState.lastApiCall ? `Last: HTTP ${connState.lastApiCall.status}` : 'No API calls made yet'}
          />
          <PipelineStep
            step="4. Data Synced"
            status={connState.lastSyncAt ? 'success' : 'pending'}
            detail={connState.lastSyncAt ? `Last sync: ${new Date(connState.lastSyncAt).toLocaleTimeString()}` : 'Never synced'}
          />
          <PipelineStep
            step="5. Dashboard Updated"
            status={connState.lastSyncAt ? 'success' : 'pending'}
            detail={connState.lastSyncAt ? 'Dashboard reading from synced data' : 'Dashboard has no data source'}
          />
        </div>
        
        {connState.error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-800 font-medium">Last Error:</p>
            <p className="text-xs text-red-700 mt-1 font-mono">{connState.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Helper Components ----

function StatusRow({ label, value, status }: { label: string; value: string; status: 'success' | 'error' | 'warning' | 'info' }) {
  const colors = {
    success: 'text-green-700',
    error: 'text-red-700',
    warning: 'text-amber-700',
    info: 'text-blue-700',
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium font-mono ${colors[status]}`}>{value}</span>
    </div>
  );
}

function TestButton({ label, onClick, isLoading, disabled }: {
  label: string; onClick: () => void; isLoading: boolean; disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
    >
      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
      {label}
    </button>
  );
}

function TestResultCard({ result }: { result: ApiTestResult }) {
  const isSuccess = result.status >= 200 && result.status < 300;
  
  return (
    <div className={`p-4 rounded-lg border ${isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm font-medium text-gray-900">{result.name}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
          isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          HTTP {result.status || 'ERR'}
        </span>
      </div>
      <p className="text-xs text-gray-500 font-mono mb-2">{result.endpoint}</p>
      
      {result.error && (
        <p className="text-xs text-red-700 mb-2">Error: {result.error}</p>
      )}
      
      {result.data && (
        <pre className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200 overflow-x-auto mt-2">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      )}
      
      <p className="text-[10px] text-gray-400 mt-2">
        {new Date(result.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}

function PipelineStep({ step, status, detail }: { step: string; status: 'success' | 'error' | 'pending'; detail: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      {status === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
      ) : status === 'error' ? (
        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
      ) : (
        <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
      )}
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-900">{step}</p>
        <p className="text-[10px] text-gray-500">{detail}</p>
      </div>
    </div>
  );
}
