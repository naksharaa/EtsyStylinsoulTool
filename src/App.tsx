// ============================================
// StylinSoulMetalArt - Etsy Intelligence App
// Main Application Component
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, List, Search, Target, Users, PenTool, Settings,
  TrendingUp, Bookmark, History, BarChart3, Zap, Menu, X,
  ChevronRight, ExternalLink, AlertTriangle, CheckCircle2,
  RefreshCw, LogOut, Store, Shield, Sparkles
} from 'lucide-react';
import type { NavPage, EtsyListing, SEOScore } from './types';
import { calculateSEOScore, getScoreLabel } from './lib/seo/scoring';
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
import { sampleListings } from './data/sampleData';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [listings, setListings] = useState<EtsyListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<EtsyListing | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);

  useEffect(() => {
    const connected = sessionStorage.getItem('etsy_connected');
    if (connected === 'true') {
      setIsConnected(true);
      setSetupComplete(true);
      setListings(sampleListings);
      setLastSyncAt(Date.now());
    }
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setSetupComplete(true);
    sessionStorage.setItem('etsy_connected', 'true');
    setListings(sampleListings);
    setLastSyncAt(Date.now());
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    sessionStorage.removeItem('etsy_connected');
    setListings([]);
    setSelectedListing(null);
  }, []);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setListings(sampleListings);
    setLastSyncAt(Date.now());
    setIsSyncing(false);
  }, []);

  if (!setupComplete) {
    return <SetupWizard onComplete={handleConnect} />;
  }

  if (!isConnected) {
    return <SetupWizard onComplete={handleConnect} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onDisconnect={handleDisconnect}
          onSync={handleSync}
          isSyncing={isSyncing}
          lastSyncAt={lastSyncAt}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <TopBar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            onSync={handleSync}
            isSyncing={isSyncing}
          />
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard listings={listings} lastSyncAt={lastSyncAt} />} />
              <Route path="/listings" element={
                <ListingsPage
                  listings={listings}
                  onSelectListing={setSelectedListing}
                  selectedListing={selectedListing}
                />
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

// ---- Sidebar Component ----
function Sidebar({ isOpen, onToggle, onDisconnect, onSync, isSyncing, lastSyncAt }: {
  isOpen: boolean;
  onToggle: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  isSyncing: boolean;
  lastSyncAt: number | null;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: { id: NavPage; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'listings', label: 'My Listings', icon: List },
    { id: 'analyzer', label: 'Listing Analyzer', icon: Search },
    { id: 'keywords', label: 'Keyword Research', icon: BarChart3 },
    { id: 'niches', label: 'Niche Finder', icon: Target },
    { id: 'competitors', label: 'Competitor Research', icon: Users },
    { id: 'builder', label: 'Listing Builder', icon: PenTool },
    { id: 'bulk', label: 'Bulk Optimizer', icon: Zap },
    { id: 'sales', label: 'Sales Intelligence', icon: TrendingUp },
    { id: 'saved', label: 'Saved Research', icon: Bookmark },
    { id: 'history', label: 'Optimization History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 flex flex-col ${isOpen ? 'w-64' : 'w-16'}`}>
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === `/${item.id === 'dashboard' ? '' : item.id}`;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id === 'dashboard' ? '' : item.id}`)}
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

      {/* Sync & Disconnect */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {isOpen && lastSyncAt && (
          <p className="text-[10px] text-gray-500">
            Last sync: {new Date(lastSyncAt).toLocaleTimeString()}
          </p>
        )}
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isOpen && <span>{isSyncing ? 'Syncing...' : 'Sync Etsy'}</span>}
        </button>
        <button
          onClick={onDisconnect}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-3 h-3" />
          {isOpen && <span>Disconnect</span>}
        </button>
      </div>
    </aside>
  );
}

// ---- Top Bar Component ----
function TopBar({ onMenuToggle, onSync, isSyncing }: {
  onMenuToggle: () => void;
  onSync: () => void;
  isSyncing: boolean;
}) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-1 hover:bg-gray-100 rounded">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">StylinSoulMetalArt</span>
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-medium">Connected</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>
    </header>
  );
}

export default App;
