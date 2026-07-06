# The Commissioning Room — Ring Configurator (Prototype)

A bespoke jewelry configurator prototype. Every visual is generated in SVG —
no photography, no third-party 3D models, no licensing exposure.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's here

- **`components/RingCanvas.tsx`** — the ring itself. Band, stone, setting,
  and atmosphere are all layered SVG driven by the selected config, not
  static images. Metal, cut, and setting each swap in real geometry/gradient,
  not just a filter.
- **`components/AssayTicker.tsx`** + **`lib/useScrambleText.ts`** — the
  signature element. A live "certificate" readout (carat / cut / clarity /
  est. value) that scrambles into its new values on every change. The
  numbers are real consequences of the config (see `lib/ringData.ts` →
  `computeAssay`), not decoration.
- **`lib/sound.ts`** — procedural click/confirm sounds via the Web Audio
  API. No audio files to source or license.
- **`components/ControlPanel.tsx`** — metal swatches, cut chips, setting
  list, atmosphere toggle, and the commission CTA.
- **`components/LoadingScreen.tsx`** — a ~1.2s branded load-in ("assessing
  the stone") instead of a generic spinner.

## Config data

Everything about the options themselves — metals, cuts, settings,
atmospheres, and the valuation math — lives in `lib/ringData.ts`. That's the
file to edit to change what's offered or how pricing is weighted; it doesn't
touch rendering code.

## Known limits / what to do before showing this to an actual jeweler

- The ring geometry is stylized (flattened band + simple stone shapes), not
  photoreal. That's the point for a self-funded prototype — it's original,
  ownable, and needs no licensing — but it is not a substitute for a real
  client's actual catalog.
- Carat/clarity/value numbers are illustrative, not appraisals.
- No backend, no persistence, no payments — matches the original "static
  front-end only" scope. Wiring the commission CTA to an actual email/CRM
  is a separate, billable step.

## Next up

A watch configurator (case, dial, strap) can reuse `AssayTicker`,
`useScrambleText`, `sound.ts`, and `LoadingScreen` as-is — only
`RingCanvas`-equivalent geometry and `ringData`-equivalent config need to be
new.
