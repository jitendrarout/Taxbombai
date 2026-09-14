# I Cross-Validated My Own Financial Calculator Against a Second Implementation — Here's What I Found

Most retirement tax calculators are black boxes. You put in your numbers, you get a projection, and you have no way to check whether the math underneath is actually right — the methodology is locked inside a paid planning tool or a spreadsheet nobody's opened up to scrutiny.

I built [TaxBombAI](https://github.com/jitendrarout/taxbombai) to fix that for one specific problem: Required Minimum Distributions (RMDs) and the "tax bomb" that hits when years of compounding in a tax-deferred account collide with mandatory withdrawals. But open-sourcing the code isn't the same as proving it's *correct* — so I went a step further and independently validated it.

## The setup: separate the math from the AI

TaxBombAI has two layers, deliberately kept apart:

1. A **deterministic calculation engine** — pure functions, no AI, no network calls — that projects RMDs using the actual IRS Uniform Lifetime Table and estimates the resulting tax exposure.
2. An **AI narration layer** that takes the already-computed numbers and explains them in plain English, with an explicit instruction not to invent or recompute anything.

The idea is that the numbers you get are never something an LLM made up — they're always traceable to deterministic code you can read yourself. But "the AI shouldn't invent numbers" is a design intention, not a guarantee. So I built two things to actually check it.

## Check 1: an independent second implementation

Instead of just writing unit tests for the calculator (which mostly checks "does the code agree with itself"), I wrote a **second, independent implementation of the same RMD formula in Python** — transcribing the IRS table divisors straight from Publication 590-B rather than copying my own JavaScript code.

Then I generated 500 randomized scenarios — random starting ages, balances from $50K to $5M, growth rates, RMD start ages, projection windows — and ran every single one through both implementations.

**Result: 10,318 individual year-level figures compared, zero mismatches beyond $1 rounding tolerance.**

That's a meaningfully stronger correctness signal than testing code against its own logic — a bug shared between an implementation and its own tests won't get caught that way. An independently written oracle will.

## Check 2: does the AI layer actually stay faithful to the numbers?

This is the part I think is more interesting. I built a **faithfulness verifier** — a small, non-AI checker that takes the narrative text an LLM generates and:

1. Extracts every dollar figure and age reference mentioned
2. Checks whether each one actually appears in the underlying computed schedule
3. Flags anything that doesn't match

To validate the verifier itself, I constructed two test narratives: one where every number is real, and one where I deliberately swapped in two fabricated values (a wrong peak RMD amount, a wrong peak age) — simulating what a hallucination would look like.

The verifier caught both. Correctly passed the faithful one with zero flags, correctly flagged the unfaithful one and named exactly which numbers didn't check out.

**Important honesty note:** this validates the *verifier's detection logic* against constructed test cases — I didn't have live API access in the environment I built this in, so I haven't yet run it against real model-generated narratives. That's explicitly the next step, not something I'm claiming is already done.

## A couple of genuinely interesting findings that fell out of this

Running a parameter sweep across starting ages and balances turned up a clean structural property: **peak RMD age is completely invariant to starting balance** — only the *magnitude* scales (linearly, as it turns out). Makes sense once you think about the math, but it's a nice sanity check: if a future code change ever broke that invariant, it'd be an instant signal something's wrong.

Separately, sweeping Roth conversion amounts showed the diminishing-returns pattern you'd expect from tax theory — the first $25K/year of conversion saves more tax than the increment from $100K to $150K, because early conversions fill up lower brackets efficiently before pushing into higher ones.

## Try it yourself

```bash
git clone https://github.com/jitendrarout/taxbombai
cd taxbombai/validation
python3 cross_validate.py          # the 500-scenario cross-validation
node parameter_sweep.js             # the scaling + Roth ladder findings
node test_faithfulness_verifier.js  # the verifier validation
```

Full methodology and results are written up in the accompanying paper, linked from the repo. If you build financial tools that layer AI explanations on top of real numbers, I'd genuinely like to hear whether a similar verification approach would be useful for you — or what's missing from it.
