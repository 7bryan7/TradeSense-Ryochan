/* global AbortSignal, fetch, process, setTimeout */

const healthUrl = process.env.API_HEALTH_URL ?? "http://127.0.0.1:4000/api/health";
const deadline = Date.now() + 30_000;

while (Date.now() < deadline) {
  try {
    const response = await fetch(healthUrl, { signal: AbortSignal.timeout(1_000) });
    if (response.ok) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const confirmation = await fetch(healthUrl, { signal: AbortSignal.timeout(1_000) });
      if (confirmation.ok) process.exit(0);
    }
  } catch {
    // The API is still starting or restarting.
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}

throw new Error(`TradeSense API did not become ready at ${healthUrl} within 30 seconds`);
