# NetFlow - Private LP Treasury OS

<p align="center">
  <strong>Private LP Treasury OS for Meteora Liquidity Providers</strong>
</p>

<p align="center">
  <a href="https://twitter.com/netflow">
    <img src="https://img.shields.io/badge/Twitter-@NetFlow-00d4aa?style=flat&logo=twitter" alt="Twitter">
  </a>
  <img src="https://img.shields.io/badge/License-MIT-00d4aa" alt="License">
  <img src="https://img.shields.io/badge/Build-Passing-00d4aa" alt="Build">
</p>

---

## Problem Statement

Meteora liquidity providers face two critical challenges:

1. **Yield Inefficiency**: Most LPs lack visibility into pool performance and can't automatically rebalance to higher-yield opportunities
2. **Transparency Risk**: On-chain analysis tools track public wallet addresses, exposing trading strategies and treasury movements to competitors

**NetFlow** solves both by combining LP intelligence with privacy-first execution.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │ Dashboard │  │ Positions │  │Execution  │   │
│  │   Card    │  │   Table   │  │   Feed    │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                       │
                       │ API Routes
                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  Backend Services                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   LP Agent │  │ Optimizer  │  │   Cloak   │   │
│  │  Service  │  │  Engine   │  │  Service  │   │
│  └─────────────┘  └─────────────┘  └─────────────┘   │
│                        │                              │
│                        ▼                              │
│  ┌──────────────────────────────────────────┐    │
│  │         Zap In / Zap Out Service          │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    External APIs                                │
│                                                                  │
│  ┌─────────────┐  ┌��────────────┐  ┌─────────────────────┐       │
│  │ LP Agent  │  │  Meteora  │  │    Cloak SDK      │       │
│  │   API    │  │   DLMM   │  │ (Private Txs)     │       │
│  └──────────┘  └──────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why These Integrations

### 1. LP Agent → Portfolio Intelligence
- Fetches user LP positions across all pools
- Retrieves real-time APR and fee data
- Computes P&L across positions
- Identifies underperforming pools

### 2. Cloak SDK → Execution Privacy
- **Shield**: Deposit capital into UTXO system (hidden balances)
- **Send**: Private transfers between strategies
- **Swap**: Token swaps without exposing amounts
- **Withdraw**: Exit to public address when needed

### 3. Zap In/Out → LP Transitions
- **Zap In**: Enter LP positions after optimization
- **Zap Out**: Exit underperforming pools
- Auto-detects pool type (DLMM vs DAMM V2)

---

## Key Features

### Portfolio Dashboard
- Real-time total value, P&L, yield tracking
- Position breakdown with APR scores
- 24h fee earnings

### AI Optimization Engine
- Yield scoring algorithm
- Automatic rebalancing recommendations
- Risk-adjusted position sizing

### Private Execution Flow
1. Shield capital (private deposit)
2. Cross-pool transfers (cloaked)
3. Zap Out from underperformers
4. Zap In to high-yield pools
5. Execution history (with viewing keys)

### Demo Mode
- Test without wallet connection
- Pre-populated portfolio
- Simulated execution

---

## Quick Start

### Prerequisites
```bash
Node.js 18+
npm or pnpm
```

### Installation
```bash
# Clone the repository
git clone https://github.com/netflow-app/netflow.git
cd netflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Environment Variables
```bash
# LP Agent API (get from https://lpagent.io)
LP_AGENT_API_KEY=your_lp_agent_key

# Cloak SDK (for production use)
CLOAK_RELAY_URL=https://api.cloak.ag
CLOAK_PROGRAM_ID=zh1eLd6rSphLejbFfJEneUwzHRfMKxgzrgkfwA6qRkW

# Solana RPC
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Walkthrough

1. **Welcome Flow** - Click "Try Demo Mode"
2. **Portfolio View** - See 4 LP positions with yield data
3. **Analyze** - Click "Analyze & Optimize"
4. **Recommendations** - View suggested rebalancing
5. **Execute** - Click "Execute Optimization"
6. **Results** - Watch execution feed, see improved yield

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|------------|
| `/api/portfolio` | GET | Fetch LP portfolio |
| `/api/optimize` | POST | Generate execution plan |
| `/api/execute` | POST | Execute optimization |
| `/api/cloak` | POST | Cloak operations |

---

## Technology Stack

- **Frontend**: Next.js 15, React 19, Zustand
- **Backend**: Next.js API Routes, Node.js services
- **Integrations**: LP Agent API, Cloak SDK, Meteora DLMM
- **Styling**: Custom CSS, Lucide icons
- **Charts**: Recharts

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Disclaimer

This is software under active development. Use at your own risk. Always audit contracts and verify integrations before using real funds.