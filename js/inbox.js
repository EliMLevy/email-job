// Inbox deliveries: a scheduled plan item becomes an email + an open task,
// and an ignored task earns its requester's escalating follow-up emails.
import { state, newId } from "./state.js";
import { FOLLOWUP_STAGES, FORWARD_REQUEST_SUBJECTS, TRAINING_FROM, TRAINING_SUBJECT, TRAINING_BODY } from "./data.js";
import { joinNames } from "./utils.js";
import { toast } from "./ui.js";
import { renderAll } from "./views.js";

export function deliver(item) {
  const emailId = newId();
  const task = {
    id: newId(),
    type: "send",
    requester: item.requester,
    target: item.target,
    targets: item.targets,
    targetsLabel: joinNames(item.targets),
    topic: item.topic.subject,
    phrase: item.topic.phrase,
    done: false,
    createdAt: state.minutes,
    requestSubject: item.subject,
    emailId,
    nagsSent: 0,
  };
  state.tasks.push(task);
  const first = item.requester.name.split(" ")[0];
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: item.requester,
    subject: item.subject,
    body:
      `Hi Alex,\n\nCould you please email ${joinNames(item.targets)} about the ${item.topic.subject}? ` +
      `${item.flavor}\n\nThanks!\n${first}`,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: task.id,
  });
  toast(`📬 New email from ${item.requester.name}`);
  renderAll();
}

/** Someone files information with you. Not a task — until someone asks for it.
 *  The document joins the player's permanent collection, which is what
 *  tomorrow's forward requests are built from. */
export function deliverInfo(item) {
  const emailId = newId();
  state.infoEmails[item.info.label] = emailId;
  if (!state.ownedInfo.some((o) => o.info.label === item.info.label)) {
    state.ownedInfo.push({ info: item.info, from: item.from, emailId });
  } else {
    state.ownedInfo.find((o) => o.info.label === item.info.label).emailId = emailId;
  }
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: item.from,
    subject: item.info.subject,
    body: item.info.body,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: null,
    kind: "info",
    info: item.info,
  });
  toast(`📬 New email from ${item.from.name}`);
  renderAll();
}

/** Someone asks you to forward a document you own on to them. The target
 *  email is the original info email, wherever in the inbox it now lives. */
export function deliverForwardRequest(item) {
  const emailId = newId();
  const task = {
    id: newId(),
    type: "forward",
    requester: item.requester,
    target: item.requester,
    targets: [item.requester],
    targetsLabel: item.requester.name,
    topic: item.info.label,
    phrase: null,
    infoEmailId: state.infoEmails[item.docLabel] ?? null,
    done: false,
    createdAt: state.minutes,
    requestSubject: FORWARD_REQUEST_SUBJECTS[0],
    emailId,
    nagsSent: 0,
  };
  state.tasks.push(task);
  const first = item.requester.name.split(" ")[0];
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: item.requester,
    subject: FORWARD_REQUEST_SUBJECTS[Math.floor(Math.random() * FORWARD_REQUEST_SUBJECTS.length)],
    body:
      `Hi Alex,\n\n${item.from.name} mentioned they sent you the ${item.info.label}. ` +
      `Could you forward that email to me? I need it ${item.reason}.\n\nThanks!\n${first}`,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: task.id,
  });
  toast(`📬 New email from ${item.requester.name}`);
  renderAll();
}

/** Today's mandatory training module arrives as an email and a task. */
export function deliverTraining() {
  const emailId = newId();
  const task = {
    id: newId(),
    type: "training",
    requester: TRAINING_FROM,
    target: TRAINING_FROM,
    targets: [TRAINING_FROM],
    targetsLabel: "Mandatory Training",
    topic: "Mandatory Training",
    phrase: null,
    done: false,
    createdAt: state.minutes,
    requestSubject: TRAINING_SUBJECT,
    emailId,
    nagsSent: 0,
  };
  state.tasks.push(task);
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: TRAINING_FROM,
    subject: TRAINING_SUBJECT,
    body: TRAINING_BODY,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: task.id,
    kind: "training",
  });
  toast(`📬 New email from ${TRAINING_FROM.name}`);
  renderAll();
}

/** A teammate warns you an external partner is about to write. No task —
 *  just the heads-up, so the partner's email doesn't come out of nowhere. */
