// Mutable game state and the compose draft, plus day planning.
// Everything else imports state from here rather than keeping its own copy.
import {
  CONTACTS, TOPICS, REQUEST_SUBJECTS, FLAVOR, SCHEDULE, DAY1_SCHEDULE, DAY_START,
  PHISH_EMAILS, HI_EMAILS, ANNOUNCEMENTS, NOISE_SCHEDULE,
  INFO_ITEMS, FORWARD_REASONS, FORWARD_REQUEST_SLOTS, INTRO_EMAILS, INTRO_SCHEDULE_DAY1,
  TRAINING_TIME, PARTNERS, HEADS_UP_TIME, PARTNER_TIME,
} from "./data.js";
import { shuffle } from "./utils.js";

let idCounter = 1;
export const newId = () => idCounter++;

export const state = {
  day: 1,
  level: 1, // progression: 1 = single emails, 2 = + groups, 3 = + forwarding
  begun: false, // true once the welcome dialog is dismissed
  paused: false,
  dayOver: false, // true while the day-complete dialog is up
  balance: 0,
  minutes: DAY_START,
  timer: null,
  plan: [],
  noise: [],
  phishClicks: 0,
  // Documents the player has been given, kept across days: each entry is
  // { info, from, emailId }. Forward requests are built from this list, so
  // the inbox gets busier with every document collected.
  ownedInfo: [],
  infoEmails: {}, // info label -> id of the delivered info email (forward tasks)
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
 * join at level 2; at level 3 a new info document drops daily and every
 * owned document draws two forward requests; at level 4 a training module
 * joins as well; at level 5 a teammate's heads-up plus an external partner's
 * question join too.
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
    // One new document a day (until the pool runs out), dropped at 10:15.
    // Then, for EVERY document the player owns — old ones included — two
    // different people ask for a forward. Each new document therefore adds
    // two more forward requests to every day after it arrives.
    const ownedLabels = new Set(state.ownedInfo.map((o) => o.info.label));
    const unowned = INFO_ITEMS.filter((i) => !ownedLabels.has(i.label));
    const plannedDocs = state.ownedInfo.map((o) => ({ info: o.info, from: o.from }));
    if (unowned.length) {
      const info = shuffle(unowned)[0];
      const from = shuffle(CONTACTS)[0];
      items.push({ kind: "info", minutes: 615, info, from });
      plannedDocs.push({ info, from });
    }
    let slot = 0;
    for (const doc of plannedDocs) {
      const pool = shuffle(CONTACTS.filter((c) => c.email !== doc.from.email));
      for (const requester of pool.slice(0, 2)) {
        items.push({
          kind: "forwardRequest",
          minutes: FORWARD_REQUEST_SLOTS[slot++],
          docLabel: doc.info.label,
          info: doc.info,
          from: doc.from, // who sent the info (named in the request email)
          requester,
          reason: shuffle(FORWARD_REASONS)[0],
        });
      }
    }
  }
  if (state.level >= 4) {
    // A mandatory training module, once a day.
    items.push({ kind: "training", minutes: TRAINING_TIME });
  }
  if (state.level >= 5) {
    // One external partner a day: a teammate warns you in the morning, then
    // the partner writes at noon asking about a topic. The topic is picked
    // from the ones today's send requests aren't already using, so the
    // partner's question never collides with a send task.
    const partner = shuffle(PARTNERS)[0];
    const teammate = shuffle(CONTACTS)[0];
    const usedTopics = new Set(items.filter((i) => i.kind === "task").map((i) => i.topic.subject));
    const freeTopics = TOPICS.filter((t) => !usedTopics.has(t.subject));
    const topic = shuffle(freeTopics.length ? freeTopics : TOPICS)[0];
    items.push({ kind: "headsUp", minutes: HEADS_UP_TIME, partner, teammate, topic });
    items.push({ kind: "partnerQuestion", minutes: PARTNER_TIME, partner, topic });
  }
  items.sort((a, b) => a.minutes - b.minutes);
  state.plan = items;
  planNoise();
}

/**
 * Today's noise. Day 1: the whole team introduces themselves across the day,
 * plus one phishing scam and one announcement. From day 2: 3 phishing,
 * 2 hi emails, and at least 6 corporate announcements.
 */
export function planNoise() {
  if (state.day === 1) {
    const intros = shuffle(INTRO_EMAILS).map((template, i) => ({
      kind: "intro",
      template,
      from: CONTACTS.find((c) => c.name === template.name),
      minutes: INTRO_SCHEDULE_DAY1[i],
    }));
    state.noise = [
      ...intros,
      { kind: "phish", template: shuffle(PHISH_EMAILS)[0], minutes: 730 },
      { kind: "announcement", template: shuffle(ANNOUNCEMENTS)[0], minutes: 880 },
    ].sort((a, b) => a.minutes - b.minutes);
    return;
  }
  const counts = { phish: 3, hi: 2, ann: 6 };
  const items = [
    ...shuffle(PHISH_EMAILS).slice(0, counts.phish).map((template) => ({ kind: "phish", template })),
    ...shuffle(HI_EMAILS)
      .slice(0, counts.hi)
      .map((template) => ({ kind: "hi", template, from: CONTACTS[Math.floor(Math.random() * CONTACTS.length)] })),
    ...shuffle(ANNOUNCEMENTS).slice(0, counts.ann).map((template) => ({ kind: "announcement", template })),
  ];
  state.noise = shuffle(items).map((item, i) => ({ ...item, minutes: NOISE_SCHEDULE[i] }));
  state.noise.sort((a, b) => a.minutes - b.minutes);
}
