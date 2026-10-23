// MailJob — prototype game logic.
// You are Alex Rivera, administrative associate. Coworkers email you favors;
// each favor is a task: send the right email (right person, right subject,
// right main phrase) before 5 PM, or get cited at the end of the day.

/* ---------------- data ---------------- */

const DOMAIN = "company.com";
const CONTACTS = [
  { name: "Rachel Donovan", email: `rachel.donovan@${DOMAIN}`, role: "Office Manager" },
  { name: "Janet Park", email: `janet.park@${DOMAIN}`, role: "Events Coordinator" },
  { name: "Marcus Lee", email: `marcus.lee@${DOMAIN}`, role: "Sales Lead" },
  { name: "Priya Nair", email: `priya.nair@${DOMAIN}`, role: "HR Specialist" },
  { name: "Tom Becker", email: `tom.becker@${DOMAIN}`, role: "IT Support" },
  { name: "Sarah Kim", email: `sarah.kim@${DOMAIN}`, role: "Marketing Associate" },
  { name: "David Ortiz", email: `david.ortiz@${DOMAIN}`, role: "Finance Analyst" },
  { name: "Emily Chen", email: `emily.chen@${DOMAIN}`, role: "Product Designer" },
];

// Each topic has the subject line and the one main phrase that "says it right".
const TOPICS = [
  { subject: "Dinner Party", phrase: "I'm writing to confirm the dinner party on Tuesday evening — really hope you can make it!" },
  { subject: "Fire Drill", phrase: "Please note there will be a fire drill this Thursday at 2 PM — everyone must evacuate to the front lot." },
  { subject: "Upcoming Vacation", phrase: "I wanted to give you a heads-up about my upcoming vacation days next month so we can plan coverage." },
  { subject: "Q3 Budget Review", phrase: "The Q3 budget review meeting has been scheduled — please look over the numbers before we meet." },
  { subject: "Office Move", phrase: "Our team will be moving to the new office floor at the end of the month — please start packing your desk." },
  { subject: "Team Lunch", phrase: "We're organizing a team lunch this Friday and would love for you to join us." },
  { subject: "Project Deadline", phrase: "The project deadline has been moved up, so please plan your work accordingly." },
  { subject: "New Hire Onboarding", phrase: "A new team member is starting on Monday, and I'd like your help getting them onboarded." },
  { subject: "Client Meeting", phrase: "The client meeting has been confirmed for Wednesday morning — please have your updates ready." },
  { subject: "Holiday Schedule", phrase: "The holiday schedule for this year has been posted — please check which days you'll be working." },
];

// Plausible-sounding filler that never completes a task.
const DISTRACTOR_PHRASES = [
  "Please find the weekly status report attached for your review when you have a moment.",
  "The conference room on the third floor has just been repainted, in case you were wondering about the smell.",
  "Friendly reminder: the parking lot will be closed for resurfacing this weekend.",
  "Our quarterly newsletter is now available on the intranet, if you'd like to take a look.",
];

const CLOSINGS = [
  "Thanks so much!",
  "Let me know if you have any questions.",
  "Appreciate your help!",
  "Best regards,",
];

const REQUEST_SUBJECTS = [
  "Quick favor",
  "Can you help with something?",
  "Small request",
  "When you have a moment",
  "Favor to ask",
];

const FLAVOR = [
  "It's somewhat urgent, if you can get to it today.",
  "No huge rush — sometime today is fine.",
  "I'd really appreciate it.",
  "You'd be doing me a big favor.",
];

// Minutes after midnight when task emails arrive (9:10 AM … 4:00 PM).
const SCHEDULE = [550, 600, 650, 700, 785, 840, 910, 960];
const DAY_START = 540; // 9:00 AM
const DAY_END = 1020; // 5:00 PM
const TICK_MS = 500; // 1 game minute per real 0.5s → an 8h day ≈ 4 minutes
const BASE_PAY = 250;
const TASK_PAY = 40;
const CITATION_FEE = 30;
const SIGNATURE = "— Alex Rivera";

/* ---------------- state ---------------- */

let nextId = 1;
const state = {
  day: 1,
  balance: 0,
  minutes: DAY_START,
  timer: null,
  plan: [],
  emails: [],
  sent: [],
  tasks: [],
  view: "inbox",
  openEmail: null,
};

const draft = {
  recipient: null,
  subjectTopic: null,
  slots: { greeting: null, main: null, closing: null },
  step: 0,
  subjectOptions: [],
  mainOptions: [],
};

/* ---------------- helpers ---------------- */

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
function fmtTime(mins) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}
function toast(msg, kind = "") {
  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.textContent = msg;
  $("toasts").appendChild(el);
  setTimeout(() => el.remove(), 3600);
}

/* ---------------- day setup ---------------- */

function planDay() {
  const topics = shuffle(TOPICS);
  const people = shuffle(CONTACTS);
  state.plan = SCHEDULE.map((minutes, i) => ({
    minutes,
    requester: people[i % people.length],
    target: people[(i + 3) % people.length],
    topic: topics[i % topics.length],
    subject: REQUEST_SUBJECTS[i % REQUEST_SUBJECTS.length],
    flavor: FLAVOR[i % FLAVOR.length],
  }));
}

