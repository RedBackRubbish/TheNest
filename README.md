# The Nest Protocol (v5.2)
> *Synthetic Civilization & Autonomous Governance System*

**The Nest** is a sovereign AI architecture that prioritizes **Governance over Speed**. Unlike standard coding copilots, The Nest employs a bicameral legislative system ("The Senate") to debate, test, and vote on operational artifacts before they are authorized.

---

## 🏛 Architecture: The Kernel

The system is built around a "Kernel" concept, where intelligence is treated as a dangerous resource that must be contained and governed.

### 1. The Senate (`src/core/senate.py`)
The Supreme Court of the system. Every user request ("Mission") must pass through a strict, non-negotiable legislative process:

1.  **🛡️ Onyx Pre-Check (Localhost)**: Uses a local model (e.g., `deepseek-r1:32b` via Ollama) to audit intent *before* it leaves your machine. Bans surveillance, malware, or destruction instantly.
2.  **🔥 Governance Classification**: Determines if the request affects the Constitution.
    *   **Engine Mode**: Standard tasks use fast models (`gpt-5.2-codex`).
    *   **Backstop Mode**: Constitutional changes trigger heavy reasoning models (`claude-opus-4.5`).
3.  **⚒️ Ignis (The Forge)**: The primary builder. Synthesizes the code or strategy.
4.  **🐍 Hydra (The Adversary)**: The Red Team. Attempts to break, hack, or find security flaws in Ignis's proposal.
5.  **⚖️ Onyx Final (The Sovereign)**: The final vote. Weighs the proposal against Hydra's report and the core values. **Fails Closed** (VETO) if unsure.

### 2. The Synapse (`src/core/brain.py`)
The cognitive routing layer.
*   **Hybrid Infrastructure**: Seamlessly routes traffic between Cloud (OpenRouter) and Local (Ollama) providers.
*   **Smart Routing**: Dynamically swaps models based on the agent persona (Ignis vs Hydra vs Onyx).

### 3. The Elder (`src/core/elder.py`)
The Orchestrator. Manages the lifecycle of a request, maintains the `Chronicle` (Memory/Logs), and interfaces with the API.

---

## ⚡️ Technology Stack

*   **Backend**: Python 3.10+, FastAPI, Uvicorn
*   **Frontend**: Next.js 14, React, Tailwind CSS
*   **Intelligence**: 
    *   **Cloud**: OpenRouter (Unified Gateway for GPT-5, Claude, Gemini)
    *   **Local**: Ollama (for cost-saving pre-checks and privacy)
*   **Persistence**: Redis (Shadow Cache & Oracle Bus)

---

## 🚀 Getting Started

### 1. Prerequisites
*   **Python 3.10+**
*   **Node.js 18+** (for Frontend)
*   **Redis** (Optional, for caching)
*   **Ollama** (Recommended, for local pre-checks)

### 2. Configuration (`.env`)
Create a `.env` file in the root directory. 

```bash
# Gateway Access (Cloud)
OPENAI_API_KEY="sk-or-..."
OPENAI_BASE_URL="https://openrouter.ai/api/v1"

# Intelligence Routing (Sprint 13 Configuration)
# IGNIS: The Builder
IGNIS_PRIMARY_MODEL="openai/gpt-5.2-codex"
IGNIS_GOVERNANCE_BACKSTOP="anthropic/claude-opus-4.5"

# ONYX: The Sentinel
ONYX_LOCAL_API_BASE="http://localhost:11434/v1"
ONYX_PRECHECK_MODEL="deepseek-r1:32b"       # Runs locally
ONYX_FINAL_MODEL="openai/gpt-5.2-pro"        # Runs in cloud

# REDIS
REDIS_URL="redis://localhost:6379"
```

### 3. Running the System

#### A. Backend (The Kernel)
Start the FastAPI server.
```bash
# Install dependencies
pip install -r requirements.txt

# Launch the API
python -m uvicorn src.api:app --reload --port 8000
```
*   **Health Check**: `http://localhost:8000/health`
*   **Docs**: `http://localhost:8000/docs`

#### B. Frontend (The Visor)
Launch the Next.js visual interface.
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```
*   **Interface**: `http://localhost:3000`

#### C. Local Intelligence (Onyx)
If using the local pre-check (highly recommended for sovereignty):
1.  Install [Ollama](https://ollama.com).
2.  Pull the required model:
    ```bash
    ollama pull deepseek-r1:32b
    ```
3.  Ensure Ollama is running (`ollama serve`).

---

## 🧪 Development & Testing

### The Constitutional Test
Before committing changes, you must prove the Kernel governs correctly. We use a deterministic test harness:

```bash
python -m tests.run_senate_session
```

**Expected Output**:
*   If your intent is safe: `✅ AUTHORIZED`
*   If your intent is dangerous: `⛔ NULL_VERDICT` (The system fails closed)

---

## 🤝 Contributing

**Governance First**:
1.  Never bypass `src/core/senate.py`.
2.  The `Brain` class must always fail if keys are missing (no unauthorized hallucinations).
3.  All API changes must reflect in the Type System (`src/core/types.py`).

*"The Code is the Law, but the Senate writes the Code."*
