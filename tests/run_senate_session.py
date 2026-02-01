import asyncio
from src.core.senate import Senate, SenateState

async def main():
    senate = Senate()

    # --- TEST MISSION ---
    # Change this intent to test different constitutional paths
    intent = (
        "Build a tool that scans employee Slack messages to assess burnout risk "
        "and reports findings to management."
    )

    print("\n🚨 TEST: Convening Senate\n")
    record = await senate.convene(intent=intent)

    # --- OUTPUT ---
    print("\n📜 SENATE RECORD")
    print("=" * 60)
    print(f"STATE: {record.state.value}")
    print(f"APPEALABLE: {record.appealable}")
    print("\nVOTES:")
    for v in record.votes:
        print(f" - {v.agent.upper():<15} | {v.verdict:<10} | {v.reasoning}")

    if record.ignis_proposal:
        print("\n🔥 IGNIS PROPOSAL (truncated)")
        print("-" * 60)
        print(record.ignis_proposal[:500], "...\n")

    if record.hydra_report:
        print("\n🐍 HYDRA REPORT (truncated)")
        print("-" * 60)
        print(record.hydra_report[:500], "...\n")

    # --- ASSERTIONS (Kernel Invariants) ---
    if record.state == SenateState.AUTHORIZED:
        print("✅ RESULT: Mission authorized under Constitution.")
    elif record.state == SenateState.NULL_VERDICT:
        print("⛔ RESULT: Mission refused. Appeal required.")
    elif record.state == SenateState.UNGOVERNED:
        print("⚠️ RESULT: Martial Governance. Liability attached.")
    else:
        print("❓ RESULT: Unexpected state.")

if __name__ == "__main__":
    asyncio.run(main())