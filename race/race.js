/* Bloodstream Rush · Warriors Thrive
 * A kart race through the body. Board 1: bone marrow → bloodstream → heart →
 * lungs → heart → spleen → bone marrow. Pseudo-3D road on a 2D canvas.
 */
"use strict";

/* ================= helpers ================= */
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const EMBED = window.parent !== window;
const app = store.get("wt-state-v1", null);
const prof = (app && app.profile) || {};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function post(msg) { if (EMBED) try { parent.postMessage({ source: "warriors-thrive-race", ...msg }, location.origin); } catch {} }
function ageYears() {
  if (prof.birthday) { const b = new Date(prof.birthday + "T12:00"), n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a; }
  return { "5-7": 6, "8-12": 10, "13-17": 15, "18-22": 20 }[prof.ageGroup] ?? null;
}
const AGE = ageYears();
const imgs = {};
function img(src) { if (!imgs[src]) { const i = new Image(); i.decoding = "async"; i.src = src; imgs[src] = i; } return imgs[src]; }
const ready = (i) => i && i.complete && i.naturalWidth > 0;

/* ================= content ================= */
const WARRIORS = [
  { id: "theo", name: "Theo", color: "#ffd23d" },
  { id: "luciana", name: "Luciana", color: "#ff7ab8" },
  { id: "ritika", name: "Ritika", color: "#a77bff" },
  { id: "malcolm", name: "Malcolm", color: "#4cc3ff" },
  { id: "tasha", name: "Tasha", color: "#ff9a4c" },
  { id: "krystal", name: "Krystal", color: "#5dffa0" },
  { id: "dr_kim", name: "Dr. Kim", color: "#ffffff" },
];
// seat: [centre x, top of seat opening y, seat width] as fractions of the kart image
const KARTS = [
  { id: "rbc", name: "Red Blood Cell", tag: "Cell", spd: 3, acc: 3, hnd: 3, seat: [0.496, 0.404, 0.275],
    fact: "Red blood cells carry oxygen from the lungs to the whole body. Healthy ones are soft, round discs.",
    perk: "Boosts last longer in the lungs, where red cells load up on oxygen." },
  { id: "retic", name: "Reticulocyte", tag: "Cell", spd: 3, acc: 5, hnd: 3, seat: [0.496, 0.418, 0.258],
    fact: "A reticulocyte is a brand-new red blood cell, fresh out of the bone marrow.",
    perk: "Fastest off the starting line and out of every slowdown." },
  { id: "neutrophil", name: "Neutrophil", tag: "Cell", spd: 5, acc: 3, hnd: 2, seat: [0.494, 0.431, 0.267],
    fact: "Neutrophils are white blood cells and first responders. They rush to fight germs.",
    perk: "Highest top speed." },
  { id: "macrophage", name: "Macrophage", tag: "Cell", spd: 3, acc: 2, hnd: 3, seat: [0.456, 0.194, 0.217],
    fact: "Macrophages are big white cells that gobble up germs and old cells.",
    perk: "Gobbles Society nets: traps hold you half as long." },
  { id: "tcell", name: "T-Cell", tag: "Cell", spd: 3, acc: 3, hnd: 5, seat: [0.503, 0.324, 0.239],
    fact: "T-cells are lymphocytes that find and fight infected cells.",
    perk: "Best handling for dodging." },
  { id: "bcell", name: "B-Cell", tag: "Cell", spd: 3, acc: 3, hnd: 4, seat: [0.497, 0.212, 0.256],
    fact: "B-cells are lymphocytes that make antibodies, like the ones vaccines teach your body to make.",
    perk: "Immune to myth bubbles." },
  { id: "stem", name: "Stem Cell", tag: "Cell", spd: 3, acc: 3, hnd: 3, seat: [0.503, 0.152, 0.239],
    fact: "Blood stem cells live in the bone marrow and can grow into every kind of blood cell.",
    perk: "Starts the race with two Health Crystals." },
  { id: "platelet", name: "Platelet", tag: "Cell", spd: 2, acc: 4, hnd: 5, seat: [0.503, 0.153, 0.272],
    fact: "Platelets are tiny cell pieces that plug leaks and help blood clot.",
    perk: "Small and nimble: squeezes past blockages more easily." },
  { id: "hydroxyurea", name: "Hydroxyurea", tag: "Medicine", spd: 3, acc: 3, hnd: 3, seat: [0.504, 0.156, 0.277],
    fact: "Hydroxyurea helps the body make fetal hemoglobin, which keeps red cells from sickling. It lowers pain crises.",
    perk: "Blockages slow you down half as much." },
  { id: "etavopivat", name: "Etavopivat", tag: "Medicine", spd: 4, acc: 3, hnd: 2, seat: [0.5, 0.111, 0.267],
    fact: "Etavopivat is a new medicine under FDA review. It helps red cells make more energy so they sickle less.",
    perk: "Crystal boosts are extra strong." },
  { id: "glutamine", name: "L-Glutamine", tag: "Medicine", spd: 3, acc: 4, hnd: 3, seat: [0.497, 0.147, 0.217],
    fact: "L-glutamine is a powder medicine that helps protect red cells from stress and can lower pain crises.",
    perk: "Recovers faster after a blockage." },
  { id: "gene", name: "Gene-Edited Stem Cell", tag: "Gene therapy", spd: 4, acc: 4, hnd: 3, seat: [0.5, 0.2, 0.3],
    fact: "Gene therapy changes a Warrior's own blood stem cells so their red cells make healthy hemoglobin. The FDA approved two for sickle cell in 2023, for ages 12 and up.",
    perk: "Edited cells don't sickle: blockages barely slow you, and you start with an Oxygen crystal." },
];
const KART = Object.fromEntries(KARTS.map((k) => [k.id, k]));

const CRYSTALS = [
  { id: "water", icon: "💧", name: "Hydration", verb: "Fluids washed the blockage away", fact: "Drinking plenty of water keeps blood thinner so sickled cells are less likely to jam." },
  { id: "pain", icon: "💊", name: "Pain Plan", verb: "Pain treatment eased the crisis", fact: "A pain plan made with your care team tells you what to take and when to get help." },
  { id: "hu", icon: "🟣", name: "Hydroxyurea", verb: "Hydroxyurea kept the cells from sickling", fact: "Taken every day, hydroxyurea raises fetal hemoglobin so red cells sickle less." },
  { id: "warm", icon: "🧣", name: "Stay Warm", verb: "Warmth got the blood flowing", fact: "Cold makes blood vessels narrow. Staying warm helps blood keep moving." },
  { id: "o2", icon: "🫧", name: "Oxygen", verb: "Oxygen helped the red cells unsickle", fact: "Red cells sickle more when oxygen is low. The lungs load oxygen onto red cells." },
];

// The cells floating in each part of the body, with what each one does
const CELLS = {
  rbc: ["Red blood cell", "A soft, round disc that carries oxygen to the whole body."],
  sickle: ["Sickled red cell", "Stiff and curved like a crescent, it can get stuck and block blood flow."],
  neutrophil: ["Neutrophil", "A white blood cell with a lobed nucleus. First to rush in and fight germs."],
  lymph: ["Lymphocyte", "A white blood cell (T-cell or B-cell) that learns and remembers germs."],
  platelet: ["Platelets", "Tiny cell pieces that stick together to plug leaks and help blood clot."],
  stem: ["Blood stem cell", "Lives in the bone marrow and can become any kind of blood cell."],
  o2: ["Oxygen", "Breathed in by the lungs and carried by red blood cells."],
  macro: ["Macrophage", "A big white cell that eats germs and old or damaged red cells."],
};

const MYTHS = [
  ["Sickle cell is contagious.", "Sickle cell disease is inherited from parents. You can't catch it."],
  ["Kids with sickle cell can't play sports.", "Many Warriors play sports with water, rest breaks and a plan."],
  ["Pain crises are all in your head.", "Pain from a crisis is real and needs real treatment."],
  ["Only one group of people gets sickle cell.", "Sickle cell affects people of many backgrounds all over the world."],
  ["Sickle cell trait is the same as the disease.", "Trait usually causes no symptoms. The disease needs care."],
  ["If you look fine, you feel fine.", "Sickle cell symptoms can be invisible. Believe Warriors."],
  ["Warriors can't have big dreams.", "Warriors become doctors, artists, athletes and more."],
];

// The route. len is in road segments; road has curves (c) and hills (h).
const ZONES = [
  { id: "marrow", vp: 0.6, ground: "img/ground/marrow.webp", name: "Bone Marrow", bg: "img/bg_marrow.webp", len: 700,
    road: ["#0e0508", "#170a0e"], side: ["#6b3b22", "#5c321d"], rumble: ["#f3d9b8", "#c97a5a"], lane: "rgba(255,230,200,.5)", fog: "#763133",
    deco: ["stem", "stem", "rbc", "neutrophil", "lymph", "platelet", "macro"], mercy: ["marrow", "marrow2"] },
  { id: "vessel", vp: 0.47, ground: "img/ground/vessel.webp", name: "Bloodstream", bg: "img/bg_vessel.webp", len: 1300,
    road: ["#0e0508", "#170a0e"], side: ["#3d0710", "#33060d"], rumble: ["#ff8ba0", "#c0283f"], lane: "rgba(255,200,210,.5)", fog: "#601a1a",
    deco: ["rbc", "rbc", "rbc", "sickle", "platelet", "neutrophil", "lymph"], mercy: ["vessel", "vocfact"] },
  { id: "heartR", vp: 0.56, ground: "img/ground/heart.webp", name: "Heart · right side", bg: "img/bg_heart.webp", len: 650,
    road: ["#0e0508", "#170a0e"], side: ["#1a0a2a", "#160823"], rumble: ["#a8324a", "#6e1626"], lane: "rgba(255,170,185,.45)", fog: "#4b0b0d",
    deco: ["rbc", "rbc", "platelet", "neutrophil"], beat: true, mercy: ["heart1"] },
  { id: "lung", vp: 0.6, ground: "img/ground/lung.webp", name: "Lungs", bg: "img/bg_lung.webp", len: 1150,
    road: ["#0e0508", "#170a0e"], side: ["#1a2f5c", "#162951"], rumble: ["#ffd6e6", "#c97a90"], lane: "rgba(255,255,255,.55)", fog: "#8a5a70",
    deco: ["o2", "o2", "rbc", "rbc", "macro"], mercy: ["lung", "lung2"] },
  { id: "heartL", vp: 0.52, ground: "img/ground/heart.webp", name: "Heart · left side", bg: "img/bg_heartL.webp", noFlip: true, len: 650,
    road: ["#0e0508", "#170a0e"], side: ["#2a0612", "#23050f"], rumble: ["#ff4361", "#ffd0d8"], lane: "rgba(255,190,200,.55)", fog: "#5a1620",
    deco: ["rbc", "rbc", "rbc", "platelet"], beat: true, mercy: ["heart2"] },
  { id: "spleen", vp: 0.6, ground: "img/ground/spleen.webp", name: "Spleen", bg: "img/bg_spleen.webp", len: 1250,
    road: ["#0e0508", "#170a0e"], side: ["#1d0920", "#18071b"], rumble: ["#8a3a6a", "#b04cff"], lane: "rgba(210,160,255,.5)", fog: "#67131c",
    deco: ["macro", "macro", "lymph", "sickle", "rbc", "sickle"], mercy: ["spleen", "spleen2"] },
  { id: "home", vp: 0.6, ground: "img/ground/marrow.webp", name: "Back to the marrow", bg: "img/bg_marrow.webp", len: 800,
    road: ["#0e0508", "#170a0e"], side: ["#5a2e18", "#4d2714"], rumble: ["#f3d9b8", "#ffc23d"], lane: "rgba(255,230,200,.55)", fog: "#763133",
    deco: ["stem", "rbc", "neutrophil", "platelet", "lymph"], mercy: ["final"] },
];

// What Mercy says, keyed to her recordings in voice/mercy/<key>.mp3
const MERCY = {
  count: "Three… two… one… Go!",
  marrow: "We're starting in the bone marrow, the body's cell factory. Stem cells here grow into red cells, white cells and platelets.",
  marrow2: "Fun fact: a healthy red blood cell lives about 120 days. In sickle cell disease, red cells may last only 10 to 20 days.",
  vessel: "Now we're in the bloodstream! Red blood cells carry oxygen to every part of the body.",
  voc: "Heads up! Sickled cells are jamming the vessel. That's a vaso-occlusive crisis. Use a Health Crystal to treat it!",
  vocfact: "Drinking water, staying warm and taking your medicines help keep blood flowing.",
  heart1: "Entering the right side of the heart. It pumps blood to the lungs to pick up oxygen.",
  lung: "Welcome to the lungs! Tiny air sacs called alveoli load oxygen onto your red cells.",
  lung2: "Chest pain, fever or trouble breathing could be acute chest syndrome. That's an emergency, so get care right away.",
  heart2: "Back in the heart, on the left side! Now it pumps oxygen-rich blood out to the whole body.",
  spleen: "Careful, Warriors, we're entering the spleen. It filters the blood and helps fight infection.",
  spleen2: "Sickled cells can get trapped here. That's splenic sequestration. A big belly, pale skin or feeling very tired means get help fast.",
  seq: "Oh no, you're stuck in the spleen! Answer this Warrior Card to break free.",
  society: "Watch out! The Society is spreading myths. Steer clear of their drones!",
  share: "Sharing is caring! Warriors are stronger together.",
  crystal: "Nice! You picked up a Health Crystal. Save it for a blockage, or use it for a boost.",
  final: "Final stretch! Race back to the bone marrow!",
  lead: "You're in first place! Keep it up!",
  behind: "Don't give up! Use your crystals and catch up!",
  finish1: "You crossed the finish line! Amazing driving!",
  finish: "Race complete! Let's see who made the biggest impact.",
};

