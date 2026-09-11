# CONTENT.md

Every line of user facing copy on the page, in reading order, so it can be revised
without going hunting through markup.

**Where each line lives.** Headlines, standfirsts, term lines, in-stage SVG labels
and button labels are in `index.html`. Lines that change in response to what the
reader does are in `js/scene-NN.js`, and are marked **(js)** below.

**House rules for edits.** Headlines are six words or fewer. Plain words first,
the real term second and smaller. No em dashes or en dashes anywhere. Never state
a protocol parameter that is not in the verified list; anything else is labelled
illustrative on screen.

---

## Masthead

- **Kicker:** An independent explainer
- **Title:** A bank with nobody in it.
- **Standfirst:** The Standard Reserve is one currency, one market, one signal, and about four thousand lines of code that nobody can vote to change. This is a picture book about how that machine behaves. Every idea here has one thing you can touch.
- **Disclaimer:** Independent educational project. Not affiliated with or endorsed by The Standard Reserve. Not financial advice. This page never connects to a wallet and never asks you for anything. For anything real, see standardreserve.xyz.
- **Progress:** All thirteen scenes. It takes about ten minutes, and almost every idea has one thing you can touch.

---

## Scene 1: The problem

- **Kicker:** Scene 1 of 13 · The problem
- **Headline:** The schedule never looks up.
- **Standfirst:** Almost every token picks its emission number in advance and then prints it forever. The market moves underneath, and the schedule does not notice.
- **Stage labels:** THE EMISSION SCHEDULE / THE MARKET / IT NEVER LOOKS UP.
- **Term line:** Plain words: how much new supply appears is decided in advance and never revisited. The real term is a **fixed emission schedule**.
- **Poke hint (fades on first touch):** Drag across the chart
- **Probe readouts (ambient):** the market word under the finger is one of RIPPING · CLIMBING · DRIFTING · SLIDING · CRASHING, chosen from the local slope of the drawn line. The schedule readout is the single word UNCHANGED and never says anything else at any point on the chart. Both are descriptions of the drawn illustration, not protocol figures.

## Scene 2: One currency

- **Kicker:** Scene 2 of 13 · One currency
- **Headline:** One billion, and no more.
- **Standfirst:** $STANDARD has a hard cap written into the code. One row of it exists from day one and is locked in the pool forever. Everything above that row is the entire issuance budget, for all time.
- **Stage labels:** HARD CAP (on the lid) / GENESIS 100M, LOCKED IN THE POOL / AND BURNING ONLY EVER LOWERS IT
- **Counter (js):** counts to 1,000,000,000 and stops there.
- **Poke hint (fades on first touch):** Nudge the blocks. Push the lid.
- **Ambient behaviour:** dragging across the stack shoves blocks aside and they spring back into the same slots. Pressing the lid compresses the stack against it, most at the top, and the lid does not move. The counter reads 1,000,000,000 throughout and nothing a finger does changes it.
- **Term line:** **Verified:** a hard cap of 1,000,000,000 $STANDARD. 100,000,000 of that is the genesis position, the only pre-mint, locked into the pool and never withdrawable. The remaining 900,000,000 is the whole issuance budget, and when it runs out base issuance stops permanently. Because burned tokens never come back, the maximum supply that can ever exist only falls.

## Scene 3: One market

- **Kicker:** Scene 3 of 13 · One market
- **Headline:** One pool. That is the market.
- **Standfirst:** ETH on one side, $STANDARD on the other, and a single pool between them. Everything the protocol knows about the world, it learns in this one place.
- **Stage labels:** HOOK / THE POOL / UNISWAP V4 / ETH / $STANDARD / NO OTHER VENUE. NO OTHER FEED.
- **Term line:** **Verified:** one ETH to $STANDARD pool on Uniswap v4, with a hook.

## Scene 4: One signal

- **Kicker:** Scene 4 of 13 · One signal
- **Headline:** Money in, money out.
- **Standfirst:** Push ETH into the pool, or take some out. This needle is the protocol's entire sense of the world. There is nothing else on the instrument because there is nothing else it reads.
- **Stage labels:** LEVEL / MONEY OUT / MONEY IN
- **Buttons:** Take ETH out · Push ETH in
- **Needle words (js), in order of intensity:** pouring in · money coming in · a trickle in · level · a trickle out · money going out · draining out
- **Term line:** Plain words: money coming in versus money going out. The real term is **net flow**. No price target, no oracle, no committee.

## Scene 5: One authority

