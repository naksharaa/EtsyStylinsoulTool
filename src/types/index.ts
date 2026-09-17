// ============================================
// Core Type Definitions for StylinSoulMetalArt
// ============================================

import { z } from 'zod';

// ---- Etsy Listing Types ----
export interface EtsyListing {
  listing_id: number;
  title: string;
  description: string;
  tags: string[];
  taxonomy_id?: number;
  taxonomy_path?: string[];
  price: string;
  currency_code: string;
  quantity: number;
  state: 'active' | 'draft' | 'inactive' | 'sold_out' | 'expired' | 'deleted';
  sku?: string[];
  materials?: string[];
  who_made?: 'i_did' | 'someone_else' | 'collective';
  when_made?: '2020_2025' | '2010_2019' | '2008_2009' | 'before_2008' | 'made_to_order';
  is_supply: boolean;
  images: EtsyListingImage[];
  video?: EtsyVideo;
  url: string;
  views?: number;
  num_favorers?: number;
  creation_tsz: number;
  ending_tsz?: number;
  modified_tsz: number;
  state_tsz?: number;
  shop_id: number;
  user_ctype?: string;
  is_digital: boolean;
  should_auto_renew?: boolean;
  language?: string;
  has_variations?: boolean;
  inventory?: EtsyInventory;
  shipping_profile_id?: number;
  processing_time?: EtsyProcessingTime;
  personalized?: boolean;
  personalization_instructions?: string;
  style_tags?: string[];
  item_type?: string;
  // Internal fields
  seoScore?: number;
  optimizationStatus?: 'optimized' | 'needs_improvement' | 'not_analyzed';
  performance?: 'winner' | 'average' | 'needs_improvement' | 'not_set';
}

export interface EtsyListingImage {
  url_fullxfull: string;
  url_170x135?: string;
  url_570xN?: string;
  url_794xN?: string;
  listing_image_id?: number;
  rank?: number;
  hex_code?: string;
  red?: number;
  green?: number;
  blue?: number;
}

export interface EtsyVideo {
  video_id: number;
  url_720p?: string;
  url_1080p?: string;
}

export interface EtsyInventory {
  products: EtsyInventoryProduct[];
  price_on_property?: number[];
  quantity_on_property?: number[];
}

export interface EtsyInventoryProduct {
  product_id: number;
  sku?: string[];
  is_deleted?: boolean;
  property_values: EtsyPropertyValue[];
  offerings: EtsyInventoryOffering[];
}

export interface EtsyPropertyValue {
  property_id: number;
  property_name: string;
  value_ids: number[];
  values: string[];
  scale_id?: number;
}

export interface EtsyInventoryOffering {
  offering_id: number;
  quantity: number;
  is_enabled: boolean;
  price: string;
  currency_code: string;
}

export interface EtsyProcessingTime {
  min_value: number;
  max_value: number;
}

// ---- Etsy Order/Transaction Types ----
export interface EtsyReceipt {
  receipt_id: number;
  listing_id?: number;
  buyer_user_id?: number;
  name?: string;
  first_line?: string;
  second_line?: string;
  city?: string;
  state?: string;
  zip?: string;
  country_id?: number;
  formatted_address?: string;
  payment_method: string;
  quantity: number;
  total_price: string;
  subtotal_price?: string;
  total_shipping_cost?: string;
  total_tax_cost?: string;
  currency_code: string;
  was_paid_tsz: number;
  created_tsz: number;
  transactions: EtsyTransaction[];
}

export interface EtsyTransaction {
  transaction_id: number;
  title: string;
  listing_id: number;
  buyer_user_id?: number;
  quantity: number;
  price: string;
  currency_code: string;
  is_digital: boolean;
  product_id?: number;
  variations?: EtsyVariation[];
  create_tsz: number;
  paid_tsz?: number;
  ship_tsz?: number;
}

export interface EtsyVariation {
  property_id: number;
  property_name: string;
  value_id?: number;
  formatted_value: string;
}

