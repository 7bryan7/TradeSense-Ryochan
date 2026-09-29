# TradeSense demo and failure runbook

Verified on September 26, 2026. This runbook uses fixture data by default. Fixture evidence is synthetic, every fill is simulated, and no wallet or exchange account is connected.

## Clean setup

Requirements: Node.js 22.13 or newer, npm, and Chrome for the Playwright journey.

```bash
npm ci
npm run doctor
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

With no `.env`, `doctor` must report `mode: fixture`, `llmProvider: fixture`, `schedulerEnabled: false`, and `trading: simulated-only`. The automated tests must not contact RYO, Gemini, or Tavily.

For a local fixture demo on ports 3000 and 4000, either temporarily move the local `.env` out of the repository or override its live settings:

```bash
DATA_MODE=fixture LLM_PROVIDER=fixture LLM_API_KEY= RYO_MCP_KEY= TAVILY_API_KEY= SCHEDULER_ENABLED=true npm run dev
```

Open `http://localhost:3000`. Enabling the fixture scheduler only demonstrates its controls and durable slots. New schedules still begin paused, and their minimum cadence is five minutes.

## Three-minute demo

### 0:00–0:25 — Scope and safety

- Start on the landing page and choose **Enter demo workspace**. Point out that this is instant prototype access with no Google account or OAuth flow.
- Point to `FIXTURE`, `PAPER ONLY`, and “No wallet. No real funds. All fills are simulated.”
- Describe the flow: RYO-style evidence → validated agent decision → deterministic paper policy → explainable dashboard and chat.
- State that fixture mode proves product behavior; it is not presented as live market research.

### 0:25–1:10 — Evidence to paper decision

1. Keep `SOL` selected and choose **Analyze & simulate**.
2. Show the token/mode, evidence age, proposed action and confidence, and actual simulation outcome together.
3. Open **AI reasoning** from the sidebar. Call out the source/retrieval timestamps, fixture warning, strongest risk, missing data, and contrary evidence.
4. Run SOL a second time and show the compatibility-checked price, 24-hour movement, decision, and simulation deltas. Explain that incompatible identity, mode, or metric windows are blocked rather than compared.
5. Show virtual cash, total paper equity, realized/unrealized P&amp;L, mark time, and valuation completeness. Explain that missing marks produce a partial or unavailable valuation. Sizing, fees, slippage, freshness, and exposure checks remain deterministic server policy; the model cannot write the ledger.

Expected fixture result: a completed SOL `BUY`, an `APPLIED` simulated outcome, and a replay result of “Verified — saved result matches.” Exact timestamps, IDs, quantities, and balances vary with the session.

### 1:10–1:50 — Audit and recovery

- Open **Decision history**, select the run, and show that its evidence, decision, simulation, and replay use one saved snapshot.
- Explain that replay performs no provider call and does not mutate the portfolio.
- Refresh the page and show that the owned run, balance, and conversation persist.

### 1:50–2:25 — Research chat

1. Open **Ask TradeSense** and ask: `Why this decision?`
2. Show the response grounded in the saved SOL decision and evidence.
3. Compare the paper cash before and after the question to demonstrate that chat cannot create even a simulated fill.

Tavily is reserved for chat questions that require current public web context. Do not use a news question in the fixture demo: it would either be unavailable without a key or consume a live Tavily credit when configured.

### 2:25–3:00 — Autonomous scans and limits

1. Add the five-minute SOL schedule; show that it starts `PAUSED`.
2. Resume it, point out the next slot and daily cap, then pause it again.
3. Explain that the worker uses unique token/time slots, leases, one portfolio job at a time, and a cancellation check inside the ledger transaction.
4. Close with the current limitation: the reference-informed UI is connected to the real application state, while historical charts remain unavailable until the backend persists timestamped candle data.

## Failure demonstrations

Use these checks when a judge asks what happens when a provider or policy boundary fails. Do not repeatedly call a degraded live provider during the fixture demo.

