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
// Day 1 is gentler: fewer requests, later start, more spread out.
export const DAY1_SCHEDULE = [600, 690, 790, 890];
// --- Progression -----------------------------------------------------------
// Level 1: email one person about a topic. Level 2: + group emails.
// Level 3: + forward-the-information tasks. Level 4: + mandatory trainings.
export const MAX_LEVEL = 4;
export const NEXT_UNLOCK = {
  1: { name: "Group emails", blurb: "Requests will start asking you to email several people at once." },
  2: { name: "Forwarding information", blurb: "People will send you files and details — and later, someone else will ask you to forward them on." },
  3: { name: "Mandatory trainings", blurb: "Each day brings a mandatory training module — a quick game you have to finish before 5 PM." },
};

// Information one person sends you, which someone else will later ask you
// to forward. kind "pdf" renders as an attachment; "deadline"/"code" render
// as a highlighted detail in the email body.
export const INFO_ITEMS = [
  {
    label: "Q3 Report", kind: "pdf", file: "Q3_Report.pdf",
    subject: "Q3 Report — for your records",
    body: "Hi Alex,\n\nAttached is the Q3 report. Just filing it with you for safekeeping — no action needed.\n\nThanks!",
  },
  {
    label: "Henderson Deadline", kind: "deadline", detail: "Friday, November 14 at 3:00 PM",
    subject: "Henderson project deadline",
    body: "Hi Alex,\n\nFor your records: the deadline for the Henderson project is Friday, November 14 at 3:00 PM. Someone will probably ask you about it eventually.\n\nCheers,",
  },
  {
    label: "Guest Wi-Fi Code", kind: "code", detail: "GUEST-4821",
    subject: "Guest wi-fi code",
    body: "Hi Alex,\n\nThe guest wi-fi code is GUEST-4821. Keeping it with you since people always ask.\n\nThanks,",
  },
  {
    label: "Offsite Budget", kind: "pdf", file: "Offsite_Budget.pdf",
    subject: "Offsite budget doc",
    body: "Hi Alex,\n\nAttached is the offsite budget. No action needed — just keeping you in the loop.\n\nBest,",
  },
  {
    label: "Board Meeting Date", kind: "deadline", detail: "Tuesday at 10:00 AM",
    subject: "Board meeting date — save this",
    body: "Hi Alex,\n\nSaving this with you: the board meeting is Tuesday at 10:00 AM. Someone always needs it forwarded eventually.\n\nThanks,",
  },
];

export const FORWARD_REQUEST_SUBJECTS = ["Can you forward something?", "Quick forward?", "Need a favor — a forward"];
export const FORWARD_REASONS = ["for the planning meeting", "before my performance review", "for my records", "for the client call"];

// Delivery slots for forward requests. Every document the player owns gets
// two requests a day, so the pool must cover all 5 INFO_ITEMS × 2.
export const FORWARD_REQUEST_SLOTS = [640, 680, 720, 760, 800, 840, 880, 920, 960, 1000];

// --- Mandatory trainings (level 4) ----------------------------------------
// One training module a day, delivered as an email + a task. The module is a
// tic-tac-toe game; win, lose, or draw all count as completed.
export const TRAINING_TIME = 660; // 11:00 AM
export const TRAINING_FROM = { name: "People Team", email: "people@company.com" };
export const TRAINING_SUBJECT = "Mandatory Training: Complete by EOD";
export const TRAINING_BODY =
  "Hi Alex,\n\nThis is your mandatory training module for today. Please complete the " +
  "tic-tac-toe exercise below before 5 PM — it doesn't matter whether you win or lose, " +
  "but it does have to be finished.\n\nOpen this email and hit Start Training.\n\n— The People Team";
export const TRAINING_MESSAGE = "Your performance in the training has been recorded for evaluations.";

// ---------------------------------------------------------------------------
// Inbox noise: emails that are NOT tasks.
// ---------------------------------------------------------------------------