/* ================= settings ================= */
const opts = Object.assign({ music: true, sfx: true, voice: true, track: "race" }, store.get("wt-race-opts", {}));
const saveOpts = () => store.set("wt-race-opts", opts);

/* ================= audio ================= */
// Music and Warrior voices run through WebAudio gain nodes: iPhones ignore
// <audio>.volume, so this is the only way to turn them down under Mercy.
let AC = null, master = null, engine = null, musicGain = null, warGain = null;
const music = $("music");
const MUSIC_V = 0.32, MUSIC_DUCK = 0.06, WAR_DUCK = 0.22;
const TRACKS = { race: "music.mp3", theme: "../runner/theme.mp3" };
const TRACK_NAME = { race: "Race mix", theme: "Warriors Thrive theme" };
let mercyTalking = false;
music.volume = MUSIC_V;
function audioInit() {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination);
      musicGain = AC.createGain(); musicGain.gain.value = MUSIC_V; musicGain.connect(master);
      warGain = AC.createGain(); warGain.gain.value = 1; warGain.connect(master);
      AC.createMediaElementSource(music).connect(musicGain);
      music.volume = 1;
    } catch { musicGain = null; }
  }
  if (AC && AC.state === "suspended") AC.resume();
}
function setTrack(t) {
  if (!TRACKS[t]) t = "race";
  const changed = opts.track !== t || !music.src.endsWith(TRACKS[t].replace("../", ""));
  opts.track = t; saveOpts();
  if (changed) { const was = !music.paused; music.src = TRACKS[t]; if (was) music.play().catch(() => {}); }
  $("trackLbl").textContent = TRACK_NAME[t];
  document.querySelectorAll("[data-track]").forEach((b) => b.classList.toggle("on", b.dataset.track === t));
}
// Mercy has the floor: music, Warrior chatter and the engine all drop while she talks
function setDuck(on) {
  mercyTalking = on;
  if (AC && musicGain) {
    const t = AC.currentTime;
    musicGain.gain.setTargetAtTime(on ? MUSIC_DUCK : MUSIC_V, t, on ? 0.06 : 0.35);
    warGain.gain.setTargetAtTime(on ? WAR_DUCK : 1, t, 0.06);
  } else {
    music.volume = on ? MUSIC_DUCK : MUSIC_V;
    if (warriorAudio) warriorAudio.volume = on ? WAR_DUCK : 0.95;
  }
}
function tone(f, d = 0.08, type = "sine", v = 0.12, slide = 0, delay = 0) {
  if (!AC || !opts.sfx) return;
  if (mercyTalking) v *= 0.45;
  const t = AC.currentTime + delay, o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f * slide), t + d);
  g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g).connect(master); o.start(t); o.stop(t + d + 0.05);
}
let noiseBuf = null;
function noise(d = 0.3, v = 0.15, freq = 1200, q = 0.7, delay = 0, type = "bandpass") {
  if (!AC || !opts.sfx) return;
  if (mercyTalking) v *= 0.45;
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const a = noiseBuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
  const t = AC.currentTime + delay, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = noiseBuf; s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + d * 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + d + 0.05);
}
const sfx = {
  tap() { tone(660, 0.05, "sine", 0.06); },
  crystal() { [880, 1110, 1320, 1760].forEach((f, i) => tone(f, 0.16, "triangle", 0.09, 0, i * 0.06)); },
  boost() { noise(0.7, 0.22, 900, 0.6); tone(220, 0.6, "sawtooth", 0.06, 3); },
  treat() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.2, "triangle", 0.1, 0, i * 0.05)); noise(0.5, 0.12, 3000, 0.5); },
  hit() { tone(110, 0.4, "sawtooth", 0.18, 0.4); noise(0.35, 0.25, 400, 0.8); },
  trap() { tone(1400, 0.6, "sawtooth", 0.05, 0.25); tone(900, 0.5, "square", 0.04, 0.5, 0.05); noise(0.6, 0.1, 5000, 4); },
  bump() { tone(180, 0.12, "square", 0.08, 0.6); },
  share() { [784, 988, 1175].forEach((f, i) => tone(f, 0.22, "sine", 0.1, 0, i * 0.09)); },
  beep() { tone(880, 0.18, "square", 0.08); },
  go() { tone(1320, 0.5, "square", 0.1); },
  good() { [660, 880, 1320].forEach((f, i) => tone(f, 0.16, "triangle", 0.12, 0, i * 0.09)); },
  bad() { tone(300, 0.35, "triangle", 0.12, 0.6); },
  win() { [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tone(f, 0.25, "triangle", 0.12, 0, i * 0.12)); },
  beat() { tone(62, 0.16, "sine", 0.35, 0.6); tone(58, 0.14, "sine", 0.28, 0.6, 0.22); },
  breath() { noise(2.2, 0.07, 700, 0.4, 0, "lowpass"); },
  blast() { noise(0.25, 0.2, 1800, 1.2); tone(520, 0.18, "triangle", 0.08, 2.2); },
  zap() { tone(1400, 0.12, "square", 0.06, 0.3); noise(0.2, 0.15, 3000, 2); },
  power() { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.25, "sawtooth", 0.05, 0, i * 0.05)); noise(0.6, 0.12, 1200, 0.5); },
  learn() { tone(1046, 0.12, "sine", 0.05); tone(1568, 0.18, "sine", 0.04, 0, 0.08); },
};
function engineStart() {
  if (!AC || engine) return;
  const o = AC.createOscillator(), o2 = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain();
  o.type = "sawtooth"; o2.type = "square"; f.type = "lowpass"; f.frequency.value = 500; g.gain.value = 0;
  o.connect(f); o2.connect(f); f.connect(g).connect(master); o.start(); o2.start();
  engine = { o, o2, f, g };
}
// stop the engine completely (not just quiet) whenever the player isn't driving
function engineStop() {
  if (!engine) return;
  const e = engine; engine = null;
  try { const t = AC.currentTime; e.g.gain.cancelScheduledValues(t); e.g.gain.setValueAtTime(e.g.gain.value, t); e.g.gain.linearRampToValueAtTime(0, t + 0.25); e.o.stop(t + 0.3); e.o2.stop(t + 0.3); } catch {}
}
function engineSet(speedFrac, on) {
  if (!engine) return;
  const t = AC.currentTime, f = 55 + speedFrac * 140;
  engine.o.frequency.setTargetAtTime(f, t, 0.08);
  engine.o2.frequency.setTargetAtTime(f * 0.5, t, 0.08);
  engine.f.frequency.setTargetAtTime(300 + speedFrac * 900, t, 0.1);
  engine.g.gain.setTargetAtTime(on && opts.sfx ? (0.035 + speedFrac * 0.03) * (mercyTalking ? 0.3 : 1) : 0, t, 0.1);
}

/* voices: one clip at a time per speaker group */
const voiceCache = {};
let mercyAudio = null, warriorAudio = null, mercyBusyUntil = 0, unduckT = 0;
function playClip(src, kind) {
  if (!opts.voice) return null;
  const a = voiceCache[src] || (voiceCache[src] = new Audio(src));
  if (kind === "warrior" && AC && warGain && !a._wired) { try { AC.createMediaElementSource(a).connect(warGain); a._wired = true; } catch {} }
  try { a.currentTime = 0; } catch {}
  a.volume = kind === "mercy" ? 1 : a._wired ? 1 : mercyTalking ? WAR_DUCK : 0.95;
  a.play().catch(() => {});
  return a;
}
const mercyQueue = [];
let mercyHideT = 0;
function mercySay(key, force = false) {
  if (!MERCY[key]) return;
  if (!force && R && R.mercySaid.has(key) && !["voc", "society", "seq", "lead", "behind"].includes(key)) return;
  if (R) { R.mercySaid.add(key); R.heard.add(key); }
  if (performance.now() < mercyBusyUntil && !force) { if (mercyQueue.length < 3 && !mercyQueue.includes(key)) mercyQueue.push(key); return; }
  mercyShow(key);
}
function mercyShow(key) {
  const text = MERCY[key];
  const el = $("mercyTxt"), box = $("mercy");
  el.innerHTML = `<b>Mercy</b>${text}`;
  el.classList.remove("hidden"); box.classList.add("talk");
  if (mercyAudio) try { mercyAudio.pause(); } catch {}
  // a Warrior mid-sentence stops so Mercy is heard
  if (warriorAudio && !warriorAudio.paused) try { warriorAudio.pause(); } catch {}
  mercyAudio = playClip(`voice/mercy/${key}.mp3`, "mercy");
  const dur = mercyAudio && isFinite(mercyAudio.duration) && mercyAudio.duration > 0 ? mercyAudio.duration * 1000 + 400 : 0;
  const ms = Math.max(2600, dur || text.length * 66);
  setDuck(true);
  clearTimeout(unduckT);
  if (mercyAudio) mercyAudio.onended = () => { if (!mercyQueue.length) { clearTimeout(unduckT); unduckT = setTimeout(() => setDuck(false), 250); } };
  unduckT = setTimeout(() => setDuck(false), ms + 300);
  mercyBusyUntil = performance.now() + ms;
  clearTimeout(mercyHideT);
  mercyHideT = setTimeout(() => {
    box.classList.remove("talk");
    if (mercyQueue.length) mercyShow(mercyQueue.shift());
    else el.classList.add("hidden");
  }, ms);
}
let warriorNext = 0;
function warriorSay(id, key, force = false) {
  const now = performance.now();
  // Warriors don't talk over Mercy unless it's a key moment, and then quietly
  if (now < mercyBusyUntil && !force) return;
  if (!force && now < warriorNext) return;
  warriorNext = now + 3500;
  if (warriorAudio) try { warriorAudio.pause(); } catch {}
  warriorAudio = playClip(`voice/${id}/${key}.mp3`, "warrior");
}

/* ================= Warrior Cards ================= */
let DECK = [];
fetch("cards.json").then((r) => r.json()).then((d) => {
  const kid = AGE != null && AGE < 12, teen = AGE != null && AGE >= 13;
  let pool = d.filter((c) => !c.topic && (c.lvl === "kid" || (!kid && c.lvl === "all") || (teen && c.lvl === "teen")));
  if (AGE == null) pool = d.filter((c) => !c.topic && c.lvl !== "teen");
  DECK = pool.length ? pool : d;
}).catch(() => {});
function nextCard() {
  if (!DECK.length) return { q: "What does the spleen do?", a: ["Filters the blood and fights infection", "Pumps blood", "Makes hair", "Digests food"], c: 0 };
  let seen = store.get("wt-race-seen", []);
  let fresh = DECK.filter((c) => !seen.includes(c.id));
  if (!fresh.length) { seen = []; fresh = DECK; }
  const c = pick(fresh); seen.push(c.id); store.set("wt-race-seen", seen); return c;
}

/* ================= canvas + road geometry ================= */
const cv = $("cv"), ctx = cv.getContext("2d");
let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = Math.round(innerWidth * DPR); H = Math.round(innerHeight * DPR);
  cv.width = W; cv.height = H;
}
addEventListener("resize", resize); resize();
// Safe areas: the Life App measures them upright and passes them in the URL.
// Held sideways, the notch side becomes the left or right edge.
const QS = new URLSearchParams(location.search);
const qIn = ["sat", "sar", "sab", "sal"].map((k) => parseFloat(QS.get(k)) || 0);
function applyInsets() {
  if (!QS.has("sat")) return;
  const land = innerWidth > innerHeight, root = document.documentElement.style;
  const side = Math.max(qIn[0], qIn[1], qIn[3]);
  root.setProperty("--st", (land ? 0 : qIn[0]) + "px");
  root.setProperty("--sb", (land ? Math.min(qIn[2], 21) : qIn[2]) + "px");
  root.setProperty("--sl", (land ? side : qIn[3]) + "px");
  root.setProperty("--sr", (land ? side : qIn[1]) + "px");
}
addEventListener("resize", applyInsets); applyInsets();

const SEG = 200, ROAD = 2000, LANES = 3, CAM_H = 1000, DRAW = 200, CAM_BACK = 840, KART_W = 0.26;
const CAM_DEPTH = 1 / Math.tan((100 / 2) * Math.PI / 180);
const MAXSPD = SEG * 60; // world units per second
let SEGS = [], TRACK_LEN = 0, ZONE_START = [];

