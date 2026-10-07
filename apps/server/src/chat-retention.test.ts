import { FixtureModelAdapter, FixtureResearchAdapter } from "../../../tests/support/providers.js";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databasePath = `/tmp/tradesense-chat-retention-${process.pid}-${randomUUID()}.sqlite`;
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
process.env.DATABASE_PATH = databasePath;
process.env.CHAT_MAX_CONVERSATIONS_PER_SESSION = "1";
process.env.CHAT_MAX_MESSAGES_PER_CONVERSATION = "2";

const [database, services] = await Promise.all([
  import("./db.js"),
  import("./services.js"),
]);

const sessionId = "70000000-0000-4000-8000-000000000007";

describe("chat retention boundaries", () => {
  beforeAll(() => database.migrate());

  afterAll(() => {
    database.db.close();
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${databasePath}${suffix}`, { force: true });
  });

  it("caps conversations and reserves a user/assistant pair per question", async () => {
    const conversation = services.createConversation("BTC", sessionId);
    expect(() => services.createConversation("ETH", sessionId)).toThrow("Conversation retention limit reached");

    const first = await services.ask(conversation.id, "What does the token evidence show?", randomUUID(), "BTC", undefined, sessionId, { research: new FixtureResearchAdapter(), model: new FixtureModelAdapter(), searchWeb: async () => { throw new Error("No web search expected"); } });
    expect(first.messages).toHaveLength(2);
    await expect(services.ask(conversation.id, "Give me another update", randomUUID(), "BTC", undefined, sessionId, { research: new FixtureResearchAdapter(), model: new FixtureModelAdapter(), searchWeb: async () => { throw new Error("No web search expected"); } })).rejects.toThrow("Conversation message limit reached");
  });
});
