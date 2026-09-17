// ============================================
// StylinSoul Optimization Score Engine
// ============================================
// Internal scoring system - NOT an official Etsy metric
// Clearly labeled as "StylinSoul Optimization Score"

import type { EtsyListing, SEOScore, SEOScoreComponent, SEOScoreDetail } from '../../types';

interface ScoreConfig {
  keywordTargeting: number;
  tags: number;
  titleStructure: number;
  attributes: number;
  description: number;
  personalization: number;
  competitivePositioning: number;
}

const DEFAULT_CONFIG: ScoreConfig = {
  keywordTargeting: 25,
  tags: 20,
  titleStructure: 15,
  attributes: 15,
  description: 10,
  personalization: 5,
  competitivePositioning: 10,
};

export function calculateSEOScore(listing: EtsyListing, config: ScoreConfig = DEFAULT_CONFIG): SEOScore {
  const components: SEOScoreComponent[] = [];
  components.push(analyzeKeywordTargeting(listing, config.keywordTargeting));
  components.push(analyzeTags(listing, config.tags));
  components.push(analyzeTitleStructure(listing, config.titleStructure));
  components.push(analyzeAttributes(listing, config.attributes));
  components.push(analyzeDescription(listing, config.description));
  components.push(analyzePersonalization(listing, config.personalization));
  components.push(analyzeCompetitivePositioning(listing, config.competitivePositioning));

  const total = components.reduce((sum: number, c: SEOScoreComponent) => sum + c.score, 0);

  return {
    total: Math.round(total),
    maxScore: 100,
    components,
    label: 'StylinSoul Optimization Score',
  };
}

function analyzeKeywordTargeting(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;
  const title = listing.title.toLowerCase();
  const tags = listing.tags.map((t: string) => t.toLowerCase());

  const hasStrongKeyword = tags.some((tag: string) => {
    const words = tag.split(/\s+/);
    return words.length >= 2 && title.includes(tag);
  });

  if (hasStrongKeyword) {
    score += 8;
    details.push({ message: 'Multi-word keywords from tags appear in title', type: 'success', points: 8 });
  } else {
    details.push({ message: 'Consider using tag keywords in title for better relevance', type: 'warning', points: 0 });
  }

  const intentKeywords = ['gift', 'personalized', 'custom', 'handmade', 'unique', 'birthday', 'christmas', 'wedding', 'anniversary', 'retirement'];
  const foundIntent = intentKeywords.filter((kw: string) => title.includes(kw) || tags.some((t: string) => t.includes(kw)));

  if (foundIntent.length >= 2) {
    score += 7;
    details.push({ message: `Strong buyer intent keywords: ${foundIntent.join(', ')}`, type: 'success', points: 7 });
  } else if (foundIntent.length === 1) {
    score += 4;
    details.push({ message: 'Add more buyer intent keywords (gift, personalized, occasion terms)', type: 'warning', points: 4 });
  } else {
    details.push({ message: 'Missing buyer intent keywords - add terms like "gift", "personalized"', type: 'error', points: 0 });
  }

  const recipientKeywords = ['mom', 'dad', 'nurse', 'doctor', 'teacher', 'couple', 'family', 'mechanic', 'horse', 'farmer'];
  const foundRecipient = recipientKeywords.filter((kw: string) => title.includes(kw) || tags.some((t: string) => t.includes(kw)));

  if (foundRecipient.length >= 1) {
    score += 5;
    details.push({ message: `Recipient targeting: ${foundRecipient.join(', ')}`, type: 'success', points: 5 });
  } else {
    details.push({ message: 'No recipient keywords found - target specific buyers', type: 'warning', points: 0 });
  }

  const uniqueConcepts = new Set(tags.map((t: string) => t.split(/\s+/)[0]));
  if (uniqueConcepts.size >= 8) {
    score += 5;
    details.push({ message: 'Good keyword diversity across tags', type: 'success', points: 5 });
  } else {
    score += 2;
    details.push({ message: 'Increase keyword diversity - cover more concepts', type: 'warning', points: 2 });
  }

  return { name: 'Keyword Targeting', score: Math.min(score, maxScore), maxScore, details };
}

