# Avalanche AI Payments

Dual-layer (off-chain policy + on-chain contract) USDC payment system for AI agents on Avalanche Fuji. Demonstrates 3 autonomous payment scenarios with spend cap enforcement.

## What It Shows

- Agent autonomously pays merchants via mUSDC without manual approval
- **Layer 1:** Off-chain `checkPolicy()` — fast pre-flight check (no gas)
- **Layer 2:** `AgentExecutor.sol` — on-chain enforcement (can't be bypassed)
- 3 scenarios: food API (approve), API credits (approve), freelancer (reject — exceeds cap)

## Architecture

```
Agent Script → checkPolicy() → AgentExecutor.sol → mUSDC.transfer()
```

## Quick Start

### Prerequisites

- [Foundry](https://getfoundry.sh/) installed
- Fuji testnet AVAX: https://faucet.avax.network/
- Node.js 18+

### Install

```bash
npm install
cd contracts && forge install OpenZeppelin/openzeppelin-contracts --no-commit && cd ..
```

### Deploy Contracts to Fuji

```bash
export DEPLOYER_PK=0x<your-private-key>
cd contracts
forge script script/Deploy.s.sol \
  --rpc-url https://api.avax-test.network/ext/bc/C/rpc \
  --broadcast \
  --legacy
```

Copy the deployed addresses into `.env` (see `.env.example`).

### Run Demo

```bash
source .env
npm run demo
```

### Run Tests

```bash
# Contract tests
cd contracts && forge test -v

# SDK tests
npm test
```

## Policy Rules

| Rule | Value |
|------|-------|
| Max per transaction | 10 mUSDC |
| Allowed recipients | Restaurant, API Provider, Freelancer (hardcoded test addresses) |

## Not in Scope

- Daily budget cap
- LLM / AI agent brain (pure script demo)
- Real USDC (MockUSDC / mUSDC only)
- Mainnet deploy
