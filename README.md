# MailJob

A browser game about being a white-collar professional whose job is email.
Coworkers send you favors; each one is a task — compose the right email
(right person, right subject, right phrases) before 5 PM, or get cited.

**Status:** early prototype. One email type (task requests), one task type
(send an email). Phishing reports, informational mail, and other task types
are planned.

## Running it

It's a static site (GitHub Pages). ES modules require http(s) — opening
`index.html` via `file://` won't work. Any static server does:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Layout

| File | What it owns |
| --- | --- |
| `index.html` | Page skeleton: top bar, sidebar, list/read views, compose window, day-end modal |
| `styles.css` | All styling (Gmail-modeled) |
| `js/main.js` | Entry point: wires modules together, starts day 1 |
| `js/data.js` | Static data — contacts, topics + their canonical phrases, decoy phrases, pay/clock constants |
| `js/state.js` | Mutable game state, the compose draft, and day planning |
| `js/utils.js` | DOM lookup, HTML escaping, shuffle, time formatting |
| `js/ui.js` | Toast notifications |
| `js/views.js` | Rendering (header, sidebar, list, reading view) + list navigation wiring |
| `js/inbox.js` | Deliveries: a scheduled item becomes an email + an open task |
| `js/compose.js` | The compose window: recipient autocomplete, subject picker, phrase-by-phrase body builder, send + task matching |
| `js/day.js` | The clock, end-of-day pay/citations, next-day reset |

## The loop

- The day runs 9 AM → 5 PM (1 game minute ≈ 0.5 s). Task emails arrive on a schedule.
- There is **no task list** — the inbox is the only record. Ignore a task for
  2 hours and the requester sends an angry follow-up; at 3.5 hours, a furious one.
- Composing is a 4-step phrase builder: greeting → corporate small talk →
  main point → closing. Subject and phrase options mix the real answers with
  decoys — sensible, bland, and absurd ("Werewolf Attack", "Ceiling Bees", …).
- The inbox also gets **noise**: phishing scams (tagged `[External Sender]`,
  with clickable links/attachments — clicking one costs **−$50**), teammates
  just saying hi, and satirical corporate announcements.
- The inbox and Sent **carry over between days** — only tasks and phishing
  clicks reset. Old emails show "Day N" instead of a time in the list.
- Reading an email offers **Reply** (pre-addressed, "Re:" subject) and
  **Forward** ("Fwd:" subject, original message appended) — both reuse the
  phrase-builder compose window. They don't complete tasks (yet).
- Emails are **threaded**: opening any message shows the conversation — the
  original on top, with your replies (and the requester's angry follow-ups)
  stacked below it, oldest first.
- Completing a task pays **+$40**; each task still open at 5 PM is a citation, **−$30**.
- Daily pay is $250 base + bonuses − citations (floored at $0); your balance carries across days.

To add content, edit `js/data.js`: a new topic needs a subject and the one
"correct" main phrase; new coworkers go in `CONTACTS`. Everything else adapts.
