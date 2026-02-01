# The Nest Protocol (v6.0)
> *Constitutional AI Governance — Where Code Becomes Law*

**The Nest** is a sovereign AI architecture that prioritizes **Governance over Speed**. Unlike standard coding copilots, The Nest employs a bicameral legislative system ("The Senate") to debate, test, and vote on operational artifacts before they are authorized.

**New in v6.0**: Hydra Binding Rule, Constitutional Regression Tests, Enterprise API with Live Wire WebSocket.

---

## 🏛 Architecture: The Kernel

The system is built around a "Kernel" concept, where intelligence is treated as a dangerous resource that must be contained and governed.

```
┌─────────────────────────────────────────────────────────────────┐
│                        THE NEST KERNEL                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │  ONYX   │───▶│  IGNIS  │───▶│  HYDRA  │───▶│  ONYX   │      │
│  │Pre-Check│    │ (Forge) │    │(Adversary)   │ (Final) │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       │              │              │              │            │
│       ▼              ▼              ▼              ▼            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              THE CHRONICLE (Case Law)                │      │
│  │         Append-Only • Elder-Write-Only               │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### The Senate (`src/core/senate.py`)
The Supreme Court of the system. Every user request ("Mission") passes through a strict, non-negotiable legislative process:

| Step | Agent | Role | Model |
|------|-------|------|-------|
| 1 | **Onyx Pre-Check** | Local sovereign audit | `deepseek-r1:32b` (Ollama) |
| 2 | **Ignis** | Code synthesis | `gpt-5.2-codex` / `claude-opus-4.5` |
| 3 | **Hydra** | Red team adversary | `gemini-3-flash` |
| 4 | **Onyx Final** | Supreme judgment | `gpt-5.2-pro` |

### Constitutional Invariants (Enforced in Python, Not Prompts)

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| **Chronicle Write-Protection** | Only The Elder may write precedent | `ChronicleAccessError` |
| **NullVerdict Durability** | Every refusal persisted before response | Fail-closed persistence |
| **Ungoverned Quarantine** | Article 50 code isolated with VOID signature | Namespace isolation |
| **Hydra Binding Rule** | Exploits cannot be silently authorized | Mechanical VETO override |
| **Fail Closed** | Onyx unreachable = mission refused | `NULL_VERDICT` state |

---

## 🐍 Hydra Binding Rule (New in v6.0)

> *"An ignored adversary invalidates the Senate."*

If Hydra demonstrates a concrete exploit, Onyx **MUST** either:
1. **Explicitly cite and accept the risk**, OR
2. **VETO**

Silent authorization is now **mechanically impossible**:

```python
# This is enforced in Python logic, not prompts
if hydra_found_exploit and not onyx_acknowledged_risk:
    vote = VETO  # Forced override, LLM cannot bypass
```

**16 exploit patterns** detected: SQL injection, RCE, auth bypass, XSS, path traversal, buffer overflow, etc.

---

## ⚡️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Python 3.9+, FastAPI, Uvicorn, psutil |
| **Frontend** | Next.js 15, React 19, Tailwind v4 |
| **Intelligence (Cloud)** | OpenRouter → GPT-5.2, Claude Opus 4.5, Gemini 3 |
| **Intelligence (Local)** | Ollama → DeepSeek R1 32B |
| **Persistence** | JSON (Chronicle), PostgreSQL (planned) |
| **Real-time** | WebSocket Live Wire (`/ws/senate`) |

---

## 🖥️ Frontend: Aerospace Terminal UI

The frontend features an enterprise-grade **Technical/Aerospace** aesthetic:

- **20px grid background** with monochrome palette
- **System Telemetry Bar** — Live CPU, RAM, latency, governance mode
- **Agent Status Nodes** — ONYX/IGNIS/HYDRA with pulse animations
- **Terminal Log** — Color-coded streaming output
- **Command Interface** — Floating terminal-style input

---

## 🔌 Enterprise API

### REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/system/telemetry` | GET | Live CPU, RAM, uptime stats |
| `/mission` | POST | Submit mission for Senate deliberation |

### WebSocket: Live Wire

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/senate');
ws.send(JSON.stringify({ mission: "Write a Python function" }));

// Streaming message types:
// { type: "log", agent: "IGNIS", status: "ACTIVE", message: "..." }
// { type: "state_change", from: "PENDING", to: "AUTHORIZED" }
// { type: "artifact", agent: "IGNIS", content: "..." }
// { type: "final_verdict", verdict: "AUTHORIZED", record: {...} }
```

---

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **Ollama** (recommended for local pre-checks)

### Configuration (`.env`)

```bash
# Gateway Access (Cloud via OpenRouter)
OPENAI_API_KEY="sk-or-..."
OPENAI_BASE_URL="https://openrouter.ai/api/v1"

# IGNIS: The Builder
IGNIS_PRIMARY_MODEL="openai/gpt-5.2-codex"
IGNIS_GOVERNANCE_BACKSTOP="anthropic/claude-opus-4.5"

# HYDRA: The Adversary
HYDRA_MODEL="google/gemini-3-flash-preview"

# ONYX: The Sentinel
ONYX_LOCAL_API_BASE="http://localhost:11434/v1"
ONYX_PRECHECK_MODEL="deepseek-r1:32b"
ONYX_FINAL_MODEL="openai/gpt-5.2-pro"
```

### Running the System

```bash
# 1. Backend (The Kernel)
pip install -r requirements.txt
python -m uvicorn src.api:app --reload --port 8000

# 2. Frontend (The Visor)
cd frontend && npm install && npm run dev

# 3. Local Intelligence (Optional but recommended)
ollama pull deepseek-r1:32b
ollama serve
```

| Service | URL |
|---------|-----|
| API Docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| Telemetry | http://localhost:8000/system/telemetry |
| Frontend | http://localhost:3000 |

---

## 🧪 Testing

### Constitutional Regression Tests

**109 tests** lock down the kernel's security invariants:

```bash
# Run all tests
python -m pytest tests/ -v

# Run constitutional regression tests only
python -m pytest tests/test_constitutional_regression.py -v

# Run Hydra Binding tests only
python -m pytest tests/test_hydra_binding.py -v
```

### Test Coverage

| Test Suite | Tests | Invariant Protected |
|------------|-------|---------------------|
| `test_chronicle_security.py` | 22 | Chronicle write-protection |
| `test_hydra_binding.py` | 24 | Hydra Binding Rule |
| `test_constitutional_regression.py` | 29 | All kernel invariants |
| `test_appeal_system.py` | 11 | Appeal syscall |
| `test_senate_nodes.py` | 9 | Senate state machine |
| Others | 14 | API, Elder, Brain routing |

---

## 📜 Constitutional Prompts Implemented

| # | Prompt | Status |
|---|--------|--------|
| 1 | Chronicle Write-Protection | ✅ Complete |
| 2 | NullVerdict Durability | ✅ Complete |
| 3 | Ungoverned Namespace Quarantine | ✅ Complete |
| 4 | Appeal Syscall | ✅ Complete |
| 5 | Hydra Binding Rule | ✅ Complete |
| 6 | Constitutional Regression Tests | ✅ Complete |

---

## 🤝 Contributing

**Governance First**:
1. Never bypass `src/core/senate.py`
2. All invariants must have regression tests in `test_constitutional_regression.py`
3. The Brain must fail closed if keys are missing
4. Hydra findings cannot be ignored — the binding rule is constitutional law

*"The Code is the Law, but the Senate writes the Code."*

---

## 📄 License

MIT License — but remember: **liability attaches to the Keeper** for any ungoverned execution (Article 50).