- **Kicker:** Scene 5 of 13 · One authority
- **Headline:** There is no vote.
- **Standfirst:** No DAO, no proposals, no votes. Watch the panel empty itself, and see what is left holding the wheel.
- **Card label:** Governance panel
- **Rows (description / control):** Suggest a rule change / Propose · Decide it by token vote / Vote · Halt the system / Pause · Replace the contract / Upgrade · Change the issuance / Set rate · Freeze withdrawals / Pause exits
- **What is left (appears after the panel empties):** WHAT IS LEFT. **Roughly 4,000 lines of immutable code.** No DAO. No proposals. No votes. Whatever the code says, happens.
- **Hint, while the panel is emptying:** Try the controls
- **Hint, once the panel has emptied (replaces it, permanently):** They are not disabled. They are gone.
- **Ambient behaviour:** a removed control depresses under a thumb and produces no result at all. Nothing changes: not the row, not the panel, not the code block. The second line arrives on its own about a second and a half after the panel finishes emptying, so a reader who never presses anything still gets it; pressing only brings it forward.
- **Term line:** **Verified:** roughly 4,000 lines of immutable code, no DAO and no governance votes, and withdrawals are never paused or queued at any fee level. It is not quite nobody at the wheel, though: the whitepaper describes an admin-set reserve price on the Charter auction, a number of Charters per day that is policy-controlled and starts at zero, the one-way transfer switch from the last scene, and a 15 percent team share of protocol revenue.

## Scene 6: You are the bank

- **Kicker:** Scene 6 of 13 · You are the bank
- **Headline:** Bound to you, for now.
- **Standfirst:** A Charter is a banking licence, issued as an NFT that is bound to whoever holds it. Try to take it away and it snaps back. That is how it launches, and the whitepaper is clear that it will not always be that way.
- **Stage labels:** YOU / CHARTER / BANKING LICENCE / BANKER / SOULBOUND AT LAUNCH.
- **Poke hint (fades on first touch):** Drag the card away
- **Ambient behaviour:** the card can be grabbed and dragged. The tether resists on a curve that saturates, so the card reaches its limit and stops there however far the finger goes: dragging 40 units moves it 34, dragging 240 moves it 54, and dragging 1,010 still moves it 54. Releasing snaps it back past centre and settles it home. The one-shot tug still plays on arrival for a reader who never touches it.
- **Term line:** **Verified:** a Charter is an **initially** soulbound NFT, and holders are called Bankers. 1,000 Founding Charters are free at genesis; after that they are sold at a daily Dutch auction in ETH. The whitepaper describes a one-way switch that enables transfers later, at which point selling a Charter becomes a second way out, and one that puts no sell pressure on $STANDARD at all.

## Scene 7: Branches

- **Kicker:** Scene 7 of 13 · Branches
- **Headline:** Your slice of the same pie.
- **Standfirst:** New issuance is divided across every open Branch in the system. Open more and you take more of it. So does everybody else, and the slice gets thinner for all of you.
- **Stage labels:** YOUR SHARE / ALL NEW ISSUANCE
- **Chips:** Your Branches, one to ten · Each Branch gets, of all new issuance
- **Controls:** ten Branch slots, tapped open one at a time (slot one is always open) · How busy is the rest of the system, as a vertical list naming the count: A quiet system 40 Branches / Busy 120 Branches / Everyone expanding 400 Branches. Deliberately not the three-up segmented control scene 12 uses, so the two do not read as the same knob.
- **Hints (js):**
  - Issuance is divided across every open Branch. The pie does not grow when you open one.
  - More Branches, more of the pie. Every one you open also makes each Branch worth a little less.
  - You did nothing. Everyone else expanded, and your share fell anyway.
  - You opened every Branch you are allowed. So did everyone else, and your slice is thinner than when you had one.
- **Term line:** **Verified:** new $STANDARD issuance is divided across all open Branches in the system. Every Charter opens with one Branch and can grow to a maximum of ten. The number of Branches held by everyone else is illustrative.

## Scene 8: The Dutch auction

- **Kicker:** Scene 8 of 13 · The Dutch auction
- **Headline:** The price falls until someone blinks.
- **Standfirst:** Opening a Branch needs an Expansion Licence. A hundred go on sale each day at a price that starts high and decays, paid for in $STANDARD. Wait, and it gets cheaper. Wait too long, and the day is sold out.
- **Stage labels:** PRICE NOW / WHAT YOU PAY / LEFT TODAY / BURNED / NOT BANKED / TOTAL THIS SESSION
- **Status (js):** READY · FALLING · YOU BOUGHT ONE · SOLD OUT
- **Button (js):** Start the auction · Buy a licence · Run another day
- **Hints (js):**
  - The price starts high and falls every second until somebody buys.
  - Wait, and it gets cheaper. Wait too long, and it is gone.
  - You paid N $STANDARD. None of it went to a treasury. All of it was burned.
  - Another Banker bought at N. The licence for today is gone.
- **Term line:** **Verified:** Expansion Licences are sold at a daily Dutch auction, paid for in $STANDARD, and 100 percent of what is spent is burned outright. The prices and the rival bidder here are illustrative.

