# Prompt log: session date default (#31)

Agent: Claude Code (Claude Opus 5.5), 2026-11-03. My prompts were in Chinese; English translations below each.

## Prompts

> 先帮我做一下，然后那个stranger test可以把提示词给到codex，让他来控制浏览器呃做相应的操作。

Translation: "Do these for me first. For the stranger test, give the prompt to Codex and have it control the browser."

> 注意不要让codex看代码，让他直接操作网站上对应的呃东西。当然可以设计提示词跟他说一下这大概是一个什么APP，可以起到什么作用啊

Translation: "Make sure Codex doesn't look at the code; have it use the site directly. The prompt can tell it roughly what the app is and what it's for."

## How it came up

The first-time user was a Codex agent driving a separate headless Chrome, not a person. It got a short brief (a friend built this to track live poker sessions) and browser tools only, with its script and network tools turned off. At 10pm on Nov 3 it reported: "It defaulted to November 4 while it was November 3 locally."

## What the agent found

`SessionForm.tsx` and `validation.ts` both took today's date from `toISOString()`, which is UTC. From 4pm Pacific in winter, UTC is already tomorrow. I log sessions at night, so the wrong date would show every time, and nothing would warn me.

## What the agent built

- `src/lib/dates.ts`: `todayInAppZone()`, today in `America/Los_Angeles`. One fixed zone, because the form is rendered on a UTC server first and the server and browser have to agree.
- The form default and the "date is in the future" check both use it.
- `src/lib/dates.test.ts`: three tests.

## Red, then green

The agent wrote the tests with the old UTC logic still in place: 3 failed (`expected '2026-07-05' to be '2026-07-04'`). After the fix, 3 passed.

## Tradeoff

Someone far from Pacific time gets a default date that can be a day off. They can change it, and everyone using this app plays in the Bay Area.