function easeIn(a, b, p) { return a + (b - a) * Math.pow(p, 2); }
function easeInOut(a, b, p) { return a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5); }
function buildTrack() {
  SEGS = []; ZONE_START = [];
  const lastY = () => (SEGS.length ? SEGS[SEGS.length - 1].p2.y : 0);
  const add = (curve, y, zi) => {
    const n = SEGS.length;
    SEGS.push({ i: n, p1: { x: 0, y: lastY(), z: n * SEG }, p2: { x: 0, y, z: (n + 1) * SEG }, curve, zi, sprites: [], objs: [] });
  };
  const road = (enter, hold, leave, curve, hill, zi) => {
    const startY = lastY(), endY = startY + hill * SEG, total = enter + hold + leave;
    for (let n = 0; n < enter; n++) add(easeIn(0, curve, n / enter), easeInOut(startY, endY, n / total), zi);
    for (let n = 0; n < hold; n++) add(curve, easeInOut(startY, endY, (enter + n) / total), zi);
    for (let n = 0; n < leave; n++) add(easeInOut(curve, 0, n / leave), easeInOut(startY, endY, (enter + hold + n) / total), zi);
  };
  // deterministic layout so the track is the same every race
  let seed = 7331; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ZONES.forEach((Z, zi) => {
    ZONE_START[zi] = SEGS.length;
    const end = SEGS.length + Z.len;
    while (SEGS.length < end) {
      const left = end - SEGS.length;
      const L = Math.min(left, 60 + Math.floor(r() * 90));
      const e = Math.floor(L * 0.25), l = Math.floor(L * 0.25), h = L - e - l;
      let curve = (r() < 0.25 ? 0 : (r() < 0.5 ? -1 : 1) * (1 + r() * 3.5));
      // big climbs and drops keep the ride interesting; each zone has its own feel
      // grade = rise per unit forward; capped so a climb never becomes a wall
      const GRADE = { marrow: 0.1, vessel: 0.16, heartR: 0.19, lung: 0.21, heartL: 0.19, spleen: 0.14, home: 0.14 }[Z.id] || 0.15;
      let hill = (0.45 + r() * 0.55) * GRADE * L * (r() < 0.5 ? -1 : 1);
      // alternate up and down so the road never drifts too far from the backdrop
      const y = lastY();
      if (y > 4000 && hill > 0) hill = -hill; else if (y < -4000 && hill < 0) hill = -hill;
      if (Z.id === "marrow" && SEGS.length < 80) { curve = 0; hill = 0; }
      if (Z.id === "spleen") curve *= 1.3;                    // twisty filter maze
      road(e, h, l, curve, hill, zi);
    }
  });
  // run-off past the finish so the road keeps drawing
  const zi = ZONES.length - 1;
  for (let n = 0; n < DRAW + 20; n++) add(0, lastY(), zi);
  TRACK_LEN = (SEGS.length - DRAW - 20) * SEG;
  decorate(r);
}
function segAt(z) { return SEGS[Math.floor(z / SEG) % SEGS.length]; }
const laneX = (l) => (l - (LANES - 1) / 2) * (2 / LANES); // -0.667, 0, 0.667

function decorate(r) {
  const START = 40, ENDSEG = ZONE_START[ZONES.length - 1] + ZONES[ZONES.length - 1].len;
  for (let i = 0; i < SEGS.length; i++) {
    const s = SEGS[i], Z = ZONES[s.zi];
    // real cells floating beside and above the road; some carry a name label
    if (i % 3 === 0 && r() < 0.8) {
      const side = r() < 0.5 ? -1 : 1;
      const kind = Z.deco[Math.floor(r() * Z.deco.length)];
      s.sprites.push({ kind, x: side * (1.3 + r() * 2.4), y: r() * 1400, s: 0.55 + r() * 0.8, rot: r() * 6.28, spin: (r() - 0.5) * 1.4, label: r() < 0.22 });
    }
    if (i % 11 === 0 && r() < 0.5) {
      // a few drift high over the road for depth
      const kind = Z.deco[Math.floor(r() * Z.deco.length)];
      s.sprites.push({ kind, x: (r() - 0.5) * 2.2, y: 2400 + r() * 2200, s: 0.4 + r() * 0.5, rot: r() * 6.28, spin: (r() - 0.5), label: false });
    }
  }
  SEGS[START].sprites.push({ kind: "arch", x: 0, y: 0, s: 1 });
  SEGS[ENDSEG].sprites.push({ kind: "arch", x: 0, y: 0, s: 1 });
  // gameplay objects
  const place = (i, o) => SEGS[i] && SEGS[i].objs.push(o);
  for (let zi = 0; zi < ZONES.length; zi++) {
    const a = Math.max(ZONE_START[zi], 90), b = ZONE_START[zi] + ZONES[zi].len - 20, id = ZONES[zi].id;
    for (let i = a; i < b; i += 22 + Math.floor(r() * 22)) {
      const roll = r(), lane = Math.floor(r() * 3);
      if (roll < 0.34) {
        // a little line of crystals
        const o2 = id === "lung" && r() < 0.5;
        place(i, { t: "crystal", x: laneX(lane), w: 0.32, type: o2 ? "o2" : pick(["water", "pain", "hu", "warm"]) });
      } else if (roll < 0.47) {
        place(i, { t: "boost", x: laneX(lane), w: 0.42 });
      } else if (roll < 0.70 && id !== "marrow") {
        // vaso-occlusion: sickled cells jamming one or two lanes
        const two = r() < 0.35;
        place(i, { t: "voc", x: laneX(lane), w: 0.5 });
        if (two) place(i, { t: "voc", x: laneX((lane + 1) % 3), w: 0.5 });
      } else if (roll < 0.82 && id !== "marrow" && zi > 0) {
        place(i, { t: "drone", x: laneX(lane), w: 0.45, myth: Math.floor(r() * MYTHS.length) });
      } else if (roll < 0.92 && id !== "marrow") {
        place(i, { t: "myth", x: laneX(lane), w: 0.4, myth: Math.floor(r() * MYTHS.length), roll: (r() - 0.5) * 0.6 });
      }
    }
  }
}

/* cell sprites (painted, medically accurate) */
const cellImg = (kind) => img(`img/cells/${kind}.webp`);

/* ================= race state ================= */
let R = null;            // the current race
let state = "title";     // title | pick | track | film | count | race | card | pause | results
let me = { warrior: store.get("wt-race-warrior", prof.character || "theo"), kart: store.get("wt-race-kart", "rbc") };
if (!WARRIORS.some((w) => w.id === me.warrior)) me.warrior = "theo";

function statMul(k) {
  const K = KART[k];
  return { top: 0.9 + K.spd * 0.03, acc: 0.6 + K.acc * 0.12, hnd: 0.7 + K.hnd * 0.12 };
}
function makeRacer(w, kart, ai, z, x) {
  return { id: w.id, name: w.name, color: w.color, kart, ai, z, x, speed: 0, lane: x,
    stun: 0, slow: 0, boost: 0, trapped: 0, seq: 0, bag: [], impact: 0, finish: null,
    nearT: 0, seqDone: false, think: 0, stuckNoted: false, skill: ai ? 0.9 : 1, dodge: 0.6 };
}
function newRace() {
  buildTrack();
  const others = WARRIORS.filter((w) => w.id !== me.warrior);
  const kartPool = KARTS.map((k) => k.id).filter((k) => k !== me.kart).sort(() => Math.random() - 0.5);
  const grid = [];
  const startZ = 40 * SEG;
  // seven karts on a staggered grid; the player starts fourth
  const order = [others[0], others[1], others[2], null, others[3], others[4], others[5]];
  order.forEach((w, i) => {
    const z = startZ - i * 260, x = [-0.55, 0.55][i % 2];
    if (!w) grid.push(makeRacer(WARRIORS.find((q) => q.id === me.warrior), me.kart, false, z, 0));
    else grid.push(makeRacer(w, kartPool[i % kartPool.length], true, z, x));
  });
  const P = grid.find((r) => !r.ai);
  if (me.kart === "stem") P.bag.push(pick(["water", "pain"]), pick(["hu", "warm"]));
  if (me.kart === "gene") P.bag.push("o2");
  R = { racers: grid, P, t: 0, zone: -1, mercySaid: new Set(), shareCool: 6, posSaid: 0, finished: false,
        cleared: new Set(), taken: new Set(), beatT: 0, breathT: 0, steer: 0, camX: 0, bgX: 0, shake: 0, endT: 0,
        firstVoc: true, firstDrone: true, firstCrystal: true, correct: 0,
        heard: new Set(), spotted: [], myths: new Set(), used: new Set(), laneT: 1, pressX: 0, steerDir: 0, shots: [], wave: 0, blink: 0 };
  Object.assign(P, { ammo: BLAST_MAX, ammoT: 0, powers: 2, bust: 0, shield: 0, autoClear: 0 });
  R.racers.forEach((r) => { if (r.ai) r.bag.push(pick(["water", "pain", "hu"])); });
  updateBag(); updateBlast(); updatePower(); $("impact").textContent = "0";
  buildProgress();
}

/* ================= input ================= */
// Hold an arrow to steer; tap it to hop one lane. When you let go the kart
// glides into the middle of the nearest lane, so it always ends up somewhere sensible.
const keys = { left: false, right: false };
const nearestLane = (x) => clamp(Math.round((x / (2 / LANES)) + (LANES - 1) / 2), 0, LANES - 1);
function steerStart(dir) {
  if (!R) return;
  R.pressX = R.P.x; R.pressT = performance.now(); R.steerDir = dir; R.laneT = null;
}
function steerEnd(dir) {
  if (!R) return;
  const moved = Math.abs(R.P.x - R.pressX), quick = performance.now() - (R.pressT || 0) < 220;
  R.laneT = moved < 0.3 && quick ? clamp(nearestLane(R.pressX) + dir, 0, LANES - 1) : nearestLane(R.P.x + dir * 0.12);
}
function bindPad(id, k) {
  const el = $(id), dir = k === "right" ? 1 : -1;
  const on = (e) => { e.preventDefault(); if (keys[k]) return; keys[k] = true; el.classList.add("on"); audioInit(); steerStart(dir); };
  const off = (e) => { e && e.preventDefault(); if (!keys[k]) return; keys[k] = false; el.classList.remove("on"); steerEnd(dir); };
  el.addEventListener("pointerdown", on); el.addEventListener("pointerup", off);
  el.addEventListener("pointercancel", off); el.addEventListener("pointerleave", off);
}
bindPad("left", "left"); bindPad("right", "right");
$("treat").addEventListener("pointerdown", (e) => { e.preventDefault(); useCrystal(); });
$("blast").addEventListener("pointerdown", (e) => { e.preventDefault(); fireBlast(); });
$("power").addEventListener("pointerdown", (e) => { e.preventDefault(); usePower(); });
addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "ArrowLeft" || e.key === "a") { keys.left = true; steerStart(-1); }
  if (e.key === "ArrowRight" || e.key === "d") { keys.right = true; steerStart(1); }
  if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); useCrystal(); }
  if (e.key === "x" || e.key === "Shift") fireBlast();
  if (e.key === "p" || e.key === "e") usePower();
  if (e.key === "Escape" && state === "race") pause();
});
addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") { keys.left = false; steerEnd(-1); }
  if (e.key === "ArrowRight" || e.key === "d") { keys.right = false; steerEnd(1); }
});
// swipe on the road to change lanes too
let drag = null;
cv.addEventListener("pointerdown", (e) => { if (state === "race") drag = { x0: e.clientX, id: e.pointerId, done: false }; });
cv.addEventListener("pointermove", (e) => {
  if (!drag || e.pointerId !== drag.id || drag.done || !R) return;
  const d = e.clientX - drag.x0;
  if (Math.abs(d) > 40) { drag.done = true; R.laneT = clamp(nearestLane(R.P.x) + Math.sign(d), 0, LANES - 1); sfx.tap(); }
});
const endDrag = (e) => { if (drag && e.pointerId === drag.id) drag = null; };
cv.addEventListener("pointerup", endDrag); cv.addEventListener("pointercancel", endDrag);

/* ================= learning ================= */
// A small card that names what you just met, collected for the end-of-race recap
let learnT = 0;
let learnWait = 0;
function learnCard(icon, title, text) {
  // Mercy has the floor: hold the card until she has finished
  if (performance.now() < mercyBusyUntil) { clearTimeout(learnWait); learnWait = setTimeout(() => state === "race" && learnCard(icon, title, text), mercyBusyUntil - performance.now() + 400); return; }
  const el = $("learn");
  el.innerHTML = `<div class="l-icon">${icon}</div><div><b>${title}</b><span>${text}</span></div>`;
  el.classList.remove("hidden"); el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
  sfx.learn();
  clearTimeout(learnT); learnT = setTimeout(() => el.classList.add("hidden"), 4200);
}
function spotCell(kind) {
  if (!R || R.spotted.includes(kind) || state !== "race" || R.t - (R.lastSpot || -99) < 7) return;
  R.spotted.push(kind); R.lastSpot = R.t;
  const [name, what] = CELLS[kind];
  learnCard(`<img src="img/cells/${kind}.webp" alt="">`, `Spotted: ${name}`, what);
}

