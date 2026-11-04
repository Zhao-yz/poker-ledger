# First-time user test, 2026-11-03

The tester was a Codex agent (gpt-6.1-sol), not a person. It drove a separate headless Chrome and was told only that a friend built this to track live poker sessions and key hands. Its tools were limited to the browser, with script and network inspection turned off, and it never saw the code. I created the test account myself, so it did not test submitting the sign-up form.

The text below is its report, unedited except that screenshot links were removed.

## Before having an account

1. **First impression — `/login`**  
The shared link took me directly to “Log in” and “Welcome back to Poker Ledger.” The name suggested poker recordkeeping, but the page itself didn’t explain sessions, key hands, or tracking winnings over time. I understood that “Create an account” was my next step.

2. **Moments I hesitated**
   
   - **https://poker-ledger-rust.vercel.app/login:** “Welcome back” made me wonder whether I’d landed at the wrong starting point. I expected an introduction or a preview; I got a login form.
   - **Same URL:** I clicked “♠ Poker Ledger,” expecting an explanatory home page. I ended up on the same login page.
   - **https://poker-ledger-rust.vercel.app/signup:** “Create an account” worked as expected, but I was now being asked for my email and password without having seen the tracker. I still couldn’t judge whether entering sessions and hands would be worth the effort.

3. **Before filling in sign-up**  
“Your sessions are visible only to you” reassured me, and I liked that my name was optional. My remaining questions were: Is it free? What will the app actually look like? How is my information handled? I saw no preview, pricing information, privacy-policy link, or visible password requirements.

I stopped at sign-up without entering anything or submitting a form.

## Using the app

I used the app for about nine minutes and completed all the main tasks. I left the Lucky Chance session and starred jacks hand saved. After removing the made-up losing session, my overall result was **+$155 over six hours**, displayed as **+$26/hour**.

**1. Chronological hesitation log**

URLs below are relative to `https://poker-ledger-rust.vercel.app`. Durations are approximate.

| Page URL | What I tried / expected | What happened and how I recovered | Hold-up |
|---|---|---|---|
| `/sessions/new` | Date last night’s session. I expected today’s default date to match my local date. | It defaulted to November 4 while it was November 3 locally. I entered November 2 myself. | Small pause, ~10 seconds |
| `/sessions/new` | Enter $300 buy-in and $455 cash-out; expect net to show $155. | Net stayed blank despite being marked required. I tried Save; it calculated +$155 correctly. | Small pause, ~10 seconds |
| `/starred` → `/hands/10?from=random` | Open “Review a random hand.” | Initially I remained on Starred. After waiting a few seconds, the hand opened. | Small pause, several seconds |
| `/hands/10?from=random`, `/hands/10/edit` | Look for places to record the board and betting actions. | Review showed my saved text; Edit had cards, position, title, result and notes. I accepted that the rest would go in notes. | Several looks, ~20–30 seconds; gave up looking for separate fields |
| `/sessions/85/edit` | Correct cash-out from $100 to $150; expect the loss to update automatically. | Save stopped because the existing −$200 net conflicted. The error explained how to recover. I cleared net and saved successfully as −$150. | Several tries, ~15 seconds |
| `/` | Understand the early/late comparison and whether I could change its rule. | It said “My rule: sit down before 3pm,” although I hadn’t set that. Clicking the heading did nothing. I moved on without understanding whose rule it was. | Small pause, ~20–30 seconds |
| `/sessions/85` | Determine whether deleting a session would also remove starred hands. | The confirmation explicitly warned that its hands would be deleted. I proceeded; both the session and its hand disappeared. | Small pause; resolved by the warning |
| `/` | Click the running-total chart to open its session. | A tooltip showed the amount, but clicking stayed on the dashboard. I used Sessions instead. | Small pause, ~15 seconds |
| `/hands` | Look for an “Add hand” option on All hands. | I found search and sorting, but no add option. I opened my existing hand and followed its session link to reach the form. | Small pause, ~15–20 seconds |

**2. My top three struggles**

1. **Correcting cash-out required fixing another number.** This interrupted a basic task and made me question the automatic calculation. The error message helped me recover.  
2. **The default session date was a day ahead locally.** I caught it, but could easily have saved the wrong date.  
3. **I couldn’t find separate board or betting-action fields.** For reviewing a key hand later, I’d need to remember to write everything into the notes myself.  
**3. Simply broken**

The date default was observably wrong for my local date. I don’t know why.

I encountered no unrecoverable failures. The cash-out correction was confusing, but the validation message and recovery worked. The random-review link eventually opened successfully.

**4. What worked well**

- The empty dashboard made the first step obvious.
- The overnight session correctly became six hours and +$155.
- Starring and finding the jacks hand again were straightforward.
- Hand search found words in both the title and edited notes.
- Deletion warned about attached hands before proceeding.
- Dashboard totals matched my entries: +$5 with both sessions, then +$155 after deletion.
