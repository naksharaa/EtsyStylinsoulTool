import { useState } from 'react';
import { Search, TrendingUp, DollarSign, Users, Tag, Bookmark, Loader2 } from 'lucide-react';
import type { KeywordResult, KeywordCluster } from '../types';
import { generateKeywords } from '../lib/ai/provider';

export function KeywordResearch() {
  const [seedKeyword, setSeedKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ keywords: KeywordResult[]; clusters: KeywordCluster[] } | null>(null);

  const handleSearch = async () => {
    if (!seedKeyword.trim()) return;
    setIsSearching(true);
    try {
      const data = await generateKeywords(seedKeyword);
      setResults(data);
    } catch (error) {
      console.error('Keyword research failed:', error);
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Keyword Research</h1>
        <p className="text-sm text-gray-500">Discover profitable keywords for your metal sign listings</p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Enter seed keyword (e.g., doctor metal sign, nurse gift...)"
              value={seedKeyword}
              onChange={(e) => setSeedKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !seedKeyword.trim()}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Research
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['doctor metal sign', 'nurse gift', 'garage sign', 'horse wall art', 'anniversary gift', 'family name sign'].map((example) => (
            <button
              key={example}
              onClick={() => { setSeedKeyword(example); }}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <OverviewCard
              icon={TrendingUp}
              label="Keywords Found"
              value={results.keywords.length.toString()}
              color="blue"
            />
            <OverviewCard
              icon={DollarSign}
              label="Median Price"
              value={`$${Math.round(results.keywords.reduce((s, k) => s + k.medianPrice, 0) / results.keywords.length)}`}
              color="green"
            />
            <OverviewCard
              icon={Users}
              label="Avg Competition"
              value={results.keywords.filter(k => k.competitionLevel === 'low').length > results.keywords.length / 2 ? 'Low' : 'Medium'}
              color="amber"
            />
            <OverviewCard
              icon={Tag}
              label="Clusters"
              value={results.clusters.length.toString()}
              color="purple"
            />
          </div>

          {/* Keyword Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Keyword Results</h3>
              <p className="text-xs text-gray-500 mt-1">Based on marketplace data and AI analysis — not official Etsy search volume</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Keyword</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Competition</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Results</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Median Price</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Price Range</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Personalization</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Buyer Intent</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Source</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-gray-500">Save</th>
                  </tr>
                </thead>
                <tbody>
                  {results.keywords.map((kw, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-gray-900">{kw.keyword}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          kw.competitionLevel === 'low' ? 'bg-green-100 text-green-700' :
                          kw.competitionLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {kw.competitionLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{kw.resultCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">${kw.medianPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">${kw.minPrice} - ${kw.maxPrice}</td>
                      <td className="px-4 py-3">
                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${kw.personalizationPrevalence * 100}%` }} />
                        </div>
                        <span className="text-[10px] text-gray-500">{Math.round(kw.personalizationPrevalence * 100)}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${
                          kw.buyerIntent === 'high' ? 'text-green-600 font-medium' :
                          kw.buyerIntent === 'medium' ? 'text-amber-600' : 'text-gray-500'
                        }`}>
                          {kw.buyerIntent}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {kw.source.map((s, j) => (
                            <span key={j} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <Bookmark className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Keyword Clusters */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Keyword Clusters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.clusters.map((cluster, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      cluster.type === 'product' ? 'bg-blue-100 text-blue-700' :
                      cluster.type === 'recipient' ? 'bg-purple-100 text-purple-700' :
                      cluster.type === 'occasion' ? 'bg-pink-100 text-pink-700' :
                      cluster.type === 'style' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {cluster.type}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{cluster.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cluster.keywords.map((kw, j) => (
                      <span key={j} className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !isSearching && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Keyword Research</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Enter a seed keyword to discover related terms, competition levels, pricing data, and buyer intent patterns from the Etsy marketplace.
          </p>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
