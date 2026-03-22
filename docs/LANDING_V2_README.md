# CYB Landing V2 — Deployment

## Files in this folder

### Canonical (active)

| File | Purpose |
|------|---------|
| `index.html` | Landing page (standalone, all CSS/JS inline) |
| `CYB_Chestionar_Unified.html` | Unified questionnaire (MINI + COMPLET, single page) |
| `CYB_Copy.js` | Unified copy/text for both MINI and COMPLET |
| `CYB_Steps.js` | Unified steps/wiring layer (MINI + COMPLET) |
| `CYB_Calc.js` | Shared math functions (BMI, BMR, TDEE) |
| `CYB_Engine_STABLE.js` | Signal interpreter, route resolver, message engine, scoring, safety tags |

### Legacy (retired, kept for rollback)

| File | Status |
|------|--------|
| `CYB_Chestionar_MINI.html` | Replaced by `CYB_Chestionar_Unified.html` |
| `CYB_Chestionar_COMPLET.html` | Replaced by `CYB_Chestionar_Unified.html` |
| `CYB_Copy_MINI.js` | Merged into `CYB_Copy.js` |
| `CYB_Copy_COMPLET.js` | Merged into `CYB_Copy.js` |
| `CYB_Steps_MINI.js` | Merged into `CYB_Steps.js` |

## How to deploy

### Option A: Into existing Next.js project (recommended)

Copy the canonical files into your project's `public/` directory:

```
your-project/
├── public/
│   ├── landing-v2/        ← paste here
│   │   ├── index.html
│   │   ├── CYB_Chestionar_Unified.html
│   │   ├── CYB_Copy.js
│   │   ├── CYB_Steps.js
│   │   ├── CYB_Calc.js
│   │   └── CYB_Engine_STABLE.js
│   └── ... (other public files)
├── src/
├── package.json
└── ...
```

Then push to GitHub → Vercel auto-deploys.

**Result:** `https://changeyourbody.ro/landing-v2` serves the landing page.

### Option B: Standalone (no Next.js)

Just open `index.html` in a browser. Everything is self-contained.

## Rollback

To revert to the old two-page questionnaire flow:

1. In `index.html`, change iframe `src="CYB_Chestionar_Unified.html"` back to `src="CYB_Chestionar_MINI.html"`
2. Legacy files are still present in the directory

Git tag `v1-live-stable` contains the full pre-merge state.

## Notes

- `index.html` is 100% standalone — all CSS and JS are inline
- The unified questionnaire replaces the old MINI + COMPLET two-page flow with a single-page experience
- The `#mini-flow` anchor in the landing page embeds `CYB_Chestionar_Unified.html` via iframe
- No modifications to the existing live root page `/` are needed
