import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey = "tradesense.theme.v1";
const changeEvent = "tradesense-theme-change";
type Theme = "light" | "dark";
const currentTheme = (): Theme => document.documentElement.dataset.theme === "light" ? "light" : "dark";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(notify: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) {
      applyTheme(event.newValue === "light" ? "light" : "dark");
    }
  };
  window.addEventListener(changeEvent, notify);
  window.addEventListener("storage", storage);
  return () => {
    window.removeEventListener(changeEvent, notify);
    window.removeEventListener("storage", storage);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme);
  const next = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} theme`;
  return <button type="button" className="theme-toggle" aria-label={label} title={label} onClick={() => {
    try { localStorage.setItem(storageKey, next); } catch { /* Still usable when browser storage is unavailable. */ }
    applyTheme(next);
  }}>{theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</button>;
}
