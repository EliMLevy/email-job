// MailJob — entry point. Wires the modules together and starts day 1.
// You are Alex Rivera, administrative associate. Coworkers email you favors;
// each favor is a task: send the right email (right person, right subject,
// right main phrase) before 5 PM, or get cited at the end of the day.
import { state, planDay } from "./state.js";
import { $ } from "./utils.js";
import { renderAll, initViews } from "./views.js";
import { initCompose, openReply, openForward } from "./compose.js";
import { startTimer, initDay } from "./day.js";

initViews();
initCompose();
initDay();

// Reply / Forward act on whichever email is open in the reading view.
$("replyBtn").addEventListener("click", () => {
  if (state.openEmail) openReply(state.openEmail);
});
$("forwardBtn").addEventListener("click", () => {
  if (state.openEmail) openForward(state.openEmail);
});

planDay();
renderAll();
// The clock doesn't start until the welcome dialog is dismissed.
$("welcomeBtn").addEventListener("click", () => {
  $("welcomeModal").classList.add("hidden");
  state.begun = true;
  if (!state.paused) startTimer();
});
