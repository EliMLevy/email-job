// Inbox deliveries: a scheduled plan item becomes an email + an open task,
// and an ignored task earns its requester's escalating follow-up emails.
import { state, newId } from "./state.js";
import { FOLLOWUP_STAGES } from "./data.js";
import { toast } from "./ui.js";
import { renderAll } from "./views.js";

export function deliver(item) {
  const emailId = newId();
  const task = {
    id: newId(),
    requester: item.requester,
    target: item.target,
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
      `Hi Alex,\n\nCould you please email ${item.target.name} about the ${item.topic.subject}? ` +
      `${item.flavor}\n\nThanks!\n${first}`,
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
    .replaceAll("{target}", task.target.name)
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
