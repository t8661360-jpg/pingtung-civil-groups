/* 佈景主題、節日裝扮、動態背景與音樂（2026-11-11）
   - 佈景與節日只改外觀，不影響問答內容。
   - 音樂預設關閉，由使用者自己打開；旋律為程式即時產生的原創音型，沒有使用任何既有歌曲。
   - 系統設定「減少動態效果」時，動態背景預設關閉。 */
(function(){
'use strict';
const root=document.documentElement;
const store={get(k,d){try{const v=localStorage.getItem('pt_'+k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('pt_'+k,v)}catch(e){}}};
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 佈景主題 ---------- */
const THEMES={
 warm:{name:'暖陽橘',icon:'🧡',vars:null,fx:'none',tune:'calm'},
 ocean:{name:'海洋藍',icon:'🌊',fx:'bubbles',tune:'calm',vars:{bg:'#EEF7FB',surface:'#FFFFFF',soft:'#D9EEF7',soft2:'#E8F5FA',ink:'#17333F',muted:'#52707C',primary:'#0F7C99','primary-ink':'#FFFFFF',sun:'#F4B23A',line:'#C9E2EC'}},
 forest:{name:'森林綠',icon:'🌿',fx:'leaves',tune:'calm',vars:{bg:'#F2F8F0',surface:'#FFFFFF',soft:'#DCEEDA',soft2:'#EAF5E8',ink:'#1F3324',muted:'#5A7260',primary:'#2F7D4F','primary-ink':'#FFFFFF',sun:'#E9A93A',line:'#CFE3CC'}},
 sakura:{name:'櫻花粉',icon:'🌸',fx:'petals',tune:'east',vars:{bg:'#FFF4F6',surface:'#FFFFFF',soft:'#FFE0E7',soft2:'#FFECF0',ink:'#40222B',muted:'#80606A',primary:'#C8456B','primary-ink':'#FFFFFF',sun:'#F4B23A',line:'#F6D3DB'}},
 night:{name:'星空夜',icon:'🌙',fx:'stars',tune:'calm',dark:true,vars:{bg:'#12162B',surface:'#1C2140',soft:'#2A3160',soft2:'#232A52',ink:'#EEF0FF',muted:'#B3B9DD',primary:'#9DA8FF','primary-ink':'#12162B',sun:'#FFD66B',line:'#353D70'}}
};
/* ---------- 節日 ---------- */
const FEST={
 newyear:{name:'新年',greet:'新年快樂',fx:'confetti',costume:'party',walker:'🎈',tune:'party',vars:{bg:'#FFF8E6',soft:'#FFEBB8',soft2:'#FFF3D1',primary:'#B8480F',sun:'#F4B23A',line:'#F3DFAE'}},
 lunarny:{name:'農曆春節',greet:'新春愉快，恭喜發財',fx:'redpack',costume:'cny',walker:'🦁',tune:'east',vars:{bg:'#FFF3EC',soft:'#FFD9CC',soft2:'#FFE8DF',primary:'#C8102E',sun:'#F2B544',line:'#F5CBBB'}},
 lantern:{name:'元宵節',greet:'元宵節快樂',fx:'lanterns',costume:'lantern',walker:'🏮',tune:'east',vars:{bg:'#FFF5E8',soft:'#FFE2BF',soft2:'#FFEED6',primary:'#C2410C',sun:'#F4B23A',line:'#F5D9B5'}},
 valentine:{name:'情人節',greet:'情人節快樂',fx:'hearts',costume:'hearts',walker:'💌',tune:'calm',vars:{bg:'#FFF2F5',soft:'#FFDCE5',soft2:'#FFE9EE',primary:'#C8325E',sun:'#F4B23A',line:'#F6CDD8'}},
 women:{name:'婦女節',greet:'婦女節快樂',fx:'petals',costume:'flower',walker:'💐',tune:'calm',vars:{bg:'#FBF3FB',soft:'#F0DCF2',soft2:'#F6E9F7',primary:'#9B3FA6',sun:'#F4B23A',line:'#E6CDE9'}},
 children:{name:'兒童節',greet:'兒童節快樂',fx:'balloons',costume:'kids',walker:'🧸',tune:'party',vars:{bg:'#F1FAFF',soft:'#D6EFFB',soft2:'#E6F6FD',primary:'#0F7C99',sun:'#FFC83D',line:'#C5E5F2'}},
 mother:{name:'母親節',greet:'母親節快樂',fx:'petals',costume:'flower',walker:'🌷',tune:'calm',vars:{bg:'#FFF4F4',soft:'#FFDDE0',soft2:'#FFEAEC',primary:'#C4455A',sun:'#F4B23A',line:'#F5CFD4'}},
 dragonboat:{name:'端午節',greet:'端午節安康',fx:'bamboo',costume:'dragonboat',walker:'🐉',tune:'east',vars:{bg:'#F1F8EE',soft:'#D9EDD2',soft2:'#E7F4E2',primary:'#2F7D4F',sun:'#E9A93A',line:'#CBE3C3'}},
 father:{name:'父親節',greet:'父親節快樂',fx:'stars',costume:'bowtie',walker:'👔',tune:'calm',vars:{bg:'#F0F6FA',soft:'#D8E8F2',soft2:'#E6F0F7',primary:'#27668C',sun:'#F4B23A',line:'#C8DCE9'}},
 qixi:{name:'七夕',greet:'七夕快樂',fx:'stars',costume:'hearts',walker:'🌌',tune:'east',dark:true,vars:{bg:'#161A33',surface:'#20264A',soft:'#303866',soft2:'#293058',ink:'#F1F0FF',muted:'#B9BCE0',primary:'#F3A0C2','primary-ink':'#1B1630',sun:'#FFD66B',line:'#3A4275'}},
 midautumn:{name:'中秋節',greet:'中秋節快樂',fx:'moon',costume:'bunny',walker:'🐇',tune:'east',dark:true,vars:{bg:'#151A35',surface:'#1F2548',soft:'#2E3663',soft2:'#272E57',ink:'#F4F1E4',muted:'#C0BFA9',primary:'#F2C14E','primary-ink':'#1F1A08',sun:'#FFE08A',line:'#39416F'}},
 teacher:{name:'教師節',greet:'教師節快樂',fx:'leaves',costume:'gradcap',walker:'📚',tune:'calm',vars:{bg:'#F5F7EF',soft:'#E3EAD0',soft2:'#EDF2E0',primary:'#5C7A1F',sun:'#E9A93A',line:'#D5DFBC'}},
 doubleten:{name:'國慶日',greet:'國慶日快樂',fx:'confetti',costume:'party',walker:'🎆',tune:'party',vars:{bg:'#F4F6FC',soft:'#DCE3F6',soft2:'#E9EDF9',primary:'#1F3F99',sun:'#E0312B',line:'#CBD4EE'}},
 halloween:{name:'萬聖節',greet:'萬聖節快樂，不給糖就搗蛋',fx:'spooky',costume:'witch',walker:'👻',tune:'spooky',dark:true,vars:{bg:'#1B1424',surface:'#281D35',soft:'#3A2A4D',soft2:'#312341',ink:'#F7ECDD',muted:'#C8B6CF',primary:'#FF8A2B','primary-ink':'#24120A',sun:'#FFC94D',line:'#46345A'}},
 christmas:{name:'聖誕節',greet:'聖誕快樂',fx:'snow',costume:'santa',walker:'🦌',tune:'bells',vars:{bg:'#F3F8F4',soft:'#DCEBDD',soft2:'#E8F2E9',primary:'#B3202C',sun:'#E9B949',line:'#CCE0CE'}}
};
const lunarFmt=(()=>{try{return new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric',timeZone:'Asia/Taipei'})}catch(e){return null}})();
function lunar(d){if(!lunarFmt)return null;try{const p=lunarFmt.formatToParts(d);const m=p.find(x=>x.type==='month').value,day=+p.find(x=>x.type==='day').value;if(/bis/.test(m))return null;return{m:parseInt(m,10),d:day}}catch(e){return null}}
function solar(d){const s=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'numeric',day:'numeric',weekday:'short'}).formatToParts(d);const g=t=>s.find(x=>x.type===t).value;return{y:+g('year'),m:+g('month'),d:+g('day'),w:g('weekday')}}
function festivalOn(date){
 const s=solar(date),l=lunar(date),nx=lunar(new Date(date.getTime()+864e5));
 const md=s.m*100+s.d;
 if(l){
  if((l.m===1&&l.d<=5)||(nx&&nx.m===1&&nx.d===1))return'lunarny';
  if(l.m===1&&l.d>=13&&l.d<=15)return'lantern';
  if(l.m===5&&l.d>=3&&l.d<=5)return'dragonboat';
  if(l.m===7&&l.d>=6&&l.d<=7)return'qixi';
  if(l.m===8&&l.d>=13&&l.d<=15)return'midautumn';
 }
 if(md===1231||md<=102)return'newyear';
 if(md>=212&&md<=214)return'valentine';
 if(md===308)return'women';
 if(md>=401&&md<=404)return'children';
 if(s.m===5&&s.d>=6&&s.d<=14){ /* 五月第二個星期日及前兩天 */
  const dow=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(s.w);const toSun=(7-dow)%7;const sunDay=s.d+toSun;
  if(sunDay>=8&&sunDay<=14&&toSun<=2)return'mother';
 }
 if(md>=806&&md<=808)return'father';
 if(md===928)return'teacher';
 if(md>=1009&&md<=1010)return'doubleten';
 if(md>=1025&&md<=1031)return'halloween';
 if(md>=1215&&md<=1225)return'christmas';
 return null;
}

/* ---------- 櫃檯人員節日造型（加在頭部群組，會跟著點頭、歪頭） ---------- */
const COSTUME={
 santa:['head','<path d="M102 84 C112 22 196 8 220 80 Z" fill="#D7263D"/><path d="M186 26 Q226 14 236 44" stroke="#D7263D" stroke-width="16" fill="none" stroke-linecap="round"/><rect x="96" y="72" width="130" height="18" rx="9" fill="#fff"/><circle cx="238" cy="50" r="11" fill="#fff"/>'],
 witch:['head','<path d="M158 -8 L204 72 L112 72 Z" fill="#3B2A55"/><ellipse cx="158" cy="74" rx="80" ry="12" fill="#3B2A55"/><rect x="121" y="56" width="74" height="10" fill="#FF8A2B"/><rect x="150" y="54" width="16" height="14" rx="2" fill="none" stroke="#FFC94D" stroke-width="3"/>'],
 party:['head','<path d="M160 -2 L194 66 L126 66 Z" fill="#6B64A8"/><path d="M146 30 L176 34 M138 48 L184 54" stroke="#F4B23A" stroke-width="5"/><circle cx="160" cy="-2" r="9" fill="#F4B23A"/>'],
 bunny:['head','<ellipse cx="130" cy="26" rx="13" ry="36" fill="#fff" stroke="#E9C9B5" stroke-width="2"/><ellipse cx="130" cy="30" rx="5.5" ry="24" fill="#F7B6C2"/><ellipse cx="190" cy="26" rx="13" ry="36" fill="#fff" stroke="#E9C9B5" stroke-width="2"/><ellipse cx="190" cy="30" rx="5.5" ry="24" fill="#F7B6C2"/><path d="M106 76 Q160 48 214 76" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>'],
 cny:['head','<path d="M104 86 C106 28 214 28 216 86 Z" fill="#C8102E"/><rect x="100" y="76" width="120" height="13" rx="6.5" fill="#F2B544"/><circle cx="160" cy="34" r="9" fill="#F2B544"/><path d="M160 34 q14 14 6 30" stroke="#F2B544" stroke-width="3" fill="none"/>'],
 hearts:['head','<path d="M106 76 Q160 46 214 76" stroke="#DE5F72" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M132 52c-9-9-23 6 0 22 23-16 9-31 0-22z" fill="#DE5F72"/><path d="M190 52c-9-9-23 6 0 22 23-16 9-31 0-22z" fill="#F08394"/>'],
 flower:['head','<g transform="translate(206 84)"><circle cx="0" cy="-11" r="9" fill="#F7A8B8"/><circle cx="10" cy="-3" r="9" fill="#F7A8B8"/><circle cx="6" cy="9" r="9" fill="#F7A8B8"/><circle cx="-6" cy="9" r="9" fill="#F7A8B8"/><circle cx="-10" cy="-3" r="9" fill="#F7A8B8"/><circle cx="0" cy="0" r="6" fill="#F4B23A"/></g>'],
 dragonboat:['head','<path d="M104 80 Q160 52 216 80" stroke="#2F7D4F" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M160 34 L182 66 L138 66 Z" fill="#5E9C3F" stroke="#2F7D4F" stroke-width="2"/><path d="M144 58 L176 58 M150 48 L170 48" stroke="#F4E3B0" stroke-width="2.5"/>'],
 lantern:['head','<path d="M214 60 v14" stroke="#8A5A1C" stroke-width="3"/><ellipse cx="214" cy="92" rx="15" ry="18" fill="#D7263D"/><rect x="204" y="72" width="20" height="5" rx="2" fill="#F2B544"/><rect x="204" y="107" width="20" height="5" rx="2" fill="#F2B544"/><path d="M214 112 v12" stroke="#F2B544" stroke-width="3"/>'],
 kids:['head','<path d="M108 82 C110 34 210 34 212 82 Z" fill="#2D9CDB"/><path d="M160 36 C150 54 150 70 160 82 C170 70 170 54 160 36" fill="#FFC83D"/><rect x="104" y="76" width="112" height="9" rx="4.5" fill="#EB5757"/><path d="M160 34 v-12 M140 20 h40" stroke="#EB5757" stroke-width="5" stroke-linecap="round"/>'],
 gradcap:['head','<path d="M160 28 L238 56 L160 84 L82 56 Z" fill="#2D2A32"/><path d="M114 70 v10 Q160 100 206 80 v-10 Q160 90 114 70" fill="#3B3842"/><path d="M228 58 v26" stroke="#F4B23A" stroke-width="3"/><circle cx="228" cy="88" r="5" fill="#F4B23A"/>'],
 bowtie:['body','<path d="M160 206 l-22 -12 v24 z M160 206 l22 -12 v24 z" fill="#27668C"/><circle cx="160" cy="206" r="6" fill="#1D4F6E"/>']
};
function dress(name){
 const svg=document.getElementById('clerk');if(!svg)return;
 svg.querySelectorAll('.costume').forEach(n=>n.remove());
 const c=COSTUME[name];if(!c)return;
 const host=svg.querySelector(c[0]==='head'?'.head':'.body');if(!host)return;
 const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','costume');g.setAttribute('aria-hidden','true');g.innerHTML=c[1];
 if(c[0]==='head')host.appendChild(g);else host.insertBefore(g,svg.querySelector('.head'));
}

/* ---------- 動態背景（表情符號粒子，畫在頁面底層，不遮住文字） ---------- */
const FX={
 none:null,
 bubbles:{g:['○','◯','∘'],dir:-1,sp:.35,sway:.6},
 leaves:{g:['🍃','🌿','🍂'],dir:1,sp:.5,sway:1.2,spin:1},
 petals:{g:['🌸','🌸','🌷'],dir:1,sp:.45,sway:1.1,spin:1},
 stars:{g:['✨','⭐','✦'],dir:0,sp:0,twinkle:1},
 snow:{g:['❄️','❄','•'],dir:1,sp:.55,sway:.8},
 hearts:{g:['💗','💕','❤'],dir:-1,sp:.4,sway:.7},
 lanterns:{g:['🏮','🏮','✨'],dir:-1,sp:.3,sway:.5},
 redpack:{g:['🧧','🏮','🪙','🎊'],dir:1,sp:.5,sway:.6,spin:.5},
 confetti:{g:['🎉','🎊','✨','🎈'],dir:1,sp:.6,sway:1,spin:1},
 balloons:{g:['🎈','🎈','🪁'],dir:-1,sp:.45,sway:.8},
 bamboo:{g:['🎋','🍃','💧'],dir:1,sp:.5,sway:1,spin:.6},
 moon:{g:['✨','⭐','🌕','🥮'],dir:0,sp:0,twinkle:1},
 spooky:{g:['🎃','👻','🦇','🕸️'],dir:-1,sp:.3,sway:1.3}
};
let cv,ctx,parts=[],raf=0,fxName='none';
function fxStart(name){
 fxName=name;const f=FX[name];
 if(!f||store.get('fx',reduce?'off':'on')==='off'){fxStop();return}
 if(!cv){cv=document.createElement('canvas');cv.id='fxcanvas';cv.setAttribute('aria-hidden','true');document.body.prepend(cv);ctx=cv.getContext('2d');addEventListener('resize',size)}
 cv.hidden=false;size();ctx.fillStyle=getComputedStyle(root).getPropertyValue('--primary')||'#C2531A';
 const n=innerWidth<700?10:20;parts=[];
 for(let i=0;i<n;i++)parts.push(spawn(f,true));
 cancelAnimationFrame(raf);let last=performance.now();
 const tick=t=>{raf=requestAnimationFrame(tick);if(document.hidden)return;const dt=Math.min(50,t-last)/16;last=t;draw(f,dt,t)};raf=requestAnimationFrame(tick);
}
function fxStop(){cancelAnimationFrame(raf);parts=[];if(cv){ctx.clearRect(0,0,cv.width,cv.height);cv.hidden=true}}
function size(){if(!cv)return;const r=Math.min(2,devicePixelRatio||1);cv.width=innerWidth*r;cv.height=innerHeight*r;ctx.setTransform(r,0,0,r,0,0);ctx.fillStyle=getComputedStyle(root).getPropertyValue('--primary')||'#C2531A'}
function spawn(f,any){const s=14+Math.random()*16;return{x:Math.random()*innerWidth,y:any||!f.dir?Math.random()*innerHeight:(f.dir>0?-30:innerHeight+30),s,g:f.g[Math.floor(Math.random()*f.g.length)],v:(.5+Math.random())*f.sp,ph:Math.random()*6.28,r:Math.random()*6.28}}
function draw(f,dt,t){
 ctx.clearRect(0,0,innerWidth,innerHeight);ctx.textAlign='center';ctx.textBaseline='middle';
 for(let i=0;i<parts.length;i++){const p=parts[i];
  p.y+=f.dir*p.v*dt;p.x+=Math.sin(t/1400+p.ph)*(f.sway||0)*.5*dt;if(f.spin)p.r+=.01*f.spin*dt;
  if((f.dir>0&&p.y>innerHeight+30)||(f.dir<0&&p.y<-30))parts[i]=spawn(f,false);
  ctx.save();ctx.translate(p.x,p.y);if(f.spin)ctx.rotate(p.r);ctx.globalAlpha=f.twinkle?.25+.55*Math.abs(Math.sin(t/900+p.ph)):.7;ctx.font=p.s+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';ctx.fillText(p.g,0,0);ctx.restore();}
}
/* ---------- 走過畫面下方的小角色 ---------- */
let walker,walkTimer=0;
function walk(emoji){
 clearInterval(walkTimer);if(walker){walker.remove();walker=null}
 if(!emoji||store.get('fx',reduce?'off':'on')==='off')return;
 walker=document.createElement('div');walker.id='walker';walker.setAttribute('aria-hidden','true');walker.textContent=emoji;document.body.appendChild(walker);
 const go=()=>{if(!walker||document.hidden)return;walker.classList.remove('go');void walker.offsetWidth;walker.classList.add('go')};
 setTimeout(go,2500);walkTimer=setInterval(go,45000);
}

/* ---------- 音樂與音效（WebAudio 即時產生，預設關閉） ---------- */
const TUNES={
 calm:{scale:[0,2,4,7,9],base:57,bpm:66,wave:'sine',len:1.4},
 east:{scale:[0,2,5,7,9],base:62,bpm:84,wave:'triangle',len:.7},
 bells:{scale:[0,4,7,11,12],base:72,bpm:92,wave:'sine',len:1.8},
 party:{scale:[0,2,4,5,7,9],base:64,bpm:116,wave:'triangle',len:.35},
 spooky:{scale:[0,1,3,6,7],base:50,bpm:60,wave:'sawtooth',len:1.2}
};
let ac=null,master=null,musicTimer=0,step=0,curTune='calm';
function audio(){if(!ac){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ac=new A();master=ac.createGain();master.gain.value=.05;master.connect(ac.destination)}if(ac.state==='suspended')ac.resume();return ac}
function note(midi,when,len,wave,vol){const o=ac.createOscillator(),g=ac.createGain();o.type=wave;o.frequency.value=440*Math.pow(2,(midi-69)/12);g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(vol,when+.02);g.gain.exponentialRampToValueAtTime(.0008,when+len);o.connect(g);g.connect(master);o.start(when);o.stop(when+len+.05)}
function soundOn(){return store.get('sound','off')==='on'}
function musicStart(){
 musicStop();if(!soundOn()||!audio())return;const T=TUNES[curTune]||TUNES.calm;const beat=60/T.bpm;
 /* 固定的音型種子＋隨機行走：每個佈景有自己的味道，但不是任何既有旋律 */
 let pos=2;const play=()=>{const now=ac.currentTime+.05;const bar=step%8;
  pos=Math.max(0,Math.min(T.scale.length*2-1,pos+[1,1,-2,1,2,-1,-1,-1][bar]+(Math.random()<.3?(Math.random()<.5?1:-1):0)));
  const deg=T.scale[pos%T.scale.length]+12*Math.floor(pos/T.scale.length);
  if(bar!==7||Math.random()<.5)note(T.base+deg,now,T.len,T.wave,1);
  if(bar===0||bar===4)note(T.base-12+T.scale[bar?2:0],now,beat*3.5,'sine',.7);
  step++};
 play();musicTimer=setInterval(play,beat*1000);
}
function musicStop(){clearInterval(musicTimer);musicTimer=0}
function sfx(kind){if(!soundOn()||!audio())return;const n=ac.currentTime+.01;if(kind==='ask'){note(76,n,.12,'triangle',1.2)}else if(kind==='answer'){note(72,n,.18,'sine',1.2);note(79,n+.12,.3,'sine',1.2)}else{note(84,n,.08,'sine',1)}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)musicStop();else if(soundOn())musicStart()});

/* ---------- 套用 ---------- */
const VARS=['bg','surface','soft','soft2','ink','muted','primary','primary-ink','sun','line'];
let current={theme:'warm',fest:null};
function apply(){
 const pref=store.get('theme','auto');            // auto＝有節日用節日，沒有用暖陽橘
 const preview=store.get('preview','');
 const today=preview&&FEST[preview]?preview:(store.get('festauto','on')==='on'?festivalOn(new Date()):null);
 let conf,fest=null;
 if(pref==='auto'&&today){fest=today;conf=FEST[today]}
 else conf=THEMES[pref==='auto'?'warm':pref]||THEMES.warm;
 VARS.forEach(v=>root.style.removeProperty('--'+v));
 if(conf.vars){Object.entries(conf.vars).forEach(([k,v])=>root.style.setProperty('--'+k,v));
  if(conf.dark){root.dataset.theme='dark'}else{root.dataset.theme='light';if(!conf.vars.surface){root.style.setProperty('--surface','#FFFFFF');root.style.setProperty('--ink','#3A281D');root.style.setProperty('--muted','#7B6355');root.style.setProperty('--primary-ink','#FFFFFF')}}
 }else delete root.dataset.theme;
 /* 節日造型與小角色：手動選佈景時，如果今天是節日，小屏還是會換裝 */
 const wear=today?FEST[today]:null;
 dress(wear?wear.costume:null);
 fxStart(conf.fx||'none');walk(fest?conf.walker:(wear?wear.walker:null));
 curTune=conf.tune||'calm';if(soundOn())musicStart();
 const changed=current.fest!==today;current={theme:pref,fest:today};
 if(today&&changed&&typeof window.say==='function'){setTimeout(()=>{try{window.say(FEST[today].greet+'！有問題直接問我就可以囉。')}catch(e){}},1300)}
 paint();
}

/* ---------- 設定面板 ---------- */
let panel,fab;
function build(){
 fab=document.createElement('button');fab.type='button';fab.id='themefab';fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-expanded','false');fab.title='佈景與音樂';fab.innerHTML='<span aria-hidden="true">🎨</span><span class="sr">佈景與音樂</span>';
 panel=document.createElement('div');panel.id='themepanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','佈景與音樂');panel.hidden=true;
 document.body.append(fab,panel);
 fab.addEventListener('click',()=>{panel.hidden=!panel.hidden;fab.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)paint()});
 document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!fab.contains(e.target)){panel.hidden=true;fab.setAttribute('aria-expanded','false')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;fab.setAttribute('aria-expanded','false');fab.focus()}});
 panel.addEventListener('click',e=>{
  const t=e.target.closest('[data-theme-pick]');if(t){store.set('theme',t.dataset.themePick);store.set('preview','');sfx('tap');apply();return}
  const s=e.target.closest('[data-toggle]');if(s){const k=s.dataset.toggle;const def=k==='fx'?(reduce?'off':'on'):k==='sound'?'off':'on';const now=store.get(k,def)==='on'?'off':'on';store.set(k,now);if(k==='sound'){if(now==='on'){audio();sfx('answer');musicStart()}else musicStop()}apply();return}
 });
 panel.addEventListener('change',e=>{if(e.target.id==='festpreview'){store.set('preview',e.target.value);if(e.target.value)store.set('theme','auto');apply()}});
 const form=document.getElementById('askform');if(form)form.addEventListener('submit',()=>sfx('ask'));
 const board=document.getElementById('board');if(board&&window.MutationObserver){let last='';new MutationObserver(()=>{const t=board.querySelector('.atitle');const k=t?t.textContent:'';if(k&&k!==last)sfx('answer');last=k}).observe(board,{childList:true,subtree:true})}
}
function paint(){
 if(!panel||panel.hidden)return;
 const pref=store.get('theme','auto'),on=k=>store.get(k,k==='fx'?(reduce?'off':'on'):k==='sound'?'off':'on')==='on';
 const chip=(id,icon,name)=>`<button type="button" class="tchip" data-theme-pick="${id}" aria-pressed="${pref===id}"><span aria-hidden="true">${icon}</span>${name}</button>`;
 const sw=(k,label)=>`<button type="button" class="tswitch" data-toggle="${k}" role="switch" aria-checked="${on(k)}"><span>${label}</span><i></i></button>`;
 const fest=current.fest;
 panel.innerHTML=`<h2>佈景</h2><div class="tchips">${chip('auto','🎉','跟著節日')}${Object.entries(THEMES).map(([id,t])=>chip(id,t.icon,t.name)).join('')}</div>
 ${sw('fx','動態背景')}${sw('sound','音樂和音效')}${sw('festauto','節日佈景和造型')}
 <label class="tprev">先看看節日佈景<select id="festpreview"><option value="">今天${fest&&!store.get('preview','')?'（'+FEST[fest].name+'）':''}</option>${Object.entries(FEST).map(([id,f])=>`<option value="${id}"${store.get('preview','')===id?' selected':''}>${f.name}</option>`).join('')}</select></label>`;
}
const css=document.createElement('style');css.textContent=`
#fxcanvas{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none}
main,footer{position:relative;z-index:1}
#walker{position:fixed;left:-60px;bottom:10px;font-size:34px;line-height:1;z-index:6;pointer-events:none;opacity:0}
#walker.go{animation:ptwalk 16s linear 1,ptbob .5s ease-in-out 32 alternate}
@keyframes ptwalk{0%{left:-60px;opacity:1}98%{opacity:1}100%{left:calc(100vw + 60px);opacity:0}}
@keyframes ptbob{from{transform:translateY(0)}to{transform:translateY(-9px)}}
#themefab{position:fixed;left:16px;bottom:16px;z-index:25;width:48px;height:48px;border-radius:50%;border:2px solid var(--line);background:var(--surface);box-shadow:var(--shadow);cursor:pointer;font-size:22px;line-height:1;display:grid;place-items:center}
#themefab:hover{border-color:var(--primary)}
#themepanel{position:fixed;left:16px;bottom:74px;z-index:25;width:min(320px,calc(100vw - 32px));background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:16px}
#themepanel h2{font-size:1rem;margin:0 0 10px}
.tchips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.tchip{display:inline-flex;align-items:center;gap:5px;border:1.5px solid var(--line);background:var(--soft2);color:var(--ink);border-radius:999px;padding:5px 11px;font-size:.9rem;cursor:pointer;font-family:inherit}
.tchip[aria-pressed="true"]{background:var(--primary);border-color:var(--primary);color:var(--primary-ink)}
.tswitch{display:flex;width:100%;justify-content:space-between;align-items:center;background:none;border:0;border-top:1px solid var(--line);padding:10px 2px;cursor:pointer;font-family:inherit;font-size:.95rem;color:var(--ink)}
.tswitch i{width:40px;height:22px;border-radius:999px;background:var(--line);position:relative;flex:none;transition:background .15s}
.tswitch i::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:left .15s}
.tswitch[aria-checked="true"] i{background:var(--primary)}
.tswitch[aria-checked="true"] i::after{left:20px}
.tprev{display:flex;justify-content:space-between;align-items:center;gap:10px;border-top:1px solid var(--line);padding-top:10px;font-size:.9rem;color:var(--muted)}
.tprev select{border:1px solid var(--line);border-radius:8px;padding:4px 6px;background:var(--surface);color:var(--ink);max-width:150px}
@media (prefers-reduced-motion:reduce){#walker.go{animation:none}.tswitch i,.tswitch i::after{transition:none}}
@media print{#fxcanvas,#walker,#themefab,#themepanel{display:none!important}}
`;document.head.appendChild(css);
function init(){build();apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.PTFestive={festivalOn,apply,FEST,THEMES};
})();