/* ================= crystals ================= */
function updateBag() {
  if (!R) return;
  const b = R.P.bag;
  $("bag").innerHTML = b.slice(1).map((t) => `<span>${CRYSTALS.find((c) => c.id === t).icon}</span>`).join("");
  const btn = $("treat");
  if (b.length) { const c = CRYSTALS.find((q) => q.id === b[0]); $("treatIcon").textContent = c.icon; $("treatLbl").textContent = c.name; btn.classList.remove("empty"); }
  else { $("treatIcon").textContent = "💎"; $("treatLbl").textContent = "No crystal"; btn.classList.add("empty"); }
}
function vocAhead(r, dist) {
  const s0 = Math.floor(r.z / SEG);
  for (let i = s0; i < s0 + dist; i++) {
    const s = SEGS[i]; if (!s) break;
    for (const o of s.objs) if (o.t === "voc" && !o.gone) return { s, o };
  }
  return null;
}
function useCrystal() {
  if (state !== "race" || !R || R.P.finish != null) return;
  const P = R.P;
  if (!P.bag.length) { sfx.bad(); return; }
  const type = P.bag.shift(), C = CRYSTALS.find((c) => c.id === type);
  const hit = vocAhead(P, 26);
  if (hit || P.stun > 0) {
    // treat the blockage: clear every jam on that stretch of vessel
    const s0 = hit ? hit.s.i : Math.floor(P.z / SEG);
    for (let i = s0 - 2; i < s0 + 3; i++) SEGS[i] && SEGS[i].objs.forEach((o) => { if (o.t === "voc") { o.gone = true; o.burst = R.t; } });
    P.stun = 0; P.slow = 0; P.boost = Math.max(P.boost, 1.0);
    P.impact += 100; impactPop(100);
    sfx.treat(); flash("rgba(93,255,160,.35)");
    toast(`${C.icon} ${C.verb}! +100`);
    warriorSay(P.id, "clear", true);
  } else {
    const strong = P.kart === "etavopivat" ? 1.5 : 1;
    const lungBonus = P.kart === "rbc" && ZONES[segAt(P.z).zi].id === "lung" ? 1.5 : 1;
    P.boost = 2.2 * strong * lungBonus; P.impact += 10; impactPop(10);
    sfx.boost(); toast(`${C.icon} ${C.name} boost!`);
    warriorSay(P.id, "boost");
  }
  $("treat").classList.remove("urgent");
  if (!R.used.has(type)) { R.used.add(type); setTimeout(() => learnCard(C.icon, C.name, C.fact), 900); }
  updateBag();
}
function impactPop(n) { $("impact").textContent = R.P.impact; }

/* ================= Flow Blaster ================= */
// Shoots a burst of fluid out of the front of the kart. It breaks up sickled-cell
// clumps (and knocks out Society drones) in your lane. Three shots that recharge.
const BLAST_MAX = 3, BLAST_RECHARGE = 3.2;
function fireBlast() {
  if (state !== "race" || !R || R.P.finish != null) return;
  const P = R.P;
  if (P.ammo < 1 || P.trapped > 0 || P.seq > 0) { sfx.bad(); return; }
  P.ammo -= 1; updateBlast();
  R.shots.push({ z: P.z + 120, x: P.x, t: 0, y0: segAt(P.z).p1.y });
  sfx.blast();
}
function stepShots(dt) {
  const P = R.P;
  if (P.ammo < BLAST_MAX) { P.ammoT += dt; if (P.ammoT >= BLAST_RECHARGE) { P.ammoT = 0; P.ammo++; updateBlast(); } } else P.ammoT = 0;
  for (const sh of R.shots) {
    const z0 = sh.z; sh.z += MAXSPD * 2.6 * dt; sh.t += dt;
    const s0 = Math.floor(z0 / SEG), s1 = Math.floor(sh.z / SEG);
    for (let i = s0; i <= s1 && !sh.done; i++) {
      const sg = SEGS[i]; if (!sg) continue;
      for (const o of sg.objs) {
        if (o.gone || !(o.t === "voc" || o.t === "drone" || o.t === "myth")) continue;
        if (Math.abs(o.x - sh.x) > (o.w + 0.34) / 2) continue;
        o.gone = true; o.burst = R.t; sh.done = true; sh.hitT = R.t;
        if (o.t === "voc") { P.impact += 25; impactPop(); toast("💦 Clump broken up! +25", 1100); sfx.treat(); if (!R.mercySaid.has("blast")) { R.mercySaid.add("blast"); learnCard("💦", "Flow Blast", "Good blood flow and fluids help keep sickled cells from clumping and blocking vessels."); } }
        else if (o.t === "drone") { P.impact += 25; impactPop(); toast("⚡ Society drone zapped! +25", 1100); sfx.zap(); R.myths.add(o.myth); }
        else { toast("Myth popped!", 900); sfx.zap(); }
        break;
      }
    }
  }
  R.shots = R.shots.filter((sh) => !sh.done && sh.t < 1.3);
}
function updateBlast() {
  const P = R.P, b = $("blast");
  b.querySelector("small").textContent = `${P.ammo}/${BLAST_MAX}`;
  b.classList.toggle("empty", P.ammo < 1);
}

/* ================= Warrior powers (two per race, from the board game) ================= */
const POWERS = {
  theo:     { icon: "🔓", name: "Barrier Buster", text: "For 5 seconds you smash straight through blockages, drones and myths without slowing down." },
  luciana:  { icon: "💥", name: "Break Every Barrier", text: "Clears every blockage, drone and myth on the road ahead of you." },
  ritika:   { icon: "💎", name: "Crystal Shower", text: "Fills your crystal bag and gives a crystal to every Warrior near you." },
  malcolm:  { icon: "💚", name: "Team Heal", text: "You and every Warrior near you break free and get a burst of speed." },
  tasha:    { icon: "✨", name: "Double Clear", text: "The next two blockages you reach are cleared automatically." },
  krystal:  { icon: "🌀", name: "Teleport", text: "Blink forward a short distance, past anything in your way." },
  dr_kim:   { icon: "🛡️", name: "Crisis Shield", text: "A shield blocks the next blockage, drone or myth that hits you." },
};
function usePower() {
  if (state !== "race" || !R || R.P.finish != null) return;
  const P = R.P, W_ = POWERS[P.id];
  if (!W_ || P.powers < 1) { sfx.bad(); return; }
  P.powers -= 1; updatePower();
  const near = R.racers.filter((r) => r.ai && Math.abs(r.z - P.z) < 3500);
  if (P.id === "theo") { P.bust = 5; }
  else if (P.id === "luciana") {
    const s0 = Math.floor(P.z / SEG);
    for (let i = s0; i < s0 + 70; i++) SEGS[i] && SEGS[i].objs.forEach((o) => { if (!o.gone && (o.t === "voc" || o.t === "drone" || o.t === "myth")) { o.gone = true; o.burst = R.t; } });
    R.wave = 1; P.impact += 75;
  } else if (P.id === "ritika") {
    while (P.bag.length < 3) P.bag.push(pick(["water", "pain", "hu", "warm", "o2"]));
    near.forEach((r) => { if (r.bag.length < 3) { r.bag.push(pick(["water", "pain", "hu"])); P.impact += 50; } });
    updateBag(); sfx.crystal();
  } else if (P.id === "malcolm") {
    for (const r of [P, ...near]) { r.stun = 0; r.trapped = 0; r.slow = 0; if (r.ai) r.seq = 0; r.boost = Math.max(r.boost, 2); }
    if (P.seq > 0 && state === "race") { /* the spleen card still teaches; Team Heal can't skip it */ }
    P.impact += 50 * near.length;
  } else if (P.id === "tasha") { P.autoClear = 2; }
  else if (P.id === "krystal") {
    P.z = Math.min(TRACK_LEN - SEG, P.z + 15 * SEG); P.stun = 0; P.trapped = 0; R.blink = 1;
  } else if (P.id === "dr_kim") { P.shield = 1; }
  impactPop(); flash("rgba(255,194,61,.35)"); sfx.power();
  toast(`${W_.icon} ${W_.name}!`, 1500);
  warriorSay(P.id, "boost", true);
}
function updatePower() {
  const P = R.P, W_ = POWERS[P.id], b = $("power");
  b.querySelector("span").textContent = W_.icon;
  b.querySelector("small").textContent = "●".repeat(P.powers) + "○".repeat(2 - P.powers);
  b.classList.toggle("empty", P.powers < 1);
  b.setAttribute("aria-label", `${W_.name}: ${W_.text}`);
}

/* ================= UI bits ================= */
let toastT = 0;
function toast(t, ms = 1700) { const el = $("toast"); el.textContent = t; el.classList.remove("hidden"); el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), ms); }
let mythT = 0;
function showMyth(i) { const [m, t] = MYTHS[i % MYTHS.length]; const el = $("myth"); el.innerHTML = `<b>Society myth:</b> "${m}"<br><i>Truth:</i> ${t}`; el.classList.remove("hidden"); clearTimeout(mythT); mythT = setTimeout(() => el.classList.add("hidden"), 3400); }
function flash(col) { const f = $("flash"); f.style.background = col; f.style.opacity = 1; setTimeout(() => (f.style.opacity = 0), 160); }
function buildProgress() {
  const el = $("prog"), total = TRACK_LEN; let html = "";
  ZONES.forEach((Z, zi) => { const a = (ZONE_START[zi] * SEG) / total * 100, w = (Z.len * SEG) / total * 100; html += `<div class="seg" style="left:${a}%;width:${w}%"></div>`; });
  R.racers.forEach((r) => { html += `<div class="dot${r.ai ? "" : " me"}" data-id="${r.id}" style="background-image:url(img/faces/${r.id}.webp)"></div>`; });
  el.innerHTML = html;
}
function updateHud() {
  const P = R.P, sorted = [...R.racers].sort((a, b) => (a.finish ?? 1e9) - (b.finish ?? 1e9) || b.z - a.z);
  const pos = sorted.indexOf(P) + 1;
  $("pos").textContent = pos; $("posOf").textContent = `/${R.racers.length}`;
  R.pos = pos;
  for (const r of R.racers) {
    const d = $("prog").querySelector(`[data-id="${r.id}"]`);
    if (d) d.style.left = `${clamp(r.z / TRACK_LEN, 0, 1) * 100}%`;
  }
  const zi = segAt(P.z).zi; $("zoneName").textContent = ZONES[zi].name;
}

