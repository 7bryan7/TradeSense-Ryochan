import { createApp } from "./app.js";
import { config } from "./config.js";
import { startScheduler } from "./scheduler.js";
import { db } from "./db.js";

const app = createApp();
const scheduler = startScheduler();
const server = app.listen(config.PORT, () => {
  console.log(`TradeSense API listening on http://localhost:${config.PORT} (${config.DATA_MODE} mode, simulated trading only)`);
  if (scheduler) console.log("TradeSense recurring scheduler enabled");
});

let shuttingDown = false;
async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  const schedulerStop = scheduler?.stop() ?? Promise.resolve();
  const serverStop = new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  await Promise.all([schedulerStop, serverStop]);
  db.close();
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => { void shutdown().catch((error) => { console.error(error); process.exitCode = 1; }); });
}
