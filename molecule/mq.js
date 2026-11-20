"use strict";
/* =====================================================================
   Hemoglobin Heroes — Warriors Thrive
   Dr. Amos and the Warriors shrink into the molecular world to see how
   sickle cell works and how each treatment fights back.
   ===================================================================== */
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const EMBED=window.parent!==window;
function post(m){if(EMBED)try{parent.postMessage({source:"warriors-thrive-molecule",...m},location.origin)}catch{}}
const app=store.get("wt-state-v1",null),prof=(app&&app.profile)||{};
const AGE=(()=>{if(prof.birthday){const b=new Date(prof.birthday+"T12:00"),n=new Date();let a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return a}return{"5-7":6,"8-12":10,"13-17":15,"18-22":20}[prof.ageGroup]??null})();
let LVL=store.get("wt-mq-lvl",AGE!=null&&AGE>=13?"teen":"kid");

const CH={amos:{name:"Dr. Amos"},amos_cheer:{name:"Dr. Amos"},kim:{name:"Dr. Kim"},malcolm:{name:"Malcolm"},tasha:{name:"Tasha"},theo:{name:"Theo"},ritika:{name:"Ritika"},luciana:{name:"Luciana"},krystal:{name:"Krystal"}};
const OBJ=["alpha","beta","betaS","gamma","rbc","sickle","capsule","radical","antibody","pselectin","bacteria","folate","iron","chelator","stem","cas9","vector","cox","receptor","packet","title"];
const imgs={};
function load(){const list=[...OBJ.map(o=>"obj/"+o+".webp"),...Object.keys(CH).map(c=>"char/"+c+".webp"),"bg/map.webp",...Array.from({length:10},(_,i)=>`bg/b${i+1}.webp`),"../runner/img/crystal.webp"];
 let n=0;return new Promise(res=>{list.forEach(src=>{const i=new Image();i.decoding="async";const done=()=>{n++;$("loadBar").style.width=(n/list.length*100)+"%";if(n===list.length)res()};i.onload=done;i.onerror=done;i.src=src;imgs[src]=i});setTimeout(res,9000)})}
const ratio=name=>{const i=imgs["obj/"+name+".webp"];return i&&i.naturalWidth?i.naturalHeight/i.naturalWidth:1};

/* ---------------- audio ---------------- */
let AC=null;function audio(){if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch{}if(AC&&AC.state==="suspended")AC.resume()}
function tone(f,d=.1,type="sine",v=.1,slide=0){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.02)}
const sfx={snap(){tone(660,.08,"triangle",.1);setTimeout(()=>tone(990,.1,"triangle",.1),60)},pop(){tone(520,.12,"sine",.12,2.2)},bad(){tone(220,.25,"sawtooth",.08,.6)},win(){[523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>tone(f,.2,"triangle",.1),i*90))},tick(){tone(880,.04,"sine",.05)},zap(){tone(1200,.15,"square",.05,.3)}};

/* ---------------- progress ---------------- */
let SAVE=store.get("wt-mq",{done:{}});
const saveP=()=>store.set("wt-mq",SAVE);
const doneCount=()=>Object.keys(SAVE.done).length;

/* =====================================================================
   BOARDS
   ===================================================================== */
