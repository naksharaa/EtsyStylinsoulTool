import { useState, useMemo } from 'react';
import { Search, Filter, ExternalLink, Eye, Zap, Copy, ChevronDown, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { EtsyListing } from '../types';
import { calculateSEOScore, getScoreLabel } from '../lib/seo/scoring';

interface ListingsPageProps {
  listings: EtsyListing[];
  onSelectListing: (listing: EtsyListing) => void;
  selectedListing: EtsyListing | null;
}

export function ListingsPage({ listings, onSelectListing, selectedListing }: ListingsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('modified');

  const filteredListings = useMemo(() => {
    let result = [...listings];
    
    if (stateFilter !== 'all') {
      result = result.filter(l => l.state === stateFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.listing_id.toString().includes(q) ||
        l.tags.some(t => t.toLowerCase().includes(q)) ||
        (l.sku && l.sku.some(s => s.toLowerCase().includes(q)))
      );
    }

    if (sortBy === 'modified') {
      result.sort((a, b) => b.modified_tsz - a.modified_tsz);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'price') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'score') {
      result.sort((a, b) => calculateSEOScore(b).total - calculateSEOScore(a).total);
    }

    return result;
  }, [listings, searchQuery, stateFilter, sortBy]);

  const stateCounts = useMemo(() => ({
    all: listings.length,
    active: listings.filter(l => l.state === 'active').length,
    draft: listings.filter(l => l.state === 'draft').length,
    sold_out: listings.filter(l => l.state === 'sold_out').length,
    inactive: listings.filter(l => l.state === 'inactive').length,
  }), [listings]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-sm text-gray-500">{listings.length} total listings from StylinSoulMetalArt</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, ID, tag, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            {(['all', 'active', 'draft', 'sold_out', 'inactive'] as const).map((state) => (
              <button
                key={state}
                onClick={() => setStateFilter(state)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  stateFilter === state
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {state === 'all' ? 'All' : state === 'sold_out' ? 'Sold Out' : state.charAt(0).toUpperCase() + state.slice(1)}
                <span className="ml-1 opacity-60">({stateCounts[state]})</span>
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg"
          >
            <option value="modified">Last Updated</option>
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="score">SEO Score</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Image</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">State</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Qty</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Performance</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => {
                const score = calculateSEOScore(listing);
                const { label, color } = getScoreLabel(score.total);
                return (
                  <tr
                    key={listing.listing_id}
                    className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedListing?.listing_id === listing.listing_id ? 'bg-amber-50' : ''
                    }`}
                    onClick={() => onSelectListing(listing)}
                  >
                    <td className="px-4 py-3">
                      {listing.images[0] ? (
                        <img src={listing.images[0].url_570xN || listing.images[0].url_fullxfull} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-400">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{listing.tags.length} tags</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 font-mono">{listing.listing_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        listing.state === 'active' ? 'bg-green-100 text-green-700' :
                        listing.state === 'draft' ? 'bg-gray-100 text-gray-700' :
                        listing.state === 'sold_out' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {listing.state === 'sold_out' ? 'Sold Out' : listing.state.charAt(0).toUpperCase() + listing.state.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium">${listing.price}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{listing.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{
                          backgroundColor: color === 'emerald' ? '#d1fae5' : color === 'blue' ? '#dbeafe' : color === 'amber' ? '#fef3c7' : color === 'orange' ? '#ffedd5' : '#fee2e2',
                          color: color === 'emerald' ? '#065f46' : color === 'blue' ? '#1e40af' : color === 'amber' ? '#92400e' : color === 'orange' ? '#9a3412' : '#991b1b',
                        }}>
                          {score.total}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {listing.performance === 'winner' && (
                        <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3" /> Winner
                        </span>
                      )}
                      {listing.performance === 'average' && (
                        <span className="text-[10px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">Average</span>
                      )}
                      {listing.performance === 'needs_improvement' && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" /> Needs Work
                        </span>
                      )}
                      {(!listing.performance || listing.performance === 'not_set') && (
                        <span className="text-[10px] text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="View on Etsy">
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Analyze">
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded" title="Optimize">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">No listings match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
