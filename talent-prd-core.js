/* Shared domain rules for the talent library prototype. */
var TalentPRD = (() => {
 const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}},write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const mediaName=t=>t.media==='广点通-互选'?(t.channel||'视频号'):({'抖音-星图':'抖音','快手-聚星':'快手','小红书-蒲公英':'小红书','b站-花火':'b站','微博-微任务':'微博'}[t.media]||t.media);
 const entered=t=>t.platformEntryStatus?t.platformEntryStatus==='已入驻':!t.isLocal&&t.scenario!=='incomplete';
 const employees=[{id:'E001',name:'林晓',department:'采购部'},{id:'E002',name:'周宁',department:'采购部'},{id:'E003',name:'陈嘉',department:'客户部'},{id:'E004',name:'许宁',department:'客户部'},{id:'E005',name:'陆言',department:'商务部'}];
 function mcnRate(id){const policy=read('xmfx-mcn-v1-policy:'+id);return policy?.rate??(typeof annualMCN==='function'?annualMCN(id).rate:.04);}
 function suppliers(){
  const mcn=mcns.map((m,id)=>({id:'mcn:'+id,name:m.name,isMcn:true,isTalent:false,mcn:id,subjects:m.subjects.map((name,i)=>({id:'mcn:'+id+':'+i,name,type:'public'})),rate:mcnRate(id)}));
  const people=[{id:'person:0',name:'小满文化',isTalent:true,subjects:[{id:'person:0:0',name:'小满（杭州）文化传媒有限公司',type:'public'},{id:'person:0:1',name:'林女士',type:'private'}]},{id:'person:1',name:'一禾工作室',isTalent:true,subjects:[{id:'person:1:0',name:'一禾文化传媒有限公司',type:'public'},{id:'person:1:1',name:'一禾',type:'private'}]},{id:'person:2',name:'阿沐工作室',isTalent:true,subjects:[{id:'person:2:0',name:'阿沐文化传播有限公司',type:'public'},{id:'person:2:1',name:'阿沐',type:'private'}]}];
  return [...mcn,...people];
 }
 function owner(t){
  const stored=read('xmfx-list-owner:'+t.id);if(stored)return stored;
  if(t.ownerSupplier)return t.ownerSupplier;
  if(t.cooperatingTalent||t.publicSubject||t.privateSubject)return {id:'person:'+t.id,name:t.cooperatingTalent||t.publicSubject||t.privateSubject,subjects:[{name:t.publicSubject||t.privateSubject||t.cooperatingTalent}],rate:t.ownerRate??null};
  if(!t.isLocal&&t.talentType==='野生达人'){const p=suppliers().filter(s=>s.isTalent)[t.index===7?1:2];return {...p,rate:.06};}
  return null;
 }
 function agencies(t){const records=typeof talentAgencies==='function'?talentAgencies(t):[];const out=[...records];if(t.currentMcn!=null&&!out.some(r=>r.mcn===t.currentMcn))out.unshift({mcn:t.currentMcn,rate:null});return out.sort((a,b)=>(a.mcn===t.currentMcn?-1:0)-(b.mcn===t.currentMcn?-1:0));}
 const types=t=>[...(owner(t)?['野生达人']:[]),...(agencies(t).length||t.currentMcnName?['机构达人']:[])];
 function affiliations(t){
  const own=owner(t),result=[];
  if(own){const subjects=own.subjects?.length?own.subjects:[{name:own.name}];for(const subject of subjects)result.push({supplierId:own.id,subjectId:subject.id||subject.name,name:subject.name,supplierName:own.name,type:'达人',baseRate:null,rate:own.rate??null,url:'mcn-talents-detail.html?supplier='+encodeURIComponent(own.id)+'&type=talent'});}
  for(const r of agencies(t)){const m=mcns[r.mcn],base=mcnRate(r.mcn);result.push({supplierId:'mcn:'+r.mcn,subjectId:r.subjectId||'mcn:'+r.mcn+':0',name:r.subjectName||m.subjects[0],supplierName:m.name,type:r.mcn===t.currentMcn?'平台MCN':'MCN',baseRate:base,rate:r.rate??base,url:'mcn-talents-detail.html?mcn='+r.mcn,mcn:r.mcn});}
  if(t.currentMcn==null&&t.currentMcnName&&!result.some(r=>r.type==='平台MCN'))result.splice(own?own.subjects?.length||1:0,0,{name:t.currentMcnName,type:'平台MCN',baseRate:null,rate:null,url:null});
  return result;
 }
 function identities(t){
  const acc=t.accountId||'',number=t.accountNumber||t.mediaAccount||acc,platform=t.platformId||'';let ids=[];
  switch(mediaName(t)){
   case '抖音':ids=[...(entered(t)?[['星图ID',platform]]:[]),['抖音号',number],['抖音ID',acc]];break;
   case '快手':ids=[['达人ID',acc],['快手号',number]];break;
   case '小红书':ids=[...(entered(t)?[['蒲公英ID',platform]]:[]),['小红书号',number],['小红书ID',acc]];break;
   case 'b站':ids=[['B站UID',acc]];break;case '视频号':ids=[['视频号ID',acc]];break;
   case '公众号':ids=[['公众号',t.publicAccount||number],['公众号ID',acc],['关联视频号',t.linkedVideoAccountName||''],['视频号ID',t.linkedVideoAccountId||'']];break;
   default:ids=[['微博UID',acc]];
  }return ids;
 }
 const metricFields=t=>({'抖音':[['CPM','cpm'],['CPE','cpe']],'b站':[['CPM','cpm']],'视频号':[['预期CPM','cpm'],['预期CPE','cpe']],'微博':[['直发CPM','cpm'],['直发CPE','cpe']]}[mediaName(t)]||[]);
 const orders=t=>typeof allOrders==='function'&&typeof talent!=='undefined'&&talent.id===t.id?allOrders():typeof ownOrders==='function'?ownOrders(t):commercialOrders.filter(o=>o.talentId===t.id);
 const inDays=(date,days=180)=>{const d=new Date(date),end=new Date(),start=new Date(end);start.setDate(start.getDate()-days);return d>=start&&d<=end;};
 const completed=o=>['执行完成','已完成'].includes(o.status);
 function submissionEvents(t){
  const inquiry=Object.entries(read('xmfx-project-inquiry-prototype',{})).flatMap(([projectId,items])=>items.filter(i=>i.talentId===t.id).map(i=>({id:i.eventId||[projectId,i.roundId,i.sheetId,t.id].join(':'),createdAt:i.submittedAt||i.createdAt,projectId,stage:i.stage||'询号中',...i})));
  const seen=new Set();const events=[...(t.submissionEvents||[]),...inquiry,...orders(t).filter(o=>!o.fromInquiry||o.manuallyAdded).map(o=>({id:o.id,createdAt:o.createdAt}))];
  return events.filter(e=>!seen.has(e.id)&&seen.add(e.id));
 }
 function metrics(t,days=180){const rows=orders(t).filter(o=>inDays(o.createdAt,days)),submitted=submissionEvents(t).filter(e=>inDays(e.createdAt,days)).length,total=rows.length,finished=rows.filter(completed).length;return {submitted,total,completed:finished,cooperationRate:submitted?total/submitted:null,completionRate:total?finished/total:null};}
 const categories={'通信':['电信运营商'],'家居建材':['家装主材','家具','家居百货','床上用品'],'金融业':['保险业'],'出行旅游':[],'餐饮服务':[],'工具类软件':['软件工具','实用工具','AI工具','其他工具类软件'],'游戏':['休闲游戏','角色扮演','其他游戏','SLG','模拟经营','卡牌游戏'],'零售':['综合类2C电商','其他零售'],'汽车':['汽车厂商','汽车后市场'],'社交通讯':['交友类社交通讯'],'医疗健康':['医疗器械','药品','保健品-跨境'],'商务服务':['广告服务','人力资源服务'],'传媒咨询':[],'本地服务':['生活服务综合平台'],'美妆':['彩妆/香水/美妆工具','美容/个护仪器','美容护肤'],'滋补保健':['保健食品/膳食营养补充食品'],'个护家清':['洗护清洁剂/卫生巾/纸/香薰'],'母婴宠物':['奶粉/辅食/营养品/零食','宠物/宠物食品及用品'],'智能家居':['家居饰品'],'3C数码家电':['3C数码配件'],'酒类':[],'食品饮料':['咖啡/麦片/冲饮','零食/坚果/特产','果汁/牛奶等其他饮品','粮油米面/南北干货/调味品'],'运动户外':[],'服饰内衣':[],'珠宝文玩':[],'钟表配饰':[]};
 const brandCategories={'澄露':['美妆/美容护肤','美妆/彩妆/香水/美妆工具'],'轻研':['个护家清/洗护清洁剂/卫生巾/纸/香薰'],'森序生活':['家居建材/家具','智能家居/家居饰品'],'拾光衣橱':['服饰内衣'],'初野':['食品饮料/零食/坚果/特产']};
 function brandHistory(t,days=0){const found=new Map();orders(t).filter(o=>completed(o)&&(!days||inDays(o.createdAt,days))).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).forEach(o=>{if(!o.brand)return;const cats=o.categories||brandCategories[o.brand]||[o.category||'其他'];if(!found.has(o.brand))found.set(o.brand,{name:o.brand,categories:[],date:o.createdAt});const b=found.get(o.brand);b.categories=[...new Set([...b.categories,...cats])];});return [...found.values()];}
 function tagSources(t){const v=t.vertical,name=mediaName(t),kind=v==='美妆个护'?0:v==='时尚穿搭'?1:v==='家居生活'?2:-1,platform={'抖音':[['时尚','个人管理'],['时尚'],['居家','随拍']],'快手':[['美妆'],['时尚'],['房产家居','生活']],'小红书':[['美妆','护肤','个人护理'],['时尚','生活记录'],['家居家装','生活记录']],'b站':[['美妆个护'],['服饰穿搭'],['家居房产','生活日常']],'视频号':[['美妆','护肤'],['时尚'],['生活','VLOG']],'公众号':[['护肤彩妆'],['服饰鞋帽箱包'],['房产家居','日用百货','生活服务']],'微博':[['美妆'],['时尚'],['房产家居','情感生活']]}[name]?.[kind]||[v],internal=[['护肤','彩妆','成分测评','好物分享','日常生活'],['日常穿搭','通勤穿搭','服饰测评','生活方式'],['家居收纳','家居好物','生活记录','家装设计']][kind]||[];return {platform:[...new Set((t.industries||platform).filter(Boolean))],internal:[...new Set((t.contentTags||(t.isLocal?[]:internal)).filter(Boolean))]};}
 const tags=t=>{const source=tagSources(t);return [...new Set([...source.platform,...source.internal])];};
 function matchHistory(t,v){const brands=brandHistory(t,Number(v.historyPeriod)||0),cat=(v.historyCategory||'').split('|').filter(Boolean),wanted=(v.brand||v.historyBrands||'').split('|').filter(Boolean);return (!v.historyPeriod||brands.length>0)&&(!cat.length||brands.some(b=>b.categories.some(c=>cat.some(x=>c===x||c.startsWith(x+'/')))))&&(!wanted.length||brands.some(b=>wanted.includes(b.name)));}
 const score=(t,v)=>{const selected=(v.vertical||'').split('|').filter(Boolean);const history=brandHistory(t,Number(v.historyPeriod)||0),cats=(v.historyCategory||'').split('|').filter(Boolean);return tags(t).filter(tag=>selected.some(v=>tag.includes(v))).length+cats.filter(c=>history.some(b=>b.categories.some(v=>v===c||v.startsWith(c+'/')))).length;};
 function mergeNonempty(target,incoming){for(const [key,value]of Object.entries(incoming))if(value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.length))target[key]=value;return target;}
 const phoneValid=value=>!value||/^1[3-9]\d{9}$/.test(value);
 const rateValid=value=>value!==''&&value!==null&&value!==undefined&&Number.isFinite(Number(value))&&Number(value)>=0&&Number(value)<=100&&/^\d+(\.\d{1,2})?$/.test(String(value));
 function extractedContacts(bio){const text=String(bio||'');return {phone:text.match(/(?:\+86[- ]?)?(1[3-9]\d{9})/)?.[1]||'',wechat:text.match(/(?:微信|wechat|wx|v信)\s*[:：号]?\s*([a-zA-Z][\w-]{5,29})/i)?.[1]||''};}
 function applyPlatformUpdate(t,incoming){const allowed=['avatar','avatarUrl','name','region','province','city','gender','phone','wechat','contact','accountId','accountNumber','platformId','homepage','fans','cpm','cpe','bio'];return mergeNonempty(t,Object.fromEntries(Object.entries(incoming).filter(([key])=>allowed.includes(key))));}
 function hydrate(t){const p=read('xmfx-list-profile:'+t.id,{}),extracted=extractedContacts(t.bio);for(const key of ['phone','wechat'])if(!Object.hasOwn(p,key)&&!t[key]&&extracted[key])t[key]=extracted[key];Object.assign(t,p);if(!t.gender&&!t.isLocal&&/^T\d+-\d+$/.test(t.id))t.gender=['女','男','女','男','女','男','女','女','男','男','女','女'][t.index%12];if(!t.liaisons)t.liaisons=String(t.liaison||(!t.isLocal?mcns[t.originMcn]?.owner:'林晓')||'林晓').split(/[、,，]/);if(!t.creator)t.creator=t.isLocal?'林晓':mcns[t.originMcn]?.owner||'林晓';return t;}
 function notices(t){const inquiry=Object.entries(read('xmfx-project-inquiry-prototype',{})).filter(([,items])=>items.some(i=>i.talentId===t.id&&['返点已确认','询号完成','待生成采购单'].includes(i.stage)&&!i.purchaseOrderId)).map(([id])=>id),self=[...new Set(orders(t).filter(o=>o.operationMode==='自运'&&!o.acceptedAt&&o.status!=='已验收').map(o=>o.projectId||o.projectName).filter(Boolean))];return ['达人信息已提交审核',...(inquiry.length?['达人在项目['+inquiry.join('、')+']的询号流程中，此处返点不会影响询号返点，如需修改，请前往项目处修改']:[]),...(self.length?['达人在项目['+self.join('、')+']的自运采购单中存在未验收商单，此处返点不影响原商单返点，如需修改，请前往项目处修改']:[])];}
 return {read,write,mediaName,entered,employees,mcnRate,suppliers,owner,agencies,types,affiliations,identities,metricFields,orders,inDays,completed,metrics,categories,brandCategories,brandHistory,tagSources,tags,matchHistory,score,mergeNonempty,phoneValid,rateValid,hydrate,extractedContacts,applyPlatformUpdate,notices};
})();
