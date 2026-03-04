const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// ── 1. Update bubble HTML content ──
const oldBubble = `<div class="cat-speech">
        <span class="cat-speech-main">I personally requested this 🎬</span>
        <span class="cat-speech-cta">→ click play</span>
      </div>`;
const newBubble = `<div class="cat-speech">
        <span class="cat-speech-main">a little film,<br>if you please</span>
        <span class="cat-speech-divider"></span>
        <span class="cat-speech-cta">&#9655; play the film</span>
      </div>`;

const bubbleIdx = html.indexOf(oldBubble);
if (bubbleIdx === -1) { console.log('ERROR: bubble HTML not found'); process.exit(1); }
html = html.slice(0, bubbleIdx) + newBubble + html.slice(bubbleIdx + oldBubble.length);
console.log('Step 1: updated bubble content');

// ── 2. Replace .cat-speech CSS block (from .cat-speech { to @keyframes bubble-in) ──
const cssStart = html.indexOf('.cat-speech {');
const cssEnd   = html.indexOf('@keyframes bubble-in');
if (cssStart === -1 || cssEnd === -1) { console.log('CSS markers not found'); process.exit(1); }

const newCss = `.cat-speech {
  position: absolute;
  top: 30px;
  left: 290px;
  z-index: 10;
  background: var(--cream);
  border: 1px solid rgba(201,165,85,0.3);
  border-top: 2.5px solid var(--gold);
  border-radius: 3px 16px 16px 16px;
  padding: 13px 18px 13px 16px;
  min-width: 160px;
  max-width: 200px;
  box-shadow:
    0 12px 40px rgba(0,0,0,0.45),
    0 3px 10px rgba(0,0,0,0.25);
  pointer-events: none;
  animation: bubble-in 0.6s cubic-bezier(0.34,1.56,0.64,1) 3s both,
             bubble-float 4s ease-in-out 3.7s infinite;
}
/* tail → left, toward Gingie */
.cat-speech::after {
  content: '';
  position: absolute;
  top: 18px; left: -9px;
  width: 0; height: 0;
  border-top: 8px solid transparent;
  border-bottom: 8px solid transparent;
  border-right: 10px solid var(--cream);
}
.cat-speech-main {
  display: block;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 400;
  font-size: 1.05rem;
  color: var(--warm-black);
  line-height: 1.4;
}
.cat-speech-divider {
  display: block;
  height: 1px;
  background: linear-gradient(to right, rgba(201,165,85,0.7), transparent);
  margin: 9px 0 8px;
}
.cat-speech-cta {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.62rem;
  font-weight: 500;
  color: var(--gold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
`;

html = html.slice(0, cssStart) + newCss + html.slice(cssEnd);
console.log('Step 2: replaced CSS');

// ── 3. Fix mobile overrides (768px) ──
const old768 = `.cat-speech { top: 20px; left: 205px; min-width: 150px; max-width: 180px; padding: 11px 14px 10px 12px; }`;
const new768 = `.cat-speech { top: 20px; left: 205px; min-width: 140px; max-width: 175px; padding: 10px 14px 11px 12px; }
  .cat-speech-main { font-size: 0.9rem; }`;
const idx768 = html.indexOf(old768);
if (idx768 !== -1) {
  html = html.slice(0, idx768) + new768 + html.slice(idx768 + old768.length);
  console.log('Step 3a: updated 768px override');
}

// ── 4. Fix mobile overrides (480px) ──
const old480 = `.cat-speech { top: 15px; left: 145px; min-width: 130px; max-width: 155px; padding: 9px 12px 8px 10px; border-radius: 14px; }
  .cat-speech-main { font-size: 0.7rem; }
  .cat-speech-cta { font-size: 0.62rem; }`;
const new480 = `.cat-speech { top: 15px; left: 145px; min-width: 120px; max-width: 148px; padding: 8px 11px 9px 10px; border-radius: 3px 13px 13px 13px; }
  .cat-speech-main { font-size: 0.82rem; }
  .cat-speech-cta { font-size: 0.58rem; letter-spacing: 0.1em; }`;
const idx480 = html.indexOf(old480);
if (idx480 !== -1) {
  html = html.slice(0, idx480) + new480 + html.slice(idx480 + old480.length);
  console.log('Step 4: updated 480px override');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('All done.');