const BOARDS=[
{id:"b1",title:"Build Hemoglobin",med:"How blood carries oxygen",guide:"luciana",icon:"alpha",bg:"bg/b1.webp",
 intro:[["amos","Welcome to the <em>Amos Lab Micro-Shrinker</em>, Warriors! We're about to shrink smaller than a speck of dust."],
        ["luciana","Whoa! We're INSIDE a red blood cell!"],
        ["amos","Every red blood cell is packed with about <em>270 million</em> tiny machines called <i>hemoglobin</i>. Their job: carry oxygen to your whole body."],
        ["amos","Each hemoglobin is built from <em>4 pieces</em>: two <i>alpha</i> pieces and two <i>beta</i> pieces. Luciana, let's build one!"]],
 outro:[["luciana","We built it! And it grabbed all 4 oxygens!"],["amos","That's normal hemoglobin, called <em>hemoglobin A</em>. Remember those <i>beta</i> pieces. That's where sickle cell begins."]],
 learn:{kid:[["🧩","Hemoglobin is built from 4 pieces: 2 alpha and 2 beta."],["🫧","Each hemoglobin carries 4 oxygen bubbles."],["❤️","Red blood cells carry hemoglobin all over your body."]],
        teen:[["🧩","Adult hemoglobin (HbA) is a tetramer: two α-globin + two β-globin chains (α2β2)."],["🫧","Each chain holds a heme group with iron that binds one O₂, so each hemoglobin carries 4 O₂."],["🧬","α-globin genes are on chromosome 16; the β-globin gene (HBB) is on chromosome 11. Sickle cell is a change in HBB."]]},
 quiz:[{q:"How many pieces make one hemoglobin?",a:["2","4","10","1"],c:1,why:"Two alpha pieces + two beta pieces = 4."},
       {q:"What does hemoglobin carry around the body?",a:["Oxygen","Sugar","Germs","Water"],c:0,why:"Each hemoglobin can carry 4 oxygen molecules."}],
 game:gameBuild},
{id:"b2",title:"The Inheritance Quest",med:"How sickle cell is inherited",guide:"tasha",icon:"chromo",bg:"bg/b2.webp",
 intro:[["amos","Welcome to the <em>Chromosome Hall</em>. This is where the instructions for your body are stored."],
        ["tasha","So how does someone get sickle cell?"],
        ["amos","Everyone gets <em>two</em> beta-globin genes: one from each parent. If you get two sickle genes, you have <i>sickle cell disease</i>. One sickle gene and one usual gene is <i>sickle cell trait</i>."],
        ["kim","I have sickle cell trait! It usually doesn't make me sick, but I can pass the gene on."],
        ["amos","Let's fill in a <em>Punnett square</em>. Tap each box to see what a child could inherit."]],
 outro:[["tasha","So two parents with trait can have a child with sickle cell, a child with trait, or a child without either!"],["amos","Exactly. Sickle cell is <em>never</em> caught like a cold. You're born with it, from your genes."]],
 learn:{kid:[["🧬","You get one beta gene from each parent."],["🟡🔴","One sickle gene + one usual gene = sickle cell trait (HbAS)."],["🔴🔴","Two sickle genes = sickle cell disease (HbSS)."],["🔴🟢","Sickle + hemoglobin C gene = HbSC, another kind of sickle cell disease."],["🙅🏾","You can't catch sickle cell. You're born with it."]],
        teen:[["🧬","Autosomal recessive inheritance: each parent passes one HBB allele."],["🎲","Two trait (AS) parents: each pregnancy has a 25% chance HbSS, 50% HbAS (trait), 25% HbAA."],["🧪","Common types of sickle cell disease: HbSS, HbSC, HbSβ⁰-thalassemia and HbSβ⁺-thalassemia."],["🩸","Newborn screening in every US state finds sickle cell disease and trait at birth."]]},
 quiz:[{q:"Two parents both have sickle cell trait (AS). What is the chance each child has sickle cell disease (SS)?",a:["0%","1 in 4 (25%)","1 in 2 (50%)","100%"],c:1,why:"Only 1 of the 4 boxes in the Punnett square is SS."},
       {q:"Can you catch sickle cell from a friend?",a:["Yes, by sharing a drink","No, you are born with it","Yes, by hugging","Only in winter"],c:1,why:"Sickle cell is inherited from your parents' genes. It is not contagious."}],
 game:gamePunnett},
{id:"b3",title:"One Letter, Big Change",med:"The sickle mutation",guide:"theo",icon:"sickle",bg:"bg/b3.webp",
 intro:[["theo","Dr. Amos, why do some red blood cells turn into banana shapes?"],
        ["amos","It all comes down to <em>one letter</em> in the beta-globin gene. Genes are written in 4 letters: A, T, G and C."],
        ["amos","Look closely at the healthy gene and the sickle gene. <em>Tap the one letter that changed.</em>"]],
 outro:[["theo","When oxygen dropped, the sticky hemoglobin snapped into long stiff fibers and bent the cell into a sickle!"],["amos","Sickled cells are stiff and sticky. They can jam small blood vessels and block blood flow. That's what causes a <em>pain crisis</em>, and they break apart early, causing <em>anemia</em>."]],
 learn:{kid:[["🔤","One tiny letter change in the beta gene makes sickle hemoglobin (HbS)."],["🧲","HbS has a sticky spot."],["🫁","When oxygen is low, HbS sticks together into long stiff chains."],["🌙","The chains bend the cell into a sickle shape."],["🚧","Sickle cells can get stuck and block blood flow, which causes pain."]],
        teen:[["🔤","Point mutation in codon 6 of HBB: GAG → GTG, so glutamic acid becomes valine (β6 Glu→Val)."],["🧲","Valine creates a hydrophobic sticky patch on the outside of deoxygenated HbS."],["🧵","Deoxy-HbS polymerizes into long fibers that distort the cell (sickling)."],["🚧","Rigid, adhesive cells cause vaso-occlusion (pain crises, organ damage) and hemolysis (anemia)."],["🌡️","Triggers that raise sickling: low oxygen, dehydration, cold, infection, fever."]]},
 quiz:[{q:"What makes sickle hemoglobin stick together?",a:["Too much sugar","A sticky spot from one changed building block","Germs","Cold water"],c:1,why:"GAG→GTG swaps glutamic acid for valine, which makes a sticky spot."},
       {q:"When does sickle hemoglobin form long stiff chains?",a:["When oxygen is low","When you sleep well","When you drink water","Never"],c:0,why:"Low oxygen lets HbS molecules link into fibers that bend the cell."}],
 game:gameMutation},
{id:"b4",title:"Hydroxyurea: Turn On the Shield",med:"Hydroxyurea",guide:"ritika",icon:"capsule",bg:"bg/b4.webp",
 intro:[["ritika","We're in the gene control room inside the bone marrow!"],
        ["amos","Before you were born, your body made <em>fetal hemoglobin</em>, HbF. It uses <i>gamma</i> pieces instead of beta pieces, and it <em>can't join sickle chains</em>."],
        ["amos","After birth, the gamma switch turns OFF. <em>Hydroxyurea</em> helps turn it back ON. Ritika, drag the capsule to the switch!"]],
 outro:[["ritika","Every HbF we sent in broke the sickle chain!"],["amos","That's why we take hydroxyurea <em>every single day</em>. More HbF means fewer sickled cells, fewer pain crises and less acute chest syndrome."]],
 learn:{kid:[["💊","Hydroxyurea turns the fetal hemoglobin (HbF) switch back ON."],["🛡️","HbF can't join sickle chains, so cells stay round."],["📅","It works best when you take it every day."],["🩸","Your care team checks your blood counts to keep the dose just right."]],
        teen:[["💊","Hydroxyurea raises HbF (α2γ2) by reactivating γ-globin production in red cell precursors."],["🛡️","HbF doesn't co-polymerize with HbS, so it dilutes and blocks polymer formation."],["⚙️","It also lowers white cells and platelets, makes red cells larger (higher MCV) and less sticky, and releases nitric oxide."],["📉","Proven to reduce pain crises, acute chest syndrome, transfusions and hospital stays, and linked to longer survival."],["🩸","Needs regular blood counts. It takes a few months to reach full effect."]]},
 quiz:[{q:"What does hydroxyurea turn on?",a:["Fetal hemoglobin (HbF)","Sickle hemoglobin","The heart","Pain signals"],c:0,why:"It reactivates the gamma-globin switch so the body makes more HbF."},
       {q:"Why does HbF help?",a:["It makes cells sticky","It can't join sickle chains, so cells stay round","It adds sugar","It kills germs"],c:1,why:"HbF breaks up HbS polymer chains."}],
 safety:"Take hydroxyurea exactly as prescribed, every day, and keep your lab appointments. Wash hands after touching capsules. Talk to your care team before stopping.",
 game:gameHU},
{id:"b5",title:"L-Glutamine: Antioxidant Armor",med:"L-glutamine (Endari)",guide:"krystal",icon:"packet",bg:"bg/b5.webp",
 intro:[["krystal","What are those spiky purple things in the sky?"],
        ["amos","Those are <em>free radicals</em>, from oxidative stress. Sickle cells get hit by them a lot, which damages the cell's outer wall."],
        ["amos","<i>L-glutamine</i> powders up the cell's own antioxidant shields, called <em>NAD</em> and <em>glutathione</em>. Tap the radicals before they reach the cell, and use the glutamine boost for a shield!"]],
 outro:[["krystal","The shield blocked them all!"],["amos","L-glutamine is a powder mixed into a drink or food, usually twice a day. It helps protect red cells and can lower the number of pain crises."]],
 learn:{kid:[["⚡","Free radicals are tiny troublemakers that hurt red blood cells."],["🛡️","L-glutamine helps cells build their own antioxidant shields."],["🥤","It's a powder you mix into a cool drink or soft food."]],
        teen:[["⚡","Sickle red cells are under high oxidative stress, which damages membranes and speeds hemolysis."],["🧪","L-glutamine is a precursor for NAD⁺/NADH and glutathione, the cell's main antioxidant systems."],["📉","In its phase 3 trial it reduced pain crises and hospital stays. FDA-approved for age 5 and up."],["🥤","Taken as a powder twice daily, mixed in a cold or room-temperature drink or soft food."]]},
 quiz:[{q:"What does L-glutamine help red blood cells fight?",a:["Free radicals (oxidative stress)","Gravity","Bacteria only","Sunshine"],c:0,why:"It boosts antioxidants like NAD and glutathione."},
       {q:"How is L-glutamine usually taken?",a:["As a powder mixed in a drink or soft food","As a shot in the eye","Only in the hospital","As a cream"],c:0,why:"It comes as a powder, usually twice a day."}],
 game:gameGlutamine},
{id:"b6",title:"Unstick the Vessel Wall",med:"Crizanlizumab (Adakveo)",guide:"malcolm",icon:"antibody",bg:"bg/b6.webp",
 intro:[["malcolm","We're in a blood vessel, and the wall has sticky hooks popping up!"],
        ["amos","Those hooks are a protein called <em>P-selectin</em>. They grab passing cells, and a pile-up can block the vessel."],
        ["amos","<i>Crizanlizumab</i> is an <em>antibody</em> that covers P-selectin so cells roll right by. Tap each hook as it pops up to send an antibody!"]],
 outro:[["malcolm","Every hook is covered and the cells are rolling free!"],["amos","Crizanlizumab is an IV infusion given about once a month. Your hematologist decides if it's right for you."]],
 learn:{kid:[["🪝","Some vessel walls have sticky hooks that grab blood cells."],["🛡️","An antibody medicine can cover the hooks so cells keep rolling."],["🏥","It's given through an IV about once a month."]],
        teen:[["🪝","P-selectin on activated endothelium and platelets helps sickle red cells, white cells and platelets stick, starting vaso-occlusion."],["🧷","Crizanlizumab is a monoclonal antibody that binds P-selectin and blocks this adhesion."],["📅","IV infusion at week 0, week 2, then every 4 weeks. US-approved for age 16+."],["⚖️","A later trial (STAND) did not confirm the benefit, and Europe withdrew approval. Your hematologist will review whether it's a good fit."]]},
 quiz:[{q:"What does crizanlizumab block?",a:["Sticky P-selectin hooks","Oxygen","Water","Bones"],c:0,why:"It's an antibody that covers P-selectin so cells don't stick."},
       {q:"How is crizanlizumab given?",a:["IV infusion about monthly","Chewable gummy","Nose spray","Eye drops"],c:0,why:"It's an infusion given about every 4 weeks."}],
 game:gameCrizan},
{id:"b7",title:"Daily Defenders",med:"Penicillin & folic acid",guide:"kim",icon:"bacteria",bg:"bg/b7.webp",
 intro:[["kim","This is the body's defense zone. See the spleen over there? It filters out germs."],
        ["amos","In sickle cell, the spleen gets damaged early, so dangerous germs like <em>pneumococcus</em> can cause serious infections."],
        ["kim","That's why young warriors take <i>penicillin</i> twice a day. It breaks open the germ's wall. Tap the germs!"]],
 outro:[["kim","And folic acid helped the bone marrow factory build new red cells!"],["amos","Penicillin plus vaccines protect against serious infection. But remember: a <em>fever</em> can still be an emergency. Call your care team right away."]],
 learn:{kid:[["🦠","In sickle cell the spleen doesn't fight germs well."],["💊","Penicillin twice a day helps stop dangerous germs (usually until age 5)."],["💉","Vaccines are extra armor."],["🥬","Folic acid helps your body build new red blood cells."],["🌡️","Fever = call your care team right away!"]],
        teen:[["🦠","Functional asplenia from repeated splenic sickling raises the risk of invasive pneumococcal infection."],["💊","Penicillin prophylaxis twice daily from infancy (typically until age 5) breaks bacterial cell walls and cuts the risk of severe infection."],["💉","Pneumococcal, meningococcal, flu and routine vaccines are essential."],["🥬","Folic acid supports the very high red cell turnover from hemolysis."],["🌡️","Fever ≥ 101°F (38.3–38.5°C) needs urgent evaluation, even on penicillin."]]},
 quiz:[{q:"Why do young warriors take penicillin every day?",a:["To prevent serious infections because the spleen is weak","To grow taller","To stop sickle cell","To sleep better"],c:0,why:"The spleen can't fight some germs well, so penicillin helps prevent infection."},
       {q:"What should you do if you have a fever?",a:["Wait a week","Call your care team right away","Take a cold bath","Nothing"],c:1,why:"With sickle cell, fever can be an emergency."}],
 game:gameDefenders},
{id:"b8",title:"Transfusion & Iron Rescue",med:"Blood transfusion & chelation",guide:"kim",icon:"chelator",bg:"bg/b8.webp",
 intro:[["kim","As a nurse, I give a lot of blood transfusions!"],
        ["amos","A <em>transfusion</em> adds healthy donor red cells with normal hemoglobin. It lowers the share of sickle hemoglobin in the blood."],
        ["kim","For stroke prevention, we usually aim to get sickle hemoglobin below <em>30%</em>. Let's add donor blood!"]],
 outro:[["kim","We got the sickle hemoglobin down AND cleared the extra iron!"],["amos","Each transfusion brings iron, and the body can't easily get rid of it. <i>Chelation</i> medicines grab extra iron so it can leave the body."]],
 learn:{kid:[["🩸","A transfusion gives you healthy donor red blood cells."],["📉","It lowers the amount of sickle hemoglobin."],["🧲","Extra iron can build up after many transfusions."],["🦀","Chelation medicine grabs extra iron so it can leave your body."]],
        teen:[["🩸","Simple or exchange transfusion lowers HbS% and raises oxygen delivery. It's used for stroke prevention, acute chest syndrome and severe anemia."],["🎯","Chronic transfusion for stroke prevention usually targets HbS < 30%."],["🧲","Repeated transfusion causes iron overload (heart, liver, glands), tracked with ferritin and MRI."],["🦀","Chelators bind iron for removal: deferasirox (pill), deferoxamine (infusion), deferiprone (pill)."]]},
 quiz:[{q:"What does a blood transfusion do?",a:["Adds healthy donor red cells and lowers sickle hemoglobin","Removes all blood","Adds sugar","Changes your genes"],c:0,why:"Donor cells carry normal hemoglobin A."},
       {q:"Why might someone need iron chelation?",a:["Iron builds up after many transfusions","To get more iron","To fix bones","For a cold"],c:0,why:"Chelators grab extra iron so it can leave the body."}],
 game:gameTransfuse},
{id:"b9",title:"Calm the Pain Signal",med:"Pain medicines & comfort",guide:"tasha",icon:"receptor",bg:"bg/b9.webp",
 intro:[["tasha","This glowing cable goes all the way up to the brain!"],
        ["amos","That's the nervous system. When sickled cells block blood flow, the tissue sends <em>pain signals</em> up the nerves, through the spinal cord, to the brain."],
        ["amos","Each pain medicine works at a different place. <em>Drag each medicine to where it works.</em>"]],
 outro:[["tasha","Different medicines calm the signal in different places, and comfort tools help too!"],["amos","Always follow your <em>pain plan</em>, take medicines only as prescribed, and get help if pain isn't getting better."]],
 learn:{kid:[["🟠","Ibuprofen works where it hurts. It calms the swelling chemicals."],["⚪","Acetaminophen works mostly in the brain."],["💊","Opioids (only from your care team) quiet pain signals in the spinal cord and brain."],["🔥💧","Heat packs, water, rest and deep breathing help too."],["📋","Follow your pain plan, and get help if pain is not getting better."]],
        teen:[["🟠","NSAIDs (ibuprofen, naproxen, ketorolac) block COX enzymes, so less prostaglandin is made at the injured tissue (less inflammation and pain)."],["⚪","Acetaminophen acts mainly in the central nervous system. It also lowers fever, so check your temperature before taking it."],["💊","Opioids (morphine, hydromorphone, oxycodone) bind μ-opioid receptors in the spinal cord and brain to dampen pain signals."],["⚠️","Opioid side effects: sleepiness, itching, constipation, slowed breathing. Use only as prescribed. Never mix with alcohol or sleep aids."],["🔥💧","Heat, hydration, distraction, breathing and rest work with medicines (multimodal pain care)."]]},
 quiz:[{q:"Where does ibuprofen mainly work?",a:["Where it hurts, by blocking the COX enzyme","In the eyes","In the stomach only","It changes your genes"],c:0,why:"NSAIDs block COX so the tissue makes fewer pain chemicals."},
       {q:"What should you do before giving acetaminophen?",a:["Check for fever, because it can hide a fever","Drink soda","Nothing","Run fast"],c:0,why:"A fever with sickle cell needs a call to your care team, and acetaminophen can hide it."}],
 safety:"Take pain medicines only as your care team prescribed. Don't double up on acetaminophen. Ask before using ibuprofen if you have kidney problems. If pain is severe, you have a fever, chest pain, or trouble breathing, get help right away.",
 game:gamePain},
{id:"b10",title:"FINAL BOARD: Gene Therapy",med:"Casgevy & Lyfgenia",guide:"amos_cheer",icon:"cas9",bg:"bg/b10.webp",final:true,
 intro:[["amos","Warriors, we made it to the <em>Gene Therapy Chamber</em>!"],
        ["amos","Gene therapy fixes the problem at the source: your <em>blood stem cells</em>, the cells in your bone marrow that make every red cell."],
        ["krystal","How do we get to them?"],
        ["amos","First, we <em>collect</em> stem cells from the blood. Tap each stem cell to collect it!"]],
 outro:[["amos_cheer","The new stem cells settled into the bone marrow and are making healthy red cells with protective hemoglobin!"],
        ["amos","Gene therapy is a <em>one-time treatment</em> but a big journey: weeks in the hospital, chemotherapy, and real risks. A bone marrow transplant from a matched donor is another possible cure. Talk with your hematologist about what's right for you."]],
 learn:{kid:[["🧫","Doctors collect your own blood stem cells."],["✂️","They EDIT a gene to turn baby hemoglobin back on (Casgevy)…"],["➕","…or ADD a working beta gene (Lyfgenia)."],["🏥","Strong medicine makes room in the bone marrow, then the fixed cells go back in."],["🌟","The new cells make red cells that don't sickle. It's a big decision to make with your care team."]],
        teen:[["🧫","Hematopoietic stem cells are mobilized (plerixafor) and collected by apheresis."],["✂️","Casgevy (exa-cel): CRISPR-Cas9 edits the BCL11A erythroid enhancer, releasing the brake on γ-globin, so HbF goes up. US-approved for age 2+ (2026)."],["➕","Lyfgenia (lovo-cel): a lentiviral vector adds an anti-sickling β-globin gene (βA-T87Q). US-approved for age 12+, with a boxed warning for blood cancer."],["💉","Myeloablative busulfan conditioning clears marrow space, then the modified cells are infused and engraft."],["⚖️","Risks: infertility, low blood counts, infection, long hospital stay. Matched-sibling bone marrow transplant is another curative option."]]},
 quiz:[{q:"What cells does gene therapy change?",a:["Blood stem cells","Hair cells","Skin cells","Teeth"],c:0,why:"Stem cells in the bone marrow make all red blood cells."},
       {q:"Casgevy uses CRISPR to turn ON which hemoglobin?",a:["Fetal hemoglobin (HbF)","Sickle hemoglobin","Hemoglobin C","None"],c:0,why:"It edits the BCL11A switch so HbF comes back on."}],
 game:gameGene}
];

