# Prompt log: action lines on every hand (#39)

Agent: Claude Code (Claude Opus 5.5), 2026-11-04. My prompts were in Chinese; English translations below each.

## Prompts

> 我感觉这个手牌记录里还是应该给得更详细一点，就是多条街的行动路线……我觉得可以尝试先做一到3个版本，我看看，然后OK了以后，再把目前的这个所有的……都迭代一下

Translation: "The hand records should be more detailed: the action on each street, in a fairly standard notation. Try one to three versions for me to look at first. Once one is OK, update all of them."

> 选 A：今天先按 A 把 40 手都改掉

Translation: "Pick A: change all 40 hands to version A today."

> 在数字后面加上BB

Translation: "Add BB after the numbers."

## What happened

The agent showed three formats on one real hand: street-by-street text, compact notation, and a timeline that needs new code. I chose the text version because it needs no code change on demo day, and a fixed format can become structured data later.

## What changed

- All 40 hands now start with preflop, flop, turn, river and showdown lines, with amounts in BB and pots at the start of each street. A reached street missing from my notes says "not recorded"; nothing was guessed.
- The old notes stayed below as a short review.
- Seven titles changed: five disagreed with my notes, one had a real bet size, and one used a word I did not want on a projector.
- `PLAN.md`: Plan vs. Reality updated.

The agent checked the database against the local file with an md5 checksum after writing. No app code changed.
