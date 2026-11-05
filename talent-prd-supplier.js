(() => {
 const params=new URLSearchParams(location.search);if(!params.get('supplier'))return;
 const id=params.get('supplier'),people=TalentPRD.suppliers().filter(s=>s.isTalent),local=TalentPRD.read('xmfx-created-talents-v1',[]);
 const savedName=SupplierCooperation.names().find(name=>name.id===id);
 if(savedName?.type==='MCN'&&id.startsWith('mcn:')){
  location.replace('mcn-talents-detail.html?mcn='+encodeURIComponent(id.slice(4)));return;
 }
 const supplier=people.find(s=>s.id===id)||[...talentData,...local].map(t=>TalentPRD.owner(t)).find(s=>s?.id===id)||savedName;
 if(!supplier)return;
 const escValue=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const linked=[...talentData,...local].filter(t=>TalentPRD.owner(t)?.id===id);
 const nav=document.querySelector('.mcn-quick-nav'),filters=document.getElementById('filters');if(nav)nav.hidden=true;if(filters)filters.hidden=true;
 const records=SupplierCooperation.subjectsFor(id),baseSubjects=supplier.subjects||(!savedName?[{name:supplier.name}]:[]);
 const subjects=[...baseSubjects,...records.filter(record=>!baseSubjects.some(subject=>subject.name===record.name))].map(subject=>{
  const accounts=linked.filter(t=>{
   const owner=TalentPRD.owner(t);
   const selected=(owner.subjects||[]).find(item=>item.id===owner.subjectId)||owner.subjects?.[0]||baseSubjects[0];
   return selected?.name===subject.name;
  });
  const record=records.findLast(item=>item.name===subject.name),media=[...new Set(accounts.map(t=>t.media))];
  const rates=subjectRates(id,subject.name,media);
  if(!record)for(const item of rates)item.rate=TalentPRD.owner(accounts.find(t=>t.media===item.media))?.rate??null;
  return {...subject,accounts,media:rates.map(item=>item.label),rates,type:record?record.entityType==='私付'?'private':'public':subject.type,recordId:record?.id};
 });
 document.title=supplier.name+' · MCN与达人';document.querySelector('.heading').innerHTML=`<div class="identity"><div class="titleline"><h1 class="supplier-title">${escValue(supplier.name)}</h1><span class="badge orange">${savedName?.type==='MCN'?'MCN':'达人'}</span></div><div class="meta">${subjectMediaTags(SupplierCooperation.verticals(supplier,linked),'')}</div></div><a class="btn" href="mcn-talents-list.html${escValue(params.get('listState')||'')}">返回列表</a>`;
 document.getElementById('content').innerHTML=`<section class="panel" id="section-subjects"><h3>旗下主体</h3>${subjectTable(subjects,id)}</section><section class="panel" id="section-talents" style="margin-top:20px"><h3>关联达人账号</h3><div class="toolbar"><label>媒体 <select id="supplierTalentMedia"></select></label></div><div class="table-wrap"><table><thead><tr><th>达人</th><th>媒体</th><th>账号ID</th></tr></thead><tbody id="supplierTalentRows"></tbody></table></div></section>`;
 const filter=document.getElementById('supplierTalentMedia');
 filter.add(new Option('全部媒体',''));
 for(const platform of new Set(linked.map(TalentPRD.mediaName)))filter.add(new Option(platform));
 const drawAccounts=()=>{document.getElementById('supplierTalentRows').innerHTML=linked.filter(t=>!filter.value||TalentPRD.mediaName(t)===filter.value).map(t=>`<tr><td><a href="talent-detail.html?talent=${encodeURIComponent(t.id)}&from=list">${escValue(t.name)}</a></td><td>${escValue(TalentPRD.mediaName(t))}</td><td>${escValue(t.accountId)}</td></tr>`).join('')||'<tr><td colspan="3">暂无关联账号</td></tr>';};
 filter.onchange=drawAccounts;drawAccounts();
 bindSubjectDetails(subjects);
})();
