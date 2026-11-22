(function(){
  var $=function(id){return document.getElementById(id)};
  function mk(p,a){return a.map(function(t,i){return{id:p+i,t:t}})}
  var D=window.HUB_DATA||{};
  function arr(x){return Array.isArray(x)?x:[]}
  function wid(a,p){return a.map(function(o,i){var c=JSON.parse(JSON.stringify(o));c.id=p+i;return c})}
  var TOOLS=arr(D.tools);
  var T=D.todo||{};
  var WEBSTAT=['Waiting approval','Approved','Uploaded'];
  var TUTSTAT=['To record','Needs editing','Re-edit','Done'];
  function chk(k,p){return{type:'check',sec:'todo',ph:'Add a task…',def:mk(p,arr(T[k]))}}
  var LISTS={
    't-week':chk('t-week','tw'),'t-up':chk('t-up','tu'),'t-svn':chk('t-svn','ts'),
    't-rec':chk('t-rec','tr'),'t-nl':chk('t-nl','tn'),'t-later':chk('t-later','tl'),
    'tuts':{type:'table',sec:'tutorials',addLabel:'+ Add video',stat:TUTSTAT,
      cols:[{k:'v',l:'Video'},{k:'lang',l:'Language'},{k:'status',l:'Status',sel:1},{k:'next',l:'Next step'}],
      blank:{v:'',lang:'EN',status:'To record',next:''},def:wid(arr(D.tutorials),'tu')},
    'webq':{type:'table',sec:'web',addLabel:'+ Add page',stat:WEBSTAT,
      cols:[{k:'page',l:'Page'},{k:'domain',l:'Domain'},{k:'date',l:'Submitted',mono:1},{k:'status',l:'Status',sel:1}],
      blank:{page:'',domain:'',date:'',status:'Waiting approval'},def:wid(arr(D.webPages),'wq')},
    'ru':{type:'pills',sec:'programs',ph:'Add a program…',def:mk('ru',arr(D.ruDone))},
    'open':{type:'open',sec:'programs',ph:'Add an item…',def:wid(arr(D.openItems),'p')}
  };
  var SEC={todo:['t-week','t-up','t-svn','t-rec','t-nl','t-later'],tutorials:['tuts'],web:['webq'],programs:['ru','open']};
  var editing={};

  var store={};
  try{store=JSON.parse(localStorage.getItem('nchhub')||'{}')}catch(e){}
  function save(){try{localStorage.setItem('nchhub',JSON.stringify(store))}catch(e){}}
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function url(it){return store['u:'+it.id]||it.u||''}
  function get(id){var s=store['L:'+id];return Array.isArray(s)?s:JSON.parse(JSON.stringify(LISTS[id].def))}
  function put(id,a){store['L:'+id]=a;save()}
  function tagClass(s){s=(s||'').toLowerCase();if(/done|approved|uploaded|released/.test(s))return'green';if(/record|translat/.test(s))return'blue';return'amber'}
  function newId(){return'n'+Date.now()+Math.floor(Math.random()*1000)}

  /* ---------- tools ---------- */
  function renderTools(){
    var h='',removed=0;
    TOOLS.forEach(function(g){
      var live=g.items.filter(function(it){return !store['x:'+it.id]});
      removed+=g.items.length-live.length;
      if(!live.length)return;
      h+='<div class="group" data-group><h3>'+esc(g.g)+'</h3>';
      live.forEach(function(it){
        var u=url(it);
        h+='<div class="link" data-r data-id="'+it.id+'">';
        if(u){h+='<a href="'+esc(u)+'" target="_blank" rel="noopener"><span class="name">'+esc(it.n)+(it.d?'<small>'+esc(it.d)+'</small>':'')+'</span></a><button class="mini" data-edit="'+it.id+'" title="Change link">edit</button>'}
        else{h+='<span class="name missing">'+esc(it.n)+(it.d?'<small>'+esc(it.d)+'</small>':'')+'</span><button class="mini" data-edit="'+it.id+'">add link</button>'}
        h+='<button class="mini x" data-remove="'+it.id+'" title="Remove this tool" aria-label="Remove '+esc(it.n)+'">&times;</button></div>';
      });
      h+='</div>';
    });
    $('toolgrid').innerHTML=h;
    var rb=$('restore');rb.hidden=!(removed&&editing.tools);rb.textContent='Restore '+removed+' removed';
    applyFilter();
  }

  /* ---------- generic lists ---------- */
  function addForm(id){
    return '<form class="addrow" data-add="'+id+'"><input class="ein" placeholder="'+esc(LISTS[id].ph||'Add…')+'" aria-label="'+esc(LISTS[id].ph||'Add')+'"><button class="mini" type="submit">Add</button></form>';
  }
  function delBtn(id,iid,label){return '<button class="mini x" data-del="'+id+'" data-did="'+iid+'" aria-label="Remove '+esc(label)+'">&times;</button>'}
  function renderList(id){
    var L=LISTS[id],a=get(id),ed=!!editing[L.sec],h='';
    if(L.type==='check'){
      a.forEach(function(it){
        if(ed)h+='<div class="erow" data-r><input class="ein" data-l="'+id+'" data-i="'+it.id+'" data-f="t" value="'+esc(it.t)+'" aria-label="Task">'+delBtn(id,it.id,it.t)+'</div>';
        else h+='<label data-r><input type="checkbox" data-id="'+it.id+'"'+(store['c:'+it.id]?' checked':'')+'><span>'+esc(it.t)+'</span></label>';
      });
      if(ed)h+=addForm(id);
    }else if(L.type==='open'){
      a.forEach(function(it){
        if(ed)h+='<div class="erow" data-r><div class="stack"><input class="ein" data-l="'+id+'" data-i="'+it.id+'" data-f="t" value="'+esc(it.t)+'" aria-label="Item"><input class="ein" type="url" data-l="'+id+'" data-i="'+it.id+'" data-f="u" value="'+esc(it.u)+'" placeholder="Link (optional)" aria-label="Link"></div>'+delBtn(id,it.id,it.t)+'</div>';
        else h+='<label data-r><input type="checkbox" data-id="'+it.id+'"'+(store['c:'+it.id]?' checked':'')+'><span>'+esc(it.t)+'</span>'+(it.u?'<a class="lnk" href="'+esc(it.u)+'" target="_blank" rel="noopener">Track item</a>':'')+'</label>';
      });
      if(ed)h+=addForm(id);
    }else if(L.type==='pills'){
      h='<div class="pills">';
      a.forEach(function(it){
        h+='<span class="tag green pill" data-r>'+esc(it.t)+(ed?'<button class="x" data-del="'+id+'" data-did="'+it.id+'" aria-label="Remove '+esc(it.t)+'">&times;</button>':'')+'</span>';
      });
      h+='</div>';
      if(ed)h+=addForm(id);
    }else if(L.type==='table'){
      h='<table><thead><tr>';
      L.cols.forEach(function(c){h+='<th>'+esc(c.l)+'</th>'});
      if(ed)h+='<th></th>';
      h+='</tr></thead><tbody>';
      a.forEach(function(it){
        h+='<tr data-r>';
        L.cols.forEach(function(c){
          var v=it[c.k];
          if(ed){
            if(c.sel){
              var opts=L.stat.slice();if(opts.indexOf(v)<0)opts.push(v);
              h+='<td><select class="ein" data-l="'+id+'" data-i="'+it.id+'" data-f="'+c.k+'" aria-label="'+esc(c.l)+'">'+opts.map(function(o){return'<option'+(o===v?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select></td>';
            }else h+='<td><input class="ein" data-l="'+id+'" data-i="'+it.id+'" data-f="'+c.k+'" value="'+esc(v)+'" aria-label="'+esc(c.l)+'"></td>';
          }else if(c.sel)h+='<td><span class="tag '+tagClass(v)+'">'+esc(v)+'</span></td>';
          else h+='<td'+(c.mono?' class="mono"':'')+'>'+esc(v)+'</td>';
        });
        if(ed)h+='<td>'+delBtn(id,it.id,it[L.cols[0].k])+'</td>';
        h+='</tr>';
      });
      h+='</tbody></table>';
      if(ed)h+='<div class="tablefoot"><button class="mini" data-addrow="'+id+'">'+esc(L.addLabel)+'</button></div>';
    }
    $('L-'+id).innerHTML=h;
  }
  function renderCount(){
    var total=0,done=0;
    SEC.todo.forEach(function(k){get(k).forEach(function(it){total++;if(store['c:'+it.id])done++})});
    $('todocount').textContent=done+' of '+total+' done';
  }
  function renderSection(s){SEC[s].forEach(renderList);renderCount();applyFilter()}
  function mut(id,fn){var a=get(id);fn(a);put(id,a)}

  /* ---------- events ---------- */
  document.addEventListener('change',function(e){
    var t=e.target;
    if(t.matches('input[type=checkbox][data-id]')){store['c:'+t.dataset.id]=t.checked;save();renderCount()}
  });
  function onField(e){
    var t=e.target;
    if(!t.dataset||!t.dataset.l)return;
    mut(t.dataset.l,function(a){a.forEach(function(it){if(it.id===t.dataset.i)it[t.dataset.f]=t.value})});
  }
  document.addEventListener('input',onField);
  document.addEventListener('change',onField);

  document.addEventListener('submit',function(e){
    var f=e.target;e.preventDefault();
    if(f.dataset.add){
      var id=f.dataset.add,v=f.querySelector('input').value.trim();
      if(!v)return;
      mut(id,function(a){var it={id:newId(),t:v};if(LISTS[id].type==='open')it.u='';a.push(it)});
      renderList(id);renderCount();applyFilter();
      var n=$('L-'+id).querySelector('.addrow input');if(n)n.focus();
    }else if(f.classList.contains('edit')){
      var tid=f.dataset.tool,val=f.querySelector('input').value.trim();
      store['u:'+tid]=val;save();renderTools();
    }
  });

  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-toggle]');
    if(t){
      var s=t.dataset.toggle,sec=$(s);
      editing[s]=!editing[s];
      sec.classList.toggle('editing',!!editing[s]);
      t.textContent=editing[s]?'Done':'Edit';t.setAttribute('aria-pressed',!!editing[s]);
      var r=sec.querySelector('[data-reset]');if(r){r.hidden=!editing[s];r.textContent='Reset to defaults';delete r.dataset.armed}
      var hint=sec.querySelector('.hint');if(hint)hint.hidden=!!editing[s];
      if(s==='tools')renderTools();else renderSection(s);
      return;
    }
    var rs=e.target.closest('[data-reset]');
    if(rs){
      if(!rs.dataset.armed){rs.dataset.armed='1';rs.textContent='Click again to confirm';return}
      var sname=rs.dataset.reset;
      SEC[sname].forEach(function(id){delete store['L:'+id]});
      if(sname==='todo')Object.keys(store).forEach(function(k){if(k.indexOf('c:')===0)delete store[k]});
      save();delete rs.dataset.armed;rs.textContent='Reset to defaults';renderSection(sname);return;
    }
    var dl=e.target.closest('[data-del]');
    if(dl){var id=dl.dataset.del;mut(id,function(a){var i=a.findIndex(function(it){return it.id===dl.dataset.did});if(i>-1)a.splice(i,1)});renderList(id);renderCount();applyFilter();return}
    var ar=e.target.closest('[data-addrow]');
    if(ar){var lid=ar.dataset.addrow;mut(lid,function(a){var b=JSON.parse(JSON.stringify(LISTS[lid].blank));b.id=newId();a.push(b)});renderList(lid);
      var ins=$('L-'+lid).querySelectorAll('tbody tr:last-child input');if(ins[0])ins[0].focus();applyFilter();return}
    var rm=e.target.closest('[data-remove]');
    if(rm){store['x:'+rm.dataset.remove]=true;save();renderTools();return}
    if(e.target.id==='restore'){Object.keys(store).forEach(function(k){if(k.indexOf('x:')===0)delete store[k]});save();renderTools();return}
    var b=e.target.closest('[data-edit]');
    if(b){
      var row=b.closest('.link'),tid=b.dataset.edit,cur='';
      TOOLS.forEach(function(g){g.items.forEach(function(it){if(it.id===tid)cur=url(it)})});
      var f=document.createElement('form');f.className='edit';f.dataset.tool=tid;
      f.innerHTML='<input type="url" placeholder="https://…" value="'+esc(cur)+'" aria-label="Link address"><button class="mini" type="submit" style="display:inline-block">save</button>';
      row.replaceWith(f);f.querySelector('input').focus();
    }
  });

  /* ---------- search ---------- */
  function applyFilter(){
    var q=$('q').value.trim().toLowerCase(),any=false;
    document.querySelectorAll('[data-r]').forEach(function(r){
      var txt=r.textContent+' '+[].map.call(r.querySelectorAll('input.ein'),function(i){return i.value}).join(' ');
      r.classList.toggle('hide',!!q&&txt.toLowerCase().indexOf(q)<0);
    });
    document.querySelectorAll('[data-group]').forEach(function(g){
      var rows=g.querySelectorAll('[data-r]');
      if(!q||!rows.length){g.classList.remove('hide');return}
      g.classList.toggle('hide',![].some.call(rows,function(r){return !r.classList.contains('hide')}));
    });
    document.querySelectorAll('section[data-s]').forEach(function(s){
      var rows=s.querySelectorAll('[data-r]');
      var vis=!q||[].some.call(rows,function(r){return !r.classList.contains('hide')});
      s.classList.toggle('hide',!vis);if(vis)any=true;
    });
    $('noresults').style.display=(q&&!any)?'block':'none';
  }
  $('q').addEventListener('input',applyFilter);
  $('themebtn').addEventListener('click',function(){
    var r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme:dark)').matches;
    r.dataset.theme=dark?'light':'dark';
  });

  renderTools();
  Object.keys(SEC).forEach(renderSection);
})();
