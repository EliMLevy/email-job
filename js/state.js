// Mutable game state and the compose draft, plus day planning.
// Everything else imports state from here rather than keeping its own copy.
import {
  CONTACTS, TOPICS, REQUEST_SUBJECTS, FLAVOR, SCHEDULE, DAY_START,
  PHISH_EMAILS, HI_EMAILS, ANNOUNCEMENTS, NOISE_SCHEDULE,
} from "./data.js";
import { shuffle } from "./utils.js";

let idCounter = 1;
export const newId = () => idCounter++;

export const state = {
  day: 1,
  balance: 0,
  minutes: DAY_START,
  timer: null,
  plan: [],
  noise: [],
  phishClicks: 0,
  emails: [],
  sent: [],
  tasks: [],
  view: "inbox",
  openEmail: null,
};

/** The in-progress compose window: chosen recipient, subject, and body slots. */
export const draft = {
  mode: "task", // "task" (blank compose) | "reply" | "forward"
  forwardOf: null, // the original email, when mode === "forward"
  replyTo: null, // the email being replied to, when mode === "reply"
  recipient: null,
  subjectTopic: null,
  slots: { greeting: null, smalltalk: null, main: null, closing: null },
  step: 0,
  subjectOptions: [],
  mainOptions: [],
  smallTalkOptions: [],
};

/** Build today's delivery schedule: who's asking whom about what, and when. */
export function planDay() {
  const topics = shuffle(TOPICS);
  const people = shuffle(CONTACTS);
  state.plan = SCHEDULE.map((minutes, i) => ({
    minutes,
    requester: people[i % people.length],
    target: people[(i + 3) % people.length],
    topic: topics[i % topics.length],
    subject: REQUEST_SUBJECTS[i % REQUEST_SUBJECTS.length],
    flavor: FLAVOR[i % FLAVOR.length],
  }));
  planNoise();
}

/** Today's noise: 3 phishing scams, 2 teammates saying hi, 2 announcements. */
export function planNoise() {
  const items = [
    ...shuffle(PHISH_EMAILS).slice(0, 3).map((template) => ({ kind: "phish", template })),
    ...shuffle(HI_EMAILS)
      .slice(0, 2)
      .map((template) => ({ kind: "hi", template, from: CONTACTS[Math.floor(Math.random() * CONTACTS.length)] })),
    ...shuffle(ANNOUNCEMENTS).slice(0, 2).map((template) => ({ kind: "announcement", template })),
  ];
  state.noise = shuffle(items).map((item, i) => ({ ...item, minutes: NOISE_SCHEDULE[i] }));
  state.noise.sort((a, b) => a.minutes - b.minutes);
}