/* =====================================================================
   ENGINE
   ===================================================================== */
let CUR=null; // {board, stage helpers, timers}
function show(id){["title","map","board"].forEach(s=>$(s).classList.toggle("hide",s!==id))}
function toast(t,s,ms=1400,color){const e=$("toast");e.innerHTML=t+(s?`<small>${s}</small>`:"");e.style.color=color||"#fff";e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,ms)}
function confetti(n=60){const cols=["#ffc23d","#5ee7ff","#5dffa0","#ff6bb5","#9b78ff"];for(let i=0;i<n;i++){const c=document.createElement("div");c.className="confetti";c.style.left=rnd(0,100)+"%";c.style.background=cols[i%cols.length];$("app").appendChild(c);const dur=rnd(1.6,3);c.animate([{transform:`translateY(0) rotate(0)`},{transform:`translateY(${innerHeight+60}px) rotate(${rnd(-720,720)}deg)`}],{duration:dur*1000,delay:rnd(0,400),easing:"cubic-bezier(.3,.6,.6,1)"}).onfinish=()=>c.remove()}}

/* ---------- dialogue ---------- */
function talk(lines,cb,opts={}){
 let i=0;const T=$("talk");T.classList.remove("hide");T.classList.toggle("dim",!!opts.dim);
 const dots=$("talkDots");dots.innerHTML=lines.map(()=>"<i></i>").join("");
 let typing=null;
 function showLine(){const[who,text]=lines[i];const right=who!=="amos"&&who!=="amos_cheer";
  const im=$("talkImg");im.src="char/"+who+".webp";im.className=right?"r":"";im.style.animation="none";void im.offsetWidth;im.style.animation="";
  const nm=$("talkName");nm.textContent=CH[who].name;nm.className="talkName"+(right?" r":"");
  [...dots.children].forEach((d,k)=>d.classList.toggle("on",k<=i));
  const box=$("talkText");box.innerHTML=text;const full=box.innerHTML;
  // typewriter over plain text nodes
  const tmp=document.createElement("div");tmp.innerHTML=full;const plain=tmp.textContent;let n=0;box.innerHTML="";
  clearInterval(typing);typing=setInterval(()=>{n+=2;if(n>=plain.length){clearInterval(typing);typing=null;box.innerHTML=full;return}box.textContent=plain.slice(0,n)},18);
  box.dataset.full=full;$("talkNext").textContent=i===lines.length-1?(opts.last||"Let's go! ▶"):"Next ▶";tone(600+Math.random()*200,.05,"sine",.04)}
 $("talkNext").onclick=()=>{audio();if(typing){clearInterval(typing);typing=null;$("talkText").innerHTML=$("talkText").dataset.full;return}if(i>=lines.length)return;i++;if(i<lines.length)showLine();else{T.classList.add("hide");$("talkNext").onclick=null;cb&&cb()}};
 showLine();
}

