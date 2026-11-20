/* Warrior Mission — story, characters, quips and level layouts */
(function(){
const WM = window.WM = window.WM || {};

WM.CHARS = [
  {id:"malcolm", name:"Malcolm", hb:"HbSS", age:"14", color:"#1f9d6b", doc:false, fw:168,
   power:"Healing Words", powerDesc:"Heals 2 hearts and refills some water"},
  {id:"tasha", name:"Tasha", hb:"HbSS", age:"14", color:"#f08c1a", doc:false, fw:176,
   power:"Quick Heal", powerDesc:"Back to full hearts instantly"},
  {id:"theo", name:"Theo", hb:"HbSC", age:"6", color:"#2f7cf6", doc:false, fw:177,
   power:"Unlock", powerDesc:"Opens every locked Society gate nearby"},
  {id:"luciana", name:"Luciana", hb:"HbSβ0", age:"7", color:"#d6246e", doc:false, fw:172,
   power:"Barrier Break", powerDesc:"Smashes barriers and Society agents on screen"},
  {id:"ritika", name:"Ritika", hb:"HbSD-Punjab", age:"8", color:"#5b4bd8", doc:false, fw:168,
   power:"Crystal Magnet", powerDesc:"Pulls in every token, water and crystal on screen"},
  {id:"krystal", name:"Krystal", hb:"HbSβ+", age:"16", color:"#c2185b", doc:false, fw:164,
   power:"Teleport", powerDesc:"Blinks you far ahead, right through trouble"},
  {id:"kim", name:"Dr. Kim", hb:"HbAS (trait)", age:"Nurse", color:"#7a3fd1", doc:true, fw:182,
   power:"Shield", powerDesc:"8 seconds of protection from every hit",
   unlock:1, unlockText:"Clear Mission 1 to unlock Dr. Kim"},
  {id:"amos", name:"Dr. Amos", hb:"HbAA", age:"Doctor", color:"#0f8f8a", doc:true, fw:159,
   power:"Stop Progression", powerDesc:"Freezes every enemy, even the boss, for 6 seconds",
   unlock:2, unlockText:"Clear Mission 2 to unlock Dr. Amos"}
];

/* Quips: text shown in a bubble; audio at voice/<id>/<key>.mp3 when present */
WM.QUIPS = {
  malcolm:{start:"Chapter one: the Warriors take back the lab.",q1:"Note to self: write a poem about this jump.",q2:"Plot twist! The Society can't stop us.",q3:"Langston Hughes never had to dodge flying orbs.",water:"Hydration: the hero's secret ingredient.",hit:"Ouch! That's going in my journal.",stomp:"And… scene!",power:"Healing words, coming right up!",thirsty:"My cells are asking for water. Loudly.",crisis:"Pain crisis… I need to rest and hydrate.",win:"The end. Or is it just the beginning?"},
  tasha:{start:"Let's go! Malcolm, try to keep up.",q1:"Future Doctor Tasha, reporting for duty!",q2:"Is it just me, or are these jumps getting easier?",q3:"I bet I could do this with my eyes closed. I won't, though.",water:"Water break! Doctor's orders. My orders.",hit:"Hey! Not cool!",stomp:"Boom! Next patient!",power:"Quick heal! Back in the game!",thirsty:"Ugh, I'm getting thirsty. Gotta find water.",crisis:"Ow… pain crisis. Should've grabbed that water.",win:"Told you we'd do it. Never doubted us."},
  theo:{start:"Ooh, a mission! I love missions!",q1:"I'm super fast! Zoom zoom!",q2:"Do you think the Society has snacks?",q3:"Doors, doors, I unlock doors!",water:"Gulp, gulp, gulp! Ahhh!",hit:"Ow! That was rude!",stomp:"Boing! Got you!",power:"Click! Door's open!",thirsty:"My mouth is dry like a cracker!",crisis:"Owie… I need water and a rest.",win:"We did it! High five! Up top!"},
  luciana:{start:"¡Vamos, Warriors! Let's break some barriers!",q1:"This outfit is perfect for jumping. Fashion and function!",q2:"¡Qué bueno! I'm doing great!",q3:"Note to self: design sneakers with extra bounce.",water:"¡Agua! Thank you!",hit:"¡Ay! My outfit!",stomp:"¡Adiós!",power:"Barrier break! ¡Fuera!",thirsty:"Necesito agua… I need water!",crisis:"Ay… pain crisis. Water and rest, please.",win:"¡Lo logramos! We did it!"},
  ritika:{start:"Hypothesis: we're about to win.",q1:"Fun fact: red blood cells should be round, like donuts!",q2:"This is way more fun than my microscope. Almost.",q3:"Data collected: the Society is not very good at this.",water:"Hydrated cells are happy cells!",hit:"Hey! That's not scientific!",stomp:"Experiment successful!",power:"Crystal magnet, activate!",thirsty:"My cells need water to keep flowing!",crisis:"Pain crisis… my cells are stuck. I need water and rest.",win:"Conclusion: Warriors thrive!"},
  krystal:{start:"Calculating the perfect jump. Okay, let's go.",q1:"Physics says this should work. Physics is usually right.",q2:"This would make a great dance move, honestly.",q3:"Gravity, you are not winning today.",water:"Hydration level: maxed out.",hit:"Rude. Very rude.",stomp:"And that's how momentum works.",power:"Teleport! See you on the other side!",thirsty:"I need water. That's just science.",crisis:"Pain crisis. Okay… water, warmth, rest.",win:"Mission complete. Adding it to my playlist."},
  kim:{start:"Okay team, vitals look good. Let's move!",q1:"Remember to stretch, everybody!",q2:"Nurse tip: always pack extra water.",q3:"I've worked night shifts harder than this.",water:"Great job hydrating!",hit:"Oof! I'm okay, I'm okay.",stomp:"Shot's done! That wasn't so bad.",power:"Shields up! I've got you covered.",win:"Proud of you, Warriors. Truly."},
  amos:{start:"My lab! Let's take it back, Warriors.",q1:"Science never sleeps. Neither does Dr. Amos.",q2:"If only my patients could see me now.",q3:"Every jump is a data point!",water:"Hydration is the best medicine.",hit:"Ow! That's going in my research notes.",stomp:"Progression stopped!",power:"Freeze! Disease progression, stopped!",win:"Welcome back to the lab, everyone!"}
};

WM.STORY = "The Society shut down Dr. Amos' lab and locked its doors with myths. To break back in, the Warriors need Health Crystals to power the doors — and the truth to help real Warriors in the community.";

WM.MISSIONS = [
  {n:1, title:"Whispers on the Block", world:1, bg:"img/bg1.webp", kid:"jasmine", kidName:"Jasmine", kidAge:15,
   myth:"“You're just not trying hard enough.”",
   need:"Jasmine keeps hearing whispers that her pain crises happen because she doesn't try hard enough.",
   boss:"The Whisper", bossImg:"img/boss1.webp",
   clues:[
     "Pain crises happen when sickled red blood cells get stuck and block blood flow. It's biology, not effort.",
     "Pain is real even when you can't see it. Believing a Warrior is the first step to helping.",
     "Rest, water, warmth and a pain plan from your care team help. Pushing through pain doesn't."],
   truth:"Jasmine isn't lazy. She's a Warrior managing a real condition, and rest is part of her strength."},
  {n:2, title:"Game Day", world:2, bg:"img/bg2.webp", kid:"jordan", kidName:"Jordan", kidAge:12,
   myth:"“You can't play sports with sickle cell.”",
   need:"Jordan wants to try out for the team, but someone told him Warriors can't play sports.",
   boss:"The Benchwarmer", bossImg:"img/boss2.webp",
   clues:[
     "Lots of Warriors play sports! Talk with your care team about what's right for you.",
     "Drink water before, during and after you play, and take breaks in the shade.",
     "Avoid getting too hot or too cold. Stop and tell your coach if you feel pain or get short of breath."],
   truth:"Jordan can play with a plan: water, breaks, and a coach who knows his plan."},
  {n:3, title:"Back to the Lab", world:3, bg:"img/bg3.webp", kid:"amara", kidName:"Amara", kidAge:10,
   myth:"“There's nothing you can do about sickle cell.”",
   need:"Amara wants to be a scientist, but she heard there's nothing anyone can do about sickle cell.",
   boss:"The Society Director", bossImg:"img/boss3.webp",
   clues:[
     "Hydroxyurea is a daily medicine that helps red blood cells stay rounder and can mean fewer pain crises.",
     "Regular checkups, vaccines and blood transfusions help protect Warriors' bodies.",
     "A bone marrow transplant or a gene therapy can cure sickle cell for some Warriors, and science keeps moving!"],
   truth:"There's a lot Warriors and their care teams can do, and Dr. Amos' lab is back to finding even more."},
  {n:4, title:"Breath of Truth", world:4, body:"lungs", bg:"img/bg4.webp", kid:"darius", kidName:"Darius", kidAge:16,
   myth:"“Chest pain and a cough? Just sleep it off.”",
   need:"Darius has chest pain and a cough, and The Smog Baron told him to just sleep it off. The Warriors shrink down to fight inside his lungs.",
   boss:"The Smog Baron", bossImg:"img/boss4.webp",
   clues:[
     "Chest pain, fever, coughing or trouble breathing can be acute chest syndrome, an emergency. Go to the ER right away.",
     "In the hospital, breathing into an incentive spirometer every hour you're awake helps keep your lungs open.",
     "Pulmonary hypertension is high pressure in the lungs' blood vessels. Tell your care team if you get short of breath easily; a heart ultrasound can check."],
   truth:"Chest pain with sickle cell is never something to sleep off. Getting checked fast keeps Darius's lungs strong."},
  {n:5, title:"Mind Over Myth", world:5, body:"brain", bg:"img/bg5.webp", kid:"rafael", kidName:"Rafael", kidAge:"Mateo's dad",
   myth:"“Kids with sickle cell don't have strokes. Skip that brain scan.”",
   need:"Rafael's son Mateo has a brain scan appointment, but The Static told Rafael it's a waste of time. The Warriors shrink down to fight inside the brain.",
   boss:"The Static", bossImg:"img/boss5.webp",
   clues:[
     "Children with sickle cell can have strokes. A painless yearly ultrasound called a TCD checks blood flow in the brain, starting around age 2.",
     "Know the signs: a drooping face, arm or leg weakness, trouble talking or seeing, or a sudden bad headache. Call 911 right away.",
     "If a TCD shows high risk, regular blood transfusions or other treatments can help prevent a stroke."],
   truth:"Rafael keeps Mateo's TCD scan every year, because screening can stop a stroke before it happens."},
  {n:6, title:"Kidney Canyon", world:6, body:"kidneys", bg:"img/bg6.webp", kid:"aaliyah", kidName:"Aaliyah", kidAge:11,
   myth:"“Wetting the bed means you're just lazy.”",
   need:"Aaliyah wet the bed again, and The Clogmaster told her it's because she's lazy. The Warriors shrink down to fight inside the kidneys.",
   boss:"The Clogmaster", bossImg:"img/boss6.webp",
   clues:[
     "Sickle cell can keep kidneys from concentrating urine, so kids make more pee, even at night. It's not your fault.",
     "Keep drinking water all day, take bathroom breaks, and talk with your care team. There are ways to help with bedwetting.",
     "Yearly urine and blood pressure checks help catch kidney problems early, when they're easier to treat."],
   truth:"Aaliyah isn't lazy. Her kidneys work differently with sickle cell, and her care team has a plan to help."}
];

/* ---------- level builder ---------- */
const ROWS = 12;
function Builder(){ this.cols=[]; this.ents=[]; this.g=9; }
Builder.prototype = {
  get x(){ return this.cols.length; },
  flat(n,g){ if(g!==undefined) this.g=g; for(let i=0;i<n;i++){ const c=new Array(ROWS).fill(0); for(let r=this.g;r<ROWS;r++) c[r]=1; this.cols.push(c);} return this; },
  gap(n){ for(let i=0;i<n;i++) this.cols.push(new Array(ROWS).fill(0)); return this; },
  t(x,r,v){ if(this.cols[x]) this.cols[x][r]=v; return this; },
  /* 'S' Warrior Spark block, '=' brick, '?' token block, 'W' water block, 'H' heart block, 'M' multi-token block, '-' one-way, 'b' barrier(2 tall), 'L' gate(3 tall) */
  row(x,r,s){ for(let i=0;i<s.length;i++){ const ch=s[i], X=x+i;
      if(ch==="=") this.t(X,r,2); else if(ch==="?") this.t(X,r,3); else if(ch==="W") this.t(X,r,8);
      else if(ch==="H") this.t(X,r,9); else if(ch==="M") this.t(X,r,10); else if(ch==="S") this.t(X,r,11); else if(ch==="-") this.t(X,r,7);
      else if(ch==="b"){ this.t(X,r,5); this.t(X,r-1,5); }
      else if(ch==="L"){ this.t(X,r,6); this.t(X,r-1,6); this.t(X,r-2,6); }
    } return this; },
  e(type,x,r,o){ this.ents.push(Object.assign({type, tx:x, tr:r}, o||{})); return this; },
  tokens(x,r,n,arc){ for(let i=0;i<n;i++){ const rr = arc ? r - Math.round(Math.sin(i/(n-1||1)*Math.PI)*arc) : r; this.e("token",x+i,rr); } return this; },
  stairs(n,dir){ for(let i=0;i<n;i++){ this.flat(1, this.g + (dir<0?-1:1)); } return this; },
  build(world){ return {cols:this.cols, ents:this.ents, w:this.cols.length, world}; }
};

/* seg(n, groundRow, fn(x0)) adds n ground columns, then lets fn place things relative to x0 */
Builder.prototype.seg=function(n,g,fn){ const x0=this.x; this.flat(n,g); if(fn) fn(x0,g); return this; };
Builder.prototype.hole=function(n,fn){ const x0=this.x; this.gap(n); if(fn) fn(x0); return this; };

function gateRoom(b,x){ /* a Society-locked room under a roof; the main path runs over the roof */
  b.e("gatehint",x+1,9); b.t(x+2,8,2); b.t(x+3,8,2); b.t(x+3,7,2);
  b.row(x+4,8,"L"); b.row(x+11,8,"L"); for(let i=4;i<=11;i++) b.t(x+i,5,2);
  b.tokens(x+6,8,3).e("crystal",x+9,8);
}
function arena(b){
  b.flat(3, 9); const a0=b.x; b.e("arena",a0,9); b.e("spark",a0-2,8); b.e("spring",a0+3,9); b.e("spring",a0+16,9); b.flat(20, 9); const a1=b.x;
  b.flat(2,9); for(let r=0;r<9;r++) b.t(b.x-1,r,1);
  return b;
}

WM.LEVELS = {
  1(){ const b=new Builder();
    b.seg(18,9,(x)=>{ b.e("sign",x+3,9,{text:"▲ jump · ◀ ▶ run · 🛡 hold to block"}).tokens(x+6,7,5,1).row(x+11,5,"=S=W=").e("token",x+13,4); });
    b.seg(14,9,(x)=>{ b.e("sign",x+1,9,{text:"Jump on Society agents to stop them!"}).e("agent",x+8,9).tokens(x+5,8,3).e("water",x+11,8); });
    b.seg(4,9,(x)=>{ b.e("sign",x+1,9,{text:"Grab water! Warriors need it to stay strong."}); });
    b.hole(2);
    b.seg(10,9,(x)=>{ b.row(x+2,6,"-----").tokens(x+2,5,5).e("clue",x+8,8,{i:0}); });
    b.stairs(2,-1).seg(6,7,(x)=>{ b.e("agent",x+3,7); });
    b.hole(3);
    b.seg(12,8,(x)=>{ b.e("spring",x+1,8).row(x+5,3,"=M=").e("crystal",x+6,2).e("agent",x+8,8).e("agent",x+10,8); });
    b.seg(14,9,(x)=>{ b.row(x+3,5,"?=S?").e("cloud",x+7,4).tokens(x+2,8,6).e("flag",x+12,9); });
    b.seg(8,9,(x)=>{ b.row(x+2,8,"b").e("agent",x+5,9); });
    b.hole(2).seg(4,9).hole(2).seg(5,9,(x)=>{ b.tokens(x-6,6,4,1).e("water",x+3,8); });
    b.seg(14,9,(x)=>{ b.row(x+2,5,"=W=?=").row(x+6,2,"---").tokens(x+6,1,3).e("agent",x+3,9).e("agent",x+9,9).e("clue",x+12,8,{i:1}); });
    b.stairs(3,-1).seg(5,6,(x)=>{ b.e("cloud",x+2,2); });
    b.hole(3).seg(5,6).stairs(3,1);
    b.seg(14,9,(x)=>{ gateRoom(b,x); });
    b.seg(10,9,(x)=>{ b.row(x+2,8,"b").e("agent",x+5,9).e("flag",x+8,9); });
    b.seg(8,9,(x)=>{ b.row(x+1,5,"-----").e("cloud",x+3,2).tokens(x+1,4,5); });
    b.hole(2).seg(5,9,(x)=>{ b.e("spring",x+3,9); }).hole(4);
    b.seg(14,9,(x)=>{ b.e("water",x+1,8).row(x+3,5,"=H=").e("agent",x+4,9).e("agent",x+8,9).e("clue",x+10,8,{i:2}); });
    b.seg(8,9,(x)=>{ b.row(x+3,6,"==").e("crystal",x+4,5); });
    arena(b);
    return b.build(1);
  },
  2(){ const b=new Builder();
    b.seg(16,9,(x)=>{ b.tokens(x+4,7,5,1).row(x+8,5,"SW?").e("agent",x+13,9); });
    b.hole(2).seg(6,8,(x)=>{ b.e("clue",x+3,7,{i:0}); });
    b.hole(7,(x)=>{ b.e("mover",x+1,7,{dx:4}); b.tokens(x+2,5,4); });
    b.seg(14,9,(x)=>{ b.e("thrower",x+11,9).row(x+3,5,"=?=?=").e("agent",x+5,9).e("cloud",x+8,3); });
    b.stairs(3,-1).seg(6,6,(x)=>{ b.e("spring",x+2,6).row(x+3,1,"===").e("crystal",x+4,0); }).stairs(3,1);
    b.seg(10,9,(x)=>{ b.e("flag",x+2,9).e("water",x+5,8); });
    b.hole(6,(x)=>{ b.e("mover",x+1,7,{dy:3}); });
    b.seg(12,9,(x)=>{ b.row(x+3,8,"b").e("thrower",x+9,9).e("clue",x+11,8,{i:1}); });
    b.seg(6,9,(x)=>{ b.row(x+2,5,"M").e("cloud",x+4,3); });
    b.hole(2).seg(3,7).hole(2).seg(3,5,(x)=>{ b.tokens(x,3,3); }).hole(2).seg(3,7);
    b.hole(2).seg(16,9,(x)=>{ gateRoom(b,x); b.e("agent",x+13,9); });
    b.seg(14,9,(x)=>{ b.e("agent",x+2,9).e("agent",x+6,9).row(x+3,5,"=W=").e("flag",x+11,9); });
    b.hole(10,(x)=>{ b.e("mover",x+1,6,{dx:6}); });
    b.seg(10,9,(x)=>{ b.e("water",x+1,8).e("thrower",x+7,9); b.row(x+4,8,"b"); });
    b.seg(10,9,(x)=>{ b.row(x+2,8,"b").e("cloud",x+4,3).e("cloud",x+8,2).e("clue",x+6,8,{i:2}); });
    b.seg(10,9,(x)=>{ b.e("spring",x+2,9).row(x+4,2,"---").e("crystal",x+5,1).e("agent",x+8,9).row(x+6,5,"?H?"); });
    arena(b);
    return b.build(2);
  },
  3(){ const b=new Builder();
    b.seg(14,9,(x)=>{ b.tokens(x+3,7,6,1).row(x+8,5,"WSW"); });
    b.hole(3).seg(6,7,(x)=>{ b.e("clue",x+3,6,{i:0}); });
    b.hole(7,(x)=>{ b.e("mover",x+1,6,{dx:4}); });
    b.seg(12,9,(x)=>{ b.e("thrower",x+10,9).row(x+3,5,"=M=").e("cloud",x+6,3); });
    b.seg(8,9,(x)=>{ b.row(x+2,8,"b").e("agent",x+4,9).e("agent",x+6,9); });
    b.stairs(4,-1).seg(3,5).hole(3).seg(4,5,(x)=>{ b.e("spring",x+1,5).e("crystal",x+2,0).row(x+1,1,"---"); }).hole(3).seg(3,5).stairs(4,1);
    b.seg(10,9,(x)=>{ b.e("flag",x+1,9).row(x+3,5,"-----").e("thrower",x+8,9).e("cloud",x+5,2).tokens(x+3,4,5); });
    b.seg(3,9,(x)=>{ b.e("water",x+1,8); });
    b.hole(6,(x)=>{ b.e("mover",x+1,7,{dy:3}); });
    b.seg(10,8,(x)=>{ b.e("clue",x+2,7,{i:1}); });
    b.seg(16,9,(x)=>{ gateRoom(b,x); b.e("agent",x+13,9); });
    b.seg(10,9,(x)=>{ b.e("agent",x+2,9).e("agent",x+5,9).e("agent",x+8,9).row(x+2,5,"?WSH?"); });
    b.hole(2).seg(3,6).hole(2).seg(3,4,(x)=>{ b.e("cloud",x+1,1); }).hole(2).seg(3,6).hole(2);
    b.seg(10,9,(x)=>{ b.e("flag",x+2,9).e("cloud",x+6,3).row(x+7,8,"b"); });
    b.seg(4,9,(x)=>{ b.e("thrower",x+2,9); });
    b.hole(12,(x)=>{ b.e("mover",x+1,6,{dx:8}); });
    b.seg(12,9,(x)=>{ b.e("spring",x+2,9).row(x+4,2,"===").e("crystal",x+5,1).e("clue",x+8,8,{i:2}).e("agent",x+10,9); });
    b.seg(8,9,(x)=>{ b.row(x+2,5,"=W=").e("agent",x+5,9); });
    arena(b);
    return b.build(3);
  }
};
Object.assign(WM.LEVELS,{
  4(){ const b=new Builder();
    b.seg(14,9,(x)=>{ b.tokens(x+3,7,5,1).row(x+8,5,"WS?"); });
    b.hole(2).seg(6,8,(x)=>{ b.e("cloud",x+3,3); });
    b.hole(3).seg(6,8,(x)=>{ b.e("clue",x+2,7,{i:0}).e("agent",x+4,8); });
    b.seg(12,9,(x)=>{ b.row(x+2,6,"-----").tokens(x+2,5,5).e("thrower",x+9,9).row(x+7,8,"b"); });
    b.hole(7,(x)=>{ b.e("mover",x+1,7,{dx:4}); b.e("cloud",x+3,2); });
    b.seg(8,9,(x)=>{ b.e("flag",x+2,9).e("water",x+5,8); });
    b.stairs(3,-1).seg(5,6,(x)=>{ b.e("spring",x+2,6).row(x+3,1,"===").e("crystal",x+4,0); }).stairs(3,1);
    b.seg(14,9,(x)=>{ b.e("agent",x+3,9).e("agent",x+6,9).e("thrower",x+11,9).row(x+4,5,"?H?").e("clue",x+9,8,{i:1}); });
    b.hole(2).seg(3,7).hole(2).seg(3,5,(x)=>{ b.tokens(x,3,3); }).hole(2).seg(3,7).hole(2);
    b.seg(16,9,(x)=>{ gateRoom(b,x); b.e("cloud",x+13,3); });
    b.seg(10,9,(x)=>{ b.e("flag",x+2,9).row(x+5,8,"b").e("water",x+8,8); });
    b.hole(10,(x)=>{ b.e("mover",x+1,6,{dx:6}); });
    b.seg(12,9,(x)=>{ b.e("thrower",x+4,9).e("cloud",x+7,2).row(x+6,5,"=W=").e("clue",x+10,8,{i:2}); });
    b.seg(10,9,(x)=>{ b.e("spring",x+2,9).row(x+4,2,"---").e("crystal",x+5,1).e("agent",x+8,9); });
    arena(b); return b.build(4); },
  5(){ const b=new Builder();
    b.seg(12,9,(x)=>{ b.tokens(x+3,7,5,1).row(x+7,5,"?SW"); });
    b.hole(3).seg(5,7).hole(3).seg(5,5,(x)=>{ b.e("clue",x+2,4,{i:0}); }).hole(3).seg(5,7);
    b.hole(2).seg(14,9,(x)=>{ b.e("thrower",x+5,9).e("thrower",x+11,9).row(x+7,8,"b").e("cloud",x+8,3); });
    b.hole(6,(x)=>{ b.e("mover",x+1,7,{dy:3}); });
    b.seg(10,9,(x)=>{ b.e("flag",x+1,9).e("water",x+4,8).row(x+5,5,"=M=").e("agent",x+7,9); });
    b.stairs(4,-1).seg(3,5).hole(3).seg(4,5,(x)=>{ b.e("spring",x+1,5).e("crystal",x+2,0).row(x+1,1,"---"); }).hole(3).seg(3,5).stairs(4,1);
    b.seg(14,9,(x)=>{ b.e("clue",x+3,8,{i:1}).e("agent",x+5,9).e("agent",x+8,9).e("agent",x+11,9).row(x+5,5,"?W?H?"); });
    b.seg(16,9,(x)=>{ gateRoom(b,x); b.e("thrower",x+14,9); });
    b.hole(12,(x)=>{ b.e("mover",x+1,6,{dx:8}); b.e("cloud",x+5,2); });
    b.seg(10,9,(x)=>{ b.e("flag",x+2,9).row(x+5,8,"b").e("cloud",x+7,3); });
    b.seg(12,9,(x)=>{ b.e("spring",x+2,9).row(x+4,2,"===").e("crystal",x+5,1).e("clue",x+9,8,{i:2}).e("thrower",x+10,9); });
    b.seg(6,9,(x)=>{ b.e("water",x+2,8); });
    arena(b); return b.build(5); },
  6(){ const b=new Builder();
    b.seg(14,9,(x)=>{ b.tokens(x+3,7,6,1).row(x+8,5,"WSW"); });
    b.hole(4,(x)=>{ b.e("mover",x+0,7,{dx:2}); });
    b.seg(10,8,(x)=>{ b.e("clue",x+2,7,{i:0}).e("agent",x+5,8).e("agent",x+7,8); });
    b.hole(2).seg(3,6).hole(2).seg(3,4,(x)=>{ b.e("cloud",x+1,1).tokens(x,3,3); }).hole(2).seg(3,6).hole(2);
    b.seg(14,9,(x)=>{ b.e("thrower",x+6,9).row(x+3,8,"b").row(x+9,8,"b").e("water",x+11,8); });
    b.seg(10,9,(x)=>{ b.e("flag",x+1,9).row(x+3,5,"-----").tokens(x+3,4,5).e("cloud",x+6,2); });
    b.hole(7,(x)=>{ b.e("mover",x+1,7,{dy:3}); });
    b.seg(10,8,(x)=>{ b.e("clue",x+3,7,{i:1}).e("thrower",x+8,8); });
    b.seg(16,9,(x)=>{ gateRoom(b,x); b.e("agent",x+13,9); });
    b.stairs(3,-1).seg(5,6,(x)=>{ b.e("spring",x+2,6).row(x+3,1,"===").e("crystal",x+4,0); }).stairs(3,1);
    b.seg(12,9,(x)=>{ b.e("flag",x+1,9).e("agent",x+4,9).e("agent",x+7,9).e("thrower",x+10,9).row(x+4,5,"?W?H"); });
    b.hole(12,(x)=>{ b.e("mover",x+1,6,{dx:8}); b.e("cloud",x+6,2); });
    b.seg(12,9,(x)=>{ b.e("spring",x+2,9).row(x+4,2,"---").e("crystal",x+5,1).e("clue",x+8,8,{i:2}).e("cloud",x+9,3); });
    b.seg(6,9,(x)=>{ b.e("water",x+2,8); });
    arena(b); return b.build(6); }
});
WM.ROWS = ROWS;
})();
