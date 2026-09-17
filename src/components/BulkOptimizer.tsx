import { useState } from 'react';
import { Zap, CheckCircle2, AlertTriangle, Star, Loader2 } from 'lucide-react';
import type { EtsyListing } from '../types';
import { calculateSEOScore, getScoreLabel } from '../lib/seo/scoring';

interface BulkOptimizerProps {
  listings: EtsyListing[];
}

export function BulkOptimizer({ listings }: BulkOptimizerProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  const activeListings = listings.filter(l => l.state === 'active');

  const toggleSelect = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === activeListings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activeListings.map(l => l.listing_id)));
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(r => setTimeout(r, 1500));
    setAnalyzed(true);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Optimizer</h1>
        <p className="text-sm text-gray-500">Analyze and optimize multiple listings at once — each requires individual approval</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={selectAll} className="text-xs text-amber-600 hover:underline">
            {selected.size === activeListings.length ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs text-gray-500">{selected.size} of {activeListings.length} selected</span>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={selected.size === 0 || isAnalyzing}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 disabled:opacity-50 flex items-center gap-2"
        >
          {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
          Analyze Selected
        </button>
      </div>

      {/* Warning */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> Each listing requires individual review and approval before any changes are made to Etsy. 
          Listings marked as "Winner" will show a warning before optimization is recommended.
        </p>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-8">
                <input
                  type="checkbox"
                  checked={selected.size === activeListings.length && activeListings.length > 0}
                  onChange={selectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Listing</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Current Score</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Performance</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody>
            {activeListings.map((listing) => {
              const score = calculateSEOScore(listing);
              const { label, color } = getScoreLabel(score.total);
              const isWinner = listing.performance === 'winner';
              const needsWork = score.total < 60;

              return (
                <tr key={listing.listing_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(listing.listing_id)}
                      onChange={() => toggleSelect(listing.listing_id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{listing.title}</p>
                    <p className="text-xs text-gray-400">ID: {listing.listing_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${
                      color === 'emerald' ? 'text-green-600' :
                      color === 'blue' ? 'text-blue-600' :
                      color === 'amber' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>{score.total}/100</span>
                  </td>
                  <td className="px-4 py-3">
                    {analyzed && selected.has(listing.listing_id) ? (
                      needsWork ? (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Needs Improvement</span>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Good</span>
                      )
                    ) : (
                      <span className="text-xs text-gray-400">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isWinner ? (
                      <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" /> PERFORMING WELL — REVIEW BEFORE CHANGING
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {analyzed && selected.has(listing.listing_id) && (
                      <button className="text-xs text-amber-600 hover:underline font-medium">
                        Review →
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
