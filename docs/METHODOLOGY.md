# Methodology

## RMD calculation

RMDs are computed using the **IRS Uniform Lifetime Table** (Treasury Reg.
§1.401(a)(9)-9, reproduced as Table III in IRS Publication 590-B). This
table applies to account owners who have reached their Required Beginning
Date and whose sole beneficiary is not a spouse more than 10 years younger.

```
RMD = Prior-year-end account balance ÷ Distribution period (divisor for owner's age)
```

The divisors currently in effect took effect January 1, 2022, per T.D.
9930. Treasury updates these periodically based on revised mortality
assumptions — check current Pub 590-B before using this for a real filing.

**Not implemented (contributions welcome):**
- Joint Life and Last Survivor Table (spouse >10 years younger)
- Single Life Expectancy Table (inherited/beneficiary IRAs)

## RMD start age

Under SECURE 2.0, the required beginning age is:
- **Age 73** for individuals born 1951–1959
- **Age 75** for individuals born 1960 or later

This library defaults to 73; pass `rmdStartAge: 75` explicitly for
clients born 1960 or later.

## Tax estimate

`estimateMarginalTax()` applies a standard progressive marginal-bracket
calculation against a supplied bracket table. **The default bracket table
in `calculator.js` is illustrative only** — it is not auto-updated for the
current tax year, does not account for standard deduction, filing status
variations, NIIT, state tax, or the taxability phase-in of Social Security
benefits. Replace `DEFAULT_BRACKETS_SINGLE` with the current year's actual
published brackets (and add filing-status variants) before using this for
real client work.

## Roth conversion ladder comparison

`compareRothConversionLadder()` models converting a fixed dollar amount
from the traditional balance to a Roth balance each year within a defined
age window, then compares total projected lifetime tax under that scenario
against the "do nothing" baseline. This is a simplified model — it does
not account for:
- The 5-year rule on converted amounts
- IRMAA (Medicare Part B/D premium surcharges) triggered by higher MAGI
  in conversion years
- State tax treatment differences between traditional and Roth accounts
- Sequence-of-returns risk on the assumed flat growth rate

**Interpreting `lifetimeTaxDelta`:** a positive delta means the ladder
scenario paid *more* total tax across the projection window — this is
expected and not necessarily a bad outcome. Conversions pull tax forward
into earlier years; the metric that usually matters more is the marginal
rate paid per dollar converted versus the marginal rate that dollar would
have faced as a later RMD, plus the value of tax-free Roth growth beyond
the projection window. `lifetimeTaxDelta` alone is not a verdict on
whether a ladder makes sense for a given client.

## AI explanation layer

`explainProjection()` sends only the **already-computed** numeric output
to the model, along with an instruction not to recompute or invent
figures — its role is narration and plain-language explanation of levers,
not calculation. This keeps the numeric output auditable independent of
the AI layer.

## Sources

- IRS Publication 590-B, Appendix B, Table III (Uniform Lifetime Table)
- Treasury Regulation §1.401(a)(9)-9
- SECURE 2.0 Act, RMD age provisions