// ---- Etsy Shop Types ----
export interface EtsyShop {
  shop_id: number;
  shop_name: string;
  user_id: number;
  currency_code: string;
  create_date: number;
  title?: string;
  announcement?: string;
  listing_active_count?: number;
  num_favorers?: number;
  url?: string;
  image_url_760x100?: string;
  image_url_300x300?: string;
}

// ---- OAuth Types ----
export interface EtsyOAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  scope?: string;
}

export interface EtsyOAuthState {
  code_verifier: string;
  code_challenge: string;
  state: string;
  created_at: number;
}

// ---- SEO Score Types ----
export interface SEOScore {
  total: number;
  maxScore: 100;
  components: SEOScoreComponent[];
  label: string;
}

export interface SEOScoreComponent {
  name: string;
  score: number;
  maxScore: number;
  details: SEOScoreDetail[];
}

export interface SEOScoreDetail {
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  points: number;
}

// ---- Keyword Research Types ----
export interface KeywordResearch {
  id: string;
  seedKeyword: string;
  keywords: KeywordResult[];
  clusters: KeywordCluster[];
  createdAt: number;
  shopId: string;
}

export interface KeywordResult {
  keyword: string;
  resultCount: number;
  competitionLevel: 'low' | 'medium' | 'high' | 'very_high';
  titleFrequency: number;
  tagFrequency: number;
  medianPrice: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  shopConcentration: number;
  personalizationPrevalence: number;
  longTailStrength: number;
  buyerIntent: string;
  occasion?: string;
  recipient?: string;
  niche?: string;
  source: string[];
}

export interface KeywordCluster {
  name: string;
  type: 'product' | 'recipient' | 'occasion' | 'style' | 'location' | 'personalization';
  keywords: string[];
}

// ---- Niche Types ----
export interface NicheResearch {
  id: string;
  seedNiche: string;
  niches: NicheOpportunity[];
  createdAt: number;
}

export interface NicheOpportunity {
  id: string;
  name: string;
  hierarchy: NicheHierarchy;
  opportunityScore: number;
  competition: 'low' | 'medium' | 'high';
  buyerIntent: 'low' | 'medium' | 'high';
  personalizationPotential: 'low' | 'medium' | 'high';
  giftPotential: 'low' | 'medium' | 'high';
  averagePrice: { min: number; max: number };
  recommendedProduct: string;
  recommendedDesign: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
}

export interface NicheHierarchy {
  broad: string;
  subNiche: string;
  buyer: string;
  occasion: string;
  style: string;
  personalization: string;
}

// ---- Competitor Types ----
export interface CompetitorSearch {
  id: string;
  query: string;
  listings: CompetitorListing[];
  commonKeywords: string[];
  keywordGaps: string[];
  commonPriceBand: { min: number; max: number };
  personalizationPatterns: string[];
  createdAt: number;
}

export interface CompetitorListing {
  listing_id: number;
  title: string;
  price: string;
  shop_name: string;
  url: string;
  tags?: string[];
  images: EtsyListingImage[];
  personalized?: boolean;
  taxonomy?: string[];
}

// ---- Listing Builder Types ----
export interface GeneratedListing {
  primaryKeyword: string;
  secondaryKeywords: string[];
  title: string;
  titleOptions: TitleOption[];
  tags: GeneratedTag[];
  description: string;
  materials: string[];
  suggestedAttributes: SuggestedAttribute[];
  suggestedTaxonomy: string[];
  personalizationInstructions: string;
  imageIdeas: string[];
  mockupIdeas: string[];
  faq: FAQItem[];
  targetRecipient: string;
  targetOccasion: string;
}

export interface TitleOption {
  title: string;
  strategy: 'search' | 'gift_intent' | 'long_tail';
  charCount: number;
}

export interface GeneratedTag {
  tag: string;
  charCount: number;
  category: 'product' | 'recipient' | 'occasion' | 'style' | 'personalization';
}

