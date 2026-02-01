import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.elder import TheElder
from src.memory.chronicle import TheChronicle

def test_martial_governance():
    print("\n--- Test Sprint 3: Martial Governance (Article 50) ---")
    
    elder = TheElder()
    mission = "Deploy unconstrained viral marketing bot."
    
    # 1. Standard Run -> Should be NULL/Refusal (Hypothetically, if agents were smart enough, but let's assume we just invoke it directly)
    # The user decides to invoke Article 50 directly usually after a refusal.
    
    result = elder.invoke_article_50(mission)
    
    print(f"Status: {result['status']}")
    print(f"Signature: {result['artifact']['signature']}")
    
    assert result['status'] == "UNGOVERNED"
    assert "LIABILITY_OWNER: KEEPER" in result['artifact']['signature']['warning']
    
    # Check log
    chronicle = TheChronicle()
    cases = chronicle.retrieve_relevant_case("viral")
    assert len(cases) > 0
    void_case = cases[-1]
    
    assert void_case.verdict['ruling'] == "UNGOVERNED"
    print("Martial Governance executed and logged correctly.")
    print("Test Sprint 3 PASSED")

if __name__ == "__main__":
    test_martial_governance()
