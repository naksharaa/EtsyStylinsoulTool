import { useState } from 'react';
import { Target, Search, Sparkles, ArrowRight, Loader2, Bookmark, PenTool, TrendingUp } from 'lucide-react';
import type { NicheOpportunity } from '../types';
import { generateNiches } from '../lib/ai/provider';

export function NicheFinder() {
  const [seedNiche, setSeedNiche] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [niches, setNiches] = useState<NicheOpportunity[]>([]);

  const handleSearch = async () => {
    if (!seedNiche.trim()) return;
    setIsSearching(true);
    try {
      const data = await generateNiches(seedNiche);
      setNiches(data.niches);
    } catch (error) {
      console.error('Niche research failed:', error);
    }
    setIsSearching(false);
  };

  const exampleNiches = ['nurse', 'doctor', 'garage', 'horse', 'family', 'wedding', 'anniversary', 'mechanic'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Niche Finder</h1>
        <p className="text-sm text-gray-500">Discover profitable niches for laser-cut metal signs</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter a niche seed (e.g., nurse, garage, horse...)"
              value={seedNiche}
              onChange={(e) => setSeedNiche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !seedNiche.trim()}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Find Opportunities
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {exampleNiches.map((niche) => (
            <button
              key={niche}
              onClick={() => setSeedNiche(niche)}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              {niche}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {niches.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Niche Opportunities</h2>
            <p className="text-xs text-gray-500">Opportunity Score is an internal heuristic, not an official Etsy metric</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {niches.map((niche) => (
              <NicheCard key={niche.id} niche={niche} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {niches.length === 0 && !isSearching && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Discover Metal Sign Niches</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Enter a niche seed to discover profitable opportunities. We'll analyze competition, buyer intent, personalization potential, and gift potential specifically for laser-cut metal signs.
          </p>
          <div className="mt-6 p-4 bg-amber-50 rounded-lg max-w-lg mx-auto">
            <p className="text-xs text-amber-800 font-medium">Example Niche Hierarchies:</p>
            <div className="mt-2 text-xs text-amber-700 space-y-1">
              <p>Nurse → Labor & Delivery → New Graduate → Graduation Gift → Personalized Name Sign</p>
              <p>Garage → Mechanic → Dad → Father's Day → Personalized Garage Sign</p>
              <p>Horse → Horse Owner → Western Home → Wedding → Family Name Horse Sign</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NicheCard({ niche }: { niche: NicheOpportunity }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-amber-300 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">{niche.name}</h3>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
            <span>{niche.hierarchy.broad}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{niche.hierarchy.subNiche}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{niche.hierarchy.buyer}</span>
            <ArrowRight className="w-3 h-3" />
            <span>{niche.hierarchy.occasion}</span>
          </div>
        </div>
        <div className="text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
            niche.opportunityScore >= 80 ? 'bg-green-100 text-green-700' :
            niche.opportunityScore >= 60 ? 'bg-blue-100 text-blue-700' :
            'bg-amber-100 text-amber-700'
          }`}>
            {niche.opportunityScore}
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Opportunity</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MetricBadge label="Competition" value={niche.competition} />
        <MetricBadge label="Gift Intent" value={niche.giftPotential} />
        <MetricBadge label="Personalization" value={niche.personalizationPotential} />
      </div>

      {/* Price Range */}
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-600">
          Typical Price: <span className="font-medium">${niche.averagePrice.min} - ${niche.averagePrice.max}</span>
        </span>
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <p className="text-[10px] text-gray-500 mb-1">Primary Keyword</p>
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{niche.primaryKeyword}</span>
      </div>

      {/* Suggested Product */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-[10px] text-gray-500 mb-1">Suggested Product</p>
        <p className="text-xs text-gray-700 font-medium">{niche.recommendedProduct}</p>
        <p className="text-[10px] text-gray-500 mt-1">{niche.recommendedDesign}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
          <Search className="w-3 h-3" /> Research
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <Bookmark className="w-3 h-3" /> Save
        </button>
        <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
          <PenTool className="w-3 h-3" /> Create Listing
        </button>
      </div>
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: string }) {
  const colorClass = value === 'high' || value === 'low' ? 
    (value === 'high' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50') :
    'text-amber-700 bg-amber-50';

  return (
    <div className="text-center p-2 bg-gray-50 rounded">
      <p className={`text-xs font-medium ${colorClass} px-2 py-0.5 rounded inline-block`}>{value}</p>
      <p className="text-[10px] text-gray-500 mt-1">{label}</p>
    </div>
  );
}
