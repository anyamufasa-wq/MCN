var SupplierCooperation = (() => {
 const subjectsKey='xmfx-supplier-subjects-v1', namesKey='xmfx-supplier-names-v1';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const types=['MCN','达人','媒体供应商','其他'];
 const availableTypes=business=>business.includes('达人广告')?types:types.slice(2);
 const seededNames=[
  ['mcn:0','星澜传媒','MCN'],['mcn:1','青禾内容','MCN'],['mcn:2','云栖文化','MCN'],
  ['person:0','小满文化','达人'],['person:1','一禾工作室','达人'],['person:2','阿沐工作室','达人'],
  ['media:0','巨量星图','媒体供应商'],['other:0','通用服务供应商','其他']
 ].map(([id,name,type])=>({id,name,type,businessTypes:['达人广告']}));
 const names=()=>[...seededNames,...read(namesKey,[])];
 const createName=record=>write(namesKey,[...read(namesKey,[]),record]);
 const subjects=()=>read(subjectsKey,[]);
 const subjectsFor=id=>subjects().filter(subject=>subject.supplierNameId===id);
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
 return {availableTypes,names,createName,subjects,subjectsFor,accountDays,saveAccount,mediaLabels,verticals};
})();
