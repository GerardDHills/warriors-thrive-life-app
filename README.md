# Warriors Thrive app (prototype)

A sickle cell companion app for ages 5–22 and caregivers, built around Dr. Amos, a conversational avatar
(ElevenLabs agent running Claude, voice "Curtis") from the Warriors Thrive universe.

## Features
- **Onboarding** with nickname, role (patient or caregiver), age group and hydroxyurea dose time.
- **Dr. Amos chat**: one-time lip-synced introduction video, then calm listening/thinking loops; voice or typing;
  replies shown as text. If no microphone is found, typing still works and he answers out loud.
- **Weekly check-in** inside the chat (patient-reported outcomes), picking the item bank by age:
  PROMIS Pediatric (8–17), PROMIS Parent Proxy (5–7 or caregiver), ASCQ-Me (18–22).
  **Item wording in `src/checkin.js` is DRAFT placeholder text.** Replace it with the licensed
  wording and item IDs from HealthMeasures and ASCQ-Me before any patient use.
- **Pain tracker**: 0–10 scale, location, what helped, red-flag screen with an urgent-care card, 14-day chart.
- **Medicine**: hydroxyurea photo check-in (camera or photo picker), streak calendar, family sharing,
  daily calendar reminder (.ics).
- **Appointments** and **Speak-Up Missions** (self-advocacy) on the Home screen.
- **Warrior Points, ranks, badges and a Prize Vault**. Prizes, costs, the care-team phone number and
  the hospital name live in `src/config.js`. Redeeming creates a code that hospital staff honor.
- **Download my logs (CSV)** in Settings, for sharing with the care team.

## New in this version
- **Always-visible "I'm going to the Emergency Room" button** (above the tab bar). It builds an ED arrival
  summary from the patient's logs (pain plan zone and timing, latest body-map pain, home doses with times,
  hydroxyurea adherence for 7 and 30 days), shows it in a large "show to staff" view, and can copy it.
  "Tell my care team" is a stub: wire it to your server to page the team and attach the summary.
- **Crisis watch**: how many warriors reported a crisis today, with prevention tips when it's elevated.
  Uses DEMO numbers (`crisisPulse()` in `src/ED.jsx`) until a server endpoint provides the real count.
- **My Body Pain Tracker**: front / back / both body map; tap areas, rate each 0–10, glowing color legend,
  "My pain areas today", 14-day chart and a 30-day "where it hurts most" map.
- **Green / Yellow / Red pain plan with medicine timers** (`src/painplan.js`, `src/PainPlan.jsx`):
  - Green: comfort steps + acetaminophen and ibuprofen alternating every 3 hours.
  - Yellow (after 6–12 h without improvement, set per patient): add the opioid every 4 hours.
  - Red (not better after 1 or 2 opioid doses, set per patient, or opioid needed sooner than 4 h): go to the ED,
    keep taking medicines on schedule.
  - Countdown rings, a chime/vibration/notification when a dose is due (app must be open in this web
    prototype; the native build should use scheduled local notifications), early-dose warnings, comfort checks.
  - **Care Team Setup** (Pain tab > Pain plan > "Care team: set up plan"; prototype code `2468`): weight,
    formulation and mg dose for acetaminophen, ibuprofen and one opioid (oxycodone, morphine IR or
    hydromorphone), with clinician-only reference ranges and warnings. Patients only see the dose entered.
    Reference ranges must be verified against institutional protocols. Replace the code gate with real
    clinician authentication before any patient use.
- **Tip of the day** from the Warriors (portraits from the master reference sheet) and a **Learn library**
  built from the Warriors Thrive infographics.
- **Warriors Thrive game** embedded from https://warriors-thrive-game.vercel.app/ with points:
  +5 per 5 minutes of active play (game focused and visible, max 30 min/day), +2 per correct Warrior Card,
  +50 for a win (once a day), with a daily cap. Answers and wins need two lines in the game:
  ```js
  window.parent.postMessage({ source: "warriors-thrive-game", type: "answer", correct: true }, "*");
  window.parent.postMessage({ source: "warriors-thrive-game", type: "win" }, "*");
  ```
  If the game site blocks embedding, the "Open full screen" link still works (without points).
- More motion: floating blood cells in headers, pop-ins, glowing body map, pulsing ER button and timers.
  All motion turns off when the device asks for reduced motion.

