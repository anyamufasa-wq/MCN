function accountIdentityRows(t){return prdAccountIdentities(t);}
function talentTagSources(t){return TalentPRD.tagSources(t);}
function filter(){TalentPRD.hydrate(talent);Object.assign(localProfile,{liaison:(talent.liaisons||[]).join('、'),contact:talent.contact||'未维护',phone:talent.phone||'未维护',wechat:talent.wechat||'未维护',supplement:talent.additionalInfo||'',type:TalentPRD.types(talent).join('、')});header();render();}
function prdDetailStatistics(){const m=TalentPRD.metrics(talent),rate=value=>value==null?'—':(value*100).toFixed(1)+'%';return `<section class="account-metrics" aria-label="近180天合作统计"><div class="account-metric"><span>提报次数</span><strong>${m.submitted}<small>次</small></strong></div><div class="account-metric"><span>合作率</span><strong>${rate(m.cooperationRate)}</strong></div><div class="account-metric"><span>完单率</span><strong>${rate(m.completionRate)}</strong></div></section>`;}
function prdDetailAffiliations(){const entries=TalentPRD.affiliations(talent),rate=v=>v==null?'—':(v*100).toFixed(2)+'%';return `<div class="table-wrap"><table><thead><tr><th>合作机构</th><th>类型</th><th>机构返点</th><th>达人返点</th></tr></thead><tbody>${entries.map(r=>`<tr><td>${r.url?`<a href="${esc(r.url)}">${esc(r.name)}</a>`:esc(r.name)}</td><td>${r.type}</td><td>${rate(r.baseRate)}</td><td>${rate(r.rate)}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">暂无归属记录</td></tr>'}</tbody></table></div>`;}
function prdDetailSidebar(){return `<aside class="talent-profile"><div class="profile-initial">${talentAvatar(talent)?`<img src="${talentAvatar(talent)}" alt="${esc(talent.name)}头像" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`:esc(talent.name[0])}</div><h2>${esc(talent.name)}</h2><div class="chips">${TalentPRD.types(talent).map(type=>`<span class="badge">${type}</span>`).join('')}</div><dl class="aside-facts">${prdAccountIdentities(talent)}<dt>粉丝数量</dt><dd>${talent.fans==null?'—':talent.fans+'万'}</dd><dt>地域</dt><dd>${esc(talent.region||'未维护')}</dd>${prdMetricsView(talent)}<dt>主页</dt><dd>${prdHomepage(talent)||'未维护'}</dd></dl><section class="prd-sidebar-contacts"><div><h3>对接人和联系方式</h3><button type="button" class="link" data-edit>编辑</button></div><p>${esc((talent.liaisons||[localProfile.liaison]).join('、'))}</p>${listContactView(talent)}</section>${relatedAccountsPanel()}</aside>`;}
function prdDetailTags(){const t=talent,sources=talentTagSources(t),p=listProfile(t);return `<div class="prd-detail-tags">${[['平台垂类标签',sources.platform],['垂类标签',sources.internal],['效果标签',p.effectTags||t.effectTags||[]],['履约标签',p.performanceTags||[]],['风险标签',[prdRiskStatus(p.riskTags||t.riskTags)]],['自定义标签',p.customTags||[]]].map(([label,values])=>`<div><span class="quiet">${label}</span><div class="prd-inline-tags">${values.map(v=>`<span class="badge">${esc(v)}</span>`).join('')||'—'}</div></div>`).join('')}</div>`;}
function prdDetailQuotes(){
 const groups=quoteGroups[quoteKey(talent)]||[],values=talent.quoteValues||{};
 if(!groups.length)return '<p class="quiet">暂无报价</p>';
 const cells=groups.map((group,index)=>{
  if(group.items.every((_,item)=>values[index+'-'+item]==null))return '<td class="detail-quote-empty">—</td>';
  const sections=group.sections||[{start:0,end:group.items.length}];
  const cards=sections.map(section=>{
   const rows=group.items.slice(section.start,section.end).map((label,offset)=>{
    const value=values[index+'-'+(section.start+offset)];
    return `<div class="detail-quote-item"><span>${esc(label)}</span><span>${quoteAmount(value)}</span></div>`;
   }).join('');
   return `<div class="detail-quote-card">${section.name?`<div class="detail-quote-subheading">${esc(section.name)}</div>`:''}${rows}</div>`;
  }).join('');
  return `<td><div class="detail-quote-scroll" role="region" aria-label="${esc(group.name)}报价" tabindex="0">${cards}</div></td>`;
 }).join('');
 return `<div class="table-wrap"><table class="detail-quote-table"><thead><tr>${groups.map(group=>`<th scope="col">${esc(group.name)}</th>`).join('')}</tr></thead><tbody><tr>${cells}</tr></tbody></table></div>`;
}
