# Quality Inn & Suites Downtown, Green Bay: redesign concept v2

A pitch prototype for qualityinngreenbaywi.com: a static site with no build step and no framework. Booking hands off to the hotel's live Choice Hotels page.

Competitor research for the pitch: [Green Bay Hotel Competitor Research](https://claude.ai/artifact/VYYWQwoGnDEWJ9iLcTfNnd)

## Pages

| File | What it is |
|---|---|
| `index.html` | Homepage, eleven sections, each with its own layout (listed below) |
| `rooms.html` | Rooms and suites: King, Double Beds, Suites, Accessible, plus "in every room" and stay details |
| `privacy.html`, `accessibility.html` | The hotel's privacy policy and accessibility statement, word for word from the current site, in the new design |
| `404.html` | Styled not-found page (Vercel serves it automatically at any missing address, so its links and files start from the site root) |
| `sitemap.xml`, `robots.txt` | For search engines, on the final domain |
| `vercel.json` | Clean addresses (`/rooms`), security headers, caching, and `noindex` on any `*.vercel.app` preview address |
| `assets/css/site.css` | Design system: light and dark tokens in `:root` and `[data-theme="dark"]`, then the components |
| `assets/js/site.js` | All interactions in plain JavaScript |

`rooms.html`, `privacy.html`, `accessibility.html` and `404.html` reuse the homepage header, footer, icon sprite, loader, chat and booking hand-off. If you change any of those, change every page.

## Homepage sections

1. **Hero:** a large photo slideshow in a rounded card just below the navigation. A deep scrim keeps the headline readable. Hover or tap "downtown", "Green Bay", "hotel" or "pool" to change the photo (the matching word gets a gold underline); phones can swipe. Three fact chips, a rating pill, thin gold slide lines, and a booking bar with one-tap Tonight, This weekend and Next weekend buttons. The hero photos have sharpened 1920 px versions for large and high-density screens, and no zoom that would soften them.
2. **Proof strip:** rating, check-in time, banquet capacity and 24-hour desk in large light numerals, with counters that run once.
3. **Book with confidence:** the heading and the 24-hour phone number beside a journey card, "How your booking travels": three stops (no card details on this site, an encrypted HTTPS connection, official booking on choicehotels.com) joined by a gold route line that draws itself in, a light that travels along it, and a slowly turning "Secure HTTPS · Encrypted" seal on the middle stop. The card ends with "Your data, your choice" and a Cookie settings button. On phones the journey runs down the page.
4. **The stay:** fits in one screen. Four steps on the left advance on their own (a gold line fills on the active step) and one photo stage on the right cross-fades to match; hover, tap or use the arrow keys to choose.
5. **Rooms:** expanding panels that open on hover or tap, with "best for" tags.
6. **Amenities:** photo bento grid plus the full amenity list.
7. **Inside the atrium:** the pool photo with five numbered hotspots (pool, whirlpool, skylight, atrium-view rooms, poolside seating) and a synced list.
8. **Game day:** Lambeau Field at night, with the story on the left and a frosted-glass "Plan a game weekend" card on the right (Friday, Game day and Sunday tabs) ending in a gold "Find game-weekend dates" button.
9. **Around Green Bay:** draggable postcard carousel of real local photos, plus nearby places and a map.
10. **Events:** one framed photo and an editorial index (receptions, meetings, kids pool parties, extended stays); hovering or tapping a row swaps the photo.
11. **Gallery:** filterable grid and lightbox, introduced by a slow ticker of what is included.
12. **FAQ:** rating card, a designed "What guests say" card (approved reviews go here), the accordion and the "Still have a question?" form.
13. **Closing booking card:** a full photo card with "Check in from 3 PM. Breakfast is on us.", a gold "Check rates" button, the phone number and a row of facts.

## Experience features

- **Light and dark themes:** toggle in the header, remembered per visitor. The new theme opens as a circle from the toggle over the real page (not a flat color), while the sun and moon icon turns over. The page is restyled once behind a still frame before the circle starts, so the reveal itself stays smooth; browsers without View Transitions, and visitors who prefer reduced motion, get an instant switch. Light is the default. Add `?theme=dark` to any URL to open in dark mode for a demo.
- **Navigation:** at the top of every page an open bar with no box: the logo, the section links in the middle, the phone number as a white pill, the theme switch and a dark "Book now" pill (ivory in dark mode) that sweeps to green on hover. Once the page scrolls it shrinks into a floating frosted-glass pill.
- **Arrival loader:** on a charcoal screen the gold Q appears in a soft glow, "Quality Inn & Suites" rises word by word, "Downtown · Green Bay" follows in gold and a fine gold line fills; then the whole panel lifts away with a curved lower edge as the page rises in. About 2.3 seconds, once per session, skipped for visitors who prefer reduced motion.
- **Stay prompt:** a quiet dark card after 11 seconds with a fine gold hairline frame: the gold Q, "When are you coming to Green Bay?", two facts, one-tap Tonight, This weekend and Next weekend buttons, and a gold button that reads "See rates" with the chosen dates and goes straight to live rates (or opens the booking panel when no dates are picked). It shows once per session, never on top of an open calendar, chat, menu, form or chat message, and never for visitors who already chose dates.
- **3D photo tilt:** amenity tiles and area postcards tilt toward the pointer with a soft light glare (mouse only).
- **Book a room button and booking panel:** a floating "Book a room" button centered at the bottom of the screen (desktop; it appears after the hero and steps aside at the footer) and every booking link without dates open a side panel with Stay and Event tabs, an inline calendar, guests and "Check rates". It shares dates and guests with the hero form. On phones, the bottom bar's "Check rates" opens the same panel.
- **Cookie consent:** "Accept all", "Necessary only" and "Preferences" (analytics and marketing switches). The choice is remembered on the device and can be changed from "Cookie settings" in the footer.
- **Newsletter:** a signup band at the top of the footer, and a one-time card that appears only after 30 seconds and a deep scroll (or when the pointer leaves the page on desktop). It never stacks with another pop-up. Both forms are demos until connected to an email provider.
- **Rotating stickers:** round gold text badges on the closing card ("Free hot breakfast · Every morning") and the events photo ("Up to 240 guests · Banquet hall").
- **Back to top:** a frosted button whose gold ring fills as you scroll down the page, centered above the chat button with a 12 px gap. It appears once you are one and a half screens down, however you got there (scrolling, a menu link, the End key or a reload).
- **Photo reveals:** amenity tiles, gallery photos and postcards open with a soft mask as they scroll in.
- **Hand-off to Choice Hotels:** a quick, neutral screen (ivory in light mode, charcoal in dark) for under a second: the gold Q, "Opening live rates", the dates, a fine gold progress line and "Secure connection to choicehotels.com". Cancel or Esc stays on the page. The connection to choicehotels.com is warmed up as soon as someone touches the booking widget, and the page resets properly after the Back button.
- **Front desk chat (bottom right):** answers from a fixed list of verified hotel facts (check-in, breakfast, pool, pets, parking, rooms, booking, game day, events), with quick-question chips. It opens beside the launcher so the back-to-top button stays visible, and goes full screen on phones. It is scripted, not a live agent; unknown questions point to the phone number. On desktop the chat button sits on the same line as the Book a room button, the same distance from the right and bottom edges; on phones it is a 60 px circle centered on the bottom bar.
- **Chat message:** 10 seconds into a visit, a short note from the front desk appears beside the chat button (typing dots first, then "Hi there. Planning a stay? Ask me about check-in, breakfast, parking or the pool." with three quick questions). It waits until the chat button is on screen, so it never covers the booking bar; it waits while any pop-up, panel or cookie banner is open and for 4 seconds after it closes; the stay prompt waits for it in turn. It tucks itself away after about 12 seconds (longer while the pointer or focus is on it), on phones as soon as the visitor scrolls a screen further, and shows once per visit.
- **Packers home games in the date pickers:** home game days at Lambeau Field carry a small gold dot (with "Packers vs Vikings" on hover and for screen readers) and a legend, in the hero calendar, the rooms page calendar and the booking panel. A "Home game" quick pick selects the night before to the morning after the next home game, and the game day section's "Find game-weekend dates" opens the booking panel on that weekend. Dates come from the official schedule on packers.com, checked 12 Nov 2026; the week 18 game against the Lions has no date yet. Add next season's dates to `HOME_GAMES` in `site.js` when the NFL publishes them in May.
- **Welcome back:** dates a visitor picks are kept on their device for up to 60 days (browser storage only, never sent anywhere). On their next visit the booking bar is already filled in and says "Welcome back. We kept your dates" with a Clear button. Past dates are dropped automatically.
- **Room finder:** under the room panels and at the top of the rooms page, "Not sure which room fits?" opens three quick questions (who's coming, how many nights, a pet or an accessible room) and recommends one room with its photo, the reasons, any notes (pet policy, group bookings, accessible rooms are booked by phone) and "Check rates" or "Call to book". All wording comes from facts already on the site.
- **Gallery on phones and tablets:** the first six photos, then "Show all 18 photos". Filters still show every matching photo, and the photo viewer can page through all 18.
- **Hover detail throughout:** buttons, spotlight cards, a "View" or "Drag" cursor on photos, social icons that fill with brand colors, tooltips on icon-only buttons.

## Design system

- **Luxury moments:** the loader, hand-off, stay prompt and closing photo card are full-screen moments or photo cards, so they stay dark in both themes: deep green-black, gold hairlines (`--gold: #D8B26E`, used only on dark surfaces), light-weight large type and few words.
- **Footer:** follows the theme: warm cream with deep gold headings in light mode, deep green-black in dark mode. "Green Bay" fills with flowing water (two wave layers drift in opposite directions, the level rises when it scrolls into view and then bobs gently). It only animates while on screen and is static for reduced motion. It is kept short: the newsletter, then brand and socials, Visit, Explore and Policies columns, the wordmark and one legal line.
- **Breadcrumbs:** on the rooms and 404 pages (the homepage is the top level), with BreadcrumbList structured data on the rooms page.

- **Type:** Plus Jakarta Sans, one self-hosted 27 KB variable font, with a size-matched fallback so the font swap causes no layout shift.
- **Color:** neutrals plus the Quality green (`#007054` light, `#3DBA92` dark). Gold (`#E2A13A`) is used only for rating stars; the Q logo keeps its own colors.

## Run and deploy

- **Local:** run `npx serve .` in this folder. Use a server rather than opening the file directly: the map, page transitions and theme reveal need `http://`.
- **Vercel:** Framework Other, no build command, the root as the output directory. `.vercelignore` keeps `README.md` and `_handoff/` off the live preview.

## Before this goes live

Done on 12 Nov 2026: search engines may index every page except the 404 page, canonical tags and absolute share images are in place, `sitemap.xml`, `robots.txt` and `vercel.json` are added, and analytics is connected (see Measurement).

1. Point the domain at Vercel. The canonical tags, sitemap and share images all use `https://www.qualityinngreenbaywi.com`; change them if the final address differs.
2. In Google Search Console, submit `https://www.qualityinngreenbaywi.com/sitemap.xml`.
3. Connect the forms. The event enquiry and "Still have a question?" forms are demo only; the live site already posts its banquet form to `contactsendmail.asp`.
4. In GA4, mark the `handoff` event as a key event (it fires when a visitor is sent to live rates on choicehotels.com).
5. Replace the header logo with Choice Hotels' official horizontal lockup. The current one rearranges the official mark and wordmark from the live site's SVG.
6. Re-check the Google rating ("4.0 from 758 reviews", read on 10 Nov 2026).
7. Connect both newsletter forms to the hotel's email provider, or remove them.
8. Decide on the chat: keep it scripted with the client's real answers, or connect a live chat service.

## Measurement

- `site.js` loads GA4 `G-GPC6Z25GBE` and Google Ads `AW-16462876178` (the hotel's IDs from the current live site) only after a visitor agrees in the cookie banner, with Google Consent Mode set to their choice: GA4 with the analytics switch, Google Ads with the marketing switch. "Necessary only" loads nothing.
- Tags load only on `qualityinngreenbaywi.com`, so Vercel previews and local copies never send data.
- To add heatmaps and session recordings, create a free Microsoft Clarity project and put its id in `TAGS.clarity` at the top of `site.js`.
- Events already reported: `handoff` (the conversion), `book_click`, `booking_quick_pick`, `finder_open`, `finder_result`, `chat_open`, `chat_answer`, `chat_nudge`, `gallery_filter`, `gallery_more`, `promo_open`, `promo_rates`, `theme_toggle`, `consent`, `welcome_clear` and the phone and directions taps.

## Speed

- The hero photo is visible from the very first frame (it only rises into place), so it counts as the page's main image straight away.
- Sections below the first screen use `content-visibility: auto`: the browser lays them out and paints them only as they come near. Before any jump to a section (menu links, "Room details", an address ending in `#faq`) the whole page is laid out once, so jumps land exactly.
- Start-up code no longer forces extra layouts.
- Lighthouse mobile on the homepage, 12 Nov 2026: performance 84 to 90 (was 59 to 63 that morning), total blocking time 250 to 400 ms (was 1,300 to 2,000 ms), layout shift 0, accessibility 100, best practices 100, SEO 100. Scores vary between runs on the same machine.

## Booking link

The format was confirmed from the live site's own `reservation.asp` redirect:

```
https://www.choicehotels.com/wisconsin/green-bay/quality-inn-hotels/wi111/rates?checkInDate=YYYY-MM-DD&checkOutDate=YYYY-MM-DD&adults=2&rooms=1&minors=0
```

## Client must supply

Every placeholder is marked with `data-placeholder` in the HTML.

- Breakfast serving hours, pool hours
- Pet fee and limits, any parking fee
- Three recent Google reviews approved for quoting
- Banquet hall square footage, setups, catering and a floor plan
- Any book-direct perks
- Double Beds bed type, and which suites have a kitchenette
- Optional: a 10 to 15 second clip of the atrium pool, and 360 photos

## Photo credits

The hotel photos are the hotel's own, from its current site. Area photos come from Wikimedia Commons under Creative Commons licenses, and are credited on each card and in the footer's "Photo credits":

| Photo | Author | License |
|---|---|---|
| Lambeau Field | Tony Webster | CC BY 2.0 |
| Lambeau Field at night | MisawaSakura | CC BY-SA 4.0 |
| CityDeck along the Fox River | Chris Rand | CC BY-SA 4.0 |
| Packers Hall of Fame rotunda | Gonzo fan2007 | CC BY-SA 4.0 |
| Titletown Park | Gonzo fan2007 | CC BY-SA 4.0 |
| Big Boy 4017, National Railroad Museum | LoganWink311 | CC BY 4.0 |
| Neville Public Museum | Michael Barera | CC BY-SA 4.0 |
| Zippin Pippin, Bay Beach | Chris Rand | CC BY-SA 3.0 |

## QA (11 Nov 2026)

**Tested and passing:**

- No horizontal scroll or clipped buttons on any page at 320, 360, 390, 414, 600, 768, 820, 1024, 1280, 1440 and 1920 px.
- Color contrast (axe) passes in light and dark on every page.
- No console errors, and one H1 per page.
- Mobile and responsive audit (11 Nov 2026): 3 pages on 10 devices (320 to 430 px phones, landscape phone, iPad mini, iPad Air, iPad landscape). No sideways scroll, no tap target under 24 px, no clipped text, no input that makes iPhones zoom, no overlapping fixed buttons, no script errors. 46 touch flows pass (menu, calendar and guests sheets, hand-off, booking panel, cookie card, chat, gallery and lightbox, atrium, events, FAQ, forms, pop-up, dark mode, rooms page, 404).
- On phones and short screens the header slides away while scrolling down and returns on the way up.
- Lighthouse mobile (simulated slow phone): accessibility 100 and best practices 100 on both pages; performance 69 to 81 on the homepage (the first-visit loader and hero entrance set the 3.4 s main paint) and 94 on the rooms page. SEO reads 63 only because of the deliberate noindex tag.
- Scripted end-to-end checks:
  - booking dates, guests and the hand-off URL;
  - hero slides, story steps, room panels and postcards;
  - gallery filter and lightbox;
  - both forms (validation and success);
  - chat answers;
  - theme switch on every page, with mouse, keyboard and touch (the circle starts about 0.1 to 0.25 s after the click on a laptop, usually with 0 to 3 dropped frames during the reveal);
  - atrium hotspots and the stay prompt;
  - mobile menu, calendar sheet and chat.

**Lighthouse** (local, with gzip as Vercel serves it):

- Accessibility 100, best practices 100 on home and rooms.
- SEO 63 at the time, only because of the preview `noindex`; it is 100 since the launch fixes of 12 Nov 2026.
- Performance 85 to 87 on desktop. On mobile it varied from 60 to 77 between runs on this machine, with layout shift 0 throughout.

**Round of 12 Nov 2026 (launch fixes, speed, game days, welcome back, room finder):** jumps land exactly on every section on both pages, at desktop and phone sizes; game days, the Home game pick and the game day button; welcome back and Clear; all five room finder outcomes; the phone gallery; the chat message on phones; analytics loading only after consent and only on the hotel's domain; the privacy, accessibility and 404 pages (the 404 page fully styled at a deep missing address). Section-by-section screenshots with and without the new speed setting match.

**Not yet tested:** Safari, Firefox and a real iPhone.

`_handoff/screens/` holds before and after screenshots for the pitch documents.
