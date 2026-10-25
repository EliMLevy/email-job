// The compose window — the core mechanic. The player picks one or more
// recipients (autocomplete chips), a subject (option list), and builds the
// body phrase by phrase (greeting → small talk → main point → closing).
// Sending completes a task when the recipient set, subject, and main phrase
// all match an open task — or, in forward mode, when the forwarded email is
// the info someone asked for and they are among the recipients.
import { state, draft, newId } from "./state.js";
import { CONTACTS, TOPICS, DISTRACTOR_PHRASES, ABSURD_TOPICS, SMALL_TALK, CLOSINGS, SIGNATURE, TASK_PAY } from "./data.js";
import { $, esc, shuffle } from "./utils.js";
import { toast } from "./ui.js";
import { renderAll } from "./views.js";

function greetingOptions() {
  if (draft.recipients.length > 1) {
    return ["Hi everyone,", "Hi all,", "Hi team,", "Hello everyone,"];
  }
  const first = draft.recipients.length === 1 ? draft.recipients[0].name.split(" ")[0] : "there";
  return [`Hi ${first},`, `Hello ${first},`, `Good morning ${first},`, `Hey ${first},`];
}

const SLOTS = [
  { key: "greeting", label: "Step 1 · Choose a greeting", options: () => greetingOptions() },
  { key: "smalltalk", label: "Step 2 · Corporate small talk", options: () => draft.smallTalkOptions },
  { key: "main", label: "Step 3 · Choose the main point", options: () => draft.mainOptions },
  { key: "closing", label: "Step 4 · Choose a closing", options: () => CLOSINGS },
];

/**
 * Options always include every open send-task's topic/phrase; the remaining
 * slots are padded with decoys — sensible topics, bland filler, and
 * outright absurd ones. Subjects pad to five; main phrases stay at three.
 * (Forward tasks complete via Forward and trainings via the training module,
 * so neither is offered here.)
 */
export function buildComposeOptions() {
  const open = state.tasks.filter((t) => !t.done && t.type === "send");
  const subjects = new Set(open.map((t) => t.topic));
  const subjectPool = shuffle([
    ...TOPICS.map((t) => t.subject),
    ...ABSURD_TOPICS.map((t) => t.subject),
  ]);
  for (const s of subjectPool) {
    if (subjects.size >= 5) break;
    subjects.add(s);
  }
  const phrases = new Set(open.map((t) => t.phrase));
  const phrasePool = shuffle([
    ...DISTRACTOR_PHRASES,
    ...ABSURD_TOPICS.map((t) => t.phrase),
  ]);
  for (const p of phrasePool) {
    if (phrases.size >= 3) break;
    phrases.add(p);
  }
  draft.subjectOptions = shuffle([...subjects]);
  draft.mainOptions = shuffle([...phrases]);
  draft.smallTalkOptions = shuffle(SMALL_TALK).slice(0, 4);
}

export function openCompose() {
  draft.mode = "task";
  draft.forwardOf = null;
  draft.replyTo = null;
  draft.recipients = [];
  draft.subjectTopic = null;
  draft.slots = { greeting: null, smalltalk: null, main: null, closing: null };
  draft.step = 0;
  buildComposeOptions();
  $("composeTitle").textContent = "New Message";
  $("toInput").value = "";
  renderRecipients();
  $("subjectInput").value = "";
  $("compose").classList.remove("hidden");
  renderBodyPreview();
  renderSlot();
  updateSendState();
  $("toInput").focus();
}

/** Reply: compose pre-addressed to the sender, subject locked to "Re: …". */
export function openReply(email) {
  openCompose();
  draft.mode = "reply";
  draft.replyTo = email;
  $("composeTitle").textContent = "Reply";
  draft.subjectTopic = `Re: ${email.subject}`;
  $("subjectInput").value = draft.subjectTopic;
  addRecipient(email.from || (email.recipients && email.recipients[0]));
}

