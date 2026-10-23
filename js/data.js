// Static game data: the cast, the topics, and the tuning constants.
// Add coworkers, topics, or filler phrases here — the rest of the game
// picks them up automatically.

const DOMAIN = "company.com";

export const CONTACTS = [
  { name: "Rachel Donovan", email: `rachel.donovan@${DOMAIN}`, role: "Office Manager" },
  { name: "Janet Park", email: `janet.park@${DOMAIN}`, role: "Events Coordinator" },
  { name: "Marcus Lee", email: `marcus.lee@${DOMAIN}`, role: "Sales Lead" },
  { name: "Priya Nair", email: `priya.nair@${DOMAIN}`, role: "HR Specialist" },
  { name: "Tom Becker", email: `tom.becker@${DOMAIN}`, role: "IT Support" },
  { name: "Sarah Kim", email: `sarah.kim@${DOMAIN}`, role: "Marketing Associate" },
  { name: "David Ortiz", email: `david.ortiz@${DOMAIN}`, role: "Finance Analyst" },
  { name: "Emily Chen", email: `emily.chen@${DOMAIN}`, role: "Product Designer" },
];

// Each topic has the subject line and the one main phrase that "says it right".
export const TOPICS = [
  { subject: "Dinner Party", phrase: "I'm writing to confirm the dinner party on Tuesday evening — really hope you can make it!" },
  { subject: "Fire Drill", phrase: "Please note there will be a fire drill this Thursday at 2 PM — everyone must evacuate to the front lot." },
  { subject: "Upcoming Vacation", phrase: "I wanted to give you a heads-up about my upcoming vacation days next month so we can plan coverage." },
  { subject: "Q3 Budget Review", phrase: "The Q3 budget review meeting has been scheduled — please look over the numbers before we meet." },
  { subject: "Office Move", phrase: "Our team will be moving to the new office floor at the end of the month — please start packing your desk." },
  { subject: "Team Lunch", phrase: "We're organizing a team lunch this Friday and would love for you to join us." },
  { subject: "Project Deadline", phrase: "The project deadline has been moved up, so please plan your work accordingly." },
  { subject: "New Hire Onboarding", phrase: "A new team member is starting on Monday, and I'd like your help getting them onboarded." },
  { subject: "Client Meeting", phrase: "The client meeting has been confirmed for Wednesday morning — please have your updates ready." },
  { subject: "Holiday Schedule", phrase: "The holiday schedule for this year has been posted — please check which days you'll be working." },
];

// Plausible-sounding filler that never completes a task.
export const DISTRACTOR_PHRASES = [
  "Please find the weekly status report attached for your review when you have a moment.",
  "The conference room on the third floor has just been repainted, in case you were wondering about the smell.",
  "Friendly reminder: the parking lot will be closed for resurfacing this weekend.",
  "Our quarterly newsletter is now available on the intranet, if you'd like to take a look.",
];

export const CLOSINGS = [
  "Thanks so much!",
  "Let me know if you have any questions.",
  "Appreciate your help!",
  "Best regards,",
];

export const REQUEST_SUBJECTS = [
  "Quick favor",
  "Can you help with something?",
  "Small request",
  "When you have a moment",
  "Favor to ask",
];

export const FLAVOR = [
  "It's somewhat urgent, if you can get to it today.",
  "No huge rush — sometime today is fine.",
  "I'd really appreciate it.",
  "You'd be doing me a big favor.",
];

// Minutes after midnight when task emails arrive (9:10 AM … 4:00 PM).
export const SCHEDULE = [550, 600, 650, 700, 785, 840, 910, 960];
export const DAY_START = 540; // 9:00 AM
export const DAY_END = 1020; // 5:00 PM
export const TICK_MS = 500; // 1 game minute per real 0.5s → an 8h day ≈ 4 minutes
export const BASE_PAY = 250;
export const TASK_PAY = 40;
export const CITATION_FEE = 30;
export const SIGNATURE = "— Alex Rivera";