function analyzeTags(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;
  const tags = listing.tags;

  if (tags.length === 13) {
    score += 6;
    details.push({ message: 'Using all 13 available tags', type: 'success', points: 6 });
  } else if (tags.length >= 10) {
    score += 4;
    details.push({ message: `Using ${tags.length}/13 tags - add more for better reach`, type: 'warning', points: 4 });
  } else if (tags.length >= 7) {
    score += 2;
    details.push({ message: `Only ${tags.length}/13 tags used - significantly underutilized`, type: 'error', points: 2 });
  } else {
    details.push({ message: `Only ${tags.length}/13 tags - critically underutilized`, type: 'error', points: 0 });
  }

  const longTags = tags.filter((t: string) => t.length >= 15 && t.length <= 20);
  if (longTags.length >= 5) {
    score += 5;
    details.push({ message: 'Good use of long-tail tags (15-20 chars)', type: 'success', points: 5 });
  } else if (longTags.length >= 3) {
    score += 3;
    details.push({ message: 'Some long-tail tags - add more specific phrases', type: 'warning', points: 3 });
  } else {
    details.push({ message: 'Tags are too short - use longer specific phrases', type: 'error', points: 0 });
  }

  const nearDuplicates = findNearDuplicates(tags);
  if (nearDuplicates.length === 0) {
    score += 5;
    details.push({ message: 'No duplicate or near-duplicate tags', type: 'success', points: 5 });
  } else if (nearDuplicates.length <= 2) {
    score += 3;
    details.push({ message: `Some near-duplicate tags found: ${nearDuplicates.join(', ')}`, type: 'warning', points: 3 });
  } else {
    details.push({ message: `Multiple duplicate concepts: ${nearDuplicates.join(', ')}`, type: 'error', points: 0 });
  }

  const dimensions = {
    product: tags.some((t: string) => /sign|art|metal|wall|decor/i.test(t)),
    recipient: tags.some((t: string) => /mom|dad|nurse|doctor|teacher|couple|family/i.test(t)),
    occasion: tags.some((t: string) => /gift|birthday|christmas|wedding|anniversary|retirement/i.test(t)),
    style: tags.some((t: string) => /rustic|farmhouse|modern|western|vintage/i.test(t)),
    personalization: tags.some((t: string) => /custom|personalized|name|monogram/i.test(t)),
  };
  const coveredDimensions = Object.values(dimensions).filter(Boolean).length;

  if (coveredDimensions >= 4) {
    score += 4;
    details.push({ message: `Covering ${coveredDimensions}/5 keyword dimensions`, type: 'success', points: 4 });
  } else if (coveredDimensions >= 3) {
    score += 2;
    details.push({ message: `Only ${coveredDimensions}/5 keyword dimensions covered`, type: 'warning', points: 2 });
  } else {
    details.push({ message: `Only ${coveredDimensions}/5 keyword dimensions - add recipient, occasion, style tags`, type: 'error', points: 0 });
  }

  return { name: 'Tags', score: Math.min(score, maxScore), maxScore, details };
}

function analyzeTitleStructure(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;
  const title = listing.title;

  if (title.length >= 100 && title.length <= 140) {
    score += 4;
    details.push({ message: `Title length optimal: ${title.length} characters`, type: 'success', points: 4 });
  } else if (title.length >= 70) {
    score += 2;
    details.push({ message: `Title could be longer: ${title.length} characters (aim for 100-140)`, type: 'warning', points: 2 });
  } else {
    details.push({ message: `Title too short: ${title.length} characters - use more of available space`, type: 'error', points: 0 });
  }

  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  if (!emojiRegex.test(title)) {
    score += 3;
    details.push({ message: 'No emojis in title (correct for Etsy metal signs)', type: 'success', points: 3 });
  } else {
    details.push({ message: 'Remove emojis from title - not appropriate for this product', type: 'error', points: 0 });
  }

  const wordCount = title.split(/\s+/).length;
  if (wordCount >= 8 && wordCount <= 20) {
    score += 4;
    details.push({ message: 'Title reads naturally', type: 'success', points: 4 });
  } else if (wordCount >= 6) {
    score += 2;
    details.push({ message: 'Title could read more naturally', type: 'warning', points: 2 });
  } else {
    details.push({ message: 'Title too short for natural readability', type: 'warning', points: 0 });
  }

  const firstThreeWords = title.split(/\s+/).slice(0, 3).join(' ').toLowerCase();
  const productKeywords = ['metal', 'sign', 'personalized', 'custom', 'wall art'];
  const startsWithProduct = productKeywords.some((kw: string) => firstThreeWords.includes(kw));

  if (startsWithProduct) {
    score += 4;
    details.push({ message: 'Product keyword near beginning of title', type: 'success', points: 4 });
  } else {
    score += 1;
    details.push({ message: 'Consider moving main product keyword to beginning of title', type: 'warning', points: 1 });
  }

  return { name: 'Title Structure', score: Math.min(score, maxScore), maxScore, details };
}

function analyzeAttributes(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;

  if (listing.taxonomy_id && listing.taxonomy_path && listing.taxonomy_path.length > 0) {
    score += 8;
    details.push({ message: `Taxonomy set: ${listing.taxonomy_path.join(' > ')}`, type: 'success', points: 8 });
  } else {
    details.push({ message: 'No taxonomy/category assigned - critical for Etsy filters', type: 'error', points: 0 });
  }

  if (listing.materials && listing.materials.length > 0) {
    score += 4;
    details.push({ message: `Materials listed: ${listing.materials.join(', ')}`, type: 'success', points: 4 });
  } else {
    details.push({ message: 'No materials listed - add metal type and finish', type: 'warning', points: 0 });
  }

  if (listing.who_made && listing.when_made) {
    score += 3;
    details.push({ message: 'Production details set (who made / when made)', type: 'success', points: 3 });
  } else {
    details.push({ message: 'Set who_made and when_made attributes', type: 'warning', points: 0 });
  }

  return { name: 'Attributes', score: Math.min(score, maxScore), maxScore, details };
}

