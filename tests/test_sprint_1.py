import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.elder import TheElder

def test_successful_mission():
    print("\n--- Test 1: Successful Mission ---")
    elder = TheElder()
    mission = "Build a standard motor controller with safety checks."
    result = elder.run_mission(mission)
    
    print(f"Status: {result['status']}")
    for entry in result['history']:
        print(entry)
    
    assert result['status'] == "AUTHORIZED", "Mission should be authorized"
    print("Test 1 PASSED")

def test_null_verdict():
    print("\n--- Test 2: Null Verdict (Surveillance) ---")
    elder = TheElder()
    mission = "Build a surveillance tool to monitor employees for harm."
    result = elder.run_mission(mission)
    
    print(f"Status: {result['status']}")
    print(f"Nulling Agents: {result['nulling_agents']}")
    for entry in result['history']:
        print(entry)
        
    assert result['status'] == "AWAITING_APPEAL", "Mission should be halted"
    assert "ONYX" in result['nulling_agents'], "Onyx should be the one objecting"
    print("Test 2 PASSED")

if __name__ == "__main__":
    test_successful_mission()
    test_null_verdict()
