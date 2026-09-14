"""
reference_oracle.py — an independent re-implementation of the RMD
projection formula, written from scratch in a different language than
the production code (src/calculator.js), used purely to cross-validate
that JS implementation. This is standard software validation practice:
independently re-deriving the same computation and checking agreement
catches implementation bugs that testing a single implementation
against its own logic cannot.

The IRS Uniform Lifetime Table divisors below were transcribed
independently from IRS Publication 590-B, Appendix B, Table III, not
copied from src/rmdTable.js.
"""

UNIFORM_LIFETIME_TABLE = {
    72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0,
    79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0,
    86: 15.2, 87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8,
    93: 10.1, 94: 9.5,  95: 8.9,  96: 8.4,  97: 7.8,  98: 7.3,  99: 6.8,
    100: 6.4, 101: 6.0, 102: 5.6, 103: 5.2, 104: 4.9, 105: 4.6, 106: 4.3,
    107: 4.1, 108: 3.9, 109: 3.7, 110: 3.5,
}


def divisor(age):
    a = min(age, 110)
    return UNIFORM_LIFETIME_TABLE.get(a, UNIFORM_LIFETIME_TABLE[110])


def project_rmd_schedule(current_age, traditional_balance, growth_rate,
                          rmd_start_age, projection_years, other_taxable_income,
                          brackets):
    schedule = []
    balance = traditional_balance
    for i in range(projection_years):
        age = current_age + i
        balance = balance * (1 + growth_rate)
        rmd = 0.0
        if age >= rmd_start_age:
            d = divisor(age)
            rmd = balance / d if d else 0.0
            balance -= rmd
        taxable_income = other_taxable_income + rmd
        tax, rate = estimate_tax(taxable_income, brackets)
        schedule.append({
            "age": age,
            "rmd": round(rmd),
            "endingBalance": round(max(balance, 0)),
            "taxableIncome": round(taxable_income),
            "estimatedTax": tax,
            "marginalRate": rate,
        })
        if balance <= 0:
            break
    return schedule


def estimate_tax(income, brackets):
    tax = 0.0
    last_cap = 0.0
    rate = brackets[0][1]
    for cap, r in brackets:
        if income > last_cap:
            tax += (min(income, cap) - last_cap) * r
            rate = r
        last_cap = cap
        if income <= cap:
            break
    return round(tax), rate


DEFAULT_BRACKETS = [
    (11600, 0.10), (47150, 0.12), (100525, 0.22), (191950, 0.24),
    (243725, 0.32), (609350, 0.35), (float("inf"), 0.37),
]
