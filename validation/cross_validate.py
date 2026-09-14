"""
cross_validate.py — generates randomized test cases, runs them through
both the production JS calculator (src/calculator.js, via a Node
subprocess) and the independent Python oracle (reference_oracle.py),
and reports any disagreement beyond floating-point rounding tolerance.
"""

import json
import random
import subprocess
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from reference_oracle import project_rmd_schedule, DEFAULT_BRACKETS

N_CASES = 500
TOLERANCE_DOLLARS = 1  # allow $1 rounding tolerance between implementations


def generate_case(rng):
    return {
        "currentAge": rng.randint(45, 70),
        "traditionalBalance": rng.randint(50_000, 5_000_000),
        "growthRate": round(rng.uniform(0.0, 0.10), 3),
        "rmdStartAge": rng.choice([73, 75]),
        "projectionYears": rng.randint(10, 30),
        "otherTaxableIncome": rng.randint(0, 150_000),
    }


def run_js(cases):
    proc = subprocess.run(
        ["node", os.path.join(os.path.dirname(__file__), "js_runner.js")],
        input=json.dumps(cases), capture_output=True, text=True, check=True,
    )
    return json.loads(proc.stdout)


def run_python(cases):
    results = []
    for c in cases:
        schedule = project_rmd_schedule(
            c["currentAge"], c["traditionalBalance"], c["growthRate"],
            c["rmdStartAge"], c["projectionYears"], c["otherTaxableIncome"],
            DEFAULT_BRACKETS,
        )
        results.append(schedule)
    return results


def compare(js_results, py_results, cases):
    mismatches = []
    total_rows_compared = 0
    for case_idx, (js_sched, py_sched) in enumerate(zip(js_results, py_results)):
        if len(js_sched) != len(py_sched):
            mismatches.append({
                "case": cases[case_idx], "case_idx": case_idx,
                "reason": f"schedule length differs: JS={len(js_sched)} PY={len(py_sched)}",
            })
            continue
        for row_idx, (jrow, prow) in enumerate(zip(js_sched, py_sched)):
            total_rows_compared += 1
            for field in ["rmd", "endingBalance", "taxableIncome", "estimatedTax"]:
                diff = abs(jrow[field] - prow[field])
                if diff > TOLERANCE_DOLLARS:
                    mismatches.append({
                        "case": cases[case_idx], "case_idx": case_idx, "row": row_idx,
                        "field": field, "js_value": jrow[field], "py_value": prow[field],
                        "diff": diff,
                    })
    return mismatches, total_rows_compared


if __name__ == "__main__":
    rng = random.Random(42)
    cases = [generate_case(rng) for _ in range(N_CASES)]

    print(f"Generated {N_CASES} randomized test cases.")
    js_results = run_js(cases)
    py_results = run_python(cases)

    mismatches, total_rows = compare(js_results, py_results, cases)

    print(f"Compared {total_rows} individual year-rows across {N_CASES} cases.")
    print(f"Mismatches beyond ${TOLERANCE_DOLLARS} tolerance: {len(mismatches)}")

    if mismatches:
        print("\nFirst 5 mismatches:")
        for m in mismatches[:5]:
            print(m)
    else:
        print("\nAll cases agree between the JS production implementation and the")
        print("independent Python oracle within $1 rounding tolerance.")