function deliver(item) {
  const task = {
    id: nextId++,
    requester: item.requester,
    target: item.target,
    topic: item.topic.subject,
    phrase: item.topic.phrase,
    done: false,
  };
  state.tasks.push(task);
  const first = item.requester.name.split(" ")[0];
  state.emails.unshift({
    id: nextId++,
    from: item.requester,
    subject: item.subject,
    body:
      `Hi Alex,\n\nCould you please email ${item.target.name} about the ${item.topic.subject}? ` +
      `${item.flavor}\n\nThanks!\n${first}`,
    minutes: state.minutes,
    read: false,
    taskId: task.id,
  });
  toast(`📬 New email from ${item.requester.name}`);
  renderAll();
}

/* ---------------- clock ---------------- */

function tick() {
  state.minutes++;
  while (state.plan.length && state.plan[0].minutes <= state.minutes) {
    deliver(state.plan.shift());
  }
  renderHeader();
  if (state.minutes >= DAY_END) endDay();
}

function startTimer() {
  stopTimer();
  state.timer = setInterval(tick, TICK_MS);
}
function stopTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

/* ---------------- rendering ---------------- */

function renderHeader() {
  $("clock").textContent = fmtTime(state.minutes);
  $("dayLabel").textContent = `Day ${state.day}`;
  $("balance").textContent = `$${state.balance}`;
}

function renderSidebar() {
  const unread = state.emails.filter((e) => !e.read).length;
  $("unreadBadge").textContent = unread || "";
  const open = state.tasks.filter((t) => !t.done);
  $("taskBadge").textContent = open.length || "";
  $("tasksEmpty").classList.toggle("hidden", open.length > 0);
  $("taskList").innerHTML = open
    .map(
      (t) =>
        `<li>Email <strong>${esc(t.target.name)}</strong> about <strong>“${esc(t.topic)}”</strong>` +
        `<div class="task-sub">requested by ${esc(t.requester.name)}</div></li>`
    )
    .join("");
  document.querySelectorAll(".folder").forEach((f) =>
    f.classList.toggle("active", f.dataset.view === state.view && !state.openEmail)
  );
}

