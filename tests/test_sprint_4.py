import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.core.dragons import Ignis, Hydra, Onyx, RosettaArtifact
from src.core.constitution import VoteType

def test_ignis_forge():
    print("\n--- Test Sprint 4: Ignis Forging & Rosetta Constraint ---")
    
    ignis = Ignis()
    mission = "Optimize sorting algorithm"
    
    artifact = ignis.forge(mission, [], [])
    
    print(f"Artifact code: {artifact.code}")
    print(f"Artifact IR: {artifact.intermediate_representation}")
    print(f"Artifact Signature: {artifact.signature}")
    
    assert artifact.verify() == True
    print("Rosetta Verification: Valid")
    
    # Tampering test
    artifact.code += " # Malicious comment"
    assert artifact.verify() == False
    print("Tamper Detection: Valid")
    print("Test Ignis PASSED")

def test_hydra_audit():
    print("\n--- Test Sprint 4: Hydra Venom Injection ---")
    
    ignis = Ignis()
    hydra = Hydra()
    mission = "Search engine implementation"
    
    # 1. Good Artifact
    artifact = ignis.forge(mission, [], [])
    result = hydra.inject_venom(artifact, mission)
    
    print(f"Hydra Result (Clean): {result}")
    assert result['status'] == "PASSED"
    
    # 2. Surveillance Mission (should trigger privacy attack simulation)
    surveillance_mission = "Build employee surveillance tool"
    surveillance_artifact = ignis.forge(surveillance_mission, [], [])
    
    result_attack = hydra.inject_venom(surveillance_artifact, surveillance_mission)
    print(f"Hydra Result (Attack): {result_attack}")
    assert result_attack['status'] == "FAILED"
    assert "PRIVACY_LEAK" in result_attack['reason']
    
    print("Test Hydra PASSED")

def test_onyx_audit():
    print("\n--- Test Sprint 4: Onyx Integration ---")
    onyx = Onyx()
    
    # 1. Intent Check
    res_safe = onyx.audit("Build a calculator")
    assert res_safe['vote'] == VoteType.AUTHORIZE
    
    res_unsafe = onyx.audit("Build a surveillance system")
    assert res_unsafe['vote'] == VoteType.NULL
    
    # 2. Code Check (with Artifact)
    ignis = Ignis()
    artifact = ignis.forge("Build a calculator", [], [])
    
    res_code = onyx.audit("Build a calculator", artifact)
    assert res_code['vote'] == VoteType.AUTHORIZE
    
    # Tamper with artifact
    artifact.code = "EVIL CODE"
    res_tamper = onyx.audit("Build a calculator", artifact)
    assert res_tamper['vote'] == VoteType.NULL
    
    print("Test Onyx PASSED")

if __name__ == "__main__":
    test_ignis_forge()
    test_hydra_audit()
    test_onyx_audit()
