/**
 * faithfulnessVerifier.js — post-hoc consistency check for AI-generated
 * narrative text against the deterministic numbers it is meant to
 * describe.
 *
 * The design goal of explainProjection() (src/explainer.js) is that the
 * AI narrates numbers it did not compute, rather than generating new
 * figures. This module provides an automatic, non-AI check of that
 * property: it extracts dollar-figure and age claims from a narrative
 * string via pattern matching, and flags any that do not appear
 * (within a small tolerance) among the values actually present in the
 * computed schedule it was supposed to describe.
 *
 * This is a necessary-but-not-sufficient check: it catches invented or
 * altered numbers, but cannot verify that qualitative claims (e.g.,
 * "this is a large tax exposure") are appropriate — that remains a
 * human-review concern.
 */

function extractDollarFigures(text) {
  const matches = text.match(/\$[\d,]+(?:\.\d+)?/g) || [];
  return matches.map((m) => parseFloat(m.replace(/[$,]/g, "")));
}

function extractAgeReferences(text) {
  const matches = text.match(/\bage\s+(\d{2,3})\b/gi) || [];
  return matches.map((m) => parseInt(m.match(/\d{2,3}/)[0], 10));
}

function collectSupportedValues(schedule) {
  const values = new Set();
  const ages = new Set();
  for (const row of schedule) {
    values.add(row.rmd);
    values.add(row.taxableIncome);
    values.add(row.estimatedTax);
    values.add(row.balance ?? row.endingBalance ?? 0);
    ages.add(row.age);
  }
  return { values, ages };
}

/**
 * Checks a narrative string against the schedule it is meant to
 * describe. Returns { faithful, unsupportedDollarFigures,
 * unsupportedAgeReferences } — dollar figures/ages mentioned in the
 * text that don't match any value actually present in the schedule
 * (within a tolerance, to allow for reasonable rounding in prose).
 */
function verifyFaithfulness(narrativeText, schedule, dollarTolerance = 50) {
  const { values, ages } = collectSupportedValues(schedule);
  const valueArray = Array.from(values);

  const dollarFigures = extractDollarFigures(narrativeText);
  const unsupportedDollarFigures = dollarFigures.filter(
    (fig) => !valueArray.some((v) => Math.abs(v - fig) <= dollarTolerance)
  );

  const ageReferences = extractAgeReferences(narrativeText);
  const unsupportedAgeReferences = ageReferences.filter((a) => !ages.has(a));

  return {
    faithful: unsupportedDollarFigures.length === 0 && unsupportedAgeReferences.length === 0,
    dollarFiguresChecked: dollarFigures.length,
    ageReferencesChecked: ageReferences.length,
    unsupportedDollarFigures,
    unsupportedAgeReferences,
  };
}

module.exports = { verifyFaithfulness, extractDollarFigures, extractAgeReferences };