## Scene 9: Two regimes

- **Kicker:** Scene 9 of 13 · Two regimes
- **Headline:** Two regimes, one switch.
- **Standfirst:** The same signal from scene four decides everything. Money in is spent on hard assets the moment it arrives. Money out piles into a vault first and leaves in small capped steps, so the defence can never be fired in one shot.
- **Stage labels:** EXPANSION / CONTRACTION / HARD RESERVES / VAULT / BURN
- **Regime word (js):** Expansion · Contraction · Neither
- **Chips:** Hard reserves, bought during expansion · $STANDARD burned, bought back and destroyed
- **Control:** a three position lever, Going out / Level / Coming in. Not a slider: scene 4 already owns the flow as a reading, and magnitude is not the lesson here.
- **Rate line (js):** stacking N an hour · burning N an hour · idle
- **Throttle line (js):** vault N, nothing to spend · vault N, held back by the 10% of vault limit · vault N, held back by the 0.2% of pool depth limit
- **Term line:** **Verified:** protocol revenue is split 70 / 15 / 15 each epoch, and the 70 percent goes to whichever vault is active. Buybacks are throttled to at most the smaller of 10 percent of the vault balance and 0.2 percent of pool reserves per hour. Revenue, pool size and the clock here are illustrative: one second stands for one hour.

## Scene 10: The locked money

- **Kicker:** Scene 10 of 13 · The locked money
- **Headline:** You cannot reach your own earnings.
- **Standfirst:** Everything you earn piles up inside the system. The only way to take it out is to retire the Branch that earns it, and a retired Branch is gone for good.
- **Stage label:** NO TAP. NO DOOR.
- **Chips:** Locked in the system, not counted in supply · In your wallet, counted in supply
- **Card label:** Your four Branches
- **Stats:** earning per second · Branches open · gone for good
- **Buttons:** reset the toy · amounts are illustrative
- **Hints (js):**
  - None of this is yours yet. Press and hold a Branch to take its share.
  - Keep holding. This cannot be undone.
  - Branch N paid out and is gone. It will never earn again.
  - Every token is yours. Nothing earns any more.
- **Reduced motion note:** Each Branch fills its own column in the vault. Holding a Branch cracks it open: its column drains into your wallet, the Branch is destroyed, and the earning rate falls by a quarter. Retire all four and the vault is empty, your wallet is full, and nothing earns again.
- **Lesson:** Taking your money out means destroying the thing that makes it. / That is why circulation can stay quiet for a long time. Nobody is holding back out of loyalty. Claiming simply costs more than it pays, until the day it does not. / In the protocol: earned $STANDARD accrues inside the system and is claimed only when a Banker closes, or retires, a Branch. A retired Branch cannot be reopened. Until that moment the balance is a real claim that is not counted in totalSupply.

## Scene 11: The delay

*Temperature colours are this scene's own language and no longer borrow the site roles: cold #2E6FB7, calm #0E9B9B, hot #CC7000, scalding #A3123F, with a neutral waypoint #D6C8BA between calm and hot so the blend never passes through green.*

- **Kicker:** Scene 11 of 13 · The delay
- **Headline:** You turn the tap. Nothing happens.
- **Standfirst:** So you turn it further. The water you asked for is still crawling down a very long pipe. When it finally arrives, it arrives all at once.
- **Stage labels:** THE TAP / YOU
- **Chips:** You asked for · Landing on you
- **Card labels:** The dial · Length of pipe · The last 14 seconds
- **Pipe length words (js):** Just there · A fair walk · Across the house · Down the street · Somewhere else entirely
- **Chart labels:** SCALDING / JUST RIGHT / TODAY
- **Stats:** best steady spell · holding now · times scalded
- **Hints (js):**
  - Drag the dial. Try to hold the calm band.
  - Still travelling. Your last change reaches you in N s.
  - Too hot. That is the water you asked for N seconds ago.
  - Just right. Hold still. Anything you change now lands in N s.
  - Cold. Everything you have asked for has already arrived.
  - Nearly warm enough. / A bit too warm.
- **Under the slider:** Once you can hold the calm band, make the pipe longer and try again.
- **Lesson:** The system is not reacting to what you just did. It is reacting to what you did a while ago. / Every correction you make while waiting is a correction you did not need. They all arrive together, and they arrive too hot. / In the protocol: issuance does not respond instantly. It reacts on a lag, on the order of a couple of epochs after the flow that caused it. Nobody has to be greedy or stupid for this to happen. The overshoot is built into the pipe.

## Scene 12: The overhang

