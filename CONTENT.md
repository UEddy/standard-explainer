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

- **Kicker:** Scene 13 of 13 · Where this actually stands
- **Headline:** None of this exists yet.
- **Standfirst:** Everything you have just played with describes a design, not a running system. Here is the state of the real thing, as plainly as it can be put.
- **Card label:** The state of play
  - **No** · There is no token. $STANDARD has not launched. Anything trading under that name today is not it.
  - **No** · There is no NFT. No Charter has been issued to anybody.
  - **v0.1** · The whitepaper is at v0.1. Several parameters in it are deliberately redacted.
  - **Live** · Genesis Charter eligibility checking is live on the official site. Allocations have gone out in batches, with one batch remaining before launch.
  - **Underway** · Audits are in progress. The Uniswap Foundation has funded part of that work. No completed audit report is public.
  - **None** · No public contract addresses and no code repository. There is nothing deployed for anyone to read.
  - **Stated** · The team has said there will be no surprise launch.
- **Card label:** What nobody knows yet
  - The redacted parameters: the exact issuance curve, the epoch length, and the lag between a flow and its effect.
  - How much $STANDARD will accrue inside the system before anybody retires a Branch.
  - How concentrated the Charters, and therefore those accrued balances, turn out to be.
  - How deep the pool will be on the day any of it converts.
  - What the audits find.
  - *Closing line:* Those last three are the ones scene 12 depends on. Without them, nobody can tell you whether the overhang matters. Anyone who says otherwise is guessing.
- **Warning box:** If you take one thing from this page. / The official account has warned about copycat mints and impersonation. There is no token and no NFT, so there is nothing legitimate to mint today. / **Do not connect a wallet to any site claiming to sell, mint or airdrop this.** Check the official source first, every time. This page will never ask you for anything, and neither should anything else that matters.
- **Card label:** Go to the real thing
  - This explainer is one reading of public material. For anything you intend to act on, go to the source.
  - *Link:* standardreserve.xyz
  - *As of:* Checked against public material in early September 2026. Everything on this page goes stale, and this scene goes stale fastest. If you are reading it later, assume it has changed and check the official site.

---

## Footer

Independent educational project. Not affiliated with or endorsed by The Standard Reserve, and not financial advice. Nothing here connects to a wallet or asks you for anything, and no number on this page is a protocol parameter unless it is marked as verified. Official site: standardreserve.xyz.

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
- Status as of early September 2026: no token, no NFT, whitepaper v0.1, eligibility checking live, audits underway with Uniswap Foundation funding, no public addresses or repository, no surprise launch, copycats circulating.
