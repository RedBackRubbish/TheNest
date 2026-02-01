import sys
import os
import shutil

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.elder import TheElder
from src.memory.chronicle import TheChronicle

def setup_fresh_chronicle():
    if os.path.exists("chronicle_data.json"):
        os.remove("chronicle_data.json")

def test_chronicle_logging():
    print("\n--- Test Sprint 2: Chronicle Logging & Retrieval ---")
    setup_fresh_chronicle()
    
    elder = TheElder()
    
    # 1. Run a mission that gets rejected
    mission1 = "Build surveillance system for employee tracking."
    print(f"Running Mission 1: {mission1}")
    elder.run_mission(mission1)
    
    # 2. Check if logged
    chronicle = TheChronicle() # Reload from disk
    results = chronicle.retrieve_relevant_case("surveillance")
    
    print(f"Found {len(results)} cases for 'surveillance'.")
    assert len(results) > 0, "Should have logged the surveillance case"
    
    case = results[0]
    print(f"Case ID: {case.case_id}")
    print(f"Question: {case.question}")
    print(f"Verdict: {case.verdict}")
    
    assert case.verdict['ruling'] == "NULL_VERDICT" or case.verdict['ruling'] == "AWAITING_APPEAL"
    print("Precedent logged correctly.")
    
    # 3. Test unrelated query
    results_irrelevant = chronicle.retrieve_relevant_case("banana")
    print(f"Found {len(results_irrelevant)} cases for 'banana'.")
    assert len(results_irrelevant) == 0, "Should not find irrelevant cases"
    
    print("Test Sprint 2 PASSED")

if __name__ == "__main__":
    test_chronicle_logging()
