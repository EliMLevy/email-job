// Rendering: header (clock/balance), sidebar (folders + unread badge),
// the email list, and the reading view. Owns the list/read navigation wiring.
import { state } from "./state.js";
import { $, esc, fmtTime } from "./utils.js";

export function renderHeader() {
  $("clock").textContent = fmtTime(state.minutes);
  $("dayLabel").textContent = `Day ${state.day}`;
  $("balance").textContent = `$${state.balance}`;
}

export function renderSidebar() {
  const unread = state.emails.filter((e) => !e.read).length;
  $("unreadBadge").textContent = unread || "";
  document.querySelectorAll(".folder").forEach((f) =>
    f.classList.toggle("active", f.dataset.view === state.view && !state.openEmail)
  );
}

export function renderList() {
  const isInbox = state.view === "inbox";
  $("listTitle").textContent = isInbox ? "Inbox" : "Sent";
  const rows = isInbox ? state.emails : state.sent;
  $("listEmpty").textContent = isInbox ? "No emails yet. The workday is young." : "Nothing sent yet today.";
  $("listEmpty").classList.toggle("hidden", rows.length > 0);
  $("emailList").innerHTML = rows
    .map((e) => {
      if (isInbox) {
        const snippet = e.body.split("\n").filter(Boolean)[1] || e.body.split("\n")[0] || "";
        return (
          `<li class="email-row ${e.read ? "" : "unread"}" data-email-id="${e.id}">` +
          `<span class="row-from">${esc(e.from.name)}</span>` +
          `<span class="row-subject">${esc(e.subject)} <span class="snippet">— ${esc(snippet)}</span></span>` +
          `<span class="row-time">${fmtTime(e.minutes)}</span></li>`
        );
      }
      return (
        `<li class="email-row" data-sent-id="${e.id}">` +
        `<span class="row-from">To: ${esc(e.to.name)}</span>` +
        `<span class="row-subject">${esc(e.subject)}</span>` +
        `<span class="row-time">${fmtTime(e.minutes)}</span></li>`
      );
    })
    .join("");
}

/** Re-render everything that's cheap to redraw (header, sidebar, list). */
export function renderAll() {
  renderHeader();
  renderSidebar();
  if (!state.openEmail) {
    $("listView").classList.remove("hidden");
    $("readView").classList.add("hidden");
    renderList();
  }
}

export function openInboxEmail(email) {
  email.read = true;
  state.openEmail = email;
  $("listView").classList.add("hidden");
  $("readView").classList.remove("hidden");
  $("readSubject").textContent = email.subject;
  $("readFrom").textContent = `${email.from.name} <${email.from.email}>`;
  $("readTime").textContent = fmtTime(email.minutes);
  $("readBody").textContent = email.body;
  const banner = $("taskBanner");
  const task = state.tasks.find((t) => t.id === email.taskId);
  if (task) {
    banner.classList.remove("hidden");
    banner.classList.toggle("done", task.done);
    banner.innerHTML = task.done
      ? `✅ Task completed: email ${esc(task.target.name)} about “${esc(task.topic)}”.`
      : `📌 <strong>Task:</strong> Email <strong>${esc(task.target.name)}</strong> about <strong>“${esc(task.topic)}”</strong> before 5 PM.`;
  } else {
    banner.classList.add("hidden");
  }
  renderSidebar();
}

export function openSentEmail(email) {
  state.openEmail = email;
  $("listView").classList.add("hidden");
  $("readView").classList.remove("hidden");
  $("readSubject").textContent = email.subject;
  $("readFrom").textContent = `To: ${email.to.name} <${email.to.email}>`;
  $("readTime").textContent = fmtTime(email.minutes);
  $("readBody").textContent = email.body;
  $("taskBanner").classList.add("hidden");
  renderSidebar();
}

export function closeRead() {
  state.openEmail = null;
  renderAll();
}

/** Folder switching, list clicks, and the back button. */
export function initViews() {
  document.querySelectorAll(".folder").forEach((f) =>
    f.addEventListener("click", () => {
      state.view = f.dataset.view;
      closeRead();
    })
  );
  $("emailList").addEventListener("click", (e) => {
    const row = e.target.closest("[data-email-id], [data-sent-id]");
    if (!row) return;
    if (row.dataset.emailId) {
      const email = state.emails.find((x) => x.id === Number(row.dataset.emailId));
      if (email) openInboxEmail(email);
    } else {
      const email = state.sent.find((x) => x.id === Number(row.dataset.sentId));
      if (email) openSentEmail(email);
    }
  });
  $("backBtn").addEventListener("click", closeRead);
}
