"""A tiny eval harness. This is the habit that separates engineering from vibes.

Run:  python eval_runner.py

Then change ONE thing (chunk size, k, the similarity floor, the system prompt),
re-run, and see whether the score actually moved. "28/30, up from 24" is an
engineering sentence. "It feels better now" is not.
"""
import csv

from rag import ask

REFUSAL = "not in my notes"

with open("evals.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

passed = 0
for r in rows:
    answer, hits = ask(r["question"])
    low = answer.lower()

    if r["should_refuse"].strip() == "yes":
        ok = REFUSAL in low
        why = "correctly refused" if ok else "ANSWERED WHEN IT SHOULD HAVE REFUSED"
    else:
        expected = r["expected_contains"].lower()
        ok = expected in low and REFUSAL not in low
        why = "ok" if ok else f"missing {r['expected_contains']!r}"

    passed += ok
    label = "PASS" if ok else "FAIL"
    print(f"{label}  {r['question'][:56]:<58} {why}")

print(f"\nScore: {passed}/{len(rows)}")
