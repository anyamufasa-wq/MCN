var SupplierCooperationUI = (() => {
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function openName({record={},types=SupplierCooperation.types,onSave}={}){
  const locked=record.id&&SupplierCooperation.hasSubjects(record.id);
  const dialog=document.createElement('dialog');dialog.className='supplier-shared-dialog';
  const choices=(name,items,selected,kind,disabled)=>items.map(([value,label])=>`<label><input type="${kind}" name="${name}" value="${esc(value)}"${selected.includes(value)?' checked':''}${disabled(value)?' disabled':''}${kind==='radio'?' required':''}> ${esc(label)}</label>`).join('');
  dialog.innerHTML=`<form><h2>${record.id?'编辑供应商名称':'新建供应商名称'}</h2>
  <label class="supplier-dialog-field">供应商名称 <input name="name" required maxlength="50" value="${esc(record.name)}"></label>
  <fieldset><legend>供应商类型 *</legend>${choices('type',types.map(type=>[type,type]),[record.type||'其他'],'radio',()=>locked)}</fieldset>
  <fieldset><legend>业务类型 *</legend>${choices('businessTypes',SupplierCooperation.businessOptions.map(type=>[type,type]),record.businessTypes||[],'checkbox',value=>locked&&record.businessTypes.includes(value))}</fieldset>
  <fieldset><legend>对接人</legend>${choices('liaisonIds',SupplierCooperation.employees.map(employee=>[employee.id,employee.name]),record.liaisonIds||[],'checkbox',()=>false)}</fieldset>
  <p role="alert"></p><footer><button type="button" data-close>取消</button><button type="submit">保存</button></footer></form>`;
  document.body.append(dialog);
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.querySelector('form').onsubmit=event=>{
   event.preventDefault();
   const data=new FormData(event.currentTarget);
   const businessTypes=[...new Set([...(locked?record.businessTypes:[]),...data.getAll('businessTypes')])];
   let updated;
   try{updated=SupplierCooperation.saveName({...record,name:data.get('name'),type:locked?record.type:data.get('type'),businessTypes,liaisonIds:data.getAll('liaisonIds')});}
   catch(error){dialog.querySelector('[role=alert]').textContent=error.message;return;}
   dialog.close();onSave?.(updated);
  };
  dialog.showModal();
 }
 function openSubject({subject,supplierId,mediaTable,accountsTable}){
  const record=SupplierCooperation.subjects().find(item=>item.id===subject.recordId)||{};
  const days=SupplierCooperation.accountDays(supplierId)??record.accountDays;
  const fields=[['主体名称',subject.name],['主体类型',subject.type==='private'?'私付':'公付'],['状态',subject.status],['账期',days==null?'待设置':days+' 天'],['注册地址',record.address],['联系人',record.contact],['联系电话',record.phone],['邮箱',record.email],['邮寄地址',record.mailAddress],['备注',record.note]];
  const drawer=document.createElement('dialog');drawer.className='supplier-shared-dialog supplier-subject-drawer';
  const platformRows=(record.media||[]).map(media=>`<tr><td>${esc(media)}</td><td>${record.profiles?.[media]?.rate==null?'—':esc(record.profiles[media].rate)+'%'}</td></tr>`).join('');
  drawer.innerHTML=`<header><h2>供应商主体详情</h2><button type="button" aria-label="关闭">×</button></header>
  <dl>${fields.filter(([,value])=>value).map(([label,value])=>`<dt>${label}</dt><dd>${esc(value)}</dd>`).join('')}</dl>
  <h3>关联媒体</h3>${mediaTable||(platformRows?`<table><thead><tr><th>媒体</th><th>返点</th></tr></thead><tbody>${platformRows}</tbody></table>`:'<p>暂无关联媒体</p>')}
  ${accountsTable?`<h3>关联达人账号</h3>${accountsTable}`:''}
  ${record.id?`<footer><a href="新建供应商主体.html?id=${encodeURIComponent(record.id)}">编辑供应商主体</a></footer>`:''}`;
  document.body.append(drawer);drawer.addEventListener('close',()=>drawer.remove(),{once:true});
  drawer.querySelector('button').onclick=()=>drawer.close();drawer.showModal();
 }
 return {openName,openSubject};
})();
