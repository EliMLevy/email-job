// Endings reached, and the first-load menu screen that shows them.
// Endings are the one thing that persists across loads (localStorage):
// a run itself is still in-memory only, so reaching day 10 has to happen
// in a single session, but once an ending is unlocked it stays unlocked.
import { ENDINGS } from "./data.js";
import { $ } from "./utils.js";

const ENDINGS_KEY = "mailjob_endings_v1";

function readStoredIds() {
  try {
    const raw = localStorage.getItem(ENDINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function loadEndings() {
  const ids = new Set(readStoredIds());
  return ENDINGS.filter((e) => ids.has(e.id));
}

export function unlockEnding(id) {
  const ids = readStoredIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try {
      localStorage.setItem(ENDINGS_KEY, JSON.stringify(ids));
    } catch {
      /* storage unavailable — the ending still shows this session */
    }
  }
  return loadEndings();
}

/** Menu line: how many endings the player has reached, and which ones. */
export function renderMenu() {
  const unlocked = loadEndings();
  const el = $("menuEndings");
  if (!el) return;
  el.textContent =
    unlocked.length > 0
      ? `Endings reached: ${unlocked.length} / ${ENDINGS.length} — ${unlocked.map((e) => e.name).join(", ")}`
      : `Endings reached: 0 / ${ENDINGS.length}`;
}
