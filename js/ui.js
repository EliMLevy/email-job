// Small UI utilities shared across modules.
import { $ } from "./utils.js";

/** Transient notification in the bottom-left corner. kind: "" | "good" | "bad". */
export function toast(msg, kind = "") {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = msg;
  $("toasts").appendChild(el);
  setTimeout(() => el.remove(), 3600);
}
