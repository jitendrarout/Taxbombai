# Show HN post — TaxBombAI

**Title options (HN caps titles ~80 chars):**
1. Show HN: TaxBombAI – open-source RMD "tax bomb" calculator with an AI explainer
2. Show HN: I open-sourced a retirement RMD calculator that explains itself
3. Show HN: TaxBombAI – open, auditable RMD projections + plain-English AI narration

(Option 1 is probably the strongest — it names the tool, states what it is,
and flags the AI angle without leading with it.)

---

**Post body:**

I'm a software engineer who also runs an independent financial advisory
practice, and I kept running into the same problem: every "RMD calculator"
I could point clients to was either locked inside a paid planning suite,
or a spreadsheet with no visible methodology.

TaxBombAI is a small open-source library that:

- Projects Required Minimum Distributions year-by-year from the actual
  IRS Uniform Lifetime Table (Pub 590-B), not an approximation
- Estimates the resulting tax exposure and shows exactly when it peaks
  (the "tax bomb" — often much later than people expect, once compounding
  catches up with a large pre-tax balance)
- Compares that against a Roth conversion ladder scenario
- Has an optional AI layer (Claude) that narrates the *already-computed*
  numbers in plain English — it doesn't calculate anything itself, so the
  math stays auditable independent of the AI

Everything is in the open: the RMD table, the bracket math, the ladder
comparison logic, and a methodology doc citing exactly where each number
comes from. No account, no signup, no hosted-product upsell — clone it,
run the demo, or drop the web page on your own site.

Live demo: [link]
Repo + methodology: https://github.com/jitendrarout/taxbombai

Would love feedback, especially from anyone who's built retirement-planning
tools before — I'm sure there are edge cases (inherited IRAs, the joint
life table, IRMAA thresholds) I haven't modeled yet, and I've flagged those
gaps explicitly in the README rather than pretending they're handled.

---

**Posting notes:**
- Best times historically: weekday mornings, US Eastern time (roughly 7-9am ET)
- Respond to every comment in the first hour if possible — HN ranking
  rewards early engagement
- Don't argue with the inevitable "just use a spreadsheet" comment; thank
  them and point to the methodology doc
- Have the live demo link working *before* posting — a broken/slow demo
  in the first 20 minutes kills momentum
