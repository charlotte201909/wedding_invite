# Charlotte & Charles Ewart — Wedding Website

## What
Wedding invitation website. Date: **13 March 2027**. Venue: **TBD**. Sydney, Australia.

## Current State
**Phase 1 (Save the Date)** — `ewart-save-the-date.html`. Single self-contained HTML, base64-embedded images.

**Phase 2 (Full Invitation)** — Not yet built. Will add: schedule, tea ceremony (family version only), wishing well, RSVP form (Google Apps Script → Google Sheet).

## Flow
1. **Mystery screen** — Dark, cinematic. Gold frame, play button, walking cat SVGs, date teaser. No names.
2. **Reveal** — Scroll triggers staggered fade-in of names, date, venue.
3. **Photo gallery** — Auto-scrolling strip of travel photos.
4. **Save the Date** — Minimal closing message.

## Design Direction
- **Luxury editorial** meets **Chinese wedding tradition** — subtle 囍, red/gold, peonies, auspicious clouds woven in elegantly, not heavy-handed
- Fonts: Cinzel, Cormorant Garamond, DM Sans
- Palette: Gold `#C9A555`, Cream `#FDFAF3`, Warm Black `#0F0D0A`, Red `#D4364B`
- Two illustrated SVG cats (ginger + black) walk across hero — their real pets
- Mysterious first impression, fun and personable overall

## Config
```javascript
const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ'; // ← Replace
const GAS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // ← Phase 2
```

## Key Decisions
- No password-protected sections
- No hashtag
- Phase 2 needs two versions: family (with tea ceremony) vs general (without)
- Venue not confirmed — placeholder everywhere
