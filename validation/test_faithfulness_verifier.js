/**
 * test_faithfulness_verifier.js — validates that the verifier correctly
 * distinguishes faithful narratives from ones with injected numeric
 * fabrications, using constructed test narratives (not live model
 * output — no API key is used or required for this test).
 */

const { projectRmdSchedule } = require('../src/calculator');
const { verifyFaithfulness } = require('../src/faithfulnessVerifier');

const schedule = projectRmdSchedule({
  currentAge: 62, traditionalBalance: 1200000, growthRate: 0.06,
  rmdStartAge: 73, otherTaxableIncome: 40000, projectionYears: 15,
});

const peak = schedule.reduce((m, y) => (y.rmd > m.rmd ? y : m), schedule[0]);

// Case 1: a faithful narrative — every number quoted is drawn directly
// from the computed schedule above.
const faithfulNarrative = `
Your projected RMDs stay modest through your late 60s and early 70s,
but begin rising sharply once required distributions begin at age 73.
The largest single-year distribution in this projection occurs at
age ${peak.age}, at approximately $${peak.rmd.toLocaleString()}, which
pushes your taxable income for that year to roughly
$${peak.taxableIncome.toLocaleString()}, estimated at a marginal rate
of ${Math.round(peak.marginalRate * 100)}%.
`;

// Case 2: an unfaithful narrative — structurally similar, but with two
// numbers altered to values that do not appear anywhere in the schedule
// (simulating a hallucinated or miscalculated figure).
const fabricatedPeakRmd = peak.rmd + 47000; // invented, does not match schedule
const fabricatedAge = peak.age + 3;          // invented, wrong peak age
const unfaithfulNarrative = `
Your projected RMDs stay modest through your late 60s and early 70s,
but begin rising sharply once required distributions begin at age 73.
The largest single-year distribution in this projection occurs at
age ${fabricatedAge}, at approximately $${fabricatedPeakRmd.toLocaleString()},
which is the key figure driving your long-term tax exposure.
`;

console.log('=== Case 1: faithful narrative ===');
const result1 = verifyFaithfulness(faithfulNarrative, schedule);
console.log(result1);
console.assert(result1.faithful === true, 'FAIL: faithful narrative flagged as unfaithful');

console.log('\n=== Case 2: narrative with injected fabrications ===');
const result2 = verifyFaithfulness(unfaithfulNarrative, schedule);
console.log(result2);
console.assert(result2.faithful === false, 'FAIL: unfaithful narrative not detected');
console.assert(result2.unsupportedDollarFigures.includes(fabricatedPeakRmd),
  'FAIL: fabricated dollar figure not caught');
console.assert(result2.unsupportedAgeReferences.includes(fabricatedAge),
  'FAIL: fabricated age reference not caught');

console.log('\nAll assertions passed: verifier correctly distinguishes faithful');
console.log('narratives from ones containing injected numeric fabrications.');