/* ================= physics ================= */
function stepRacer(r, dt) {
  const st = statMul(r.kart), seg = segAt(r.z), Z = ZONES[seg.zi];
  let target = MAXSPD * st.top;
  if (r.ai) {
    // rubber-banding keeps the pack close to the player
    const gap = r.z - R.P.z;
    target *= gap > 6000 ? 0.86 : gap > 2500 ? 0.94 : gap > 800 ? 0.985 : gap < -6000 ? 1.07 : 1.01;
    target *= r.skill;
  }
  if (!r.ai) target *= 1.02;
  if (r.boost > 0) { target *= 1.35; r.boost -= dt; }
  if (r.slow > 0) { target *= 0.55; r.slow -= dt; }
  if (r.stun > 0 || r.trapped > 0 || r.seq > 0) target = r.seq > 0 || r.trapped > 0 ? 0 : MAXSPD * 0.12;
  r.stun = Math.max(0, r.stun - dt); r.trapped = Math.max(0, r.trapped - dt);
  if (!r.ai) r.seq = r.seq; else r.seq = Math.max(0, r.seq - dt);
  if (r.finish != null) target = MAXSPD * 0.5;
  // off the road is sticky (vessel wall)
  if (Math.abs(r.x) > 1.05) target *= 0.55;
  const a = target > r.speed ? MAXSPD * 0.45 * st.acc : MAXSPD * 1.4;
  r.speed = r.speed < target ? Math.min(target, r.speed + a * dt) : Math.max(target, r.speed - a * dt);
  r.z += r.speed * dt;
  return { seg, Z, st };
}
function hitObjects(r, prevZ) {
  const s0 = Math.floor(prevZ / SEG), s1 = Math.floor(r.z / SEG);
  for (let i = s0; i <= s1; i++) {
    const s = SEGS[i]; if (!s) continue;
    for (const o of s.objs) {
      if (o.gone) continue;
      const half = (o.w + (r.kart === "platelet" ? 0.22 : 0.3)) / 2;
      if (Math.abs(r.x - o.x) > half) {
        if (!r.ai && o.t === "drone" && !o.passed) { o.passed = true; }
        continue;
      }
      onHit(r, o, s);
    }
  }
}
function onHit(r, o, s) {
  const P = R.P, me_ = r === P;
  if (me_ && (o.t === "voc" || o.t === "drone" || o.t === "myth") && !(o.hitBy && o.hitBy.has(r.id))) {
    if (P.bust > 0) { o.gone = true; o.burst = R.t; P.impact += 25; impactPop(); sfx.zap(); R.shake = 0.2; return; }
    if (P.shield > 0) { P.shield = 0; o.gone = true; o.burst = R.t; toast("🛡️ Shield blocked it!", 1200); sfx.zap(); return; }
    if (o.t === "voc" && P.autoClear > 0) { P.autoClear--; o.gone = true; o.burst = R.t; P.impact += 100; impactPop(); sfx.treat(); flash("rgba(93,255,160,.35)"); toast("✨ Tasha cleared the blockage! +100", 1400); return; }
  }
  if (o.t === "crystal") {
    const key = o; if (o.takenBy && o.takenBy.has(r.id)) return;
    (o.takenBy || (o.takenBy = new Set())).add(r.id);
    if (r.bag.length < 3) r.bag.push(o.type); else r.boost = Math.max(r.boost, 1.2);
    if (me_) {
      sfx.crystal(); updateBag();
      const C = CRYSTALS.find((c) => c.id === o.type);
      toast(`${C.icon} ${C.name} crystal!`, 1200);
      if (R.firstCrystal) { R.firstCrystal = false; mercySay("crystal"); }
    }
  } else if (o.t === "boost") {
    if (o.hitBy && o.hitBy.has(r.id)) return; (o.hitBy || (o.hitBy = new Set())).add(r.id);
    r.boost = Math.max(r.boost, 1.3);
    if (me_) { sfx.boost(); toast("Boost pad!", 900); }
  } else if (o.t === "voc") {
    if (o.hitBy && o.hitBy.has(r.id)) return; (o.hitBy || (o.hitBy = new Set())).add(r.id);
    if (r.ai) {
      // AI Warriors treat a blockage if they carry a crystal and react in time
      if (r.bag.length && Math.random() < 0.55) { r.bag.shift(); r.impact += 100; o.gone = true; o.burst = R.t; return; }
      r.stun = 0.9; r.speed *= 0.3; return;
    }
    const k = r.kart === "gene" ? 0.3 : r.kart === "hydroxyurea" ? 0.5 : r.kart === "glutamine" ? 0.7 : 1;
    r.stun = 0.8 * k; r.speed *= 0.45 + (1 - k) * 0.4; r.slow = 0.8 * k;
    R.shake = 0.5; sfx.hit(); flash("rgba(255,40,70,.45)");
    toast(r.kart === "gene" ? "Edited cells don't sickle! 🧬" : "Vaso-occlusion! Use a crystal!", 1500);
    warriorSay(r.id, "voc", true);
    if (R.firstVoc) { R.firstVoc = false; mercySay("voc", true); }
    if (navigator.vibrate) navigator.vibrate(60);
  } else if (o.t === "drone") {
    if (o.hitBy && o.hitBy.has(r.id)) return; (o.hitBy || (o.hitBy = new Set())).add(r.id);
    const t = (r.kart === "macrophage" ? 0.6 : r.kart === "tcell" ? 0.8 : 1.0) * (r.ai ? 1.3 : 1);
    r.trapped = t; r.trapT = t; r.speed *= 0.2;
    if (me_) {
      R.myths.add(o.myth);
      sfx.trap(); flash("rgba(255,30,50,.35)"); showMyth(o.myth); warriorSay(r.id, "trap", true);
      if (R.firstDrone) { R.firstDrone = false; mercySay("society", true); }
    }
  } else if (o.t === "myth") {
    if (o.hitBy && o.hitBy.has(r.id)) return; (o.hitBy || (o.hitBy = new Set())).add(r.id);
    if (r.kart === "bcell") { if (me_) toast("B-Cell antibodies! Myth blocked 🛡️", 1300); return; }
    r.slow = 0.6; r.speed *= 0.75;
    if (me_) { sfx.bump(); showMyth(o.myth); R.myths.add(o.myth); }
  }
}

function aiThink(r, dt) {
  r.think -= dt;
  if (r.think <= 0) {
    r.think = 0.25 + Math.random() * 0.3;
    // look ahead for trouble in this lane
    const s0 = Math.floor(r.z / SEG);
    let danger = false;
    for (let i = s0 + 2; i < s0 + 14; i++) {
      const s = SEGS[i]; if (!s) break;
      for (const o of s.objs) if (!o.gone && (o.t === "voc" || o.t === "drone" || o.t === "myth") && Math.abs(o.x - r.lane) < 0.4) danger = true;
      for (const o of s.objs) if (!o.gone && o.t === "crystal" && Math.random() < 0.15) r.lane = o.x;
    }
    if (danger && Math.random() < r.dodge) {
      const lanes = [laneX(0), laneX(1), laneX(2)].filter((x) => Math.abs(x - r.lane) > 0.3);
      r.lane = pick(lanes);
    } else if (Math.random() < 0.04) r.lane = laneX(Math.floor(Math.random() * 3));
    // splenic sequestration can catch AI Warriors too
    const Z = ZONES[segAt(r.z).zi];
    if (Z.id === "spleen" && !r.seqDone && Math.random() < 0.012) { r.seqDone = true; r.seq = 2.2 + Math.random() * 1.5; }
    // AI Warriors also boost now and then
    if (r.bag.length > 1 && Math.random() < 0.05) { r.bag.shift(); r.boost = 1.6; r.impact += 10; }
  }
  r.x = lerp(r.x, r.lane, Math.min(1, dt * 2.2));
}

function sharing(dt) {
  R.shareCool -= dt;
  const P = R.P;
  for (const r of R.racers) {
    if (!r.ai) continue;
    const near = Math.abs(r.z - P.z) < 420 && Math.abs(r.x - P.x) < 0.6;
    r.nearT = near ? r.nearT + dt : 0;
    if (r.nearT > 0.7 && R.shareCool <= 0) {
      r.nearT = 0;
      const canGive = r.bag.length > 0 && P.bag.length < 3, canGet = P.bag.length > 0 && r.bag.length === 0;
      if (!canGive && !canGet) continue;
      R.shareCool = 14;
      const giveToMe = canGive && (!canGet || Math.random() < 0.6);
      if (giveToMe) {
        const t = r.bag.splice(Math.floor(Math.random() * r.bag.length), 1)[0];
        P.bag.push(t); r.impact += 50;
        const C = CRYSTALS.find((c) => c.id === t);
        toast(`${r.name} shared ${C.icon} ${C.name} with you!`, 2200);
        warriorSay(r.id, "share", true);
      } else {
        const t = P.bag.splice(Math.floor(Math.random() * P.bag.length), 1)[0];
        r.bag.push(t); P.impact += 50; impactPop(50);
        const C = CRYSTALS.find((c) => c.id === t);
        toast(`You shared ${C.icon} ${C.name} with ${r.name}! +50`, 2200);
        warriorSay(P.id, "share", true);
      }
      sfx.share(); updateBag();
      if (!R.mercySaid.has("share")) setTimeout(() => mercySay("share"), 2400);
      break;
    }
  }
}

function sequestrationCheck(dt) {
  const P = R.P, Z = ZONES[segAt(P.z).zi];
  if (Z.id !== "spleen" || P.seqDone || P.finish != null) return;
  const into = (P.z / SEG - ZONE_START[ZONES.indexOf(Z)]) / Z.len;
  // can happen any time in the spleen; it is certain by the last quarter
  if (Math.random() < dt * 0.06 || into > 0.75) {
    P.seqDone = true; P.seq = 99; P.speed = 0;
    sfx.trap(); flash("rgba(176,76,255,.45)");
    warriorSay(P.id, "stuck", true);
    mercySay("seq", true);
    setTimeout(() => showCard(), 900);
  }
}

/* ================= Warrior Card: escape the spleen ================= */
function showCard() {
  state = "card";
  const c = nextCard(), P = R.P;
  $("cardP").innerHTML = `<div class="card-h"><img src="img/mercy_face.webp" alt=""><div><span class="tag">Splenic sequestration</span><h2>Stuck in the spleen!</h2></div></div>
    <p class="fact" style="margin:0 0 4px">Sickled cells got trapped in the spleen's filter. Answer this Warrior Card to break free.</p>
    <div class="q">${c.q}</div><div class="ans">${c.a.map((a, i) => `<button data-i="${i}">${a}</button>`).join("")}</div><p id="verdict" class="verdict"></p>`;
  $("card").classList.remove("hidden");
  $("cardP").querySelectorAll(".ans button").forEach((b) => b.addEventListener("click", () => {
    const i = +b.dataset.i, ok = i === c.c;
    $("cardP").querySelectorAll(".ans button").forEach((q) => { q.disabled = true; if (+q.dataset.i === c.c) q.classList.add("ok"); });
    if (!ok) b.classList.add("no");
    $("verdict").innerHTML = ok ? "<b>Correct!</b> You broke free with a burst of speed. +75 impact" : `Not quite. The answer is <b>${c.a[c.c]}</b>. Getting help takes a moment…`;
    if (ok) { sfx.good(); P.impact += 75; impactPop(75); R.correct++; post({ type: "bonus", correct: true }); }
    else sfx.bad();
    setTimeout(() => {
      $("card").classList.add("hidden"); state = "race"; last = performance.now();
      P.seq = 0;
      if (ok) { P.boost = 2; warriorSay(P.id, "boost", true); } else { P.trapped = 2.2; }
    }, ok ? 1400 : 2600);
  }));
}

/* ================= main update ================= */
function update(dt) {
  R.t += dt;
  const P = R.P;
  // steering
  const st = statMul(P.kart);
  const steer = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  R.steer = lerp(R.steer, steer, Math.min(1, dt * 10));
  const sf = P.speed / MAXSPD;
  if (P.seq <= 0 && P.trapped <= 0) {
    P.x += R.steer * dt * 2.1 * st.hnd * (0.35 + sf * 0.65);
    // let go and the kart glides into the centre of a lane
    if (!steer && R.laneT != null) P.x = lerp(P.x, laneX(R.laneT), Math.min(1, dt * (3 + st.hnd)));
  }
  // curves push the kart outward
  const seg = segAt(P.z);
  P.x -= dt * sf * seg.curve * 0.32;
  P.x = clamp(P.x, -1.6, 1.6);

  const prevZ = P.z;
  stepRacer(P, dt);
  hitObjects(P, prevZ);

  for (const r of R.racers) {
    if (!r.ai) continue;
    const pz = r.z; aiThink(r, dt); stepRacer(r, dt); hitObjects(r, pz);
    // bumping into the player
    if (Math.abs(r.z - P.z) < 160 && Math.abs(r.x - P.x) < 0.38) {
      const push = Math.sign(P.x - r.x || 1) * 0.22; P.x += push; r.x -= push * 0.6; P.speed *= 0.97; if (Math.random() < 0.2) sfx.bump();
    }
  }
  sharing(dt);
  sequestrationCheck(dt);
  stepShots(dt);
  P.bust = Math.max(0, P.bust - dt);
  R.wave = Math.max(0, R.wave - dt * 1.5); R.blink = Math.max(0, R.blink - dt * 2.5);

  // warn about blockages ahead
  const ahead = vocAhead(P, 18);
  $("treat").classList.toggle("urgent", !!(ahead && P.bag.length) || (P.stun > 0 && P.bag.length > 0));

  // zone changes: Mercy teaches what is around the Warriors
  const zi = seg.zi;
  if (zi !== R.zone) {
    R.zone = zi; const Z = ZONES[zi];
    if (Z.mercy[0]) mercySay(Z.mercy[0]);
    if (Z.mercy[1]) setTimeout(() => R && R.zone === zi && mercySay(Z.mercy[1]), 14000);
  }
  // heart beats and lungs breathe
  const zid = ZONES[zi].id;
  if (zid === "heartR" || zid === "heartL") { R.beatT -= dt; if (R.beatT <= 0) { R.beatT = 0.85; sfx.beat(); R.pulse = 1; } }
  if (zid === "lung") { R.breathT -= dt; if (R.breathT <= 0) { R.breathT = 3.6; sfx.breath(); } }
  R.pulse = Math.max(0, (R.pulse || 0) - dt * 3);

  // place callouts
  R.posSaid -= dt;
  if (R.posSaid <= 0 && R.t > 20) {
    if (R.pos === 1) { mercySay("lead"); R.posSaid = 60; }
    else if (R.pos >= 6) { mercySay("behind"); R.posSaid = 60; }
    else R.posSaid = 8;
  }
  // AI passes the player: an occasional cheeky comment
  for (const r of R.racers) {
    if (!r.ai) continue;
    const wasBehind = r.lastRel < 0, isAhead = r.z > P.z;
    if (wasBehind && isAhead && Math.random() < 0.3) warriorSay(r.id, "pass");
    r.lastRel = r.z - P.z;
  }
  if (P.z - prevZ > 0 && Math.random() < 0.002 && P.boost <= 0) { /* idle */ }

  // finish line
  for (const r of R.racers) if (r.finish == null && r.z >= TRACK_LEN) {
    r.finish = R.t;
    if (r === P) {
      sfx.win(); warriorSay(P.id, "win", true);
      const place = R.racers.filter((q) => q.finish != null).length;
      mercySay(place === 1 ? "finish1" : "finish", true);
      post({ type: "level" });
      R.endT = 4.5;
    }
  }
  if (P.finish != null) { R.endT -= dt; if (R.endT <= 0) showResults(); }

  if (P.finish == null) engineSet(Math.min(1.4, P.speed / MAXSPD), true);
  else engineSet(0.2, R.endT > 2.5);
  R.shake = Math.max(0, R.shake - dt);
  updateHud();
}

