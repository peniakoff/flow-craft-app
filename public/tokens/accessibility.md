Accessibility sweep checklist

1. Colors

- Ensure text contrast >= 4.5:1 for body text. (Tokens checked via `scripts/check-contrast.js`)
- Avoid relying on color alone for status/priority — always include icon + text.

2. Motion

- Respect `prefers-reduced-motion` for CTA animations and confetti.
- Confetti is non-essential and marked aria-hidden; provide a setting to disable in user prefs.

3. Focus

- All interactive elements must have visible focus rings (use `outline` or box-shadow with sufficient contrast).

4. Screen readers

- Status/priority elements expose accessible names via `aria-label` or visible text.

5. Keyboard

- Interactive items reachable via Tab and operate with Enter/Space.

6. Testing

- Include manual checks and automated contrast checks in CI.
