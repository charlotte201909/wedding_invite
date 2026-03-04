const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ── Replace full .cat-speech CSS block ──
const oldCssStart = html.indexOf('.cat-speech {');
const oldCssEnd   = html.indexOf('@keyframes bubble-in');
if (oldCssStart === -1 || oldCssEnd === -1) {
  console.log('CSS markers not found', oldCssStart, oldCssEnd);
  process.exit(1);
}

const newCss = `.cat-speech {
  position: absolute;
  top: 30px;
  left: 290px;
  z-index: 10;
  background: rgba(255, 252, 245, 0.97);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(201,165,85,0.3);
  border-radius: 20px;
  padding: 14px 20px 12px 16px;
  min-width: 175px;
  max-width: 215px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.35),
    0 2px 8px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.6);
  pointer-events: none;
  animation: bubble-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 3s both,
             bubble-float 4s ease-in-out 3.7s infinite;
}
/* tail points LEFT toward Gingie */
.cat-speech::after {
  content: '';
  position: absolute;
  top: 20px; left: -9px;
  width: 0; height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid rgba(255,252,245,0.97);
}
.cat-speech-main {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.84rem;
  font-weight: 400;
  color: #1c1408;
  line-height: 1.5;
  letter-spacing: 0.01em;
}
.cat-speech-cta {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #9a6b10;
  margin-top: 8px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
`;

html = html.slice(0, oldCssStart) + newCss + html.slice(oldCssEnd);
console.log('Step 3: replaced CSS block');

// ── Replace mobile overrides for .cat-speech ──
// Old mobile override
const oldMobile = '.cat-speech { max-width: 120px; padding: 8px 10px; bottom: clamp(12';
const oldMobileIdx = html.indexOf(oldMobile);
if (oldMobileIdx !== -1) {
  // find end of this rule (closing brace)
  const ruleEnd = html.indexOf('}', oldMobileIdx) + 1;
  const oldMobileRule = html.slice(oldMobileIdx, ruleEnd);
  // Replace with new mobile rule for 768px (left: 205px = right of 200px cat)
  const newMobile768 = `.cat-speech { top: 20px; left: 205px; min-width: 150px; max-width: 180px; padding: 11px 14px 10px 12px; }`;
  html = html.slice(0, oldMobileIdx) + newMobile768 + html.slice(ruleEnd);
  console.log('Step 4a: replaced 768px mobile override');
} else {
  console.log('Step 4a: old mobile override not found — skipping');
}

// Also fix 480px breakpoint if it has cat-speech
const oldMobile2Idx = html.indexOf('.cat-speech-main, .cat-speech-cta { font-size: 0.65rem; }');
if (oldMobile2Idx !== -1) {
  const end2 = oldMobile2Idx + '.cat-speech-main, .cat-speech-cta { font-size: 0.65rem; }'.length;
  html = html.slice(0, oldMobile2Idx) +
    '.cat-speech { top: 15px; left: 145px; min-width: 130px; max-width: 155px; padding: 9px 12px 8px 10px; border-radius: 14px; }\n  .cat-speech-main { font-size: 0.7rem; }\n  .cat-speech-cta { font-size: 0.62rem; }' +
    html.slice(end2);
  console.log('Step 4b: replaced 480px override');
} else {
  console.log('Step 4b: 480px override not found — skipping');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done. All steps complete.');