| Scenario | Reproducible check | Expected behavior |
|---|---|---|
| RYO market data unavailable | Refer to the September 24 SOL/ETH diagnostics in `HISTORY.md`; only rerun `npm run smoke:live` after RYO recovery and with authorization | Run stops during `FETCHING`; error remains explicit; no model call, decision, or fill is created |
| Gemini fails after research | `npm test -- apps/server/src/run-lifecycle.test.ts -t "resumes from saved evidence"` | Run records `ANALYZING` failure; retry with the same key reuses evidence and cannot duplicate a fill |
| Price becomes stale | `npm test -- apps/server/src/run-lifecycle.test.ts -t "stale"` | Decision is preserved, simulation becomes `BLOCKED_STALE_PRICE`, and the ledger is unchanged |
| Portfolio changes before application | `npm test -- apps/server/src/run-lifecycle.test.ts -t "portfolio"` | Simulation becomes `BLOCKED_PORTFOLIO_CHANGED`; a new analysis is required |
| Schedule is paused near application | `npm test -- apps/server/src/scheduler.test.ts -t "pause win"` | Slot and run are cancelled before a fill; the portfolio remains unchanged |
| Chat/model result is ambiguous after interruption | `npm test -- apps/server/src/chat-lifecycle.test.ts -t "ambiguous"` | API returns `CHAT_MODEL_OUTCOME_UNKNOWN` instead of issuing an untracked duplicate call |
| Hosted usage limit reached | `npm test -- apps/server/src/limits.test.ts` | API returns a structured rate/cap error; no additional provider operation starts |

The last verified RYO diagnostics showed a healthy MCP gateway, valid authentication, and unused rate limit while token/market observations were unavailable or partial. Describe this as degraded downstream market data. Do not describe it as a bad key, busy gateway, exhausted quota, or unlaunched service.

## Live recovery gate

After RYO reports recovery:

1. Run `npm run doctor` and confirm keys are configured without printing them.
2. Run one authorized `npm run smoke:live`. This performs one bounded RYO `analyze_token` request and does not call Gemini or mutate the ledger.
3. Confirm identity, units, observation time, retrieval time, status, warnings, and a usable USD price.
4. Start the app with the scheduler disabled and perform one selected-token analysis.
5. Confirm the saved RYO evidence, schema-valid Gemini decision, deterministic simulation outcome, and replay match.
6. Record the timestamp, token/network identity, provider/model IDs, result, trace ID if present, and any provider usage in `HISTORY.md`.

Stop if evidence is unavailable, partial in a critical field, stale, ambiguously identified, or lacks a valid execution price. Never replace a failed live run with fixture evidence under a `LIVE` label.

## Deployment preflight

No deployment has been completed or selected. Before publishing:

- use a persistent writable database volume and one SQLite writer, or migrate to a reviewed PostgreSQL design;
- replace the browser UUID with authenticated server-issued sessions and secure cookies;
- keep all provider keys server-side and configure the documented HTTP/provider caps;
- keep `SCHEDULER_ENABLED=false` until a persistent worker and graceful termination are verified on the host;
- verify HTTPS, origin policy, backups, restore procedure, logs without credentials, and health checks;
- run the clean setup checks against the exact deployment commit;
- add actual repository, app, and demo URLs only after they exist.

## Claims supported today

- Fixture evidence-to-decision-to-paper-simulation, replay, history, chat, and schedule controls pass the automated browser journey.
- Paper accounting, recovery, ownership, usage caps, chat retention, scheduler leases, cancellation, and shutdown behavior pass offline tests.
- One live RYO analysis, one one-credit Tavily search, and Gemini reasoning over saved combined evidence succeeded separately on September 24, 2026.
- A complete current live RYO → Gemini → paper-decision run is not verified because later RYO market-data calls failed.
- No real-money trading, wallet signing, exchange execution, deployment, production authentication, real candle feed, or predictive-performance claim exists.
