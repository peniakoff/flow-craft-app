Design tokens for Flow Craft

Contents:

- `design-tokens.json` — canonical tokens (colors, typography, layout)
- `tokens.css` — CSS variables exported from tokens, import in `app/globals.css` or layout
- `scripts/check-contrast.js` — simple WCAG contrast report for common token pairs

Usage:

1. Import `tokens/tokens.css` in your global stylesheet (for example in `app/globals.css`).
2. Use CSS variables for colors, spacing and typography.
3. Run `node scripts/check-contrast.js` to print a quick WCAG AA report.

Notes:

- The palette chosen aims for a neutral base with a single strong brand accent (`--brand-500`).
- Semantic chips (success/warning/error/info) are included with white text on colored backgrounds.
- If you change tokens, update both `design-tokens.json` and `tokens.css` to keep them in sync.
