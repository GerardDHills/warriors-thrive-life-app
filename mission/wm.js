/* Warrior Mission — a Warriors Thrive platformer */
(function(){
"use strict";
const WM = window.WM, T = 48, ROWS = WM.ROWS, VH = ROWS*T, VHV = 9*T;
const $ = id => document.getElementById(id);
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const rnd = (a,b) => a+Math.random()*(b-a);
const CH = Object.fromEntries(WM.CHARS.map(c=>[c.id,c]));

/* ---------------- save ---------------- */
const SKEY = "wt-mission-v1";
let save = {done:{}, best:{}, tokens:0, music:true, voice:true, char:"malcolm"};
try{ Object.assign(save, JSON.parse(localStorage.getItem(SKEY)||"{}")); }catch(e){}
const persist = () => { try{ localStorage.setItem(SKEY, JSON.stringify(save)); }catch(e){} };
const unlocked = c => !c.unlock || !!save.done[c.unlock];
const post = msg => { try{ if(window.parent!==window) window.parent.postMessage(Object.assign({source:"warriors-thrive-mission"},msg), location.origin); }catch(e){} };

/* ---------------- assets ---------------- */
const IMG = {};
const imgList = ["title","bg1","bg2","bg3","bg4","bg5","bg6","boss1","boss2","boss3","boss4","boss5","boss6","cloud","water","bonus","used","brick","flag","clue","heart","token","crystal","barrier","jasmine","jordan","amara","darius","rafael","aaliyah"].map(n=>[n,"img/"+n+".webp"])
  .concat(WM.CHARS.map(c=>["spr_"+c.id,"spr/"+c.id+".webp"]))
  .concat(WM.CHARS.map(c=>["face_"+c.id,"../runner/faces/"+c.id+".webp"]))
  .concat([["spr_agent","spr/agent.webp"]]);
function loadAll(){
  let done=0;
  return Promise.all(imgList.map(([k,src])=>new Promise(res=>{
    const im=new Image(); im.onload=im.onerror=()=>{ done++; $("loadBar").style.width=(done/imgList.length*100)+"%"; res(); };
    im.src=src; IMG[k]=im;
  })));
}
let CARDS = [];
fetch("../runner/cards.json").then(r=>r.json()).then(d=>{ CARDS=d; }).catch(()=>{});

/* ---------------- audio ---------------- */
let AC=null;
function ac(){ if(!AC){ try{ AC=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(AC&&AC.state==="suspended") AC.resume(); return AC; }
function beep(type){
  const a=ac(); if(!a) return; const t=a.currentTime;
  const tone=(f1,f2,dur,wave,vol,delay)=>{ const o=a.createOscillator(), g=a.createGain(); o.type=wave||"square";
    o.frequency.setValueAtTime(f1,t+(delay||0)); o.frequency.exponentialRampToValueAtTime(Math.max(f2,30),t+(delay||0)+dur);
    g.gain.setValueAtTime(vol||.08,t+(delay||0)); g.gain.exponentialRampToValueAtTime(.0005,t+(delay||0)+dur);
    o.connect(g).connect(a.destination); o.start(t+(delay||0)); o.stop(t+(delay||0)+dur+.02); };
  if(type==="jump") tone(330,660,.16,"square",.05);
  else if(type==="token"){ tone(988,988,.06,"square",.05); tone(1319,1319,.12,"square",.05,.06); }
  else if(type==="stomp") tone(220,90,.15,"triangle",.14);
  else if(type==="hurt") tone(300,80,.3,"sawtooth",.08);
  else if(type==="water"){ tone(500,900,.12,"sine",.12); tone(700,1200,.12,"sine",.1,.08); }
  else if(type==="power"){ [523,659,784,1047].forEach((f,i)=>tone(f,f,.12,"square",.06,i*.07)); }
  else if(type==="clue"){ [784,988,1175].forEach((f,i)=>tone(f,f,.14,"triangle",.1,i*.09)); }
  else if(type==="crystal"){ [1047,1319,1568,2093].forEach((f,i)=>tone(f,f,.12,"sine",.1,i*.06)); }
  else if(type==="bump") tone(160,120,.08,"square",.06);
  else if(type==="spark"){ tone(1400,300,.12,"sawtooth",.05); tone(900,1800,.08,"square",.03,.02); }
  else if(type==="spring") tone(200,900,.22,"sine",.12);
  else if(type==="boss") tone(140,60,.5,"sawtooth",.12);
  else if(type==="win"){ [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,f,.18,"square",.07,i*.12)); }
  else if(type==="ok"){ tone(660,660,.1,"sine",.12); tone(990,990,.18,"sine",.12,.1); }
  else if(type==="no") tone(220,160,.3,"triangle",.12);
}
const music=$("music"); music.volume=.35;
function musicOn(on){ if(on&&save.music){ music.play().catch(()=>{}); } else music.pause(); }

let voiceEl=null, bubbleT=null, lastQuip=0;
function quip(key,force){
  const c=G&&G.ch; if(!c) return; const now=performance.now();
  if(!force && now-lastQuip<4500) return;
  const txt=(WM.QUIPS[c.id]||{})[key]; if(!txt) return;
  lastQuip=now;
  if(!$("clueBan").classList.contains("hide")) { if(save.voice){ try{ if(!voiceEl) voiceEl=new Audio(); voiceEl.src="voice/"+c.id+"/"+key+".mp3"; voiceEl.play().catch(()=>{}); }catch(e){} } return; }
  $("bubFace").src=IMG["face_"+c.id].src; $("bubTxt").textContent=txt;
  const b=$("bubble"); b.classList.remove("hide"); b.style.animation="none"; void b.offsetWidth; b.style.animation="";
  clearTimeout(bubbleT); bubbleT=setTimeout(()=>b.classList.add("hide"), 3200);
  if(save.voice){ try{ if(!voiceEl) voiceEl=new Audio(); voiceEl.pause(); voiceEl.src="voice/"+c.id+"/"+key+".mp3"; voiceEl.volume=1; voiceEl.play().catch(()=>{}); }catch(e){} }
}
let toastT=null;
function toast(big,small){ const t=$("toast"); t.innerHTML=big+(small?"<small>"+small+"</small>":""); t.classList.remove("hide"); t.style.animation="none"; void t.offsetWidth; t.style.animation=""; clearTimeout(toastT); toastT=setTimeout(()=>t.classList.add("hide"),1650); }
let clueT=null;
function clueBanner(head,tx){ $("bubble").classList.add("hide"); $("clueHd").textContent=head; $("clueTx").textContent=tx; const b=$("clueBan"); b.classList.remove("hide"); b.style.animation="none"; void b.offsetWidth; b.style.animation=""; clearTimeout(clueT); clueT=setTimeout(()=>b.classList.add("hide"),6500); }

/* ---------------- canvas ---------------- */
const cv=$("cv"), ctx=cv.getContext("2d");
let DPR=1, SC=1, VW=800;
function resize(){ DPR=Math.min(window.devicePixelRatio||1,2); cv.width=innerWidth*DPR|0; cv.height=innerHeight*DPR|0; SC=cv.height/VHV; VW=cv.width/SC; }
addEventListener("resize",resize); resize();

/* ground tile art per world */
const TILE={};
function makeTiles(world){
  /* tiles are baked into <img> elements: iOS can wipe off-screen canvases under memory pressure, which made the ground vanish */
  const mk=(f,key)=>{ const c=document.createElement("canvas"); c.width=c.height=T*2; const x=c.getContext("2d"); x.scale(2,2); f(x);
    try{ const im=new Image(); im.onload=()=>{ if(TILE._w===world) TILE[key]=im; }; im.src=c.toDataURL("image/png"); }catch(e){}
    return c; };
  TILE._w=world;
  const P = {1:{top:"#c9c4c0",lip:"#9d958f",fill:"#8a3f2f",fill2:"#7a3528",mortar:"#5d281f"},
             2:{top:"#5fcf4f",lip:"#3e9e36",fill:"#8a5a35",fill2:"#7a4d2c",mortar:"#5e3a20"},
             3:{top:"#3a3352",lip:"#b05cff",fill:"#262038",fill2:"#211b31",mortar:"#151122"},
             4:{top:"#ffb3c4",lip:"#e8738f",fill:"#c9475f",fill2:"#b83e55",mortar:"#8c2c40"},
             5:{top:"#c7a8ff",lip:"#8e5cff",fill:"#4a2a7a",fill2:"#40246b",mortar:"#2a1650"},
             6:{top:"#ffb27a",lip:"#e0703a",fill:"#9a3a24",fill2:"#88321f",mortar:"#5e2014"}}[world]||{top:"#c9c4c0",lip:"#9d958f",fill:"#8a3f2f",fill2:"#7a3528",mortar:"#5d281f"};
  TILE.P=P;
  TILE.top=mk(x=>{ x.fillStyle=P.fill; x.fillRect(0,0,T,T);
    for(let r=0;r<4;r++){ x.fillStyle=r%2?P.fill2:P.fill; x.fillRect(0,14+r*9,T,9); x.fillStyle=P.mortar; x.fillRect(0,14+r*9,T,1); x.fillRect(((r%2)*T/2+T/4)|0,14+r*9,1,9); }
    const g=x.createLinearGradient(0,0,0,14); g.addColorStop(0,P.top); g.addColorStop(1,P.lip); x.fillStyle=g; x.fillRect(0,0,T,14);
    x.fillStyle="rgba(255,255,255,.35)"; x.fillRect(0,0,T,2);
    if(world===2){ x.fillStyle="#7ee06a"; for(let i=0;i<8;i++){ x.fillRect(i*6+2,0,2,4+(i%3)); } }
    if(world===3){ x.fillStyle=P.lip; x.shadowColor=P.lip; x.shadowBlur=6; x.fillRect(0,11,T,3); x.shadowBlur=0; }
    if(world===1){ x.fillStyle="rgba(0,0,0,.12)"; x.fillRect(T-1,0,1,14); }
    if(world>=4){ /* soft, living tissue: rounded bumps and glowing cells */ x.fillStyle=P.top; for(let i=0;i<4;i++){ x.beginPath(); x.arc(i*12+6,2,6,0,7); x.fill(); }
      x.fillStyle=world===5?"rgba(160,230,255,.55)":"rgba(255,235,240,.45)"; for(let i=0;i<3;i++){ x.beginPath(); x.arc(8+i*16,30+(i%2)*10,3,0,7); x.fill(); } } },"top");
  TILE.fill=mk(x=>{ for(let r=0;r<6;r++){ x.fillStyle=r%2?P.fill2:P.fill; x.fillRect(0,r*8,T,8); x.fillStyle=P.mortar; x.fillRect(0,r*8,T,1); x.fillRect(((r%2)*T/2+T/4)|0,r*8,1,8); } },"fill");
}

/* ---------------- game state ---------------- */
let G=null, running=false, lastT=0;
const SOLID={1:1,2:1,3:1,4:1,5:1,6:1,8:1,9:1,10:1,11:1};
function tile(c,r){ if(c<0) return 1; if(r<0||r>=ROWS||!G.cols[c]) return 0; return G.cols[c][r]; }
function isSolid(c,r){ return !!SOLID[tile(c,r)]; }

function startMission(n){
  const m=WM.MISSIONS[n-1], lv=WM.LEVELS[n]();
  makeTiles(lv.world);
  const ch=CH[save.char]||CH.malcolm;
  G={m, n, lv, cols:lv.cols.map(c=>c.slice()), w:lv.w, ch, ents:[], parts:[], shots:[],
     p:{x:2*T, y:9*T-92, w:38, h:92, vx:0, vy:0, face:1, ground:false, coyote:0, jbuf:0, inv:0, anim:0, slow:0, shield:0},
     cam:0, camY:VH-VHV, t:0, tokens:0, crystals:new Set(), clues:new Set(), hearts:3, hyd:100, powers:2,
     check:{x:2*T, y:9*T-92}, safe:{x:2*T,y:9*T-92}, arena:null, boss:null, freeze:0, state:"play",
     thirstyNag:0, nextQuip:rnd(14,22), gateNear:null, won:false, shake:0};
  for(const e of lv.ents){
    const o=Object.assign({}, e, {x:e.tx*T+T/2, y:e.tr*T+(["token","water","heart","crystal","clue"].includes(e.type)?T/2:0), alive:true, t:Math.random()*6});
    if(e.type==="agent"||e.type==="thrower"){ o.w=38; o.h=74; o.vx=e.type==="agent"?-55:0; o.vy=0; o.y=e.tr*T-74; o.x=e.tx*T+5; o.face=-1; o.cool=rnd(1,2.5); }
    if(e.type==="cloud"){ o.x0=o.x; o.y=e.tr*T+T/2; o.cool=rnd(1,2); o.w=70; o.h=40; }
    if(e.type==="mover"){ o.x=e.tx*T; o.y=e.tr*T; o.x0=o.x; o.y0=o.y; o.w=3*T; o.h=18; o.ph=0; o.dx=(e.dx||0)*T; o.dy=(e.dy||0)*T; o.px=o.x; o.py=o.y; }
    if(e.type==="arena") { G.arena={x0:e.tx, x1:e.tx+20}; continue; }
    G.ents.push(o);
  }
  G.ents.sort((a,b)=>(a.type==="mover"?-1:0)-(b.type==="mover"?-1:0));
  updatePower(); hudAll(); hudHyd();
  show(null); $("hud").classList.remove("hide"); $("pad").classList.remove("hide");
  $("bossBar").classList.add("hide"); $("crisisFx").classList.remove("on");
  blockT=0; blockCool=0; G.pshots=[]; setSpark(false); running=true; lastT=performance.now(); musicOn(true);
  toast("Mission "+n, m.title);
  quip(G.n>3?"q1":"start",true); /* start lines talk about the lab; body missions use a general line */
}

/* ---------------- HUD ---------------- */
function hudHearts(){ let h=""; for(let i=0;i<3;i++) h+='<img src="img/heart.webp" class="'+(i<G.hearts?"":"off")+'" alt="">'; $("hearts").innerHTML=h; }
function hudAll(){ hudHearts(); $("hTok").textContent=G.tokens; $("hCrys").textContent=G.crystals.size+"/3"; $("hClue").textContent=G.clues.size+"/3";
  $("hyd").classList.toggle("hide",G.ch.doc); }
function hudHyd(){ $("hydFill").style.width=G.hyd+"%"; $("hyd").classList.toggle("low",G.hyd<25); }
function updatePower(){ $("pFace").src=IMG["face_"+G.ch.id].src; $("pCount").textContent=G.powers; $("bP").classList.toggle("used",G.powers<=0); }

/* ---------------- input ---------------- */
const K={l:false,r:false,j:false,b:false};
let blockT=0, blockCool=0;
function blocking(){ return blockT>0; }
let jumpPressed=false;
function setKey(k,v){ if(k==="j"&&v&&!K.j){ jumpPressed=true; } K[k]=v; }
addEventListener("keydown",e=>{ const k=e.key.toLowerCase();
  if(k==="arrowleft"||k==="a") setKey("l",true); else if(k==="arrowright"||k==="d") setKey("r",true);
  else if(k===" "||k==="arrowup"||k==="w"){ setKey("j",true); e.preventDefault(); }
  else if(k==="arrowdown"||k==="s") setKey("b",true);
  else if(k==="f"||k==="x") fire();
  else if(k==="e"||k==="shift") usePower(); else if(k==="escape"||k==="p") pause(); });
addEventListener("keyup",e=>{ const k=e.key.toLowerCase();
  if(k==="arrowleft"||k==="a") setKey("l",false); else if(k==="arrowright"||k==="d") setKey("r",false);
  else if(k===" "||k==="arrowup"||k==="w") setKey("j",false);
  else if(k==="arrowdown"||k==="s") setKey("b",false); });
function bindBtn(id,k){ const b=$(id);
  const on=e=>{ e.preventDefault(); ac(); setKey(k,true); b.classList.add("on"); try{ b.setPointerCapture(e.pointerId); }catch(_){} };
  const off=e=>{ setKey(k,false); b.classList.remove("on"); };
  b.addEventListener("pointerdown",on); b.addEventListener("pointerup",off); b.addEventListener("pointercancel",off); b.addEventListener("lostpointercapture",off); }
bindBtn("bL","l"); bindBtn("bR","r"); bindBtn("bJ","j"); bindBtn("bB","b");
$("bP").addEventListener("pointerdown",e=>{ e.preventDefault(); usePower(); });
$("bF").addEventListener("pointerdown",e=>{ e.preventDefault(); fire(); $("bF").classList.add("on"); });
$("bF").addEventListener("pointerup",()=>$("bF").classList.remove("on"));
addEventListener("contextmenu",e=>e.preventDefault());
document.addEventListener("visibilitychange",()=>{ if(document.hidden&&G&&G.state==="play") pause(); });

/* ---------------- physics helpers ---------------- */
function collideX(o){
  const top=Math.floor(o.y/T), bot=Math.floor((o.y+o.h-1)/T);
  if(o.vx>0){ const c=Math.floor((o.x+o.w)/T); for(let r=top;r<=bot;r++) if(isSolid(c,r)){ o.x=c*T-o.w-.01; o.vx=0; return c; } }
  else if(o.vx<0){ const c=Math.floor(o.x/T); for(let r=top;r<=bot;r++) if(isSolid(c,r)){ o.x=(c+1)*T+.01; o.vx=0; return c; } }
  return null;
}
function collideY(o,prevBottom){
  const l=Math.floor((o.x+2)/T), rr=Math.floor((o.x+o.w-2)/T); o.ground=false;
  if(o.vy>=0){ const r=Math.floor((o.y+o.h)/T);
    for(let c=l;c<=rr;c++){ const v=tile(c,r); if(SOLID[v]||(v===7&&prevBottom<=r*T+1)){ o.y=r*T-o.h; o.vy=0; o.ground=true; return {c,r,v}; } } }
  else { const r=Math.floor(o.y/T);
    for(let c=l;c<=rr;c++){ if(isSolid(c,r)){ o.y=(r+1)*T; o.vy=0; return {c,r,head:true}; } } }
  return null;
}

/* ---------------- player ---------------- */
const RUN=300, ACC=2200, AIRACC=1500, FRIC=2600, GRAV=2150, JUMP=970, MAXFALL=1100;
function updatePlayer(dt){
  const p=G.p, slow=p.slow>0?.55:1;
  if(K.b&&blockT<=0&&blockCool<=0){ blockT=1.6; beep("bump"); }
  if(blockT>0){ blockT-=dt; if(!K.b) blockT=Math.min(blockT,0); if(blockT<=0) blockCool=.9; }
  else if(blockCool>0) blockCool-=dt;
  $("bB").classList.toggle("cool",blockCool>0);
  let dir=blocking()?0:(K.r?1:0)-(K.l?1:0);
  const max=RUN*slow;
  if(dir){ p.vx+=dir*(p.ground?ACC:AIRACC)*dt; p.face=dir; }
  else if(p.ground){ const s=Math.sign(p.vx); p.vx-=s*FRIC*dt; if(Math.sign(p.vx)!==s) p.vx=0; }
  p.vx=clamp(p.vx,-max,max);
  if(jumpPressed){ p.jbuf=.13; jumpPressed=false; }
  p.jbuf-=dt; p.coyote-=dt;
  if(p.jbuf>0&&p.coyote>0){ p.vy=-JUMP*(p.slow>0?.85:1); p.jbuf=0; p.coyote=0; p.ground=false; beep("jump"); }
  if(!K.j&&p.vy<-300) p.vy+=GRAV*1.6*dt;
  p.vy=Math.min(p.vy+GRAV*dt,MAXFALL);
  p.x+=p.vx*dt; const wc=collideX(p);
  if(wc!==null) gateTouch(wc);
  if(G.arena&&G.boss){ const a0=G.arena.x0*T, a1=G.arena.x1*T; p.x=clamp(p.x,a0+2,a1-p.w-2); }
  p.x=Math.max(p.x,0);
  const pb=p.y+p.h; p.y+=p.vy*dt;
  const hit=collideY(p,pb);
  if(hit&&hit.head) bumpBlock(hit.c,hit.r);
  // movers
  for(const m of G.ents){ if(m.type!=="mover") continue;
    if(p.vy>=0&&pb<=m.y+2&&p.y+p.h>=m.y&&p.x+p.w>m.x+4&&p.x<m.x+m.w-4){ p.y=m.y-p.h; p.vy=0; p.ground=true; p.x+=m.x-m.px; p.y+=m.y-m.py; } }
  if(p.ground){ p.coyote=.1; const c=Math.floor((p.x+p.w/2)/T), r=Math.floor((p.y+p.h)/T); if(isSolid(c,r)&&tile(c,r)===1){ G.safe={x:c*T+T/2-p.w/2,y:r*T-p.h}; } }
  p.anim+=dt*(Math.abs(p.vx)/RUN*13+2);
  if(p.inv>0) p.inv-=dt; if(p.slow>0){ p.slow-=dt; if(p.slow<=0) $("crisisFx").classList.remove("on"); } if(p.shield>0) p.shield-=dt;
  if(p.y>VH+60) fell();
}
function fell(){ const p=G.p; p.inv=0; damage(1,"pit"); if(G.state!=="play") return; Object.assign(p,{x:G.safe.x,y:G.safe.y-4,vx:0,vy:0}); p.inv=1.6; }

function damage(n,src){
  const p=G.p; if(G.state!=="play") return;
  if(src!=="pit"&&(p.inv>0||p.shield>0)) return;
  let crisis=false;
  if(!G.ch.doc&&G.hyd<25&&src!=="pit"){ n+=1; crisis=true; }
  G.hearts=Math.max(0,G.hearts-n); hudHearts(); beep("hurt"); G.shake=.35;
  if(G.spark&&src!=="pit"){ setSpark(false); toast("Spark lost!","Find another ⚡ block"); }
  p.inv=1.5; if(src!=="pit"){ p.vy=-420; p.vx=-p.face*200; }
  if(crisis){ p.slow=3.2; $("crisisFx").classList.add("on"); toast("Pain crisis!","You got hit while dehydrated. Grab water to stay strong!"); quip("crisis",true); }
  else if(Math.random()<.6) quip("hit");
  if(G.hearts<=0) setTimeout(()=>outOfLife(src),350);
}
function heal(n){ G.hearts=Math.min(3,G.hearts+n); hudHearts(); }

function outOfLife(src){
  if(G.state!=="play") return;
  G.state="card"; K.l=K.r=K.j=false;
  askCard("Out of hearts! Answer a Warrior Card to keep going.", ok=>{
    G.state="play"; const p=G.p;
    if(ok){ heal(3); if(!G.ch.doc) G.hyd=Math.max(G.hyd,80); p.inv=2.2; toast("Back in the game!"); if(src==="pit"||p.y>VH) Object.assign(p,{x:G.safe.x,y:G.safe.y-4,vx:0,vy:0}); }
    else { heal(3); if(!G.ch.doc) G.hyd=100; Object.assign(p,{x:G.check.x,y:G.check.y,vx:0,vy:0,inv:2}); toast("Back to the checkpoint","You've got this!"); }
    p.slow=0; $("crisisFx").classList.remove("on"); hudHyd(); lastT=performance.now();
  }, false);
}

/* ---------------- blocks & gates ---------------- */
function bumpBlock(c,r){
  const v=tile(c,r);
  if(v===3||v===8||v===9||v===10||v===11){ G.cols[c][r]=4; G.parts.push({k:"bump",x:c*T,y:r*T,t:.15});
    const x=c*T+T/2, y=r*T-T/2;
    if(v===3){ popToken(x,y); }
    else if(v===10){ for(let i=0;i<5;i++) setTimeout(()=>popToken(x,y),i*120); }
    else if(v===8) G.ents.push({type:"water",x,y:r*T-4-T/2,alive:true,t:0,phys:1,rise:.35,vx:G.p.face>=0?80:-80,vy:0,bx:x,by:r*T-T/2});
    else if(v===11) G.ents.push({type:"spark",x,y:r*T-4-T/2,alive:true,t:0,phys:1,rise:.35,vx:G.p.face>=0?80:-80,vy:0,bx:x,by:r*T-T/2});
    else if(v===9) G.ents.push({type:"heart",x,y:r*T-4-T/2,alive:true,t:0,phys:1,rise:.35,vx:G.p.face>=0?80:-80,vy:0,bx:x,by:r*T-T/2});
    // stomp enemies standing on the block
    for(const e of G.ents) if((e.type==="agent")&&e.alive&&!e.dead&&Math.abs(e.x+e.w/2-x)<T&&Math.abs(e.y+e.h-r*T)<6) killEnemy(e);
  } else beep("bump");
}
function popToken(x,y){ G.tokens++; $("hTok").textContent=G.tokens; beep("token"); G.parts.push({k:"tok",x,y,vy:-420,t:.55}); }

function gatesIn(c0,c1){ const out=[]; for(let c=Math.max(0,c0);c<=Math.min(G.w-1,c1);c++) for(let r=0;r<ROWS;r++) if(G.cols[c][r]===6) out.push([c,r]); return out; }
function openGates(c0,c1){ const g=gatesIn(c0,c1); for(const [c,r] of g){ G.cols[c][r]=0; G.parts.push({k:"spark",x:c*T+T/2,y:r*T+T/2,t:.6}); } return g.length; }
let gateCool=0;
function gateTouch(c){
  if(gateCool>0||G.state!=="play") return; const v=G.cols[c]&&G.cols[c].some(x=>x===6); if(!v) return;
  gateCool=2.5;
  if(G.ch.id==="theo"||G.ch.id==="luciana"){ toast("Locked gate!", "Use your "+G.ch.power+" power to open it"); return; }
  G.state="card"; K.l=K.r=K.j=false;
  askCard("A Society lock! Answer a Warrior Card to open this gate.", ok=>{
    G.state="play"; lastT=performance.now();
    if(ok){ openGates(c-8,c+8); toast("Gate unlocked!"); }
  }, true);
}

/* ---------------- powers ---------------- */
function usePower(){
  if(!G||G.state!=="play") return; if(G.powers<=0){ toast("Power used up","You get 2 per mission"); return; }
  const p=G.p, id=G.ch.id, c0=Math.floor(G.cam/T)-1, c1=Math.floor((G.cam+VW)/T)+1;
  let used=true;
  if(id==="malcolm"){ heal(2); if(!G.ch.doc) G.hyd=Math.min(100,G.hyd+35); }
  else if(id==="tasha"){ heal(3); }
  else if(id==="theo"){ const n=openGates(Math.floor(p.x/T)-14,Math.floor(p.x/T)+14); if(!n){ for(let i=0;i<6;i++) setTimeout(()=>popToken(p.x+p.w/2,p.y-10),i*100); } }
  else if(id==="luciana"){ for(let c=c0;c<=c1;c++) for(let r=0;r<ROWS;r++){ const v=tile(c,r); if(v===5||v===6){ G.cols[c][r]=0; G.parts.push({k:"spark",x:c*T+T/2,y:r*T+T/2,t:.6}); } }
    for(const e of G.ents) if((e.type==="agent"||e.type==="thrower"||e.type==="cloud")&&e.alive&&!e.dead&&e.x>G.cam-40&&e.x<G.cam+VW+40) killEnemy(e);
    G.shots=[]; if(G.boss&&G.boss.hp>0) hitBoss(true); }
  else if(id==="ritika"){ G.magnet=2.2; heal(1); }
  else if(id==="krystal"){ G.parts.push({k:"tele",x:p.x+p.w/2,y:p.y+p.h/2,t:.5});
    let tx=p.x+p.face*6*T; if(G.arena&&G.boss) tx=clamp(G.boss.x<p.x?G.boss.x-140:G.boss.x+G.boss.w+60,G.arena.x0*T+10,G.arena.x1*T-60);
    // find safe landing
    for(let k=0;k<12;k++){ const c=Math.floor((tx+p.w/2)/T); let land=-1; for(let r=2;r<ROWS;r++){ if(isSolid(c,r)&&!isSolid(c,r-1)&&!isSolid(c,r-2)){ land=r; break; } } if(land>0){ p.x=tx; p.y=land*T-p.h; p.vx=0; p.vy=0; break; } tx+=p.face*T; }
    p.inv=Math.max(p.inv,1); G.parts.push({k:"tele",x:p.x+p.w/2,y:p.y+p.h/2,t:.5}); }
  else if(id==="kim"){ p.shield=8; }
  else if(id==="amos"){ G.freeze=6; }
  else used=false;
  if(used){ G.powers--; updatePower(); beep("power"); toast(G.ch.power+"!"); quip("power",true); $("bP").classList.remove("ready"); }
}

/* ---------------- Warrior Spark (electric shots) ---------------- */
let fireCool=0;
function setSpark(on){ if(!G) return; G.spark=on; $("bF").classList.toggle("hide",!on); }
function drawSparkOrb(x,y,r,t){
  ctx.save(); const g=ctx.createRadialGradient(x,y,2,x,y,r*1.8); g.addColorStop(0,"#ffffff"); g.addColorStop(.35,"#fff36b"); g.addColorStop(.7,"rgba(80,220,255,.7)"); g.addColorStop(1,"rgba(80,220,255,0)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r*1.8,0,7); ctx.fill();
  ctx.strokeStyle="#fff"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x+3,y-r*.8); ctx.lineTo(x-5,y+1); ctx.lineTo(x+3,y+1); ctx.lineTo(x-3,y+r*.8); ctx.stroke();
  ctx.strokeStyle="rgba(140,240,255,.9)"; ctx.lineWidth=2; for(let i=0;i<3;i++){ const a=t*9+i*2.1; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9); ctx.lineTo(x+Math.cos(a+.3)*r*1.5,y+Math.sin(a+.3)*r*1.5); ctx.stroke(); }
  ctx.restore();
}
function fire(){
  if(!G||G.state!=="play"||!G.spark||fireCool>0||blocking()) return;
  if((G.pshots||[]).length>=2) return;
  const p=G.p; fireCool=.28; G.pshots=G.pshots||[];
  G.pshots.push({x:p.x+p.w/2+p.face*26,y:p.y+38,vx:p.face*640,vy:120,life:1.8,t:0});
  beep("spark");
}
function updateSparks(dt){
  if(fireCool>0) fireCool-=dt; if(!G.pshots) return;
  for(const s of G.pshots){ s.t+=dt; s.life-=dt; s.vy=Math.min(s.vy+1900*dt,900); s.x+=s.vx*dt;
    if(isSolid(Math.floor((s.x+Math.sign(s.vx)*10)/T),Math.floor(s.y/T))){ s.life=0; G.parts.push({k:"zap",x:s.x,y:s.y,t:.25}); continue; }
    s.y+=s.vy*dt; if(s.vy>0&&isSolid(Math.floor(s.x/T),Math.floor((s.y+10)/T))){ s.y=Math.floor((s.y+10)/T)*T-10; s.vy=-430; }
    if(s.y>VH+20||s.x<G.cam-60||s.x>G.cam+VW+60) s.life=0;
    for(const e of G.ents){ if(!e.alive||e.dead) continue;
      if(e.type==="agent"||e.type==="thrower"){ if(s.x>e.x-6&&s.x<e.x+e.w+6&&s.y>e.y&&s.y<e.y+e.h){ killEnemy(e); s.life=0; G.parts.push({k:"zap",x:s.x,y:s.y,t:.3}); break; } }
      else if(e.type==="cloud"){ if(Math.abs(s.x-e.x)<40&&Math.abs(s.y-e.y)<30){ killEnemy(e); s.life=0; G.parts.push({k:"zap",x:s.x,y:s.y,t:.3}); break; } } }
    for(const o of G.shots){ if(o.life>0&&Math.abs(o.x-s.x)<o.r+12&&Math.abs(o.y-s.y)<o.r+12){ o.life=0; s.life=0; G.parts.push({k:"zap",x:s.x,y:s.y,t:.3}); } }
    const b=G.boss; if(b&&b.hp>0&&b.st!=="dead"&&s.life>0&&s.x>b.x+b.w*.1&&s.x<b.x+b.w*.9&&s.y>b.y+b.h*.1&&s.y<b.y+b.h){
      s.life=0; G.parts.push({k:"zap",x:s.x,y:s.y,t:.3}); b.flash=.15; b.spk=(b.spk||0)+1; if(b.spk>=4){ b.spk=0; hitBoss(true); } }
  }
  G.pshots=G.pshots.filter(s=>s.life>0);
}

/* ---------------- enemies ---------------- */
function killEnemy(e){ e.dead=true; e.deadT=.6; e.vx=0; G.parts.push({k:"stars",x:e.x+(e.w||0)/2,y:e.y,t:.6}); beep("stomp"); G.tokens+=2; $("hTok").textContent=G.tokens; }
function overlap(a,b){ return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y; }
function stompCheck(e,box){ const p=G.p; return p.vy>80&&(p.y+p.h)-box.y<Math.max(26,p.vy*0.03); }
function updateEnts(dt){
  const p=G.p, frozen=G.freeze>0;
  for(const e of G.ents){
    if(!e.alive) continue; e.t+=dt;
    if(e.x<G.cam-500||e.x>G.cam+VW+500){ if(e.type!=="mover") continue; }
    switch(e.type){
      case "agent": case "thrower":
        if(e.dead){ e.deadT-=dt; if(e.deadT<=0) e.alive=false; break; }
        if(!frozen){
          if(e.type==="agent"){ e.vy=Math.min(e.vy+GRAV*dt,MAXFALL); e.x+=e.vx*dt; const w=collideX(e); if(w!==null){ e.vx=e.vx||55; e.vx*= -1; if(e.vx===0) e.vx=55; }
            const pb=e.y+e.h; e.y+=e.vy*dt; collideY(e,pb);
            if(e.ground){ const ahead=Math.floor((e.vx<0?e.x-2:e.x+e.w+2)/T), below=Math.floor((e.y+e.h+4)/T); if(!isSolid(ahead,below)) e.vx*=-1; }
            if(e.vx===0) e.vx=-55; e.face=e.vx<0?-1:1; if(e.y>VH+80) e.alive=false; }
          else { e.face=p.x<e.x?-1:1; e.cool-=dt;
            if(e.cool<=0&&Math.abs(p.x-e.x)<9*T&&Math.abs(p.x-e.x)>40){ e.cool=rnd(2.2,3.2); e.throwT=.35;
              const dx=(p.x+p.w/2)-(e.x+e.w/2), tt=clamp(Math.abs(dx)/320,.6,1.5);
              G.shots.push({k:"orb",x:e.x+e.w/2,y:e.y+18,vx:dx/tt,vy:-300,g:420,r:11,life:4}); }
            if(e.throwT>0) e.throwT-=dt; }
        }
        { const box={x:e.x+4,y:e.y+6,w:e.w-8,h:e.h-6};
          if(overlap(p,box)){ if(stompCheck(e,box)||frozen&&p.vy>0){ killEnemy(e); p.vy=K.j?-720:-480; quip("stomp"); } else if(blocking()){ if(e.type==="agent"){ e.vx=(e.x<p.x?-1:1)*Math.abs(e.vx||55); e.x+=e.vx*.15; } } else damage(1,"enemy"); } }
        break;
      case "cloud":
        if(e.dead){ e.deadT-=dt; if(e.deadT<=0) e.alive=false; break; }
        if(!frozen){ e.x=e.x0+Math.sin(e.t*.8)*3*T; e.cool-=dt;
          if(e.cool<=0&&Math.abs((p.x+p.w/2)-e.x)<70&&p.y>e.y){ e.cool=2.4; e.charge=.35; }
          if(e.charge>0){ e.charge-=dt; if(e.charge<=0) G.shots.push({k:"bolt",x:e.x,y:e.y+20,vx:0,vy:420,g:0,r:10,life:3}); } }
        { const box={x:e.x-32,y:e.y-16,w:64,h:34}; if(overlap(p,box)){ if(stompCheck(e,box)){ killEnemy(e); p.vy=K.j?-740:-520; quip("stomp"); } else damage(1,"enemy"); } }
        break;
      case "mover":
        e.px=e.x; e.py=e.y; e.ph+=dt*.9; e.x=e.x0+(e.dx?(Math.sin(e.ph)*.5+.5)*e.dx:0); e.y=e.y0+(e.dy?(Math.sin(e.ph)*.5+.5)*e.dy:0); break;
      case "token": case "water": case "heart": case "crystal": case "clue": case "spark":{
        if(e.phys){
          if(e.rise>0){ e.rise-=dt; e.y-=dt*110; }
          else if(e.phys===1){ const b={x:e.x-14,y:e.y-16,w:28,h:30,vx:e.vx,vy:Math.min(e.vy+GRAV*.7*dt,MAXFALL)};
            b.x+=b.vx*dt; if(collideX(b)!==null) b.vx=-e.vx;
            const pb=b.y+b.h; b.y+=b.vy*dt; collideY(b,pb);
            if(b.ground&&e.air&&e.y>e.by+T*.6) { b.vx=0; e.phys=2; }   // dropped to lower ground: stay put
            e.air=!b.ground; e.vx=b.vx; e.vy=b.vy; e.x=b.x+14; e.y=b.y+16;
            if(e.y>VH+30){ e.x=e.bx; e.y=e.by-T*.4; e.vx=0; e.vy=0; e.phys=2; } }
        } else if(e.rise){ e.rise-=dt*3; e.y-=dt*60; }
        if(G.magnet>0&&Math.abs(e.x-p.x)<VW*.6){ e.x+=(p.x+p.w/2-e.x)*dt*6; e.y+=(p.y+p.h/2-e.y)*dt*6; }
        const box={x:e.x-18,y:e.y-18,w:36,h:36};
        if(overlap(p,box)) pickup(e);
        break; }
      case "flag": if(!e.got&&p.x>e.x-20){ e.got=true; G.check={x:e.x-10,y:e.y-p.h-2}; toast("Checkpoint!"); beep("clue"); if(!G.ch.doc){ G.hyd=Math.max(G.hyd,60); hudHyd(); } } break;
      case "spring": { const box={x:e.x-22,y:e.y-20,w:44,h:20}; if(p.vy>0&&overlap(p,box)){ p.vy=-1180; e.sq=.25; beep("spring"); } if(e.sq>0) e.sq-=dt; break; }
    }
  }
  if(G.magnet>0) G.magnet-=dt;
  // shots
  for(const s of G.shots){ if(!frozen){ s.vy+=s.g*dt; s.x+=s.vx*dt; s.y+=s.vy*dt; } s.life-=dt;
    if(s.k==="wave"){ if(isSolid(Math.floor(s.x/T),Math.floor((s.y-4)/T))) s.life=0; }
    else if(isSolid(Math.floor(s.x/T),Math.floor(s.y/T))) s.life=0;
    if(s.life>0&&Math.abs(s.x-(p.x+p.w/2))<s.r+p.w/2+(blocking()?18:-4)&&Math.abs(s.y-(p.y+p.h/2))<s.r+p.h/2+(blocking()?14:-6)){ s.life=0; if(blocking()){ G.parts.push({k:"block",x:s.x,y:s.y,t:.3}); beep("bump"); } else damage(1,"shot"); } }
  G.shots=G.shots.filter(s=>s.life>0);
  G.ents=G.ents.filter(e=>e.alive);
}
function pickup(e){
  e.alive=false; const p=G.p;
  if(e.type==="token") popToken(e.x,e.y);
  else if(e.type==="water"){ beep("water"); if(!G.ch.doc){ G.hyd=Math.min(100,G.hyd+45); hudHyd(); } else { G.tokens+=3; $("hTok").textContent=G.tokens; } quip("water"); G.parts.push({k:"splash",x:e.x,y:e.y,t:.5}); }
  else if(e.type==="heart"){ beep("ok"); if(G.hearts>=3){ G.tokens+=5; $("hTok").textContent=G.tokens; } heal(1); }
  else if(e.type==="crystal"){ beep("crystal"); G.crystals.add(e.tx+":"+e.tr); $("hCrys").textContent=G.crystals.size+"/3"; toast("Health Crystal!",G.crystals.size+" of 3"); G.parts.push({k:"spark",x:e.x,y:e.y,t:.8}); }
  else if(e.type==="spark"){ beep("power"); setSpark(true); toast("Warrior Spark!","Tap ⚡ to shoot electric Warrior power"); quip("power"); }
  else if(e.type==="clue"){ beep("clue"); G.clues.add(e.i); $("hClue").textContent=G.clues.size+"/3"; clueBanner("Truth Clue "+(e.i+1)+" of 3",G.m.clues[e.i]); }
}

/* ---------------- boss ---------------- */
function enterArena(){
  const a=G.arena; for(let r=0;r<9;r++) G.cols[a.x0-1][r]=2;
  /* bosses 4-6 (inside the body) reuse the three fight styles, bigger and faster */
  const n=G.n, k=(n-1)%3+1, big=n>3?1.12:1, bw=[0,150,190,230][k]*big|0, bh=[0,200,250,225][k]*big|0, hp=[0,3,5,7,6,8,9][n]||7;
  G.boss={n, k, spd:n>3?1.15:1, hp, max:hp, x:a.x1*T-bw-80, y:k===2?9*T-bh:120, w:bw, h:bh, vx:-120, vy:0, st:"intro", st_t:1.6, inv:0, cyc:0, face:-1, flash:0};
  $("bossName").textContent=G.m.boss; $("bossBar").classList.remove("hide"); bossBar();
  toast(G.m.boss,"Stomp it when it's open!"); beep("boss"); G.shake=.5;
}
function bossBar(){ $("bossFill").style.width=(G.boss.hp/G.boss.max*100)+"%"; }
function hitBoss(power){
  const b=G.boss; if(b.inv>0&&!power) return; b.hp--; b.inv=1.2; b.flash=.4; bossBar(); beep("boss"); G.shake=.4;
  G.parts.push({k:"stars",x:b.x+b.w/2,y:b.y,t:.8});
  if(b.hp<=0){ b.st="dead"; b.st_t=2.2; G.shots=[]; toast("MYTH BUSTED!","The truth wins!"); quip(G.n>3&&G.ch.id==="amos"?"stomp":"win",true); }
  else { if(b.k===1){ b.st="rise"; b.st_t=.8; } else if(b.k===2){ b.st="recover"; b.st_t=.8; } else { b.st="rise"; b.st_t=.9; } }
}
function updateBoss(dt){
  const b=G.boss, p=G.p, a0=G.arena.x0*T, a1=G.arena.x1*T, floor=9*T;
  if(b.inv>0) b.inv-=dt; if(b.flash>0) b.flash-=dt;
  if(b.st==="dead"){ b.st_t-=dt; b.y+=dt*40; if(Math.random()<.4) G.parts.push({k:"spark",x:b.x+rnd(0,b.w),y:b.y+rnd(0,b.h),t:.6}); if(b.st_t<=0) winMission(); return; }
  if(G.freeze>0){ /* frozen: can be stomped any time */ }
  else {
  b.st_t-=dt;
  const fast=(b.hp<=Math.ceil(b.max/2)?1.35:1)*b.spd;
  if(b.k===1){
    if(b.st==="intro"&&b.st_t<=0){ b.st="hover"; b.st_t=5; }
    if(b.st==="hover"){ b.x+=b.vx*fast*dt; if(b.x<a0+20||b.x+b.w>a1-20){ b.vx*=-1; b.x=clamp(b.x,a0+21,a1-b.w-21); } b.y+=(110+Math.sin(G.t*2)*20-b.y)*dt*3; b.face=p.x<b.x?-1:1;
      b.cool=(b.cool||1.4)-dt; if(b.cool<=0){ b.cool=2/fast; const ang=Math.atan2((p.y+40)-(b.y+80),(p.x)-(b.x+b.w/2)); G.shots.push({k:"smoke",x:b.x+b.w/2,y:b.y+80,vx:Math.cos(ang)*250,vy:Math.sin(ang)*250,g:0,r:16,life:5}); }
      if(b.st_t<=0){ b.st="swoop"; b.st_t=3.6; b.tx=clamp(p.x-b.w/2,a0+20,a1-b.w-20); } }
    if(b.st==="swoop"){ if(b.tx==null) b.tx=b.x; b.y+=((floor-b.h)-b.y)*dt*4; b.x+=(b.tx-b.x)*dt*1.5; if(b.st_t<=0){ b.st="rise"; b.st_t=.8; } }
    if(b.st==="rise"){ b.y+=(110-b.y)*dt*4; if(b.st_t<=0){ b.st="hover"; b.st_t=rnd(4,6)/fast; } }
  } else if(b.k===2){
    b.vy=Math.min(b.vy+GRAV*dt,MAXFALL); b.y+=b.vy*dt; if(b.y+b.h>=floor){ b.y=floor-b.h; if(b.vy>400&&b.st==="slam"){ G.shake=.5; beep("boss");
      G.shots.push({k:"wave",x:b.x-10,y:floor-14,vx:-330,vy:0,g:0,r:14,life:3},{k:"wave",x:b.x+b.w+10,y:floor-14,vx:330,vy:0,g:0,r:14,life:3}); b.st="recover"; b.st_t=.9; } b.vy=0; }
    if(b.st==="intro"&&b.st_t<=0){ b.st="wind"; b.st_t=.8; }
    if(b.st==="wind"){ b.face=p.x<b.x?-1:1; if(b.st_t<=0){ b.cyc++; if(b.cyc%3===0){ b.st="slam"; b.vy=-900; } else { b.st="charge"; b.vx=b.face*420*fast; } } }
    if(b.st==="charge"){ b.x+=b.vx*dt; if(b.x<a0+6||b.x+b.w>a1-6){ b.x=clamp(b.x,a0+7,a1-b.w-7); b.st="dizzy"; b.st_t=3.4; G.shake=.4; beep("boss");
        if(G.ents.filter(e=>e.type==="agent"&&e.alive).length<2) G.ents.push({type:"agent",x:(a0+a1)/2,y:2*T,w:38,h:74,vx:-55,vy:0,alive:true,t:0,face:-1}); } }
    if((b.st==="recover")&&b.st_t<=0){ b.st="wind"; b.st_t=.7/fast; }
    if(b.st==="dizzy"&&b.st_t<=0){ b.st="wind"; b.st_t=.6; }
  } else {
    if(b.st==="intro"&&b.st_t<=0){ b.st="hover"; b.st_t=6; }
    if(b.st==="hover"){ b.x+=b.vx*fast*dt; if(b.x<a0+10||b.x+b.w>a1-10){ b.vx*=-1; b.x=clamp(b.x,a0+11,a1-b.w-11); } b.y+=(102+Math.sin(G.t*1.6)*8-b.y)*dt*3;
      b.cool=(b.cool||1.2)-dt; if(b.cool<=0){ b.cool=2.1/fast; const n=fast>1?5:3, base=Math.atan2((p.y+40)-(b.y+b.h*.6),(p.x)-(b.x+b.w/2));
        for(let i=0;i<n;i++){ const ang=base+(i-(n-1)/2)*.22; G.shots.push({k:"orb",x:b.x+b.w/2,y:b.y+b.h*.6,vx:Math.cos(ang)*270,vy:Math.sin(ang)*270,g:0,r:13,life:5}); } }
      b.drop=(b.drop||5)-dt; if(b.drop<=0){ b.drop=7; if(G.ents.filter(e=>e.type==="agent"&&e.alive).length<2) G.ents.push({type:"agent",x:b.x+b.w/2,y:b.y+b.h,w:38,h:74,vx:p.x<b.x?-55:55,vy:0,alive:true,t:0,face:-1}); }
      if(b.st_t<=0){ b.st="land"; b.st_t=3.8; } }
    if(b.st==="land"){ b.y+=((floor-b.h)-b.y)*dt*3.5; if(b.st_t<=0){ b.st="rise"; b.st_t=.9; } }
    if(b.st==="rise"){ b.y+=(102-b.y)*dt*3; if(b.st_t<=0){ b.st="hover"; b.st_t=rnd(5,7)/fast; } }
  }
  }
  // collision with player
  const open = G.freeze>0 || (b.k===1&&b.st==="swoop") || (b.k===2&&b.st==="dizzy") || (b.k===3&&b.st==="land");
  /* when open the boss slumps down, so its head is in easy jumping range */
  const box=open?{x:b.x+b.w*.12,y:b.y+b.h*.42,w:b.w*.76,h:b.h*.58}:{x:b.x+b.w*.18,y:b.y+b.h*.12,w:b.w*.64,h:b.h*.82};
  if(overlap(p,box)&&b.st!=="dead"){
    const feetIn=(p.y+p.h)-box.y;
    if(open){ if(p.vy>0&&feetIn<box.h*.6&&b.inv<=0){ hitBoss(); p.vy=K.j?-900:-760; quip("stomp"); } else if(p.vy>0&&feetIn<box.h*.6){ p.vy=-560; } }
    else if(p.vy>60&&feetIn<46){ p.vy=-560; if(!blocking()) damage(1,"boss"); }
    else if(blocking()){ p.vx=(p.x<b.x+b.w/2?-1:1)*360; p.x+=p.vx*.02; G.parts.push({k:"block",x:p.x+p.w/2,y:p.y+p.h/2,t:.3}); beep("bump"); }
    else damage(1,"boss");
  }
  b.slump=open?Math.min(1,(b.slump||0)+dt*6):Math.max(0,(b.slump||0)-dt*4);
  b.open=open;
}
function winMission(){
  if(G.won) return; G.won=true; running=false; beep("win"); musicOn(false);
  const n=G.n, wasDone=!!save.done[n]; save.done[n]=true; save.tokens=(save.tokens||0)+G.tokens;
  const best=save.best[n]||{}; save.best[n]={crystals:Math.max(best.crystals||0,G.crystals.size), tokens:Math.max(best.tokens||0,G.tokens)}; persist();
  post({type:"level", mission:n});
  const m=G.m; $("wKid").src=IMG[m.kid].src; $("wMyth").textContent="Myth: "+m.myth; $("wTruth").textContent=m.truth;
  $("wClues").innerHTML=m.clues.map(c=>"<li>"+c+"</li>").join("");
  $("wStats").innerHTML='<span>💎 '+G.crystals.size+'/3</span><span>💡 '+G.clues.size+'/3</span><span>🪙 '+G.tokens+'</span>';
  const un=WM.CHARS.find(c=>c.unlock===n);
  $("wUnlock").classList.toggle("hide",!(un&&!wasDone)); if(un) $("wUnlock").textContent="🔓 "+un.name+" unlocked! Play as "+un.name+" with the "+un.power+" power.";
  $("wNext").classList.toggle("hide",n>=3); $("wNext").textContent="Next mission ▶";
  $("hud").classList.add("hide"); $("pad").classList.add("hide");
  show("sWin");
}

/* ---------------- update & draw ---------------- */
function update(dt){
  G.t+=dt; gateCool-=dt;
  if(G.freeze>0) G.freeze-=dt;
  updatePlayer(dt); if(G.state!=="play") return;
  updateEnts(dt); updateSparks(dt);
  if(G.arena&&!G.boss&&G.p.x>G.arena.x0*T+2*T) enterArena();
  if(G.boss) updateBoss(dt);
  if(!G.ch.doc){ G.hyd=Math.max(0,G.hyd-dt*1.15); if(Math.floor(G.t*4)%2===0) hudHyd();
    if(G.hyd<25){ G.thirstyNag-=dt; if(G.thirstyNag<=0){ quip("thirsty"); G.thirstyNag=14; } } }
  G.nextQuip-=dt; if(G.nextQuip<=0){ G.nextQuip=rnd(18,30); quip(["q1","q2","q3"][Math.random()*3|0]); }
  if(G.powers>0&&!$("bP").classList.contains("ready")&&(G.boss||G.hearts===1)) $("bP").classList.add("ready");
  // camera
  const p=G.p; let tx=p.x+p.w/2-VW*.4+p.face*40;
  if(G.boss){ const a0=G.arena.x0*T, a1=G.arena.x1*T; const aw=a1-a0; tx= aw<=VW ? a0-(VW-aw)/2 : clamp(p.x-VW/2,a0,a1-VW); }
  G.cam+=(tx-G.cam)*Math.min(1,dt*6); G.cam=clamp(G.cam,0,Math.max(0,G.w*T-VW));
  const ty=G.boss?72:clamp(p.y+p.h-VHV*.76,0,VH-VHV); G.camY+=(ty-G.camY)*Math.min(1,dt*6);
  for(const q of G.parts){ q.t-=dt; if(q.vy!==undefined){ q.vy+=1400*dt; q.y+=q.vy*dt; } }
  G.parts=G.parts.filter(q=>q.t>0);
  if(G.shake>0) G.shake-=dt;
}

function draw(){
  const W=cv.width, H=cv.height;
  ctx.setTransform(1,0,0,1,0,0);
  // sky / background
  const bg=IMG["bg"+G.lv.world];
  const bh=VH*1.02, bw=bg.width*bh/bg.height;
  ctx.setTransform(SC,0,0,SC,0,0);
  ctx.fillStyle=["#f3b27f","#f3b27f","#cfe8ff","#2a1f45","#f4a7b6","#3a2266","#b8573a"][G.lv.world]||"#f3b27f"; ctx.fillRect(0,0,VW,VHV);
  const off=-(G.cam*.3)%(bw*2), by=-G.camY*.6;
  for(let x=off-bw*2;x<VW+bw;x+=bw*2){ ctx.drawImage(bg,x,by,bw,bh); ctx.save(); ctx.translate(x+bw*2,by); ctx.scale(-1,1); ctx.drawImage(bg,0,0,bw,bh); ctx.restore(); }
  let sx=0,sy=0; if(G.shake>0){ sx=rnd(-6,6); sy=rnd(-5,5); }
  ctx.setTransform(SC,0,0,SC,(-G.cam+sx)*SC,(-G.camY+sy)*SC);
  // tiles
  const c0=Math.max(0,Math.floor(G.cam/T)-1), c1=Math.min(G.w-1,Math.floor((G.cam+VW)/T)+1);
  for(let c=c0;c<=c1;c++){ const col=G.cols[c];
    for(let r=0;r<ROWS;r++){ const v=col[r]; if(!v) continue; const x=c*T, y=r*T;
      if(v===1){ const top=!(r>0&&col[r-1]===1);
        /* solid color underneath first: if iOS ever drops the tile art, the ground still shows */
        ctx.fillStyle=TILE.P.fill; ctx.fillRect(x,y+(top?12:0),T+.5,T+.5-(top?12:0)); if(top){ ctx.fillStyle=TILE.P.top; ctx.fillRect(x,y,T+.5,13); }
        ctx.drawImage(top?TILE.top:TILE.fill,x,y,T+.5,T+.5); }
      else if(v===2) ctx.drawImage(IMG.brick,x,y,T,T);
      else if(v===3||v===8||v===9||v===10||v===11){ const bob=Math.sin(G.t*4+c)*1.5; ctx.drawImage(IMG.bonus,x,y+bob,T,T); }
      else if(v===4) ctx.drawImage(IMG.used,x,y,T,T);
      else if(v===5){ if(r===0||col[r-1]!==5) ctx.drawImage(IMG.barrier,x-6,y-4,T+12,T*2+4); }
      else if(v===6) drawGate(x,y,(r===0||col[r-1]!==6));
      else if(v===7){ ctx.fillStyle=G.lv.world===3?"#7b4dff":G.lv.world>=4?"#e86a8a":"#8a5a35"; roundRect(x,y,T,12,5); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.35)"; ctx.fillRect(x+3,y+2,T-6,2); }
    }
  }
  // entities
  for(const e of G.ents) drawEnt(e);
  // shots
  for(const s of G.shots){
    if(s.k==="orb"||s.k==="smoke"){ const g=ctx.createRadialGradient(s.x,s.y,2,s.x,s.y,s.r*1.6); g.addColorStop(0,"#f3d1ff"); g.addColorStop(.4,s.k==="smoke"?"#b05cff":"#7b2cbf"); g.addColorStop(1,"rgba(80,0,120,0)"); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*1.6,0,7); ctx.fill(); }
    else if(s.k==="bolt"){ ctx.strokeStyle="#ffe14d"; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(s.x,s.y-16); ctx.lineTo(s.x-7,s.y-2); ctx.lineTo(s.x+5,s.y+2); ctx.lineTo(s.x-3,s.y+16); ctx.stroke(); }
    else if(s.k==="wave"){ ctx.fillStyle="rgba(255,200,61,.85)"; ctx.beginPath(); ctx.ellipse(s.x,s.y,22,12,0,0,7); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.7)"; ctx.beginPath(); ctx.ellipse(s.x,s.y-3,12,5,0,0,7); ctx.fill(); }
  }
  if(G.boss) drawBoss();
  drawPlayer();
  for(const s of (G.pshots||[])) drawSparkOrb(s.x,s.y,11,s.t);
  // particles
  for(const q of G.parts){
    if(q.k==="tok"){ ctx.drawImage(IMG.token,q.x-14,q.y-14,28,28); }
    else if(q.k==="bump"){ }
    else if(q.k==="zap"){ ctx.strokeStyle="#fff36b"; ctx.lineWidth=3; ctx.globalAlpha=Math.min(1,q.t*4); for(let i=0;i<6;i++){ const a=i*1.05+q.t*20; ctx.beginPath(); ctx.moveTo(q.x,q.y); ctx.lineTo(q.x+Math.cos(a)*(40-q.t*80),q.y+Math.sin(a)*(40-q.t*80)); ctx.stroke(); } ctx.globalAlpha=1; }
    else if(q.k==="block"){ ctx.strokeStyle="#ffc83d"; ctx.lineWidth=5; ctx.globalAlpha=q.t*3; ctx.beginPath(); ctx.arc(q.x,q.y,(0.3-q.t)*120+10,0,7); ctx.stroke(); ctx.globalAlpha=1; }
    else if(q.k==="stars"){ ctx.fillStyle="#ffe14d"; for(let i=0;i<5;i++){ const a=i/5*6.28+G.t*6; ctx.beginPath(); ctx.arc(q.x+Math.cos(a)*30*(1.6-q.t),q.y-10+Math.sin(a)*12,5,0,7); ctx.fill(); } }
    else if(q.k==="spark"||q.k==="tele"||q.k==="splash"){ const k=q.k==="splash"?"#6fd3ff":q.k==="tele"?"#ff5fa2":"#7dffa6"; ctx.strokeStyle=k; ctx.lineWidth=4; ctx.globalAlpha=Math.min(1,q.t*2); ctx.beginPath(); ctx.arc(q.x,q.y,(0.8-q.t)*90+8,0,7); ctx.stroke(); ctx.globalAlpha=1; }
  }
  if(G.freeze>0){ ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle="rgba(120,200,255,.12)"; ctx.fillRect(0,0,W,H); }
}
function roundRect(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawGate(x,y,top){
  ctx.fillStyle="#3b1d5a"; ctx.fillRect(x+4,y,T-8,T); ctx.fillStyle="#b79bff"; for(let i=0;i<3;i++) ctx.fillRect(x+9+i*12,y,5,T);
  ctx.fillStyle="#ffc83d"; ctx.fillRect(x+4,y+T/2-3,T-8,6);
  if(top){ ctx.fillStyle="#ffc83d"; roundRect(x+12,y+6,24,20,5); ctx.fill(); ctx.strokeStyle="#ffc83d"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(x+24,y+6,7,Math.PI,0); ctx.stroke(); ctx.fillStyle="#3b1d5a"; ctx.fillRect(x+22,y+12,4,8); }
}
function drawSprite(im,frames,fi,x,yBottom,h,face,alpha){
  const fw=im.width/frames, fh=im.height, w=fw*h/fh;
  ctx.save(); ctx.globalAlpha=alpha==null?1:alpha; ctx.translate(x,yBottom); if(face<0) ctx.scale(-1,1);
  ctx.drawImage(im,fi*fw,0,fw,fh,-w/2,-h,w,h); ctx.restore();
}
function drawPlayer(){
  const p=G.p, im=IMG["spr_"+G.ch.id];
  let fi=0; if(!p.ground) fi=7; else if(Math.abs(p.vx)>25) fi=1+(Math.floor(p.anim)%6);
  const blink=p.inv>0&&Math.floor(p.inv*14)%2===0;
  if(p.shield>0){ ctx.fillStyle="rgba(150,120,255,.25)"; ctx.strokeStyle="rgba(200,180,255,.9)"; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(p.x+p.w/2,p.y+p.h/2,46,60,0,0,7); ctx.fill(); ctx.stroke(); }
  if(blocking()){ const a=.55+.25*Math.sin(G.t*20); ctx.save(); ctx.globalAlpha=a; const g=ctx.createRadialGradient(p.x+p.w/2,p.y+p.h/2,10,p.x+p.w/2,p.y+p.h/2,70); g.addColorStop(0,"rgba(255,215,94,.05)"); g.addColorStop(.75,"rgba(255,200,61,.35)"); g.addColorStop(1,"rgba(255,200,61,.9)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(p.x+p.w/2,p.y+p.h/2,52,66,0,0,7); ctx.fill(); ctx.globalAlpha=1; ctx.drawImage(IMG.token,p.x+p.w/2+p.face*30-18,p.y+20,36,36); ctx.restore(); }
  if(p.slow>0){ ctx.fillStyle="rgba(226,51,69,.25)"; ctx.beginPath(); ctx.ellipse(p.x+p.w/2,p.y+p.h/2,40,56,0,0,7); ctx.fill(); }
  if(G.spark){ ctx.save(); ctx.globalAlpha=.35+.2*Math.sin(G.t*14); ctx.strokeStyle="#8ff0ff"; ctx.lineWidth=3; ctx.beginPath(); for(let i=0;i<10;i++){ const a=i/10*6.28+G.t*3, rr=44+Math.sin(G.t*30+i)*6; const X=p.x+p.w/2+Math.cos(a)*rr*.8, Y=p.y+p.h/2+Math.sin(a)*rr; i?ctx.lineTo(X,Y):ctx.moveTo(X,Y); } ctx.closePath(); ctx.stroke(); ctx.restore(); }
  ctx.fillStyle="rgba(0,0,0,.18)"; if(p.ground){ ctx.beginPath(); ctx.ellipse(p.x+p.w/2,p.y+p.h,22,5,0,0,7); ctx.fill(); }
  drawSprite(im,8,fi,p.x+p.w/2,p.y+p.h+3,118,p.face,blink?.35:1);
}
function drawEnt(e){
  const bob=Math.sin(e.t*3)*4;
  switch(e.type){
    case "token": ctx.drawImage(IMG.token,e.x-15,e.y-15+bob,30,30); break;
    case "spark": drawSparkOrb(e.x,e.y+bob,20,e.t); break;
    case "water": ctx.drawImage(IMG.water,e.x-12,e.y-22+bob,24,44); break;
    case "heart": ctx.drawImage(IMG.heart,e.x-16,e.y-15+bob,32,30); break;
    case "crystal": { ctx.save(); ctx.shadowColor="#5dff8a"; ctx.shadowBlur=18; ctx.drawImage(IMG.crystal,e.x-22,e.y-26+bob,44,44); ctx.restore(); break; }
    case "clue": { ctx.save(); ctx.shadowColor="#ffe14d"; ctx.shadowBlur=16+Math.sin(e.t*5)*6; ctx.drawImage(IMG.clue,e.x-20,e.y-24+bob,40,46); ctx.restore(); break; }
    case "flag": { const im=IMG.flag, h=e.got?118:110; ctx.globalAlpha=e.got?1:.9; ctx.drawImage(im,e.x-h*im.width/im.height/2,e.y-h,h*im.width/im.height,h); ctx.globalAlpha=1; break; }
    case "spring": { const s=e.sq>0?.55:1; ctx.fillStyle="#ff5fa2"; roundRect(e.x-22,e.y-20*s,44,10,4); ctx.fill(); ctx.strokeStyle="#ffc83d"; ctx.lineWidth=4; ctx.beginPath(); for(let i=0;i<4;i++){ ctx.moveTo(e.x-14,e.y-(i+.5)*5*s); ctx.lineTo(e.x+14,e.y-(i+1)*5*s); } ctx.stroke(); ctx.fillStyle="#7b4dff"; ctx.fillRect(e.x-24,e.y-4,48,4); break; }
    case "mover": { ctx.fillStyle=G.lv.world===3?"#7b4dff":G.lv.world>=4?"#ff8fb1":"#ffc83d"; roundRect(e.x,e.y,e.w,e.h,8); ctx.fill(); ctx.fillStyle="rgba(255,255,255,.45)"; ctx.fillRect(e.x+8,e.y+3,e.w-16,3); ctx.fillStyle="rgba(0,0,0,.2)"; ctx.fillRect(e.x+8,e.y+e.h-5,e.w-16,3); break; }
    case "sign": case "gatehint": { const txt=e.type==="gatehint"?(G.ch.id==="theo"||G.ch.id==="luciana"?"Locked room ahead! Use your power to open it.":"Locked room ahead! Touch the gate to answer a Warrior Card."):e.text;
      ctx.font="700 15px 'Atkinson Hyperlegible',sans-serif"; const w=Math.min(260,ctx.measureText(txt).width+20);
      ctx.fillStyle="#6b4a2b"; ctx.fillRect(e.x-3,e.y-70,6,70);
      ctx.fillStyle="#fff7e6"; roundRect(e.x-w/2,e.y-118,w,54,10); ctx.fill(); ctx.strokeStyle="#6b4a2b"; ctx.lineWidth=3; ctx.stroke();
      ctx.fillStyle="#2b0a3a"; ctx.textAlign="center"; wrap(txt,e.x,e.y-98,w-16,17); ctx.textAlign="left"; break; }
    case "agent": case "thrower": {
      const im=IMG.spr_agent; let fi=e.dead?4:(e.type==="agent"?Math.floor(e.t*7)%4:(e.throwT>0?1:0));
      if(e.type==="thrower"&&!e.dead){ ctx.fillStyle="rgba(176,92,255,.5)"; ctx.beginPath(); ctx.arc(e.x+e.w/2,e.y-8,6+Math.sin(e.t*6)*2,0,7); ctx.fill(); }
      drawSprite(im,5,fi,e.x+e.w/2,e.y+e.h+2,96,(e.face||-1)*-1, e.dead?Math.min(1,e.deadT*2):1);
      if(G.freeze>0&&!e.dead){ ctx.fillStyle="rgba(140,210,255,.35)"; ctx.fillRect(e.x,e.y,e.w,e.h); }
      break; }
    case "cloud": { const im=IMG.cloud; const fi=e.dead?2:(e.charge>0?1:0); drawSprite(im,3,fi,e.x,e.y+30+bob*.5,62,1,e.dead?Math.min(1,e.deadT*2):1); break; }
  }
}
function wrap(t,x,y,maxW,lh){ const words=t.split(" "); let line="",yy=y; for(const w of words){ const tl=line?line+" "+w:w; if(ctx.measureText(tl).width>maxW&&line){ ctx.fillText(line,x,yy); line=w; yy+=lh; } else line=tl; } ctx.fillText(line,x,yy); }
function drawBoss(){
  const b=G.boss, im=IMG["boss"+b.n]; const s=Math.max(b.w/im.width*1.35,b.h/im.height*1.12);
  const w=im.width*s, h=im.height*s; const cx=b.x+b.w/2, by=b.y+b.h+ (b.k===3?10:4);
  ctx.save();
  if(b.open&&b.st!=="dead"){ ctx.shadowColor="#ffe14d"; ctx.shadowBlur=30+Math.sin(G.t*10)*10; }
  if(b.flash>0&&Math.floor(b.flash*20)%2===0) ctx.globalAlpha=.4;
  if(b.st==="dead") ctx.globalAlpha=Math.max(0,b.st_t/2.2);
  ctx.translate(cx,by); const face=b.k===3?1:(b.face>0?-1:1); ctx.scale(face,1);
  if(b.k===2&&b.st==="dizzy") ctx.rotate(Math.sin(G.t*8)*.06);
  if(b.slump) ctx.scale(1,1-.3*b.slump);
  ctx.drawImage(im,-w/2,-h,w,h); ctx.restore();
  if(b.k===2&&b.st==="dizzy"){ ctx.fillStyle="#ffe14d"; for(let i=0;i<4;i++){ const a=G.t*5+i*1.57; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*50,b.y+10+Math.sin(a)*12,6,0,7); ctx.fill(); } }
  if(b.open&&b.st!=="dead"){ ctx.fillStyle="#ffe14d"; ctx.font="28px 'Lilita One',sans-serif"; ctx.textAlign="center"; ctx.fillText("▼ STOMP! ▼",cx,b.y+b.h*.3*(b.slump||0)-14+Math.sin(G.t*8)*4); ctx.textAlign="left"; }
  if(G.freeze>0){ ctx.fillStyle="rgba(140,210,255,.25)"; ctx.fillRect(b.x,b.y,b.w,b.h); }
}

function loop(now){
  requestAnimationFrame(loop);
  if(!G) return;
  const dt=Math.min(.033,(now-lastT)/1000); lastT=now;
  if(running&&G.state==="play"){ const st=dt/2; update(st); if(G.state==="play"&&running) update(st); }
  draw();
}

/* ---------------- warrior cards ---------------- */
/* No repeats: cards already answered are remembered (save.seen) and only come back once the whole deck has been seen.
   Each mission tries cards about its own topic first. */
const TOPIC={1:/pain|crisis|real|believe|feel/i,2:/sport|exercis|play|active|water/i,3:/hydroxyurea|treat|medicine|transplant|gene|research|cure/i,
  4:/chest|lung|breath|spirometer|cough|oxygen|ACS/i,5:/stroke|brain|TCD|transcranial|doppler/i,6:/kidney|urine|pee|bathroom|bedwet|renal|blood pressure/i};
function pickCard(){
  const pool=CARDS.filter(c=>c.lvl!=="teen"); if(!pool.length) return null;
  save.seen=save.seen||[]; let fresh=pool.filter(c=>!save.seen.includes(c.id));
  if(!fresh.length){ save.seen=[]; fresh=pool; }
  const re=G&&TOPIC[G.n], on=re?fresh.filter(c=>(c.topic==="acs"&&G.n===4)||re.test(c.q)):[];
  const kid=a=>a.filter(c=>c.lvl==="kid"||c.topic);
  const from=[kid(on),on,kid(fresh),fresh].find(a=>a.length), c=from[Math.random()*from.length|0];
  save.seen.push(c.id); persist(); return c;
}
let cardCb=null;
function askCard(head,cb,skippable){
  cardCb=cb; const c=pickCard();
  musicOn(false);
  if(!c){ cb(true); return; }
  $("qHead").textContent=head; $("qQ").textContent=c.q; $("qFb").textContent="";
  const box=$("qA"); box.innerHTML="";
  c.a.forEach((a,i)=>{ const b=document.createElement("button"); b.textContent=a; b.onclick=()=>{
    [...box.children].forEach(x=>x.disabled=true);
    const ok=i===c.c; b.classList.add(ok?"ok":"no"); if(!ok) box.children[c.c].classList.add("ok");
    beep(ok?"ok":"no"); $("qFb").textContent=ok?"Correct! Warrior power!":"The answer is: "+c.a[c.c];
    if(ok){ post({type:"bonus",correct:true}); G.tokens+=5; $("hTok").textContent=G.tokens; }
    setTimeout(()=>{ show(null); musicOn(true); const f=cardCb; cardCb=null; f&&f(ok); }, ok?900:2200);
  }; box.appendChild(b); });
  $("qSkip").classList.toggle("hide",!skippable);
  show("sCard",true);
}
$("qSkip").onclick=()=>{ show(null); musicOn(true); const f=cardCb; cardCb=null; f&&f(false); };

/* ---------------- menus ---------------- */
function show(id,clear){
  const s=$("scr");
  document.querySelectorAll(".pane").forEach(p=>p.classList.toggle("on",p.id===id));
  s.classList.toggle("off",!id); s.classList.toggle("clear",!!clear||id==="sPause"||id==="sCard");
}
document.querySelectorAll("[data-back]").forEach(b=>b.onclick=()=>show(b.dataset.back));
$("storyTx").textContent=WM.STORY;
$("playBtn").onclick=()=>{ ac(); buildChars(); show("sChar"); };
const exitApp=()=>{ musicOn(false); if(window.parent!==window) post({type:"exit"}); else history.back(); };
$("exitBtn").onclick=exitApp; $("rotExit").onclick=exitApp;
function buildChars(){
  const g=$("charGrid"); g.innerHTML="";
  WM.CHARS.forEach(c=>{ const b=document.createElement("button"); b.className="cc"+(unlocked(c)?"":" lock")+(save.char===c.id?" sel":"");
    b.innerHTML='<img src="../runner/faces/'+c.id+'.webp" alt=""><b>'+c.name+'</b>';
    b.onclick=()=>{ if(unlocked(c)) { save.char=c.id; persist(); } info(c); [...g.children].forEach((x,i)=>x.classList.toggle("sel",WM.CHARS[i].id===save.char)); };
    g.appendChild(b); });
  info(CH[save.char]);
}
function info(c){ $("charInfo").innerHTML=unlocked(c)?'<b>'+c.name+'</b> · '+c.hb+'<br>Power: <b style="font-size:16px">'+c.power+'</b> — '+c.powerDesc+(c.doc?'<br><small>Doctors don\'t have sickle cell, so no water meter!</small>':''):'<b>'+c.name+'</b><br>🔒 '+c.unlockText; }
$("charGo").onclick=()=>{ if(!unlocked(CH[save.char])) save.char="malcolm"; buildMissions(); show("sMission"); };
function buildMissions(){
  const g=$("misGrid"); g.innerHTML="";
  WM.MISSIONS.forEach(m=>{ const open=m.n===1||save.done[m.n-1]; const b=document.createElement("button");
    if(m.n===4){ const h=document.createElement("div"); h.className="mhead"; h.innerHTML="🔬 Inside the Body <span>Shrink down with the Amos Lab Micro-Shrinker</span>"; g.appendChild(h); }
    b.className="mc"+(open?"":" lock"); b.style.backgroundImage="url("+m.bg+")";
    const best=save.best[m.n];
    b.innerHTML='<img class="kid" src="img/'+m.kid+'.webp" alt=""><small>Mission '+m.n+(save.done[m.n]?' · ✓ Cleared':'')+'</small><b>'+m.title+'</b><span>Help '+m.kidName+' bust the myth '+m.myth+'</span>'+(best?'<div class="st"><span>💎 '+best.crystals+'/3</span><span>🪙 '+best.tokens+'</span></div>':'');
    b.onclick=()=>{ if(!open) return; brief(m); }; g.appendChild(b); });
}
function brief(m){
  $("brKid").src="img/"+m.kid+".webp"; $("brNum").textContent="Mission "+m.n+" · "+m.kidName+(typeof m.kidAge==="number"?", age "+m.kidAge:" · "+m.kidAge); $("brTitle").textContent=m.title;
  $("brNeed").textContent=m.need; $("brMyth").textContent=m.myth; $("brBoss").textContent=m.boss; $("brBossImg").src=m.bossImg;
  $("brGo").onclick=()=>playIntro(m.n); show("sBrief");
}
function playIntro(n){
  ac();
  // unlock audio on this tap so music and voices can play after the cutscene (iOS)
  try{ music.muted=true; music.play().then(()=>{ music.pause(); music.muted=false; }).catch(()=>{ music.muted=false; }); }catch(e){}
  try{ if(!voiceEl) voiceEl=new Audio(); voiceEl.muted=true; voiceEl.src="voice/"+(save.char||"malcolm")+"/start.mp3"; voiceEl.play().then(()=>{ voiceEl.pause(); voiceEl.muted=false; }).catch(()=>{ voiceEl.muted=false; }); }catch(e){}
  const cut=$("cut"), v=$("cutVid"); let done=false;
  const finish=()=>{ if(done) return; done=true; v.pause(); v.removeAttribute("src"); v.load(); cut.classList.add("hide"); startMission(n); };
  show(null); cut.classList.remove("hide");
  v.onended=finish; v.onerror=finish; $("cutSkip").onclick=finish;
  v.src="vid/intro"+n+".mp4"; v.currentTime=0;
  const pr=v.play(); if(pr&&pr.catch) pr.catch(()=>{ v.muted=true; v.play().catch(finish); });
}
function pause(){ if(!G||G.state!=="play"||!running) return; G.state="pause"; musicOn(false); K.l=K.r=K.j=false; show("sPause"); }
$("pauseBtn").onclick=pause;
$("resumeBtn").onclick=()=>{ G.state="play"; lastT=performance.now(); show(null); musicOn(true); };
$("musicBtn").onclick=()=>{ save.music=!save.music; persist(); $("musicBtn").textContent="Music: "+(save.music?"on":"off"); };
$("voiceBtn").onclick=()=>{ save.voice=!save.voice; persist(); $("voiceBtn").textContent="Voices: "+(save.voice?"on":"off"); };
$("musicBtn").textContent="Music: "+(save.music?"on":"off"); $("voiceBtn").textContent="Voices: "+(save.voice?"on":"off");
$("restartBtn").onclick=()=>{ const p=G.p; Object.assign(p,{x:G.check.x,y:G.check.y,vx:0,vy:0,inv:1.5}); G.state="play"; lastT=performance.now(); show(null); musicOn(true); };
$("quitBtn").onclick=()=>{ running=false; G.state="quit"; musicOn(false); $("hud").classList.add("hide"); $("pad").classList.add("hide"); buildMissions(); show("sMission"); };
$("wMenu").onclick=()=>{ buildMissions(); show("sMission"); };
$("wNext").onclick=()=>{ const m=WM.MISSIONS[G.n]; if(m) brief(m); };

/* ---------------- boot ---------------- */
window.wmDebug = { get G(){ return G; }, TILE, pickCard, start:startMission, save:()=>save, K, tile:(c,r)=>tile(c,r), solid:(c,r)=>isSolid(c,r) };
loadAll().then(()=>{ $("loading").classList.add("hide"); show("sTitle"); requestAnimationFrame(loop); });
})();