/* ================= rendering ================= */
let PITCH = 0;
function project(p, camX, camY, camZ) {
  const tx = p.x - camX, tz = p.z - camZ, ty = p.y - camY - PITCH * (tz - CAM_BACK); // pivot on the player so the kart stays planted
  const sc = CAM_DEPTH / tz;
  return { x: Math.round(W / 2 + sc * tx * W / 2), y: Math.round(H / 2 - sc * ty * H / 2), w: Math.round(sc * ROAD * W / 2), sc };
}
function poly(x1, y1, x2, y2, x3, y3, x4, y4, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.lineTo(x4, y4); ctx.closePath(); ctx.fill(); }

// One complete panoramic scene per organ (never tiled). It drifts a little as the
// road curves, like turning your head, and settles back toward the centre.
function drawBackdrop(zi, blendNext) {
  const horizon = H * 0.48;
  const draw = (Z, alpha) => {
    const im = img(Z.bg); if (!ready(im)) return;
    const asp = im.naturalWidth / im.naturalHeight;
    let w = W * 1.35, h = w / asp;
    const vp = Z.vp || 0.55;
    if (h * vp < horizon + 10) { h = (horizon + 10) / vp; w = h * asp; }
    const slack = (w - W) / 2;
    const off = R ? clamp(R.bgX, -slack, slack) : 0;
    const x = (W - w) / 2 - off, y = horizon - h * vp + (R ? R.pulse * 6 * DPR : 0);
    ctx.globalAlpha = alpha; ctx.drawImage(im, x, y, w, h); ctx.globalAlpha = 1;
  };
  const Z = ZONES[zi];
  ctx.fillStyle = Z.fog; ctx.fillRect(0, 0, W, H);
  draw(Z, 1);
  if (blendNext && blendNext.a > 0) draw(ZONES[blendNext.zi], blendNext.a);
}

/* textured ground and road: each strip is drawn in thin bands, each band maps
   the organ texture with perspective-correct depth so the floor feels solid */
