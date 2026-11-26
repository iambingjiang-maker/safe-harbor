# Safe Harbor — Mobile-First Parenting Companion (PWA)

A calm, mobile-first Progressive Web App inspired by attachment- and connection-based parenting principles (*Good Inside*), designed for high-stress, one-handed moments with young kids.

**Live App:** https://iambingjiang-maker.github.io/safe-harbor/

---

## Why I Built This

During a toddler meltdown, parents don't have time to search articles or remember scripts—they need calm, low-cognitive-load guidance in under three seconds, plus a lightweight way for co-parents to track what actually works over time.

Safe Harbor was designed and iterated as a real-world, AI-assisted product build: going from concept to a daily-use iPhone Home Screen app with zero monthly hosting costs and automatic co-parent cloud sync.

---

## Key Features (v1)

- **SOS In-the-Moment Mode**
  - **Parent Grounding Anchor:** Guided 4s-inhale / 6s-exhale breathing pacer paired with rotating grounding mantras.
  - **Low-Battery / Tired Mode Toggle:** Switches all 8 moment tiles in place to ultra-short, low-demand scripts while keeping full scripts and tired-friendly ranking inside every category.
  - **8 One-Tap Moment Categories:** *Flooded / Can't Hear Us*, *Testing Boundaries*, *Angry / Physical Urges*, *Escalates When We Talk*, *Overtired Crash*, *Transition Meltdown*, *Frustrated / Stuck*, and *Sharing / Waiting*.
  - **1-Tap Outcome Logging:** Record `Helped`, `Somewhat`, or `Escalated` right from any strategy card, with optional context tags and notes.
- **Shared Pattern Insights & Co-Parent Handoff**
  - Co-parent handoff card showing the latest logged moment across devices.
  - Automatic ranking of **What Works Best** (overall, per trigger, and when tired) alongside **Watch Out** flags for approaches that tend to escalate.
  - Filterable shared timeline across parents and children.
- **Multi-Child Support**
  - Supports multiple children with a 1-tap switcher in the header, per-child script personalization, per-child tagging on logs, and filtered insights per child or combined.
- **Scripts Playbook & Custom Family Scripts**
  - 20+ structured scripts (full + fewest-word variants, body/presence cues, and what to avoid mid-storm) plus custom family scripts synced across phones.
- **Per-Parent PIN Access & Offline-Capable PWA**
  - Individual 4-digit PINs per parent with trusted-device unlock for fast SOS access.
  - Installable on iOS/Android Home Screens with a network-first service worker for automatic updates and offline fallback.

---

## Architecture & Tech Stack

- **Frontend:** React + Vite, custom responsive mobile-first CSS (safe-area / iPhone Pro layout), `lucide-react` icons
- **PWA & Caching:** Web App Manifest + custom Service Worker (`public/sw.js`) with network-first HTML navigation and automatic controller-change refresh
- **Cloud Sync ($0/mo):**
  - **Google Sheets Backend:** Custom Google Apps Script Web App (`google-apps-script/Code.gs`) using `LockService` for concurrency-safe reads/writes across `Moments`, `CustomScripts`, `Favorites`, and `Profile` tabs
  - **Optional Supabase Backend:** Postgres schema with Row Level Security and Realtime subscriptions (`supabase/schema.sql`)
- **Hosting:** Static production bundle deployed to GitHub Pages (`main` → `/docs`)

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Self-Hosting & Cloud Sync Setup

1. Fork or clone this repository and enable GitHub Pages (or deploy to Vercel / Cloudflare Pages).
2. *(Optional)* To enable multi-device cloud sync via Google Sheets:
   - Create a Google Sheet with tabs `Moments`, `CustomScripts`, `Favorites`, and `Profile`.
   - Open **Extensions → Apps Script**, paste `google-apps-script/Code.gs`, and deploy as a **Web app**.
   - Paste your Web App URL in the app's **Family → Google Sheet Cloud Sync** panel (or set `VITE_SHEETS_WEBAPP_URL` at build time).
3. *(Optional)* Alternatively, run `supabase/schema.sql` in a free Supabase project and connect via **Family → Alternative: Supabase Sync**.