/* ---------- stage api ---------- */
function makeStage(){
 const st=$("stage");st.innerHTML="";
 const S={el:st,timers:[],loops:[],dead:false};
 S.W=()=>st.clientWidth;S.H=()=>st.clientHeight;
 S.sp=(name,fx,fy,fw,opts={})=>{const d=document.createElement("div");d.className="sp"+(opts.cls?" "+opts.cls:"");
  const w=fw*S.W(),h=opts.svg?w*(opts.ratio||1):w*ratio(name);d.style.width=w+"px";d.style.height=h+"px";
  if(opts.svg)d.innerHTML=opts.svg;else d.innerHTML=`<img src="obj/${name}.webp" alt="">`;
  d.x=fx*S.W();d.y=fy*S.H();d.r=0;d.s=1;d.w=w;d.h=h;d.name=name;
  d.place=()=>{d.style.left=d.x+"px";d.style.top=d.y+"px";d.style.transform=`translate(-50%,-50%) rotate(${d.r}deg) scale(${d.s})`};d.place();
  d.go=(x,y,ms=400,easing="cubic-bezier(.2,.9,.3,1)")=>new Promise(res=>{const a=d.animate([{left:d.x+"px",top:d.y+"px"},{left:x+"px",top:y+"px"}],{duration:ms,easing});d.x=x;d.y=y;a.onfinish=()=>{d.place();res()};});
  d.kill=(ms=250)=>{d.style.transition=`opacity ${ms}ms, transform ${ms}ms`;d.style.opacity=0;d.style.transform+=" scale(1.4)";setTimeout(()=>d.remove(),ms)};
  if(opts.pop)d.classList.add("pop");
  st.appendChild(d);return d};
 S.tag=(text,fx,fy,cls="")=>{const t=document.createElement("div");t.className="tag "+cls;t.innerHTML=text;t.style.left=fx*S.W()+"px";t.style.top=fy*S.H()+"px";st.appendChild(t);return t};
 S.div=(cls,html,style={})=>{const d=document.createElement("div");d.className=cls;d.innerHTML=html;Object.assign(d.style,style);st.appendChild(d);return d};
 S.after=(ms,fn)=>{const t=setTimeout(()=>{if(!S.dead)fn()},ms);S.timers.push(t);return t};
 S.every=(ms,fn)=>{const t=setInterval(()=>{if(!S.dead)fn()},ms);S.timers.push(t);return t};
 S.loop=fn=>{let last=performance.now();const L={on:true};const f=now=>{if(!L.on||S.dead)return;const dt=Math.min(.05,(now-last)/1000);last=now;fn(dt);requestAnimationFrame(f)};requestAnimationFrame(f);S.loops.push(L);return L};
 S.burst=(x,y,col="#ffc23d",n=12)=>{for(let i=0;i<n;i++){const b=document.createElement("div");b.className="burst";b.style.left=x+"px";b.style.top=y+"px";b.style.background=col;b.style.boxShadow=`0 0 8px ${col}`;st.appendChild(b);const a=rnd(0,Math.PI*2),r=rnd(30,90);b.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:`translate(calc(-50% + ${Math.cos(a)*r}px),calc(-50% + ${Math.sin(a)*r}px)) scale(.3)`,opacity:0}],{duration:rnd(450,750),easing:"cubic-bezier(.2,.8,.3,1)"}).onfinish=()=>b.remove()}
  const rg=document.createElement("div");rg.className="ring";rg.style.left=x+"px";rg.style.top=y+"px";rg.style.borderColor=col;st.appendChild(rg);setTimeout(()=>rg.remove(),650)};
 S.tap=(d,fn)=>{d.classList.add("tap");d.addEventListener("pointerdown",e=>{e.preventDefault();audio();fn(e)})};
 S.drag=(d,{onDrop,onMove})=>{d.classList.add("drag");let sx,sy,ox,oy,on=false;
  d.addEventListener("pointerdown",e=>{audio();on=true;d.setPointerCapture(e.pointerId);sx=e.clientX;sy=e.clientY;ox=d.x;oy=d.y;d.style.zIndex=20;d.s=1.12;d.place()});
  d.addEventListener("pointermove",e=>{if(!on)return;d.x=ox+e.clientX-sx;d.y=oy+e.clientY-sy;d.place();onMove&&onMove(d)});
  const up=e=>{if(!on)return;on=false;d.style.zIndex="";d.s=1;d.place();onDrop&&onDrop(d,ox,oy)};d.addEventListener("pointerup",up);d.addEventListener("pointercancel",up)};
 S.back=(d,x,y)=>{d.classList.add("wiggle");setTimeout(()=>d.classList.remove("wiggle"),400);d.go(x,y,300)};
 S.goal=html=>{const g=$("goal");if(!html){g.classList.add("hide");return}g.innerHTML=html;g.classList.remove("hide")};
 S.hud=html=>{const h=$("hud");if(!html){h.classList.add("hide");h.innerHTML="";return h}h.innerHTML=html;h.classList.remove("hide");return h};
 S.say=(lines,cb,opts)=>talk(lines,()=>{if(!S.dead)cb&&cb()},opts);
 S.cleanup=()=>{S.dead=true;S.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});S.loops.forEach(l=>l.on=false);st.innerHTML="";S.goal(null);S.hud(null)};
 S.dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 return S;
}
const O2SVG=`<svg viewBox="0 0 100 100"><defs><radialGradient id="o2g" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="#bff6ff"/><stop offset="1" stop-color="#2bb6e0"/></radialGradient></defs><circle cx="50" cy="50" r="46" fill="url(#o2g)" stroke="#e8fdff" stroke-width="3"/><text x="50" y="60" text-anchor="middle" font-family="Lilita One,Arial" font-size="34" fill="#0b4a66">O₂</text></svg>`;
const BOLT=`<svg viewBox="0 0 60 100"><defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6b0"/><stop offset="1" stop-color="#ff6a3d"/></linearGradient></defs><path d="M34 2 L6 56 H28 L20 98 L54 38 H32 Z" fill="url(#bg1)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`;

