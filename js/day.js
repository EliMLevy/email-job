// The workday clock and the end-of-day reckoning: pay, citations, next day.
import { state, planDay } from "./state.js";
import { DAY_START, DAY_END, TICK_MS, BASE_PAY, TASK_PAY, CITATION_FEE } from "./data.js";
import { $, esc } from "./utils.js";
import { deliver } from "./inbox.js";
import { renderHeader, renderAll } from "./views.js";
import { closeCompose } from "./compose.js";

export function tick() {
  state.minutes++;
  while (state.plan.length && state.plan[0].minutes <= state.minutes) {
    deliver(state.plan.shift());
  }
  renderHeader();
  if (state.minutes >= DAY_END) endDay();
}

export function startTimer() {
  stopTimer();
  state.timer = setInterval(tick, TICK_MS);
}

export function stopTimer() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}

export function endDay() {
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

export function startNextDay() {
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

export function initDay() {
  $("nextDayBtn").addEventListener("click", startNextDay);
}