## New in v3
- **Choose your Warrior avatar** (onboarding step 3, and Settings): Theo, Luciana, Malcolm, Krystal, Tasha,
  Ritika, Dr. Amos or Dr. Kim, with age, genotype and ability from the Master Visual Reference Sheet.
  The avatar appears on Home, chat bubbles, posts, stories, cheers and the hospital journal, and Dr. Amos
  knows which Warrior you picked. Dr. Amos is still the only character who talks.
- **Warriors Hub** (new "Warriors" tab; Prizes moved to the gold points chip and the Home rank card):
  posts with photos and hashtags, 24-hour stories, reactions, trending hashtags, and sharing to other apps
  through the phone's share sheet (Instagram, TikTok, Facebook, Snapchat, Messages…).
- **Cheers**: from the ER sheet a warrior can opt in to "Let my Warriors cheer me on". Others in the same
  hospital community then see their nickname, avatar and "In the ER" / "In the hospital" and can send a preset
  message plus an emoji sticker. Cheers land on a cheer wall in Hospital Mode.
- **Hospital Mode** (ER sheet > "I've been admitted", or Settings): home pain-plan timers pause; daily hospital
  story told by the avatar (mood, what happened, what helped, a note for the team, optional photo) shown as a
  storybook; breathing buddy for 10 incentive-spirometer breaths an hour; questions for the care team;
  body map and weekly check-in keep working. "I'm going home today" ends the stay.
- New points (daily caps): post +5 (2/day), cheer +3 (5/day), hospital story +10 (1/day), 10 spirometer breaths +5.
  New badges: Storyteller, Cheerleader, Hospital Hero, Deep Breather.

### Child-safety guardrails built in
- Nicknames and avatars only; "near" means the same hospital community, never location.
- Status sharing is opt-in and turns off automatically when the warrior goes home.
- Cheers are preset messages and emoji only. No comments or direct messages.
- Posts are blocked if they contain phone numbers, emails, home addresses, room/bed numbers, usernames from
  other apps, links, or unkind words. Photo tips warn about faces, wristbands and name labels.
- Under 13: a "parent or caregiver looked at this with me" check before posting, and sharing to other apps stays
  off until a grown-up turns it on in Settings.
- Report and hide on others' posts; delete on your own.

### Before real patients use the Hub
The community in this prototype is DEMO data and your own posts stay on your phone. A real version needs a
moderated server: enrolled-patient accounts, caregiver consent (COPPA for under-13s), every post reviewed
before others see it, report handling by staff, and a privacy/IRB review of status sharing.

## Run it
- Quick look: open `warriors-thrive.html` in Chrome (not inside the Claude app preview).
- Develop: `npm install`, then `npm run dev`.
- Build: `npm run build` (folder `dist/`) or `npm run build:single` (one file in `dist-single/`).

## Toward the App Store and Google Play
Wrap the `dist/` build with Capacitor (`@capacitor/core`, `@capacitor/ios`, `@capacitor/android`), then add
native plugins for local notifications (dose reminders), camera, and secure storage.

## Before real patients
- Replace browser storage (`src/store.js`) with a HIPAA-compliant backend under BAAs (hosting, ElevenLabs,
  Anthropic), plus sign-in, parental consent and assent flows.
- Use signed ElevenLabs conversation tokens from your server instead of a public agent ID.
- Host the videos on your own storage; the current links point to Higgsfield's CDN.
- Licensed PROMIS / ASCQ-Me wording and proper scoring (T-scores); IRB review; CHOP AI governance review.
- Load the approved SCD content library into the agent's knowledge base.

## New in v4
- **Video stories and posts**: clips up to 30 seconds (60 MB). They're saved on the device (IndexedDB) and can be shared to other apps.
- **Hospital pain plan** (Pain → Hospital plan, and in Hospital Mode). The care team sets it up behind the care-team code. It covers:
  - a PCA (demand dose, lockout, basal, 1-hour limit) with a lockout countdown and an "I pressed my button" log;
  - around-the-clock acetaminophen, ibuprofen or ketorolac;
  - helper medicines: antibiotics, bowel care, stomach protection, IV fluids;
  - blood transfusions with their status.
  
  The pump, scheduled-medicine and cross-check warnings use reference ranges that must be checked against institutional protocol.
