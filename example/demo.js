const { projectRmdSchedule, compareRothConversionLadder, explainProjection } = require('../src/index');

async function main() {
  const clientProfile = {
    currentAge: 62,
    traditionalBalance: 1_200_000,
    growthRate: 0.06,
    rmdStartAge: 73,
    otherTaxableIncome: 40_000, // e.g. Social Security + pension
    projectionYears: 20,
  };

  // 1. Baseline "do nothing" projection
  const schedule = projectRmdSchedule(clientProfile);
  console.log('--- Baseline RMD schedule (first 5 years shown) ---');
  console.table(schedule.slice(0, 5));

  const peak = schedule.reduce((m, y) => (y.rmd > m.rmd ? y : m), schedule[0]);
  console.log(`Peak RMD: $${peak.rmd.toLocaleString()} at age ${peak.age} (marginal rate ${(peak.marginalRate * 100).toFixed(0)}%)`);

  // 2. Roth conversion ladder scenario: convert $80k/year from age 62-72
  const comparison = compareRothConversionLadder({
    ...clientProfile,
    conversionAmountPerYear: 80_000,
    conversionStartAge: 62,
    conversionEndAge: 72,
  });
  console.log('\n--- Roth ladder vs. baseline ---');
  console.log(comparison.summary);

  // 3. AI narrative (requires ANTHROPIC_API_KEY env var)
  if (process.env.ANTHROPIC_API_KEY) {
    console.log('\n--- AI explanation ---');
    const narrative = await explainProjection({
      schedule,
      comparison,
      clientContext: { currentAge: clientProfile.currentAge, filingStatus: 'single' },
    });
    console.log(narrative);
  } else {
    console.log('\n(Set ANTHROPIC_API_KEY to see the AI narrative layer in action.)');
  }
}

main().catch(console.error);
