import { Keyboard } from "lucide-react";
import { Modal } from "./UiPrimitives";

const shortcuts = [
  { keys: ["G", "O"], label: "Open market overview" },
  { keys: ["G", "A"], label: "Open AI reasoning" },
  { keys: ["G", "C"], label: "Open Ask TradeSense" },
  { keys: ["G", "P"], label: "Open paper portfolio" },
  { keys: ["G", "H"], label: "Open decision history" },
  { keys: ["C"], label: "Open Ask TradeSense" },
  { keys: ["/"], label: "Open and focus the chat composer" },
  { keys: ["?"], label: "Show this shortcut guide" },
];

export function KeyboardShortcuts({ open, onClose }: { open: boolean; onClose: () => void }) {
  return <Modal open={open} onClose={onClose} title="Keyboard shortcuts" description="Move through the research workspace without triggering analysis, schedules, or provider calls." size="small">
    <div className="shortcut-intro"><Keyboard /><p>Shortcuts work outside text fields. Press navigation sequences one key at a time.</p></div>
    <dl className="shortcut-list">{shortcuts.map((shortcut) => <div key={`${shortcut.keys.join("-")}-${shortcut.label}`}><dt>{shortcut.keys.map((key) => <kbd key={key}>{key}</kbd>)}</dt><dd>{shortcut.label}</dd></div>)}</dl>
    <p className="shortcut-safety">Analysis and scheduling remain deliberate button actions.</p>
  </Modal>;
}
