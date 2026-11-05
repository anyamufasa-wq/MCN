var SupplierCooperation = (() => {
 const subjectsKey='xmfx-supplier-subjects-v1', namesKey='xmfx-supplier-names-v1';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const types=['MCN','达人','媒体供应商','其他'];
 const businessOptions=['达人广告','效果广告','品牌广告','物业社群','物业零售','素材','账号','MCN','其他'];
 const employees=[{id:'E001',name:'林晓',department:'采购部'},{id:'E002',name:'周宁',department:'采购部'},{id:'E003',name:'陈嘉',department:'客户部'},{id:'E004',name:'许宁',department:'客户部'},{id:'E005',name:'陆言',department:'商务部'}];
 const availableTypes=business=>business.includes('达人广告')?types:types.slice(2);
 const seededNames=[
  ['mcn:0','星澜传媒','MCN'],['mcn:1','青禾内容','MCN'],['mcn:2','云栖文化','MCN'],
  ['person:0','小满文化','达人'],['person:1','一禾工作室','达人'],['person:2','阿沐工作室','达人'],
  ['media:0','巨量星图','媒体供应商'],['other:0','通用服务供应商','其他']
 ].map(([id,name,type],index)=>({id,name,type,businessTypes:['达人广告'],liaisonIds:[['E001'],['E002'],['E001']][index]||[]}));
 function names(){
  const saved=read(namesKey,[]),byId=new Map(seededNames.map(item=>[item.id,item]));
  for(const item of saved)if(item.deleted)byId.delete(item.id);else byId.set(item.id,item);
  return [...byId.values()];
 }
 const nameRecord=id=>names().find(item=>item.id===id);
 const subjects=()=>read(subjectsKey,[]);
 const subjectsFor=id=>subjects().filter(subject=>subject.supplierNameId===id);
 const hasSubjects=id=>seededNames.some(item=>item.id===id&&['MCN','达人'].includes(item.type))||subjectsFor(id).length>0;
 function saveName(record){
  const name=record.name.trim(),existing=nameRecord(record.id);
  if(!name||!types.includes(record.type)||!record.businessTypes.length)throw Error('请填写供应商名称、供应商类型和业务类型');
  if(names().some(item=>item.id!==record.id&&item.name.trim().normalize('NFKC').toLowerCase()===name.normalize('NFKC').toLowerCase()))throw Error('供应商名称已存在');
  if(existing&&hasSubjects(existing.id)&&(existing.type!==record.type||existing.businessTypes.some(type=>!record.businessTypes.includes(type))))throw Error('已关联主体，不能修改供应商类型或减少业务类型');
  const updated={...existing,...record,name,id:record.id||'SN-'+crypto.randomUUID()};
  write(namesKey,[...read(namesKey,[]).filter(item=>item.id!==updated.id),updated]);
  return updated;
 }
 function deleteName(id){
  if(hasSubjects(id))throw Error('已关联主体，不能删除供应商名称');
  write(namesKey,[...read(namesKey,[]).filter(item=>item.id!==id),{id,deleted:true}]);
 }
 const accountDays=id=>{
  const legacy=id.startsWith('mcn:')?id.slice(4):null;
  return read('xmfx-supplier-account:'+id,null) ??
   (legacy===null?null:read('xmfx-mcn-v1-policy:'+legacy,{}).account ?? read('xmfx-mcn-annual:'+legacy,{}).account ?? 30);
 };
 const saveAccount=(id,days)=>write('xmfx-supplier-account:'+id,days);
 const mediaLabels={'星图':'抖音-星图','聚星':'快手-聚星','蒲公英':'小红书-蒲公英','花火':'b站-花火','视频号互选':'广点通-互选','公众号互选':'广点通-互选','微任务':'微博-微任务'};
 function verticals(supplier,accounts){
  const aliases={'美妆个护':'美妆','时尚穿搭':'时尚','家居生活':'家居'};
  const configured=supplier.verticals??supplier.vertical;
  const values=configured?(Array.isArray(configured)?configured:[configured]):accounts.flatMap(t=>t.vertical?[t.vertical]:(t.industries||[]));
  return [...new Set(values.flatMap(value=>value.split(/[·、,，/]/)).map(value=>value.trim()).filter(Boolean).map(value=>aliases[value]||value))];
 }
 return {types,businessOptions,employees,availableTypes,names,nameRecord,saveName,deleteName,hasSubjects,subjects,subjectsFor,accountDays,saveAccount,mediaLabels,verticals};
})();
