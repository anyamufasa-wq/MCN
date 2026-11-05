(() => {
 const params=new URLSearchParams(location.search);if(params.get('type')!=='talent'||!params.get('supplier'))return;
 const id=params.get('supplier'),people=TalentPRD.suppliers().filter(s=>s.isTalent),local=TalentPRD.read('xmfx-created-talents-v1',[]);
 const supplier=people.find(s=>s.id===id)||[...talentData,...local].map(t=>TalentPRD.owner(t)).find(s=>s?.id===id);
 if(!supplier)return;
 const escValue=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const linked=[...talentData,...local].filter(t=>TalentPRD.owner(t)?.id===id);
 document.title=supplier.name+' · MCN与达人';document.querySelector('.heading').innerHTML=`<div class="identity"><h1>${escValue(supplier.name)}</h1><span class="badge orange">达人</span></div><a class="btn" href="mcn-talents-list.html">返回列表</a>`;
 const nav=document.querySelector('.mcn-quick-nav'),filters=document.getElementById('filters');if(nav)nav.hidden=true;if(filters)filters.hidden=true;
 document.getElementById('content').innerHTML=`<section class="panel"><h3>供应商主体</h3><div class="table-wrap"><table><thead><tr><th>主体名称</th><th>主体类型</th></tr></thead><tbody>${(supplier.subjects||[{name:supplier.name}]).map(s=>`<tr><td>${escValue(s.name)}</td><td>${s.type==='private'?'对私主体':'对公主体'}</td></tr>`).join('')}</tbody></table></div></section><section class="panel" style="margin-top:20px"><h3>关联达人账号</h3><div class="table-wrap"><table><thead><tr><th>达人</th><th>媒体</th><th>账号ID</th><th>返点</th></tr></thead><tbody>${linked.map(t=>`<tr><td><a href="talent-detail.html?talent=${encodeURIComponent(t.id)}&from=list">${escValue(t.name)}</a></td><td>${escValue(TalentPRD.mediaName(t))}</td><td>${escValue(t.accountId)}</td><td>${TalentPRD.owner(t).rate==null?'—':(TalentPRD.owner(t).rate*100).toFixed(2)+'%'}</td></tr>`).join('')||'<tr><td colspan="4">暂无关联账号</td></tr>'}</tbody></table></div></section>`;
})();