const patCache = {};
function pat(src) {
  if (window.__noTex) return null;
  const im = img(src); if (!ready(im)) return null;
  return patCache[src] || (patCache[src] = { p: ctx.createPattern(im, "repeat"), w: im.naturalWidth, h: im.naturalHeight });
}
const GROUND_Z = ROAD * 1.3, ROAD_Z = ROAD * 1.4, BAND = 4;
const _m = typeof DOMMatrix !== "undefined" ? new DOMMatrix() : null;
function setPat(P, kx, ky, e, f) { _m.a = kx; _m.b = 0; _m.c = 0; _m.d = ky; _m.e = e; _m.f = f; P.p.setTransform(_m); ctx.fillStyle = P.p; }
function texStrip(s, p1, p2, z1, z2, top, bottom, Z) {
  const G = _m && pat(Z.ground), RD = _m && pat("img/ground/road.webp");
  if (!G || !RD) return false;
  const y1 = p1.y, y2 = p2.y, span = y1 - y2;
  const n = Math.max(1, Math.ceil((bottom - top) / (BAND * DPR)));
  const gv = G.h / GROUND_Z, rv = RD.h / ROAD_Z;
  const gBase = Math.floor(z1 * gv / G.h) * G.h, rBase = Math.floor(z1 * rv / RD.h) * RD.h;
  for (let k = 0; k < n; k++) {
    const ya = top + (bottom - top) * k / n, yb = top + (bottom - top) * (k + 1) / n;
    const ta = (ya - y2) / span, tb = (yb - y2) / span, tm = (ta + tb) / 2;
    // perspective-correct depth at the band's top and bottom
    const za = lerp(z2 * p2.sc, z1 * p1.sc, ta) / lerp(p2.sc, p1.sc, ta);
    const zb = lerp(z2 * p2.sc, z1 * p1.sc, tb) / lerp(p2.sc, p1.sc, tb);
    const xc = lerp(p2.x, p1.x, tm), w = lerp(p2.w, p1.w, tm), hb = yb - ya + 0.6;
    // organ tissue all the way to the edges of the screen
    let va = za * gv - gBase, vb = zb * gv - gBase, ky = (yb - ya) / (vb - va || 1e-3), kx = 2.6 * w / G.w;
    setPat(G, kx, ky, xc - 1.3 * w, ya - ky * va); ctx.fillRect(0, ya, W, hb);
    // the road: the glossy floor of a blood vessel
    va = za * rv - rBase; vb = zb * rv - rBase; ky = (yb - ya) / (vb - va || 1e-3); kx = 2 * w / RD.w;
    setPat(RD, kx, ky, xc - w, ya - ky * va); ctx.globalAlpha = 0.55; ctx.fillRect(xc - w, ya, 2 * w, hb); ctx.globalAlpha = 1;
  }
  return true;
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (!R) { ctx.fillStyle = "#12040e"; ctx.fillRect(0, 0, W, H); return; }
  const P = R.P;
  const base = segAt(P.z), basePct = (P.z % SEG) / SEG;
  const camZ = P.z; // camera sits CAM_BACK behind the player
  const playerY = lerp(base.p1.y, base.p2.y, basePct);
  const camY = playerY + CAM_H;
  // look along the slope ahead (like a real camera following the road)
  const a = SEGS[base.i], b = SEGS[Math.min(SEGS.length - 1, base.i + 14)];
  const ahead = (b.p2.y - a.p1.y) / (b.p2.z - a.p1.z);
  R.pitch = lerp(R.pitch || 0, ahead * 0.8, 0.08); PITCH = R.pitch;
  // backdrop drifts with the curves
  R.bgX = R.bgX * 0.985 + base.curve * (P.speed / MAXSPD) * 6 * DPR;
  // blend into the next zone's backdrop near a boundary
  const zi = base.zi, nextStart = ZONE_START[zi + 1];
  let blend = null;
  if (nextStart != null) { const d = nextStart - base.i; if (d < 60) blend = { zi: zi + 1, a: 1 - d / 60 }; }
  if (R.shake > 0) ctx.translate((Math.random() - 0.5) * 12 * DPR * R.shake, (Math.random() - 0.5) * 8 * DPR * R.shake);
  drawBackdrop(zi, blend);

  let maxy = H, x = 0, dx = -(base.curve * basePct);
  const lanesW = 0.03;
  const drawn = [];
  for (let n = 0; n < DRAW; n++) {
    const s = SEGS[base.i + n];
    if (!s) break;
    const Z = ZONES[s.zi];
    const camX = P.x * ROAD;
    const p1 = project({ x: x, y: s.p1.y, z: s.p1.z }, camX, camY, camZ - CAM_BACK);
    const p2 = project({ x: x + dx, y: s.p2.y, z: s.p2.z }, camX, camY, camZ - CAM_BACK);
    s.clip = maxy; s.p1s = p1; s.p2s = p2;
    x += dx; dx += s.curve;
    if (p1.sc <= 0 || p2.y >= maxy || p2.y >= p1.y) continue;
    const alt = Math.floor(s.i / 3) % 2;
    const fog = Math.min(1, n / DRAW);
    const bottom = Math.min(p1.y, maxy), top = p2.y;
    const textured = texStrip(s, p1, p2, s.p1.z, s.p2.z, top, bottom, Z);
    const r1 = p1.w / 11, r2 = p2.w / 11;
    if (!textured) {
      ctx.fillStyle = Z.side[alt]; ctx.fillRect(0, p2.y, W, p1.y - p2.y);
      poly(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, Z.road[alt]);
    } else {
      // a light zone tint on the road and alternating shade for a sense of speed
      ctx.globalAlpha = 0.8; poly(p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, Z.road[alt]);
      if (alt) { ctx.globalAlpha = 0.07; ctx.fillStyle = "#000"; ctx.fillRect(0, top, W, bottom - top); }
      ctx.globalAlpha = 1;
    }
    // the vessel wall: a raised glossy edge on both sides of the road
    ctx.globalAlpha = 1;
    poly(p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y, Z.rumble[alt]);
    poly(p1.x + p1.w + r1, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x + p2.w + r2, p2.y, Z.rumble[alt]);
    ctx.globalAlpha = 1;
    if (alt) {
      ctx.globalAlpha = 0.9;
      for (let l = 1; l < LANES; l++) {
        const f = -1 + (2 * l) / LANES, lw1 = p1.w * lanesW, lw2 = p2.w * lanesW;
        poly(p1.x + f * p1.w - lw1, p1.y, p1.x + f * p1.w + lw1, p1.y, p2.x + f * p2.w + lw2, p2.y, p2.x + f * p2.w - lw2, p2.y, Z.lane);
      }
      ctx.globalAlpha = 1;
    }
    if (fog > 0.45) { ctx.globalAlpha = (fog - 0.45) / 0.55 * 0.7; ctx.fillStyle = Z.fog; ctx.fillRect(0, p2.y, W, p1.y - p2.y); ctx.globalAlpha = 1; }
    maxy = p2.y;
    drawn.push(s);
  }
  // a soft haze where the floor meets the scene, so there is no hard line
  if (maxy < H) {
    const hz = 26 * DPR, g = ctx.createLinearGradient(0, maxy - hz, 0, maxy + hz), fc = ZONES[zi].fog;
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(0.5, fc); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.75; ctx.fillStyle = g; ctx.fillRect(0, maxy - hz, W, hz * 2); ctx.globalAlpha = 1;
  }
  // sprites and racers, back to front
  const racersBySeg = new Map();
  for (const r of R.racers) { if (r === P) continue; const i = Math.floor(r.z / SEG); if (!racersBySeg.has(i)) racersBySeg.set(i, []); racersBySeg.get(i).push(r); }
  for (let k = drawn.length - 1; k >= 0; k--) {
    const s = drawn[k], p = s.p1s;
    for (const d of s.sprites) drawDeco(d, s, p);
    for (const o of s.objs) drawObj(o, s, p);
    const rs = racersBySeg.get(s.i);
    if (rs) for (const r of rs) drawRacer(r, s);
  }
  drawShots();
  drawPlayer();
  drawPowerFx();
  // speed lines while boosting
  if (P.boost > 0) {
    ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.lineWidth = 2 * DPR;
    for (let i = 0; i < 14; i++) { const a = Math.random() * Math.PI * 2, r0 = H * 0.35, r1 = r0 + H * 0.4; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0, H * 0.48 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1, H * 0.48 + Math.sin(a) * r1); ctx.stroke(); }
  }
  // vignette: we're inside a vessel
  const g = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.35, W / 2, H * 0.55, W * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, ZONES[zi].id === "lung" ? "rgba(10,20,50,.45)" : "rgba(20,0,8,.6)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function spriteAt(im, s, xFrac, wFrac, yOff = 0, clip = true, alpha = 1, rot = 0) {
  // place a sprite on segment s at road position xFrac (-1..1 is the road), width as a fraction of road width
  const p = s.p1s; if (!p || p.sc <= 0) return null;
  const w = p.w * wFrac, h = w * (im.height || im.naturalHeight) / (im.width || im.naturalWidth);
  const x = p.x + p.w * xFrac - w / 2, y = p.y - h - yOff * p.sc * H / 2;
  if (clip && y > s.clip) return null;
  ctx.save();
  if (clip) { ctx.beginPath(); ctx.rect(0, 0, W, s.clip); ctx.clip(); }
  ctx.globalAlpha = alpha;
  if (rot) { ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot); ctx.drawImage(im, -w / 2, -h / 2, w, h); }
  else ctx.drawImage(im, x, y, w, h);
  ctx.restore();
  return { x, y, w, h };
}
function drawDeco(d, s) {
  if (d.kind === "arch") { const im = img("img/obj/arch.webp"); if (ready(im)) spriteAt(im, s, 0, 2.6, 0); return; }
  const im = cellImg(d.kind); if (!ready(im)) return;
  const Z = ZONES[s.zi];
  const spinning = d.kind !== "o2" && d.kind !== "macro";
  const rot = spinning ? d.rot + (R ? R.t * d.spin : 0) : Math.sin((R ? R.t : 0) * 1.5 + d.rot) * 0.15;
  const pulse = Z.beat ? 1 + (R.pulse || 0) * 0.12 : 1;
  const bob = Math.sin((R ? R.t : 0) * 1.2 + d.rot * 3) * 80;
  const box = spriteAt(im, s, d.x, 0.32 * d.s * pulse, d.y + bob, true, 1, rot);
  if (!box) return;
  // learning: big nearby cells get a name tag, and the first of each kind is introduced
  if (box.w > 70 * DPR && box.y + box.h < s.clip && box.x > 0 && box.x + box.w < W) {
    if (d.label) {
      const name = CELLS[d.kind][0];
      ctx.font = `${Math.round(12 * DPR)}px "Atkinson Hyperlegible",sans-serif`; ctx.textAlign = "center";
      const tw = ctx.measureText(name).width + 12 * DPR, cx = box.x + box.w / 2, ty = box.y + box.h + 4 * DPR;
      ctx.fillStyle = "rgba(8,20,34,.78)"; ctx.fillRect(cx - tw / 2, ty, tw, 17 * DPR);
      ctx.fillStyle = "#bff6ff"; ctx.fillText(name, cx, ty + 12.5 * DPR);
    }
    if (box.w > 110 * DPR) spotCell(d.kind);
  }
}
function drawObj(o, s) {
  if (o.gone) {
    if (o.burst != null && R.t - o.burst < 0.6) {
      // the jam breaks up into healthy round cells
      const k = (R.t - o.burst) / 0.6, c = cellImg("rbc");
      if (ready(c)) for (let i = 0; i < 6; i++) spriteAt(c, s, o.x + Math.cos(i) * k * 0.8, 0.14, 200 + Math.sin(i * 2) * k * 600, true, 1 - k, i);
    }
    return;
  }
  if (o.t === "crystal" && o.takenBy && o.takenBy.has(R.P.id)) return;
  const name = { crystal: "crystal", boost: "boost", voc: "voc", drone: "drone", myth: "myth" }[o.t];
  const im = img(`img/obj/${name}.webp`); if (!ready(im)) return;
  const bob = o.t === "crystal" ? 120 + Math.sin(R.t * 4 + s.i) * 60 : o.t === "drone" ? 650 + Math.sin(R.t * 2 + s.i) * 90 : 0;
  const w = { crystal: 0.22, boost: 0.42, voc: 0.5, drone: 0.62, myth: 0.3 }[o.t];
  const rot = o.t === "myth" ? R.t * 3 : o.t === "drone" ? Math.sin(R.t * 2.3 + s.i) * 0.06 : 0;
  // Society drones paint a red target on their lane
  if (o.t === "drone") {
    const p = s.p1s; ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, s.clip); ctx.clip();
    const cx = p.x + p.w * o.x, rx = p.w * 0.24, ry = p.w * 0.055, blink = 0.35 + 0.25 * Math.sin(R.t * 10);
    ctx.strokeStyle = `rgba(255,40,60,${blink + 0.2})`; ctx.lineWidth = Math.max(1, p.w * 0.008);
    ctx.fillStyle = `rgba(255,20,40,${blink * 0.4})`;
    ctx.beginPath(); ctx.ellipse(cx, p.y, rx, ry, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, p.y, rx * 0.5, ry * 0.5, 0, 0, 7); ctx.stroke();
    ctx.restore();
  }
  if (o.t === "drone" || o.t === "voc") { ctx.save(); ctx.shadowColor = o.t === "drone" ? "rgba(255,70,90,.95)" : "rgba(255,120,140,.8)"; ctx.shadowBlur = 16 * DPR; }
  spriteAt(im, s, o.x, w, bob, true, 1, rot);
  if (o.t === "drone" || o.t === "voc") ctx.restore();
}
// The Society's red laser net: beams fan down from the drone and a glowing mesh closes over the kart
function laserNet(cx, by, w, k, droneY) {
  const t = R.t, top = droneY, domeH = w * 0.85, x0 = cx - w * 0.58, x1 = cx + w * 0.58, baseY = by - w * 0.02;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const flick = 0.75 + Math.random() * 0.25;
  const line = (ax, ay, bx, by_, lw, a) => { ctx.strokeStyle = `rgba(255,40,60,${a * flick})`; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by_); ctx.stroke(); };
  // beams from the emitter to the net's corners
  for (const [bx, a] of [[x0, 0.5], [x1, 0.5], [cx, 0.35]]) { line(cx, top, bx, baseY, 6 * DPR, a * 0.35); line(cx, top, bx, baseY, 2 * DPR, a); }
  // the dome mesh
  const rows = 5, cols = 9;
  ctx.shadowColor = "#ff2040"; ctx.shadowBlur = 10 * DPR;
  for (let r = 0; r <= rows; r++) {
    const sc = r / rows; ctx.strokeStyle = `rgba(255,${60 + 80 * Math.sin(t * 12 + r)},80,${0.75 * flick * k})`; ctx.lineWidth = 2 * DPR;
    ctx.beginPath(); ctx.ellipse(cx, baseY, w * 0.58 * Math.cos(sc * Math.PI / 2) + 1, domeH * Math.cos(sc * Math.PI / 2) * 0.15 + 1, 0, Math.PI, 0); ctx.stroke();
  }
  for (let c = 0; c <= cols; c++) {
    const u = c / cols, ang = Math.PI * (1 - u), ex = cx + Math.cos(ang) * w * 0.58;
    ctx.strokeStyle = `rgba(255,50,70,${0.8 * flick * k})`; ctx.lineWidth = 2 * DPR;
    ctx.beginPath(); ctx.moveTo(ex, baseY); ctx.quadraticCurveTo(ex, baseY - domeH * 0.9, cx, baseY - domeH); ctx.stroke();
  }
  // scanning ring
  const sy = baseY - domeH * (0.5 + 0.5 * Math.sin(t * 5));
  ctx.strokeStyle = `rgba(255,200,210,${0.6 * k})`; ctx.lineWidth = 1.5 * DPR;
  ctx.beginPath(); ctx.ellipse(cx, sy, w * 0.4, w * 0.05, 0, 0, 7); ctx.stroke();
  ctx.restore();
}
function kartAndDriver(r, cx, by, w, tilt = 0, alpha = 1) {
  const K = KART[r.kart], kim = img(`img/karts/${r.kart}.webp`), dim = img(`img/drivers/${r.id}.webp`);
  if (!ready(kim)) return;
  const h = w * kim.naturalHeight / kim.naturalWidth, x = cx - w / 2, y = by - h;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.translate(cx, by); ctx.rotate(tilt); ctx.translate(-cx, -by);
  // shadow
  ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.ellipse(cx, by - h * 0.04, w * 0.48, h * 0.08, 0, 0, 7); ctx.fill();
  ctx.drawImage(kim, x, y, w, h);
  if (ready(dim)) {
    const dw = w * Math.max(K.seat[2], 0.28) * 1.05, dh = dw * dim.naturalHeight / dim.naturalWidth;
    ctx.drawImage(dim, x + K.seat[0] * w - dw / 2, y + K.seat[1] * h + K.seat[2] * w * 0.25 - dh, dw, dh);
  }
  ctx.restore();
}
function drawRacer(r, s) {
  const p = s.p1s; if (!p || p.sc <= 0) return;
  const w = p.w * KART_W, cx = p.x + p.w * r.x, by = p.y;
  if (by - w > s.clip) return;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, s.clip); ctx.clip();
  kartAndDriver(r, cx, by, w, 0);
  // name tag
  if (w > 40 * DPR) {
    ctx.font = `${Math.round(11 * DPR)}px "Lilita One",sans-serif`; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,.55)"; const tw = ctx.measureText(r.name).width + 10 * DPR;
    ctx.fillRect(cx - tw / 2, by - w * 0.95 - 14 * DPR, tw, 15 * DPR);
    ctx.fillStyle = r.color; ctx.fillText(r.name, cx, by - w * 0.95 - 3 * DPR);
  }
  if (r.trapped > 0) laserNet(cx, by, w, Math.min(1, r.trapped * 3), by - w * 1.6);
  if (r.seq > 0) { ctx.font = `${Math.round(18 * DPR)}px sans-serif`; ctx.fillText("🌀", cx, by - w * 1.05 - 16 * DPR); }
  ctx.restore();
}
// glowing bursts of fluid flying up the lane
function drawShots() {
  for (const sh of R.shots) {
    const sg = SEGS[Math.floor(sh.z / SEG)];
    if (!sg || !sg.p1s || sg.p1s.sc <= 0) continue;
    const p = sg.p1s, x = p.x + p.w * sh.x, y = p.y - p.w * 0.16, r = Math.max(3 * DPR, p.w * 0.07);
    if (y > (sg.clip || H) + r) continue;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.3, "rgba(94,231,255,.95)"); g.addColorStop(1, "rgba(94,231,255,0)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 7); ctx.fill();
    // a short trail back toward the kart
    ctx.strokeStyle = "rgba(94,231,255,.5)"; ctx.lineWidth = r * 0.9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, W / 2 + (sh.x - R.P.x) * W * 0.3, 0.25), lerp(y, H * 0.9, 0.25)); ctx.stroke();
    ctx.restore();
  }
}
function drawPowerFx() {
  const P = R.P, roadW = (CAM_DEPTH / CAM_BACK) * ROAD * W / 2, w = Math.min(roadW * KART_W, H * (H < 700 * DPR ? 0.37 : 0.42)), cx = W / 2, cy = H * 0.985 - w * 0.45;
  ctx.save();
  if (P.shield > 0) {
    // Dr. Kim's shield bubble
    const g = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.7);
    g.addColorStop(0, "rgba(94,231,255,0)"); g.addColorStop(0.85, "rgba(94,231,255,.22)"); g.addColorStop(1, "rgba(200,250,255,.65)");
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.72, w * 0.62, 0, 0, 7); ctx.fill();
  }
  if (P.bust > 0) {
    ctx.globalCompositeOperation = "lighter";
    const a = 0.35 + 0.25 * Math.sin(R.t * 20);
    const g = ctx.createRadialGradient(cx, cy - w * 0.2, 0, cx, cy - w * 0.2, w * 0.9);
    g.addColorStop(0, `rgba(255,194,61,${a})`); g.addColorStop(1, "rgba(255,120,40,0)");
    ctx.fillStyle = g; ctx.fillRect(cx - w, cy - w * 1.2, w * 2, w * 1.6);
  }
  if (R.wave > 0) {
    // Luciana's shockwave racing up the road
    const k = 1 - R.wave; ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = `rgba(255,140,200,${R.wave})`; ctx.lineWidth = 10 * DPR * R.wave;
    ctx.beginPath(); ctx.ellipse(W / 2, H * 0.6 - k * H * 0.12, W * (0.25 + k * 0.6), H * (0.08 + k * 0.1), 0, 0, 7); ctx.stroke();
  }
  if (R.blink > 0) {
    // Krystal's teleport flash
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(200,140,255,${R.blink * 0.6})`; ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}
function drawPlayer() {
  const P = R.P, roadW = (CAM_DEPTH / CAM_BACK) * ROAD * W / 2, w = Math.min(roadW * KART_W, H * (H < 700 * DPR ? 0.37 : 0.42)), cx = W / 2, by = H * 0.985;
  const bounce = Math.sin(R.t * 18) * (P.speed / MAXSPD) * 2 * DPR;
  const tilt = R.steer * 0.06;
  // boost flames
  if (P.boost > 0) {
    const g = ctx.createRadialGradient(cx, by - w * 0.05, 0, cx, by - w * 0.05, w * 0.45);
    g.addColorStop(0, "rgba(255,255,200,.9)"); g.addColorStop(0.4, "rgba(93,255,160,.5)"); g.addColorStop(1, "rgba(93,255,160,0)");
    ctx.fillStyle = g; ctx.fillRect(cx - w * 0.6, by - w * 0.5, w * 1.2, w * 0.6);
  }
  kartAndDriver(P, cx, by + bounce, w, tilt);
  if (P.trapped > 0) {
    // the drone hovers over you while its laser net holds you
    const im = img("img/obj/drone.webp"), k = Math.min(1, P.trapped * 3);
    const dw = w * 0.95, dh = ready(im) ? dw * im.naturalHeight / im.naturalWidth : dw * 0.75;
    const dy = Math.max(4 * DPR, by - w * 1.05 - dh) + Math.sin(R.t * 3) * 4 * DPR;
    if (ready(im)) { ctx.globalAlpha = k; ctx.drawImage(im, cx - dw / 2, dy, dw, dh); ctx.globalAlpha = 1; }
    laserNet(cx, by, w, k, dy + dh * 0.93);
  }
  if (P.stun > 0) { ctx.font = `${Math.round(28 * DPR)}px sans-serif`; ctx.textAlign = "center"; ctx.fillText("💥", cx + Math.sin(R.t * 20) * 10, by - w * 0.8); }
}

/* ================= loop ================= */
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (state === "race" && R) update(dt);
  else if (state === "count" && R) { R.t += 0; }
  if (state === "race" || state === "count" || state === "card" || state === "pause") render();
  else if (state === "results") render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ================= screens ================= */
// Title → Warrior → ride → intro film (skippable) → countdown → race
const SCREENS = ["title", "pickW", "pickK", "film", "card", "pause", "results"];
function show(id) {
  SCREENS.forEach((s) => $(s).classList.toggle("hidden", s !== id));
  $("hud").classList.toggle("hidden", !["race", "count", "card", "pause"].includes(id) && id !== "hud");
}
function go(id) {
  sfx.tap();
  if (id === "pickW") buildWarriors();
  if (id === "pickK") buildKarts();
  state = id; show(id); engineStop();
  if (id === "title") showBest();
}
document.querySelectorAll("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));
document.querySelectorAll("[data-exit]").forEach((b) => b.addEventListener("click", () => { music.pause(); engineStop(); post({ type: "exit" }); if (!EMBED) go("title"); }));
$("playBtn").addEventListener("click", () => { audioInit(); go("pickW"); });
$("introBtn").addEventListener("click", () => { audioInit(); playFilm(() => go("title")); });
$("trackBtn").addEventListener("click", () => { sfx.tap(); setTrack(opts.track === "theme" ? "race" : "theme"); });
document.querySelectorAll("[data-track]").forEach((b) => b.addEventListener("click", () => { sfx.tap(); setTrack(b.dataset.track); }));

function showBest() {
  const b = store.get("wt-race-best", null);
  $("best").textContent = b ? `Your best: ${ordinal(b.place)} place · ${b.impact} impact` : "";
}
const ordinal = (n) => n + (["th", "st", "nd", "rd"][(n % 100 > 10 && n % 100 < 14) ? 0 : n % 10] || "th");

// step 1: the Warrior
function buildWarriors() {
  $("warriors").innerHTML = WARRIORS.map((w) => `<button class="w-card${w.id === me.warrior ? " on" : ""}" data-w="${w.id}" style="--wc:${w.color}"><img src="img/faces/${w.id}.webp" alt=""><b>${w.name}</b></button>`).join("");
  $("warriors").querySelectorAll("[data-w]").forEach((b) => b.addEventListener("click", () => {
    me.warrior = b.dataset.w; store.set("wt-race-warrior", me.warrior); sfx.tap(); warriorSay(me.warrior, "go", true); buildWarriors();
  }));
  const W_ = WARRIORS.find((w) => w.id === me.warrior);
  $("pwFace").src = `img/faces/${W_.id}.webp`;
  $("pwFace").parentElement.style.setProperty("--wc", W_.color);
  $("pwName").textContent = W_.name;
  const Pw = POWERS[W_.id];
  $("pwPowIcon").textContent = Pw.icon; $("pwPowName").textContent = Pw.name; $("pwPowText").textContent = Pw.text;
}
$("toKart").addEventListener("click", () => go("pickK"));

// step 2: the ride
function buildKarts() {
  $("karts").innerHTML = KARTS.map((k) => `<button class="k-chip${k.id === me.kart ? " on" : ""}${k.id === "gene" ? " gene" : ""}" data-k="${k.id}"><img src="img/karts/${k.id}.webp" alt=""><span>${k.name}</span><span class="tag">${k.tag}</span></button>`).join("");
  $("karts").querySelectorAll("[data-k]").forEach((b) => b.addEventListener("click", () => { me.kart = b.dataset.k; store.set("wt-race-kart", me.kart); sfx.tap(); buildKarts(); }));
  const K = KART[me.kart];
  $("pvKart").src = `img/karts/${K.id}.webp`;
  const dr = $("pvDriver"); dr.src = `img/drivers/${me.warrior}.webp`;
  const stage = $("pvKart");
  const place = () => {
    if (!stage.naturalWidth) return;
    const box = stage.parentElement, bw = box.clientWidth, bh = box.clientHeight;
    const dw0 = Math.max(K.seat[2], 0.28) * 1.05, dAsp = dr.naturalWidth ? dr.naturalHeight / dr.naturalWidth : 0.8;
    const kAsp = stage.naturalHeight / stage.naturalWidth;
    // size the kart so kart + driver's head both fit in the stage
    const need = (w) => w * kAsp - K.seat[1] * w * kAsp - K.seat[2] * w * 0.25 + dw0 * w * dAsp;
    let kw = bw * 0.9; while (kw > 40 && (kw * kAsp > bh || need(kw) + kw * 0 > bh - 4)) kw -= 4;
    const kh = kw * kAsp, left = (bw - kw) / 2, dw = kw * dw0, dh = dw * dAsp;
    stage.style.width = kw + "px";
    dr.style.width = dw + "px";
    dr.style.left = (left + K.seat[0] * kw) + "px";
    dr.style.transform = "translateX(-50%)";
    dr.style.top = Math.max(0, bh - kh + K.seat[1] * kh + K.seat[2] * kw * 0.25 - dh) + "px";
  };
  stage.onload = place; dr.onload = place; setTimeout(place, 50);
  $("pvName").textContent = K.name;
  $("pvTag").textContent = K.tag;
  $("pvFact").textContent = K.fact;
  $("pvPerk").textContent = "★ " + K.perk;
  $("pvStats").innerHTML = [["Speed", K.spd], ["Start", K.acc], ["Handling", K.hnd]].map(([l, v]) => `<span>${l}</span><div class="bar"><i style="width:${v * 20}%"></i></div>`).join("");
}
$("toRace").addEventListener("click", () => startRace(true));

/* intro film: Dr. Amos shrinks the Warriors and introduces Mercy */
function playFilm(done) {
  const v = $("introVid");
  state = "film"; show("film");
  v.src = "vid/intro.mp4"; v.currentTime = 0; v.muted = false;
  music.pause();
  let ended = false;
  const end = () => { if (ended) return; ended = true; v.onended = null; v.pause(); store.set("wt-race-film", true); done(); };
  v.onended = end; v.onerror = end;
  $("skipFilm").onclick = end;
  v.play().catch(() => { v.muted = true; v.play().catch(end); });
}

// The intro plays every time you head out from the garage; it's skippable.
// "Race again" and "Restart" go straight to the grid.
function startRace(withFilm = false) {
  audioInit();
  newRace();
  if (withFilm) playFilm(countdown); else countdown();
}
function countdown() {
  state = "count"; show("hud");
  ["title", "pickW", "pickK", "film", "results"].forEach((s) => $(s).classList.add("hidden"));
  $("hud").classList.remove("hidden");
  engineStart();
  setTrack(opts.track); setDuck(false);
  if (opts.music) { music.currentTime = 0; music.play().catch(() => {}); }
  const el = $("count"); el.classList.remove("hidden");
  mercySay("count", true);
  let n = 3;
  const tick = () => {
    if (n > 0) { el.textContent = n; sfx.beep(); n--; setTimeout(tick, 900); }
    else {
      el.textContent = "GO!"; sfx.go(); state = "race"; last = performance.now();
      warriorSay(R.P.id, "go", true);
      R.racers.forEach((r) => { r.skill = r.ai ? 0.92 + Math.random() * 0.08 : 1; r.dodge = 0.5 + Math.random() * 0.35; r.lastRel = r.z - R.P.z; });
      setTimeout(() => el.classList.add("hidden"), 700);
    }
  };
  setTimeout(tick, 600);
}

function pause() {
  if (state !== "race") return;
  state = "pause"; $("pause").classList.remove("hidden");
  $("optMusic").checked = opts.music; $("optSfx").checked = opts.sfx; $("optVoice").checked = opts.voice;
  setTrack(opts.track);
  music.pause(); engineStop();
}
$("pauseBtn").addEventListener("click", pause);
$("resume").addEventListener("click", () => { $("pause").classList.add("hidden"); state = "race"; last = performance.now(); engineStart(); if (opts.music) music.play().catch(() => {}); });
$("restart").addEventListener("click", () => { $("pause").classList.add("hidden"); startRace(false); });
["Music", "Sfx", "Voice"].forEach((k) => $("opt" + k).addEventListener("change", (e) => { opts[k.toLowerCase()] = e.target.checked; saveOpts(); if (k === "Music" && !opts.music) music.pause(); }));
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

function showResults() {
  state = "results"; engineStop();
  // racers still on the road finish at their current pace
  for (const r of R.racers) if (r.finish == null) r.finish = R.t + (TRACK_LEN - r.z) / Math.max(MAXSPD * 0.6, r.speed);
  const byPlace = [...R.racers].sort((a, b) => a.finish - b.finish);
  const byImpact = [...R.racers].sort((a, b) => b.impact - a.impact);
  const row = (r, i, val) => `<li class="${r.ai ? "" : "me"}"><span class="n">${i + 1}</span><img src="img/faces/${r.id}.webp" alt=""><span>${r.name}</span><b>${val}</b></li>`;
  $("resPlace").innerHTML = byPlace.map((r, i) => row(r, i, fmtTime(r.finish))).join("");
  $("resImpact").innerHTML = byImpact.map((r, i) => row(r, i, r.impact + " 💎")).join("");
  const place = byPlace.indexOf(R.P) + 1, iplace = byImpact.indexOf(R.P) + 1;
  $("resHead").textContent = place === 1 && iplace === 1 ? "Double champion! 🏆🏆" : place === 1 ? "You won the race! 🏁" : iplace === 1 ? "Most impact! 💎" : `${ordinal(place)} place!`;
  $("resNote").textContent = iplace === 1
    ? "Treating blockages and sharing crystals made you the biggest helper on the track."
    : "Impact points come from treating blockages (+100), answering Warrior Cards (+75), sharing crystals (+50) and boosts (+10).";
  // what you learned this race
  const facts = ["marrow2", "vocfact", "lung2", "spleen2"].filter((k) => R.heard.has(k)).map((k) => MERCY[k]);
  const cells = R.spotted.map((k) => `<span class="cell-chip"><img src="img/cells/${k}.webp" alt="">${CELLS[k][0]}</span>`).join("");
  const crys = [...R.used].map((t) => CRYSTALS.find((c) => c.id === t)).map((c) => `<li>${c.icon} <b>${c.name}:</b> ${c.fact}</li>`).join("");
  const myths = [...R.myths].slice(0, 2).map((i) => `<li>🛡️ <b>Myth busted:</b> ${MYTHS[i][1]}</li>`).join("");
  $("resLearn").innerHTML = `<h3>📘 What you learned</h3>${cells ? `<div class="cells">${cells}</div>` : ""}<ul>${crys}${myths}${facts.slice(0, 2).map((f) => `<li>🩸 ${f}</li>`).join("")}</ul>`;
  const best = store.get("wt-race-best", null);
  if (!best || place < best.place || (place === best.place && R.P.impact > best.impact)) store.set("wt-race-best", { place, impact: R.P.impact });
  show("results");
  music.pause();
}
const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
$("again").addEventListener("click", () => startRace(false));

/* ================= boot ================= */
["img/bg_marrow.webp", "img/bg_vessel.webp", "img/obj/voc.webp", "img/obj/crystal.webp", "img/obj/boost.webp", "img/obj/drone.webp", "img/obj/myth.webp", "img/obj/arch.webp"].forEach(img);
KARTS.forEach((k) => img(`img/karts/${k.id}.webp`));
Object.keys(CELLS).forEach((k) => cellImg(k));
setTrack(opts.track);
WARRIORS.forEach((w) => img(`img/drivers/${w.id}.webp`));
setTimeout(() => { ZONES.forEach((z) => { img(z.bg); img(z.ground); }); img("img/ground/road.webp"); }, 300);
setTimeout(() => Object.keys(MERCY).forEach((k) => { const a = new Audio(); a.preload = "metadata"; a.src = `voice/mercy/${k}.mp3`; voiceCache[`voice/mercy/${k}.mp3`] = a; }), 2500);
showBest();
show("title");
// dev handle for tests
window.__race = { get R() { return R; }, get state() { return state; }, set state(v) { state = v; }, MERCY, ZONES, startRace, useCrystal, fireBlast, usePower,
  // fast simulation for tests: an autopilot steers around trouble and uses crystals
  // mode.naive: a weak player who never steers or treats; mode.blast: fires the blaster at clumps
  sim(seconds, dt = 1 / 30, mode = {}) {
    const log = { voc: 0, trap: 0, myth: 0, treat: 0, seq: 0, share: 0 };
    for (let t = 0; t < seconds && state !== "results"; t += dt) {
      if (state === "card") { const b = document.querySelector("#cardP .ans button"); if (b && !b.disabled) b.click(); R.P.seq = 0; state = "race"; $("card").classList.add("hidden"); log.seq++; }
      if (state === "race" && R.P.seq > 50) { showCard(); continue; }
      if (state !== "race") break;
      const P = R.P, s0 = Math.floor(P.z / SEG); let danger = null;
      for (let i = s0 + 1; i < s0 + 10; i++) for (const o of (SEGS[i] || { objs: [] }).objs) if (!o.gone && o.t !== "crystal" && o.t !== "boost" && Math.abs(o.x - P.x) < 0.45) danger = o;
      keys.left = keys.right = false;
      if (mode.blast && danger && P.ammo >= 1) fireBlast();
      if (mode.naive) danger = null;
      if (danger && danger.t !== "voc") { if (danger.x >= P.x) keys.left = P.x > -0.6; else keys.right = P.x < 0.6; if (!keys.left && !keys.right) keys.right = true; }
      else if (Math.abs(P.x) > 0.7) { keys.left = P.x > 0; keys.right = P.x < 0; }
      if (!mode.naive && $("treat").classList.contains("urgent")) { useCrystal(); log.treat++; }
      R.laneT = keys.left || keys.right ? null : nearestLane(P.x);
      const before = { stun: P.stun, trapped: P.trapped, slow: P.slow };
      update(dt);
      if (P.stun > before.stun + 0.5) log.voc++;
      if (P.trapped > before.trapped + 0.5) log.trap++;
    }
    keys.left = keys.right = false;
    return { t: R.t, z: R.P.z, len: TRACK_LEN, pos: R.pos, impact: R.P.impact, state, log, ai: R.racers.filter(r => r.ai).map(r => [r.id, Math.round(r.z), r.impact]) };
  } };
