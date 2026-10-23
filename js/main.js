// MailJob — entry point. Wires the modules together and starts day 1.
// You are Alex Rivera, administrative associate. Coworkers email you favors;
// each favor is a task: send the right email (right person, right subject,
// right main phrase) before 5 PM, or get cited at the end of the day.
import { planDay } from "./state.js";
import { renderAll, initViews } from "./views.js";
import { initCompose } from "./compose.js";
import { startTimer, initDay } from "./day.js";

initViews();
initCompose();
initDay();
planDay();
renderAll();
startTimer();
