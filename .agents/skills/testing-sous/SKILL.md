---
name: testing-sous
description: How to run and end-to-end test the "Sous" Next.js 16 recipe app locally — keyed dev server, keyless server for the missing-API-key path, Gemini quota limits and how to keep testing photo/UI behavior without the model, form/chip interaction quirks, dish-photo checks, and EN/RU localization + custom-cuisine (localStorage) testing.
---

# Testing Sous (Next.js 16 / React 19 / Tailwind v4 recipe app)

Single page (`src/components/RecipeForm.tsx`) → `POST /api/recipe`
(`src/app/api/recipe/route.ts`) → Gemini (`src/lib/gemini.ts`, strict `responseSchema`) →
optional dish photos (`src/lib/photos.ts`) → `src/components/RecipeCard.tsx` +
`src/components/DishPhotos.tsx`.

## Devin secrets needed

- `GEMINI_API_KEY` — required for any real generation. Free tier has a **daily** cap
  (~20 `generate_content` requests/day for `gemini-2.5-flash`). Budget your scenarios:
  each UI submit burns one request. When exhausted, `/api/recipe` returns 502 with
  `RESOURCE_EXHAUSTED / GenerateRequestsPerDayPerProjectPerModel-FreeTier` and there is
  no workaround but waiting for the daily reset or a key with quota.

## Server startup

Keyed server (main test target):

```bash
cd /home/ubuntu/repos/cooking && GEMINI_API_KEY=$GEMINI_API_KEY npx next dev   # :3000
```

Keyless server for the "missing GEMINI_API_KEY" 500 message. Next 16 refuses a second
`next dev` for the *same directory*, so use a copy — and it must live on the **same
filesystem** as the repo (`/tmp` fails: cross-device `cp -al`, and Turbopack rejects
symlinks "pointing out of the filesystem root"):

```bash
mkdir -p /home/ubuntu/cooking-nokey && cd /home/ubuntu/repos/cooking
cp -r src public *.json *.ts *.mjs /home/ubuntu/cooking-nokey/
cp -al node_modules /home/ubuntu/cooking-nokey/node_modules      # hardlinked, instant
cd /home/ubuntu/cooking-nokey && env -u GEMINI_API_KEY npx next dev -p 3001
```

Re-copy `src/` into the keyless dir whenever the branch changes — it goes stale silently.
Start dev servers in a **persistent/background shell**; `setsid nohup ... &` launched from a
one-shot shell gets killed when the shell exits (log ends abruptly with `[?25h`).

## Timing

Generation takes **~20–45 s** per submit. Wait in one long block (e.g. 35 s + 10 s) before
screenshotting, otherwise you screenshot the loading state. First page load after server
start can show "Internal Server Error" until Turbopack finishes — just reload.

## Form interaction gotchas

- The page reflows as chips/cards are added, so **re-screenshot before every click**;
  coordinates from an earlier screenshot are frequently stale (easy to hit the wrong cuisine
  chip or the time slider instead of a preset).
- Ingredient chips: typing `foo,` or `foo` + Enter both commit a chip; blur commits a pending
  value; duplicates dedupe; clicking a chip's `×` removes it.
- To test a *pending* trailing-comma value (`tomato,`) without the comma keydown handler
  firing, **paste** it: select the text elsewhere on the page and middle-click paste into the
  input (`xclip`/`xsel` are not installed). Note `onBlur` commits the pending value before a
  submit click lands, so the submit-path branch is only indirectly observable.
- Submitting with an empty cuisine must show `Tell me a cuisine first (e.g. Georgian, Thai,
  Sicilian).`; an error also clears any previously rendered card.
- API field names differ from the UI labels: `timeMinutes`, `allowExtraIngredients`
  (useful if you ever POST directly with curl).

## Dish photos

- Photos come from Wikimedia Commons + Openverse using the model's `photoQuery`. Search
  recall is the fragile part: multi-word queries often return **zero** results
  (`"vegan pad thai noodles"` → 0, `"vegan pad thai"` → 3). So a run with no photo is not
  automatically a rendering bug — verify by querying the same endpoints directly before
  filing a defect:

  ```bash
  curl -s "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]+" filetype:bitmap"))' 'pad thai')&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1200&format=json" | head -c 300
  ```

