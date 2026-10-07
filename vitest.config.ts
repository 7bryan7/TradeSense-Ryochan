import { defineConfig } from "vitest/config";

export default defineConfig({ test: { setupFiles: ["./tests/support/offline.ts"], exclude: ["tests/e2e/**", "node_modules/**", "**/dist/**"] } });
