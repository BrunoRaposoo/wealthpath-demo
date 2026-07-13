# WealthPath

A financial planning SaaS demo built with Next.js, TypeScript, and modern web technologies.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript (strict)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Client State:** Zustand
- **Server State:** TanStack Query
- **Linting/Formatting:** Biome

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks
├── lib/
│   ├── eodhd/        # EODHD API client (market data)
│   ├── openai/       # OpenAI API client (explanations)
│   └── utils.ts      # Utility functions (cn helper)
├── store/            # Zustand state stores
├── types/            # Shared TypeScript types
└── providers.tsx     # TanStack Query provider
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description |
|----------|-------------|
| `EODHD_API_KEY` | API key for EODHD market data |
| `OPENROUTER_API_KEY` | API key for OpenRouter (AI completions) |
| `OPENROUTER_MODEL` | Model ID, defaults to `openai/gpt-oss-20b:free` |
| `OPENROUTER_BASE_URL` | Override base URL, defaults to `https://openrouter.ai/api/v1` |
| `OPENROUTER_SITE_URL` | Optional HTTP-Referer header for OpenRouter |
| `OPENROUTER_SITE_NAME` | Optional X-Title header for OpenRouter |

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production Server

```bash
npm start
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run Biome linter |
| `npm run lint:fix` | Run Biome linter with auto-fix |
| `npm run format` | Format code with Biome |
| `npm run check` | Run Biome checks (lint + format) |
| `npm run check:write` | Run Biome checks with auto-fix |

## Data Sources

### EODHD

Market data integration via [EODHD](https://eodhd.com/). Client located at `src/lib/eodhd/`.

Available functions:
- `searchSymbols()` - Search for stock symbols
- `getRealtimeQuote()` - Get real-time price quotes
- `getHistoricalData()` - Get historical OHLCV data
- `getFundamentalData()` - Get fundamental company data

### AI Completions (OpenRouter)

AI completions via [OpenRouter](https://openrouter.ai/). Client located at `src/lib/openai/`.

Available functions:
- `createChatCompletion()` - Create chat completions
- `streamChatCompletion()` - Stream chat completions

## License

MIT