export function deliverHeadsUp(item) {
  const emailId = newId();
  const first = item.teammate.name.split(" ")[0];
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: item.teammate,
    subject: `Heads up: ${item.partner.name} will reach out today`,
    body:
      `Hi Alex,\n\nQuick heads-up: ${item.partner.name} from ${item.partner.company} ` +
      `is going to email you today with some questions about the ${item.topic.subject}. ` +
      `They're a legit external partner, so don't be thrown off when their email shows up ` +
      `tagged [External Sender]. You'll want to reply to them directly with the details.\n\nThanks!\n${first}`,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: null,
    kind: "headsUp",
  });
  toast(`📬 New email from ${item.teammate.name}`);
  renderAll();
}

/** An external partner asks you a question. Tagged external like phishing,
 *  but with no lure — replying to this email with the right details is the
 *  task. */
export function deliverPartnerQuestion(item) {
  const emailId = newId();
  const task = {
    id: newId(),
    type: "partner",
    requester: item.partner,
    target: item.partner,
    targets: [item.partner],
    targetsLabel: item.partner.name,
    topic: item.topic.subject,
    phrase: item.topic.phrase,
    partnerEmailId: emailId,
    done: false,
    createdAt: state.minutes,
    requestSubject: `Question about ${item.topic.subject}`,
    emailId,
    nagsSent: 0,
  };
  state.tasks.push(task);
  const first = item.partner.name.split(" ")[0];
  state.emails.unshift({
    id: emailId,
    threadId: emailId,
    from: item.partner,
    subject: `Question about ${item.topic.subject}`,
    body:
      `Hi Alex,\n\nI'm ${first} from ${item.partner.company}. I had a few questions ` +
      `about the ${item.topic.subject} — could you fill me in on the details?\n\nThanks so much,\n${first}`,
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: task.id,
    kind: "partner",
    external: true, // tagged, but legit: no lure, no phishing fine
  });
  toast(`📬 New email from ${item.partner.name}`);
  renderAll();
}

function fill(template, task) {
  return template
    .replaceAll("{target}", task.targetsLabel || task.target.name)
    .replaceAll("{topic}", task.topic)
    .replaceAll("{first}", task.requester.name.split(" ")[0])
    .replaceAll("{subject}", task.requestSubject);
}

/** The requester loses patience: send follow-up #stage for an open task. */
export function deliverFollowup(task, stage) {
  const def = FOLLOWUP_STAGES[stage];
  const pick = (arr) => arr[task.id % arr.length];
  state.emails.unshift({
    id: newId(),
    threadId: task.emailId, // follow-ups join the original request's thread
    from: task.requester,
    subject: fill(pick(def.subjects), task),
    body: fill(pick(def.bodies), task),
    minutes: state.minutes,
    day: state.day,
    read: false,
    taskId: task.id,
  });
  toast(
    stage > 0
      ? `😡 ${task.requester.name} is FURIOUS about the ${task.topic} email`
      : `😠 Angry follow-up from ${task.requester.name}`,
    stage > 0 ? "bad" : ""
  );
  renderAll();
}

/** Send any follow-ups whose time has come for still-open tasks.
 *  Training and partner tasks don't nag — the module email and the
 *  partner's question are the reminders, and the email-flavored
 *  follow-up templates don't fit either of them. */
export function checkFollowups() {
  for (const task of state.tasks) {
    if (task.done || task.type === "training" || task.type === "partner") continue;
    while (
      task.nagsSent < FOLLOWUP_STAGES.length &&
      state.minutes - task.createdAt >= FOLLOWUP_STAGES[task.nagsSent].after
    ) {
      deliverFollowup(task, task.nagsSent);
      task.nagsSent++;
    }
  }
}

/**
 * Deliver one noise email (phishing / hi / announcement). No task, no toast —
 * noise should have to be discovered in the inbox like real clutter.
 */
export function deliverNoise(item) {
  const t = item.template;
  const id = newId();
  const base = { id, threadId: id, minutes: state.minutes, day: state.day, read: false, taskId: null, kind: item.kind };
  if (item.kind === "phish") {
    state.emails.unshift({ ...base, from: t.from, subject: t.subject, body: t.body, external: true, lure: t.lure, phished: false });
  } else if (item.kind === "hi" || item.kind === "intro") {
    state.emails.unshift({
      ...base,
      from: item.from,
      subject: t.subject,
      body: `${t.body}\n\n— ${item.from.name.split(" ")[0]}`,
    });
  } else {
    state.emails.unshift({ ...base, from: t.from, subject: t.subject, body: t.body });
  }
  renderAll();
}
