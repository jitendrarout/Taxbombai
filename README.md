# TaxBombAI

**Open-source, AI-explained retirement "tax bomb" (RMD) analyzer.**

TaxBombAI projects Required Minimum Distributions (RMDs) from traditional
retirement accounts, estimates the resulting tax exposure year by year, and
uses an LLM to explain the results in plain English — including what levers
(Roth conversions, withdrawal sequencing, charitable giving) reduce that
exposure. The math is fully open and inspectable; the AI layer only narrates
numbers it did not generate, so results stay auditable.

## Validation

TaxBombAI's calculation engine is independently cross-validated against
a from-scratch Python re-implementation of the RMD projection formula
across 500 randomized scenarios (10,318 individual year-level values),
with zero mismatches beyond $1 rounding tolerance. A faithfulness
verifier (`src/faithfulnessVerifier.js`) automatically checks whether
AI-generated narrative text contains only numeric claims traceable to
the underlying computed schedule — see `validation/` for the scripts
and `paper/taxbombai-paper.pdf` for the full methodology and results.

```bash
cd validation
python3 cross_validate.py          # 500-scenario cross-validation
node parameter_sweep.js             # peak-RMD scaling + Roth ladder sweep
node test_faithfulness_verifier.js  # faithfulness verifier validation
```

## Why this exists

Most retirement tax-bomb calculators are either closed-source (locked inside
a paid planning suite) or a black-box spreadsheet with no documented
methodology. TaxBombAI is meant to be:

- **Reusable** by any advisor, developer, or individual — not tied to one
  firm's branding or one hosted product
- **Transparent** — every number traces back to the IRS Uniform Lifetime
  Table and documented tax-bracket math (see [docs/METHODOLOGY.md](docs/METHODOLOGY.md))
- **Explainable** — the AI layer is optional and additive; it narrates the
  computed schedule, it doesn't compute it

## Install

```bash
npm install
```

Set your Anthropic API key if you want the AI narrative layer:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

## Quick start

```bash
npm run demo
```

Or use it as a library:

```js
const { projectRmdSchedule, compareRothConversionLadder, explainProjection } = require('taxbombai');

const schedule = projectRmdSchedule({
  currentAge: 62,
  traditionalBalance: 1_200_000,
  growthRate: 0.06,
  rmdStartAge: 73,
  otherTaxableIncome: 40_000,
  projectionYears: 20,
});

const comparison = compareRothConversionLadder({
  currentAge: 62,
  traditionalBalance: 1_200_000,
  growthRate: 0.06,
  rmdStartAge: 73,
  otherTaxableIncome: 40_000,
  projectionYears: 20,
  conversionAmountPerYear: 80_000,
  conversionStartAge: 62,
  conversionEndAge: 72,
});

const narrative = await explainProjection({ schedule, comparison });
console.log(narrative);
```

## What's included

| Module | Purpose |
|---|---|
| `src/rmdTable.js` | IRS Uniform Lifetime Table divisors (Pub 590-B, Table III) |
| `src/calculator.js` | RMD projection engine, marginal tax estimate, Roth ladder comparison |
| `src/explainer.js` | Claude API wrapper that narrates computed results |
| `example/demo.js` | Runnable end-to-end example |

## Roadmap / ways to contribute

- [ ] Joint Life and Single Life (inherited IRA) tables
- [ ] Qualified Charitable Distribution (QCD) modeling
- [ ] IRMAA (Medicare premium surcharge) threshold warnings
- [ ] State tax layer (currently federal-only)
- [ ] Web UI (currently a Node library + CLI demo)
- [ ] Configurable tax-year bracket sets (currently a single illustrative set)

Issues and PRs welcome — this is meant to be genuinely reusable, not a
single-company tool with the serial numbers filed off.

## Disclaimer

This is an educational projection tool, not tax or financial advice. Tax
brackets and RMD rules change; verify current figures against IRS
Publication 590-B and current-year bracket tables before relying on this
for real planning decisions. See [docs/METHODOLOGY.md](docs/METHODOLOGY.md)
for full sourcing.

## License

MIT — see [LICENSE](LICENSE).
