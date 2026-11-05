(() => {
 const rows=document.getElementById('names'),status=document.getElementById('nameStatus');
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function draw(){
  rows.innerHTML=SupplierCooperation.names().map(item=>{
   const liaisons=SupplierCooperation.employees.filter(employee=>item.liaisonIds?.includes(employee.id)).map(employee=>employee.name);
   const linked=SupplierCooperation.hasSubjects(item.id);
   return `<tr><td>${esc(item.name)}</td><td>${esc(item.type)}</td><td>${esc(item.businessTypes.join('、'))}</td><td>${esc(liaisons.join('、')||'—')}</td>
   <td><button type="button" data-edit="${esc(item.id)}">编辑</button><button type="button" data-delete="${esc(item.id)}" ${linked?'disabled title="已关联主体"':''}>删除</button></td></tr>`;
  }).join('')||'<tr><td colspan="5">暂无供应商名称</td></tr>';
 }
 document.getElementById('createName').onclick=()=>SupplierCooperationUI.openName({onSave:draw});
 rows.onclick=event=>{
  const edit=event.target.closest('[data-edit]'),remove=event.target.closest('[data-delete]');
  if(edit)SupplierCooperationUI.openName({record:SupplierCooperation.nameRecord(edit.dataset.edit),onSave:draw});
  if(remove&&confirm('确认删除该供应商名称？')){
   try{SupplierCooperation.deleteName(remove.dataset.delete);status.textContent='已删除';draw();}
   catch(error){status.textContent=error.message;}
  }
 };
 draw();
})();