// Phishing scams. Always from outside the company (the UI tags them
// [External Sender]) and always carrying a lure: a link or an attachment
// the player is tempted to click. Clicking one costs PHISH_FINE at day's end.
export const PHISH_FINE = 50;
export const PHISH_EMAILS = [
  {
    from: { name: "IT Helpdesk", email: "helpdesk@company-it-support.net" },
    subject: "URGENT: Your password expires in 2 hours!!",
    body: "Dear Employee,\n\nOur system detect unusual activity on your account. Your password will expire in 2 hours. Verify immediately to avoid being locked out.\n\nIT Helpdesk Team",
    lure: { type: "link", label: "Verify My Account Now", url: "http://company-login.secure-verify.ru/auth" },
  },
  {
    from: { name: "Accounts Payable", email: "ap@vendor-invoices.biz" },
    subject: "Invoice #8841 OVERDUE — action required",
    body: "Hello,\n\nAttached is the overdue invoice #8841. Payment is required TODAY to avoid service interruption. Open the attached file to view details.\n\nAccounts Payable",
    lure: { type: "attachment", label: "Invoice_8841.pdf.exe", size: "1.2 MB" },
  },
  {
    from: { name: "Office of the CEO", email: "ceo@company-exec-mail.com" },
    subject: "Confidential — I need a favor, do not discuss",
    body: "Alex,\n\nI am in a meeting and cannot talk. I need you to purchase gift cards for a client surprise. This is confidential — do not tell anyone. Use the link below and send me the codes.\n\nSent from my phone",
    lure: { type: "link", label: "Purchase Gift Cards", url: "http://giftcard-portal-fast.net/buy" },
  },
  {
    from: { name: "DocuSign", email: "docusign@sign-docs-fast.net" },
    subject: "You have a document to sign: Q3_Agreement_FINAL",
    body: "You have received a document to review and sign.\n\nThis document will expire soon. Please review at your earliest convenience.",
    lure: { type: "link", label: "Review Document", url: "http://docusign.secure-docs-view.com/sign" },
  },
  {
    from: { name: "Parcel Delivery", email: "tracking@parcel-delivery-info.com" },
    subject: "Your package is being held at the depot",
    body: "Dear Customer,\n\nWe attempted delivery of your package but no one was available. Print the attached shipping label and bring it to the depot within 48 hours or the package will be returned.",
    lure: { type: "attachment", label: "Shipping_Label.pdf.scr", size: "842 KB" },
  },
];

// Teammates just saying hi. No task, no stakes — pure inbox clutter.
// The sender is picked from the cast at planning time.
export const HI_EMAILS = [
  { subject: "hi", body: "Hi Alex,\n\nJust wanted to say hi. That is the entire email.\n\nOkay bye." },
  { subject: "Hey!!", body: "Hey!!\n\nNo reason for this email. Just saying hey.\n\nHope your inbox is treating you well." },
  { subject: "quick hello", body: "Hi Alex,\n\nPopping into your inbox to say hello. Hello.\n\nCarry on." },
  { subject: "👋", body: "👋\n\n(That's it. That's the email.)" },
  { subject: "tacos?", body: "Hi,\n\nThinking about tacos for lunch. Not organizing anything. Just wanted someone else to be thinking about tacos too.\n\nYou're welcome." },
];

// Corporate announcements. Satire encouraged. Sender included per template.
export const ANNOUNCEMENTS = [
  {
    from: { name: "Corporate Communications", email: "comms@company.com" },
    subject: "Mandatory Fun: Q3 Morale Initiative",
    body: "Team,\n\nAttendance at Friday's Mandatory Fun session is compulsory. Smiling will be monitored. Enthusiasm metrics from last quarter were disappointing and have been noted in your files.\n\n— Corporate Communications",
  },
  {
    from: { name: "People Team", email: "people@company.com" },
    subject: "Reminder: We're a Family Here",
    body: "Hi family,\n\nA gentle reminder that, as a family, we do not discuss salaries with our siblings — that is, coworkers. Families also don't keep secrets, so please enable screen sharing at all times.\n\n— The People Team",
  },
  {
    from: { name: "Corporate Communications", email: "comms@company.com" },
    subject: "Synergy Update: Synergy Up 400%",
    body: "Following the merger of the Synergy Team and the Alignment Team into the Synergy & Alignment Team, synergy is up 400% quarter over quarter. Please direct all questions to the Synergy & Alignment Team.\n\n— Corporate Communications",
  },
  {
    from: { name: "Facilities", email: "facilities@company.com" },
    subject: "Microwave Policy Update (Fish)",
    body: "Effective immediately, microwaving fish in the break room is a terminable offense. The salmon incident of last Tuesday will not be repeated. You know who you are.\n\n— Facilities",
  },
  {
    from: { name: "People Team", email: "people@company.com" },
    subject: "Casual Friday Suspended",
    body: "Casual Friday has been suspended until further notice due to excessive casualness. Business formal dress resumes Monday. Hoodies will be confiscated and donated.\n\n— The People Team",
  },
  {
    from: { name: "Office of the CEO", email: "ceo-office@company.com" },
    subject: "All-Hands Recap: The Pivot",
    body: "For those who missed the all-hands: we are pivoting. The direction of the pivot is still being aligned on. Please continue rowing in the previous direction until told otherwise.\n\n— Office of the CEO",
  },
  {
    from: { name: "Corporate Communications", email: "comms@company.com" },
    subject: "New Core Value Unlocked: Humility",
    body: "We are thrilled to announce Humility as our 14th core value. Please update your email signatures by EOD. Anyone not displaying all 14 values will be coached on humility.\n\n— Corporate Communications",
  },
  {
    from: { name: "People Team", email: "people@company.com" },
    subject: "Mandatory Webinar: 'Webinars: Best Practices'",
    body: "All staff must attend Thursday's webinar on webinar best practices. Attendance will be taken twice: once at the start, and once when you least expect it.\n\n— The People Team",
  },
  {
    from: { name: "Facilities", email: "facilities@company.com" },
    subject: "Fridge Cleanup Friday",
    body: "This Friday the break-room fridge will be cleaned. All unlabeled items will be discarded. All labeled items will also be discarded, but with respect.\n\n— Facilities",
  },
  {
    from: { name: "Office of the CEO", email: "ceo-office@company.com" },
    subject: "CEO's Podcast — Episode 47 Now Live",
    body: "Episode 47 of the CEO's podcast, 'Thoughts on Leadership (Mine)', is now live. Listening is voluntary. Quoting it in meetings is encouraged, and noticed.\n\n— Office of the CEO",
  },
  {
    from: { name: "Corporate Communications", email: "comms@company.com" },
    subject: "Quarterly Values Alignment Survey",
    body: "Please complete the quarterly Values Alignment Survey by Friday. The survey is fully anonymous. Your manager will receive your individual results.\n\n— Corporate Communications",
  },
];

