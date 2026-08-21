import fs from 'node:fs';import vm from 'node:vm';import ts from 'typescript';import { createRequire } from 'node:module'
const nodeRequire=createRequire(import.meta.url);const cache=new Map();function load(file){const key=file.replaceAll('\\','/');if(cache.has(key))return cache.get(key).exports;const mod={exports:{}};cache.set(key,mod);const js=ts.transpileModule(fs.readFileSync(key,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const localRequire=request=>{if(request.startsWith('.')){let resolved=new URL(request,`file:///${key}`).pathname.slice(1).replaceAll('/','\\');if(!resolved.endsWith('.ts'))resolved+='.ts';return load(resolved)}return nodeRequire(request)};vm.runInNewContext(js,{module:mod,exports:mod.exports,require:localRequire,Date,console,Set,Map},{filename:key});return mod.exports}
const {generateChecklist,generateCategories,isHighSchoolSystemItemApplicable}=load('src/lib/checklistGenerator.ts');const base={militaryTraining:'no'};const scenarios=[
 ['A 本科新生·住校·异地',{...base,studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true},['录取通知书','床垫','短袖','牙刷'],['本科毕业证','查看通勤路线']],
 ['B 本科新生·住校·本地',{...base,studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:false},['录取通知书','床垫','牙刷'],['确认车票','行李箱']],
 ['C 本科新生·走读·本地',{...base,studentStatus:'new',educationStage:'undergraduate',accommodation:'commute',outOfTown:false},['录取通知书','查看通勤路线','手机','通勤水杯'],['床垫','牙刷','洗衣液','短袖','防晒']],
 ['D 本科新生·走读·异地',{...base,studentStatus:'new',educationStage:'undergraduate',accommodation:'commute',outOfTown:true},['录取通知书','床单','牙刷','短袖','查看通勤路线'],['床帘','宿舍入住登记','确认宿舍床铺尺寸']],
 ['E 研究生新生·住校·异地',{...base,studentStatus:'new',educationStage:'postgraduate',accommodation:'dorm',outOfTown:true},['本科毕业证','本科学位证','床垫'],['团员证','查看通勤路线']],
 ['F 研究生新生·走读·本地',{...base,studentStatus:'new',educationStage:'postgraduate',accommodation:'commute',outOfTown:false},['本科毕业证','查看研究生培养系统','查看通勤路线'],['床垫','洗发水','短袖']],
 ['G 研究生新生·走读·异地',{...base,studentStatus:'new',educationStage:'postgraduate',accommodation:'commute',outOfTown:true},['本科毕业证','床单','洗发水','短袖'],['床帘','宿舍入住登记']],
 ['H 老生·住校·异地',{...base,studentStatus:'returning',educationStage:undefined,accommodation:'dorm',outOfTown:true},['学生证 / 校园卡','查看新学期课表','牙刷','洗衣液'],['录取通知书','床垫','漱口杯']],
 ['I 老生·住校·本地',{...base,studentStatus:'returning',educationStage:undefined,accommodation:'dorm',outOfTown:false},['查看新学期开学通知','牙刷','洗衣液'],['录取通知书','床垫','漱口杯','确认车票']],
 ['J 老生·走读·本地',{...base,studentStatus:'returning',educationStage:undefined,accommodation:'commute',outOfTown:false},['查看新学期课表','查看通勤路线','手机','校园卡 / 学生证'],['录取通知书','床垫','牙刷','洗衣液','短袖','创可贴']],
 ['K 老生·走读·异地',{...base,studentStatus:'returning',educationStage:undefined,accommodation:'commute',outOfTown:true},['查看新学期课表','查看通勤路线','短袖','洗衣液'],['录取通知书','床帘','宿舍入住登记']],
]
for(const [label,profile,must,mustNot] of scenarios){const all=generateChecklist(profile);const visible=all.filter(x=>!x.hidden);const names=new Set(visible.map(x=>x.name));for(const name of must)if(!names.has(name))throw new Error(`${label} 缺少：${name}`);for(const name of mustNot)if(names.has(name))throw new Error(`${label} 不应出现：${name}`);const categories=generateCategories(profile,all);for(const c of categories)if(!c.hidden&&!visible.some(i=>i.categoryId===c.id))throw new Error(`${label} 显示空分类：${c.name}`);if(profile.studentStatus==='returning'&&profile.accommodation==='dorm'){const toothbrush=visible.find(x=>x.name==='牙刷');if(toothbrush?.priority==='essential')throw new Error(`${label} 牙刷仍为必需`)}if(profile.accommodation==='commute'&&!profile.outOfTown){for(const id of ['dorm','wash','clean','clothes','beauty','food'])if(categories.find(c=>c.id===id&&!c.hidden))throw new Error(`${label} 不应显示分类：${id}`)}console.log(`${label}: ${visible.length} 项；${categories.filter(c=>!c.hidden).length} 分类；${visible.filter(x=>x.priority==='essential').length} 必需`)}
const noTraining=generateChecklist({...base,studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:'no'});if(noTraining.some(x=>!x.hidden&&x.categoryId==='training'))throw new Error('不军训仍显示军训用品');console.log('场景矩阵与军训过滤通过')
const focusedProfiles=[
 ['高中新生·女',{studentStatus:'new',educationStage:'high_school',gender:'female',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['校服','资料袋 / 文件袋','卫生巾'],[]],
 ['高中新生·男',{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['校服','资料袋 / 文件袋'],['卫生巾']],
 ['专科新生·女',{studentStatus:'new',educationStage:'vocational',gender:'female',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['录取通知书','团员证','卫生巾'],['本科毕业证']],
 ['本科新生·女',{studentStatus:'new',educationStage:'undergraduate',gender:'female',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['录取通知书','卫生巾'],['本科毕业证']],
 ['研究生新生·女',{studentStatus:'new',educationStage:'postgraduate',gender:'female',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['本科毕业证','卫生巾'],['团员证']],
 ['老生返校·女',{studentStatus:'returning',gender:'female',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['查看新学期开学通知','卫生巾'],['录取通知书','新生报到材料','防晒霜']],
 ['老生返校·男',{studentStatus:'returning',gender:'male',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},['查看新学期开学通知'],['录取通知书','卫生巾']],
]
for(const [label,profile,must,mustNot] of focusedProfiles){const visible=generateChecklist(profile).filter(item=>!item.hidden);const names=new Set(visible.map(item=>item.name));for(const name of must)if(!names.has(name))throw new Error(`${label} 缺少：${name}`);for(const name of mustNot)if(names.has(name))throw new Error(`${label} 不应出现：${name}`);if(profile.gender==='female'){const sanitary=visible.find(item=>item.name==='卫生巾');if(!sanitary?.helperText?.includes('2～3 天'))throw new Error(`${label} 卫生巾建议缺失`)}}
const customSanitary={id:'custom-sanitary',name:'卫生巾',categoryId:'wash',itemType:'physical',priority:'optional',preparationStatus:'unprepared',tags:[],isSystemItem:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};const deduped=generateChecklist(focusedProfiles[0][1],[customSanitary]).filter(item=>!item.hidden&&item.name==='卫生巾');if(deduped.length!==1||deduped[0].id!=='custom-sanitary')throw new Error('女性卫生巾精确去重失败')
console.log('高中、专科、性别、老生跳题结果与卫生巾去重通过')

const highSchoolProfile={studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:true,militaryTraining:'no'}
const highSchoolAll=generateChecklist(highSchoolProfile);const highSchoolVisible=highSchoolAll.filter(item=>!item.hidden);const highSchoolCategories=generateCategories(highSchoolProfile,highSchoolAll);const visibleIn=categoryId=>highSchoolVisible.filter(item=>item.categoryId===categoryId)
if(visibleIn('electronics').length)throw new Error('高中画像仍显示电子产品系统项')
if(!highSchoolCategories.find(category=>category.id==='electronics')?.hidden)throw new Error('高中电子产品空分类未隐藏')
const financeNames=visibleIn('finance').map(item=>item.name);if(financeNames.join('|')!=='校园卡充值')throw new Error(`高中财务与账号过滤错误：${financeNames.join('、')}`)
const documentNames=new Set(visibleIn('documents').map(item=>item.name));for(const name of ['身份证','身份证复印件','一寸证件照','二寸证件照','新生报到材料'])if(!documentNames.has(name))throw new Error(`高中证件资料缺少：${name}`)
const universityOnly=['录取通知书','户口迁移材料','学籍档案','团员证','银行卡','电子证件照','助学贷款材料','党员材料','家庭经济困难相关材料','本科毕业证','本科学位证','本科毕业证 / 学位证复印件','完成线上注册','缴纳学费','校园卡办理','激活学校邮箱','登录教务系统','确认学费','确认住宿费','激活银行卡','学校统一身份认证','校园网账号','学校邮箱','确认学院报到要求','查看研究生培养系统','查看导师 / 课题组通知','学院 / 实验室报到','检查录取通知书','电脑资料备份']
const highSchoolNames=new Set(highSchoolVisible.map(item=>item.name));for(const name of universityOnly)if(highSchoolNames.has(name))throw new Error(`高中画像残留高校事项：${name}`)
const registrationNames=visibleIn('registration').map(item=>item.name);for(const name of registrationNames)if(!['查看报到日期','确认报到地点','查询宿舍安排','宿舍入住登记'].includes(name))throw new Error(`高中报到返校残留高校事项：${name}`)
const forcedElectronics=generateChecklist(highSchoolProfile,[],['electronics']);if(forcedElectronics.some(item=>item.isSystemItem&&!item.hidden&&item.categoryId==='electronics'))throw new Error('高中强制显示分类绕过电子产品过滤')
const customElectronics={id:'custom-tablet',name:'我的平板',categoryId:'electronics',itemType:'physical',priority:'optional',preparationStatus:'unprepared',tags:[],isSystemItem:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};if(!generateChecklist(highSchoolProfile,[customElectronics]).some(item=>item.id==='custom-tablet'&&!item.hidden))throw new Error('高中用户自建电子产品被错误过滤')
const futureUniversityItem={...customElectronics,id:'future-finance',name:'未来高校账号',categoryId:'finance',isSystemItem:true};if(isHighSchoolSystemItemApplicable(futureUniversityItem))throw new Error('未来高校敏感分类事项未默认拒绝')
const futureHighSchoolItem={...futureUniversityItem,id:'future-high-school',name:'高中明确事项',applicability:{educationStages:['high_school']}};if(!isHighSchoolSystemItemApplicable(futureHighSchoolItem))throw new Error('明确高中适用事项未被允许')
console.log(`高中全清单审计通过：${highSchoolVisible.length} 项；${highSchoolCategories.filter(category=>!category.hidden).length} 分类`)

const trainingProfiles=[
 ['参加',{studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:'yes'},true],
 ['不参加',{studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},false],
 ['不确定',{studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:'unknown'},false],
 ['未选择',{studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:undefined},false],
 ['老生返校',{studentStatus:'returning',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},false],
 ['高中不参加',highSchoolProfile,false],
]
let trainingYesItems
for(const [label,profile,expected] of trainingProfiles){const all=generateChecklist(profile);const visibleFeet=all.filter(item=>item.isSystemItem&&!item.hidden&&item.name==='防磨脚贴');if(expected){if(visibleFeet.length!==1||visibleFeet[0].categoryId!=='training'||visibleFeet[0].purchaseStatus!=='to_buy')throw new Error(`${label}时防磨脚贴生成错误`);trainingYesItems=all}else{if(visibleFeet.length)throw new Error(`${label}时仍显示防磨脚贴`);for(const item of all.filter(item=>item.isSystemItem&&item.name==='防磨脚贴'))if(item.purchaseStatus!==undefined||item.purchaseStatusOverride!==undefined)throw new Error(`${label}时防磨脚贴仍有购买状态`)}}
const oldBugItem={...trainingYesItems.find(item=>item.name==='防磨脚贴'&&item.categoryId==='medical'),hidden:false,purchaseStatus:'to_buy',purchaseStatusOverride:'to_buy'};const cleaned=generateChecklist(trainingProfiles[1][1],[oldBugItem]).find(item=>item.id===oldBugItem.id);if(!cleaned?.hidden||cleaned.purchaseStatus!==undefined||cleaned.purchaseStatusOverride!==undefined)throw new Error('旧系统防磨脚贴错误数据未在重新生成时清理')
const customFootPatch={...customElectronics,id:'custom-foot-patch',name:'防磨脚贴',categoryId:'medical',purchaseStatus:'to_buy'};const keptCustom=generateChecklist(trainingProfiles[1][1],[customFootPatch]).find(item=>item.id==='custom-foot-patch');if(!keptCustom||keptCustom.hidden||keptCustom.purchaseStatus!=='to_buy')throw new Error('用户自建防磨脚贴被错误清理')
console.log('防磨脚贴严格军训条件、购买状态清理与自建数据保护通过')