- **Teams**: the Warrior a user picks is their team. Tap your picture on Home to open the team dashboard: standings, top 3 accounts per team, the challenge of the week and updates from around the world. All team data is DEMO for now.
- **Warrior profile**: own photo (cropped square), bio with a safety check, team switch, stats and badges. Under-13s can use their own photo only after a parent turns it on in **Parent settings**, which is protected by a 4-digit parent PIN.

## New in v5: research report and exact age
- **Birthday (optional)**, entered in onboarding or Settings, gives the exact age. It sets the age group and the under-13 parent rules, stays on the device, and never appears in any report, where age shows only in whole years.
- **Dr. Amos conversations are saved** turn by turn, along with the ElevenLabs conversation ID so the server-side transcript can be pulled in production.
- **Research report** (Settings → Research report; study code is the placeholder 2468):
  - **Participant:** random study ID, age in years, role, team.
  - **Summary:** pain, hydroxyurea days, PRO answers and flags, ED visits, stays, PCA presses (doses vs. presses while resting), conversations.
  - **Tables:** pain, hydroxyurea, patient_reported, home_pain_plan, ed_visits, hospital_stays, pca_presses, inpatient_plan, spirometer, hospital_journal, game, engagement, conversation_turns.
  - **Dates:** every date becomes a study day plus hour.
  - **Free text:** scrubbed automatically for names, family and staff names, places, addresses, dates, phone numbers, emails, IDs and long numbers. Free text still needs human review before release.
  - **Downloads:** JSON (full) or CSV (one long table).
  - **Left out:** nickname, birthday, photos and video, bio, social posts and ED summary text.
- **Research consent toggle** in Settings, decided by a parent or guardian for children. The report warns if it's off.

## New in v6: My Check-In Tracker
Opened from the Home card. It has three tabs.
- **Checkups:**
  - Reminders by age and sickle cell type, drafted from the 2014 NHLBI Expert Panel and the 2020 ASH guidelines: TCD, brain MRI, eye exam, kidney (urine albumin), blood pressure, hydroxyurea labs, ferritin, flu and other vaccines, penicillin, dentist, feelings check, transition check.
  - Each shows a status (overdue, due, due soon, up to date). Logging one earns +20 points.
  - Needs clinical review before release.
- **Visit summary:**
  - Covers the time since the last visit, or the last 30 or 90 days.
  - Includes pain days and areas, ER visits, hospital stays, hydroxyurea adherence, check-in flags, checkups due, Level Up score and the warrior's questions.
  - Can be shared or copied for MyChart or check-in.
- **Level Up:**
  - Transition skills in 5 levels for ages 12 and up, plus Starter skills for younger warriors.
  - Each skill is marked Not yet, Learning or I can do it. Points per skill and per level.
  - Caregiver wording when the user is a caregiver.
- **Dr. Amos** receives the checkups that are due and the Level Up progress at the start of each chat.
- **Research export** adds `checkups` and `transition_skills` tables, plus genotype.

## New in v7: 1-minute character lessons

Six vertical, captioned videos in the Learn library ("Watch and learn"), each about 55 to 65 seconds: title card, the character talking (Higgsfield Intone lip-sync, ElevenLabs voices), a key-points card, a second talking clip, and an end card ("Emergency? Call 911").

| Lesson | Teacher | Linked infographic |
|---|---|---|
| Acute chest syndrome | Malcolm | Acute Chest Syndrome |
| Stroke warning signs | Tasha | (none yet) |
| Fever is an emergency (101°F / 38.3°C) | Dr. Kim | Fever |
| Splenic sequestration | Theo | Splenic Sequestration |
| Your pain crisis plan | Krystal | Pain Scale |
| Priapism (ER after 2 hours) | Dr. Amos | (none yet) |

- Scripts were clinically reviewed by Dr. Hills before production. Thresholds chosen: fever 101°F (38.3°C); priapism, go to the ER if it lasts more than 2 hours.
- Video links live in `src/config.js` (`LESSON_VIDEOS`). A lesson with an empty `url` is hidden.
- The build script (cards, caption alignment to the approved script, assembly) is in the deploy repo at `tools/videos/`. Captions use the approved wording, with Whisper used only for timing.
- The voices are saved in the ElevenLabs workspace as "Warriors Thrive - Malcolm / Tasha / Krystal" and "Dr. Kim". ElevenLabs will not design voices described as under 18, so the teen voices are described as youthful young adults.
- Dr. Amos's definition of priapism is voice-over on a card, not lip-synced, because the video model's content filter blocks anatomical terms.