function renderList() {
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

function renderAll() {
  renderHeader();
  renderSidebar();
  if (!state.openEmail) {
    $("listView").classList.remove("hidden");
    $("readView").classList.add("hidden");
    renderList();
  }
}

function openInboxEmail(email) {
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

function openSentEmail(email) {
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

function closeRead() {
  state.openEmail = null;
  renderAll();
}

/* ---------------- compose ---------------- */

function greetingOptions() {
  const first = draft.recipient ? draft.recipient.name.split(" ")[0] : "there";
  return [`Hi ${first},`, `Hello ${first},`, `Good morning ${first},`, `Hey ${first},`];
}

const SLOTS = [
  { key: "greeting", label: "Step 1 · Choose a greeting", options: () => greetingOptions() },
  { key: "main", label: "Step 2 · Choose the main point", options: () => draft.mainOptions },
  { key: "closing", label: "Step 3 · Choose a closing", options: () => CLOSINGS },
];

function buildComposeOptions() {
  const open = state.tasks.filter((t) => !t.done);
  const subjects = new Set(open.map((t) => t.topic));
  for (const t of shuffle(TOPICS)) {
    if (subjects.size >= 4) break;
    subjects.add(t.subject);
  }
  const phrases = new Set(open.map((t) => t.phrase));
  for (const p of shuffle(DISTRACTOR_PHRASES)) {
    if (phrases.size >= 4) break;
    phrases.add(p);
  }
  draft.subjectOptions = shuffle([...subjects]);
  draft.mainOptions = shuffle([...phrases]);
}

function openCompose() {
  draft.recipient = null;
  draft.subjectTopic = null;
  draft.slots = { greeting: null, main: null, closing: null };
  draft.step = 0;
  buildComposeOptions();
  $("toInput").value = "";
  $("toInput").classList.remove("hidden");
  $("toChip").classList.add("hidden");
  $("subjectInput").value = "";
  $("compose").classList.remove("hidden");
  renderBodyPreview();
  renderSlot();
  updateSendState();
  $("toInput").focus();
}

function closeCompose() {
  $("compose").classList.add("hidden");
  hideDropdowns();
}

function renderBodyPreview() {
  const parts = [draft.slots.greeting, draft.slots.main, draft.slots.closing].filter(Boolean);
  $("bodyPreview").innerHTML = parts.length
    ? esc(parts.join("\n\n") + (draft.slots.closing ? `\n${SIGNATURE}` : ""))
    : `<span class="body-placeholder">Your email will appear here as you choose phrases…</span>`;
}

function renderSlot() {
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

function updateSendState() {
  const ready = draft.recipient && draft.subjectTopic && draft.step >= SLOTS.length;
  $("sendBtn").disabled = !ready;
  $("sendHint").textContent = ready
    ? "Looking good — hit Send."
    : "Pick a recipient, a subject, and finish the body.";
}

function selectRecipient(contact) {
  draft.recipient = contact;
  $("toChipText").textContent = `${contact.name} <${contact.email}>`;
  $("toChip").classList.remove("hidden");
  $("toInput").classList.add("hidden");
  $("toDropdown").classList.add("hidden");
  // Greeting options depend on the recipient's first name — rebuild if not yet chosen.
  if (draft.step === 0) renderSlot();
  updateSendState();
}

function clearRecipient() {
  draft.recipient = null;
  $("toChip").classList.add("hidden");
  $("toInput").classList.remove("hidden");
  $("toInput").value = "";
  if (draft.step === 0) renderSlot();
  updateSendState();
  $("toInput").focus();
}

function showToDropdown() {
  const q = $("toInput").value.trim().toLowerCase();
  const matches = CONTACTS.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
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

function showSubjectDropdown() {
  const dd = $("subjectDropdown");
  dd.innerHTML = draft.subjectOptions
    .map((s) => `<li data-subject="${esc(s)}">${esc(s)}</li>`)
    .join("");
  dd.classList.remove("hidden");
}

function hideDropdowns() {
  $("toDropdown").classList.add("hidden");
  $("subjectDropdown").classList.add("hidden");
}

function sendEmail() {
  const bodyText =
    [draft.slots.greeting, draft.slots.main, draft.slots.closing].filter(Boolean).join("\n\n") +
    `\n${SIGNATURE}`;
  const sent = {
    id: nextId++,
    to: draft.recipient,
    subject: draft.subjectTopic,
    body: bodyText,
    minutes: state.minutes,
  };
  state.sent.unshift(sent);
  const task = state.tasks.find(
    (t) =>
      !t.done &&
      t.target.email === draft.recipient.email &&
      t.topic === draft.subjectTopic &&
      t.phrase === draft.slots.main
  );
  if (task) {
    task.done = true;
    toast(`✅ Task completed! +$${TASK_PAY} at day's end`, "good");
  } else {
    toast("Email sent.");
  }
  closeCompose();
  renderAll();
}

/* ---------------- end of day ---------------- */

function endDay() {
  stopTimer();
  const done = state.tasks.filter((t) => t.done);
  const open = state.tasks.filter((t) => !t.done);
  const bonus = done.length * TASK_PAY;
  const fines = open.length * CITATION_FEE;
  const pay = Math.max(0, BASE_PAY + bonus - fines);
  state.balance += pay;
  $("modalTitle").textContent = `Day ${state.day} complete 🎉`;
  $("modalBody").innerHTML =
    `<div class="pay-line"><span>Base pay</span><span>$${BASE_PAY}</span></div>` +
    `<div class="pay-line"><span>Tasks completed (${done.length} × $${TASK_PAY})</span><span>+$${bonus}</span></div>` +
    `<div class="pay-line"><span>Citations (${open.length} × −$${CITATION_FEE})</span><span>−$${fines}</span></div>` +
    `<div class="pay-line pay-total"><span>Today's pay</span><span>$${pay}</span></div>` +
    `<div class="pay-line"><span>Total balance</span><span>$${state.balance}</span></div>` +
    (open.length
      ? `<h3 style="margin:14px 0 6px">Citations</h3>` +
        open
          .map(
            (t) =>
              `<p class="citation">⚠️ Citation — did not email ${esc(t.target.name)} about “${esc(t.topic)}” (requested by ${esc(t.requester.name)}).</p>`
          )
          .join("")
      : `<p class="all-clear" style="margin-top:14px">No outstanding tasks. A flawless day at the office. ☕</p>`);
  $("dayModal").classList.remove("hidden");
  renderHeader();
}

function startNextDay() {
  state.day++;
  state.minutes = DAY_START;
  state.emails = [];
  state.sent = [];
  state.tasks = [];
  state.openEmail = null;
  state.view = "inbox";
  closeCompose();
  planDay();
  $("dayModal").classList.add("hidden");
  renderAll();
  startTimer();
}

/* ---------------- wiring ---------------- */

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
$("composeBtn").addEventListener("click", openCompose);
$("composeClose").addEventListener("click", closeCompose);
$("nextDayBtn").addEventListener("click", startNextDay);

$("toInput").addEventListener("input", showToDropdown);
$("toInput").addEventListener("focus", showToDropdown);
$("toDropdown").addEventListener("click", (e) => {
  const li = e.target.closest("[data-email]");
  if (!li) return;
  const contact = CONTACTS.find((c) => c.email === li.dataset.email);
  if (contact) selectRecipient(contact);
});
$("toChipX").addEventListener("click", clearRecipient);

$("subjectInput").addEventListener("click", () => {
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
  draft.slots = { greeting: null, main: null, closing: null };
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

/* ---------------- go ---------------- */

planDay();
renderAll();
startTimer();
