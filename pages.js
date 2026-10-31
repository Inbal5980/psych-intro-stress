(function(){var G=window.GLOSSARY;if(!G)return;
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
var h='<div class="pg-card"><button class="pg-x" id="pgX" aria-label="סגירה">✕</button><h2>📑 טבלת עמודים בספר</h2>';
G.chapters.forEach(function(ch){(ch.sections||[]).forEach(function(sid){var s=G.sections[sid];if(!s)return;
 h+='<h3 style="color:'+esc(ch.color)+'">'+esc(ch.emoji||'')+' '+esc(s.title)+(s.vol?' <span class="pg-vol">כרך '+esc(s.vol)+'</span>':'')+'</h3><table class="pg-t"><thead><tr><th>נושא</th><th>עמודים</th></tr></thead><tbody>';
 (s.rows||[]).forEach(function(r){h+='<tr class="pg-row"><td colspan="2">'+esc(r.title)+'</td></tr>';
  (r.items||[]).forEach(function(it){h+='<tr><td>'+esc(it.t)+'</td><td class="pg-p">'+esc(it.p||'—')+'</td></tr>';});});
 h+='</tbody></table>';});});
h+='</div>';
var ov=document.createElement('div');ov.id='pgOv';ov.className='pg-ov';ov.hidden=true;ov.innerHTML=h;document.body.appendChild(ov);
function show(){ov.hidden=false;document.body.style.overflow='hidden';ov.scrollTop=0;}
function hide(){ov.hidden=true;document.body.style.overflow='';}
document.getElementById('pgX').addEventListener('click',hide);ov.addEventListener('click',function(e){if(e.target===ov)hide();});
var b=document.getElementById('pagesBtn');if(b)b.addEventListener('click',show);
window.showPagesTable=show;
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-pages-table]');if(t){e.preventDefault();show();}});
})();