function analyzeDescription(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;
  const desc = listing.description || '';

  if (desc.length >= 500) {
    score += 3;
    details.push({ message: `Description length good: ${desc.length} characters`, type: 'success', points: 3 });
  } else if (desc.length >= 200) {
    score += 2;
    details.push({ message: `Description could be longer: ${desc.length} characters`, type: 'warning', points: 2 });
  } else {
    details.push({ message: `Description too short: ${desc.length} characters - add more detail`, type: 'error', points: 0 });
  }

  const hasDimensions = /\d+["'\s]*(x|by|inches?|cm)/i.test(desc);
  const hasMaterials = /metal|steel|aluminum|iron/i.test(desc);
  const hasPersonalization = /personal|custom|name|text/i.test(desc);
  const hasShipping = /ship|delivery|arrive/i.test(desc);
  const infoCount = [hasDimensions, hasMaterials, hasPersonalization, hasShipping].filter(Boolean).length;

  if (infoCount >= 3) {
    score += 4;
    details.push({ message: 'Description includes key product information', type: 'success', points: 4 });
  } else if (infoCount >= 2) {
    score += 2;
    details.push({ message: 'Add more product details (dimensions, materials, shipping)', type: 'warning', points: 2 });
  } else {
    details.push({ message: 'Description missing key information buyers need', type: 'error', points: 0 });
  }

  const paragraphs = desc.split(/\n\n+/).filter((p: string) => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    score += 3;
    details.push({ message: 'Well-structured description with clear paragraphs', type: 'success', points: 3 });
  } else if (paragraphs.length >= 2) {
    score += 1;
    details.push({ message: 'Break description into more readable paragraphs', type: 'warning', points: 1 });
  } else {
    details.push({ message: 'Description is one block of text - improve readability', type: 'warning', points: 0 });
  }

  return { name: 'Description', score: Math.min(score, maxScore), maxScore, details };
}

function analyzePersonalization(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;

  if (listing.personalized) {
    score += 3;
    details.push({ message: 'Personalization is enabled', type: 'success', points: 3 });
    if (listing.personalization_instructions && listing.personalization_instructions.length >= 50) {
      score += 2;
      details.push({ message: 'Clear personalization instructions provided', type: 'success', points: 2 });
    } else {
      details.push({ message: 'Add more detailed personalization instructions', type: 'warning', points: 0 });
    }
  } else {
    details.push({ message: 'Personalization not enabled - consider offering it for metal signs', type: 'info', points: 0 });
  }

  return { name: 'Personalization', score: Math.min(score, maxScore), maxScore, details };
}

function analyzeCompetitivePositioning(listing: EtsyListing, maxScore: number): SEOScoreComponent {
  const details: SEOScoreDetail[] = [];
  let score = 0;

  const price = parseFloat(listing.price);
  if (price >= 25 && price <= 75) {
    score += 5;
    details.push({ message: `Price point ($${price}) is in competitive range for metal signs`, type: 'success', points: 5 });
  } else if (price >= 15) {
    score += 3;
    details.push({ message: `Price ($${price}) - verify against competitor pricing`, type: 'info', points: 3 });
  } else {
    score += 1;
    details.push({ message: `Price ($${price}) seems low - may signal lower quality to buyers`, type: 'warning', points: 1 });
  }

  const imageCount = listing.images?.length || 0;
  if (imageCount >= 5) {
    score += 5;
    details.push({ message: `${imageCount} images - good visual coverage`, type: 'success', points: 5 });
  } else if (imageCount >= 3) {
    score += 3;
    details.push({ message: `${imageCount} images - add more angles and lifestyle shots`, type: 'warning', points: 3 });
  } else {
    score += 1;
    details.push({ message: `Only ${imageCount} images - add more for buyer confidence`, type: 'error', points: 1 });
  }

  return { name: 'Competitive Positioning', score: Math.min(score, maxScore), maxScore, details };
}

function findNearDuplicates(tags: string[]): string[] {
  const nearDupes: string[] = [];
  for (let i = 0; i < tags.length; i++) {
    for (let j = i + 1; j < tags.length; j++) {
      const a = tags[i].toLowerCase().replace(/\s+/g, '');
      const b = tags[j].toLowerCase().replace(/\s+/g, '');
      if (a === b + 's' || b === a + 's' || a === b + 'es' || b === a + 'es') {
        nearDupes.push(`${tags[i]} / ${tags[j]}`);
      }
      if (a.length > 5 && b.length > 5) {
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        if (longer.startsWith(shorter) && longer.length - shorter.length <= 3) {
          nearDupes.push(`${tags[i]} / ${tags[j]}`);
        }
      }
    }
  }
  return [...new Set(nearDupes)];
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent', color: 'emerald' };
  if (score >= 70) return { label: 'Good', color: 'blue' };
  if (score >= 50) return { label: 'Needs Work', color: 'amber' };
  if (score >= 30) return { label: 'Poor', color: 'orange' };
  return { label: 'Critical', color: 'red' };
}
