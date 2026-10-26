const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with', 'institution', 'college',
  'complaint', 'regarding', 'issue', 'issues', 'student', 'students',
  'faculty', 'aicte', 'against', 'request', 'matter'
]);

/**
 * Lightweight stemming helper to normalize basic plurals (e.g. laboratories -> laboratory)
 */
function stemWord(word) {
  if (word.endsWith('ies') && word.length > 5) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && word.length > 4 && !word.endsWith('ies')) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    return word.slice(0, -1);
  }
  return word;
}

/**
 * Tokenize, normalize, and remove stopwords from a given text string.
 */
export function tokenizeText(text) {
  if (!text || typeof text !== 'string') return new Set();
  
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token))
    .map(token => stemWord(token));

  return new Set(tokens);
}

/**
 * Calculates Token-based Jaccard Similarity between two text strings:
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * Returns a score between 0.0 and 1.0.
 */
export function calculateJaccardSimilarity(textA, textB) {
  const tokensA = tokenizeText(textA);
  const tokensB = tokenizeText(textB);

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  if (unionCount === 0) return 0;

  const score = intersectionCount / unionCount;
  return Math.round(score * 100) / 100;
}

/**
 * Check if two categories have known cross-bureau synergy.
 */
export const CATEGORY_SYNERGY_MAP = {
  'Infrastructure': ['Regulatory Compliance', 'Approval and Accreditation'],
  'Regulatory Compliance': ['Infrastructure', 'Approval and Accreditation', 'Faculty and Staffing'],
  'Faculty and Staffing': ['Academic Issues', 'Regulatory Compliance'],
  'Admission and Fee Issues': ['Student Grievances', 'Regulatory Compliance'],
  'Student Grievances': ['Admission and Fee Issues', 'Academic Issues', 'Examination-Related Issues'],
  'Approval and Accreditation': ['Regulatory Compliance', 'Infrastructure', 'Faculty and Staffing']
};

export function areCategoriesSynergistic(catA, catB) {
  if (!catA || !catB) return false;
  if (catA === catB) return true;
  const related = CATEGORY_SYNERGY_MAP[catA];
  return !!(related && related.includes(catB));
}
