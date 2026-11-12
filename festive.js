/* 佈景主題、節日裝扮與佈置（2026-11-12 改版：取消音樂與飄動的圖案，改成靜態佈置）
   - 佈景與節日只改外觀，不影響問答內容。
   - 佈置＝上方的吊飾、底部的風景、淡淡的底紋，全部是程式畫的原創圖形。
   - 只有吊飾會輕輕擺動；系統設定「減少動態效果」時預設不擺動。 */
(function(){
'use strict';
const root=document.documentElement;
const store={get(k,d){try{const v=localStorage.getItem('pt_'+k);return v===null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem('pt_'+k,v)}catch(e){}}};
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 佈景主題 ---------- */
const THEMES={
 warm:{name:'暖陽橘',icon:'🧡',vars:null},
 ocean:{name:'海洋藍',icon:'🌊',vars:{bg:'#EEF7FB',surface:'#FFFFFF',soft:'#D9EEF7',soft2:'#E8F5FA',ink:'#17333F',muted:'#52707C',primary:'#0F7C99','primary-ink':'#FFFFFF',sun:'#F4B23A',line:'#C9E2EC'}},
 forest:{name:'森林綠',icon:'🌿',vars:{bg:'#F2F8F0',surface:'#FFFFFF',soft:'#DCEEDA',soft2:'#EAF5E8',ink:'#1F3324',muted:'#5A7260',primary:'#2F7D4F','primary-ink':'#FFFFFF',sun:'#E9A93A',line:'#CFE3CC'}},
 sakura:{name:'櫻花粉',icon:'🌸',vars:{bg:'#FFF4F6',surface:'#FFFFFF',soft:'#FFE0E7',soft2:'#FFECF0',ink:'#40222B',muted:'#80606A',primary:'#C8456B','primary-ink':'#FFFFFF',sun:'#F4B23A',line:'#F6D3DB'}},
 night:{name:'星空夜',icon:'🌙',dark:true,vars:{bg:'#12162B',surface:'#1C2140',soft:'#2A3160',soft2:'#232A52',ink:'#EEF0FF',muted:'#B3B9DD',primary:'#9DA8FF','primary-ink':'#12162B',sun:'#FFD66B',line:'#353D70'}}
};
/* ---------- 節日 ---------- */
const FEST={
 newyear:{name:'新年',greet:'新年快樂',costume:'party',vars:{bg:'#FFF8E6',soft:'#FFEBB8',soft2:'#FFF3D1',primary:'#B8480F',sun:'#F4B23A',line:'#F3DFAE'}},
 lunarny:{name:'農曆春節',greet:'新春愉快，恭喜發財',costume:'cny',vars:{bg:'#FFF3EC',soft:'#FFD9CC',soft2:'#FFE8DF',primary:'#C8102E',sun:'#F2B544',line:'#F5CBBB'}},
 lantern:{name:'元宵節',greet:'元宵節快樂',costume:'lantern',vars:{bg:'#FFF5E8',soft:'#FFE2BF',soft2:'#FFEED6',primary:'#C2410C',sun:'#F4B23A',line:'#F5D9B5'}},
 valentine:{name:'情人節',greet:'情人節快樂',costume:'hearts',vars:{bg:'#FFF2F5',soft:'#FFDCE5',soft2:'#FFE9EE',primary:'#C8325E',sun:'#F4B23A',line:'#F6CDD8'}},
 women:{name:'婦女節',greet:'婦女節快樂',costume:'flower',vars:{bg:'#FBF3FB',soft:'#F0DCF2',soft2:'#F6E9F7',primary:'#9B3FA6',sun:'#F4B23A',line:'#E6CDE9'}},
 children:{name:'兒童節',greet:'兒童節快樂',costume:'kids',vars:{bg:'#F1FAFF',soft:'#D6EFFB',soft2:'#E6F6FD',primary:'#0F7C99',sun:'#FFC83D',line:'#C5E5F2'}},
 mother:{name:'母親節',greet:'母親節快樂',costume:'flower',vars:{bg:'#FFF4F4',soft:'#FFDDE0',soft2:'#FFEAEC',primary:'#C4455A',sun:'#F4B23A',line:'#F5CFD4'}},
 dragonboat:{name:'端午節',greet:'端午節安康',costume:'dragonboat',vars:{bg:'#F1F8EE',soft:'#D9EDD2',soft2:'#E7F4E2',primary:'#2F7D4F',sun:'#E9A93A',line:'#CBE3C3'}},
 father:{name:'父親節',greet:'父親節快樂',costume:'bowtie',vars:{bg:'#F0F6FA',soft:'#D8E8F2',soft2:'#E6F0F7',primary:'#27668C',sun:'#F4B23A',line:'#C8DCE9'}},
 qixi:{name:'七夕',greet:'七夕快樂',costume:'hearts',dark:true,vars:{bg:'#161A33',surface:'#20264A',soft:'#303866',soft2:'#293058',ink:'#F1F0FF',muted:'#B9BCE0',primary:'#F3A0C2','primary-ink':'#1B1630',sun:'#FFD66B',line:'#3A4275'}},
 midautumn:{name:'中秋節',greet:'中秋節快樂',costume:'bunny',dark:true,vars:{bg:'#151A35',surface:'#1F2548',soft:'#2E3663',soft2:'#272E57',ink:'#F4F1E4',muted:'#C0BFA9',primary:'#F2C14E','primary-ink':'#1F1A08',sun:'#FFE08A',line:'#39416F'}},
 teacher:{name:'教師節',greet:'教師節快樂',costume:'gradcap',vars:{bg:'#F5F7EF',soft:'#E3EAD0',soft2:'#EDF2E0',primary:'#5C7A1F',sun:'#E9A93A',line:'#D5DFBC'}},
 doubleten:{name:'國慶日',greet:'國慶日快樂',costume:'party',vars:{bg:'#F4F6FC',soft:'#DCE3F6',soft2:'#E9EDF9',primary:'#1F3F99',sun:'#E0312B',line:'#CBD4EE'}},
 halloween:{name:'萬聖節',greet:'萬聖節快樂，不給糖就搗蛋',costume:'witch',dark:true,vars:{bg:'#1B1424',surface:'#281D35',soft:'#3A2A4D',soft2:'#312341',ink:'#F7ECDD',muted:'#C8B6CF',primary:'#FF8A2B','primary-ink':'#24120A',sun:'#FFC94D',line:'#46345A'}},
 christmas:{name:'聖誕節',greet:'聖誕快樂',costume:'santa',vars:{bg:'#F3F8F4',soft:'#DCEBDD',soft2:'#E8F2E9',primary:'#B3202C',sun:'#E9B949',line:'#CCE0CE'}}
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

/* ---------- 佈置：掛在頁面上方的吊飾、底部的風景、淡淡的底紋（全部是靜態圖，只有吊飾輕輕擺動） ---------- */
const S=(w,h,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const uri=svg=>'url("data:image/svg+xml,'+encodeURIComponent(svg)+'")';
/* 吊飾：原點是掛點 (0,0)，往下畫；c＝主色、d＝配色 */
const ORN={
 flag:(c)=>`<path d="M-15 0h30L0 30z" fill="${c}"/><path d="M-15 0h30" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`,
 lantern:(c,d)=>`<rect x="-7" y="0" width="14" height="5" rx="2" fill="${d}"/><ellipse cx="0" cy="20" rx="15" ry="16" fill="${c}"/><path d="M-7 6Q-12 20-7 34M0 5v30M7 6Q12 20 7 34" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1.4"/><rect x="-7" y="34" width="14" height="5" rx="2" fill="${d}"/><path d="M-3 39v10M0 39v13M3 39v10" stroke="${d}" stroke-width="1.6" stroke-linecap="round"/>`,
 packet:(c,d)=>`<rect x="-11" y="0" width="22" height="32" rx="3" fill="${c}"/><path d="M-11 9Q0 17 11 9" fill="none" stroke="${d}" stroke-width="2"/><circle cx="0" cy="18" r="5" fill="${d}"/>`,
 cracker:(c,d)=>[0,1,2,3].map(k=>`<rect x="${k%2?2:-10}" y="${k*9}" width="8" height="13" rx="2" fill="${c}" transform="rotate(${k%2?18:-18} ${k%2?6:-6} ${k*9+6})"/>`).join('')+`<path d="M0 0v40" stroke="${d}" stroke-width="1.6"/><path d="M0 40l-4 8M0 40l4 8M0 40v9" stroke="${d}" stroke-width="1.6" stroke-linecap="round"/>`,
 heart:(c)=>`<path d="M0 30C-22 16-16 0-7 0-2 0 0 4 0 6 0 4 2 0 7 0 16 0 22 16 0 30z" fill="${c}"/>`,
 flower:(c,d)=>[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-9" rx="6.5" ry="9" fill="${c}" transform="translate(0 16) rotate(${a})"/>`).join('')+`<circle cx="0" cy="16" r="5" fill="${d}"/>`,
 star:(c)=>`<path d="M0 0l5.3 10.6 11.7 1.7-8.5 8.3 2 11.7L0 26.8-10.5 32.3l2-11.7-8.5-8.3 11.7-1.7z" fill="${c}"/>`,
 moon:(c)=>`<path d="M3 1a16 16 0 1 0 14 26A13 13 0 0 1 3 1z" fill="${c}"/>`,
 leaf:(c,d)=>`<path d="M0 0C14 8 14 26 0 36-14 26-14 8 0 0z" fill="${c}"/><path d="M0 4v28" stroke="${d}" stroke-width="1.4"/>`,
 drop:(c)=>`<path d="M0 0C10 13 13 20 13 25A13 13 0 0 1-13 25C-13 20-10 13 0 0z" fill="${c}"/><path d="M-6 25a6 6 0 0 0 6 6" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2" stroke-linecap="round"/>`,
 shell:(c,d)=>`<path d="M0 30C-18 26-18 6 0 2 18 6 18 26 0 30z" fill="${c}"/><path d="M0 30V4M0 30L-9 8M0 30L9 8" stroke="${d}" stroke-width="1.3" fill="none"/>`,
 zongzi:(c,d)=>`<path d="M0 0L17 30H-17z" fill="${c}" stroke-linejoin="round"/><path d="M-12 21h24M-7 12h14" stroke="${d}" stroke-width="2"/>`,
 ball:(c,d)=>`<rect x="-4" y="0" width="8" height="5" rx="1.5" fill="${d}"/><circle cx="0" cy="19" r="14" fill="${c}"/><path d="M-13 15Q0 22 13 15" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2.4"/>`,
 sock:(c,d)=>`<path d="M-7 0h14v20l8 6a7 7 0 0 1-4 12H-1a8 8 0 0 1-6-8z" fill="${c}"/><rect x="-9" y="0" width="18" height="8" rx="3" fill="${d}"/>`,
 flake:(c)=>[0,60,120].map(a=>`<path d="M0-14v28M-4-10l4 4 4-4M-4 10l4-4 4 4" transform="translate(0 16) rotate(${a})" stroke="${c}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`).join(''),
 pumpkin:(c,d)=>`<path d="M0 6v-6" stroke="${d}" stroke-width="3" stroke-linecap="round"/><ellipse cx="-8" cy="20" rx="9" ry="13" fill="${c}"/><ellipse cx="8" cy="20" rx="9" ry="13" fill="${c}"/><ellipse cx="0" cy="20" rx="8" ry="14" fill="${c}"/><path d="M-9 17l4-4 3 4zM9 17l-4-4-3 4zM-8 24q8 7 16 0" fill="${d}"/>`,
 bat:(c)=>`<path d="M0 8C-4 2-9 6-9 6-14 2-22 6-24 14c5-3 8-1 10 3 3-4 7-4 9 0 1 4 3 6 5 6s4-2 5-6c2-4 6-4 9 0 2-4 5-6 10-3C22 6 14 2 9 6 9 6 4 2 0 8z" fill="${c}"/>`,
 balloon:(c,d)=>`<ellipse cx="0" cy="16" rx="13" ry="16" fill="${c}"/><path d="M-3 32h6l-3-4z" fill="${c}"/><path d="M-6 9a8 8 0 0 1 4-4" stroke="rgba(255,255,255,.7)" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
 book:(c,d)=>`<path d="M-15 4Q-7 0 0 5 7 0 15 4V28Q7 24 0 29-7 24-15 28z" fill="${c}"/><path d="M0 5v24" stroke="${d}" stroke-width="1.6"/>`,
 tie:(c,d)=>`<path d="M-16 4l12 8-12 8zM16 4L4 12l12 8z" fill="${c}"/><rect x="-5" y="7" width="10" height="10" rx="2" fill="${d}"/>`,
 rabbit:(c,d)=>`<ellipse cx="-5" cy="8" rx="3.6" ry="9" fill="${c}"/><ellipse cx="5" cy="8" rx="3.6" ry="9" fill="${c}"/><circle cx="0" cy="24" r="11" fill="${c}"/><circle cx="-4" cy="22" r="1.5" fill="${d}"/><circle cx="4" cy="22" r="1.5" fill="${d}"/>`,
 gift:(c,d)=>`<rect x="-13" y="8" width="26" height="22" rx="2" fill="${c}"/><rect x="-15" y="4" width="30" height="7" rx="2" fill="${c}"/><path d="M0 4v26" stroke="${d}" stroke-width="5"/><path d="M0 4C-8-4-12 4 0 4 12 4 8-4 0 4z" fill="${d}"/>`
};
/* 每個佈景掛哪些吊飾、用哪些顏色；scene＝底部風景，pat＝底紋 */
const DECOR={
 warm:{orn:['flag','flag','flag','star'],col:['#E8743B','#F4B23A','#5FA777','#3D8FB6','#D9534F'],scene:'hills',pat:'dots'},
 ocean:{orn:['shell','drop','flag','star'],col:['#0F7C99','#5BC0DE','#F4B23A','#F28B6B'],scene:'waves',pat:'wave'},
 forest:{orn:['leaf','leaf','flag','flower'],col:['#2F7D4F','#7DB86A','#E9A93A','#B5651D'],scene:'forest',pat:'leaf'},
 sakura:{orn:['flower','flower','lantern','flag'],col:['#F28BA8','#F7B7C8','#C8456B','#F4B23A'],scene:'sakura',pat:'petal'},
 night:{orn:['star','moon','star','ball'],col:['#FFD66B','#9DA8FF','#F3A0C2','#7FD1C7'],scene:'night',pat:'stars',lights:true},
 newyear:{orn:['balloon','flag','star','gift'],col:['#E8743B','#F4B23A','#3D8FB6','#C8456B','#5FA777'],scene:'hills',pat:'dots',lights:true},
 lunarny:{orn:['lantern','packet','cracker','lantern'],col:['#C8102E','#E23D3D','#D7262B'],acc:'#F2B544',scene:'street',pat:'cloud',lights:true},
 lantern:{orn:['lantern','lantern','star','lantern'],col:['#E0531F','#F4B23A','#D7262B','#F28B6B'],acc:'#F9D774',scene:'street',pat:'cloud',lights:true},
 valentine:{orn:['heart','heart','flower','gift'],col:['#E0527A','#F28BA8','#C8325E','#F7B7C8'],scene:'hills',pat:'heart'},
 women:{orn:['flower','flower','heart','flag'],col:['#B45BBF','#D99BE0','#F28BA8','#F4B23A'],scene:'sakura',pat:'petal'},
 children:{orn:['balloon','star','flag','gift','balloon'],col:['#FF6B6B','#FFC83D','#4DB6E5','#6BCB77','#A77BF3'],scene:'hills',pat:'dots'},
 mother:{orn:['flower','heart','flower','gift'],col:['#E0667A','#F4A6B0','#C4455A','#F4B23A'],scene:'sakura',pat:'petal'},
 dragonboat:{orn:['zongzi','leaf','zongzi','lantern'],col:['#3E8E5A','#6FAF5F','#2F7D4F','#C8102E'],acc:'#E9C46A',scene:'waves',pat:'wave'},
 father:{orn:['tie','star','flag','gift'],col:['#27668C','#4F8FB5','#F4B23A','#7A8FA6'],scene:'hills',pat:'dots'},
 qixi:{orn:['star','heart','moon','star'],col:['#FFD66B','#F3A0C2','#B9A7FF','#FFFFFF'],scene:'night',pat:'stars',lights:true},
 midautumn:{orn:['rabbit','lantern','moon','star'],col:['#F7EFD9','#F2C14E','#FFE08A','#F0A04B'],acc:'#F2C14E',scene:'night',pat:'stars',moon:true,lights:true},
 teacher:{orn:['book','leaf','star','flag'],col:['#5C7A1F','#8FAE4B','#E9A93A','#B5651D'],scene:'forest',pat:'leaf'},
 doubleten:{orn:['flag','star','flag','ball'],col:['#1F3F99','#E0312B','#FFFFFF','#F4B23A'],scene:'hills',pat:'dots',lights:true},
 halloween:{orn:['pumpkin','bat','pumpkin','star'],col:['#FF8A2B','#8E6BBF','#FFA94D','#FFC94D'],acc:'#3A2A4D',scene:'spooky',pat:'stars',lights:true},
 christmas:{orn:['ball','sock','flake','gift','ball'],col:['#B3202C','#2F7D4F','#E9B949','#3D8FB6'],acc:'#F3E3B0',scene:'snow',pat:'flake',lights:true}
};
let garland,scene,wall,decorKey='warm',lastW=0;
function decorOn(){return store.get('decor','on')==='on'}
function swayOn(){return store.get('fx',reduce?'off':'on')==='on'}
function cssv(n,d){const v=getComputedStyle(root).getPropertyValue('--'+n).trim();return v||d}
function drawGarland(){
 if(!garland)return;const D=DECOR[decorKey]||DECOR.warm;const W=Math.max(320,garland.clientWidth||innerWidth);lastW=W;
 const small=W<700,seg=small?86:124,k=small?.72:1,n=Math.max(3,Math.round(W/seg)),step=W/n,H=small?74:98;
 const rope=cssv('muted','#7B6355'),line=cssv('line','#E8D9C7');
 let d='M0 7',orn='',bulbs='';
 for(let i=0;i<n;i++){const x0=i*step,x1=x0+step,mx=x0+step/2;d+=` Q${mx.toFixed(1)} ${7+30*k} ${x1.toFixed(1)} 7`;
  const my=7+15*k,len=[10,22,6,16,12][i%5]*k,type=D.orn[i%D.orn.length],c=D.col[i%D.col.length],acc=D.acc||D.col[(i+1)%D.col.length];
  orn+=`<g class="orn${swayOn()?' sway':''}" style="transform-origin:${mx.toFixed(1)}px ${my.toFixed(1)}px;animation-duration:${5.5+(i%4)*.9}s;animation-delay:-${(i*1.3)%6}s"><path d="M${mx.toFixed(1)} ${my.toFixed(1)}v${len.toFixed(1)}" stroke="${rope}" stroke-width="1.3"/><g transform="translate(${mx.toFixed(1)} ${(my+len).toFixed(1)}) scale(${(k*(type==='flag'?1:.92)).toFixed(2)})">${ORN[type](c,acc)}</g></g>`;
  if(D.lights){const lx=x0+step*.25,rx=x0+step*.75,ly=7+11.2*k;[lx,rx].forEach((bx,j)=>{bulbs+=`<circle class="bulb${swayOn()?' glow':''}" cx="${bx.toFixed(1)}" cy="${(ly+3).toFixed(1)}" r="${(3.4*k).toFixed(1)}" fill="${D.col[(i+j+2)%D.col.length]}" style="animation-delay:-${((i*2+j)*.7)%4}s"/>`})}
 }
 let pins='';for(let i=0;i<=n;i++)pins+=`<circle cx="${(i*step).toFixed(1)}" cy="7" r="3.2" fill="${line}" stroke="${rope}" stroke-width="1"/>`;
 garland.style.height=H+'px';
 garland.innerHTML=`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="${rope}" stroke-width="1.6" stroke-linecap="round"/>${bulbs}${orn}${pins}</svg>`;
}
/* 底部風景：一張可以橫向重複的地景，加上一個只出現一次的主角（太陽、月亮、帆船、小屋） */
function sceneArt(kind,D){
 const a=cssv('soft','#FFE9D2'),b=cssv('line','#E8D9C7'),p=cssv('primary','#C2531A'),sun=cssv('sun','#F4B23A');
 const hills=`<path d="M0 150V96Q70 52 150 92T300 84T450 96T600 96V150z" fill="${b}"/><path d="M0 150V118Q90 86 190 116T380 110T600 118V150z" fill="${a}"/>`;
 const palm=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0Q4-26 0-50" stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/><path d="M0-50Q-20-58-30-44M0-50Q-16-70-34-64M0-50Q0-74-10-80M0-50Q16-70 34-64M0-50Q20-58 30-44" stroke="${p}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".55"/></g>`;
 const tree=(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-14" width="6" height="16" fill="${p}" opacity=".45"/><circle cx="0" cy="-30" r="20" fill="${c}"/><circle cx="-14" cy="-20" r="13" fill="${c}"/><circle cx="14" cy="-20" r="13" fill="${c}"/></g>`;
 const pine=(x,y,s,c,snow)=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-6" width="6" height="10" fill="${p}" opacity=".45"/><path d="M0-62L18-34H9L24-12H-24L-9-34H-18z" fill="${c}"/>${snow?`<path d="M0-62L9-48Q0-42-9-48zM-14-22Q0-14 14-22L9-30H-9z" fill="#fff" opacity=".9"/>`:''}</g>`;
 let tile='',feat='';
 if(kind==='waves'){tile=`<path d="M0 150V96Q37 76 75 96T150 96T225 96T300 96T375 96T450 96T525 96T600 96V150z" fill="${b}"/><path d="M0 150V114Q50 96 100 114T200 114T300 114T400 114T500 114T600 114V150z" fill="${a}"/><path d="M0 150V134Q37 122 75 134T150 134T225 134T300 134T375 134T450 134T525 134T600 134V150z" fill="${b}" opacity=".7"/>`;
  feat=S(200,150,`<path d="M96 96V36l44 54z" fill="${p}" opacity=".55"/><path d="M92 96V48L62 90z" fill="${sun}" opacity=".8"/><path d="M52 98h100l-14 16H66z" fill="${p}" opacity=".7"/>`)}
 else if(kind==='forest'){tile=hills+pine(60,124,.9,p+'55')+tree(170,128,.8,b)+pine(250,118,1.1,p+'66')+tree(360,126,.9,p+'44')+pine(450,122,.8,p+'55')+tree(540,130,.75,b);
  feat=S(200,150,`<circle cx="130" cy="44" r="22" fill="${sun}" opacity=".75"/>`)}
 else if(kind==='sakura'){const pk='#F7B7C8',pk2='#F28BA8';tile=hills+tree(70,126,.95,pk)+tree(210,120,1.1,pk2+'cc')+tree(330,128,.8,pk)+tree(470,122,1,pk2+'cc')+`<g fill="${pk2}" opacity=".8"><circle cx="120" cy="134" r="2.5"/><circle cx="270" cy="140" r="2.5"/><circle cx="400" cy="136" r="2.5"/><circle cx="550" cy="141" r="2.5"/></g>`;
  feat=S(200,150,`<circle cx="130" cy="44" r="20" fill="${sun}" opacity=".6"/>`)}
 else if(kind==='night'){tile=`<path d="M0 150V100Q80 60 160 96T320 90T470 100T600 100V150z" fill="${b}"/><path d="M0 150V122Q100 96 200 120T400 114T600 122V150z" fill="${a}"/>`+palm(110,122,.7)+palm(430,118,.8);
  feat=S(220,170,D.moon?`<circle cx="140" cy="60" r="38" fill="${sun}"/><circle cx="128" cy="50" r="7" fill="#fff" opacity=".25"/><circle cx="152" cy="72" r="5" fill="#fff" opacity=".2"/>`:`<path d="M120 24a34 34 0 1 0 34 52A28 28 0 0 1 120 24z" fill="${sun}"/>`)}
 else if(kind==='street'){const roof=(x,w)=>`<g transform="translate(${x} 0)"><rect x="6" y="104" width="${w-12}" height="46" fill="${a}"/><path d="M-6 106Q${w/2} 84 ${w+6} 106L${w-4} 96Q${w/2} 78 4 96z" fill="${p}" opacity=".55"/><rect x="${w/2-9}" y="120" width="18" height="30" rx="9" fill="${b}"/></g>`;
  tile=`<path d="M0 150V110H600V150z" fill="${b}"/>`+roof(20,120)+roof(170,90)+roof(290,140)+roof(460,110);
  feat=S(200,150,`<path d="M150 150V40" stroke="${p}" stroke-width="4" opacity=".6"/><path d="M150 44H110" stroke="${p}" stroke-width="4" opacity=".6"/><g transform="translate(110 46)">${ORN.lantern('#D7262B','#F2B544')}</g>`)}
 else if(kind==='snow'){tile=`<path d="M0 150V100Q80 70 170 98T330 92T480 100T600 100V150z" fill="#fff" opacity=".9"/><path d="M0 150V124Q100 104 210 122T420 118T600 124V150z" fill="${a}"/>`+pine(70,120,.9,'#2F7D4F99',1)+pine(230,112,1.15,'#2F7D4Fbb',1)+pine(380,122,.8,'#2F7D4F99',1)+pine(520,116,1,'#2F7D4Fbb',1);
  feat=S(200,150,`<rect x="80" y="92" width="60" height="40" fill="${p}" opacity=".75"/><path d="M70 94L110 62l40 32z" fill="#fff"/><rect x="102" y="108" width="16" height="24" fill="${sun}"/><rect x="126" y="66" width="9" height="18" fill="${p}" opacity=".75"/>`)}
 else if(kind==='spooky'){tile=`<path d="M0 150V104Q90 76 180 102T360 96T600 104V150z" fill="${b}"/><path d="M0 150V126Q100 108 220 124T600 126V150z" fill="${a}"/>`+[40,150,300,410,540].map((x,i)=>`<g transform="translate(${x} ${118+(i%2)*6}) scale(.8)">${ORN.pumpkin('#FF8A2B','#3A2A4D')}</g>`).join('')+`<path d="M230 126V70M230 92l-22-18M230 84l20-20M230 100l16-8" stroke="${p}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".45"/>`;
  feat=S(200,150,`<circle cx="130" cy="50" r="30" fill="${sun}" opacity=".85"/><g transform="translate(118 40) scale(.7)">${ORN.bat('#3A2A4D')}</g>`)}
 else{tile=hills+palm(90,120,.8)+palm(118,126,.6)+palm(420,118,.9)+palm(520,128,.6);
  feat=S(200,150,`<circle cx="130" cy="92" r="34" fill="${sun}" opacity=".7"/>`)}
 return{tile:S(600,150,tile),feat};
}
function patternArt(kind){
 const p=cssv('primary','#C2531A');const o='opacity=".06"';
 const P={dots:S(56,56,`<circle cx="10" cy="10" r="3" fill="${p}" ${o}/><circle cx="38" cy="38" r="3" fill="${p}" ${o}/>`),
  wave:S(80,40,`<path d="M0 20Q20 6 40 20T80 20" fill="none" stroke="${p}" stroke-width="2" ${o}/>`),
  leaf:S(72,72,`<path d="M14 8C24 12 24 26 14 32 4 26 4 12 14 8z" fill="${p}" ${o}/><path d="M50 40C60 44 60 58 50 64 40 58 40 44 50 40z" fill="${p}" ${o} transform="rotate(40 50 52)"/>`),
  petal:S(72,72,`<g fill="${p}" ${o}><ellipse cx="16" cy="16" rx="5" ry="8" transform="rotate(30 16 16)"/><ellipse cx="52" cy="48" rx="5" ry="8" transform="rotate(-40 52 48)"/></g>`),
  heart:S(72,72,`<g fill="${p}" ${o}><path d="M16 26C5 19 8 10 12.500 10 15 10 16 12 16 13 16 12 17 10 19.500 10 24 10 27 19 16 26z"/><path d="M52 60C41 53 44 44 48.500 44 51 44 52 46 52 47 52 46 53 44 55.500 44 60 44 63 53 52 60z"/></g>`),
  stars:S(120,120,`<g fill="${cssv('sun','#FFD66B')}" opacity=".5"><circle cx="14" cy="20" r="1.6"/><circle cx="70" cy="12" r="1.1"/><circle cx="100" cy="58" r="1.8"/><circle cx="40" cy="78" r="1.2"/><circle cx="84" cy="102" r="1.4"/></g>`),
  cloud:S(96,60,`<path d="M10 34q0-10 10-10 2-8 10-8t10 8q10 0 10 10z" fill="none" stroke="${p}" stroke-width="2" ${o}/>`),
  flake:S(80,80,`<g stroke="${p}" stroke-width="1.6" ${o}><path d="M20 8v24M9.600 14l20.800 12M9.600 26l20.800-12"/><path d="M60 48v24M49.600 54l20.800 12M49.600 66l20.800-12"/></g>`)};
 return P[kind]||P.dots;
}
function decorate(key){
 decorKey=DECOR[key]?key:'warm';const D=DECOR[decorKey];
 if(!garland){
  wall=document.createElement('div');wall.id='ptwall';scene=document.createElement('div');scene.id='ptscene';
  [wall,scene].forEach(e=>{e.setAttribute('aria-hidden','true');document.body.prepend(e)});
  garland=document.createElement('div');garland.id='ptgarland';garland.setAttribute('aria-hidden','true');
  const main=document.querySelector('main');if(main)main.prepend(garland);else document.body.prepend(garland);
  let t=0;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(()=>{if(Math.abs((garland.clientWidth||innerWidth)-lastW)>24&&decorOn())drawGarland()},180)});
 }
 const on=decorOn();garland.hidden=scene.hidden=wall.hidden=!on;if(!on)return;
 drawGarland();const art=sceneArt(D.scene,D);
 scene.style.backgroundImage=uri(art.feat)+','+uri(art.tile);
 wall.style.backgroundImage=uri(patternArt(D.pat));
}

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
 decorate(fest||(pref==='auto'?'warm':(THEMES[pref]?pref:'warm')));
 const changed=current.fest!==today;current={theme:pref,fest:today};
 if(today&&changed&&typeof window.say==='function'){setTimeout(()=>{try{window.say(FEST[today].greet+'！有問題直接問我就可以囉。')}catch(e){}},1300)}
 paint();
}

/* ---------- 設定面板 ---------- */
let panel,fab;
function build(){
 fab=document.createElement('button');fab.type='button';fab.id='themefab';fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-expanded','false');fab.title='佈景';fab.innerHTML='<span aria-hidden="true">🎨</span><span class="sr">佈景</span>';
 panel=document.createElement('div');panel.id='themepanel';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','佈景');panel.hidden=true;
 document.body.append(fab,panel);
 fab.addEventListener('click',()=>{panel.hidden=!panel.hidden;fab.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)paint()});
 document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!fab.contains(e.target)){panel.hidden=true;fab.setAttribute('aria-expanded','false')}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){panel.hidden=true;fab.setAttribute('aria-expanded','false');fab.focus()}});
 panel.addEventListener('click',e=>{
  const t=e.target.closest('[data-theme-pick]');if(t){store.set('theme',t.dataset.themePick);store.set('preview','');apply();return}
  const s=e.target.closest('[data-toggle]');if(s){const k=s.dataset.toggle;const def=k==='fx'?(reduce?'off':'on'):'on';const now=store.get(k,def)==='on'?'off':'on';store.set(k,now);apply();return}
 });
 panel.addEventListener('change',e=>{if(e.target.id==='festpreview'){store.set('preview',e.target.value);if(e.target.value)store.set('theme','auto');apply()}});
}
function paint(){
 if(!panel||panel.hidden)return;
 const pref=store.get('theme','auto'),on=k=>store.get(k,k==='fx'?(reduce?'off':'on'):'on')==='on';
 const chip=(id,icon,name)=>`<button type="button" class="tchip" data-theme-pick="${id}" aria-pressed="${pref===id}"><span aria-hidden="true">${icon}</span>${name}</button>`;
 const sw=(k,label)=>`<button type="button" class="tswitch" data-toggle="${k}" role="switch" aria-checked="${on(k)}"><span>${label}</span><i></i></button>`;
 const fest=current.fest;
 panel.innerHTML=`<h2>佈景</h2><div class="tchips">${chip('auto','🎉','跟著節日')}${Object.entries(THEMES).map(([id,t])=>chip(id,t.icon,t.name)).join('')}</div>
 ${sw('decor','佈置裝飾（吊飾、風景）')}${sw('fx','吊飾輕輕擺動')}${sw('festauto','節日佈景和造型')}
 <label class="tprev">先看看節日佈景<select id="festpreview"><option value="">今天${fest&&!store.get('preview','')?'（'+FEST[fest].name+'）':''}</option>${Object.entries(FEST).map(([id,f])=>`<option value="${id}"${store.get('preview','')===id?' selected':''}>${f.name}</option>`).join('')}</select></label>`;
}
const css=document.createElement('style');css.textContent=`
#ptwall{position:fixed;inset:0;z-index:0;pointer-events:none;background-repeat:repeat}
#ptscene{position:fixed;left:0;right:0;bottom:0;height:150px;z-index:0;pointer-events:none;background-repeat:no-repeat,repeat-x;background-position:right 16% bottom,left bottom;background-size:auto 150px,auto 150px;opacity:.6}
#ptgarland{position:relative;z-index:1;width:100%;overflow:hidden;pointer-events:none;margin-bottom:-18px;line-height:0}
#ptgarland svg{display:block;width:100%}
#ptgarland .orn.sway{animation:ptsway 6s ease-in-out infinite alternate}
#ptgarland .bulb.glow{animation:ptglow 4s ease-in-out infinite alternate}
@keyframes ptsway{from{transform:rotate(-2.2deg)}to{transform:rotate(2.2deg)}}
@keyframes ptglow{from{opacity:.55}to{opacity:1}}
main,footer{position:relative;z-index:1}
footer{margin-bottom:0}
@media (max-width:700px){#ptscene{height:104px;background-size:auto 104px,auto 104px;opacity:.5}#ptgarland{margin-bottom:-10px}}
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
@media (prefers-reduced-motion:reduce){.tswitch i,.tswitch i::after{transition:none}}
@media print{#ptwall,#ptscene,#ptgarland,#themefab,#themepanel{display:none!important}}
`;document.head.appendChild(css);
function init(){build();apply()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.PTFestive={festivalOn,apply,FEST,THEMES};
})();
