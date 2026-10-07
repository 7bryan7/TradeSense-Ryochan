import { defineConfig } from "@playwright/test";

const testPort = 4100;
const testDatabase = `/tmp/tradesense-e2e-${process.pid}.sqlite`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: `http://127.0.0.1:${testPort}`, launchOptions: { executablePath: "/usr/bin/google-chrome" } },
  webServer: {
    command: "npm start",
    url: `http://127.0.0.1:${testPort}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATA_MODE: "live",
      LLM_PROVIDER: "gemini",
      LLM_API_KEY: "",
      RYO_MCP_KEY: "",
      TAVILY_API_KEY: "",
      DATABASE_PATH: testDatabase,
      PORT: String(testPort),
      WEB_ORIGIN: `http://127.0.0.1:${testPort}`,
      VITE_GOOGLE_CLIENT_ID: "tradesense-test.apps.googleusercontent.com",
      SCHEDULER_ENABLED: "true",
      SCHEDULER_TICK_MS: "1000",
    },
  },
});
