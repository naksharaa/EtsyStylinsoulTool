// ============================================
// AI Provider Abstraction
// ============================================
// Supports OpenAI-compatible APIs (Qwen, OpenAI, etc.)

import { z } from 'zod';
import type { GeneratedListing, TitleOption, GeneratedTag, NicheOpportunity, KeywordResult } from '../../types';

interface AIConfig {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

const defaultConfig: AIConfig = {
  provider: 'qwen',
  apiKey: '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'qwen-plus',
};

let currentConfig = { ...defaultConfig };

export function configureAI(config: Partial<AIConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

// ---- Core AI Functions ----

async function callAI(systemPrompt: string, userPrompt: string, jsonSchema?: z.ZodSchema<any>): Promise<any> {
  if (!currentConfig.apiKey) {
    // Return structured mock data when no API key configured
    return generateMockResponse(systemPrompt, userPrompt);
  }

  const response = await fetch(`${currentConfig.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: currentConfig.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty AI response');
  }

  try {
    const parsed = JSON.parse(content);
    if (jsonSchema) {
      const result = jsonSchema.safeParse(parsed);
      if (!result.success) {
        // Retry once with correction
        const retryResponse = await callAI(
          systemPrompt + '\n\nIMPORTANT: Your previous response had validation errors. Fix them.',
          userPrompt + `\n\nValidation errors: ${result.error.message}`,
          jsonSchema
        );
        return retryResponse;
      }
      return result.data;
    }
    return parsed;
  } catch {
    throw new Error('Failed to parse AI response as JSON');
  }
}

// ---- Mock Data Generator (when no API key) ----
function generateMockResponse(systemPrompt: string, userPrompt: string): any {
  if (systemPrompt.includes('keywords')) {
    return generateMockKeywords(userPrompt);
  }
  if (systemPrompt.includes('niche')) {
    return generateMockNiches(userPrompt);
  }
  if (systemPrompt.includes('listing') || systemPrompt.includes('title') || systemPrompt.includes('tag')) {
    return generateMockListing(userPrompt);
  }
  return {};
}

function generateMockKeywords(prompt: string): any {
  const seed = prompt.toLowerCase();
  const keywords: KeywordResult[] = [
    {
      keyword: `${seed} personalized`,
      resultCount: 2450,
      competitionLevel: 'medium',
      titleFrequency: 12,
      tagFrequency: 8,
      medianPrice: 39.99,
      averagePrice: 42.50,
      minPrice: 19.99,
      maxPrice: 89.99,
      shopConcentration: 0.6,
      personalizationPrevalence: 0.75,
      longTailStrength: 0.7,
      buyerIntent: 'high',
      occasion: 'gift',
      recipient: 'general',
      niche: seed,
      source: ['marketplace_search', 'competitor_analysis'],
    },
    {
      keyword: `custom ${seed} sign`,
      resultCount: 1890,
      competitionLevel: 'medium',
      titleFrequency: 15,
      tagFrequency: 10,
      medianPrice: 44.99,
      averagePrice: 47.20,
      minPrice: 24.99,
      maxPrice: 99.99,
      shopConcentration: 0.5,
      personalizationPrevalence: 0.82,
      longTailStrength: 0.8,
      buyerIntent: 'high',
      occasion: 'gift',
      recipient: 'general',
      niche: seed,
      source: ['marketplace_search', 'competitor_tags'],
    },
    {
      keyword: `${seed} metal wall art`,
      resultCount: 3200,
      competitionLevel: 'high',
      titleFrequency: 20,
      tagFrequency: 14,
      medianPrice: 54.99,
      averagePrice: 58.00,
      minPrice: 29.99,
      maxPrice: 149.99,
      shopConcentration: 0.7,
      personalizationPrevalence: 0.45,
      longTailStrength: 0.5,
      buyerIntent: 'medium',
      niche: seed,
      source: ['marketplace_search'],
    },
    {
      keyword: `${seed} gift metal sign`,
      resultCount: 1650,
      competitionLevel: 'low',
      titleFrequency: 8,
      tagFrequency: 6,
      medianPrice: 34.99,
      averagePrice: 37.50,
      minPrice: 19.99,
      maxPrice: 69.99,
      shopConcentration: 0.4,
      personalizationPrevalence: 0.68,
      longTailStrength: 0.85,
      buyerIntent: 'high',
      occasion: 'gift',
      niche: seed,
      source: ['ai_expansion', 'competitor_analysis'],
    },
    {
      keyword: `personalized ${seed} name sign`,
      resultCount: 980,
      competitionLevel: 'low',
      titleFrequency: 5,
      tagFrequency: 4,
      medianPrice: 42.99,
      averagePrice: 45.00,
      minPrice: 29.99,
      maxPrice: 79.99,
      shopConcentration: 0.35,
      personalizationPrevalence: 0.92,
      longTailStrength: 0.9,
      buyerIntent: 'high',
      occasion: 'gift',
      recipient: 'general',
      niche: seed,
      source: ['ai_expansion', 'marketplace_search'],
    },
    {
      keyword: `${seed} rustic farmhouse decor`,
      resultCount: 4100,
      competitionLevel: 'high',
      titleFrequency: 18,
      tagFrequency: 12,
      medianPrice: 38.99,
      averagePrice: 41.00,
      minPrice: 15.99,
      maxPrice: 129.99,
      shopConcentration: 0.8,
      personalizationPrevalence: 0.35,
      longTailStrength: 0.4,
      buyerIntent: 'medium',
      niche: seed,
      source: ['marketplace_search'],
    },
  ];

  return {
    keywords,
    clusters: [
      { name: 'Product', type: 'product', keywords: ['metal sign', 'metal wall art', 'laser cut sign'] },
      { name: 'Recipient', type: 'recipient', keywords: [seed, 'gift for him', 'gift for her'] },
      { name: 'Occasion', type: 'occasion', keywords: ['birthday gift', 'christmas gift', 'housewarming'] },
      { name: 'Style', type: 'style', keywords: ['rustic', 'farmhouse', 'modern'] },
      { name: 'Personalization', type: 'personalization', keywords: ['custom name', 'personalized', 'family name'] },
    ],
  };
}

function generateMockNiches(prompt: string): any {
  const seed = prompt.toLowerCase();
  const niches: NicheOpportunity[] = [
    {
      id: '1',
      name: `Personalized ${seed} Metal Sign`,
      hierarchy: { broad: seed, subNiche: `${seed} Decor`, buyer: `${seed} Owner`, occasion: 'Gift', style: 'Rustic', personalization: 'Custom Name' },
      opportunityScore: 82,
      competition: 'medium',
      buyerIntent: 'high',
      personalizationPotential: 'high',
      giftPotential: 'high',
      averagePrice: { min: 34.99, max: 59.99 },
      recommendedProduct: `Custom ${seed} Name Metal Wall Sign`,
      recommendedDesign: `Laser-cut ${seed} silhouette with personalized family name`,
      primaryKeyword: `personalized ${seed} sign`,
      secondaryKeywords: [`custom ${seed} metal sign`, `${seed} wall art`, `${seed} gift`],
    },
    {
      id: '2',
      name: `${seed} Anniversary Gift`,
      hierarchy: { broad: seed, subNiche: `${seed} Celebration`, buyer: 'Couple', occasion: 'Anniversary', style: 'Elegant', personalization: 'Established Date' },
      opportunityScore: 78,
      competition: 'low',
      buyerIntent: 'high',
      personalizationPotential: 'high',
      giftPotential: 'high',
      averagePrice: { min: 39.99, max: 69.99 },
      recommendedProduct: `${seed} Anniversary Metal Sign with Established Year`,
      recommendedDesign: `${seed} design with "Est. YEAR" and couple names`,
      primaryKeyword: `${seed} anniversary gift`,
      secondaryKeywords: [`personalized anniversary sign`, `${seed} couple gift`, `wedding anniversary metal`],
    },
    {
      id: '3',
      name: `${seed} Retirement Gift`,
      hierarchy: { broad: seed, subNiche: `${seed} Career`, buyer: 'Retiree', occasion: 'Retirement', style: 'Classic', personalization: 'Name & Years' },
      opportunityScore: 74,
      competition: 'low',
      buyerIntent: 'high',
      personalizationPotential: 'high',
      giftPotential: 'high',
      averagePrice: { min: 39.99, max: 64.99 },
      recommendedProduct: `Retired ${seed} Personalized Metal Sign`,
      recommendedDesign: `"Retired [Profession]" with name and years of service`,
      primaryKeyword: `retired ${seed} gift`,
      secondaryKeywords: [`${seed} retirement sign`, `retirement gift metal`, `personalized retirement`],
    },
    {
      id: '4',
      name: `${seed} New Home Gift`,
      hierarchy: { broad: seed, subNiche: `${seed} Home`, buyer: 'New Homeowner', occasion: 'Housewarming', style: 'Farmhouse', personalization: 'Family Name' },
      opportunityScore: 71,
      competition: 'medium',
      buyerIntent: 'high',
      personalizationPotential: 'high',
      giftPotential: 'high',
      averagePrice: { min: 44.99, max: 74.99 },
      recommendedProduct: `Custom ${seed} Family Name Housewarming Sign`,
      recommendedDesign: `${seed} silhouette with family name and "Est." date`,
      primaryKeyword: `${seed} housewarming gift`,
      secondaryKeywords: [`new home ${seed} sign`, `custom family ${seed}`, `${seed} name sign`],
    },
  ];

  return { niches };
}

function generateMockListing(prompt: string): any {
  return {
    primaryKeyword: 'personalized metal sign',
    secondaryKeywords: ['custom metal wall art', 'laser cut sign', 'personalized gift'],
    title: 'Personalized Metal Sign Custom Family Name Wall Art Rustic Farmhouse Decor Gift',
    titleOptions: [
      { title: 'Personalized Metal Sign Custom Family Name Wall Art Rustic Farmhouse Home Decor Gift', strategy: 'search', charCount: 86 },
      { title: 'Custom Metal Sign Personalized Gift for Home Farmhouse Wall Decor Family Name Art', strategy: 'gift_intent', charCount: 82 },
      { title: 'Laser Cut Personalized Family Name Metal Sign Custom Farmhouse Wall Art Housewarming Gift', strategy: 'long_tail', charCount: 91 },
    ] as TitleOption[],
    tags: [
      { tag: 'personalized sign', charCount: 17, category: 'product' },
      { tag: 'metal wall art', charCount: 14, category: 'product' },
      { tag: 'custom family name', charCount: 18, category: 'personalization' },
      { tag: 'farmhouse decor', charCount: 15, category: 'style' },
      { tag: 'rustic wall sign', charCount: 16, category: 'style' },
      { tag: 'housewarming gift', charCount: 17, category: 'occasion' },
      { tag: 'birthday gift', charCount: 13, category: 'occasion' },
      { tag: 'custom metal sign', charCount: 17, category: 'product' },
      { tag: 'laser cut sign', charCount: 14, category: 'product' },
      { tag: 'home decor gift', charCount: 15, category: 'occasion' },
      { tag: 'family name sign', charCount: 16, category: 'personalization' },
      { tag: 'wedding gift', charCount: 12, category: 'occasion' },
      { tag: 'new home gift', charCount: 13, category: 'occasion' },
    ] as GeneratedTag[],
    description: 'Create a stunning personalized metal sign for your home or as a thoughtful gift. Each sign is precision laser-cut from high-quality metal and finished with a durable powder coat.\n\n**PERSONALIZATION**\nAdd your family name, established year, or custom text to make this sign uniquely yours.\n\n**FEATURES**\n• Precision laser-cut metal construction\n• Durable powder-coated finish\n• Multiple size options available\n• Indoor/outdoor rated\n• Easy wall mounting\n\n**SIZES AVAILABLE**\nChoose from 8" to 59" widths to perfectly fit your space.\n\n**COLORS**\nAvailable in Black, White, Red, Silver, Copper, Blue, Gold, and more.\n\n**SHIPPING**\nShips within 3-5 business days. Carefully packaged to ensure safe delivery.\n\n**PERFECT FOR**\nHousewarming gifts, wedding gifts, anniversary gifts, birthday gifts, or simply treating yourself to beautiful custom wall art.',
    materials: ['Metal', 'Powder Coat Finish'],
    suggestedAttributes: [
      { property: 'Occasion', value: 'Housewarming, Wedding, Birthday' },
      { property: 'Room', value: 'Living Room, Entryway, Kitchen' },
      { property: 'Style', value: 'Farmhouse, Rustic' },
    ],
    suggestedTaxonomy: ['Home & Living', 'Home Decor', 'Signs & Plaques'],
    personalizationInstructions: 'Please provide:\n1. Family name or text to display\n2. Established year (optional)\n3. Preferred size\n4. Preferred color\n\nPlease double-check spelling as it will be cut exactly as provided.',
    imageIdeas: [
      'Product front view on white background',
      'Lifestyle shot on farmhouse wall',
      'Close-up of laser-cut detail',
      'Size comparison with common objects',
      'Gift packaging presentation',
      'Multiple color options displayed',
    ],
    mockupIdeas: [
      'Sign above fireplace mantel',
      'Entryway wall display',
      'Kitchen wall above counter',
      'Outdoor porch mounting',
    ],
    faq: [
      { question: 'How do I personalize my sign?', answer: 'After purchase, add your family name, established year, or custom text in the personalization box.' },
      { question: 'What sizes are available?', answer: 'We offer sizes from 8" to 59" width. Check the listing for all available options.' },
      { question: 'Can this be used outdoors?', answer: 'Yes! Our powder-coated finish is rated for indoor and outdoor use.' },
      { question: 'How long does shipping take?', answer: 'Production takes 3-5 business days, then shipping based on your selected method.' },
    ],
    targetRecipient: 'Homeowners, couples, families',
    targetOccasion: 'Housewarming, Wedding, Anniversary',
  } as GeneratedListing;
}

// ---- Public API Functions ----

export async function generateKeywords(seedKeyword: string): Promise<{ keywords: KeywordResult[]; clusters: any[] }> {
  return callAI(
    'You are an Etsy SEO expert specializing in laser-cut metal signs. Generate keyword research results.',
    `Research keywords related to: "${seedKeyword}" for a laser-cut metal sign shop. Return JSON with keywords array and clusters array.`,
  );
}

export async function generateNiches(seedNiche: string): Promise<{ niches: NicheOpportunity[] }> {
  return callAI(
    'You are an Etsy niche research expert for laser-cut metal signs. Discover profitable niche opportunities.',
    `Find niche opportunities starting from: "${seedNiche}". Consider buyer intent, gift potential, personalization potential. Return JSON with niches array.`,
  );
}

export async function generateListing(options: {
  product: string;
  designDescription: string;
  personalization: string;
  targetCustomer: string;
  occasion: string;
  referenceKeyword: string;
}): Promise<GeneratedListing> {
  return callAI(
    'You are an Etsy listing optimization expert for StylinSoulMetalArt - a laser-cut metal sign shop. Generate complete listing content. Rules: No emojis in titles. No "16 gauge" in titles. Tags must be <= 20 chars. Generate exactly 13 tags. Focus on buyer intent.',
    `Generate a complete Etsy listing for:\nProduct: ${options.product}\nDesign: ${options.designDescription}\nPersonalization: ${options.personalization}\nTarget: ${options.targetCustomer}\nOccasion: ${options.occasion}\nKeyword: ${options.referenceKeyword}`,
  );
}

export async function analyzeListing(listing: { title: string; tags: string[]; description: string }): Promise<any> {
  return callAI(
    'You are an Etsy listing analyzer for laser-cut metal signs. Analyze the listing and provide optimization suggestions.',
    `Analyze this listing:\nTitle: ${listing.title}\nTags: ${listing.tags.join(', ')}\nDescription: ${listing.description.substring(0, 500)}\n\nProvide JSON with: titleAnalysis, tagAnalysis, descriptionAnalysis, suggestions[]`,
  );
}

export async function generateTitles(product: string, keywords: string[]): Promise<TitleOption[]> {
  return callAI(
    'Generate 3 Etsy title options for a laser-cut metal sign. Rules: No emojis, no "16 gauge", natural English, most important phrase near beginning, include high-intent phrases, max 140 characters.',
    `Product: ${product}\nKeywords: ${keywords.join(', ')}\n\nGenerate 3 titles: one search-focused, one gift-intent-focused, one long-tail niche-focused.`,
  );
}

export async function generateTags(product: string, keywords: string[]): Promise<GeneratedTag[]> {
  return callAI(
    'Generate exactly 13 Etsy tags for a laser-cut metal sign. Each tag must be <= 20 characters. Cover product, recipient, occasion, style, and personalization dimensions. No near-duplicates.',
    `Product: ${product}\nKeywords: ${keywords.join(', ')}\n\nGenerate exactly 13 tags with character counts and categories.`,
  );
}

export async function generateDescription(listing: {
  product: string;
  personalization: string;
  sizes: string[];
  colors: string[];
}): Promise<string> {
  return callAI(
    'Generate an Etsy product description for a laser-cut metal sign. Include personalization instructions, features, sizes, colors, shipping info, and gift suggestions.',
    `Product: ${listing.product}\nPersonalization: ${listing.personalization}\nSizes: ${listing.sizes.join(', ')}\nColors: ${listing.colors.join(', ')}`,
  );
}

export async function analyzeCompetitors(query: string): Promise<any> {
  return callAI(
    'Analyze competitor listings for an Etsy metal sign search query. Identify common patterns, keyword gaps, and opportunities.',
    `Analyze competitors for: "${query}"\nProvide JSON with: commonKeywords[], keywordGaps[], priceBand{min,max}, personalizationPatterns[], nichePositioning[]`,
  );
}
