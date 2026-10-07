import type { ModelAdapter } from "@tradesense/adapters";

type WorkerRequest =
  | { type: "manual"; symbol: string; key: string; sessionId: string; synchronizeModel: boolean }
  | { type: "scheduler"; instant: string; workerId: string };

function send(message: unknown): void {
  if (process.send) process.send(message);
}

async function main(request: WorkerRequest): Promise<void> {
  const [{ FixtureModelAdapter, FixtureResearchAdapter }, database, services, scheduler] = await Promise.all([
    import("./providers.js"),
    import("../../apps/server/src/db.js"),
    import("../../apps/server/src/services.js"),
    import("../../apps/server/src/scheduler.js"),
  ]);
  database.migrate();
  const fixtureModel = new FixtureModelAdapter();
  let model: ModelAdapter = fixtureModel;
  if (request.type === "manual" && request.synchronizeModel) {
    model = {
      createDecision: async (input) => {
        send({ type: "model-ready" });
        await new Promise<void>((resolve) => {
          const listener = (message: unknown) => {
            if (message && typeof message === "object" && "type" in message && message.type === "release-model") {
              process.off("message", listener);
              resolve();
            }
          };
          process.on("message", listener);
        });
        return fixtureModel.createDecision(input);
      },
      answerQuestion: (input) => fixtureModel.answerQuestion(input),
    };
  }
  try {
    if (request.type === "manual") {
      const run = await services.createRun(request.symbol, request.key, { research: new FixtureResearchAdapter(), model }, request.sessionId);
      send({ type: "result", result: { id: run.id, status: run.status, outcome: run.simulation?.outcome } });
    } else {
      const result = await scheduler.runSchedulerTick({
        research: new FixtureResearchAdapter(), model,
        now: () => new Date(request.instant), workerId: request.workerId, maxJobs: 1,
      });
      send({ type: "result", result });
    }
  } catch (error) {
    const value = error as Error & { code?: string; status?: number };
    send({ type: "error", error: { message: value.message, code: value.code, status: value.status } });
  } finally {
    database.db.close();
  }
}

process.once("message", (message) => {
  void main(message as WorkerRequest).finally(() => process.exit(0));
});
send({ type: "ready" });
