(function(){var el=document.getElementById('intro');if(!el)return;
function show(){el.hidden=false;document.body.style.overflow='hidden';}
function hide(){el.hidden=true;document.body.style.overflow='';try{localStorage.setItem('introSeen','1');}catch(e){}}
document.getElementById('introGo').addEventListener('click',hide);
el.addEventListener('click',function(e){if(e.target===el)hide();});
var b=document.getElementById('infoBtn');if(b)b.addEventListener('click',show);
var seen=null;try{seen=localStorage.getItem('introSeen');}catch(e){}
if(!seen)show();})();
