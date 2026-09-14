const { projectRmdSchedule, DEFAULT_BRACKETS_SINGLE } = require('../src/calculator');

// Read test cases from stdin as JSON, run each through the production
// JS calculator, print results as JSON to stdout for comparison against
// the independent Python oracle.

let input = '';
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  const cases = JSON.parse(input);
  const results = cases.map((c) => {
    const schedule = projectRmdSchedule({
      currentAge: c.currentAge,
      traditionalBalance: c.traditionalBalance,
      growthRate: c.growthRate,
      rmdStartAge: c.rmdStartAge,
      projectionYears: c.projectionYears,
      otherTaxableIncome: c.otherTaxableIncome,
      brackets: DEFAULT_BRACKETS_SINGLE,
    });
    return schedule;
  });
  console.log(JSON.stringify(results));
});
