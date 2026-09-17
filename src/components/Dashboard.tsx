import { useMemo } from 'react';
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertTriangle, Clock, ArrowUpRight, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import type { EtsyListing } from '../types';
import { calculateSEOScore, getScoreLabel } from '../lib/seo/scoring';

interface DashboardProps {
  listings: EtsyListing[];
  lastSyncAt: number | null;
}

export function Dashboard({ listings, lastSyncAt }: DashboardProps) {
  const stats = useMemo(() => {
    const active = listings.filter(l => l.state === 'active');
    const drafts = listings.filter(l => l.state === 'draft');
    const soldOut = listings.filter(l => l.state === 'sold_out');
    const inactive = listings.filter(l => l.state === 'inactive');
    
    const scores = active.map(l => calculateSEOScore(l));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, sc) => s + sc.total, 0) / scores.length) : 0;
    const needsOptimization = active.filter(l => calculateSEOScore(l).total < 60).length;

    return {
      total: listings.length,
      active: active.length,
      drafts: drafts.length,
      soldOut: soldOut.length,
      inactive: inactive.length,
      avgScore,
      needsOptimization,
      avgPrice: active.length > 0 ? (active.reduce((s, l) => s + parseFloat(l.price), 0) / active.length).toFixed(2) : '0',
    };
  }, [listings]);

  const chartData = [
    { day: 'Mon', revenue: 245 },
    { day: 'Tue', revenue: 189 },
    { day: 'Wed', revenue: 312 },
    { day: 'Thu', revenue: 278 },
    { day: 'Fri', revenue: 420 },
    { day: 'Sat', revenue: 356 },
    { day: 'Sun', revenue: 198 },
  ];

  const nicheData = [
    { niche: 'Family', count: 3 },
    { niche: 'Doctor', count: 2 },
    { niche: 'Nurse', count: 2 },
    { niche: 'Garage', count: 2 },
    { niche: 'Wedding', count: 2 },
    { niche: 'Horse', count: 1 },
  ];

  const recentOrders = [
    { id: 'ORD-001', item: 'Personalized Family Sign', amount: '$49.99', date: '2 hours ago', status: 'Shipped' },
    { id: 'ORD-002', item: 'Doctor Metal Sign', amount: '$54.99', date: '5 hours ago', status: 'Processing' },
    { id: 'ORD-003', item: 'Garage Sign - Smith', amount: '$59.99', date: '1 day ago', status: 'Delivered' },
    { id: 'ORD-004', item: 'Nurse Appreciation Sign', amount: '$44.99', date: '1 day ago', status: 'Shipped' },
    { id: 'ORD-005', item: 'Anniversary Couple Sign', amount: '$54.99', date: '2 days ago', status: 'Delivered' },
  ];

  const listingsNeedingWork = listings
    .filter(l => l.state === 'active')
    .map(l => ({ ...l, score: calculateSEOScore(l) }))
    .filter(l => l.score.total < 70)
    .sort((a, b) => a.score.total - b.score.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            StylinSoulMetalArt Overview
            {lastSyncAt && <span className="ml-2">• Last synced {new Date(lastSyncAt).toLocaleTimeString()}</span>}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Package} label="Active Listings" value={stats.active.toString()} sublabel={`${stats.total} total`} color="blue" />
        <StatCard icon={DollarSign} label="Avg Price" value={`$${stats.avgPrice}`} sublabel="across active listings" color="green" />
        <StatCard icon={BarChart3} label="Avg SEO Score" value={`${stats.avgScore}/100`} sublabel="StylinSoul Score" color="amber" />
        <StatCard icon={AlertTriangle} label="Needs Optimization" value={stats.needsOptimization.toString()} sublabel="listings below 60" color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Niche Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Listings by Niche</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={nicheData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="niche" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
            <span className="text-xs text-amber-600 font-medium cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.item}</p>
                  <p className="text-xs text-gray-500">{order.id} • {order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{order.amount}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings Needing Optimization */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Listings Needing Optimization</h3>
            <span className="text-xs text-amber-600 font-medium cursor-pointer hover:underline">View All</span>
          </div>
          <div className="space-y-3">
            {listingsNeedingWork.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">All listings are well optimized!</p>
            ) : (
              listingsNeedingWork.map((listing) => {
                const { label, color } = getScoreLabel(listing.score.total);
                return (
                  <div key={listing.listing_id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-500">ID: {listing.listing_id}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        color === 'red' ? 'bg-red-100 text-red-700' :
                        color === 'orange' ? 'bg-orange-100 text-orange-700' :
                        color === 'amber' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{listing.score.total}</span>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Listing Status Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Listing Status Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusBadge label="Active" count={stats.active} color="green" />
          <StatusBadge label="Drafts" count={stats.drafts} color="gray" />
          <StatusBadge label="Sold Out" count={stats.soldOut} color="amber" />
          <StatusBadge label="Inactive" count={stats.inactive} color="red" />
          <StatusBadge label="Total" count={stats.total} color="blue" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel, color }: {
  icon: any; label: string; value: string; sublabel: string; color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sublabel}</p>
    </div>
  );
}

function StatusBadge({ label, count, color }: { label: string; count: number; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700 border-green-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-3 rounded-lg border text-center ${colors[color]}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