- No-photo case: the card must render with the header first — no empty amber box, no
  broken-image icon. You can force it by mapping `commons.wikimedia.org`,
  `upload.wikimedia.org`, `api.openverse.org` to `127.0.0.1` in `/etc/hosts` (restore after).
- Checks worth making when photos do appear: 16:9 hero above the title with real pixels;
  caption `Photo of a similar dish · <source> · <credit> · <license>`; clicking thumbnail *n*
  shows exactly that photo and moves the dark ring; source link opens the matching Commons
  file page; license link opens the CC deed; generating a second recipe resets the gallery to
  the new dish's first photo.

## Testing photo/card UI when Gemini quota is gone

Stub **only** the model call in the scratch copy (never the repo) so the real `photos.ts`,
`route.ts` and components still run:

```bash
# /home/ubuntu/cooking-nokey/src/lib/gemini.ts, top of generateRecipe():
#   if (process.env.SOUS_STUB === "1") return stubRecipe(req);
# plus a src/lib/stub-recipe.ts returning a Recipe with a short photoQuery ("pad thai")
cd /home/ubuntu/cooking-nokey && SOUS_STUB=1 env -u GEMINI_API_KEY npx next dev -p 3001
```

Vary the stub by `req.cuisine` to get two different dishes — that is enough to test the
gallery reset between recipes. Label such evidence clearly as "model call stubbed".

## Localization (EN/RU) and custom cuisines

- State lives in `localStorage`: `sous.lang` (`en`/`ru`, defaults to `en` when absent) and
  `sous.customCuisines` (JSON array). Both are read through `src/lib/storage.ts`
  (`useSyncExternalStore` + a custom change event), so a plain reload is enough to test
  persistence. Clearing them resets the app to defaults.
- The toggle is the small `EN | RU` pair at the top center of the page.
- Built-in cuisine chips display localized labels but store **English values**
  (`Georgian`, `Russian`, …). Consequences to check: the free-text field keeps showing the
  English value in RU mode, and typing a Russian label (e.g. `Русская`) is NOT recognized as a
  built-in, so it can be saved as a duplicate-looking custom chip.
- Custom cuisine rules to exercise: `+ Add` / Enter saves, dedupe is case-insensitive against
  built-in English values and existing customs, the input has `maxLength` 60, and storage keeps
  only the last 20 entries (older ones are silently evicted). Note the input is **not cleared**
  after saving, so a batch of Enter-separated additions concatenates into one growing string —
  clear the field between additions when generating many test chips.
- Error text is stored as a string when the request fails, so toggling the language afterwards
  leaves the old-language banner on screen; re-submit to see the localized copy.

## Typing Cyrillic / non-ASCII text

The computer-use `type` action silently drops non-ASCII characters (the field ends up empty).
Workaround: focus the field with a click, then type from the shell —
`DISPLAY=:0 xdotool type --clearmodifiers --delay 70 'Абхазская'` (press `Escape` first to
dismiss Chrome's autofill dropdown). `xclip`/`xsel` are not installed.

## Verifying DOM attributes (e.g. `document.documentElement.lang`)

The `browser_console` / CDP tool can stay attached to a stale target (returns values for
`chrome://new-tab-page`, e.g. `localStorage` `null`). If results look impossible, don't trust
them — read the attribute from the DevTools **Elements** panel (F12) instead; it is also more
convincing on the recording.

## Responsive checks

The native Chrome window will not go narrower than ~532 px; use **Chrome device emulation**
(F12 then `ctrl+shift+m`, width 390) for the mobile pass. Expect single column, 16:9 hero
scaled to width, thumbnails on one unclipped row, 2-column stat grid, wrapping caption, no
horizontal scrollbar.

## Housekeeping

`next dev` rewrites `AGENTS.md` / `CLAUDE.md`, so they may show up as uncommitted changes —
that is expected, not your edit. Never commit `GEMINI_API_KEY`.
