# OKX.AI Copilot

**Understand your Web3 finances in plain English.**

🔒 Secure DeFi Auditor — Audit, Insights & Analytics

🔗 [Live app](https://okx-copiloit.vercel.app) · [Sandbox demo](https://okx-copiloit.vercel.app/dashboard)

> Built as a submission for the OKX.AI Hackathon — a production-grade Web3 financial copilot.

## Overview

OKX.AI Copilot aggregates your multi-chain wallets, auto-categorizes on-chain activity, monitors recurring developer subscriptions, and shields your capital by flagging drainer contracts and other on-chain anomalies — all explained in plain English instead of raw transaction data.

## Features

### 📊 Unified Portfolio View
Connect Ethereum, Solana, Bitcoin, and DeFi vaults. Monitor balances and track changes across all your addresses from a single dashboard.

### 🏷️ Auto-Categorization
Parses transaction hashes and automatically classifies on-chain activity into categories like Gas Fees, Subscriptions, Trading, and Salaries.

### 🛡️ Anomaly & Threat Shielding
Instant visual warnings for abnormal gas fee spikes, duplicate/double-click transaction retries, and transfers to known phishing or drainer contracts.

### ✨ AI Audit Notes
Plain-English summaries flag issues automatically — e.g. detecting a duplicate fee charge, or a gas payment far above the network average — with a recommended action.

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **AI SDK** (`ai`, `@ai-sdk/google`, `@google/genai`) — powers the AI audit notes and plain-English analysis, backed by Google Gemini
- **ESLint** for linting

## Getting started

### Prerequisites

- Node.js 18.18+ 
- An API key for Google's Gemini API (used via `@ai-sdk/google`)

### Installation

```bash
git clone https://github.com/EmirIsKing/okx-copiloit.git
cd okx-copiloit
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key_here
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The page auto-updates as you edit files under `src/`.

### Other scripts

```bash
npm run build   # Production build
npm run start   # Start the production server
npm run lint    # Run ESLint
```

## Project structure

```
okx-copiloit/
├── public/          # Static assets
├── src/             # Application source (App Router pages, components, AI logic)
├── AGENTS.md         # Notes/config for AI coding agents
├── CLAUDE.md          # Notes/config for Claude
└── ...
```

## Deployment

The app is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Push your fork to GitHub.
2. Import the repo into [Vercel](https://vercel.com/new).
3. Add the `GOOGLE_GENERATIVE_AI_API_KEY` environment variable in your Vercel project settings.
4. Deploy.

## Disclaimer

This project was built for a hackathon submission. Portfolio data, security warnings, and audit notes shown in the sandbox demo may use sample/mock data. This is not financial or security advice — always verify on-chain activity independently before acting on any flagged warning.

## License

Add your license here.
