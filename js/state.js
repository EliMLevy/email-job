// Mutable game state and the compose draft, plus day planning.
// Everything else imports state from here rather than keeping its own copy.
import { CONTACTS, TOPICS, REQUEST_SUBJECTS, FLAVOR, SCHEDULE, DAY_START } from "./data.js";
import { shuffle } from "./utils.js";

let idCounter = 1;
export const newId = () => idCounter++;

export const state = {
  day: 1,
  balance: 0,
  minutes: DAY_START,
  timer: null,
  plan: [],
  emails: [],
  sent: [],
  tasks: [],
  view: "inbox",
  openEmail: null,
};

/** The in-progress compose window: chosen recipient, subject, and body slots. */
export const draft = {
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
}