- **Kicker:** Scene 12 of 13 · The overhang
- **Headline:** Supply you cannot see.
- **Standfirst:** The number everyone watches counts tokens in circulation. Earned but unclaimed balances are real claims on the same supply, and they are not in that number until a Banker retires a Branch.
- **Stage labels:** COUNTED IN SUPPLY / THE NUMBER EVERYONE WATCHES / ACCRUED CLAIMS. NOT COUNTED HERE. / THEY ARE REAL, AND THEY ARE OWED.
- **Chips:** Counted in supply, of a 1 billion hard cap · Not counted, accrued, waiting
- **Card labels:** The exit window · What the pool does about it
- **Control:** Share of accrued claims that convert (A trickle → Everyone at once)
- **Exit words (js):** Nobody is leaving · A few head out · A steady stream · Most of them · Everyone at once
- **Pool depth options:** Thin · Middling · Deep
- **Hints (js):** Nothing has converted. The supply number looks small and steady. / N just became supply. No new tokens were minted. These claims already existed, in a thin / middling / deep pool.
- **Chart note:** Illustrative only. The pool is modelled as a plain constant product pool and assumes the converted claims are sold into it. The real market is a Uniswap v4 pool with a hook, and none of its parameters are public.
- **Lesson:** Nothing new is created. It was always owed. It simply was not counted. / This is not a forecast, and it is not a flaw anyone is hiding. It is the thing worth watching: how much has quietly accrued, how few hands hold it, and how deep the pool is on the day they decide to leave. / Verified: unminted balances are not counted in totalSupply, and convert into circulating supply when a Banker retires a Branch. The protocol does buy back, but slowly. The whitepaper describes buybacks as throttled to at most the smaller of 10 percent of the vault balance and 0.2 percent of pool reserves per hour, roughly no more than 5 percent of pool depth per day under launch parameters. Support that arrives at that rate cannot meet a rush in an afternoon. / Still unknown: how much has accrued, how concentrated it is, and how deep the pool will be. Those three numbers decide whether any of this matters.

## Scene 13: Where this actually stands

*Rewritten 11 September 2026 for the launch announcement. This is the only scene
whose copy has a date attached, and it now switches itself: `js/launch-date.js`
compares the reader's local date against 14 September 2026 and sets
`data-prelaunch` on the root, and both forms below live in the markup.*

**The launched form is the default.** With scripting off before launch a reader
is told to check the contract address slightly before there is one, which is
premature and harmless. The other way round, they would be told there is nothing
legitimate to mint on the day there is, which describes the real mint as a fake.
Defaults fail in the harmless direction.

- **Kicker:** Scene 13 of 13 - Where this actually stands

### Before 14 September

- **Headline:** None of this exists yet. On 14 September it does.
- **Standfirst:** Everything you have just played with describes a design, not a running system. That changes on 14 September 2026, which the team announced three days ahead. Here is the state of the real thing, as plainly as it can be put.
- **14 Sep** - Launch is announced for 14 September 2026. The date is on the front of the official site and on the whitepaper.
- **Not yet** - There is no token yet. $STANDARD has not launched. Anything trading under that name today is not it.
- **Not yet** - There is no NFT yet. No Charter has been issued to anybody. The 1,000 Founding Charters are minted at genesis, on launch day.
- **None** - No public contract addresses and no code repository yet. There is nothing deployed for anyone to read before launch day.
- **Warning box:** The official account has warned about copycat mints and impersonation. There is no token and no NFT, so there is nothing legitimate to mint today. / **Do not connect a wallet to any site claiming to sell, mint or airdrop this.** Check the official source first, every time. This page will never ask you for anything, and neither should anything else that matters.
- **As of:** Checked against public material on 11 September 2026. Everything on this page goes stale, and this scene goes stale fastest: most of it is written for the days before launch and stops being true on 14 September. If you are reading it after that, assume it has changed and check the official site.

### From 14 September

- **Headline:** It exists now.
- **Standfirst:** Everything you have just played with described a design. As of 14 September 2026 it is a running system. Here is the state of the real thing, as plainly as it can be put.
- **Launched** - Launch was 14 September 2026. Everything below this line was written before that day and has not been checked since.
- **Live** - $STANDARD has launched. There is now a real contract, which means there is now a real address to get wrong. Take it from the official site and nowhere else.
- **Live** - The Charter NFT exists. The 1,000 Founding Charters were minted at genesis. Any other collection using the name is not it.
- **Check** - Contract addresses exist now. This page deliberately does not print one, because a wrong address on a page you found by accident is exactly how people lose money. Get it from the official site.
- **Warning box:** The official account has warned about copycat mints and impersonation. A launch is when that risk is highest, not lowest: fakes are timed to land when people are expecting something real, and now there is a real thing for them to imitate. / **Verify the contract address against the official site before you connect a wallet to anything.** Not an address from a reply, a DM, a search result, an advert or this page. This page will never ask you for anything, and neither should anything else that matters.
- **As of:** Checked against public material on 11 September 2026, before launch. This scene switched itself to its launched form on 14 September, but nobody has re-checked the facts since that date. Treat all of it as stale and go to the official site.

