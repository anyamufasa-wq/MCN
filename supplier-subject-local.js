(() => {
 const form=document.querySelector('.n-form-page__content form');
 if(!form)return;
 form.querySelectorAll('.el-form-item__error').forEach(error=>error.remove());
 form.querySelectorAll('.el-form-item.is-error,.el-form-item.is-success').forEach(item=>item.classList.remove('is-error','is-success'));
 const byLabel=label=>[...form.querySelectorAll('.el-form-item')].find(item=>item.querySelector('.el-form-item__label')?.textContent.trim()===label);
 const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const storageKey='xmfx-supplier-subjects-v1';
 const read=SupplierCooperation.subjects;
 let editingId=new URLSearchParams(location.search).get('id');
 let accounts=[],profiles={},attachments={};

 function addNavigation(){
  const supplierLinks=[['供应商主体','新建供应商主体.html'],['供应商名称','supplier-names.html'],['MCN与达人','mcn-talents-list.html']];
  const businessLinks=[['达人库','talent-list.html'],['野生达人','wild-talent-list.html'],['新建达人','talent-create.html']];
  const header=document.querySelector('.rr-header');
  for(const item of header.querySelectorAll('li.el-menu-item')){
   const name=item.textContent.trim();
   if(name==='首页')item.innerHTML='<a class="supplier-nav-link" href="mcn-talents-list.html">首页</a>';
   const links=name==='合作方中心'?supplierLinks:name==='业务中心'?businessLinks:null;
   if(links)item.innerHTML=`<details class="supplier-nav-menu"><summary>${name} ▾</summary><div>${links.map(([label,url])=>`<a href="${url}">${label}</a>`).join('')}</div></details>`;
  }
  const subject=[...document.querySelectorAll('.rr-sidebar li.el-menu-item')].find(item=>item.textContent.trim()==='供应商主体');
  if(subject){
   subject.classList.add('is-active');
   subject.innerHTML='<a class="supplier-nav-link" href="新建供应商主体.html" aria-current="page">供应商主体</a>';
   const existingName=[...subject.parentElement.children].find(item=>item.textContent.trim()==='供应商名称');
   if(existingName)existingName.innerHTML='<a class="supplier-nav-link" href="supplier-names.html">供应商名称</a>';
   for(const [label,url] of supplierLinks.slice(existingName?2:1)){
    const item=document.createElement('li');item.className='el-menu-item';item.innerHTML=`<a class="supplier-nav-link" href="${url}">${label}</a>`;subject.parentElement.append(item);
   }
  }
  document.querySelectorAll('.rr-sidebar .el-sub-menu').forEach(item=>{
   const title=item.querySelector('.el-sub-menu__title'),menu=item.querySelector('ul');
   if(!title||!menu)return;
   const toggle=()=>{const open=item.classList.toggle('is-opened');menu.style.display=open?'':'none';title.setAttribute('aria-expanded',String(open));};
   title.tabIndex=0;title.setAttribute('role','button');title.setAttribute('aria-expanded',String(item.classList.contains('is-opened')));
   title.onclick=toggle;title.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();}};
  });
 }
 addNavigation();

 function multiChoice(label,name,choices){
  const host=byLabel(label).querySelector('.el-select');
  const defaults=[...host.querySelectorAll('.el-select__tags-text')].map(item=>item.textContent.trim());
  const details=document.createElement('details');details.className='supplier-multi';
  details.innerHTML=`<summary></summary><div class="supplier-choices">${choices.map(option=>`<label><input type="checkbox" name="${name}" value="${escape(option)}" ${defaults.includes(option)?'checked':''}>${escape(option)}</label>`).join('')}</div>`;
  host.replaceWith(details);
  const update=()=>{const values=[...details.querySelectorAll('input:checked')].map(input=>input.value);details.querySelector('summary').textContent=values.join('、')||'请选择'+label;};
  details.addEventListener('change',update);update();
  return update;
 }
 const updateBusiness=multiChoice('业务类型','businessTypes',SupplierCooperation.businessOptions);
 const updateMedia=multiChoice('媒体平台','media',Object.keys(SupplierCooperation.mediaLabels));
 const talentSelect=document.createElement('select');talentSelect.name='talentType';talentSelect.className='supplier-input';
 talentSelect.innerHTML='<option value="">请选择达人类型</option><option>野生达人</option><option>机构达人</option>';
 byLabel('达人类型').querySelector('.el-select').replaceWith(talentSelect);
 const textFields={'主体名称':'name','注册地址':'address','联系人':'contact','邮寄地址':'mailAddress','联系电话':'phone','邮箱':'email','备注':'note'};
 for(const [label,name] of Object.entries(textFields)){const input=byLabel(label).querySelector('input');input.name=name;}
 form.elements.name.required=true;form.elements.name.maxLength=50;
 form.elements.email.type='email';form.elements.phone.type='tel';
 for(const [label,name] of [['主体类型','entityType'],['发票类型','invoices']]){
  byLabel(label).querySelectorAll('input').forEach(input=>{
   input.name=name;
   input.value=input.closest('label').querySelector('.radio-title,.el-checkbox__label')?.textContent.trim()||input.value;
  });
 }
 const publicPayment=form.querySelector('[name=entityType][value="公付"]');
 publicPayment.checked=true;
 publicPayment.closest('label').parentElement.prepend(publicPayment.closest('label'));
 form.classList.add('supplier-subject-form');
 const column=item=>item.closest('.n-form-item')||item;
 const invoiceField=byLabel('发票类型'),licenseField=byLabel('营业执照'),identityField=byLabel('身份证头像面');
 const identityColumn=column(identityField);
 licenseField.after(identityField);if(identityColumn!==identityField)identityColumn.remove();
 const mediaField=byLabel('媒体平台'),talentField=byLabel('达人类型');
 const typeField=byLabel('是否为媒体供应商');
 const supplierFields=document.createElement('div');
 supplierFields.className='supplier-cooperation-fields';
 supplierFields.innerHTML=`<fieldset><legend>供应商类型 <span aria-hidden="true">*</span></legend><div class="supplier-choices" data-supplier-types></div></fieldset>
 <div class="supplier-name-field"><label for="supplierName">供应商名称</label><div><select id="supplierName" name="supplierNameId" class="supplier-input"></select><button type="button" class="el-button" id="createSupplierName">快速创建供应商名称</button></div></div>
 <label class="supplier-cycle">账期（天）<input name="accountDays" class="supplier-input" type="number" min="0" step="1"></label>`;
 column(byLabel('业务类型')).after(supplierFields);
 column(typeField).remove();column(byLabel('是否为MCN机构')).remove();
 const typeOptions=supplierFields.querySelector('[data-supplier-types]'),nameSelect=form.elements.supplierNameId,cycle=form.elements.accountDays;
 const businessTypes=()=>new FormData(form).getAll('businessTypes');
 const supplierType=()=>form.elements.supplierType?.value||'';
 const hasCooperation=()=>['MCN','达人'].includes(supplierType());
 function drawTypes(type){
  const allowed=SupplierCooperation.availableTypes(businessTypes());
  typeOptions.innerHTML=allowed.map(value=>`<label><input type="radio" name="supplierType" value="${value}" required ${value===type?'checked':''}>${value}</label>`).join('');
 }
 function drawNames(selected=''){
  const type=supplierType();
  nameSelect.innerHTML='<option value="">请选择供应商名称</option>'+SupplierCooperation.names()
   .filter(name=>!type||name.type===type)
   .map(name=>`<option value="${escape(name.id)}">${escape(name.name)}</option>`).join('');
  nameSelect.value=[...nameSelect.options].some(option=>option.value===selected)?selected:'';
 }
 function syncCycle(){
  const days=SupplierCooperation.accountDays(nameSelect.value);
  cycle.value=days??'';cycle.readOnly=days!==null;
 }
 drawTypes('其他');drawNames();
 nameSelect.onchange=()=>{
  const selected=SupplierCooperation.names().find(name=>name.id===nameSelect.value);
  if(selected&&!supplierType()){
   if(!SupplierCooperation.availableTypes(businessTypes()).includes(selected.type)){
    form.querySelector('[name=businessTypes][value="达人广告"]').checked=true;updateBusiness();
   }
   drawTypes(selected.type);drawNames(selected.id);
  }
  syncCycle();syncFields();
 };
 supplierFields.querySelector('#createSupplierName').onclick=()=>SupplierCooperationUI.openName({
  record:{name:form.elements.entityType.value==='私付'?form.elements.name.value:'',businessTypes:businessTypes(),type:supplierType()||'其他'},
  types:SupplierCooperation.availableTypes(businessTypes()),
  onSave(record){drawTypes(record.type);drawNames(record.id);syncCycle();syncFields();}
 });
 const profileHost=document.createElement('div');profileHost.className='supplier-platforms';
 column(form.querySelector('.mcn-platform-form-item')).remove();
 supplierFields.after(column(mediaField),column(talentField),profileHost);
 const selectedMedia=()=>new FormData(form).getAll('media');
 let activeMedia='';
 function drawProfiles(){
  const mediaOptions=hasCooperation()?selectedMedia():[],isMcn=supplierType()==='MCN';
  if(!mediaOptions.includes(activeMedia))activeMedia=mediaOptions[0]||'';
  profileHost.hidden=!mediaOptions.length;
  const tabs=isMcn&&mediaOptions.length?`<div class="supplier-media-tabs" role="group" aria-label="媒体平台">${mediaOptions.map(media=>`<button type="button" class="el-button" data-profile-tab="${escape(media)}" aria-pressed="${media===activeMedia}">${escape(media)}</button>`).join('')}</div>`:'';
  profileHost.innerHTML=tabs+(isMcn?mediaOptions.filter(media=>media===activeMedia):mediaOptions).map(media=>{
   const profile=profiles[media]||{};
   const institution=supplierType()==='MCN'? `<label>机构名称 / ID<input class="supplier-input" data-profile-field="identifier" value="${escape(profile.identifier)}"></label>`:'';
   const query=institution?`<p class="supplier-platform-hint">填写机构名称/ID并查询后，达人库将自动更新机构下达人信息</p><button class="el-button" type="button" data-query-platform>查询</button> <span role="status">${escape(profile.queryMessage)}</span><details class="supplier-id-help"><summary>如何获取机构ID</summary><p>登录${escape(media)}，在机构后台的机构资料页查看机构 ID。</p></details>`:'';
   return `<div class="supplier-platform-card" data-platform="${escape(media)}"><strong>${escape(media)}</strong><div class="supplier-field-grid">${institution}<label>返点政策（%）<input class="supplier-input" data-profile-field="rate" type="number" min="0" max="100" step="0.01" required value="${escape(profile.rate)}"></label></div>${query}</div>`;
  }).join('');
 }
 profileHost.addEventListener('input',e=>{
  const key=e.target.dataset.profileField;if(!key)return;
  const card=e.target.closest('[data-platform]'),media=card.dataset.platform,profile=profiles[media]??={};
  profile[key]=e.target.value;
  if(key==='identifier'){delete profile.platformSupplierId;delete profile.queryMessage;card.querySelector('[role=status]').textContent='';}
 });
 profileHost.addEventListener('click',e=>{
  const tab=e.target.closest('[data-profile-tab]');
  if(tab){activeMedia=tab.dataset.profileTab;drawProfiles();profileHost.querySelector('[aria-pressed=true]')?.focus();return;}
  const button=e.target.closest('[data-query-platform]');if(!button)return;
  const card=button.closest('[data-platform]'),media=card.dataset.platform,query=String(profiles[media]?.identifier||'').trim();
  const records=read().filter(record=>record.media?.includes(media));
  const match=records.find(record=>record.id===query||record.name===query||record.profiles?.[media]?.identifier===query);
  const example=SupplierCooperation.names().find(name=>name.type==='MCN'&&name.id.startsWith('mcn:')&&(name.name===query||name.id===query));
  const profile=profiles[media]??={};
  profile.platformSupplierId=example?.id||match?.profiles?.[media]?.platformSupplierId;
  profile.queryMessage=!query?'请输入机构名称或 ID':example?'已匹配示例机构：'+example.name:match?'找到本地主体：'+match.name:'本地未找到匹配机构';
  card.querySelector('[role=status]').textContent=profile.queryMessage;
 });

 const switchField=byLabel('添加收付款账户'),accountSwitch=switchField.querySelector('input');
 accountSwitch.name='withAccounts';accountSwitch.checked=accountSwitch.getAttribute('aria-checked')==='true';accountSwitch.disabled=false;accountSwitch.removeAttribute('aria-disabled');
 const switchControl=accountSwitch.closest('.el-switch');switchControl.classList.remove('is-disabled');
 switchControl.querySelector('.el-switch__core').onclick=()=>accountSwitch.click();
 const accountGroup=form.querySelector('.n-table2'),accountTable=accountGroup.querySelector('.el-table');
 const addAccount=[...accountGroup.querySelectorAll('button')].find(b=>b.textContent.trim()==='新增收付款账户');
 const accountHost=document.createElement('div');accountTable.replaceWith(accountHost);
 const accountDialog=document.createElement('dialog');accountDialog.className='supplier-account-dialog';document.body.append(accountDialog);
 function drawAccounts(){
  accountGroup.hidden=!accountSwitch.checked;
  switchControl.classList.toggle('is-checked',accountSwitch.checked);
  accountSwitch.setAttribute('aria-checked',String(accountSwitch.checked));
  accountHost.innerHTML=`<table class="supplier-account-table"><thead><tr><th>收付款渠道</th><th>货币</th><th>开户银行</th><th>银行账号</th><th>操作</th></tr></thead><tbody>${accounts.map((account,i)=>`<tr><td>${escape(account.channel)}</td><td>${escape(account.currency)}</td><td>${escape(account.bank||'—')}</td><td>${escape(account.number)}</td><td><button type="button" data-edit-account="${i}">编辑</button><button type="button" data-delete-account="${i}">删除</button></td></tr>`).join('')||'<tr><td colspan="5">暂无数据</td></tr>'}</tbody></table>`;
 }
 function editAccount(index){
  const account=accounts[index]||{};
  accountDialog.innerHTML=`<form><h3>${account.number?'编辑':'新增'}收付款账户</h3><div class="supplier-field-grid"><label>收付款渠道<select name="channel" class="supplier-input"><option>银行转账</option><option>支付宝</option><option>微信</option></select></label><label>货币<select name="currency" class="supplier-input"><option>CNY</option><option>USD</option><option>HKD</option></select></label><label>开户银行<input class="supplier-input" name="bank" value="${escape(account.bank)}"></label><label>银行账号<input class="supplier-input" name="number" required value="${escape(account.number)}"></label></div><div class="supplier-dialog-actions"><button class="el-button" type="button">取消</button><button class="el-button el-button--primary" type="submit">确认</button></div></form>`;
  const editor=accountDialog.querySelector('form');editor.elements.channel.value=account.channel||'银行转账';editor.elements.currency.value=account.currency||'CNY';
  editor.querySelector('[type=button]').onclick=()=>accountDialog.close();
  editor.onsubmit=e=>{e.preventDefault();const next=Object.fromEntries(new FormData(editor));if(index===undefined)accounts.push(next);else accounts[index]=next;accountDialog.close();drawAccounts();};
  accountDialog.showModal();
 }
 addAccount.type='button';addAccount.onclick=()=>editAccount();
 accountHost.addEventListener('click',e=>{
  const edit=e.target.closest('[data-edit-account]'),remove=e.target.closest('[data-delete-account]');
  if(edit)editAccount(Number(edit.dataset.editAccount));
  if(remove){accounts.splice(Number(remove.dataset.deleteAccount),1);drawAccounts();}
 });

 const attachmentLabels=['营业执照','身份证头像面'];
 for(const label of attachmentLabels){
  const field=byLabel(label),input=field.querySelector('input[type=file]'),trigger=input.closest('.el-upload');
  input.accept='.jpg,.jpeg,.png';
  const feedback=document.createElement('span');feedback.className='supplier-file-name';feedback.setAttribute('role','status');field.querySelector('.el-form-item__content').append(feedback);
  trigger.tabIndex=0;trigger.setAttribute('role','button');trigger.onclick=e=>{if(e.target!==input)input.click();};
  trigger.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();input.click();}};
  input.onchange=()=>{const file=input.files[0];if(!file)return;if(file.size>5*1024*1024||!/\.(jpe?g|png)$/i.test(file.name)){input.value='';feedback.textContent='请选择不超过 5 MB 的 JPG 或 PNG 图片';return;}attachments[label]=file.name;feedback.textContent=file.name;};
 }
 function syncFields(){
  const type=supplierType();
  column(mediaField).hidden=!hasCooperation()&&type!=='媒体供应商';
  column(talentField).hidden=type!=='达人';talentSelect.disabled=column(talentField).hidden;
  cycle.required=hasCooperation();cycle.closest('label').classList.toggle('required',cycle.required);
  const privatePayment=new FormData(form).get('entityType')==='私付';
  invoiceField.hidden=privatePayment;
  licenseField.hidden=privatePayment;
  identityField.hidden=!privatePayment;
  for(const input of form.querySelectorAll('input[type=radio],input[type=checkbox]')){
   input.closest('.el-radio,.el-checkbox')?.classList.toggle('is-checked',input.checked);
   input.closest('.el-radio__input,.el-checkbox__input')?.classList.toggle('is-checked',input.checked);
  }
  drawProfiles();drawAccounts();
 }
 form.addEventListener('change',e=>{
  const field=e.target.name;
  if(field==='businessTypes'){
   const type=supplierType(),next=SupplierCooperation.availableTypes(businessTypes()).includes(type)?type:'其他';
   drawTypes(next);drawNames(next===type?nameSelect.value:'');if(next!==type)syncCycle();
  }
  if(field==='supplierType'){drawNames();syncCycle();profiles={};}
  if(['businessTypes','supplierType','entityType','media','invoices','withAccounts'].includes(field))syncFields();
 });

 const footer=document.querySelector('.n-form-page__footer'),save=footer.querySelector('button');
 const status=document.createElement('span');status.className='supplier-save-status';status.setAttribute('role','status');footer.append(status);
 const historyPanel=document.createElement('section');historyPanel.className='supplier-saved';form.after(historyPanel);
 function drawSaved(){
  historyPanel.innerHTML=`<h3>已保存主体</h3><div>${read().map(record=>`<button class="el-button" type="button" data-supplier-record="${escape(record.id)}">${escape(record.name)}</button>`).join('')||'<span>暂无保存记录</span>'}</div>`;
 }
 function loadRecord(record){
  editingId=record.id;accounts=(record.accounts||[]).map(account=>({...account}));profiles=record.profiles||{};attachments=record.attachments||{};
  for(const name of Object.values(textFields))form.elements[name].value=record[name]||'';
  talentSelect.value=record.talentType||'';accountSwitch.checked=Boolean(record.withAccounts);
  for(const name of ['businessTypes','media','invoices','entityType'])for(const input of form.querySelectorAll(`[name="${name}"]`))input.checked=Array.isArray(record[name])?record[name].includes(input.value):record[name]===input.value;
  const type=record.supplierType||(record.mcn==='是'?'MCN':record.mediaSupplier==='是'?'媒体供应商':'其他');
  drawTypes(SupplierCooperation.availableTypes(businessTypes()).includes(type)?type:'其他');drawNames(record.supplierNameId);syncCycle();
  if(!cycle.value)cycle.value=record.accountDays??Object.values(profiles).find(profile=>profile.days!==undefined&&profile.days!=='')?.days??'';
  attachmentLabels.forEach(label=>{byLabel(label).querySelector('.supplier-file-name').textContent=attachments[label]||'';});
  updateBusiness();updateMedia();syncFields();status.textContent='正在编辑 '+record.name;
 }
 historyPanel.addEventListener('click',e=>{
  const button=e.target.closest('[data-supplier-record]'),record=button&&read().find(item=>item.id===button.dataset.supplierRecord);
  if(record)SupplierCooperationUI.openSubject({subject:{...record,recordId:record.id,type:record.entityType==='私付'?'private':'public',status:record.status||'正常'},supplierId:record.supplierNameId||''});
 });
 form.id='supplierSubjectForm';save.type='submit';save.setAttribute('form',form.id);
 form.onsubmit=e=>{
  e.preventDefault();const data=new FormData(form),name=String(data.get('name')||'').trim();
  if(!name||!data.getAll('businessTypes').length){status.textContent='请填写主体名称并选择业务类型';return;}
  if(hasCooperation()&&(!nameSelect.value||!selectedMedia().length||cycle.value==='')){status.textContent='请选择供应商名称和媒体平台，并填写账期';return;}
  const missing=hasCooperation()&&selectedMedia().find(media=>profiles[media]?.rate==null||profiles[media].rate===''||Number(profiles[media].rate)<0||Number(profiles[media].rate)>100);
  if(missing){activeMedia=missing;drawProfiles();status.textContent='请填写'+missing+'的返点政策';profileHost.querySelector('[data-profile-field=rate]')?.focus();return;}
  const {accountDays,...fields}=Object.fromEntries(data);
  const id=editingId||'SP-'+Date.now().toString(36),record={...fields,id,name,accountDays:hasCooperation()||accountDays===''?undefined:Number(accountDays),businessTypes:businessTypes(),media:column(mediaField).hidden?[]:selectedMedia(),invoices:data.get('entityType')==='公付'?data.getAll('invoices'):[],profiles:hasCooperation()?Object.fromEntries(selectedMedia().map(media=>[media,supplierType()==='MCN'?profiles[media]:{rate:profiles[media]?.rate}])):{},withAccounts:accountSwitch.checked,accounts:accountSwitch.checked?accounts:[],attachments};
  const records=read();
  if(record.supplierNameId&&records.some(item=>item.id!==id&&item.supplierNameId===record.supplierNameId&&item.name===name)){
   status.textContent='该供应商名称下已有同名主体，请打开已有主体编辑';return;
  }
  try{
   if(hasCooperation()&&SupplierCooperation.accountDays(nameSelect.value)===null)SupplierCooperation.saveAccount(nameSelect.value,Number(accountDays));
   const index=records.findIndex(item=>item.id===id);if(index<0)records.push(record);else records[index]=record;
   localStorage.setItem(storageKey,JSON.stringify(records));editingId=id;if(hasCooperation())syncCycle();
   status.textContent='已保存到本地';
   if(hasCooperation()){
    const detail=document.createElement('a');detail.className='supplier-save-status';detail.textContent='查看MCN与达人详情';
    detail.href='mcn-talents-detail.html?'+(nameSelect.value.startsWith('mcn:')?'mcn='+encodeURIComponent(nameSelect.value.slice(4)):'supplier='+encodeURIComponent(nameSelect.value));
    status.append(detail);
   }
   drawSaved();
  }catch{status.textContent='保存失败，请检查浏览器存储设置';}
 };
 const initial=read().find(record=>record.id===editingId);
 if(initial)loadRecord(initial);else{
  const supplier=SupplierCooperation.names().find(name=>name.id===new URLSearchParams(location.search).get('supplier'));
  if(supplier){
   for(const input of form.querySelectorAll('[name=businessTypes]'))input.checked=supplier.businessTypes.includes(input.value);
   updateBusiness();drawTypes(supplier.type);drawNames(supplier.id);syncCycle();
  }
  syncFields();
 }
 drawSaved();
})();
