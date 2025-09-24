#!/usr/bin/env node
/*
  Simple WCAG contrast checker for token pairs.
  Usage: node scripts/check-contrast.js
*/

const tokens = require('../tokens/design-tokens.json');

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function lum(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map(v => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrast(hex1, hex2) {
  const l1 = lum(hex1);
  const l2 = lum(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return +( (lighter + 0.05) / (darker + 0.05) ).toFixed(2);
}

function checkPair(fg, bg, size='normal'){
  const ratio = contrast(fg, bg);
  const aa = size === 'large' ? ratio >= 3.0 : ratio >= 4.5;
  const aaPlus = size === 'large' ? ratio >= 4.5 : ratio >= 7.0;
  return { ratio, AA: aa, AAP: aaPlus };
}

function runChecks() {
  const results = [];

  const brand = tokens.colors.brand['500'];
  const neutral900 = tokens.colors.neutral['900'];
  const neutral0 = tokens.colors.neutral['0'];
  const neutral500 = tokens.colors.neutral['500'];
  // resolve muted from usage if present
  let mutedToken = neutral500;
  if (tokens.usage && tokens.usage.muted) {
    const path = tokens.usage.muted.split('.');
    let v = tokens;
    for (const p of path) { if (v && p in v) v = v[p]; else v = null; }
    if (typeof v === 'string' && v.startsWith('#')) mutedToken = v;
    else if (typeof v === 'string' && v.includes('#')) mutedToken = v;
    else if (v && typeof v === 'object') {
      // if someone used a ref like colors.neutral.700, try to resolve to a hex
      const last = path[path.length-1];
      if (tokens.colors && tokens.colors.neutral && tokens.colors.neutral[last]) mutedToken = tokens.colors.neutral[last];
    }
  }

  // Primary UI pairs
  results.push({ name: 'accent on light bg', fg: brand, bg: neutral0, ...checkPair(brand, neutral0) });
  results.push({ name: 'accent on neutral-100', fg: brand, bg: tokens.colors.neutral['100'], ...checkPair(brand, tokens.colors.neutral['100']) });
  results.push({ name: 'text on default bg', fg: neutral900, bg: neutral0, ...checkPair(neutral900, neutral0) });
  results.push({ name: 'muted text on default bg', fg: mutedToken, bg: neutral0, ...checkPair(mutedToken, neutral0) });

  // Chips: text over chip bg
  const sem = tokens.colors.semantic;
  Object.keys(sem).forEach(k => {
    results.push({ name: `chip ${k}`, fg: sem[k].text, bg: sem[k].bg, ...checkPair(sem[k].text, sem[k].bg) });
  });

  // Brand over dark bg
  results.push({ name: 'accent on dark bg', fg: brand, bg: neutral900, ...checkPair(brand, neutral900) });

  console.log('\nWCAG AA contrast report (pass AA for normal text = ratio >= 4.5, large text = >=3.0):\n');
  results.forEach(r => {
    console.log(`- ${r.name}: fg=${r.fg} bg=${r.bg} => ratio=${r.ratio} | AA=${r.AA ? 'PASS' : 'FAIL'} | AAP=${r.AAP ? 'PASS' : 'FAIL'}`);
  });
  console.log('\nNote: large text threshold = 3.0. For UI components/graphics different rules may apply.');
}

runChecks();
