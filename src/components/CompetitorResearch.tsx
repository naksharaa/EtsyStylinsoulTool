import { useState } from 'react';
import { Users, Search, ExternalLink, Tag, DollarSign, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CompetitorListing {
  title: string;
  price: string;
  shop: string;
  tags: string[];
  personalized: boolean;
}

export function CompetitorResearch() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    listings: CompetitorListing[];
    commonKeywords: string[];
    keywordGaps: string[];
    priceBand: { min: number; max: number };
  } | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    await new Promise(r => setTimeout(r, 1500));
    setResults({
      listings: [
        { title: 'Personalized Doctor Metal Sign Custom Physician Office Decor Gift', price: '49.99', shop: 'MetalCraftStudio', tags: ['doctor sign', 'physician gift', 'medical office', 'custom metal'], personalized: true },
        { title: 'Custom Doctor Name Sign Metal Wall Art Retirement Gift Medical', price: '54.99', shop: 'RusticMetalCo', tags: ['doctor name', 'retirement gift', 'metal wall art', 'medical decor'], personalized: true },
        { title: 'Doctor Office Sign Personalized Metal Plaque Medical Clinic Decor', price: '44.99', shop: 'LaserArtDesigns', tags: ['office sign', 'clinic decor', 'personalized plaque', 'metal doctor'], personalized: true },
        { title: 'Physician Metal Sign Custom Doctor Gift Appreciation Wall Decor', price: '39.99', shop: 'SignWorksShop', tags: ['physician sign', 'appreciation', 'wall decor', 'doctor gift'], personalized: false },
        { title: 'Medical Doctor Metal Wall Sign Personalized Name Office Gift', price: '59.99', shop: 'IronCraftCo', tags: ['medical sign', 'wall sign', 'personalized', 'office gift'], personalized: true },
        { title: 'Retired Doctor Metal Sign Retirement Party Gift Custom Name Art', price: '47.99', shop: 'MetalSignPro', tags: ['retired doctor', 'party gift', 'custom name', 'metal art'], personalized: true },
      ],
      commonKeywords: ['doctor', 'metal', 'sign', 'personalized', 'custom', 'gift', 'office', 'medical', 'wall', 'decor'],
      keywordGaps: ['labor and delivery', 'pediatric', 'surgeon', 'cardiologist', 'family medicine', 'vet clinic', 'dental office', 'chiropractor'],
      priceBand: { min: 34.99, max: 69.99 },
    });
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Competitor Research</h1>
        <p className="text-sm text-gray-500">Analyze competitor listings to find keyword gaps and opportunities</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search for competitors (e.g., doctor metal sign, nurse gift...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Research
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Listings Analyzed</p>
              <p className="text-2xl font-bold text-gray-900">{results.listings.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Price Band</p>
              <p className="text-2xl font-bold text-gray-900">${results.priceBand.min} - ${results.priceBand.max}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Keyword Gaps Found</p>
              <p className="text-2xl font-bold text-amber-600">{results.keywordGaps.length}</p>
            </div>
          </div>

          {/* Common Keywords */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Common Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {results.commonKeywords.map((kw, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{kw}</span>
              ))}
            </div>
          </div>

          {/* Keyword Gaps */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Potential Keyword Gaps</h3>
            <p className="text-xs text-gray-500 mb-3">These terms are underrepresented in competitor listings — potential opportunities</p>
            <div className="flex flex-wrap gap-2">
              {results.keywordGaps.map((kw, i) => (
                <span key={i} className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">{kw}</span>
              ))}
            </div>
          </div>

          {/* Competitor Listings */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Competitor Listings</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {results.listings.map((listing, i) => (
                <div key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{listing.shop}</span>
                        <span className="text-sm font-medium text-green-700">${listing.price}</span>
                        {listing.personalized && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">Personalized</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {listing.tags.map((tag, j) => (
                          <span key={j} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
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
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Research Competitors</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Search for a keyword to see what competitors are listing. We'll identify common patterns, pricing, and keyword gaps you can exploit.
          </p>
        </div>
      )}
    </div>
  );
}
