import { createApp } from "./app.js";
import { config } from "./config.js";

createApp().listen(config.PORT, () => {
  console.log(`TradeSense API listening on http://localhost:${config.PORT} (${config.DATA_MODE} mode, simulated trading only)`);
});
