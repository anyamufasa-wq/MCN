function listRead(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function listProfile(t) { return listRead('xmfx-list-profile:'+t.id, {}); }
function listApplyProfiles() { rows.forEach(t=>Object.assign(t,listProfile(t))); }
function listCompany(id) { return mcns[id]?.subjects?.[0] || agencyName(id); }
function listOfficialIcon() { return '<span class="list-official-icon" role="img" title="达人在媒体平台归属的MCN机构" aria-label="达人在媒体平台归属的MCN机构"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m10 2 6 3v5c0 4-6 8-6 8s-6-4-6-8V5Z"/><path d="m7 10 2 2 4-4"/></svg></span>'; }
function listAgencyView(t) {
 const active=talentAgencies(t),pending=listRead('xmfx-list-agency-request:'+t.id,null);
 return active.map(r=>`<div class="dense-agency"><div><span class="agency-name-with-tag"><a href="mcn-talents-detail.html?mcn=${r.mcn}">${esc(listCompany(r.mcn))}</a>${r.mcn===t.currentMcn?listOfficialIcon():''}</span><b>${agencyRate(t,r.mcn)==null?'未维护':(agencyRate(t,r.mcn)*100).toFixed(1)+'%'}</b></div></div>`).join('')+(pending?'<span class="badge orange">归属变更待审批</span>':'')||`<span class="muted">${esc(t.currentMcnName||'无MCN机构')}</span>`;
}
function listRecentOrders(t) { const now=new Date(),cutoff=new Date(now);cutoff.setDate(cutoff.getDate()-90);return ownOrders(t).filter(o=>{const d=new Date(o.createdAt);return d>=cutoff&&d<=now;}); }
function listBrandView(t) {
 const industry={'澄露':'美妆个护','轻研':'美妆个护','森序生活':'家居生活','拾光衣橱':'服饰穿搭','初野':'家居生活'};
 const brands=[...new Set(ownOrders(t).map(o=>o.brand).filter(Boolean))];
 if(!brands.length)return '—';
 const lines=brands.map(b=>`<div class="list-brand-line"><span>${esc(b)}</span><small>${esc(industry[b]||'其他')}</small></div>`).join('');
 return `<div class="list-brand-wrap" tabindex="0" title="${esc(brands.map(b=>b+' · '+(industry[b]||'其他')).join('\n'))}"><div class="list-brand-summary">${lines}</div><div class="list-brand-popover" role="tooltip">${lines}</div></div>`;
}
function listDrawer(title,body,submitLabel,onSubmit) {
 let d=document.getElementById('talentListDrawer');if(!d){d=document.createElement('dialog');d.id='talentListDrawer';document.body.append(d);d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)d.close();}});}
 d.innerHTML=`<form id="listDrawerForm"><header><h2>${esc(title)}</h2><button type="button" data-drawer-close aria-label="关闭">×</button></header><div class="list-drawer-body">${body}<p id="listDrawerError" role="alert"></p></div><footer><button type="button" class="btn" data-drawer-close>取消</button><button type="submit" class="btn primary">${submitLabel}</button></footer></form>`;
 d.querySelectorAll('[data-drawer-close]').forEach(b=>b.onclick=()=>d.close());d.querySelector('form').onsubmit=e=>{e.preventDefault();try{onSubmit(new FormData(e.target),d);}catch(err){document.getElementById('listDrawerError').textContent=err.message||'保存失败，请重试';}};if(!d.open)d.showModal();return d;
}
function listField(label,name,value='',extra='') { return `<label class="list-drawer-field"><span>${label}</span><input name="${name}" value="${esc(String(value??''))}" ${extra}></label>`; }
function listSplit(value) { return [...new Set(String(value||'').split(/[,，、\n]/).map(v=>v.trim()).filter(Boolean))]; }
function listEditIdentity(t) {
 const avatar=talentAvatar(t);
 return `<section class="list-edit-identity" aria-label="达人基本信息"><div class="list-edit-identity-top">${avatar?`<img src="${esc(avatar)}" alt="${esc(t.name)}头像">`:'<span class="list-edit-avatar-placeholder" aria-label="暂无头像"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/></svg></span>'}<div><strong>${esc(t.name)}</strong><span>${esc(t.media+(t.channel?' · '+t.channel:''))}</span></div></div><dl><dt>达人编号</dt><dd>${esc(t.id)}</dd>${accountIdentityRows(t)}<dt>性别</dt><dd>${esc(t.gender||'未知')}</dd><dt>地域</dt><dd>${esc(t.region||'未维护')}</dd></dl></section>`;
}
function listEditTalent(t) {
 const p=listProfile(t),sources=talentTagSources(t),high=listHighlightDefaults(t);
 const fields=listField('对接人','liaison',talentLiaison(t)==='未维护'?'':talentLiaison(t))+listField('联系人','contact',t.contact)+listField('联系电话','phone',t.phone)+listField('微信','wechat',t.wechat)+listField('平台垂类标签','industries',sources.platform.join('、'))+listField('自打垂类标签','contentTags',sources.internal.join('、'))+listField('效果标签','effectTags',(p.effectTags||high.effectTags).join('、'))+listField('履约标签','performanceTags',(p.performanceTags||[]).join('、'))+listField('风险标签','riskTags',(p.riskTags||high.riskTags).join('、'))+listField('自定义标签','customTags',(p.customTags||[]).join('、'))+`<label class="list-drawer-field"><span>补充信息</span><textarea name="additionalInfo" rows="4">${esc(p.additionalInfo||'')}</textarea></label>`;
 listDrawer('编辑 · '+t.name,listEditIdentity(t)+fields,'保存',(data,d)=>{const patch=Object.fromEntries(data);for(const key of ['industries','contentTags','effectTags','performanceTags','riskTags','customTags'])patch[key]=listSplit(patch[key]);localStorage.setItem('xmfx-list-profile:'+t.id,JSON.stringify(patch));localStorage.setItem('xmfx-talent-liaison:'+t.id,patch.liaison);Object.assign(t,patch);filter();d.close();});
}
function listHighlightDefaults(t) { if(typeof talentHighlightTags!=='function')return {effectTags:t.effectTags||[],riskTags:t.riskTags||[]};talentHighlightTags(t);const tags=demoTalentHighlights.get(t.media+'|'+(t.channel||''))?.get(t.id);return {effectTags:tags?.stable?['爆文稳定']:[],riskTags:tags?.risks||[]}; }
function listEditedHighlights(t) {
 const p=listProfile(t);if(!['effectTags','performanceTags','riskTags','customTags'].some(k=>Object.hasOwn(p,k)))return talentHighlightTags(t);
 return `<div class="talent-highlight-tags">${(p.effectTags||[]).map(v=>`<span class="talent-highlight stable-highlight">${esc(v)}</span>`).join('')}${(p.performanceTags||[]).map(v=>`<span class="badge green">${esc(v)}</span>`).join('')}${p.riskTags?.length?`<span class="talent-risk-wrap" tabindex="0"><span class="talent-highlight risk-highlight">合作风险</span><span class="talent-risk-tooltip" role="tooltip">${p.riskTags.map(v=>`<span>${esc(v)}</span>`).join('')}</span></span>`:''}${(p.customTags||[]).map(v=>`<span class="badge">${esc(v)}</span>`).join('')}</div>`;
}
function listOwnerOptions(t,owner) {
 const options=[];
 const add=(type,name)=>{if(name&&!options.some(x=>x.type===type&&x.name===name))options.push({id:type+':'+name,type,name});};
 rows.forEach(r=>{add('public',r.publicSubject);add('private',r.privateSubject);});
 add('public',t.publicSubject||t.name+'文化传媒有限公司');add('private',t.privateSubject||t.contact||t.name);
 if(owner?.name)add(owner.type||'public',owner.name);
 return options;
}
function listManageAgencies(t) {
 const pending=listRead('xmfx-list-agency-request:'+t.id,null),owner=pending?.owner||listRead('xmfx-list-owner:'+t.id,{});
 const subjects=listOwnerOptions(t,owner),selected=subjects.find(x=>x.id===owner.id)||subjects.find(x=>x.name===(owner.name||t.publicSubject||t.privateSubject));
 let draft=(pending?.agencies||talentAgencies(t)).map(r=>({...r,rate:r.rate??annualMCN(r.mcn).rate}));
 const body=`<section><h3>管理归属达人</h3><p class="list-drawer-note">达人自身的公司、收付款信息，非MCN机构</p><label class="list-drawer-field"><span>归属主体</span><select id="listOwnerSelect" name="ownerSubject" required><option value="">请选择对私主体或对公主体</option>${[['private','对私主体'],['public','对公主体']].map(([type,label])=>`<optgroup label="${label}">${subjects.filter(x=>x.type===type).map(x=>`<option value="${esc(x.id)}" ${x.id===selected?.id?'selected':''}>${label} · ${esc(x.name)}</option>`).join('')}</optgroup>`).join('')}</select></label><div id="listOwnerName" class="list-owner-name"></div><div id="listOwnerRebate" hidden>${listField('归属达人返点（%）<span class="list-required" aria-hidden="true"> *</span>','ownerRate',owner.rate!=null?+(owner.rate*100).toFixed(4):'','id="listOwnerRate" type="number" min="0" max="100" step="0.01" required disabled')}</div></section><section><h3>管理归属机构</h3><p class="list-drawer-note">达人所属的MCN机构</p>${pending?'<span class="badge orange">待审批</span>':''}<div id="listAgencyDraft"></div><button class="btn" id="listAddAgency" type="button">新增机构</button><div id="listAgencyPicker" hidden><label class="list-drawer-field"><span>选择机构</span><select id="listAgencySelect"></select></label><div id="listAgencyRatePreview"></div><button class="btn" id="listConfirmAgency" type="button">添加</button></div></section>`;
 const d=listDrawer('管理机构/返点 · '+t.name,body,'保存并提交',(data,drawer)=>{
  if(draft.some(r=>!Number.isFinite(r.rate)||r.rate<0||r.rate>1))throw Error('达人返点须在0%至100%之间');
  if(new Set(draft.map(r=>r.mcn)).size!==draft.length)throw Error('请勿重复添加机构');
  const subject=subjects.find(x=>x.id===data.get('ownerSubject'));if(!subject)throw Error('请选择归属主体');
  const rateValue=String(data.get('ownerRate')??'').trim(),ownerRate=Number(rateValue);if(!rateValue||!Number.isFinite(ownerRate)||ownerRate<0||ownerRate>100)throw Error('请设置0%至100%之间的归属达人返点');
  const request={status:'pending',submittedAt:new Date().toISOString(),owner:{...subject,rate:ownerRate/100},agencies:draft.map(r=>({mcn:r.mcn,rate:r.rate,...(r.exitedAt?{exitedAt:r.exitedAt,action:'exit'}:{})}))};
  localStorage.setItem('xmfx-list-agency-request:'+t.id,JSON.stringify(request));render();drawer.close();
 });
 function draw(){document.getElementById('listAgencyDraft').innerHTML=draft.map((r,i)=>`<div class="list-agency-card"><div><strong>${esc(listCompany(r.mcn))}</strong><button type="button" data-exit-agency="${i}" class="link">${r.exitedAt?'撤销退出':'退出机构'}</button></div>${r.exitedAt?'<p class="list-exit-status">退出机构 · 待审批</p>':''}<p>机构返点：${(annualMCN(r.mcn).rate*100).toFixed(1)}%</p><label class="list-drawer-field"><span>达人返点（%）<span class="list-required" aria-hidden="true"> *</span></span><input data-agency-rate="${i}" type="number" min="0" max="100" step="0.01" required ${r.exitedAt?'disabled':''} value="${+(r.rate*100).toFixed(4)}"></label></div>`).join('');d.querySelectorAll('[data-exit-agency]').forEach(b=>b.onclick=()=>{const r=draft[+b.dataset.exitAgency];if(r.exitedAt)delete r.exitedAt;else r.exitedAt=new Date().toISOString();draw();});d.querySelectorAll('[data-agency-rate]').forEach(i=>i.oninput=()=>{draft[+i.dataset.agencyRate].rate=i.value===''?NaN:+i.value/100;});document.getElementById('listAgencyPicker').hidden=true;}
 const ownerSelect=document.getElementById('listOwnerSelect');const showOwner=()=>{const subject=subjects.find(x=>x.id===ownerSelect.value);document.getElementById('listOwnerName').textContent=subject?'主体名称：'+subject.name:'';document.getElementById('listOwnerRebate').hidden=!subject;document.getElementById('listOwnerRate').disabled=!subject;};ownerSelect.onchange=showOwner;showOwner();
 document.getElementById('listAddAgency').onclick=()=>{const available=mcns.map((m,i)=>i).filter(i=>!draft.some(r=>r.mcn===i)),select=document.getElementById('listAgencySelect');select.innerHTML='<option value="">请选择机构</option>'+available.map(i=>`<option value="${i}">${esc(listCompany(i))}</option>`).join('');document.getElementById('listAgencyPicker').hidden=false;document.getElementById('listAgencyRatePreview').innerHTML=available.length?'':'暂无可添加机构';};
 document.getElementById('listAgencySelect').onchange=e=>{document.getElementById('listAgencyRatePreview').textContent=e.target.value===''?'':'机构返点：'+(annualMCN(+e.target.value).rate*100).toFixed(1)+'%';};
 document.getElementById('listConfirmAgency').onclick=()=>{const value=document.getElementById('listAgencySelect').value;if(value==='')return;const id=+value;if(draft.some(r=>r.mcn===id))return;draft.push({mcn:id,rate:annualMCN(id).rate});draw();};draw();
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-list-edit],[data-list-agencies]');if(!button)return;e.preventDefault();const t=talentTableData().find(t=>t.id===(button.dataset.listEdit||button.dataset.listAgencies));if(!t)return;if(button.hasAttribute('data-list-edit'))listEditTalent(t,typeof filter==='function'?filter:renderTalentRows);else listManageAgencies(t);});
function listContactView(t) {
 const contacts=[['联系人',t.contact],['电话',t.phone],['微信',t.wechat],['邮箱',t.email]].filter(([,v])=>v&&v!=='未维护');
 return contacts.length?contacts.map(([label,value])=>`<div class="list-contact-line"><span class="list-contact-label">${label}</span><span class="list-contact-value">${esc(String(value))}</span><button type="button" class="list-copy-contact" data-copy-contact="${esc(String(value))}" title="复制${label}" aria-label="复制${label}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="7" y="7" width="10" height="11" rx="2"/><path d="M12 4V3a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v8a1 1 0 0 0 1 1h1"/></svg></button></div>`).join(''):'未维护';
}
async function listCopyContact(value) {
 try { if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);return;} } catch {}
 const previous=document.activeElement,input=document.createElement('textarea');input.value=value;input.setAttribute('readonly','');input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);
 try { input.select();if(!document.execCommand('copy'))throw Error('复制失败'); } finally { input.remove();previous?.focus({preventScroll:true}); }
}
document.addEventListener('click',async e=>{
 const button=e.target.closest('[data-copy-contact]');if(!button)return;
 const original=button.innerHTML,label=button.getAttribute('aria-label');button.disabled=true;
 try { await listCopyContact(button.dataset.copyContact);button.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m4 10 4 4 8-9"/></svg>';button.title='已复制';button.setAttribute('aria-label','已复制'); }
 catch {button.title='复制失败，请手动复制';button.setAttribute('aria-label','复制失败，请手动复制');}
 finally {button.disabled=false;setTimeout(()=>{if(button.isConnected){button.innerHTML=original;button.title=label;button.setAttribute('aria-label',label);}},1600);}
});
