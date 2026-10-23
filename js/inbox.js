// Inbox deliveries: a scheduled plan item becomes an email + an open task.
import { state, newId } from "./state.js";
import { toast } from "./ui.js";
import { renderAll } from "./views.js";

export function deliver(item) {
  const task = {
    id: newId(),
    requester: item.requester,
    target: item.target,
    topic: item.topic.subject,
    phrase: item.topic.phrase,
    done: false,
  };
  state.tasks.push(task);
  const first = item.requester.name.split(" ")[0];
  state.emails.unshift({
    id: newId(),
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