/** Forward: subject locked to "Fwd: …"; the original is appended on send. */
export function openForward(email) {
  openCompose();
  draft.mode = "forward";
  draft.forwardOf = email;
  $("composeTitle").textContent = "Forward";
  draft.subjectTopic = `Fwd: ${email.subject}`;
  $("subjectInput").value = draft.subjectTopic;
}

export function closeCompose() {
  $("compose").classList.add("hidden");
  hideDropdowns();
}

export function renderRecipients() {
  $("toChips").innerHTML = draft.recipients
    .map(
      (c, i) =>
        `<span class="to-chip">${esc(c.name)}<button data-remove="${i}" title="Remove">✕</button></span>`
    )
    .join("");
}

export function addRecipient(contact) {
  if (!contact || draft.recipients.some((r) => r.email === contact.email)) return;
  draft.recipients.push(contact);
  $("toInput").value = "";
  $("toDropdown").classList.add("hidden");
  renderRecipients();
  // Greeting options depend on who's addressed — rebuild if not yet chosen.
  if (draft.step === 0) renderSlot();
  updateSendState();
}

export function removeRecipient(idx) {
  draft.recipients.splice(idx, 1);
  renderRecipients();
  if (draft.step === 0) renderSlot();
  updateSendState();
  $("toInput").focus();
}

export function renderBodyPreview() {
  const parts = [draft.slots.greeting, draft.slots.smalltalk, draft.slots.main, draft.slots.closing].filter(Boolean);
  $("bodyPreview").innerHTML = parts.length
    ? esc(parts.join("\n\n") + (draft.slots.closing ? `\n${SIGNATURE}` : ""))
    : `<span class="body-placeholder">Your email will appear here as you choose phrases…</span>`;
}

export function renderSlot() {
  const reset = $("slotReset");
  if (draft.step >= SLOTS.length) {
    $("slotLabel").textContent = "Body complete ✓";
    $("slotOptions").innerHTML = "";
    reset.classList.remove("hidden");
    return;
  }
  reset.classList.toggle("hidden", draft.step === 0);
  const slot = SLOTS[draft.step];
  $("slotLabel").textContent = slot.label;
  $("slotOptions").innerHTML = slot
    .options()
    .map((opt) => `<button class="slot-opt" data-opt="${esc(opt)}">${esc(opt)}</button>`)
    .join("");
}

export function updateSendState() {
  const ready = draft.recipients.length > 0 && draft.subjectTopic && draft.step >= SLOTS.length;
  $("sendBtn").disabled = !ready;
  $("sendHint").textContent = ready
    ? "Looking good — hit Send."
    : "Pick recipient(s), a subject, and finish the body.";
}