### The same on both sides of the date

- **v0.1** - The whitepaper is at v0.1. Several parameters in it are deliberately redacted.
- **Live** - Genesis Charter eligibility checking is live on the official site, which says whitelist spots are still available.
- **Clear** - Both audits came back with no critical findings, and the team says the reports go public before launch. That is their announcement, not something anyone outside can check yet. The Uniswap Foundation funded part of the work.
- **Stated** - The team said there would be no surprise launch, and gave three days of notice.
- **Card label:** What nobody knows yet
  - The redacted parameters: the exact issuance curve, the epoch length, and the lag between a flow and its effect.
  - How much $STANDARD will accrue inside the system before anybody retires a Branch.
  - How concentrated the Charters, and therefore those accrued balances, turn out to be.
  - How deep the pool will be on the day any of it converts.
  - The final launch parameters. The whitepaper still says they will be announced closer to launch.
  - What the audit reports say in full, until they are published.
  - *Closing line:* Those last three are the ones scene 12 depends on. Without them, nobody can tell you whether the overhang matters. Anyone who says otherwise is guessing.
- **Card label:** Go to the real thing
  - This explainer is one reading of public material. For anything you intend to act on, go to the source.
  - *Link:* standardreserve.xyz

---

## Footer

Independent educational project. Not affiliated with or endorsed by The Standard Reserve, and not financial advice. Nothing here connects to a wallet or asks you for anything, and no number on this page is a protocol parameter unless it is marked as verified. Official site: standardreserve.xyz.

---

## The narrator

A single line fixed at the foot of the screen, in the same place on every scene.
No character and no face: on a portrait phone a scene that runs to two and a half
screens needs every pixel, and a portrait costs more space than it earns.

Hand written and safe to edit here, but the lines also live in `js/narrator.js`
and the two have to be changed together. There is no generator for these.

**The rule every line is written under: it may not say what the scene already
says.** Scene 11 prints "That is the water you asked for 6.0 seconds ago", so the
narrator has nothing to add while the reader is in it. The lines that earn their
place connect one scene to the next, name what the reader just did, or say what
somebody skipped.

Every line must fit one row at 412px, which is about 45 characters. Two rows is
the hard ceiling on a narrow screen.

**All fourteen sections now have lines**, written in two passes: scenes 10, 11
and 12 plus the quiz first, then 1 to 9 and 13.

### Scenes 1 to 9, the connective tissue

None of these gets an idle nudge. Each already carries an on screen hint that
points at its own control, and a second voice saying the same thing is the
restatement this whole section exists to avoid. What they get is the thread
between scenes, which is the one thing no single scene can say about itself.

Read in order at reading pace, the arrival lines are the argument in miniature:

| Scene | Arriving | If it was skipped inside seven seconds |
| --- | --- | --- |
| 1, the problem | The rest of the page is a reply to this. | Skipped: the number is set once, then never. |
| 2, one currency | That one prints forever. This one cannot. | Skipped: a ceiling that only ever falls. |
| 3, one market | One place. Everything after this follows. | none, see below |
| 4, one signal | Everything later is downstream of this needle. | Skipped: net flow in or out is the only input. |
| 5, one authority | Nothing above it can overrule that needle. | Skipped: there is no vote, and no override. |
| 6, you are the bank | You were watching. Now you hold one. | Skipped: the licence cannot leave your hands. |
| 7, Branches | You have one bank. It can become ten. | Skipped: more Branches, thinner slice each. |
| 8, the Dutch auction | Growing is not free. This is the bill. | Skipped: you pay to expand, and it is burned. |
| 9, two regimes | That burn was one licence. Here it is policy. | Skipped: money out leaves in capped steps. |

Scene 9's skim line deliberately does not say the system defends itself slowly.
Steady state throughput is the same in both directions; the asymmetry is that
money in is spent on arrival while money out pools first and leaves in capped
steps. That error was made once in the scene copy already and corrected.

### Scene 13, where this actually stands

| Trigger | Line |
| --- | --- |
| Arriving, before 14 September | Three numbers decide it. None are public. |
| Arriving, from 14 September | Three numbers decide it. You can see them now. |

This is scene 12's parting thought, moved here as recorded. It carried the same
expiry as the scene's copy: all three of those numbers become observable on
chain the moment the system is live, so "none are public" is true of a design
and false of a running protocol. It reads the same `data-prelaunch` attribute
scene 13 does, so there is one source of truth and they cannot disagree.

One caveat worth knowing: scene 13's own "What nobody knows yet" card closes on
the same idea in fuller words, and the line has no clock to fade itself on, so it
stays on the bar while the reader scrolls down to that card. Arrival only, and no
skim line, because scene 13 has no SceneLoop clock to measure dwell with.

