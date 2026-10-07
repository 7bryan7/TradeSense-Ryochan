# TradeSense live-only demo runbook

Updated October 7, 2026. All application research uses RYO live evidence and Gemini. No fixture selector, synthetic chart, fixed AI model, or fake sign-in is available. All trading remains a virtual paper simulation.

## Local setup

1. Run `npm ci`.
2. Configure `.env` with `DATA_MODE=live`, `LLM_PROVIDER=gemini`, `RYO_MCP_KEY`, `LLM_API_KEY`, and `VITE_GOOGLE_CLIENT_ID`. Never put provider secrets in `VITE_*` variables.
3. Configure the Google web client for `http://localhost:3000`.
4. Optionally configure `TAVILY_API_KEY` for supplementary chat web searches.
5. Run `npm run doctor`, then `npm run dev`.
6. Open `http://localhost:3000` and sign in with Google.

Missing provider keys leave the application available, but research returns an explicit “missing data” error. Google entry still depends on its client ID. The Google profile is a frontend gate; production backend authentication is not implemented.

## Walkthrough

- The landing workflow explains the product without invented telemetry. Its data panel says “missing data” until research is available in the workspace.
- Fetch a market overview explicitly, then inspect coverage, source time and warnings.
- Select a token and request analysis. RYO research, Gemini reasoning and a refreshed BUY/SELL quote can consume quota.
- Inspect the saved explanation, evidence timeline and paper outcome. HOLD, no-fill and failed research remain distinct.
- Inspect the chart only if RYO supplied a valid timestamped series. Otherwise it says “missing data”.
- Ask a market question in chat. Tavily is used only for additional web context when required.
- Verify replay against a completed saved paper decision. It never calls providers or creates another fill.

Do not describe stored live-source observations as current without checking their timestamps. Do not claim missing safety coverage is safe. Old non-live records stay preserved but cannot appear in live views or run through the scheduler.

## Offline verification

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:e2e`.

Unit tests inject providers from `tests/support`; these are excluded from production builds. A test setup clears provider credentials and blocks network fetches. The browser check starts an isolated database with empty provider keys, stubs Google only inside Playwright, and verifies missing-data behavior. It does not prove real Google or live market access.

## Live verification gate

A complete post-recovery live run remains a separate verification gate: four saved RYO research calls, schema-valid Gemini output, a separately saved fresh execution quote for BUY/SELL, and a deterministic paper outcome. No offline test establishes this. Respect provider budgets and the RYO fan-out quota. Missing, non-live, invalid, stale or critically incomplete evidence must not produce a fabricated fill.

Deployment and production authentication remain separate work. SQLite requires durable storage; scheduling stays operator-gated and disabled by default.