export function showToDropdown() {
  const q = $("toInput").value.trim().toLowerCase();
  const matches = CONTACTS.filter(
    (c) =>
      !draft.recipients.some((r) => r.email === c.email) &&
      (!q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
  );
  const dd = $("toDropdown");
  dd.innerHTML = matches.length
    ? matches
        .map(
          (c) =>
            `<li data-email="${esc(c.email)}">${esc(c.name)} <span class="dd-sub">${esc(c.email)} · ${esc(c.role)}</span></li>`
        )
        .join("")
    : `<li>No matches</li>`;
  dd.classList.remove("hidden");
}

export function showSubjectDropdown() {
  const dd = $("subjectDropdown");
  dd.innerHTML = draft.subjectOptions
    .map((s) => `<li data-subject="${esc(s)}">${esc(s)}</li>`)
    .join("");
  dd.classList.remove("hidden");
}

export function hideDropdowns() {
  $("toDropdown").classList.add("hidden");
  $("subjectDropdown").classList.add("hidden");
}

/** Which open task (if any) does this send satisfy? */
function matchTask() {
  const recipientSet = new Set(draft.recipients.map((r) => r.email));
  if (draft.mode === "forward" && draft.forwardOf) {
    const fwd = state.tasks.find(
      (t) =>
        !t.done &&
        t.type === "forward" &&
        t.infoEmailId === draft.forwardOf.id &&
        recipientSet.has(t.requester.email)
    );
    if (fwd) return fwd;
  }
  return state.tasks.find(
    (t) =>
      !t.done &&
      t.type === "send" &&
      t.topic === draft.subjectTopic &&
      t.phrase === draft.slots.main &&
      t.targets.length === recipientSet.size &&
      t.targets.every((x) => recipientSet.has(x.email))
  );
}

export function sendEmail() {
  let bodyText =
    [draft.slots.greeting, draft.slots.smalltalk, draft.slots.main, draft.slots.closing].filter(Boolean).join("\n\n") +
    `\n${SIGNATURE}`;
  if (draft.mode === "forward" && draft.forwardOf) {
    const orig = draft.forwardOf;
    const fromLine = orig.from
      ? `${orig.from.name} <${orig.from.email}>`
      : "Alex Rivera <alex.rivera@company.com>";
    bodyText +=
      `\n\n---------- Forwarded message ---------\nFrom: ${fromLine}\nSubject: ${orig.subject}\n\n${orig.body}`;
  }
  const sentId = newId();
  state.sent.unshift({
    id: sentId,
    // A reply joins the thread of the email it answers; anything else
    // (fresh compose, forward) starts a thread of its own.
    threadId:
      draft.mode === "reply" && draft.replyTo
        ? draft.replyTo.threadId ?? draft.replyTo.id
        : sentId,
    recipients: [...draft.recipients],
    subject: draft.subjectTopic,
    body: bodyText,
    minutes: state.minutes,
    day: state.day,
  });
  const task = matchTask();
  if (task) {
    task.done = true;
    toast(`✅ Task completed! +$${TASK_PAY} at day's end`, "good");
  } else {
    toast("Email sent.");
  }
  closeCompose();
  renderAll();
}

/** All compose-window listeners, including click-outside and Escape. */
export function initCompose() {
  $("composeBtn").addEventListener("click", openCompose);
  $("composeClose").addEventListener("click", closeCompose);
  $("toInput").addEventListener("input", showToDropdown);
  $("toInput").addEventListener("focus", showToDropdown);
  $("toDropdown").addEventListener("click", (e) => {
    const li = e.target.closest("[data-email]");
    if (!li) return;
    const contact = CONTACTS.find((c) => c.email === li.dataset.email);
    if (contact) addRecipient(contact);
  });
  $("toChips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]");
    if (btn) removeRecipient(Number(btn.dataset.remove));
  });
  $("subjectInput").addEventListener("click", () => {
    if (draft.mode !== "task") return; // reply/forward subjects are locked
    const dd = $("subjectDropdown");
    if (dd.classList.contains("hidden")) showSubjectDropdown();
    else dd.classList.add("hidden");
  });
  $("subjectDropdown").addEventListener("click", (e) => {
    const li = e.target.closest("[data-subject]");
    if (!li) return;
    draft.subjectTopic = li.dataset.subject;
    $("subjectInput").value = draft.subjectTopic;
    hideDropdowns();
    updateSendState();
  });
  $("slotOptions").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-opt]");
    if (!btn || draft.step >= SLOTS.length) return;
    const slot = SLOTS[draft.step];
    draft.slots[slot.key] = btn.dataset.opt;
    draft.step++;
    renderBodyPreview();
    renderSlot();
    updateSendState();
  });
  $("slotReset").addEventListener("click", () => {
    draft.slots = { greeting: null, smalltalk: null, main: null, closing: null };
    draft.step = 0;
    renderBodyPreview();
    renderSlot();
    updateSendState();
  });
  $("sendBtn").addEventListener("click", sendEmail);
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".to-wrap")) $("toDropdown").classList.add("hidden");
    if (!e.target.closest(".subject-wrap")) $("subjectDropdown").classList.add("hidden");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideDropdowns();
      if (!$("compose").classList.contains("hidden")) closeCompose();
    }
  });
}
