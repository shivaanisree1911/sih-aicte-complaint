import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateJaccardSimilarity, tokenizeText, areCategoriesSynergistic } from '../src/utils/jaccard.js';

test('Overlap Engine - Text Tokenization & Stopword Stripping & Stemming', () => {
  const text = 'Complaint regarding structural safety hazards and deficient laboratories in college';
  const tokens = tokenizeText(text);

  assert.ok(tokens.has('structural'));
  assert.ok(tokens.has('safety'));
  assert.ok(tokens.has('hazard')); // stemmed from hazards
  assert.ok(tokens.has('deficient'));
  assert.ok(tokens.has('laboratory')); // stemmed from laboratories

  // Ensure stopwords like "regarding", "and", "in", "college" were removed
  assert.ok(!tokens.has('regarding'));
  assert.ok(!tokens.has('and'));
  assert.ok(!tokens.has('in'));
  assert.ok(!tokens.has('college'));
});

test('Overlap Engine - Jaccard Similarity Calculation', () => {
  const textA = 'Deficient computer laboratories and structural safety hazards in engineering block';
  const textB = 'Regulatory non-compliance regarding laboratory carpet area and building safety norms';
  const textC = 'Delay in distribution of semester grade sheets and provisional marksheets';

  const simAB = calculateJaccardSimilarity(textA, textB);
  const simAC = calculateJaccardSimilarity(textA, textC);

  assert.ok(simAB >= 0.12, `Expected simAB >= 0.12, got ${simAB}`);
  assert.ok(simAC < 0.05, `Expected simAC < 0.05, got ${simAC}`);
  assert.ok(simAB > simAC, `Overlapping issues must score higher than unrelated issue`);
});

test('Overlap Engine - Category Synergy Matrix Validation', () => {
  // Related pairs
  assert.strictEqual(areCategoriesSynergistic('Infrastructure', 'Regulatory Compliance'), true);
  assert.strictEqual(areCategoriesSynergistic('Regulatory Compliance', 'Infrastructure'), true);
  assert.strictEqual(areCategoriesSynergistic('Admission and Fee Issues', 'Student Grievances'), true);
  assert.strictEqual(areCategoriesSynergistic('Faculty and Staffing', 'Academic Issues'), true);

  // Identical category
  assert.strictEqual(areCategoriesSynergistic('Infrastructure', 'Infrastructure'), true);

  // Unrelated pairs
  assert.strictEqual(areCategoriesSynergistic('Examination-Related Issues', 'Infrastructure'), false);
});
