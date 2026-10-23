// Inbox deliveries: a scheduled plan item becomes an email + an open task,
// and an ignored task earns its requester's escalating follow-up emails.
import { state, newId } from "./state.js";
import { FOLLOWUP_STAGES, FORWARD_REQUEST_SUBJECTS } from "./data.js";
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

/** Someone files information with you. Not a task — until someone asks for it. */
export function deliverInfo(item) {
  const emailId = newId();
  state.infoEmails[item.pairId] = emailId;
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

/** A second person asks you to forward the info email on to them. */
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
    infoEmailId: state.infoEmails[item.pairId] ?? null,
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

/** Send any follow-ups whose time has come for still-open tasks. */
export function checkFollowups() {
  for (const task of state.tasks) {
    if (task.done) continue;
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
  } else if (item.kind === "hi") {
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