### At most two skim lines in a session

A skim line beats the arrival line of wherever the reader went, which is right
once and wrong nine times. With every scene narrated, somebody moving briskly
trips the skim test on all of them and gets a column of "Skipped:" lines instead
of the thread, which is nagging. After two, skim is suppressed and the arrival
lines come through.

### Scene 10, the locked money

| Trigger | Line |
| --- | --- |
| Arriving | Scene 9 was money leaving. This has not. |
| Nine seconds on the scene with nothing touched, once | It accrues whether you decide or not. |
| First Branch retired | That was a decision, not a withdrawal. |
| Second and third | Twice. The rate on the left is the cost. |
| All four retired | Fully paid, permanently out. |
| Left inside seven seconds having touched nothing | Skipped: getting paid closes the Branch. |

### Scene 11, the delay

Arrival and departure only, and after the change below, arrival only. The hint
line in this scene narrates continuously already and a second voice over the top
of it is noise.

| Trigger | Line |
| --- | --- |
| Arriving | That was a choice. This one is not. |

### Scene 12, the overhang

| Trigger | Line |
| --- | --- |
| Arriving, having retired nothing in scene 10 | What scene 10 cost one Banker, now at scale. |
| Arriving, having retired a Branch in scene 10 | You closed one to get paid. Now everyone. |
| Nine seconds with the slider untouched, once | Nothing converts until somebody decides to. |
| Slider taken past 45 percent, once | Buybacks exist, at under a percent an hour. |
| Slider swept across 60 percent of its range, once | Both ends are guesses. So is the middle. |
| Left inside seven seconds having touched nothing | Skipped: the number leaves out real claims. |

### The quiz

Silent throughout, apart from these two. Nothing between questions: no reaction
to a right answer, no consolation for a wrong one. The handover line fades out
by itself after six seconds so the questions have the screen.

| Trigger | Line |
| --- | --- |
| The quiz coming into view, and again on "try three more" | Your turn. The wrong ones teach more. |
| The close card appearing | Check the source. This page included. |

### Why there are no departure lines

There were three, and they could not be seen. Leaving one scene and arriving at
the next resolve in the same observer callback, so a parting line is always
overwritten by the arrival line of wherever the reader went; and leaving the
narrated stretch has to hush the bar rather than park a line over scenes that
reserve no room for it. Skim lines survive because they fire on the way into
another narrated scene, and win precedence there.

One line was worth keeping and has nowhere to live yet: **"Three numbers decide
it. None are public."** It belongs to scene 13 as an arrival line, and should be
written there when the other ten scenes are done.

---

## The end check

Three questions after scene 13, one per tentpole, always in the order the page
taught them: the locked money, then the delay, then the overhang. Five variants
per slot, one drawn per slot per run, and the options shuffled inside each
question. That is 125 possible sets before shuffling. Nothing is stored, so a
reload draws a fresh set and the close says so.

Every explanation below asserts only things on the verified list further down
this file. Where a number belongs to a toy rather than to the protocol it is
named as illustrative.

> ### Generated. Do not edit the questions below.
>
> **`js/quiz.js` is the source. Everything between the markers is written by
> `node tools/bank-to-content.js` and is overwritten every time it runs.**
> Editing a question, an option or an explanation here changes nothing that a
> reader sees, and the change is lost on the next run. To change the bank, edit
> the `BANK` object in `js/quiz.js`, then run the script to bring this file back
> in line. Generation is one way and there is no path back.
>
> The copy above these markers is hand written and is safe to edit.

- **Kicker:** A quick check · Three questions
- **Headline:** Did any of it land?
- **Standfirst:** One question for each of the three ideas worth keeping. Getting one wrong is the useful outcome: it opens the explanation, and the scene that taught it.
- **On a wrong answer:** Replay scene 10, the locked money / Replay scene 11, the delay / Replay scene 12, the overhang
- **Buttons:** Next question · Finish · Try three more
- **Close heading:** That is the argument
- **Close:** Money you can only reach by destroying the thing that earns it. A system that answers late, so corrections pile up and arrive together. And a supply number with claims behind it that are already owed. Everything else on this page is detail.
- **Close, second line:** Nothing here was stored, so a reload draws three different questions out of fifteen.
- **Close link:** standardreserve.xyz

<!-- BEGIN GENERATED BANK -->

### Slot 1: the locked money (scene 10)

**A1.** A Branch of yours has earned a balance. How do you get it into your wallet?

- **(correct)** Retire the Branch. It pays out, and it can never be reopened.
- Withdraw the balance and leave the Branch open to keep earning.
- Wait for the lock-up to expire, then claim it.
- Sell the Branch to somebody who wants the position.