export interface SuggestedAttribute {
  property: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

// ---- Optimization Types ----
export interface OptimizationReport {
  id: string;
  listingId: number;
  currentScore: SEOScore;
  proposedScore: SEOScore;
  currentTitle: string;
  proposedTitle: string;
  currentTags: string[];
  proposedTags: string[];
  currentDescription: string;
  proposedDescription: string;
  removedTags: string[];
  addedTags: string[];
  createdAt: number;
  applied: boolean;
}

// ---- Listing Change/Snapshot Types ----
export interface ListingSnapshot {
  id: string;
  listingId: number;
  title: string;
  description: string;
  tags: string[];
  price: string;
  quantity: number;
  personalizationInstructions: string;
  snapshotAt: number;
  changeReason?: string;
}

export interface ListingChange {
  id: string;
  listingId: number;
  field: string;
  oldValue: string;
  newValue: string;
  changedAt: number;
  snapshotId: string;
  rolledBack: boolean;
}

// ---- Sales Intelligence Types ----
export interface SalesData {
  period: '7d' | '30d' | '90d' | '12m' | 'custom';
  revenue: number;
  unitsSold: number;
  orders: number;
  averageOrderValue: number;
  topProducts: TopProduct[];
  revenueByDate: DatePoint[];
  salesByNiche: NicheSaleData[];
}

export interface TopProduct {
  listingId: number;
  title: string;
  unitsSold: number;
  revenue: number;
  image?: string;
}

export interface DatePoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface NicheSaleData {
  niche: string;
  revenue: number;
  orders: number;
  unitsSold: number;
  avgPrice: number;
}

// ---- Saved Research Types ----
export interface SavedResearch {
  id: string;
  type: 'keyword' | 'niche' | 'competitor' | 'listing_idea' | 'optimization';
  title: string;
  data: any;
  folder: 'researching' | 'design_needed' | 'ready_to_list' | 'listed' | 'rejected';
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ---- Shop Config (Metal Sign specifics) ----
export const METAL_SIGN_CONFIG = {
  colors: [
    'Black', 'Red', 'White', 'Silver', 'Copper', 'Blue', 'Gold',
    'Green', 'Pink', 'Anthracite', 'Cream', 'Chrome', 'Yellow'
  ],
  sizes: [
    '8"', '10"', '12"', '14"', '15"', '18"', '24"', '30"',
    '36"', '40"', '44"', '48"', '55"', '59"'
  ],
  personalizationOptions: [
    'Name', 'Family Name', 'Established Year', 'Date',
    'Profession', 'Title', 'Custom Text'
  ],
  titleRules: {
    noEmojis: true,
    noGaugeInfo: true,
    maxChars: 140, // Etsy title limit
  },
  tagRules: {
    maxChars: 20,
    count: 13,
  }
} as const;

// ---- Zod Schemas for AI Validation ----
export const GeneratedTagsSchema = z.object({
  tags: z.array(z.object({
    tag: z.string().max(20),
    category: z.enum(['product', 'recipient', 'occasion', 'style', 'personalization']),
  })).length(13),
});

export const TitleOptionsSchema = z.array(z.object({
  title: z.string().max(140),
  strategy: z.enum(['search', 'gift_intent', 'long_tail']),
})).length(3);

export const NicheOpportunitiesSchema = z.array(z.object({
  name: z.string(),
  hierarchy: z.object({
    broad: z.string(),
    subNiche: z.string(),
    buyer: z.string(),
    occasion: z.string(),
    style: z.string(),
    personalization: z.string(),
  }),
  opportunityScore: z.number().min(0).max(100),
  competition: z.enum(['low', 'medium', 'high']),
  buyerIntent: z.enum(['low', 'medium', 'high']),
  personalizationPotential: z.enum(['low', 'medium', 'high']),
  giftPotential: z.enum(['low', 'medium', 'high']),
  primaryKeyword: z.string(),
  secondaryKeywords: z.array(z.string()),
}));

// ---- App State Types ----
export interface AppState {
  shop: EtsyShop | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  listings: EtsyListing[];
  selectedListing: EtsyListing | null;
}

// ---- Navigation Types ----
export type NavPage = 
  | 'dashboard'
  | 'listings'
  | 'analyzer'
  | 'keywords'
  | 'niches'
  | 'competitors'
  | 'builder'
  | 'bulk'
  | 'sales'
  | 'saved'
  | 'history'
  | 'settings';
