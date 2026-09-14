const { projectRmdSchedule, compareRothConversionLadder } = require('../src/calculator');
const fs = require('fs');

const startingAges = [55, 60, 65, 70];
const balances = [250000, 500000, 1000000, 2000000, 4000000];

const rows = [];
for (const age of startingAges) {
  for (const balance of balances) {
    const schedule = projectRmdSchedule({
      currentAge: age,
      traditionalBalance: balance,
      growthRate: 0.06,
      rmdStartAge: 73,
      otherTaxableIncome: 40000,
      projectionYears: 30,
    });
    const peak = schedule.reduce((m, y) => (y.rmd > m.rmd ? y : m), schedule[0]);
    const lifetimeTax = schedule.reduce((s, y) => s + y.estimatedTax, 0);
    rows.push({
      startingAge: age,
      startingBalance: balance,
      peakRmdAge: peak.age,
      peakRmdAmount: peak.rmd,
      peakMarginalRate: peak.marginalRate,
      lifetimeTax,
    });
  }
}

// Roth ladder benefit sweep: for a fixed profile, vary conversion amount
const ladderRows = [];
const conversionAmounts = [0, 25000, 50000, 75000, 100000, 150000];
for (const conv of conversionAmounts) {
  const result = compareRothConversionLadder({
    currentAge: 60,
    traditionalBalance: 1500000,
    growthRate: 0.06,
    rmdStartAge: 73,
    otherTaxableIncome: 40000,
    projectionYears: 30,
    conversionAmountPerYear: conv,
    conversionStartAge: 60,
    conversionEndAge: 72,
  });
  ladderRows.push({
    conversionAmountPerYear: conv,
    totalConverted: result.summary.totalConverted,
    baselineLifetimeTax: result.summary.baselineLifetimeTax,
    ladderLifetimeTax: result.summary.ladderLifetimeTax,
    lifetimeTaxDelta: result.summary.lifetimeTaxDelta,
  });
}

fs.mkdirSync('results', { recursive: true });
fs.writeFileSync('results/sweep_peak_rmd.json', JSON.stringify(rows, null, 2));
fs.writeFileSync('results/sweep_roth_ladder.json', JSON.stringify(ladderRows, null, 2));

console.log('=== Peak RMD / Lifetime Tax Sweep ===');
console.table(rows);
console.log('\n=== Roth Conversion Ladder Sweep (age 60, $1.5M balance) ===');
console.table(ladderRows);