*Why:* Earned $STANDARD accrues inside the system and is claimed only by retiring a Branch, and a retired Branch cannot be reopened. There is no partial withdrawal and nothing that releases it on a timer.

**A2.** Your Charter has four Branches earning. You retire one of them. What happens to the other three?

- Nothing. Retiring a Branch retires the whole Charter.
- **(correct)** They keep earning. Only the retired Branch is gone.
- They pay out too, because the Charter has been claimed.
- They stop earning until you open a replacement Branch.

*Why:* New issuance is divided across all open Branches, so retiring one destroys that Branch and leaves the rest earning. A Charter opens with one Branch and can grow to ten.

**A3.** Bankers are earning steadily, yet circulating supply stays quiet for a long time. Why?

- There is a cap on how much can be claimed per day.
- The protocol pauses claims while the price is falling.
- **(correct)** Claiming costs you the Branch that earns, so it gets put off.
- Earnings are released gradually on a vesting schedule.

*Why:* The only way to claim is to retire the Branch permanently, so a balance can sit unclaimed indefinitely. It is a decision rather than a schedule: nothing releases it over time.

**A4.** An accrued balance that nobody has claimed yet. Is it real?

- No. It only exists once the Branch is retired and the tokens are minted.
- Yes, and it is already included in the circulating supply figure.
- Only up to whatever is left of the issuance budget.
- **(correct)** Yes. It is a real claim, it is simply not counted in supply yet.

*Why:* Those balances are real claims on the same supply, and they are not counted in totalSupply until they convert, which happens when a Banker retires a Branch. Nothing new is created at that moment.

**A5.** What does taking your earnings out cost you?

- **(correct)** The Branch itself. It is destroyed and cannot be reopened.
- A percentage of the amount you claim.
- A cooldown, after which that Branch earns again.
- Your Charter, which is surrendered with the claim.

*Why:* Retiring the Branch is what releases the balance, and a retired Branch cannot be reopened. That is the part that cannot be undone.

### Slot 2: the delay (scene 11)

**B1.** Issuance is not responding to what just happened. Why not?

- It is waiting for enough votes to confirm the change.
- **(correct)** It reacts on a lag, a couple of epochs after the flow that caused it.
- It only responds once the price has moved far enough.
- It ignores flows below a minimum size.

*Why:* Issuance reacts on a lag, on the order of a couple of epochs after the flow that caused it. There is no DAO and no governance vote anywhere in that path.

**B2.** You keep adjusting because nothing seems to be happening. What are you actually building up?

- Nothing. Each new adjustment replaces the last one.
- A penalty, because rapid changes get throttled.
- **(correct)** A queue of corrections that will all land together, and land too hard.
- A stronger response, because the system counts how insistent you are.

*Why:* Every correction made while waiting is one that was not needed, and they arrive together. The response comes a couple of epochs late, so everything done in between is still on its way.

**B3.** Who has to behave badly for the overshoot to happen?

- Large holders timing the epoch boundary.
- Bankers voting themselves higher issuance.
- Anyone willing to pay enough to move the flow.
- **(correct)** Nobody. The delay produces it on its own.

*Why:* The overshoot comes from the lag itself, not from anybody deciding it should happen. There is no DAO and no governance vote, so there is nothing to vote for, and the only input to policy is net flow of ETH into or out of the pool.

**B4.** What does the protocol actually read when it sets issuance?

- **(correct)** Net flow of ETH into or out of the pool.
- The price of $STANDARD against ETH.
- A price oracle, averaged across the epoch.
- The total value held across all open Branches.

*Why:* Net flow of ETH into or out of the one Uniswap v4 pool is the only input to policy. No price target, no oracle and no committee, and it reacts on a lag of roughly a couple of epochs.

**B5.** The delay between a flow and its effect gets longer. What happens to the overshoot?

- It shrinks. The system has longer to average things out.
- **(correct)** It gets worse, because more uncorrected corrections are in flight.
- It is unchanged. A longer delay only moves when it arrives.
- It disappears. The flow will have reversed before it lands.

*Why:* A longer lag means more adjustments get made before any of them land, and they still land together. The lag in the protocol itself is on the order of a couple of epochs; the pipe lengths in the toy above are illustrative.

### Slot 3: the overhang (scene 12)

**C1.** A lot of accrued claims convert at once. Where do those tokens come from?

- They are minted fresh, so supply ends up above what was planned.
- They come out of the genesis position locked in the pool.
- **(correct)** They already existed as claims. Nothing new is minted.
- The protocol buys them back first, then releases them.

*Why:* Those balances are real claims, just not counted in totalSupply until a Banker retires a Branch. Converting moves them into the counted number, and the hard cap of 1,000,000,000 is untouched.

**C2.** Circulating supply looks low and steady. What does that tell you on its own?

