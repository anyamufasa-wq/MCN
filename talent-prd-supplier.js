(() => {
 const params=new URLSearchParams(location.search),id=params.get('supplier');
 if(!id)return;
 const saved=SupplierCooperation.nameRecord(id);
 if(saved?.type==='MCN'&&id.startsWith('mcn:')){
  params.delete('supplier');params.set('mcn',id.slice(4));
  location.replace('mcn-talents-detail.html?'+params);return;
 }
 const all=[...talentData,...TalentPRD.read('xmfx-created-talents-v1',[])];
 const seed=TalentPRD.suppliers().find(item=>item.id===id)||all.map(t=>TalentPRD.owner(t)).find(item=>item?.id===id);
 if(!saved&&!seed)return;
 const supplier={...seed,...saved};
 const definitions=seed?.subjects||(!saved?[{name:supplier.name}]:[]);
 const subjects=TalentPRD.supplierSubjects(id,definitions,all).map(subject=>{
  const rates=subjectRates(id,subject.name,subject.media);
  if(!subject.recordId)for(const item of rates){
   const account=subject.accounts.find(t=>t.media===item.media);
   item.rate=account?TalentPRD.owner(account)?.rate??null:null;
  }
  return {...subject,rates};
 });
 const linked=[...new Map(subjects.flatMap(subject=>subject.accounts).map(t=>[t.id,t])).values()];
 document.querySelector('.mcn-quick-nav').hidden=true;
 function heading(record){
  document.title=record.name+' · MCN与达人';
  document.querySelector('.heading').innerHTML=`<div class="identity"><div class="titleline"><h1 class="supplier-title">${esc(record.name)}</h1><span class="badge orange">${esc(record.type||'达人')}</span></div><div class="meta">${subjectMediaTags(SupplierCooperation.verticals(record,linked),'')}</div></div><div class="heading-actions">${saved?'<button class="btn" id="editSupplierName">编辑名称</button>':''}<a class="btn" href="mcn-talents-list.html${esc(params.get('listState')||'')}">返回列表</a></div>`;
  const edit=document.getElementById('editSupplierName');if(edit)edit.onclick=()=>editSupplierName(id,heading);
 }
 heading(supplier);
 document.getElementById('content').innerHTML=`<section class="mcn-section" id="section-subjects"><div class="mcn-section-heading"><h2>旗下主体</h2></div>${subjectTable(subjects,id)}</section><section class="mcn-section" id="section-talents"><div class="mcn-section-heading"><h2>旗下达人</h2></div><div class="toolbar"><label>媒体 <select id="supplierTalentMedia"></select></label></div><div class="table-wrap list-sheet"><table class="list-table talent-library-table"><thead id="supplierTalentHead"></thead><tbody id="supplierTalentRows"></tbody></table></div></section>`;
 const filter=document.getElementById('supplierTalentMedia');
 filter.add(new Option('全部媒体',''));
 for(const platform of new Set(linked.map(TalentPRD.mediaName)))filter.add(new Option(platform));
 const draw=()=>renderTalentLibraryTable(document.getElementById('supplierTalentHead'),document.getElementById('supplierTalentRows'),
  linked.filter(t=>!filter.value||TalentPRD.mediaName(t)===filter.value).map(t=>TalentPRD.hydrate(t)),
  {detailHref:t=>'talent-detail.html?talent='+encodeURIComponent(t.id)+'&from=list',onEdit:t=>listEditTalent(t,draw,{detail:true}),manageAgency:false});
 filter.onchange=draw;draw();
 bindSubjectDetails(subjects,id);
})();
