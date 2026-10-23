"""
Unified Test Runner for Airbnb Expense & Settlement Management System.
Executes all unit, integration, mathematical ledger, and E2E test suites:
1. test_ledger_math.py
2. test_settlements_api.py
3. test_exhaustive_expenses.py
4. test_exhaustive_settlements.py
5. test_e2e_full_workflow.py
"""

import sys
import asyncio
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from tests.test_ledger_math import run_tests as run_ledger_math
from tests.test_settlements_api import run_tests as run_settlements_api
from tests.test_exhaustive_expenses import run_exhaustive_expense_tests
from tests.test_exhaustive_settlements import run_exhaustive_settlement_tests
from tests.test_e2e_full_workflow import run_e2e_tests

async def main():
    print("=" * 70)
    print("  STARTING COMPLETE AUTOMATED VALIDATION SUITE")
    print("  Testing Ledger Math, Expenses, Settlements, Permissions & E2E")
    print("=" * 70)

    suites = [
        ("Mathematical Ledger & Double-Entry Balance Engine", run_ledger_math),
        ("Settlements API Lifecycle & Quarantined Balances", run_settlements_api),
        ("Exhaustive Expenses Handling, Splits & Edge-Cases", run_exhaustive_expense_tests),
        ("Exhaustive Settlements, Overpayments & Security", run_exhaustive_settlement_tests),
        ("Multi-User E2E Real Workflow (Tushar, Rashi, Joy, Admin)", run_e2e_tests),
    ]

    results = []
    for name, runner in suites:
        print(f"\n>>> Running Suite: {name}...")
        try:
            await runner()
            results.append((name, "PASSED", None))
        except Exception as e:
            import traceback
            traceback.print_exc()
            results.append((name, "FAILED", str(e)))

    print("\n" + "=" * 70)
    print("  COMPLETE VALIDATION SUMMARY")
    print("=" * 70)
    all_passed = True
    for name, status, err in results:
        status_str = f"[\033[92m{status}\033[0m]" if status == "PASSED" else f"[\033[91m{status}\033[0m]"
        print(f"{status_str} {name}")
        if err:
            all_passed = False
            print(f"      Reason: {err}")

    if all_passed:
        print("\n\033[92mALL 5 TEST SUITES PASSED! 100% PRODUCTION READY.\033[0m\n")
    else:
        print("\n\033[91mSOME TESTS FAILED! PLEASE REVIEW BEFORE PRODUCTION.\033[0m\n")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
