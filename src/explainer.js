const Anthropic = require('@anthropic-ai/sdk');

/**
 * Turns a numeric RMD projection (and optionally a Roth-ladder comparison)
 * into a plain-English narrative explaining the tax bomb and the levers
 * available to reduce it. Requires ANTHROPIC_API_KEY in the environment.
 *
 * This is the "AI-explainable" layer that differentiates this project
 * from a plain calculator: the math is fully open and inspectable in
 * calculator.js, and the AI only narrates results it did not generate.
 */
async function explainProjection({ schedule, comparison = null, clientContext = {} }) {
  const client = new Anthropic();

  const peakYear = schedule.reduce((max, y) => (y.rmd > max.rmd ? y : max), schedule[0]);

  const summaryForModel = {
    clientContext,
    peakRmdYear: peakYear,
    firstFiveYears: schedule.slice(0, 5),
    comparisonSummary: comparison ? comparison.summary : null,
  };

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 700,
    system: [
      'You are a retirement tax-planning explainer.',
      'You are given ALREADY-COMPUTED numbers — RMD projections and, optionally,',
      'a Roth conversion ladder comparison. Do not invent or recompute figures.',
      'Explain what the numbers mean in plain English for a retiree or their',
      'advisor: why the tax bomb exists, when it peaks, and what levers (Roth',
      'conversions, QCDs, withdrawal sequencing, timing Social Security) could',
      'reduce it. Be concrete and reference the actual numbers given.',
      'Always end with: "This is an educational projection, not tax advice —',
      'consult a licensed tax professional before acting."',
    ].join(' '),
    messages: [
      { role: 'user', content: JSON.stringify(summaryForModel) },
    ],
  });

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

module.exports = { explainProjection };
