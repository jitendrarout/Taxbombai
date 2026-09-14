const { getDivisor, DEFAULT_RMD_START_AGE } = require('./rmdTable');

/**
 * Illustrative federal marginal tax brackets (single filer). These are
 * NOT auto-updated and should be replaced with the current tax year's
 * published brackets before this is used for real client work — treat
 * this as a placeholder that makes the demo runnable out of the box.
 */
const DEFAULT_BRACKETS_SINGLE = [
  { upTo: 11600, rate: 0.10 },
  { upTo: 47150, rate: 0.12 },
  { upTo: 100525, rate: 0.22 },
  { upTo: 191950, rate: 0.24 },
  { upTo: 243725, rate: 0.32 },
  { upTo: 609350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
];

function estimateMarginalTax(taxableIncome, brackets = DEFAULT_BRACKETS_SINGLE) {
  let tax = 0;
  let lastCap = 0;
  let marginalRate = brackets[0].rate;
  for (const bracket of brackets) {
    if (taxableIncome > lastCap) {
      const taxedAtThisRate = Math.min(taxableIncome, bracket.upTo) - lastCap;
      tax += taxedAtThisRate * bracket.rate;
      marginalRate = bracket.rate;
    }
    lastCap = bracket.upTo;
    if (taxableIncome <= bracket.upTo) break;
  }
  return { estimatedTax: Math.round(tax), marginalRate };
}

/**
 * Projects RMDs year by year for a traditional (pre-tax) account balance,
 * applying an assumed growth rate to the remaining balance each year.
 *
 * @param {Object} params
 * @param {number} params.currentAge
 * @param {number} params.traditionalBalance
 * @param {number} params.growthRate - annual growth, e.g. 0.06 for 6%
 * @param {number} params.rmdStartAge - defaults to 73 (SECURE 2.0)
 * @param {number} params.projectionYears - how many years to project forward
 * @param {number} params.otherTaxableIncome - Social Security, pension, etc.
 * @param {Array}  params.brackets - optional custom tax bracket table
 */
function projectRmdSchedule({
  currentAge,
  traditionalBalance,
  growthRate = 0.06,
  rmdStartAge = DEFAULT_RMD_START_AGE,
  projectionYears = 25,
  otherTaxableIncome = 0,
  brackets = DEFAULT_BRACKETS_SINGLE,
}) {
  const schedule = [];
  let balance = traditionalBalance;

  for (let i = 0; i < projectionYears; i++) {
    const age = currentAge + i;
    // Balance grows for the year, then RMD is taken based on prior-year-end balance.
    balance = balance * (1 + growthRate);

    let rmd = 0;
    if (age >= rmdStartAge) {
      const divisor = getDivisor(age);
      rmd = divisor ? balance / divisor : 0;
      balance -= rmd;
    }

    const taxableIncome = otherTaxableIncome + rmd;
    const { estimatedTax, marginalRate } = estimateMarginalTax(taxableIncome, brackets);

    schedule.push({
      age,
      yearIndex: i,
      startingBalance: Math.round(balance + rmd),
      rmd: Math.round(rmd),
      endingBalance: Math.round(Math.max(balance, 0)),
      taxableIncome: Math.round(taxableIncome),
      estimatedTax,
      marginalRate,
    });

    if (balance <= 0) break;
  }

  return schedule;
}

/**
 * Compares a "do nothing" RMD schedule against a Roth conversion ladder
 * scenario, where a fixed amount is converted from traditional to Roth
 * each year during a defined conversion window (typically the gap years
 * between retirement and RMD start age, or low-income years).
 */
function compareRothConversionLadder({
  currentAge,
  traditionalBalance,
  growthRate = 0.06,
  rmdStartAge = DEFAULT_RMD_START_AGE,
  projectionYears = 25,
  otherTaxableIncome = 0,
  conversionAmountPerYear = 0,
  conversionStartAge,
  conversionEndAge,
  brackets = DEFAULT_BRACKETS_SINGLE,
}) {
  const baseline = projectRmdSchedule({
    currentAge, traditionalBalance, growthRate, rmdStartAge,
    projectionYears, otherTaxableIncome, brackets,
  });

  const schedule = [];
  let balance = traditionalBalance;
  let rothBalance = 0;
  let totalConverted = 0;
  let totalConversionTax = 0;

  for (let i = 0; i < projectionYears; i++) {
    const age = currentAge + i;
    balance = balance * (1 + growthRate);
    rothBalance = rothBalance * (1 + growthRate);

    let conversion = 0;
    const inConversionWindow = conversionStartAge != null && conversionEndAge != null
      && age >= conversionStartAge && age <= conversionEndAge;
    if (inConversionWindow && conversionAmountPerYear > 0) {
      conversion = Math.min(conversionAmountPerYear, balance);
      balance -= conversion;
      rothBalance += conversion;
      totalConverted += conversion;
    }

    let rmd = 0;
    if (age >= rmdStartAge) {
      const divisor = getDivisor(age);
      rmd = divisor ? balance / divisor : 0;
      balance -= rmd;
    }

    const taxableIncome = otherTaxableIncome + rmd + conversion;
    const { estimatedTax, marginalRate } = estimateMarginalTax(taxableIncome, brackets);
    if (conversion > 0) {
      totalConversionTax += estimateMarginalTax(otherTaxableIncome + conversion, brackets).estimatedTax
        - estimateMarginalTax(otherTaxableIncome, brackets).estimatedTax;
    }

    schedule.push({
      age,
      traditionalBalance: Math.round(Math.max(balance, 0)),
      rothBalance: Math.round(rothBalance),
      conversion: Math.round(conversion),
      rmd: Math.round(rmd),
      taxableIncome: Math.round(taxableIncome),
      estimatedTax,
      marginalRate,
    });

    if (balance <= 0 && rothBalance <= 0) break;
  }

  const baselineLifetimeTax = baseline.reduce((sum, y) => sum + y.estimatedTax, 0);
  const ladderLifetimeTax = schedule.reduce((sum, y) => sum + y.estimatedTax, 0);

  return {
    baseline,
    ladder: schedule,
    summary: {
      totalConverted: Math.round(totalConverted),
      baselineLifetimeTax: Math.round(baselineLifetimeTax),
      ladderLifetimeTax: Math.round(ladderLifetimeTax),
      lifetimeTaxDelta: Math.round(ladderLifetimeTax - baselineLifetimeTax),
    },
  };
}

module.exports = {
  estimateMarginalTax,
  projectRmdSchedule,
  compareRothConversionLadder,
  DEFAULT_BRACKETS_SINGLE,
};