- That issuance has been conservative so far.
- That holders are confident and are not selling.
- That the buyback has been quietly absorbing supply.
- **(correct)** Very little. Large claims may exist that it does not count yet.

*Why:* Earned balances accrue inside the system and are not counted in totalSupply until they convert, so the number can be low precisely because claims are waiting outside it. How much is waiting is not something that number tells you, so it is a thing to check rather than a thing to assume.

**C3.** Could the buybacks absorb a large conversion arriving all at once?

- **(correct)** Not quickly. They are capped at a fraction of a percent of the pool per hour.
- Yes. That is exactly what the vault is for.
- Yes, if the vault is large enough on the day.
- No, because the protocol does not buy back at all.

*Why:* Buybacks are throttled to at most the smaller of 10 percent of the vault balance and 0.2 percent of pool reserves per hour, roughly no more than 5 percent of pool depth per day at launch. Support at that rate cannot meet a rush in an afternoon.

**C4.** Which three things decide whether the overhang matters at all?

- The hard cap, the burn rate and the epoch length.
- **(correct)** How much has accrued, how few hands hold it, how deep the pool is.
- The number of Charters issued and the price they went for.
- The team share, the revenue split and the resolution fee.

*Why:* Those three are what the page ends on: how much has accrued, how concentrated it is, and how deep the pool is on the day it converts. None of them is settled by the supply figure.

**C5.** Does the hard cap protect you from the overhang?

- Yes. Nothing can push supply past 1,000,000,000.
- No. Converting the claims pushes total supply above the cap.
- **(correct)** No. The claims are already inside the cap. They are just not counted yet.
- Yes. Burning has lowered the maximum below what has accrued.

*Why:* The cap of 1,000,000,000 holds, and burns only ever lower it, so conversion never breaches it. The claims sit inside that cap already. What changes is how much of it counts as circulating.

Authored position of the correct answer across the bank: 4 / 4 / 4 / 3 for positions 1, 2, 3 and 4. Options are shuffled again at run time, so this is the floor rather than what any reader sees.

<!-- END GENERATED BANK -->

---

## Which numbers are real

Everything below is stated in public material and is safe to keep. Anything not on
this list is illustrative and must stay labelled as such on screen.

- Hard cap of 1,000,000,000 $STANDARD, of which 100,000,000 is the genesis position (the only pre-mint, locked in the pool) and 900,000,000 is the issuance budget. Max supply is strictly non-increasing because burns are permanent.
- One ETH to $STANDARD pool on Uniswap v4, with a hook.
- Net flow of ETH into or out of that pool is the only input to policy.
- Roughly 4,000 lines of immutable code. No DAO and no governance votes. Not zero discretion: there is an admin-set Charter auction reserve, a policy-controlled Charter count starting at zero, a one-way transfer switch, and a 15 percent team share.
- A Charter is an **initially** soulbound NFT. Holders are Bankers. 1,000 Founding Charters are free at genesis; after that they are sold at a daily Dutch auction in ETH. A one-way switch enables transfers later.
- Every Charter opens with one Branch and can grow to a maximum of ten.
- New issuance is divided across all open Branches.
- Expansion Licences are sold at a daily Dutch auction, paid in $STANDARD, and 100 percent of what is spent is burned. Initially 100 per day, at most 3 per Charter per day, price decaying exponentially from the open to a floor over 24 hours, unsold licences do not roll over.
- Issuance reacts on a lag, on the order of a couple of epochs after the flow that caused it.
- Protocol ETH revenue is split 70 / 15 / 15 each epoch; the 70 percent goes to the active vault.
- Buybacks are throttled to at most the smaller of 10 percent of the vault balance and 0.2 percent of pool reserves per hour, described as roughly no more than 5 percent of pool depth per day under launch parameters.
- Earned $STANDARD accrues inside the system and is claimed only by retiring a Branch, which cannot be reopened. Those balances are not counted in totalSupply until they convert.
- Withdrawals are never paused or queued at any fee level. Every withdrawal pays a resolution fee that rises with 7-day system-wide exit pressure, half burned and half paid to Bankers who stayed.
- Launch is announced for 14 September 2026. Confirmed directly: the banner reads "Standard is launching on September 14th" on both the front page and the whitepaper, and the whitepaper still says final parameters will be announced closer to launch.
- Status as of 11 September 2026: no token yet, no NFT yet, whitepaper v0.1, eligibility checking live with whitelist spots still available, no public addresses or repository, no surprise launch, copycats circulating.
- Two quiz explanations used to say the overhang's three numbers were "not public". That was true of a design and false of a running protocol, so they were reworded to be true on both sides of launch rather than given date logic. Prefer rewording over dating wherever it works.
- **Sourced to the team's announcement, not independently checkable:** both audits came back with no critical findings and the reports are to be published before launch. This is the one claim on the page that rests on the team's word alone, and it is labelled that way on screen.
