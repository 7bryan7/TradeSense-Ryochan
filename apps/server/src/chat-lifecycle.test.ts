import { createHash, randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { ModelAdapter, ResearchAdapter } from "@tradesense/adapters";
import type { Evidence } from "@tradesense/core";

const databasePath = `/tmp/tradesense-chat-lifecycle-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "fixture";
process.env.LLM_PROVIDER = "fixture";
process.env.LLM_API_KEY = "";
process.env.RYO_MCP_KEY = "";
process.env.TAVILY_API_KEY = "";
process.env.DATABASE_PATH = databasePath;

const [{ FixtureModelAdapter, FixtureResearchAdapter }, database, services] = await Promise.all([
  import("@tradesense/adapters"),
  import("./db.js"),
  import("./services.js"),
]);

const sessionA = "10000000-0000-4000-8000-000000000001";
const sessionB = "20000000-0000-4000-8000-000000000002";
const unavailableWebSearch = async () => { throw new Error("Web search must not run in this test"); };

describe("durable chat and session ownership", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("reuses saved research when a known model failure is retried", async () => {
    const conversation = services.createConversation("BTC", sessionA);
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    let researchCalls = 0;
    let modelCalls = 0;
    const research: ResearchAdapter = { call: async (tool, args) => { researchCalls += 1; return fixtureResearch.call(tool, args); } };
    const model: ModelAdapter = {
      createDecision: (input) => fixtureModel.createDecision(input),
      answerQuestion: async (input) => {
        modelCalls += 1;
        if (modelCalls === 1) throw Object.assign(new Error("temporary answer failure"), { code: "MODEL_UNAVAILABLE", retryable: true });
        return fixtureModel.answerQuestion(input);
      },
    };
    const dependencies = { research, model, searchWeb: unavailableWebSearch };
    const key = `chat-${randomUUID()}`;

    await expect(services.ask(conversation.id, "What does the BTC data show?", key, "BTC", undefined, sessionA, dependencies))
      .rejects.toThrow("temporary answer failure");
    const failed = services.conversationView(conversation.id, sessionA);
    expect(failed.messages).toHaveLength(1);
    expect(failed.messages[0]).toMatchObject({ role: "user", status: "failed", failure: { stage: "ANSWERING", code: "MODEL_UNAVAILABLE" } });
    expect((database.db.prepare("SELECT COUNT(*) AS count FROM evidence WHERE message_id=?").get(failed.messages[0]!.id) as { count: number }).count).toBe(1);

    const completed = await services.ask(conversation.id, "What does the BTC data show?", key, "BTC", undefined, sessionA, dependencies);
    expect(completed.messages).toHaveLength(2);
    expect(completed.messages.map((message) => message.status)).toEqual(["complete", "complete"]);
    expect(completed.messages[0]!.attemptCount).toBe(2);
    expect(researchCalls).toBe(1);
    expect(modelCalls).toBe(2);

    const repeated = await services.ask(conversation.id, "What does the BTC data show?", key, "BTC", undefined, sessionA, dependencies);
    expect(repeated.messages).toHaveLength(2);
    expect(researchCalls).toBe(1);
    expect(modelCalls).toBe(2);
    await expect(services.ask(conversation.id, "Changed text", key, "BTC", undefined, sessionA, dependencies)).rejects.toMatchObject({ status: 409 });
  });

  it("does not repeat a completed web search when answer generation is retried", async () => {
    const conversation = services.createConversation("SOL", sessionA);
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    let webCalls = 0;
    let modelCalls = 0;
    const searchWeb = async (_conversationId: string, _messageId: string, query: string, symbol: string): Promise<Evidence> => {
      webCalls += 1;
      const timestamp = new Date().toISOString();
      return {
        id: randomUUID(), tool: "tavily_search", symbol, status: "ok", dataMode: "live", asOf: timestamp, retrievedAt: timestamp,
        data: { query, results: [{ title: "Fixture source", url: "https://example.com/news", snippet: "Fixture public context" }] },
        summary: { headline: "One fixture web source", keyPoints: [] }, warnings: ["Fixture web evidence"],
      };
    };
    const model: ModelAdapter = {
      createDecision: (input) => fixtureModel.createDecision(input),
      answerQuestion: async (input) => {
        modelCalls += 1;
        if (modelCalls === 1) throw Object.assign(new Error("temporary model failure"), { code: "MODEL_UNAVAILABLE" });
        return fixtureModel.answerQuestion(input);
      },
    };
    const key = `web-${randomUUID()}`;
    const dependencies = { research: fixtureResearch, model, searchWeb };

    await expect(services.ask(conversation.id, "What is the latest SOL news?", key, "SOL", undefined, sessionA, dependencies)).rejects.toThrow();
    const completed = await services.ask(conversation.id, "What is the latest SOL news?", key, "SOL", undefined, sessionA, dependencies);

    expect(webCalls).toBe(1);
    expect(modelCalls).toBe(2);
    expect(completed.messages[1]!.sources.some((source) => source.kind === "web" && source.title === "Fixture source")).toBe(true);
  });

  it("isolates conversations, linked runs, and paper portfolios by session", async () => {
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    const run = await services.createRun("BTC", `run-${randomUUID()}`, { research: fixtureResearch, model: fixtureModel }, sessionA);
    const conversationA = services.createConversation("BTC", sessionA);
    const conversationB = services.createConversation("BTC", sessionB);

    expect(() => services.conversationView(conversationA.id, sessionB)).toThrow("Conversation not found");
    expect(() => services.getRun(run.id, sessionB)).toThrow("Run not found");
    expect(() => services.replayRun(run.id, sessionB)).toThrow("Completed decision and simulation result are required for replay");
    await expect(services.ask(conversationB.id, "Why this decision?", `link-${randomUUID()}`, "BTC", run.id, sessionB, { research: fixtureResearch, model: fixtureModel, searchWeb: unavailableWebSearch }))
      .rejects.toMatchObject({ status: 404 });
    expect(services.portfolio(sessionA).cashUsd).not.toBe(services.portfolio(sessionB).cashUsd);
    expect(services.history(sessionB)).toEqual([]);
  });

  it("surfaces an ambiguous interrupted model call instead of repeating it", async () => {
    const conversation = services.createConversation("ETH", sessionA);
    const fixtureResearch = new FixtureResearchAdapter();
    const fixtureModel = new FixtureModelAdapter();
    const model: ModelAdapter = {
      createDecision: (input) => fixtureModel.createDecision(input),
      answerQuestion: async () => { throw Object.assign(new Error("known provider failure"), { code: "MODEL_UNAVAILABLE" }); },
    };
    const key = `ambiguous-${randomUUID()}`;
    const text = "What does the ETH data show?";
    await expect(services.ask(conversation.id, text, key, "ETH", undefined, sessionA, { research: fixtureResearch, model, searchWeb: unavailableWebSearch })).rejects.toThrow();
    const inputHash = createHash("sha256").update(JSON.stringify({ text, symbol: "ETH", runId: undefined })).digest("hex");
    database.db.prepare("UPDATE messages SET status='answering', failure_stage=NULL, failure_code=NULL, failure_message=NULL WHERE conversation_id=? AND input_hash=?")
      .run(conversation.id, inputHash);

    await expect(services.ask(conversation.id, text, key, "ETH", undefined, sessionA, { research: fixtureResearch, model, searchWeb: unavailableWebSearch }))
      .rejects.toMatchObject({ status: 409, code: "CHAT_MODEL_OUTCOME_UNKNOWN", retryable: false });
  });
});
