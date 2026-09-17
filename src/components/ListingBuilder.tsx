import { useState } from 'react';
import { PenTool, Sparkles, Copy, CheckCircle2, Loader2, Tag, FileText, Image as ImageIcon } from 'lucide-react';
import type { GeneratedListing, GeneratedTag, TitleOption } from '../types';
import { generateListing } from '../lib/ai/provider';
import { METAL_SIGN_CONFIG } from '../types';

export function ListingBuilder() {
  const [product, setProduct] = useState('');
  const [designDescription, setDesignDescription] = useState('');
  const [personalization, setPersonalization] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [occasion, setOccasion] = useState('');
  const [referenceKeyword, setReferenceKeyword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedListing | null>(null);
  const [activeTab, setActiveTab] = useState<'title' | 'tags' | 'description' | 'details'>('title');

  const handleGenerate = async () => {
    if (!product.trim()) return;
    setIsGenerating(true);
    try {
      const data = await generateListing({
        product,
        designDescription,
        personalization,
        targetCustomer,
        occasion,
        referenceKeyword,
      });
      setResult(data);
    } catch (error) {
      console.error('Listing generation failed:', error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Listing Builder</h1>
        <p className="text-sm text-gray-500">Generate optimized Etsy listing content for your metal signs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Listing Details</h3>
          
          <div>
            <label className="text-xs font-medium text-gray-700">Product / Niche *</label>
            <input
              type="text"
              placeholder="e.g., Doctor metal sign, Nurse gift sign..."
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Design Description</label>
            <textarea
              placeholder="Describe the design (e.g., stethoscope silhouette with name plate)"
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
              rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Personalization Options</label>
            <input
              type="text"
              placeholder="e.g., Name, established year, custom text"
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-700">Target Customer</label>
              <input
                type="text"
                placeholder="e.g., Doctors, nurses"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Occasion</label>
              <input
                type="text"
                placeholder="e.g., Retirement, Birthday"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700">Reference Keyword</label>
            <input
              type="text"
              placeholder="e.g., personalized doctor metal sign"
              value={referenceKeyword}
              onChange={(e) => setReferenceKeyword(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !product.trim()}
            className="w-full py-3 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Listing
          </button>

          {/* Shop Config Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-500 font-medium mb-1">Available Options (StylinSoulMetalArt)</p>
            <p className="text-[10px] text-gray-400">Colors: {METAL_SIGN_CONFIG.colors.join(', ')}</p>
            <p className="text-[10px] text-gray-400">Sizes: {METAL_SIGN_CONFIG.sizes.join(', ')}</p>
          </div>
        </div>

        {/* Output Panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {result ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {(['title', 'tags', 'description', 'details'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
                      activeTab === tab ? 'text-amber-700 border-b-2 border-amber-500 bg-amber-50/50' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-6 overflow-y-auto max-h-[600px]">
                {activeTab === 'title' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900">Generated Title Options</h4>
                    {result.titleOptions.map((opt, i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full mb-2 inline-block ${
                              opt.strategy === 'search' ? 'bg-blue-100 text-blue-700' :
                              opt.strategy === 'gift_intent' ? 'bg-pink-100 text-pink-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {opt.strategy === 'search' ? 'Search Focused' : opt.strategy === 'gift_intent' ? 'Gift Intent' : 'Long-Tail Niche'}
                            </span>
                            <p className="text-sm text-gray-900 mt-1">{opt.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{opt.charCount} characters</p>
                          </div>
                          <button className="p-1 hover:bg-gray-100 rounded" title="Copy">
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-[10px] text-amber-800">Rules: No emojis • No "16 gauge" • Natural English • Max 140 chars • Important phrase near beginning</p>
                    </div>
                  </div>
                )}

                {activeTab === 'tags' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">Generated Tags ({result.tags.length}/13)</h4>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Copy all">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {result.tags.map((tag, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              tag.category === 'product' ? 'bg-blue-100 text-blue-700' :
                              tag.category === 'recipient' ? 'bg-purple-100 text-purple-700' :
                              tag.category === 'occasion' ? 'bg-pink-100 text-pink-700' :
                              tag.category === 'style' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {tag.category}
                            </span>
                            <span className="text-sm text-gray-900">{tag.tag}</span>
                          </div>
                          <span className={`text-xs ${tag.charCount > 20 ? 'text-red-500' : 'text-gray-400'}`}>
                            {tag.charCount}/20
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-[10px] text-amber-800">All tags ≤ 20 characters • Exactly 13 tags • Covering product, recipient, occasion, style, personalization dimensions</p>
                    </div>
                  </div>
                )}

                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">Generated Description</h4>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Copy">
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.description}</p>
                    </div>
                    <p className="text-xs text-gray-400">{result.description.length} characters</p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Materials</h4>
                      <div className="flex flex-wrap gap-1">
                        {result.materials.map((m, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{m}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Suggested Taxonomy</h4>
                      <p className="text-xs text-gray-600">{result.suggestedTaxonomy.join(' → ')}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Personalization Instructions</h4>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{result.personalizationInstructions}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Image Ideas</h4>
                      <ul className="space-y-1">
                        {result.imageIdeas.map((idea, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                            <ImageIcon className="w-3 h-3 text-gray-400" /> {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">FAQ</h4>
                      <div className="space-y-2">
                        {result.faq.map((item, i) => (
                          <div key={i} className="p-2 bg-gray-50 rounded">
                            <p className="text-xs font-medium text-gray-700">{item.question}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <PenTool className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generated Listing Will Appear Here</h3>
              <p className="text-sm text-gray-500">Fill in the details and click Generate to create optimized listing content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
