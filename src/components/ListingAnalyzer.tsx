import { useState } from 'react';
import { Search, CheckCircle2, AlertTriangle, XCircle, Info, Image as ImageIcon } from 'lucide-react';
import type { EtsyListing, SEOScore } from '../types';
import { calculateSEOScore, getScoreLabel } from '../lib/seo/scoring';

interface ListingAnalyzerProps {
  listing: EtsyListing | null;
  listings: EtsyListing[];
}

export function ListingAnalyzer({ listing, listings }: ListingAnalyzerProps) {
  const [selectedListing, setSelectedListing] = useState<EtsyListing | null>(listing);

  const currentListing = selectedListing || listing;
  const score = currentListing ? calculateSEOScore(currentListing) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listing Analyzer</h1>
        <p className="text-sm text-gray-500">Deep analysis of your Etsy listings with StylinSoul Optimization Score</p>
      </div>

      {/* Listing Selector */}
      {!currentListing && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Select a Listing to Analyze</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {listings.filter(l => l.state === 'active').map(l => (
              <button
                key={l.listing_id}
                onClick={() => setSelectedListing(l)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-colors text-left"
              >
                {l.images[0] ? (
                  <img src={l.images[0].url_570xN || l.images[0].url_fullxfull} alt="" className="w-12 h-12 rounded object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-100" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{l.title}</p>
                  <p className="text-xs text-gray-500">${l.price} • {l.tags.length} tags</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {currentListing && score && (
        <div className="space-y-6">
          {/* Score Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">StylinSoul Optimization Score</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-gray-900">{score.total}</span>
                  <span className="text-lg text-gray-400">/ 100</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getScoreLabel(score.total).color === 'emerald' ? 'bg-green-100 text-green-700' :
                    getScoreLabel(score.total).color === 'blue' ? 'bg-blue-100 text-blue-700' :
                    getScoreLabel(score.total).color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    getScoreLabel(score.total).color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getScoreLabel(score.total).label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">Internal heuristic — not an official Etsy metric</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[300px]">{currentListing.title}</p>
                <p className="text-xs text-gray-500">ID: {currentListing.listing_id}</p>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {score.components.map((comp) => (
                <div key={comp.name} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{comp.score}/{comp.maxScore}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{comp.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Title Analysis</h3>
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-700">{currentListing.title}</p>
                <p className="text-xs text-gray-400 mt-2">{currentListing.title.length} characters</p>
              </div>
              <div className="space-y-2">
                {score.components.find(c => c.name === 'Title Structure')?.details.map((d, i) => (
                  <DetailItem key={i} detail={d} />
                ))}
              </div>
            </div>

            {/* Tags Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags Analysis ({currentListing.tags.length}/13)</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {currentListing.tags.map((tag, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                    tag.length > 20 ? 'bg-red-100 text-red-700' :
                    tag.length >= 15 ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {tag} <span className="opacity-50">({tag.length})</span>
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                {score.components.find(c => c.name === 'Tags')?.details.map((d, i) => (
                  <DetailItem key={i} detail={d} />
                ))}
              </div>
            </div>

            {/* Description Analysis */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Description Analysis</h3>
              <div className="p-3 bg-gray-50 rounded-lg mb-4 max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-600 whitespace-pre-wrap">{currentListing.description}</p>
                <p className="text-xs text-gray-400 mt-2">{currentListing.description.length} characters</p>
              </div>
              <div className="space-y-2">
                {score.components.find(c => c.name === 'Description')?.details.map((d, i) => (
                  <DetailItem key={i} detail={d} />
                ))}
              </div>
            </div>

            {/* Attributes & Personalization */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Attributes & Personalization</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Taxonomy</p>
                  {currentListing.taxonomy_path ? (
                    <p className="text-sm text-gray-700">{currentListing.taxonomy_path.join(' → ')}</p>
                  ) : (
                    <p className="text-sm text-red-500">Not set</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Materials</p>
                  <div className="flex flex-wrap gap-1">
                    {(currentListing.materials || []).map((m, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{m}</span>
                    ))}
                    {(!currentListing.materials || currentListing.materials.length === 0) && (
                      <span className="text-sm text-red-500">Not set</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Personalization</p>
                  {currentListing.personalized ? (
                    <div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Enabled</span>
                      {currentListing.personalization_instructions && (
                        <p className="text-xs text-gray-500 mt-2">{currentListing.personalization_instructions}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Not enabled</span>
                  )}
                </div>
                <div className="space-y-2">
                  {score.components.find(c => c.name === 'Attributes')?.details.map((d, i) => (
                    <DetailItem key={i} detail={d} />
                  ))}
                  {score.components.find(c => c.name === 'Personalization')?.details.map((d, i) => (
                    <DetailItem key={i} detail={d} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Images ({currentListing.images.length})</h3>
            <div className="flex gap-3 overflow-x-auto">
              {currentListing.images.map((img, i) => (
                <img key={i} src={img.url_570xN || img.url_fullxfull} alt={`Image ${i + 1}`} className="w-32 h-32 rounded-lg object-cover flex-shrink-0" />
              ))}
              {currentListing.images.length === 0 && (
                <p className="text-sm text-gray-500">No images available</p>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {score.components.find(c => c.name === 'Competitive Positioning')?.details
                .filter(d => d.message.includes('image'))
                .map((d, i) => (
                  <DetailItem key={i} detail={d} />
                ))}
            </div>
          </div>

          {/* Change Listing Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedListing(null)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              ← Analyze Another Listing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ detail }: { detail: { message: string; type: string; points: number } }) {
  const Icon = detail.type === 'success' ? CheckCircle2 :
    detail.type === 'warning' ? AlertTriangle :
    detail.type === 'error' ? XCircle : Info;
  
  const colorClass = detail.type === 'success' ? 'text-green-600' :
    detail.type === 'warning' ? 'text-amber-600' :
    detail.type === 'error' ? 'text-red-600' : 'text-blue-600';

  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colorClass}`} />
      <div>
        <p className="text-xs text-gray-700">{detail.message}</p>
        {detail.points > 0 && <p className="text-[10px] text-gray-400">+{detail.points} points</p>}
      </div>
    </div>
  );
}