// Day 1 only: your new teammates introduce themselves, one by one.
// Keyed to the cast by name; the sender is resolved at planning time.
export const INTRO_EMAILS = [
  {
    name: "Rachel Donovan",
    subject: "Welcome aboard! 👋",
    body: "Hi Alex, I'm Rachel — office manager, keeper of the supply-closet keys, and the person who actually knows how anything gets done here. If you need something, I'm your first call.\n\nOne word of advice: the good pens are in my desk. They must be earned.",
  },
  {
    name: "Janet Park",
    subject: "Intro: your friendly events person",
    body: "Hi!! I'm Janet, events coordinator. I plan the office parties, the offsites, and at least one annual retreat that is legally distinct from a party.\n\nThere will be many celebrations. Attendance is a joy, and also tracked. I can't wait for you to experience your first Mandatory Fun!",
  },
  {
    name: "Marcus Lee",
    subject: "Marcus Lee — Sales",
    body: "Alex. Marcus, sales lead. I talk loudly on the phone and I'm not sorry — when my deals close, we all eat.\n\nIf you hear someone yell 'LET'S GO' at 9 AM, that's me. Welcome to the team.",
  },
  {
    name: "Priya Nair",
    subject: "Welcome from HR",
    body: "Welcome, Alex! I'm Priya, from HR (the People Team). My door is always open — metaphorically. Please do knock; it's physically closed for focus time.\n\nIf anything ever feels off, come talk to me. That's what I'm here for. Also, please complete your onboarding forms.",
  },
  {
    name: "Tom Becker",
    subject: "IT says hi (please read)",
    body: "Hey. Tom, IT support. Have you tried turning it off and on again? That's most of my job and, frankly, my whole introduction.\n\nOne serious thing: don't click weird links or open sketchy attachments. If an email looks off, it probably is. I do not want to rebuild your laptop. Again. (You're new — the 'again' is preemptive.)",
  },
  {
    name: "Sarah Kim",
    subject: "Hello from Marketing!",
    body: "Hi Alex! Sarah, marketing associate. I make the decks, the one-pagers, and the decks about the one-pagers.\n\nIf you ever need something to look 40% more synergistic by EOD, I am absolutely your person. Welcome!",
  },
  {
    name: "David Ortiz",
    subject: "Finance introduction",
    body: "Hello Alex. David, finance analyst. I review the expense reports, so a word to the wise: label your receipts, all of them, always.\n\nI have seen things in those reports that cannot be unseen. Let's not add to them. Welcome aboard.",
  },
  {
    name: "Emily Chen",
    subject: "Hi from Design 🎨",
    body: "Hey! Emily, product designer. Fair warning: I will have opinions about your slide fonts, your spacing, and possibly your kerning. It's nothing personal — it's design.\n\nExcited to work with you. Welcome to Initech!",
  },
];

// When the introductions land on day 1 (spread across the whole day).
export const INTRO_SCHEDULE_DAY1 = [545, 610, 665, 715, 770, 845, 915, 970];

// Minutes after midnight when noise emails land (interleaved with tasks).
export const NOISE_SCHEDULE = [555, 585, 620, 655, 690, 730, 770, 815, 860, 905, 950];

export const DAY_START = 540; // 9:00 AM
export const DAY_END = 1020; // 5:00 PM
export const TICK_MS = 350; // 1 game minute per real 0.35s → an 8h day ≈ 2.8 minutes
export const BASE_PAY = 250;
export const TASK_PAY = 40;
export const CITATION_FEE = 30;
export const SIGNATURE = "— Alex Rivera";
