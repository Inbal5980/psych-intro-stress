(function(){
'use strict';
var G=window.GLOSSARY, app=document.getElementById('app'), ov=document.getElementById('overlay');
var KEY='psych-intro-stress-v1';
var CFG=window.APP_CONFIG||{};
(function(){try{if(CFG.title)document.title=CFG.title;var bt=document.getElementById('brandText');if(bt&&CFG.short)bt.textContent=CFG.short;var it=document.getElementById('introAppTitle');if(it&&CFG.title)it.textContent=CFG.title;}catch(e){}})();
function countdown(){if(!CFG.examDate)return '';try{var t=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()).split('-').map(Number);var e=CFG.examDate.split('-').map(Number);
  var n=Math.round((Date.UTC(e[0],e[1]-1,e[2])-Date.UTC(t[0],t[1]-1,t[2]))/86400000);
  if(n<0)return '';var txt=n===0?'בהצלחה במבחן היום! 🍀':n===1?'⏳ מחר המבחן! ('+CFG.examLabel+')':'⏳ עוד '+n+' ימים למבחן ('+CFG.examLabel+')';
  return '<div class="countdown'+(n===0?' today':'')+'" role="status">'+txt+'</div>';}catch(err){return '';}}

var S=load();
function load(){try{var s=JSON.parse(localStorage.getItem(KEY)||'{}');s.marks=s.marks||{};s.done=s.done||{};return s;}catch(e){return {marks:{},done:{}};}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
var CH={},SEC=G.sections,CARD={};
G.chapters.forEach(function(c){CH[c.id]=c;});
G.cards.forEach(function(c){CARD[c.id]=c;});
function cardsOf(ch){return G.cards.filter(function(c){return c.ch===ch;});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});}
function el(html){var d=document.createElement('div');d.innerHTML=html;return d.firstElementChild;}
function rowOf(c){var s=SEC[c.sec];if(!s)return null;for(var i=0;i<s.rows.length;i++)if(s.rows[i].id===c.row)return s.rows[i];return null;}
function volOf(c){return SEC[c.sec]?SEC[c.sec].vol:'';}
function pagesTxt(c){
  if(!c.pages)return 'עמודים: לא צוינו במונחון';
  if(/אין בספר/.test(c.pages))return c.pages;
  return (c.pscope==='row'?'עמודי הנושא: ':'להרחבה: ')+'עמ׳ '+c.pages+' (כרך '+volOf(c)+')';
}
function fmtP(p){return esc(p).split(', ').map(function(x){return '<span class="num">'+x+'</span>';}).join(', ');}
function pagesHTML(c){
  if(!c.pages)return 'עמודים: לא צוינו במונחון';
  if(/אין בספר/.test(c.pages))return esc(c.pages);
  return (c.pscope==='row'?'עמודי הנושא: ':'להרחבה: ')+'עמ׳ '+fmtP(c.pages)+' (כרך '+esc(volOf(c))+')';
}
function stats(list){var k=0,a=0;list.forEach(function(c){var m=S.marks[c.id];if(m==='know')k++;else if(m==='again')a++;});return {k:k,a:a,n:list.length};}
function bar(st){var n=st.n||1;return '<div class="bar" role="img" aria-label="'+st.k+' מתוך '+st.n+' יודע/ת"><i class="k" style="width:'+(st.k/n*100)+'%"></i><i class="a" style="width:'+(st.a/n*100)+'%"></i></div>';}
function grad(c){return 'linear-gradient(135deg,'+c+','+shade(c)+')';}
function shade(hex){var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;function f(x){return Math.max(0,Math.round(x*0.72));}return 'rgb('+f(r)+','+f(g)+','+f(b)+')';}
function norm(s){return String(s||'').replace(/[\u0591-\u05C7]/g,'').replace(/["'׳״“”\-–־()]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function uniq(a){var o=[];a.forEach(function(x){if(o.indexOf(x)<0)o.push(x);});return o;}
function examOf(ch){return G.exam.filter(function(e){return e.ch===ch;});}

/* ---------- card rendering ---------- */
function backHTML(c){
  var r=rowOf(c),h='<div class="bt">'+esc(c.term)+'</div>';
  if(c.kind==='term'){h+='<p class="def">'+esc(c.def)+'</p>';}
  else if(c.kind==='name'){h+='<p class="nodef">המונחון מציין את המושג בלי הגדרה – כדאי לקרוא עליו בספר.</p>'+(c.note?'<p class="def">'+esc(c.note)+'</p>':'');}
  else if(c.kind==='stage'){c.fields.forEach(function(f){h+='<div class="kv"><b>'+esc(f[0])+':</b> '+esc(f[1])+'</div>';});}
  else if(c.kind==='study'){var b=(c.blocks||[]).filter(function(x){return /מסקנ/.test(x.label);})[0]||c.blocks[c.blocks.length-1];h+='<div class="kv"><b>'+esc(b.label||'')+':</b> '+esc(b.items.join(' '))+'</div>';}
  h+='<div class="meta">';
  if(c.parent)h+='<div>חלק מ: '+esc(c.parent)+'</div>';
  if(r){h+='<div>נושא: '+esc(r.title)+'</div>';if(r.qs&&r.qs.length)h+='<div>סוגיה לדיון: '+esc(r.qs.join(' · '))+'</div>';}
  else h+='<div>נושא: '+esc(SEC[c.sec].title)+'</div>';
  h+='<div>📖 '+pagesHTML(c)+'</div></div>';
  return h;
}
function markBtns(c){var m=S.marks[c.id];return '<div class="marks"><button class="mk know" data-mk="know" data-id="'+c.id+'" aria-pressed="'+(m==='know')+'">יודע/ת ✅</button><button class="mk again" data-mk="again" data-id="'+c.id+'" aria-pressed="'+(m==='again')+'">לחזור 🔁</button></div>';}
function badge(c){var m=S.marks[c.id];return m==='know'?'✅':m==='again'?'🔁':'';}
function cardHTML(c,opts){
  opts=opts||{};var r=rowOf(c),color=CH[c.ch].color;
  var lab=opts.lab||(r?r.title:SEC[c.sec].title);if(norm(lab)===norm(c.term))lab='';
  return '<div class="fc" style="--c:'+color+'" data-card="'+c.id+'"><button class="flip" aria-label="'+esc(c.term)+' – לחצו כדי להפוך"><div class="in"><div class="face front"><span class="badge">'+badge(c)+'</span><div class="t">'+esc(c.term)+'</div>'+(lab?'<div class="lab">'+esc(lab)+'</div>':'')+'<span class="hint">לחצו להפוך ↺</span></div><div class="face back">'+backHTML(c)+'</div></div></button>'+markBtns(c)+'</div>';
}
document.addEventListener('click',function(e){
  var f=e.target.closest('.flip');if(f){f.classList.toggle('on');return;}
  var mk=e.target.closest('[data-mk]');if(mk){
    var id=mk.getAttribute('data-id'),v=mk.getAttribute('data-mk');
    S.marks[id]=(S.marks[id]===v)?undefined:v;if(!S.marks[id])delete S.marks[id];save();
    document.querySelectorAll('[data-mk][data-id="'+id+'"]').forEach(function(b){b.setAttribute('aria-pressed',String(S.marks[id]===b.getAttribute('data-mk')));});
    document.querySelectorAll('[data-card="'+id+'"] .badge').forEach(function(b){b.textContent=badge(CARD[id]);});
    refreshBars();
    if(mk.closest('.practice')&&S.marks[id])setTimeout(function(){var n=document.getElementById('pNext');if(n)n.click();},350);
    return;}
  var oc=e.target.closest('[data-open]');if(oc){openCard(oc.getAttribute('data-open'));return;}
  var ot=e.target.closest('[data-table]');if(ot){openTable(ot.getAttribute('data-table'));return;}
  if(e.target.closest('[data-close]')||e.target===ov){closeOv();return;}
});
function refreshBars(){document.querySelectorAll('[data-bar]').forEach(function(b){var k=b.getAttribute('data-bar');var list=k==='all'?G.cards:cardsOf(k);b.innerHTML=bar(stats(list));});
  document.querySelectorAll('[data-stat]').forEach(function(b){var k=b.getAttribute('data-stat');var st=stats(k==='all'?G.cards:cardsOf(k));b.textContent=st.k+' מתוך '+st.n+' ✅'+(st.a?' · '+st.a+' לחזור 🔁':'');});}

/* ---------- overlay ---------- */
var lastFocus=null;
function openOv(html){lastFocus=document.activeElement;ov.innerHTML='<div class="sheet" role="dialog" aria-modal="true">'+html+'</div>';ov.hidden=false;document.body.style.overflow='hidden';}
function closeOv(){ov.hidden=true;ov.innerHTML='';document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)closeOv();});
function openCard(id){var c=CARD[id];if(!c)return;var ch=CH[c.ch];
  var body=c.kind==='study'?studyHTML(c,true):cardHTML(c);
  openOv('<button class="iconbtn x" data-close aria-label="סגירה">✕</button><h3 style="color:'+ch.color+'">'+ch.emoji+' '+esc(ch.title)+' · '+esc(SEC[c.sec].title)+'</h3>'+body+'<p style="margin-top:12px"><a class="ghost" href="#/c/'+c.ch+'" data-close style="text-decoration:none;display:inline-block">לפרק המלא ←</a></p>');
  var f=ov.querySelector('.flip');if(f&&c.kind!=='study')setTimeout(function(){f.classList.add('on');},250);
}
function tableHTML(k){var t=G.tables[k];var titles={erikson:'טבלת סיכום: שמונה שלבי ההתפתחות הפסיכו-סוציאלית של אריקסון',freud:'טבלת שלבי ההתפתחות הפסיכוסקסואליים של פרויד',compare:'טבלת השוואה: פרויד ואריקסון'};
  var h='<h3>'+titles[k]+'</h3>';
  if(k==='compare'){h+='<div class="tscroll"><table class="sum"><tr>'+t[0].map(function(x){return '<th>'+esc(x)+'</th>';}).join('')+'</tr>'+t.slice(1).map(function(r){return '<tr>'+r.map(function(x,i){return (i?'<td>':'<th>')+esc(x)+(i?'</td>':'</th>');}).join('')+'</tr>';}).join('')+'</table></div>';}
  else{h+='<div class="stagecards">'+t.slice(1).map(function(r){return '<div class="sc"><h4>'+esc(r[0])+'</h4>'+r.slice(1).map(function(x,i){return x?'<div class="kv"><b>'+esc(t[0][i+1])+':</b> '+esc(x)+'</div>':'';}).join('')+'</div>';}).join('')+'</div>';}
  return h;}
function openTable(k){openOv('<button class="iconbtn x" data-close aria-label="סגירה">✕</button>'+tableHTML(k));}

/* ---------- search ---------- */
var IDX=G.cards.map(function(c){return {c:c,t:norm(c.term),d:norm((c.def||'')+' '+(c.note||'')+' '+(c.fields?c.fields.map(function(f){return f[1];}).join(' '):'')+(c.blocks?c.blocks.map(function(b){return b.items.join(' ');}).join(' '):''))};});
function search(q){q=norm(q);if(!q)return [];var words=q.split(' ');var out=[];
  IDX.forEach(function(x){var sc=0;if(x.t.indexOf(q)===0)sc=100;else if(x.t.indexOf(q)>=0)sc=80;else if(words.every(function(w){return x.t.indexOf(w)>=0;}))sc=60;else if(words.every(function(w){return (x.t+' '+x.d).indexOf(w)>=0;}))sc=20;if(sc)out.push({c:x.c,s:sc-x.t.length/100});});
  out.sort(function(a,b){return b.s-a.s;});return out.slice(0,40).map(function(o){return o.c;});}
function resHTML(list,q){if(!q)return '<p class="empty">הקלידו מושג, שם של חוקר או מילה מההגדרה</p>';if(!list.length)return '<p class="empty">לא נמצא מושג כזה במונחון 🤔</p>';
  return list.map(function(c){var ch=CH[c.ch];var sn=c.def||c.note||(c.kind==='stage'?c.fields[0][1]:c.kind==='study'?'מחקר':'');
    return '<button class="res" data-open="'+c.id+'"><span class="rt"><span class="dot" style="background:'+ch.color+'"></span>'+esc(c.term)+' '+badge(c)+'</span><span class="rs">'+esc(SEC[c.sec].title)+(sn?' · '+esc(sn):'')+'</span></button>';}).join('');}
function openSearch(initial){openOv('<button class="iconbtn x" data-close aria-label="סגירה">✕</button><h3>🔍 חיפוש מושג</h3><div class="searchbox" style="margin-top:0"><input id="sq" type="search" placeholder="למשל: אמפיריות, עומס, לזרוס" autocomplete="off" enterkeyhint="search" aria-label="חיפוש מושג"></div><div id="sr"></div>');
  var i=document.getElementById('sq'),r=document.getElementById('sr');i.value=initial||'';function go(){r.innerHTML=resHTML(search(i.value),i.value);}i.addEventListener('input',go);go();setTimeout(function(){i.focus();},30);}
document.getElementById('searchBtn').addEventListener('click',function(){openSearch('');});
document.getElementById('backBtn').addEventListener('click',function(){location.hash='#/';});


/* ---------- resources ---------- */
var RS=G.resources||{general:[],byChapter:{}};
function ext(u,inner,cls){return '<a class="'+(cls||'')+'" href="'+esc(u)+'" target="_blank" rel="noopener">'+inner+'</a>';}
function resBlock(){var h='<h2 class="sect">🧰 כלים ומשאבים</h2><div class="resgrid">';
  RS.general.forEach(function(r){h+=ext(r.url,'<span class="re">'+r.e+'</span><span class="rt2"><b>'+esc(r.label)+'</b>'+(r.sub?'<small>'+esc(r.sub)+'</small>':'')+'</span><span class="ra">↗</span>','rescard'+(r.hi?' hi':''));});
  h+='<a class="rescard hi" href="#" data-pages-table="1"><span class="re">📑</span><span class="rt2"><b>טבלת עמודים בספר</b><small>איפה כל נושא מופיע בספר</small></span><span class="ra">←</span></a>';
  h+='<a class="rescard hi" href="#/qwords"><span class="re">🖍️</span><span class="rt2"><b>מילון מילות שאלה</b><small>מה עושים בכל מילת שאלה (מהג׳ינלי)</small></span><span class="ra">←</span></a>';
  h+='</div>';
  h+='<details class="resch"><summary>📂 קישורים לפי פרק (מהג׳ינלי)</summary>'+G.chapters.map(function(ch){var l=RS.byChapter[ch.id]||[];if(!l.length)return '';return '<div class="rcrow"><b style="color:'+ch.color+'">'+ch.emoji+' '+esc(ch.title)+'</b><div class="chips2">'+l.map(function(r){return ext(r.url,r.e+' '+esc(r.label),'rchip');}).join('')+'</div></div>';}).join('')+'</details>';
  if(RS.genially)h+='<p class="genl">'+ext(RS.genially.url,'✨ לג׳ינלי „'+esc(RS.genially.label)+'”','')+'</p>';
  return h;}
function chRes(ch){var l=RS.byChapter[ch.id]||[];if(!l.length)return '';return '<div class="chres"><span class="lbl">🧰 משאבים לפרק:</span>'+l.map(function(r){return ext(r.url,r.e+' '+esc(r.label),'rchip');}).join('')+'</div>';}
/* ---------- home ---------- */
function home(){
  var all=stats(G.cards);
  var h='<section class="hero"><div class="bubbles">💭</div><h1>'+esc(CFG.heroTitle||'מבוא לפסיכולוגיה ולחץ')+'</h1><p>המושגים, המחקרים ושאלות הבגרות במבוא לפסיכולוגיה ובשלושת מודלי הלחץ – בכרטיסיות, במבחנים קצרים ובמעקב התקדמות.</p>'+
   '<div class="overall"><div class="row"><span>ההתקדמות שלי</span><span data-stat="all"></span></div><div data-bar="all">'+bar(all)+'</div></div></section>';
  h+=countdown();
  h+='<label class="searchbox"><span aria-hidden="true">🔍</span><input id="homeSearch" type="search" placeholder="חיפוש מהיר של מושג..." autocomplete="off" aria-label="חיפוש מושג"></label>';
  h+='<h2 class="sect">מפת הפרקים</h2><div class="map">';
  G.chapters.forEach(function(ch){var list=cardsOf(ch.id),st=stats(list);
    h+='<a class="tile" href="#/c/'+ch.id+'" style="background:'+grad(ch.color)+'"><div><div class="em">'+ch.emoji+'</div><h3>'+esc(ch.title)+'</h3>'+(ch.subs?'<div class="subs">'+esc(ch.subs)+'</div>':ch.sections.length>1?'<div class="subs">'+ch.sections.map(function(s){return esc(SEC[s].title);}).join(' · ')+'</div>':'<div class="subs">'+SEC[ch.sections[0]].rows.map(function(r){return esc(r.title);}).join(' · ')+'</div>')+'</div><div><div class="meta">'+list.length+' כרטיסיות · '+examOf(ch.id).length+' שאלות בגרות</div><div data-bar="'+ch.id+'">'+bar(st)+'</div></div></a>';});
  h+='</div>';
  var nst=STUDIES.length;h+='<a class="studyblock" href="#/studies"><div class="sbt"><span class="sbe">🔬</span><div><h3>מחקרים</h3><p>'+nst+' המחקרים של מודל הגירויים בלחץ: מטרה, מהלך, ממצאים ומסקנות, ומבחן מחקרים</p></div></div><div class="sbchips">'+G.chapters.map(function(ch){var n=cardsOf(ch.id).filter(function(c){return c.kind==='study';}).length;return n?'<span>'+ch.emoji+' '+esc(ch.title)+' · '+n+'</span>':'';}).join('')+'</div><span class="sbgo">לכל המחקרים ←</span></a>';
  h+=resBlock();
  h+='<div class="how"><b>איך לומדים כאן?</b><ul><li>בחרו פרק במפה ולחצו על כרטיסייה כדי להפוך אותה.</li><li>סמנו כל מושג: <b>יודע/ת ✅</b> או <b>לחזור 🔁</b>. ההתקדמות נשמרת אצלכם.</li><li>בכל פרק יש מבחן קצר עם משוב מיידי (כולל שאלות על מחקרי הפרק) ושאלות בגרות משנים קודמות לתרגול.</li></ul></div>';
  app.innerHTML=h;refreshBars();
  var hs=document.getElementById('homeSearch');hs.addEventListener('input',function(){var v=hs.value;hs.value='';openSearch(v);});
  hs.addEventListener('focus',function(){if(window.matchMedia('(pointer:coarse)').matches){hs.blur();openSearch('');}});
}

/* ---------- chapter ---------- */
var state={tab:'cards',filter:'all'};
function chapter(id,tab){
  var ch=CH[id];if(!ch){home();return;}
  var list=cardsOf(id),studies=list.filter(function(c){return c.kind==='study';});
  tab=tab||'cards';
  var tabs=[['cards','🃏 כרטיסיות'],['quiz','🎯 מבחן'],['exam','📝 בגרות']];if(studies.length)tabs.push(['studies','🔬 מחקרים']);
  var h='<section class="chead" style="background:'+grad(ch.color)+'"><h1>'+ch.emoji+' '+esc(ch.title)+'</h1><div class="stats"><span>'+list.length+' כרטיסיות</span><span>'+examOf(id).length+' שאלות בגרות</span><span data-stat="'+id+'"></span></div><div data-bar="'+id+'">'+bar(stats(list))+'</div></section>'+chRes(ch);
  h+='<nav class="tabs" role="tablist" style="--c:'+ch.color+'">'+tabs.map(function(t){return '<a class="tab" role="tab" href="#/c/'+id+'/'+t[0]+'" aria-selected="'+(t[0]===tab)+'" style="text-decoration:none">'+t[1]+'</a>';}).join('')+'</nav><div id="pane" style="--c:'+ch.color+'"></div>';
  app.innerHTML=h;refreshBars();
  var pane=document.getElementById('pane');
  if(tab==='cards')cardsPane(pane,ch,list);else if(tab==='quiz')quizPane(pane,ch,list);else if(tab==='exam')examPane(pane,ch);else if(tab==='studies')studiesPane(pane,ch,studies);else if(tab==='practice')practicePane(pane,ch,list);
}
function passes(c){var m=S.marks[c.id];return state.filter==='all'||(state.filter==='again'&&m==='again')||(state.filter==='new'&&!m)||(state.filter==='know'&&m==='know');}
function cardsPane(pane,ch,list){
  var concept=list.filter(function(c){return c.kind!=='study';});
  var h='<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:4px 0"><a class="primary" href="#/c/'+ch.id+'/practice" style="text-decoration:none">▶ תרגול כרטיסיות אחת־אחת</a></div>';
  h+='<div class="chips" role="group" aria-label="סינון">'+[['all','הכל'],['new','עוד לא סומנו'],['again','לחזור 🔁'],['know','יודע/ת ✅']].map(function(f){return '<button class="chip" data-filter="'+f[0]+'" aria-pressed="'+(state.filter===f[0])+'">'+f[1]+'</button>';}).join('')+'</div><div id="cardsBody"></div>';
  pane.innerHTML=h;
  function draw(){var out='',shown=0;
    ch.sections.forEach(function(sid){var s=SEC[sid];out+='<div class="sechead"><h2>'+esc(s.title)+'</h2><span class="vol">כרך '+esc(s.vol)+'</span></div>';
      var gen=concept.filter(function(c){return c.sec===sid&&!c.row;}).filter(passes);
      if(gen.length){shown+=gen.length;out+='<div class="topic"><h3>מושג כללי</h3><div class="grid">'+gen.map(function(c){return cardHTML(c);}).join('')+'</div></div>';}
      s.rows.forEach(function(r){var cs=concept.filter(function(c){return c.sec===sid&&c.row===r.id;});var vis=cs.filter(passes);shown+=vis.length;
        if(state.filter!=='all'&&!vis.length)return;
        out+='<div class="topic"><h3>'+esc(r.title)+'</h3>';
        if(r.qs.length)out+='<div class="qbox"><b>סוגיות מרכזיות לדיון</b>'+(r.qs.length>1?'<ul>'+r.qs.map(function(q){return '<li>'+esc(q)+'</li>';}).join('')+'</ul>':esc(r.qs[0]))+'</div>';
        if(r.note)out+='<p class="note">'+esc(r.note)+'</p>';
        if(r.pages)out+='<span class="pg">📖 עמ׳ '+fmtP(r.pages)+'</span>';
        if(sid==='theories')out+='<div class="tablebtns">'+(r.id==='r1'?'<button class="ghost" data-table="freud">📋 טבלת שלבי פרויד</button>':'<button class="ghost" data-table="erikson">📋 טבלת שלבי אריקסון</button>')+'<button class="ghost" data-table="compare">⚖️ השוואה פרויד–אריקסון</button></div>';
        var studyHere=list.filter(function(c){return c.kind==='study'&&c.sec===sid&&c.row===r.id;});
        if(studyHere.length)out+='<div class="tablebtns">'+studyHere.map(function(c){return '<button class="ghost" data-open="'+c.id+'">🔬 '+esc(c.term)+'</button>';}).join('')+'</div>';
        out+='<div class="grid">'+vis.map(function(c){return cardHTML(c);}).join('')+'</div></div>';});
    });
    if(!shown)out+='<p class="empty">אין כרטיסיות בסינון הזה'+(state.filter==='again'?' – אין מה לחזור עליו 🎉':'')+'</p>';
    document.getElementById('cardsBody').innerHTML=out;}
  pane.querySelectorAll('[data-filter]').forEach(function(b){b.addEventListener('click',function(){state.filter=b.getAttribute('data-filter');pane.querySelectorAll('[data-filter]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b));});draw();});});
  draw();
}
function practicePane(pane,ch,list){
  var deck=list.filter(function(c){return c.kind!=='study'&&S.marks[c.id]!=='know';});
  var allDone=!deck.length;if(allDone)deck=list.filter(function(c){return c.kind!=='study';});
  deck=shuffle(deck);var i=0;
  function draw(){if(i>=deck.length){var st=stats(list);pane.innerHTML='<div class="quiz score"><div class="big">🎉</div><h2>סיימתם את החפיסה!</h2><p>'+st.k+' מתוך '+st.n+' מסומנים ״יודע/ת״.</p><div class="qnav" style="justify-content:center"><button class="primary" id="pAgain">עוד סבב</button><a class="ghost" href="#/c/'+ch.id+'/cards" style="text-decoration:none">לכל הכרטיסיות</a></div></div>';document.getElementById('pAgain').onclick=function(){practicePane(pane,ch,list);};return;}
    var c=deck[i];pane.innerHTML='<div class="practice">'+(allDone&&i===0?'<p class="tip">כל הכרטיסיות בפרק מסומנות ״יודע/ת״ 💪 – הנה סבב חזרה על הכל.</p>':'')+'<div class="pnav"><span>כרטיסייה '+(i+1)+' מתוך '+deck.length+'</span><span>'+esc(SEC[c.sec].title)+'</span></div>'+cardHTML(c)+'<div class="pnav"><button class="ghost" id="pPrev" '+(i?'':'disabled')+'>→ הקודמת</button><button class="ghost" id="pNext">הבאה ←</button></div><p class="muted" style="text-align:center">לחצו על הכרטיסייה כדי להפוך, ואז סמנו – נעבור לבאה אוטומטית</p></div>';
    document.getElementById('pNext').onclick=function(){i++;draw();};document.getElementById('pPrev').onclick=function(){if(i){i--;draw();}};}
  draw();
}
function studyHTML(c,open){var ch=CH[c.ch];
  var h='<details class="study" style="--c:'+ch.color+'" data-card="'+c.id+'" '+(open?'open':'')+'><summary><span>🔬 '+esc(c.term)+' <span class="badge">'+badge(c)+'</span></span><span class="ar">◀</span></summary><div class="body">';
  if(c.context)h+='<p class="muted">'+esc(c.context)+'</p>';
  c.blocks.forEach(function(b){h+='<div class="blk">'+(b.label?'<span class="l">'+esc(b.label)+'</span>':'')+b.items.map(function(t){return '<p>'+esc(t)+'</p>';}).join('')+'</div>';});
  var r=rowOf(c);h+='<p class="muted">'+(r?'נושא: '+esc(r.title)+' · ':'')+'📖 '+pagesHTML(c)+'</p>'+markBtns(c)+'</div></details>';return h;}
function studiesPane(pane,ch,studies){pane.innerHTML='<div class="tip">זכרו לכתוב בתשובה את 4 הממי״ם: <b>מ</b>טרת המחקר · <b>מ</b>הלך המחקר · <b>מ</b>מצאים (תוצאות) · <b>מ</b>סקנות</div>'+studies.map(function(c){return studyHTML(c,false);}).join('');}

/* ---------- quiz ---------- */
function pagesOk(c){return c.pages&&c.pscope==='concept'&&/^\d/.test(c.pages);}
function mask(def,term){var core=term.replace(/\(.*?\)/g,'').replace(/["']/g,'').trim();if(core.length<3)return def;var re=new RegExp(core.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g');return def.replace(re,'____');}
function pick(arr,n,exclude){return shuffle(arr.filter(function(x){return exclude.indexOf(x)<0;})).slice(0,n);}

/* ---------- study questions ---------- */
var STUDIES=G.cards.filter(function(c){return c.kind==='study';});
var SM=G.studyMeta||{};
var SD=Math.max(2,Math.min(3,STUDIES.length-1));
function SL(c){var m=SM[c.id];return m?m.res+' – '+m.topic:c.term;}
var NAMES=[];Object.keys(SM).forEach(function(k){NAMES=NAMES.concat(SM[k].names);});
function maskNames(t){NAMES.forEach(function(n){t=t.replace(new RegExp('(^|[^\u05d0-\u05ea])([\u05d5\u05d4\u05d1\u05dc\u05de\u05e9]?)'+n+'(?![\u05d0-\u05ea])','g'),'$1$2____');});return t;}
function clip(t,n){t=t.replace(/^\s*(\d+\.|[·•])\s*/,'').trim();return t.length>n?t.slice(0,n).replace(/\s+\S*$/,'')+'…':t;}
function goodItems(b){return b?b.items.map(function(x){return x.replace(/^\s*(\d+\.|[·•])\s*/,'').trim();}).filter(function(x){return x.length>=25&&!/:$/.test(x)&&!/^כלומר/.test(x);}):[];}
function blk(c,re){return c.blocks.filter(function(b){return re.test(b.label);})[0];}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function others(c,n,f){var same=shuffle(STUDIES.filter(function(x){return x!==c&&x.ch===c.ch&&(!f||f(x));}));var rest=shuffle(STUDIES.filter(function(x){return x!==c&&x.ch!==c.ch&&(!f||f(x));}));return same.concat(rest).slice(0,n);}
function conclusionOf(c){var it=goodItems(blk(c,/מסקנ/));return it.length?it[0]:null;}
function studyQsFor(c){var qs=[],L=SL(c);
  function which(st,q,quote){var d=others(c,SD).map(SL);if(d.length<SD)return;qs.push({type:'🔬 מחקרים · '+st,q:q,quote:maskNames(clip(quote,260)),a:L,opts:d.concat(L),c:c,st:st});}
  var con=goodItems(blk(c,/מסקנ/));if(con.length)which('מסקנה','לאיזה מחקר שייכת המסקנה הבאה?',rnd(con));
  var fin=goodItems(blk(c,/ממצא/));if(fin.length)which('ממצאים','לאיזה מחקר שייך הממצא הבא?',rnd(fin));
  var met=goodItems(blk(c,/מהלך/)).filter(function(x){return x.length>=40;});if(met.length)which('מהלך המחקר','לאיזה מחקר שייך מהלך המחקר הבא?',rnd(met));
  var aimB=blk(c,/מטר/)||c.blocks.filter(function(b){return b.label==='';})[0];var aim=goodItems(aimB);
  if(aim.length){var isAim=/מטר/.test(aimB.label);which(isAim?'מטרת המחקר':'רקע המחקר',isAim?'מה המחקר שזו הייתה מטרתו?':'לאיזה מחקר מתאים התיאור הבא?',aim[0]);}
  var m=SM[c.id];if(m){var dr=others(c,SD).map(function(x){return SM[x.id]?SM[x.id].res:null;}).filter(Boolean);if(dr.length>=SD)qs.push({type:'🔬 מחקרים · מי ערכו?',q:'מי ערכו את המחקר על „'+m.topic+'”?',a:m.res,opts:dr.concat(m.res),c:c,st:'חוקרים'});}
  if(c.context){var dc=others(c,SD,function(x){return x.context!==c.context;}).map(SL);if(dc.length>=SD)qs.push({type:'🔬 מחקרים · מה המחקר מדגים?',q:'איזה מחקר מדגים את „'+c.context+'”?',a:L,opts:dc.concat(L),c:c,st:'מודל'});}
  var myc=conclusionOf(c);if(myc){var ds=others(c,SD,function(x){return !!conclusionOf(x);}).map(function(x){return maskNames(clip(conclusionOf(x),150));});var ac=maskNames(clip(myc,150));if(ds.length>=SD)qs.push({type:'🔬 מחקרים · מה הוכיח?',q:'מה הייתה המסקנה של המחקר: '+L+'?',a:ac,opts:ds.concat(ac),c:c,st:'מה הוכיח'});}
  return qs;}
function pickStudyQs(studies,n){var pools=shuffle(studies.slice()).map(function(c){return shuffle(studyQsFor(c));}).filter(function(p){return p.length;});var out=[],tc={};
  while(out.length<n&&pools.some(function(p){return p.length;})){pools.forEach(function(p){if(out.length>=n||!p.length)return;p.sort(function(a,b){return (tc[a.st]||0)-(tc[b.st]||0);});var q=p.shift();tc[q.st]=(tc[q.st]||0)+1;out.push(q);});}
  return out;}
function buildStudyQuiz(){var out=pickStudyQs(STUDIES,10);out.forEach(function(p){p.opts=shuffle(uniq(p.opts));});return shuffle(out);}
function studyEx(c){var cc=conclusionOf(c);return '<div><b>🔬 '+esc(SL(c))+'</b></div>'+(cc?'<div>מסקנה: '+esc(clip(cc,240))+'</div>':'');}
function buildQuiz(ch,list){
  var stl=list.filter(function(c){return c.kind==='study';});var sq=pickStudyQs(stl,stl.length>=2?3:stl.length*2);var N=10-sq.length;
  var concept=list.filter(function(c){return c.kind==='term'||c.kind==='name';});
  var defs=list.filter(function(c){return c.kind==='term'&&c.def&&c.def.length>12;});
  var allQs=uniq(concept.map(function(c){var r=rowOf(c);return r&&r.qs.length?r.qs.join(' · '):null;}).filter(Boolean));
  var allRows=uniq(concept.map(function(c){var r=rowOf(c);return r?r.title:null;}).filter(Boolean));
  var allPages=uniq(concept.filter(pagesOk).map(function(c){return c.pages;}));
  var studiesAll=G.cards.filter(function(c){return c.kind==='study';});
  var pool=[];
  defs.forEach(function(c){var same=defs.filter(function(x){return x.sec===c.sec&&x.term!==c.term;}).map(function(x){return x.term;});var other=defs.filter(function(x){return x.term!==c.term;}).map(function(x){return x.term;});
    var d=uniq(pick(same,3,[c.term]).concat(pick(other,3,[c.term]))).filter(function(t){return t!==c.term;}).slice(0,3);if(d.length<3)return;
    pool.push({type:'איזה מושג מתאים להגדרה?',q:'איזה מושג מוגדר כך?',quote:mask(c.def,c.term),a:c.term,opts:d.concat(c.term),c:c,w:3});});
  concept.forEach(function(c){var r=rowOf(c);if(!r)return;
    if(r.qs.length&&allQs.length>=3){var a=r.qs.join(' · ');var d=pick(allQs,3,[a]);pool.push({type:'סוגיה מרכזית לדיון',q:'לאיזו סוגיה לדיון שייך המושג „'+c.term+'”?',a:a,opts:d.concat(a),c:c,w:1});}
    if(allRows.length>=3){var d2=pick(allRows,3,[r.title]);pool.push({type:'תת־נושא',q:'באיזה תת־נושא נמצא המושג „'+c.term+'”?',a:r.title,opts:d2.concat(r.title),c:c,w:1});}
  });
  list.filter(function(c){return c.kind==='stage';}).forEach(function(c){var fam=list.filter(function(x){return x.kind==='stage'&&x.term.split(':')[0]===c.term.split(':')[0];});
    c.fields.forEach(function(f){if(/תוצאה|מאפיינים|גורמים|פתרון לא/.test(f[0]))return;var d=pick(fam.map(function(x){return x.term;}),3,[c.term]);if(d.length<3)return;pool.push({type:c.term.split(':')[0],q:'באיזה שלב – '+f[0]+': „'+f[1]+'”?',a:c.term,opts:d.concat(c.term),c:c,w:1});});});
  // weighted sample of 10, at most 4 of one type
  var bag=[];pool.forEach(function(p){for(var i=0;i<p.w;i++)bag.push(p);});bag=shuffle(bag);var out=[],cnt={},used={};
  for(var i=0;i<bag.length&&out.length<N;i++){var p=bag[i];var key=p.type+'|'+p.c.id;if(used[key])continue;if((cnt[p.type]||0)>=4)continue;used[key]=1;cnt[p.type]=(cnt[p.type]||0)+1;out.push(p);}
  for(var j=0;j<bag.length&&out.length<N;j++){var p2=bag[j];var k2=p2.type+'|'+p2.c.id;if(used[k2])continue;used[k2]=1;out.push(p2);}
  out=out.concat(sq);out.forEach(function(p){p.opts=shuffle(uniq(p.opts));});return shuffle(out);
}
function quizPane(pane,ch,list,builder,intro){
  var qs=(builder||buildQuiz)(ch,list),i=0,score=0,wrong=[];
  function draw(){
    if(i>=qs.length){var pct=Math.round(score/qs.length*100);pane.innerHTML='<div class="quiz score"><div class="big">'+(pct>=90?'🏆':pct>=70?'🎉':pct>=50?'💪':'📚')+'</div><h2>'+score+' מתוך '+qs.length+'</h2><p>'+(pct>=90?'מצוין! אתם שולטים בפרק.':pct>=70?'יפה מאוד! עוד קצת חזרה וזה שלכם.':'כדאי לחזור על הכרטיסיות ולנסות שוב.')+'</p>'+(wrong.length?'<div class="rel" style="text-align:right"><h4>כדאי לחזור על:</h4>'+uniq(wrong).map(function(id){return '<button class="ri" data-open="'+id+'"><span>'+esc(CARD[id].term)+'</span><span>←</span></button>';}).join('')+'</div>':'')+'<div class="qnav" style="justify-content:center"><button class="primary" id="again">סבב חדש</button></div></div>';document.getElementById('again').onclick=function(){quizPane(pane,ch,list,builder,intro);};return;}
    var q=qs[i];
    pane.innerHTML='<div class="quiz"><div class="qprog"><span>שאלה '+(i+1)+' מתוך '+qs.length+'</span><span>ניקוד: '+score+'</span></div><div class="bar"><i class="k" style="width:'+(i/qs.length*100)+'%;background:var(--c)"></i></div><span class="qtype">'+esc(q.type)+'</span><div class="qtext">'+esc(q.q)+(q.quote?'<span class="quote">'+esc(q.quote)+'</span>':'')+'</div><div class="opts">'+q.opts.map(function(o){return '<button class="opt">'+esc(o)+'</button>';}).join('')+'</div><div id="fb"></div></div>';
    pane.querySelectorAll('.opt').forEach(function(b){b.addEventListener('click',function(){var ok=b.textContent===q.a;if(ok)score++;else wrong.push(q.c.id);
      pane.querySelectorAll('.opt').forEach(function(x){x.disabled=true;if(x.textContent===q.a)x.classList.add('right');});if(!ok)b.classList.add('wrong');
      var c=q.c,r=rowOf(c);var ex=(c.kind==='study'?studyEx(c):c.kind==='term'?'<div><b>'+esc(c.term)+':</b> '+esc(c.def)+'</div>':'<div><b>'+esc(c.term)+'</b></div>')+'<div class="muted">'+(r?'נושא: '+esc(r.title)+' · ':'')+'📖 '+pagesHTML(c)+'</div>';
      document.getElementById('fb').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?'נכון! ✅':'לא בדיוק ❌ התשובה: '+esc(q.a))+'</b>'+ex+'</div><div class="qnav"><button class="primary" id="nx">'+(i+1<qs.length?'לשאלה הבאה ←':'לתוצאה ←')+'</button></div>';
      var nx=document.getElementById('nx');nx.onclick=function(){i++;draw();window.scrollTo({top:document.querySelector('.tabs').offsetTop-70,behavior:'smooth'});};nx.focus({preventScroll:true});});});
  }
  if(!qs.length){pane.innerHTML='<p class="empty">אין מספיק תוכן למבחן בפרק הזה</p>';return;}
  pane.innerHTML='<div class="quiz"><h2 style="margin-top:0">🎯 מבחן קצר: '+esc(ch.title)+'</h2><p>'+(intro||('10 שאלות אמריקאיות שנבנות מתוך המונחון בלבד: הגדרות, סוגיות לדיון, תת־נושאים'+(list.some(function(c){return c.kind==='study';})?', מחקרי הפרק (מטרה, מהלך, ממצאים, מסקנות)':'')+(list.some(function(c){return c.kind==='stage';})?' ושלבי התפתחות':'')+'. בכל סבב השאלות מתחלפות.'))+'</p><button class="primary" id="go">יאללה, מתחילים</button></div>';
  document.getElementById('go').onclick=draw;
}


/* ---------- question-word highlighting (from the Genially "פיצוח שאלות בבחינות במדעי החברה") ---------- */
var QWD=window.QWORDS||{cats:[],subs:{},pats:[]};var QCAT={};QWD.cats.forEach(function(c){QCAT[c.id]=c;});
var QRE=QWD.pats.map(function(p){return [new RegExp('(^|[^\u05d0-\u05ea])('+p[0]+')(?=[^\u05d0-\u05ea]|$)','g'),p[1]];});
function hlOn(){return S.hl!==false;}
function qinfo(key){var sub=QWD.subs[key];if(sub){var c=QCAT[sub.cat];return {cat:c,title:sub.title,text:sub.text};}var c2=QCAT[key];return c2?{cat:c2,title:c2.name,text:c2.text}:null;}
function qmatches(s){var taken=new Array(s.length),out=[];
  QRE.forEach(function(pr){var re=pr[0],m;re.lastIndex=0;
    while((m=re.exec(s))){var st=m.index+m[1].length,en=st+m[2].length,ok=true;
      for(var i=st;i<en;i++)if(taken[i]){ok=false;break;}
      if(ok){for(var j=st;j<en;j++)taken[j]=1;out.push([st,en,pr[1]]);}
      if(re.lastIndex===m.index)re.lastIndex++;}});
  return out.sort(function(a,b){return a[0]-b[0];});}
function hl(s){s=String(s==null?'':s);if(!hlOn())return esc(s);var ms=qmatches(s),h='',p=0;
  ms.forEach(function(m){var info=qinfo(m[2]);if(!info)return;h+=esc(s.slice(p,m[0]))+'<mark class="qw" tabindex="0" role="button" data-qw="'+m[2]+'" style="--qc:'+info.cat.color+'">'+esc(s.slice(m[0],m[1]))+'</mark>';p=m[1];});
  return h+esc(s.slice(p));}
function qCountFor(catId){return G.exam.filter(function(e){return e.parts.some(function(p){return qmatches(p).some(function(m){var i=qinfo(m[2]);return i&&i.cat.id===catId;});});}).length;}
var qpop=null,qpopFor=null,qhide=null,qByHover=false;
function closeQpop(){if(qpop){qpop.remove();qpop=null;}if(qpopFor){qpopFor.classList.remove('act');qpopFor=null;}}
function openQpop(mk){clearTimeout(qhide);if(qpopFor===mk)return;closeQpop();var info=qinfo(mk.getAttribute('data-qw'));if(!info)return;
  qpopFor=mk;mk.classList.add('act');
  var d=document.createElement('div');d.className='qpop';d.setAttribute('role','dialog');d.style.setProperty('--qc',info.cat.color);
  d.innerHTML='<button class="qx" aria-label="סגירה">✕</button><div class="qh"><span class="qtag">'+esc(mk.textContent)+'</span>'+(info.title!==mk.textContent?'<span class="qt">'+esc(info.title)+'</span>':'')+'</div><p>'+esc(info.text).replace(/\n/g,'<br>')+'</p><div class="qf"><a href="#/qwords">📖 מילון מילות שאלה</a><span>מתוך הג׳ינלי „'+esc(QWD.genially.title)+'”</span></div>';
  document.body.appendChild(d);qpop=d;
  d.addEventListener('mouseenter',function(){clearTimeout(qhide);});d.addEventListener('mouseleave',function(){qhide=setTimeout(closeQpop,250);});
  var r=mk.getBoundingClientRect(),vw=document.documentElement.clientWidth,w=Math.min(330,vw-20);d.style.width=w+'px';
  var left=r.left+r.width/2-w/2;left=Math.max(10,Math.min(left,vw-w-10));
  var ph=d.offsetHeight,top=r.bottom+8;if(top+ph>window.innerHeight-8&&r.top-ph-8>8)top=r.top-ph-8;
  d.style.left=(left+window.scrollX)+'px';d.style.top=(top+window.scrollY)+'px';}
document.addEventListener('click',function(e){var mk=e.target.closest('mark.qw');
  if(mk){e.preventDefault();e.stopPropagation();if(qpopFor===mk){if(qByHover){qByHover=false;return;}closeQpop();}else{qByHover=false;openQpop(mk);}return;}
  if(e.target.closest('.qx')){closeQpop();return;}
  if(qpop&&!e.target.closest('.qpop'))closeQpop();},true);
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeQpop();var mk=e.target.closest&&e.target.closest('mark.qw');if(mk&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openQpop(mk);}});
if(window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
  document.addEventListener('mouseover',function(e){var mk=e.target.closest&&e.target.closest('mark.qw');if(mk&&qpopFor!==mk){openQpop(mk);qByHover=true;}});
  document.addEventListener('mouseout',function(e){var mk=e.target.closest&&e.target.closest('mark.qw');if(mk&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.qpop')))qhide=setTimeout(closeQpop,250);});}
window.addEventListener('hashchange',closeQpop);
function qwBar(){return '<div class="qwbar"><button class="qtog" id="qtog" aria-pressed="'+hlOn()+'">🖍️ מירקור מילות שאלה <span class="sw" aria-hidden="true"></span></button><a class="qdict" href="#/qwords">📖 מילון מילות שאלה</a></div>';}
function qwordsPage(){
  var h='<section class="chead" style="background:linear-gradient(135deg,#ca8a04,#a16207)"><h1>🖍️ מילון מילות שאלה</h1><div class="stats"><span>מה עושים בכל מילת שאלה?</span></div></section>';
  h+='<div class="tip">בשאלות הבגרות באתר מילות השאלה מסומנות במרקר. לחיצה על מילה מסומנת מזכירה מה צריך לעשות. ההנחיות מתוך הג׳ינלי '+ext(QWD.genially.url,'„'+esc(QWD.genially.title)+'” ↗','')+'</div>';
  QWD.cats.forEach(function(c){var n=qCountFor(c.id);
    h+='<article class="qcard" style="--qc:'+c.color+'"><div class="qch"><mark class="qwl">'+esc(c.name)+'</mark>'+(n?'<span class="qn">ב־'+n+' שאלות בגרות באתר</span>':'')+'</div><div class="qforms">בשאלות: '+esc(c.forms)+'</div><p>'+esc(c.text).replace(/\n/g,'<br>')+'</p></article>';});
  h+='<p class="genl">'+ext(QWD.genially.url,'✨ לג׳ינלי „'+esc(QWD.genially.title)+'”','')+'</p>';
  if(history.length>1)h+='<p class="genl"><button class="ghost" id="qback">→ חזרה</button></p>';
  app.innerHTML=h;var qb=document.getElementById('qback');if(qb)qb.addEventListener('click',function(){history.back();});}

/* ---------- exam questions ---------- */
function examPane(pane,ch){
  var all=examOf(ch.id);var years=uniq([].concat.apply([],all.map(function(e){return e.years;}))).sort();var secs=uniq(all.map(function(e){return e.sec;}).filter(Boolean));
  var fy='all',fs='all';
  var h='<div class="tip">שאלות מבחינות הבגרות שמופיעות במונחון. נסו לענות לבד, ואז פתחו את המושגים והעמודים הקשורים.</div>';
  h+=qwBar();
  h+='<div class="chips" id="fy"><button class="chip" data-y="all" aria-pressed="true">כל השנים</button>'+years.map(function(y){return '<button class="chip" data-y="'+y+'" aria-pressed="false">'+y+'</button>';}).join('')+'</div>';
  if(secs.length>1)h+='<div class="chips" id="fs"><button class="chip" data-s="all" aria-pressed="true">כל הנושאים</button>'+secs.map(function(s){return '<button class="chip" data-s="'+esc(s)+'" aria-pressed="false">'+esc(s)+'</button>';}).join('')+'</div>';
  h+='<div id="exlist"></div>';pane.innerHTML=h;
  function draw(){var list=all.filter(function(e){return (fy==='all'||e.years.indexOf(fy)>=0)&&(fs==='all'||e.sec===fs);});
    document.getElementById('exlist').innerHTML=list.length?list.map(function(e,n){var last=e.parts.length-1;
      var scen=e.parts.slice(0,last),task=e.parts[last];
      if(!scen.length&&e.parts.length===1){}
      return '<article class="exam" id="'+e.id+'"><div class="top">'+(e.years.length?e.years.map(function(y){return '<span class="yr">בגרות '+y+'</span>';}).join(''):'<span class="yr" style="opacity:.7">שאלת בגרות</span>')+(e.sec?'<span class="secl">'+esc(e.sec)+'</span>':'')+'</div>'+scen.map(function(p){return '<p class="scen">'+hl(p)+'</p>';}).join('')+'<p class="task">'+hl(task)+'</p><div class="acts"><button class="ghost" data-rev="'+e.id+'">💡 מושגים ועמודים קשורים</button><button class="ghost '+(S.done[e.id]?'done':'')+'" data-done="'+e.id+'">'+(S.done[e.id]?'תרגלתי ✓':'סמנו שתרגלתם')+'</button></div><div class="relbox"></div></article>';}).join(''):'<p class="empty">אין שאלות בסינון הזה</p>';}
  pane.addEventListener('click',function(ev){if(ev.target.closest('#qtog')){S.hl=!hlOn();save();closeQpop();var tg=document.getElementById('qtog');tg.setAttribute('aria-pressed',String(hlOn()));draw();return;}var y=ev.target.closest('[data-y]');if(y){fy=y.getAttribute('data-y');pane.querySelectorAll('[data-y]').forEach(function(x){x.setAttribute('aria-pressed',String(x===y));});draw();return;}
    var s=ev.target.closest('[data-s]');if(s){fs=s.getAttribute('data-s');pane.querySelectorAll('[data-s]').forEach(function(x){x.setAttribute('aria-pressed',String(x===s));});draw();return;}
    var d=ev.target.closest('[data-done]');if(d){var id=d.getAttribute('data-done');if(S.done[id])delete S.done[id];else S.done[id]=1;save();d.classList.toggle('done',!!S.done[id]);d.textContent=S.done[id]?'תרגלתי ✓':'סמנו שתרגלתם';return;}
    var r=ev.target.closest('[data-rev]');if(r){var e=G.exam.filter(function(x){return x.id===r.getAttribute('data-rev');})[0];var box=r.closest('.exam').querySelector('.relbox');
      if(box.innerHTML){box.innerHTML='';return;}
      var items=e.rel.map(function(id){return CARD[id];}).filter(Boolean);
      var hh='<div class="rel"><h4>מושגים מהמונחון שקשורים לשאלה</h4>'+(items.length?items.map(function(c){return '<button class="ri" data-open="'+c.id+'"><span>'+esc(c.term)+'</span><span class="pg">'+(c.pages?(/אין בספר/.test(c.pages)?'אין בספר':'עמ׳ '+fmtP(c.pages)):'–')+'</span></button>';}).join(''):'<p class="muted" style="margin:0">לא זוהה מושג מסוים בניסוח השאלה – חפשו בפרק "'+esc(e.sec||CH[e.ch].title)+'".</p>');
      if(e.tables&&e.tables.length)hh+='<div class="tablebtns">'+e.tables.map(function(t){return '<button class="ghost" data-table="'+t+'">'+({erikson:'📋 טבלת שלבי אריקסון',freud:'📋 טבלת שלבי פרויד',compare:'⚖️ השוואה פרויד–אריקסון'})[t]+'</button>';}).join('')+'</div>';
      box.innerHTML=hh+'</div>';}
  });
  draw();
}

/* ---------- all studies ---------- */
function studiesAll(tab){tab=tab==='quiz'?'quiz':'list';var col='#334155';
  var h='<section class="chead" style="background:linear-gradient(135deg,#1e293b,#475569)"><h1>🔬 מחקרים</h1><div class="stats"><span>'+STUDIES.length+' מחקרים</span><span>לחץ: מודל הגירויים</span></div></section>';
  var dl=RS.studiesDoc;if(dl)h+='<div class="chres"><span class="lbl">🧰 משאבים:</span>'+ext(dl.url,'📄 המחקרים בחוברת המונחון','rchip')+'</div>';
  h+='<nav class="tabs" role="tablist" style="--c:'+col+'"><a class="tab" role="tab" href="#/studies" aria-selected="'+(tab==='list')+'" style="text-decoration:none">📚 כל המחקרים</a><a class="tab" role="tab" href="#/studies/quiz" aria-selected="'+(tab==='quiz')+'" style="text-decoration:none">🎯 מבחן מחקרים</a></nav><div id="pane" style="--c:'+col+'"></div>';
  app.innerHTML=h;var pane=document.getElementById('pane');
  if(tab==='quiz'){quizPane(pane,{id:'studies',title:'מחקרים',color:col},STUDIES,buildStudyQuiz,'10 שאלות על המחקרים, מתוך המונחון בלבד: מטרה, מהלך, ממצאים, מסקנות, מי ערכו את המחקר ומה הוא מדגים. בכל סבב השאלות מתחלפות.');return;}
  var s='<div class="tip">זכרו לכתוב בתשובה את 4 הממי״ם: <b>מ</b>טרת המחקר · <b>מ</b>הלך המחקר · <b>מ</b>מצאים (תוצאות) · <b>מ</b>סקנות</div>';
  s+='<div class="jump">'+G.chapters.map(function(ch){var n=cardsOf(ch.id).filter(function(c){return c.kind==='study';}).length;return n?'<a href="#" data-jump="'+ch.id+'" style="border-color:'+ch.color+';color:'+ch.color+'">'+ch.emoji+' '+esc(ch.title)+' ('+n+')</a>':'';}).join('')+'</div>';
  G.chapters.forEach(function(ch){var st=cardsOf(ch.id).filter(function(c){return c.kind==='study';});if(!st.length)return;s+='<div class="sechead" id="st-'+ch.id+'"><h2 style="color:'+ch.color+'">'+ch.emoji+' '+esc(ch.title)+'</h2></div>'+st.map(function(c){return studyHTML(c,false);}).join('');});
  pane.innerHTML=s;pane.querySelectorAll('[data-jump]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=document.getElementById('st-'+a.getAttribute('data-jump'));if(t)window.scrollTo({top:t.getBoundingClientRect().top+window.scrollY-120,behavior:'smooth'});});});}

/* ---------- router ---------- */
function route(){closeOv();var p=(location.hash||'#/').slice(2).split('/');
  document.getElementById('backBtn').hidden=!p[0];
  if(p[0]==='c')chapter(p[1],p[2]);else if(p[0]==='studies')studiesAll(p[1]);else if(p[0]==='qwords')qwordsPage();else home();
  window.scrollTo(0,(p[2]||(p[0]==='studies'&&p[1]))?Math.min(window.scrollY,(document.querySelector('.tabs')||{offsetTop:0}).offsetTop-60):0);
  app.focus({preventScroll:true});}
window.addEventListener('hashchange',route);route();
})();
