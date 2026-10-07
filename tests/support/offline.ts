// Offline tests must never read local provider credentials or make network calls.
process.env.RYO_MCP_KEY = "";
process.env.LLM_API_KEY = "";
process.env.TAVILY_API_KEY = "";
process.env.DATA_MODE = "live";
process.env.LLM_PROVIDER = "gemini";
globalThis.fetch = async () => { throw new Error("Network access is forbidden in offline tests; inject a test provider"); };
