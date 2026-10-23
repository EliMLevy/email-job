// Mutable game state and the compose draft, plus day planning.
// Everything else imports state from here rather than keeping its own copy.
import {
  CONTACTS, TOPICS, REQUEST_SUBJECTS, FLAVOR, SCHEDULE, DAY1_SCHEDULE, DAY_START,
  PHISH_EMAILS, HI_EMAILS, ANNOUNCEMENTS, NOISE_SCHEDULE, NOISE_SCHEDULE_DAY1,
  INFO_ITEMS, FORWARD_REASONS,
} from "./data.js";
import { shuffle } from "./utils.js";

let idCounter = 1;
export const newId = () => idCounter++;

export const state = {
  day: 1,
  level: 1, // progression: 1 = single emails, 2 = + groups, 3 = + forwarding
  balance: 0,
  minutes: DAY_START,
  timer: null,
  plan: [],
  noise: [],
  phishClicks: 0,
  infoEmails: {}, // pairId -> id of the delivered info email (forward tasks)
  emails: [],
  sent: [],
  tasks: [],
  view: "inbox",
  openEmail: null,
};

/** The in-progress compose window: chosen recipients, subject, and body slots. */
export const draft = {
  mode: "task", // "task" (blank compose) | "reply" | "forward"
  forwardOf: null, // the original email, when mode === "forward"
  replyTo: null, // the email being replied to, when mode === "reply"
  recipients: [],
  subjectTopic: null,
  slots: { greeting: null, smalltalk: null, main: null, closing: null },
  step: 0,
  subjectOptions: [],
  mainOptions: [],
  smallTalkOptions: [],
};

/**
 * Build today's delivery schedule. Day 1 is lighter and slower; group tasks
 * join at level 2; an info drop + forward request pair joins at level 3.
 */
export function planDay() {
  const schedule = state.day === 1 ? DAY1_SCHEDULE : SCHEDULE;
  const topics = shuffle(TOPICS);
  const people = shuffle(CONTACTS);
  const items = schedule.map((minutes, i) => {
    const target = people[(i + 3) % people.length];
    return {
      kind: "task",
      minutes,
      requester: people[i % people.length],
      target,
      targets: [target],
      topic: topics[i % topics.length],
      subject: REQUEST_SUBJECTS[i % REQUEST_SUBJECTS.length],
      flavor: FLAVOR[i % FLAVOR.length],
    };
  });
  if (state.level >= 2 && items.length >= 6) {
    // Two of today's requests go to groups of 2–3 instead of one person.
    for (const [idx, extra] of [[2, 1], [5, 2]]) {
      const item = items[idx];
      const pool = CONTACTS.filter((c) => c !== item.requester && c !== item.target);
      item.targets = [item.target, ...shuffle(pool).slice(0, extra)];
    }
  }
  if (state.level >= 3) {
    // An info drop early, then a different person asks you to forward it.
    const info = shuffle(INFO_ITEMS)[0];
    const [from, requester] = shuffle(CONTACTS);
    const pairId = `pair-day${state.day}`;
    items.push({ kind: "info", minutes: 615, pairId, info, from });
    items.push({
      kind: "forwardRequest",
      minutes: 675,
      pairId,
      info,
      from, // who sent the info (named in the request email)
      requester,
      reason: shuffle(FORWARD_REASONS)[0],
    });
  }
  items.sort((a, b) => a.minutes - b.minutes);
  state.plan = items;
  state.infoEmails = {};
  planNoise();
}

/** Today's noise. Day 1 gets a taste; from day 2 it's 3 phish / 2 hi / 2 announcements. */
export function planNoise() {
  const day1 = state.day === 1;
  const counts = day1 ? { phish: 1, hi: 1, ann: 1 } : { phish: 3, hi: 2, ann: 2 };
  const times = day1 ? NOISE_SCHEDULE_DAY1 : NOISE_SCHEDULE;
  const items = [
    ...shuffle(PHISH_EMAILS).slice(0, counts.phish).map((template) => ({ kind: "phish", template })),
    ...shuffle(HI_EMAILS)
      .slice(0, counts.hi)
      .map((template) => ({ kind: "hi", template, from: CONTACTS[Math.floor(Math.random() * CONTACTS.length)] })),
    ...shuffle(ANNOUNCEMENTS).slice(0, counts.ann).map((template) => ({ kind: "announcement", template })),
  ];
  state.noise = shuffle(items).map((item, i) => ({ ...item, minutes: times[i] }));
  state.noise.sort((a, b) => a.minutes - b.minutes);
}