/* ---------- board flow ---------- */
function setSteps(n){$("bSteps").innerHTML=[0,1,2,3].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}
function openBoard(i){
 audio();const B=BOARDS[i];show("board");$("boardBg").style.backgroundImage=`url(${B.bg})`;$("bNum").textContent=B.final?"Final board":"Board "+(i+1);$("bTitle").textContent=B.title;setSteps(0);
 if(CUR&&CUR.S)CUR.S.cleanup();$("panel").classList.add("hide");$("talk").classList.add("hide");
 const S=makeStage();CUR={B,i,S};
 talk(B.intro,()=>{setSteps(1);B.game(S,()=>{if(S.dead)return;S.goal(null);S.hud(null);sfx.win();confetti(40);
   setTimeout(()=>talk(B.outro,()=>{setSteps(2);learn(B,()=>{setSteps(3);quiz(B,score=>reward(B,i,score))})},{last:"What did we learn? ▶"}),700)})},{dim:true});
}
$("boardBack").onclick=()=>{if(CUR&&CUR.S)CUR.S.cleanup();$("talk").classList.add("hide");$("panel").classList.add("hide");openMap()};
function panel(html){$("sheet").innerHTML=html;$("panel").classList.remove("hide");$("sheet").scrollTop=0}
function learn(B,cb){
 const render=()=>{const L=B.learn[LVL];
  panel(`<div class="learnHead"><img src="obj/${B.icon==="chromo"?"alpha":B.icon}.webp" alt=""><div><span class="ptag gold">What we learned</span><h2>${B.med}</h2></div></div>
  <div class="lvl"><button data-l="kid" class="${LVL==="kid"?"on":""}">Kid version</button><button data-l="teen" class="${LVL==="teen"?"on":""}">Teen & family</button></div>
  <ul class="facts">${L.map(([e,t])=>`<li><span>${e}</span><div>${t}</div></li>`).join("")}</ul>
  ${B.safety?`<div class="safety">⚠️ ${B.safety}</div>`:""}
  <button class="cta" id="learnGo" style="margin-top:14px">Lab Check ▶</button>`);
  $("sheet").querySelectorAll(".lvl button").forEach(b=>b.onclick=()=>{LVL=b.dataset.l;store.set("wt-mq-lvl",LVL);render()});
  $("learnGo").onclick=()=>{$("panel").classList.add("hide");cb()}};
 render();
}
function quiz(B,cb){
 let qi=0,score=0;
 const next=()=>{if(qi>=B.quiz.length){$("panel").classList.add("hide");cb(score);return}const Q=B.quiz[qi];
  panel(`<span class="ptag">Lab Check ${qi+1} of ${B.quiz.length}</span><div class="q">${Q.q}</div><div class="ans">${Q.a.map((a,k)=>`<button data-k="${k}">${a}</button>`).join("")}</div><div id="qres"></div>`);
  $("sheet").querySelectorAll(".ans button").forEach(b=>b.onclick=()=>{const k=+b.dataset.k,ok=k===Q.c;$("sheet").querySelectorAll(".ans button").forEach(x=>{x.disabled=true;if(+x.dataset.k===Q.c)x.classList.add("right")});if(!ok)b.classList.add("wrong");
   if(ok){score++;sfx.snap();post({type:"quiz",correct:true})}else sfx.bad();
   $("qres").innerHTML=`<div class="why"><b>${ok?"✅ Correct!":"Not quite."}</b> ${Q.why}</div><button class="cta" id="qnext" style="margin-top:12px">${qi===B.quiz.length-1?"Finish ▶":"Next ▶"}</button>`;
   $("qnext").onclick=()=>{qi++;next()}})};
 next();
}
function reward(B,i,score){
 const first=!SAVE.done[B.id];SAVE.done[B.id]={score,at:Date.now()};saveP();post({type:"board",id:B.id,first,score});
 sfx.win();confetti(B.final?140:70);
 const group=B.final?`<div class="group">${["malcolm","tasha","theo","amos_cheer","ritika","luciana","krystal"].map(c=>`<img src="char/${c}.webp" alt="">`).join("")}</div>`:`<img class="big" src="../runner/img/crystal.webp" alt="">`;
 panel(`<div class="reward">${group}<span class="ptag gold">${B.final?"Quest complete!":"Board complete!"}</span><h2>${B.final?"You're a Hemoglobin Hero!":B.title}</h2>
  <div class="badge">💎 ${B.med} crystal ${first?"earned":"earned again"}</div>
  <p style="margin:6px 0 0;font-weight:700">Lab Check: ${score} of ${B.quiz.length} correct</p>
  ${EMBED&&first?`<p style="color:var(--gold);font-weight:700;margin:6px 0 0">+ Warrior points added to your Life App</p>`:""}
  ${B.final?`<p class="sub" style="margin:10px 0 0;line-height:1.45">From one changed letter to a cure: you've seen how every sickle cell treatment works. Share what you learned with your family and your care team!</p>`:""}
  <button class="cta" id="rwGo" style="margin-top:14px">${B.final?"Play again from Board 1 ▶":"Next board ▶"}</button>
  <button class="cta alt small" id="rwMap" style="margin-top:10px">World map</button></div>`);
 $("rwGo").onclick=()=>{$("panel").classList.add("hide");if(B.final){resetQuest();openMap()}else if(i+1>=BOARDS.length)openMap();else openBoard(i+1)};
 $("rwMap").onclick=()=>{$("panel").classList.add("hide");openMap()};
}

/* ---------- map ---------- */
const NODES=[[.37,.92],[.27,.845],[.52,.767],[.655,.69],[.45,.612],[.47,.53],[.565,.45],[.555,.37],[.42,.285],[.53,.115]];
function openMap(){
 if(CUR&&CUR.S)CUR.S.cleanup();$("panel").classList.add("hide");$("talk").classList.add("hide");show("map");
 const inner=$("mapInner");inner.querySelectorAll(".node,.mapAvatar").forEach(n=>n.remove());
 const unlocked=i=>i===0||SAVE.done[BOARDS[i-1].id]||SAVE.done[BOARDS[i].id];
 let nextI=BOARDS.findIndex(B=>!SAVE.done[B.id]);if(nextI<0)nextI=BOARDS.length-1;
 BOARDS.forEach((B,i)=>{const[x,y]=NODES[i];const n=document.createElement("button");
  n.className="node"+(NODES[i][0]>.5?" lbl-l":"")+(B.final?" final":"")+(SAVE.done[B.id]?" done":"")+(!unlocked(i)?" locked":"")+(i===nextI&&!SAVE.done[B.id]?" next":"");
  n.style.left=x*100+"%";n.style.top=y*100+"%";
  n.innerHTML=`<img class="ic" src="obj/${B.icon==="chromo"?"alpha":B.icon}.webp" alt=""><span class="num">${B.final?"★":i+1}</span><span class="lbl">${B.final?"Gene Therapy":B.title.replace(/:.*/,"")}</span>`;
  n.onclick=()=>{audio();if(!unlocked(i)){toast("Locked","Finish board "+i+" first",1200);sfx.bad();return}openBoard(i)};inner.appendChild(n)});
 const av=document.createElement("img");av.className="mapAvatar";av.src="char/amos.webp";const[ax,ay]=NODES[nextI];av.style.left=(ax*100+(ax>.5?7:-7))+"%";av.style.top=(ay*100-1)+"%";inner.appendChild(av);
 $("mapSub").textContent=`${doneCount()} of ${BOARDS.length} boards`;$("mapCrys").textContent=doneCount();
 requestAnimationFrame(()=>{const sc=$("mapScroll"),img=$("mapImg");const target=ay*img.clientHeight-sc.clientHeight*.55;sc.scrollTop=clamp(target,0,img.clientHeight)});
}
$("mapHome").onclick=()=>openTitle();

/* ---------- title ---------- */
function openTitle(){show("title");const crew=$("crew");crew.innerHTML="";
 const cast=["tasha","malcolm","amos","luciana","theo"];cast.forEach((c,k)=>{const im=document.createElement("img");im.src="char/"+c+".webp";im.style.left=(k*19-2)+"%";im.style.height=(c==="amos"?180:146)+"px";im.style.zIndex=c==="amos"?3:k%2?2:1;if(c==="amos")im.style.left="31%";crew.appendChild(im)});
 const d=doneCount();$("progressTxt").textContent=d?`${d} of 10 boards complete`:"10 boards · about 3 minutes each";$("startBtn").textContent=d>=10?"Replay any board ▶":d?"Continue the quest ▶":"Start the quest ▶";$("resetBtn").classList.toggle("hide",!d)}
$("startBtn").onclick=()=>{audio();openMap()};
function resetQuest(){SAVE={done:{}};saveP()}
{let armed=0,tm;const rb=$("resetBtn");rb.onclick=()=>{if(!armed){armed=1;rb.classList.add("confirm");rb.textContent="Tap again to erase progress and restart";clearTimeout(tm);tm=setTimeout(()=>{armed=0;rb.classList.remove("confirm");rb.textContent="↺ Start over from Board 1"},3500);return}
 clearTimeout(tm);armed=0;rb.classList.remove("confirm");rb.textContent="↺ Start over from Board 1";resetQuest();sfx.pop&&sfx.pop();toast("Fresh start!","All 10 boards are ready to play again.",1600,"#ffc23d");openTitle()}}
if(EMBED){document.body.classList.add("embed");$("exitBtn").classList.remove("hide");$("exitBtn").onclick=()=>post({type:"exit"})}

/* =====================================================================
   MINI-GAMES
   ===================================================================== */
function gameBuild(S,done){
 const slots=[["alpha",.36,.40],["alpha",.64,.40],["beta",.36,.585],["beta",.64,.585]].map(([t,x,y])=>{const d=S.div("slot",t==="alpha"?"α":"β",{left:x*S.W()+"px",top:y*S.H()+"px",width:.25*S.W()+"px",height:.25*S.W()+"px"});d.t=t;d.x=x*S.W();d.y=y*S.H();return d});
 S.goal("Drag <b>2 alpha</b> and <b>2 beta</b> pieces into the slots to build hemoglobin.");
 const kinds=["alpha","beta","beta","alpha"];let filled=0;const placed=[];const lbls=[S.tag("Alpha (α)",.5,.30,"gold"),S.tag("Beta (β)",.5,.695,"gold")];
 kinds.forEach((k,i)=>{const p=S.sp(k,.15+i*.233,.86,.2,{pop:true});const hx=p.x,hy=p.y;
  S.drag(p,{onMove:d=>slots.forEach(s=>s.classList.toggle("hot",!s.full&&S.dist(s,d)<.16*S.W())),onDrop:d=>{slots.forEach(s=>s.classList.remove("hot"));
   const s=slots.filter(s=>!s.full).sort((a,b)=>S.dist(a,d)-S.dist(b,d))[0];
   if(s&&S.dist(s,d)<.17*S.W()){if(s.t===k){s.full=true;d.classList.remove("drag");d.style.pointerEvents="none";s.p=d;placed.push(s);d.go(s.x,s.y,220).then(()=>{d.s=1.25;d.place();s.style.opacity=0});sfx.snap();S.burst(s.x,s.y,k==="alpha"?"#5ee7ff":"#ffc23d",10);filled++;if(filled===4)built()}
    else{sfx.bad();toast("Oops!",`That's a ${k==="alpha"?"alpha (α)":"beta (β)"} piece. Find a ${s.t==="alpha"?"α":"β"} slot.`,1600);S.back(d,hx,hy)}}else d.go(hx,hy,250)}})});
 function built(){lbls.forEach(l=>l.remove());const tg=[[.415,.45],[.585,.45],[.415,.555],[.585,.555]];slots.forEach((s,k)=>{S.after(250,()=>{s.p.go(tg[k][0]*S.W(),tg[k][1]*S.H(),450);s.p.s=1.15;})});S.after(800,()=>{S.burst(.5*S.W(),.5*S.H(),"#fff",24);sfx.win();S.tag("Hemoglobin A = 2α + 2β",.5,.70,"big gold pop");toast("Hemoglobin built!","",1200,"#ffc23d");
   S.after(1300,()=>{S.goal("Tap the <b>4 oxygen bubbles</b> so hemoglobin can carry them.");let got=0;S.hud(`<div class="chip">🫧 Oxygen <span id="o2n">0</span>/4</div>`);
    const seats=[[.37,.42],[.63,.42],[.37,.585],[.63,.585]];
    for(let i=0;i<4;i++){const b=S.sp("o2",rnd(.15,.85),rnd(.76,.9),.13,{svg:O2SVG,pop:true});let t=rnd(0,6);const L=S.loop(dt=>{t+=dt;b.x+=Math.sin(t*1.3+i)*.4;b.y+=Math.cos(t*1.1+i)*.3;b.place()});
     S.tap(b,()=>{if(b.got)return;b.got=true;L.on=false;sfx.pop();const[sx,sy]=seats[got];got++;$("o2n").textContent=got;b.go(sx*S.W(),sy*S.H(),450).then(()=>{b.s=.6;b.place();S.burst(b.x,b.y,"#5ee7ff",8)});if(got===4)S.after(800,done)})}})})}
}

function gamePunnett(S,done){
 const NAMES={AA:["HbAA","No sickle cell"],AS:["HbAS","Sickle cell trait"],SS:["HbSS","Sickle cell disease"],AC:["HbAC","Hemoglobin C trait"],SC:["HbSC","Sickle cell disease"],CC:["HbCC","Hemoglobin C"]};
 const ORD="ASC";const geno=(a,b)=>[a,b].sort((x,y)=>ORD.indexOf(x)-ORD.indexOf(y)).join("");
 const dot=g=>`<span class="gdot g${g}"></span>`;
 const ROUNDS=[{p1:"AS",p2:"AS",ask:"SS",q:"Chance a child has sickle cell disease (HbSS)?",c:1},{p1:"AS",p2:"AC",ask:"SC",q:"Chance a child has HbSC disease?",c:1},{p1:"SS",p2:"AA",ask:"AS",q:"Chance a child has sickle cell trait?",c:3}];
 const CH4=["0%","1 in 4 (25%)","1 in 2 (50%)","Every child (100%)"];
 let r=0;
 function round(){S.el.innerHTML="";const R=ROUNDS[r];
  S.goal(`Round ${r+1} of 3: <b>tap each box</b> to see what a child could inherit.`);
  const legend=`${dot("A")} usual (A) &nbsp; ${dot("S")} sickle (S) &nbsp; ${dot("C")} hemoglobin C`;
  S.div("parent",`<span style="font-size:36px">👩🏾</span><div><b>Parent 1</b><small>${dot(R.p1[0])} ${dot(R.p1[1])} ${NAMES[R.p1][0]}</small></div>`,{left:"27%",top:.215*S.H()+"px"});
  S.div("parent",`<span style="font-size:36px">👨🏾</span><div><b>Parent 2</b><small>${dot(R.p2[0])} ${dot(R.p2[1])} ${NAMES[R.p2][0]}</small></div>`,{left:"73%",top:.215*S.H()+"px"});
  const P=S.div("punnett","",{top:.29*S.H()+"px",width:"66%",gridTemplateColumns:"40px repeat(2,1fr)",gridTemplateRows:"40px repeat(2,auto)"});
  let html=`<div></div><div class="h">${dot(R.p1[0])}</div><div class="h">${dot(R.p1[1])}</div>`;
  for(let a=0;a<2;a++){html+=`<div class="h">${dot(R.p2[a])}</div>`;for(let b=0;b<2;b++)html+=`<div class="cell" data-g="${geno(R.p1[b],R.p2[a])}">?</div>`}
  P.innerHTML=html;S.div("tag",legend,{left:"50%",top:.74*S.H()+"px",transform:"translate(-50%,-50%)",fontSize:"12px",position:"absolute"});
  let n=0;P.querySelectorAll(".cell").forEach(c=>c.onclick=()=>{if(c.classList.contains("filled"))return;audio();sfx.snap();c.classList.add("filled");const g=c.dataset.g;const[nm,desc]=NAMES[g];
   c.innerHTML=`<div>${dot(g[0])}${dot(g[1])}</div>${nm}<small>${desc}</small>`;c.style.borderColor=g==="SS"||g==="SC"?"#ff6b6b":g.includes("S")||g.includes("C")?"#ffc23d":"#57d68d";c.animate([{transform:"scale(.6)"},{transform:"scale(1)"}],{duration:300,easing:"cubic-bezier(.2,1.6,.4,1)"});
   n++;if(n===4)S.after(500,ask)});
  function ask(){S.goal(`<b>${R.q}</b>`);const row=S.div("choiceRow",CH4.map((t,k)=>`<button data-k="${k}">${t}</button>`).join(""),{bottom:`calc(16px + env(safe-area-inset-bottom))`});
   row.querySelectorAll("button").forEach(b=>b.onclick=()=>{const k=+b.dataset.k;if(k===R.c){b.classList.add("right");sfx.win();S.after(900,()=>{r++;if(r<ROUNDS.length)round();else done()})}else{b.classList.add("wrong");sfx.bad();toast("Count the boxes!",`How many of the 4 boxes show ${NAMES[R.ask][0]}?`,1800)}})}
 }
 round();
}

function gameMutation(S,done){
 S.goal("Genes are written in letters. <b>Tap the one letter that changed</b> in the sickle gene.");
 const mk=(label,cods,top,btn)=>{const d=S.div("dna","",{top:top*S.H()+"px"});d.innerHTML=`<span class="lbl" style="width:auto;height:auto;background:none">${label}</span>`+cods.map((c,ci)=>`<div class="cod ${ci===1?"hl":""}">${[...c].map((l,li)=>btn?`<button class="${l}" data-ok="${ci===1&&li===1?1:0}">${l}</button>`:`<span class="${l}">${l}</span>`).join("")}</div>`).join("");return d};
 mk("Healthy beta gene",["CCT","GAG","GAG"],.25,false);
 const sk=mk("Sickle beta gene",["CCT","GTG","GAG"],.42,true);
 S.tag("codon 5 · 6 · 7",.5,.565);
 sk.querySelectorAll("button").forEach(b=>b.onclick=()=>{audio();if(b.dataset.ok==="1"){b.classList.add("right");sfx.win();S.burst(b.getBoundingClientRect().left-S.el.getBoundingClientRect().left+15,b.getBoundingClientRect().top-S.el.getBoundingClientRect().top+20,"#ffc23d",16);
   S.tag("GAG → GTG: glutamic acid becomes <b style='color:#ff8ab0'>valine</b>",.5,.64,"gold pop");
   S.after(900,()=>S.say([["amos","You found it! <em>A became T</em>. That one swap puts a <i>sticky spot</i> on the outside of hemoglobin. Now let's see what happens when oxygen drops."]],phase2,{last:"Show me ▶"}))}
  else{b.classList.add("wiggle");sfx.bad();setTimeout(()=>b.classList.remove("wiggle"),400)}});
 function phase2(){S.el.innerHTML="";
  const cellR=S.sp("rbc",.5,.5,.78);const cellS=S.sp("sickle",.5,.5,.78);cellS.style.opacity=0;
  const mols=[];for(let i=0;i<12;i++){const m=S.sp("betaS",rnd(.3,.7),rnd(.36,.62),.085);m.vx=rnd(-30,30);m.vy=rnd(-30,30);mols.push(m)}
  const ctl=S.div("o2",`<label>Oxygen <b id="o2v">100%</b></label><input type="range" min="20" max="100" value="100" id="o2r">`,{bottom:`calc(18px + env(safe-area-inset-bottom))`});
  S.goal("Slide the <b>oxygen down</b> and watch the sickle hemoglobin.");let stage=0,o2=100;
  $("o2r").oninput=e=>{o2=+e.target.value;$("o2v").textContent=o2+"%";
   if(stage===0&&o2<=40){stage=1;S.tag("HbS sticks together into stiff fibers!",.5,.76,"gold pop");sfx.zap();S.goal("Oh no, the cell sickled! Now slide the <b>oxygen back up</b>.")}
   if(stage===1&&o2>=90){stage=2;S.goal(null);S.after(700,()=>S.say([["theo","It went back to round… mostly."],["amos","Some cells unsickle, but every sickling round damages them. Some get stuck as sickles for good. And in tiny vessels, sickled cells jam together and <em>block blood flow</em>."]],done))}};
  const W=S.W(),H=S.H();
  S.loop(dt=>{const low=clamp((70-o2)/40,0,1);cellS.style.opacity=low;cellR.style.opacity=1-low;
   mols.forEach((m,i)=>{const row=i%2,k=Math.floor(i/2);const ang=(115+k*26)*Math.PI/180,rad=W*(row?.27:.21);const tx=W*.58+Math.cos(ang)*rad,ty=H*.5+Math.sin(ang)*rad*1.05;
    if(low>.5){m.x+=(tx-m.x)*Math.min(1,dt*5);m.y+=(ty-m.y)*Math.min(1,dt*5);m.r=(ang*180/Math.PI)+90}
    else{m.x+=m.vx*dt;m.y+=m.vy*dt;if(m.x<W*.25||m.x>W*.75)m.vx*=-1;if(m.y<H*.36||m.y>H*.62)m.vy*=-1;m.r+=dt*40}
    m.place()})});
 }
}

function gameHU(S,done){
 const sw=S.div("tag big","",{left:"50%",top:.34*S.H()+"px",padding:"14px 18px",borderRadius:"22px",textAlign:"center",lineHeight:"1.25"});
 const swHtml=on=>`γ-globin switch<br><span style="display:inline-block;margin-top:8px;width:96px;height:46px;border-radius:99px;background:${on?"#57d68d":"#4a3a6a"};position:relative;box-shadow:inset 0 2px 6px rgba(0,0,0,.4)"><span style="position:absolute;top:5px;${on?"right":"left"}:5px;width:36px;height:36px;border-radius:50%;background:#fff"></span></span><br><small style="font-family:var(--body);font-size:13px">${on?"ON: making HbF!":"OFF since birth"}</small>`;
 sw.innerHTML=swHtml(false);sw.x=.5*S.W();sw.y=.34*S.H();
 S.goal("Drag the <b>hydroxyurea capsule</b> to the gamma switch.");
 const cap=S.sp("capsule",.5,.8,.3,{pop:true});const cx=cap.x,cy=cap.y;
 S.drag(cap,{onDrop:d=>{if(S.dist(d,sw)<.2*S.W()){d.kill();sw.innerHTML=swHtml(true);sfx.win();S.burst(sw.x,sw.y,"#5dffa0",20);
   for(let i=0;i<6;i++)S.after(i*120,()=>{const g=S.sp("gamma",.5,.36,.11,{pop:true});g.go(rnd(.1,.9)*S.W(),rnd(.5,.85)*S.H(),700).then(()=>g.kill(400))});
   S.after(1500,()=>S.say([["amos","The switch is ON and fetal hemoglobin is flowing! HbF can't fit into a sickle chain. Let's prove it."],["ritika","Sickle chains are growing toward the cell! <em>Tap a chain</em> to send in HbF and break it!"]],phase2,{last:"Block them! ▶"}))}
  else S.back(d,cx,cy)}});
 function phase2(){S.el.innerHTML="";const W=S.W(),H=S.H();
  const cell=S.sp("rbc",.93,.52,.42);
  const lanes=[.36,.51,.66].map(y=>({y:y*H,beads:[],t:0,on:false,wait:rnd(.2,1.5)}));
  let blocked=0,hearts=3,speed=.95,need=10;
  S.goal(`Tap a growing chain to send in <b>HbF</b>. Block <b>${need}</b> chains!`);
  const hud=()=>S.hud(`<div class="chip">🛡️ ${blocked}/${need}</div><div class="chip">${"❤️".repeat(hearts)}${"🤍".repeat(3-hearts)}</div>`);hud();
  const lz=lanes.map(L=>{const z=S.div("","",{position:"absolute",left:"0",width:"86%",top:(L.y-.06*H)+"px",height:.12*H+"px",zIndex:5});z.onpointerdown=e=>{e.preventDefault();audio();if(!L.on||!L.beads.length)return;block(L)};return z});
  function block(L){const tip=L.beads[L.beads.length-1];const g=S.sp("gamma",.5,.92,.12);g.style.zIndex=6;sfx.pop();
   g.go(tip.x+.05*W,tip.y,260).then(()=>{S.burst(tip.x,tip.y,"#5dffa0",14);L.beads.forEach((b,i)=>setTimeout(()=>b.kill(220),i*30));L.beads=[];L.on=false;L.wait=rnd(.6,1.8);g.kill(300);blocked++;hud();
    if(blocked>=need){S.goal(null);S.after(500,done)}});}
  S.loop(dt=>{if(blocked>=need||hearts<=0)return;lanes.forEach(L=>{if(!L.on){L.wait-=dt;if(L.wait<=0){L.on=true;L.t=0}return}
    L.t+=dt;if(L.t>=speed){L.t=0;const x=.05*W+L.beads.length*.072*W;const b=S.sp("betaS",x/W,L.y/H,.085,{pop:true});b.r=rnd(-10,10);b.place();L.beads.push(b);
     if(x>.78*W){L.beads.forEach(b=>b.kill(200));L.beads=[];L.on=false;L.wait=1.2;hearts--;hud();sfx.bad();toast("A cell sickled!","Block chains before they reach the cell",1300,"#ff8ab0");cell.classList.add("wiggle");setTimeout(()=>cell.classList.remove("wiggle"),400);
      if(hearts<=0){S.goal("That's okay, warrior. Try again!");S.after(1400,()=>phase2())}}}});
   speed=Math.max(.55,.95-blocked*.035)});
 }
}

function gameGlutamine(S,done){
 const W=S.W(),H=S.H();const cell=S.sp("rbc",.5,.56,.5);
 const shield=S.div("","",{position:"absolute",left:"50%",top:.56*H+"px",width:.74*W+"px",height:.74*W+"px",transform:"translate(-50%,-50%)",borderRadius:"50%",border:"6px solid rgba(255,214,90,.9)",boxShadow:"0 0 40px rgba(255,194,61,.8), inset 0 0 40px rgba(255,194,61,.5)",opacity:0,transition:"opacity .3s",pointerEvents:"none"});
 let hp=5,time=30,sh=0,cd=0;const rads=[];
 S.goal("Tap the <b>free radicals</b> before they hit the cell. Use the <b>L-glutamine boost</b> for a shield!");
 const hud=()=>{const h=S.hud(`<div class="chip">⏱ ${Math.ceil(time)}s</div><div class="chip">❤️ ${hp}</div><button class="tool" id="boost" ${cd>0?"disabled":""}><img src="obj/packet.webp" alt="">${cd>0?`Boost ${Math.ceil(cd)}s`:"L-glutamine boost"}</button>`);const b=$("boost");b&&(b.onclick=()=>{if(cd>0)return;audio();sh=5;cd=10;sfx.win();shield.style.opacity=1;S.burst(.5*W,.56*H,"#ffd76a",24)})};hud();
 let spawn=0,hudT=0;
 S.loop(dt=>{if(time<=0||hp<=0)return;time-=dt;sh=Math.max(0,sh-dt);cd=Math.max(0,cd-dt);if(sh<=0)shield.style.opacity=0;
  spawn-=dt;if(spawn<=0){spawn=Math.max(.45,1.1-(30-time)*.02);const a=rnd(0,Math.PI*2);const r=S.sp("radical",.5+Math.cos(a)*.7,.56+Math.sin(a)*.5,.15,{pop:true});r.sp=rnd(70,110)+(30-time)*3;
   S.tap(r,()=>{if(r.dead)return;r.dead=true;sfx.pop();S.burst(r.x,r.y,"#ffd76a",10);r.kill()});rads.push(r)}
  for(const r of rads){if(r.dead)continue;const dx=.5*W-r.x,dy=.56*H-r.y,d=Math.hypot(dx,dy);r.x+=dx/d*r.sp*dt;r.y+=dy/d*r.sp*dt;r.r+=dt*120;r.place();
   if(sh>0&&d<.37*W){r.dead=true;S.burst(r.x,r.y,"#ffd76a",8);r.kill();sfx.tick();continue}
   if(d<.2*W){r.dead=true;r.kill();hp--;sfx.bad();cell.classList.add("wiggle");setTimeout(()=>cell.classList.remove("wiggle"),400);
    if(hp<=0){S.goal("The cell got damaged. Try again, and use the boost!");S.after(1500,()=>{S.cleanup;S.el.innerHTML="";gameGlutamine(S,done)})}}}
  hudT-=dt;if(hudT<=0){hudT=.25;hud()}
  if(time<=0&&hp>0){rads.forEach(r=>!r.dead&&r.kill());S.goal(null);S.hud(null);S.after(400,done)}});
}

function gameCrizan(S,done){
 const W=S.W(),H=S.H();const xs=[.12,.31,.5,.69,.88];
 const hooks=xs.map(x=>{const h=S.sp("pselectin",x,.74,.17);h.base=h.y;h.up=false;h.covered=false;h.y=h.base+.12*H;h.place();
  S.tap(h,()=>{if(!h.up||h.covered)return;h.covered=true;sfx.pop();const ab=S.sp("antibody",x,.2,.15);ab.go(h.x,h.y-h.h*.32,420).then(()=>{ab.r=180;ab.s=.9;ab.place();S.burst(h.x,h.y-h.h*.3,"#5ee7ff",14);covered++;hud();if(covered>=5){S.goal(null);S.after(1500,()=>{L.on=false;done()})}})});return h});
 let covered=0,stuck=0;const cells=[];
 S.goal("Sticky <b>P-selectin hooks</b> pop up from the wall. <b>Tap each one</b> to cover it with an antibody!");
 const hud=()=>S.hud(`<div class="chip">🛡️ Covered ${covered}/5</div><div class="chip">🧲 Stuck ${stuck}/4</div>`);hud();
 let pop=1.2,spawn=0;const order=[2,0,4,1,3];let oi=0;
 const L=S.loop(dt=>{pop-=dt;if(pop<=0&&oi<5){const h=hooks[order[oi++]];h.up=true;h.go(h.x,h.base,350);sfx.tick();pop=2.4}
  spawn-=dt;if(spawn<=0){spawn=.85;const c=S.sp("rbc",-.08,rnd(.55,.6),.13);c.v=rnd(90,130);cells.push(c)}
  for(const c of cells){if(c.stuck||c.gone)continue;c.x+=c.v*dt;c.r+=c.v*dt*.8;c.place();
   for(const h of hooks){if(h.up&&!h.covered&&Math.abs(c.x-h.x)<.03*W){c.stuck=true;stuck++;hud();sfx.bad();c.go(h.x,h.y-h.h*.42,200);
     if(stuck>=4){S.goal("Too many cells stuck, so the vessel is blocked! Try again.");L.on=false;S.after(1600,()=>{S.el.innerHTML="";gameCrizan(S,done)})}break}}
   if(c.x>1.1*W){c.gone=true;c.remove()}}});
}

function gameDefenders(S,done){
 const W=S.W(),H=S.H();let killed=0,miss=0;const need=10;
 S.goal("Germs are coming! <b>Tap them</b>: penicillin breaks their walls.");
 const hud=()=>S.hud(`<div class="chip">💊 ${killed}/${need}</div><div class="chip">⚠️ ${miss}/3</div>`);hud();
 const bugs=[];let spawn=.3;
 const L=S.loop(dt=>{if(killed>=need)return;spawn-=dt;if(spawn<=0&&bugs.filter(b=>!b.dead).length<4){spawn=rnd(.7,1.3);const b=S.sp("bacteria",rnd(.15,.85),-.05,.2,{pop:true});b.v=rnd(70,110);b.ph=rnd(0,6);
   S.tap(b,()=>{if(b.dead)return;b.dead=true;sfx.pop();S.burst(b.x,b.y,"#a5ff6a",14);b.kill();killed++;hud();if(killed>=need){L.on=false;S.after(600,phase2)}});bugs.push(b)}
  for(const b of bugs){if(b.dead)continue;b.ph+=dt;b.y+=b.v*dt;b.x+=Math.sin(b.ph*2)*.6;b.r=Math.sin(b.ph*3)*12;b.place();
   if(b.y>H*.95){b.dead=true;b.kill();miss++;hud();sfx.bad();toast("A germ got through!","",900,"#ff8ab0");if(miss>=3){L.on=false;S.goal("Too many germs got through. Try again!");S.after(1400,()=>{S.el.innerHTML="";gameDefenders(S,done)})}}}});
 function phase2(){S.el.innerHTML="";S.say([["amos","Great defense! Now, sickle cells break apart early, so the bone marrow has to make new red cells <em>super fast</em>."],["kim","<i>Folic acid</i> is a vitamin the marrow uses to build them. Tap the folic acid to feed the factory!"]],()=>{
   const fac=S.tag("🏭 Bone marrow factory",.5,.86,"big gold");fac.x=.5*W;fac.y=.86*H;let fed=0;const need2=8;
   S.goal("Tap <b>folic acid</b> to send it to the bone marrow factory.");
   const hud2=()=>S.hud(`<div class="meter"><i style="width:${fed/need2*100}%"></i><span>New red cells ${fed}/${need2}</span></div>`);hud2();
   let sp=0;const L2=S.loop(dt=>{if(fed>=need2)return;sp-=dt;if(sp<=0){sp=rnd(.7,1.1);const f=S.sp("folate",-.1,rnd(.25,.6),.15,{pop:true});f.v=rnd(80,120);f.ph=rnd(0,5);
     S.tap(f,()=>{if(f.dead)return;f.dead=true;sfx.snap();f.go(fac.x,fac.y-20,400).then(()=>{f.kill(200);fed++;hud2();const n=S.sp("rbc",.5,.84,.13,{pop:true});n.go(rnd(.15,.85)*W,rnd(.2,.5)*H,900).then(()=>n.kill(500));if(fed>=need2){L2.on=false;S.after(900,done)}})});
     f.tick=dt=>{f.ph+=dt;f.x+=f.v*dt;f.y+=Math.sin(f.ph*2)*.5;f.place();if(f.x>1.1*W){f.dead=true;f.remove()}};}
    S.el.querySelectorAll(".sp").forEach(e=>e.tick&&!e.dead&&e.tick(dt))})})}
}

function gameTransfuse(S,done){
 const W=S.W(),H=S.H();let hbs=90;const sick=[];
 for(let i=0;i<8;i++){const s=S.sp("sickle",rnd(.15,.85),rnd(.35,.75),.15);s.ph=rnd(0,6);sick.push(s)}
 S.goal("Tap <b>Add donor blood</b> to bring sickle hemoglobin <b>below 30%</b>.");
 const hud=()=>{S.hud(`<div class="meter full"><i style="width:${hbs}%;background:linear-gradient(90deg,#ff6b6b,#ff2d55)"></i><span>Sickle hemoglobin ${hbs}% (goal under 30%)</span></div><button class="tool" id="donor"><img src="obj/rbc.webp" alt="">Add donor blood</button>`);$("donor").onclick=give};
 S.tag("🎯 30% line",.5,.27,"gold");
 function give(){if(hbs<=25)return;audio();sfx.snap();hbs=Math.max(25,hbs-13);
  for(let i=0;i<3;i++)S.after(i*120,()=>{const d=S.sp("rbc",.5,.1,.14,{cls:"glow",pop:true});d.ph=rnd(0,6);d.go(rnd(.15,.85)*W,rnd(.35,.75)*H,700)});
  const out=sick.find(s=>!s.gone);if(out){out.gone=true;out.go(1.2*W,out.y,800).then(()=>out.remove())}
  hud();if(hbs<30){S.goal(null);S.after(900,phase2)}}
 hud();S.loop(dt=>sick.forEach(s=>{if(s.gone)return;s.ph+=dt;s.r=Math.sin(s.ph)*15;s.place()}));
 function phase2(){S.say([["kim","Sickle hemoglobin is under 30%! But look: every transfusion also brings <em>extra iron</em>."],["amos","Too much iron can hurt the heart and liver. <i>Chelation</i> medicine grabs it. Tap the iron to send in a chelator!"]],()=>{
   S.el.innerHTML="";let got=0;const need=8;S.goal("Tap each <b>iron clump</b> to grab it with a chelator.");
   const hud2=()=>S.hud(`<div class="chip">🧲 Iron cleared ${got}/${need}</div>`);hud2();
   for(let i=0;i<need;i++){const f=S.sp("iron",rnd(.12,.88),rnd(.3,.8),.12,{pop:true});
    S.tap(f,()=>{if(f.done)return;f.done=true;sfx.pop();const c=S.sp("chelator",.5,1.05,.18);c.go(f.x,f.y,420).then(()=>{S.burst(f.x,f.y,"#5ee7ff",10);f.remove();c.go(c.x,1.15*H,600).then(()=>c.remove());got++;hud2();if(got>=need)S.after(700,done)})})}})}
}

function gamePain(S,done){
 const W=S.W(),H=S.H();
 const zones=[{id:"brain",label:"🧠 Brain",y:.2},{id:"spine",label:"🦴 Spinal cord & nerves",y:.46},{id:"tissue",label:"💥 Where it hurts",y:.7}];
 zones.forEach(z=>{z.el=S.tag(z.label,.5,z.y,"big");z.x=.5*W;z.yy=z.y*H});
 S.sp("receptor",.83,.46,.17);S.sp("cox",.83,.7,.18);
 const MEDS=[{id:"ibu",t:"🟠 Ibuprofen",ok:["tissue"],msg:"Ibuprofen blocks the COX enzyme where it hurts, so fewer pain chemicals are made."},{id:"apap",t:"⚪ Acetaminophen",ok:["brain"],msg:"Acetaminophen works mostly in the brain to lower pain and fever."},{id:"opi",t:"💊 Opioid (as prescribed)",ok:["spine","brain"],msg:"Opioids dock on receptors in the spinal cord and brain to quiet pain signals."},{id:"comf",t:"🔥 Heat, 💧 water, deep breaths",ok:["brain","spine","tissue"],msg:"Comfort tools help the whole body: heat relaxes, water keeps blood flowing, breathing calms the brain."}];
 S.goal("Drag each medicine to <b>where it works</b>.");let placed=0;
 MEDS.forEach((m,i)=>{const d=S.sp("med",i%2?.73:.27,i<2?.84:.92,.42,{svg:`<div style="width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(180deg,#9b78ff,#5b2bd0);border:2px solid rgba(255,255,255,.5);border-radius:14px;font-weight:700;font-size:14px;padding:4px;text-align:center;line-height:1.15;box-shadow:0 4px 0 #3a1a8a">${m.t}</div>`,ratio:.24});
  const hx=d.x,hy=d.y;
  S.drag(d,{onDrop:dd=>{const z=zones.slice().sort((a,b)=>Math.abs(a.yy-dd.y)-Math.abs(b.yy-dd.y))[0];
   if(Math.abs(z.yy-dd.y)<.12*H&&m.ok.includes(z.id)){dd.classList.remove("drag");dd.style.pointerEvents="none";dd.go(.24*W+(placed%2)*.02*W,z.yy+.05*H,250).then(()=>{dd.s=.7;dd.place()});sfx.snap();S.burst(z.x,z.yy,"#5dffa0",12);toast("✓",m.msg,2600,"#5dffa0");placed++;if(placed===4)S.after(2700,phase2)}
   else{sfx.bad();toast("Not there",m.id==="ibu"?"Try where it hurts":m.id==="apap"?"Try the brain":"Try the spinal cord",1300);S.back(dd,hx,hy)}}})});
 function phase2(){S.el.innerHTML="";S.sp("receptor",.2,.5,.15);
  S.say([["tasha","Pain signals are racing up the nerve! Let's use the pain plan to <em>calm each one</em>. Tap them!"]],()=>{
   let calm=0;const need=12;S.goal("Tap the <b>pain signals</b> to calm them before they reach the brain.");
   const hud=()=>S.hud(`<div class="meter"><i style="width:${calm/need*100}%"></i><span>Signals calmed ${calm}/${need}</span></div>`);hud();
   const bolts=[];let sp=0;const L=S.loop(dt=>{sp-=dt;if(sp<=0&&calm<need){sp=rnd(.6,1);const b=S.sp("bolt",rnd(.38,.62),1.02,.11,{svg:BOLT,ratio:1.6});b.v=rnd(110,160);
     S.tap(b,()=>{if(b.dead)return;b.dead=true;sfx.pop();S.burst(b.x,b.y,"#9fe8ff",12);b.kill();calm++;hud();if(calm>=need){L.on=false;S.after(700,done)}});bolts.push(b)}
    for(const b of bolts){if(b.dead)continue;b.y-=b.v*dt;b.x+=Math.sin(b.y/30)*.8;b.place();if(b.y<.1*H){b.dead=true;b.kill();sfx.bad();toast("Ouch!","Keep calming the signals",800,"#ffb18a")}}})})}
}

function gameGene(S,done){
 const W=S.W(),H=S.H();let got=0;const need=6;
 const bag=S.tag("🩸 Collection bag",.5,.88,"big gold");bag.x=.5*W;bag.y=.88*H;
 S.goal("Tap each <b>blood stem cell</b> to collect it.");
 S.hud(null);
 for(let i=0;i<need;i++){const s=S.sp("stem",rnd(.15,.85),rnd(.25,.7),.17,{pop:true});s.ph=rnd(0,6);
  const L=S.loop(dt=>{if(s.got)return;s.ph+=dt;s.x+=Math.sin(s.ph)*.5;s.y+=Math.cos(s.ph*1.2)*.4;s.place()});
  S.tap(s,()=>{if(s.got)return;s.got=true;L.on=false;sfx.pop();s.go(bag.x+rnd(-30,30),bag.y-30,500).then(()=>s.kill(300));got++;if(got>=need)S.after(800,edit)})}
 function edit(){S.el.innerHTML="";S.say([["amos","Stem cells collected! Now, two ways to fix them. Way #1: <em>EDIT</em>. <i>Casgevy</i> uses CRISPR scissors to cut the <em>BCL11A switch</em>, the brake that turns fetal hemoglobin OFF."],["krystal","Cut the brake and HbF turns back on! Drag the scissors to the switch!"]],()=>{
   const dna=S.div("dna","",{top:.44*H+"px"});dna.classList.add("sm");dna.innerHTML=["TGA","CAA","GTG","CCA"].map((c,i)=>`<div class="cod ${i===2?"hl":""}">${[...c].map(l=>`<span class="${l}">${l}</span>`).join("")}</div>`).join("");
   const tgt=S.tag("BCL11A switch (HbF brake)",.66,.37,"gold");const tr=dna.children[2].getBoundingClientRect(),sr=S.el.getBoundingClientRect();const T={x:tr.left-sr.left+tr.width/2,y:tr.top-sr.top+tr.height/2};
   S.goal("Drag the <b>CRISPR scissors</b> onto the glowing switch.");
   const sc=S.sp("cas9",.25,.75,.26,{pop:true});const hx=sc.x,hy=sc.y;
   S.drag(sc,{onDrop:d=>{if(S.dist(d,T)<.13*W){d.classList.remove("drag");d.go(T.x,T.y,200).then(()=>{sfx.zap();S.burst(T.x,T.y,"#ffd76a",22);dna.children[2].style.opacity=.25;tgt.innerHTML="✂️ Brake cut: <b style='color:#5dffa0'>HbF ON!</b>";d.kill(500);
       for(let i=0;i<5;i++)S.after(300+i*120,()=>{const g=S.sp("gamma",T.x/W,T.y/H,.1,{pop:true});g.go(rnd(.1,.9)*W,rnd(.6,.85)*H,800)});S.after(2000,add)})}
    else S.back(d,hx,hy)}})})}
 function add(){S.el.innerHTML="";S.say([["amos","Way #2: <em>ADD</em>. <i>Lyfgenia</i> uses a harmless, emptied-out virus as a delivery truck to add a working, anti-sickling beta gene to the stem cell."],["krystal","Drag the delivery capsule into the stem cell!"]],()=>{
   const cell=S.sp("stem",.5,.42,.55);S.goal("Drag the <b>gene delivery capsule</b> into the stem cell.");
   const v=S.sp("vector",.5,.82,.22,{pop:true});const hx=v.x,hy=v.y;
   S.drag(v,{onDrop:d=>{if(S.dist(d,cell)<.18*W){d.classList.remove("drag");d.go(cell.x,cell.y,250).then(()=>{d.kill(500);sfx.win();S.burst(cell.x,cell.y,"#c58bff",26);cell.classList.add("glow");S.tag("New anti-sickling gene added!",.5,.72,"gold pop");S.after(1600,infuse)})}else S.back(d,hx,hy)}})})}
 function infuse(){S.el.innerHTML="";S.say([["amos","Before the fixed cells go back in, the patient gets <em>chemotherapy</em> to make room in the bone marrow. It's tough, and the care team watches very closely."],["amos","Now tap <em>Return the cells</em>. Let's watch them get to work!"]],()=>{
   S.goal(null);const mar=S.tag("🦴 Bone marrow",.5,.82,"big gold");
   S.hud(`<button class="tool" id="inf" style="font-size:17px;padding:12px 18px"><img src="obj/stem.webp" alt="">Return the cells</button>`);
   $("inf").onclick=()=>{audio();S.hud(null);sfx.win();for(let i=0;i<6;i++)S.after(i*150,()=>{const s=S.sp("stem",.5,.12,.13,{cls:"glow",pop:true});s.go(rnd(.3,.7)*W,.8*H,900).then(()=>s.kill(400))});
    S.after(1500,()=>{for(let i=0;i<14;i++)S.after(i*110,()=>{const r=S.sp("rbc",.5,.8,.13,{pop:true});r.go(rnd(.05,.95)*W,rnd(.12,.6)*H,1100)});S.tag("Healthy red cells that don't sickle!",.5,.68,"big gold pop");S.after(2600,done)})}})}
}

/* =====================================================================
   BOOT
   ===================================================================== */
load().then(()=>{$("loading").classList.add("hide");openTitle()});
window.__mq={BOARDS,openBoard,openMap,SAVE};
