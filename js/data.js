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

// Absurd subjects + phrases that show up as decoys. Choosing one sends a
// very memorable email — it just doesn't complete anyone's task.
export const ABSURD_TOPICS = [
  { subject: "Volcanic Eruption", phrase: "A volcano has erupted near the office and lava is slowly approaching the parking lot." },
  { subject: "Werewolf Attack", phrase: "There has been a werewolf attack on the third floor — please avoid the stairwell until further notice." },
  { subject: "Explosive Diarrhea", phrase: "I am writing to report a severe case of explosive diarrhea in the second-floor bathroom. Send help." },
  { subject: "Haunted Printer", phrase: "The printer on floor 3 is definitely haunted. It only prints ominous warnings now." },
  { subject: "Alien Abduction", phrase: "Gary from accounting was abducted by aliens this morning and will not be joining standup." },
  { subject: "Office Goat", phrase: "A goat has gotten into the office and eaten the Q3 reports. Nobody knows where it came from." },
  { subject: "Mime Infestation", phrase: "We have a mime infestation in the break room. They are trapped in boxes and cannot leave. Or can they?" },
  { subject: "Ceiling Bees", phrase: "There are bees in the ceiling again. Thousands of them. Please work from home." },
];

// Weirdly corporate small talk — a required stop in every email you send.
export const SMALL_TALK = [
  "How was your weekend?",
  "I hope everything is going well with you.",
  "Ugh, Mondays, am I right?",
  "Hope you had a chance to recharge!",
  "Can you believe this weather lately?",
  "Per my last email — just kidding. Unless…?",
  "Let's take this offline sometime.",
  "Living the dream over here, as always.",
];

// Escalating follow-ups the requester sends while a task sits undone.
// {target} = full name, {topic} = the task's topic, {first} = requester's
// first name, {subject} = the original request email's subject.
export const FOLLOWUP_STAGES = [
  {
    after: 120, // 2 hours
    subjects: ["Re: {subject}", "Following up…", "Checking in (again)"],
    bodies: [
      "Hi Alex,\n\nIt's been over two hours — have you emailed {target} about the {topic} yet? I kind of need this done today.\n\nThanks (again),\n{first}",
      "Hi Alex,\n\nJust circling back: the {topic} email to {target} still hasn't gone out. Please take care of it before the day ends.\n\n{first}",
    ],
  },
  {
    after: 210, // 3.5 hours
    subjects: ["URGENT — Re: {subject}", "FINAL WARNING", "???"],
    bodies: [
      "ALEX. It has been over three hours. PLEASE email {target} about the {topic}. There is a citation with your name on it at 5 PM and I cannot stop it.\n\n— {first} (extremely disappointed)",
      "This is my final follow-up. {target}. {topic}. EMAIL. TODAY.\n\n— {first}",
    ],
  },
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
