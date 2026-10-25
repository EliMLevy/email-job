// The workday clock and the end-of-day reckoning: pay, citations, next day.
import { state, planDay } from "./state.js";
import { DAY_START, DAY_END, TICK_MS, BASE_PAY, TASK_PAY, CITATION_FEE, PHISH_FINE, MAX_LEVEL, NEXT_UNLOCK } from "./data.js";
import { $, esc } from "./utils.js";
import { deliver, deliverInfo, deliverForwardRequest, deliverTraining, deliverHeadsUp, deliverPartnerQuestion, checkFollowups, deliverNoise } from "./inbox.js";
import { renderHeader, renderAll } from "./views.js";
import { closeCompose } from "./compose.js";

const DELIVERERS = { task: deliver, info: deliverInfo, forwardRequest: deliverForwardRequest, training: deliverTraining, headsUp: deliverHeadsUp, partnerQuestion: deliverPartnerQuestion };

export function tick() {
  state.minutes++;
  while (state.plan.length && state.plan[0].minutes <= state.minutes) {
    const item = state.plan.shift();
    DELIVERERS[item.kind](item);
  }
  while (state.noise.length && state.noise[0].minutes <= state.minutes) {
    deliverNoise(state.noise.shift());
  }
  checkFollowups();
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

/** Pause/resume the workday clock so the player can step away. */
export function updatePauseBtn() {
  $("pauseBtn").textContent = state.paused ? "▶ Resume" : "⏸ Pause";
  $("clock").classList.toggle("paused", state.paused);
}

export function togglePause() {
  state.paused = !state.paused;
  if (state.paused) {
    stopTimer();
  } else if (state.begun && !state.dayOver) {
    startTimer();
  }
  updatePauseBtn();
}

export function endDay() {
  stopTimer();
  state.dayOver = true;
  const done = state.tasks.filter((t) => t.done);
  const open = state.tasks.filter((t) => !t.done);
  const bonus = done.length * TASK_PAY;
  const fines = open.length * CITATION_FEE;
  const phishFines = state.phishClicks * PHISH_FINE;
  const pay = Math.max(0, BASE_PAY + bonus - fines - phishFines);
  state.balance += pay;
  $("modalTitle").textContent = `Day ${state.day} complete 🎉`;
  $("modalBody").innerHTML =
    `<div class="pay-line"><span>Base pay</span><span>$${BASE_PAY}</span></div>` +
    `<div class="pay-line"><span>Tasks completed (${done.length} × $${TASK_PAY})</span><span>+$${bonus}</span></div>` +
    `<div class="pay-line"><span>Citations (${open.length} × −$${CITATION_FEE})</span><span>−$${fines}</span></div>` +
    (state.phishClicks
      ? `<div class="pay-line"><span>Phishing incidents (${state.phishClicks} × −$${PHISH_FINE})</span><span>−$${phishFines}</span></div>`
      : "") +
    `<div class="pay-line pay-total"><span>Today's pay</span><span>$${pay}</span></div>` +
    `<div class="pay-line"><span>Total balance</span><span>$${state.balance}</span></div>` +
    (open.length
      ? `<h3 style="margin:14px 0 6px">Citations</h3>` +
        open
          .map((t) =>
            t.type === "forward"
              ? `<p class="citation">⚠️ Citation — did not forward “${esc(t.topic)}” to ${esc(t.requester.name)}.</p>`
              : t.type === "training"
                ? `<p class="citation">⚠️ Citation — did not complete the mandatory training.</p>`
                : t.type === "partner"
                  ? `<p class="citation">⚠️ Citation — did not reply to ${esc(t.requester.name)} about “${esc(t.topic)}”.</p>`
                  : `<p class="citation">⚠️ Citation — did not email ${esc(t.targetsLabel)} about “${esc(t.topic)}” (requested by ${esc(t.requester.name)}).</p>`
          )
          .join("")
      : `<p class="all-clear" style="margin-top:14px">No outstanding tasks. A flawless day at the office. ☕</p>`);
  // The responsibility choice: level up (if anything's left to unlock) or stay.
  const next = NEXT_UNLOCK[state.level];
  $("unlockNote").innerHTML = next
    ? `Next responsibility: <strong>${esc(next.name)}</strong> — ${esc(next.blurb)}`
    : "You're carrying all the responsibility there is. For now.";
  $("moreBtn").classList.toggle("hidden", !next);
  $("stayBtn").textContent = next ? "I'd like to continue at my current level" : "Start next day →";
  $("dayModal").classList.remove("hidden");
  renderHeader();
}

export function startNextDay() {
  state.day++;
  state.minutes = DAY_START;
  state.dayOver = false;
  state.paused = false;
  updatePauseBtn();
  // The inbox and Sent carry over — only tasks and phish clicks reset.
  state.tasks = [];
  state.phishClicks = 0;
  state.openEmail = null;
  state.view = "inbox";
  closeCompose();
  planDay();
  $("dayModal").classList.add("hidden");
  renderAll();
  startTimer();
}

export function initDay() {
  $("pauseBtn").addEventListener("click", togglePause);
  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement && document.activeElement.tagName;
    if ((e.code === "Space" || e.code === "KeyP") && tag !== "INPUT" && tag !== "TEXTAREA") {
      e.preventDefault();
      togglePause();
    }
  });
  $("moreBtn").addEventListener("click", () => {
    if (state.level < MAX_LEVEL) state.level++;
    startNextDay();
  });
  $("stayBtn").addEventListener("click", startNextDay);
}
