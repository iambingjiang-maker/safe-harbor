# Sturdy — Good Inside Family Companion (PWA)

A calm, mobile-first Progressive Web App inspired by Dr. Becky Kennedy's *Good Inside* book and podcast, tailored for parents of a 4-year-old who tests boundaries, melts down harder when overtired, and sometimes becomes so flooded/angry he cannot hear words.

## What's Inside (v1)

- **SOS In-the-Moment Mode**:
  - **Parent Grounding Anchor**: 4s-inhale / 6s-exhale guided breathing pacer + rotating *Good Inside* mantras.
  - **"He's tired / low battery" toggle**: Automatically prioritizes lower-demand, fewer-word strategies.
  - **8 One-Tap Moment Tiles**: *Flooded / Can't Hear Us*, *Testing Boundaries*, *Angry / Physical Urges*, *Escalates When We Talk (DFK mode)*, *Overtired Crash*, *Transition Meltdown*, *Frustrated / Stuck*, and *Sharing / Waiting*.
  - **Fewest Words vs. Full Script toggle** on strategy cards, personalized live with your child's name.
  - **1-Tap Logging** (`Helped` / `Somewhat` / `Escalated`) right on every strategy card.
- **Shared Log & Pattern Insights**:
  - Co-parent handoff card showing the latest logged moment.
  - Automatic ranking of **What Works Best** (overall, per trigger, and specifically when overtired) + **Watch Out** flags for strategies that tend to escalate.
  - Filterable shared timeline across both parents.
- **Scripts & Playbook**:
  - 20+ clinically grounded *Good Inside* strategies + 6 Core Pillars quick refresher.
  - Add custom family scripts that sync between both phones.
- **Shared Family PIN & Editable Names**:
  - Default PIN `1234` (customizable in **Family** settings), with a *"Keep this phone unlocked"* option so neither parent is ever blocked mid-meltdown.

---

## 5-Minute Setup for Both Parents' Phones (Vercel + Supabase Free Tier)

### Step 1: Create a free Supabase project
1. Go to [supabase.com](https://supabase.com) and create a new free project.
2. Open **SQL Editor → New Query**, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Go to **Project Settings → API** and copy:
   - **Project URL** (`VITE_SUPABASE_URL`)
   - **Publishable / anon key** (`VITE_SUPABASE_ANON_KEY`)

### Step 2: Deploy to Vercel (Free)
1. Push this folder (`good-inside-family`) to a private GitHub repo (or run `npx vercel` inside the folder).
2. In Vercel → **Project Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy! (Or skip environment variables and paste them directly inside the app's **Family → Co-Parent Cloud Sync** section.)

### Step 3: Install on Both Phones
1. Open your Vercel URL on **Mom's phone** and **Dad's phone**.
2. **iPhone (Safari)**: Tap **Share → Add to Home Screen**.
3. **Android (Chrome)**: Tap **Menu (⋮) → Install app / Add to Home Screen**.
4. In the app's **Family** tab, make sure both phones use the exact same **Shared Family Code** and **4-Digit PIN**, and select your own parent name (`Mom` / `Dad`) at the top!

---

## Local Development

```bash
npm install
npm run dev
```

To build for production:

```bash
npm run build
```
