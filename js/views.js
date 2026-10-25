// Rendering: header (clock/balance), sidebar (folders + unread badge),
// the email list, and the reading view. Owns the list/read navigation wiring.
import { state } from "./state.js";
import { $, esc, fmtTime } from "./utils.js";
import { PHISH_FINE } from "./data.js";
import { toast } from "./ui.js";

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
      const when = e.day === state.day ? fmtTime(e.minutes) : `Day ${e.day}`;
      if (isInbox) {
        const snippet = e.body.split("\n").filter(Boolean)[1] || e.body.split("\n")[0] || "";
        const tag = e.external ? `<span class="ext-tag">[External Sender]</span> ` : "";
        return (
          `<li class="email-row ${e.read ? "" : "unread"}" data-email-id="${e.id}">` +
          `<span class="row-from">${esc(e.from.name)}</span>` +
          `<span class="row-subject">${tag}${esc(e.subject)} <span class="snippet">— ${esc(snippet)}</span></span>` +
          `<span class="row-time">${when}</span></li>`
        );
      }
      return (
        `<li class="email-row" data-sent-id="${e.id}">` +
        `<span class="row-from">To: ${esc(e.recipients.map((r) => r.name).join(", "))}</span>` +
        `<span class="row-subject">${esc(e.subject)}</span>` +
        `<span class="row-time">${when}</span></li>`
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

/** All messages in an email's thread, oldest first. Root = the first one. */
export function threadMessages(email) {
  const rootId = email.threadId ?? email.id;
  return [...state.emails, ...state.sent]
    .filter((m) => (m.threadId ?? m.id) === rootId)
    .sort((a, b) => a.day - b.day || a.minutes - b.minutes || a.id - b.id);
}

/**
 * Open a conversation: the thread's root message renders as the main email,
 * and everything after it — your replies, angry follow-ups — stacks below,
 * like a real email thread.
 */
export function openThread(email) {
  const thread = threadMessages(email);
  const root = thread[0];
  for (const m of thread) if (m.from) m.read = true;
  state.openEmail = email;
  $("listView").classList.add("hidden");
  $("readView").classList.remove("hidden");
  $("readSubject").innerHTML =
    esc(root.subject) + (root.external ? ` <span class="ext-tag">[External Sender]</span>` : "");
  $("readFrom").textContent = root.from
    ? `${root.from.name} <${root.from.email}>`
    : `To: ${root.recipients.map((r) => `${r.name} <${r.email}>`).join(", ")}`;
  $("readTime").textContent = `${fmtTime(root.minutes)} · Day ${root.day}`;
  $("readBody").textContent = root.body;
  renderLure(root);
  renderInfo(root);
  const banner = $("taskBanner");
  const task = state.tasks.find((t) => t.id === root.taskId);
  if (task) {
    banner.classList.remove("hidden");
    banner.classList.toggle("done", task.done);
    if (task.done) {
      banner.innerHTML =
        task.type === "forward"
          ? `✅ Task completed: forwarded “${esc(task.topic)}” to ${esc(task.requester.name)}.`
          : task.type === "training"
            ? `✅ Task completed: mandatory training finished.`
            : task.type === "partner"
              ? `✅ Task completed: replied to ${esc(task.requester.name)} about “${esc(task.topic)}”.`
              : `✅ Task completed: email ${esc(task.targetsLabel)} about “${esc(task.topic)}”.`;
    } else if (task.type === "forward") {
      banner.innerHTML =
        `📌 <strong>Task:</strong> Forward the <strong>“${esc(task.topic)}”</strong> email to ` +
        `<strong>${esc(task.requester.name)}</strong> before 5 PM. (Open that email and hit Forward.)`;
    } else if (task.type === "training") {
      banner.innerHTML =
        `📌 <strong>Task:</strong> Complete the mandatory training before 5 PM. ` +
        `(Hit Start Training below — win, lose, or draw, it just has to be finished.)`;
    } else if (task.type === "partner") {
      banner.innerHTML =
        `📌 <strong>Task:</strong> Reply to <strong>${esc(task.requester.name)}</strong> with the ` +
        `details about <strong>“${esc(task.topic)}”</strong> before 5 PM. (Hit Reply and pick the right main point.)`;
    } else {
      banner.innerHTML =
        `📌 <strong>Task:</strong> Email <strong>${esc(task.targetsLabel)}</strong> about ` +
        `<strong>“${esc(task.topic)}”</strong> before 5 PM.`;
    }
  } else {
    banner.classList.add("hidden");
  }
  // The Start Training button only belongs on an open training email.
  $("trainingBtn").classList.toggle("hidden", !(task && task.type === "training" && !task.done));
  renderThreadReplies(thread.slice(1));
  renderSidebar();
}

function renderThreadReplies(replies) {
  $("threadReplies").innerHTML = replies
    .map((m) => {
      const head = m.from
        ? `${esc(m.from.name)} · ${fmtTime(m.minutes)} · Day ${m.day}`
        : `You → ${esc(m.recipients.map((r) => r.name).join(", "))} · ${fmtTime(m.minutes)} · Day ${m.day}`;
      return (
        `<div class="thread-reply"><div class="thread-reply-head">${head}</div>` +
        `<div class="thread-reply-body">${esc(m.body)}</div></div>`
      );
    })
    .join("");
}

/** Info emails carry a file or a detail worth forwarding. Just displays it. */
export function renderInfo(email) {
  if (!email.info) return;
  const body = $("readBody");
  const wrap = document.createElement("div");
  wrap.className = "lure";
  if (email.info.kind === "pdf") {
    const chip = document.createElement("span");
    chip.className = "attachment-chip static";
    chip.textContent = `📎 ${email.info.file}`;
    wrap.appendChild(chip);
  } else {
    const box = document.createElement("div");
    box.className = "info-box";
    box.textContent =
      email.info.kind === "deadline"
        ? `🗓 ${email.info.label}: ${email.info.detail}`
        : `🔑 ${email.info.label}: ${email.info.detail}`;
    wrap.appendChild(box);
  }
  body.appendChild(wrap);
}

export function openInboxEmail(email) {
  openThread(email);
}

/** Phishing emails carry a clickable lure; clicked ones show the damage. */
export function renderLure(email) {
  const body = $("readBody");
  if (email.phished) {
    const warn = document.createElement("div");
    warn.className = "phished-warning";
    warn.textContent = `⚠️ You fell for it. IT Security has been notified — this costs you $${PHISH_FINE} at day's end.`;
    body.appendChild(warn);
    return;
  }
  if (!email.lure) return;
  const wrap = document.createElement("div");
  wrap.className = "lure";
  if (email.lure.type === "link") {
    const a = document.createElement("a");
    a.className = "phish-link";
    a.href = "#";
    a.textContent = email.lure.label;
    a.addEventListener("click", (ev) => {
      ev.preventDefault();
      handlePhishClick(email);
    });
    const url = document.createElement("span");
    url.className = "phish-url";
    url.textContent = email.lure.url;
    wrap.append(a, document.createElement("br"), url);
  } else {
    const chip = document.createElement("button");
    chip.className = "attachment-chip";
    chip.textContent = `📎 ${email.lure.label} (${email.lure.size})`;
    chip.addEventListener("click", () => handlePhishClick(email));
    wrap.appendChild(chip);
  }
  body.appendChild(wrap);
}

/** The player took the bait: fine them and mark the email as phished. */
export function handlePhishClick(email) {
  if (email.phished) return;
  email.phished = true;
  state.phishClicks++;
  toast(`🚨 That was a phishing email! −$${PHISH_FINE} at day's end`, "bad");
  openInboxEmail(email);
}

export function openSentEmail(email) {
  openThread(email);
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
