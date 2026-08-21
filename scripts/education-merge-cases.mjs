import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'

const nodeRequire=createRequire(import.meta.url)
const cache=new Map()
function load(file){
 const key=path.resolve(file)
 if(cache.has(key))return cache.get(key).exports
 const mod={exports:{}};cache.set(key,mod)
 const js=ts.transpileModule(fs.readFileSync(key,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
 const localRequire=request=>{if(request.startsWith('@/'))return load(path.resolve('src',request.slice(2)+'.ts'));if(request.startsWith('.'))return load(path.resolve(path.dirname(key),request)+(path.extname(request)?'':'.ts'));return nodeRequire(request)}
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:localRequire,Date,console,Set,Map,Intl},{filename:key})
 return mod.exports
}

const {generateChecklist,generateCategories}=load('src/lib/checklistGenerator.ts')
const {resolveRationalPrepContent}=load('src/lib/rationalPrep.ts')
const {createDefaultData}=load('src/data/defaults.ts')
const {migrateData,createBackupPayload,extractBackupData}=load('src/lib/dataMigration.ts')
const {DATA_VERSION}=load('src/lib/constants.ts')
const visible=items=>items.filter(item=>!item.hidden)
const find=(items,name,category)=>items.find(item=>item.name===name&&(!category||item.categoryId===category))
const has=(items,name,category)=>!!find(visible(items),name,category)
const detailedClothes=['短袖','长袖','长裤','短裤','牛仔裤','内衣','袜子','外套','运动鞋','休闲鞋','凉鞋','靴子','皮鞋']
const profile=(educationStage,studentStatus='new',accommodation='dorm',outOfTown=true,militaryTraining='no')=>({educationStage,studentStatus,gender:'male',accommodation,outOfTown,militaryTraining})

// 初高中：本地走读保持轻量，身份证/手机按需，没有宿舍、衣服搬运和大学理性准备。
const secondaryCommute=generateChecklist(profile('secondary','new','commute',false,'no'))
for(const category of ['dorm','electronics','training'])assert.equal(visible(secondaryCommute).some(item=>item.categoryId===category),false,`初高中本地走读仍显示 ${category}`)
for(const name of ['衣服','鞋子','睡衣','联系室友','宿舍入住登记','行李箱'])assert.equal(has(secondaryCommute,name),false,`初高中本地走读仍显示 ${name}`)
for(const name of detailedClothes)assert.equal(has(secondaryCommute,name),false,`初高中本地走读仍显示细分衣物 ${name}`)
assert.equal(find(visible(secondaryCommute),'身份证')?.priority,'optional')
assert.equal(find(visible(secondaryCommute),'身份证')?.helperText,'如学校报到要求携带，按通知准备相应身份证明即可')
assert.equal(find(visible(secondaryCommute),'检查手机')?.priority,'optional')
assert.equal(find(visible(secondaryCommute),'检查手机')?.helperText,'先确认学校是否允许携带，以及具体保管和使用规定')
assert.equal(visible(secondaryCommute).some(item=>/托运行李/.test(item.helperText||'')),false)
const secondaryCommutePrep=resolveRationalPrepContent(profile('secondary','new','commute',false,'no'))
for(const name of ['教辅资料','大量练习册','额外文具','计算器','手机','平板电脑','笔记本电脑','额外校服'])assert.equal(secondaryCommutePrep.suggestions.some(item=>item.name===name),true,`初高中理性准备缺少 ${name}`)
for(const name of ['路由器','打印机','大功率电器','床垫','床帘','收纳用品'])assert.equal(secondaryCommutePrep.suggestions.some(item=>item.name===name),false,`初高中走读理性准备不应显示 ${name}`)

// 初高中：异地住校有统一衣服/鞋子/睡衣和基础住宿，但电子设备仍按学校规则处理。
const secondaryDorm=generateChecklist(profile('secondary','new','dorm',true,'no'))
const secondaryClothes=find(visible(secondaryDorm),'衣服','clothes')
assert.ok(secondaryClothes);assert.equal(secondaryClothes.priority,'essential');assert.equal(secondaryClothes.helperText,'带自己需要的、适合季节的就好');assert.equal(secondaryClothes.purchaseStatus,'not_required')
for(const name of ['鞋子','睡衣','床单','被套','牙刷','拖鞋'])assert.equal(has(secondaryDorm,name),true,`初高中住校缺少 ${name}`)
for(const name of detailedClothes)assert.equal(has(secondaryDorm,name),false,`初高中住校仍显示细分衣物 ${name}`)
assert.equal(visible(secondaryDorm).some(item=>item.categoryId==='electronics'),false)
for(const name of ['床垫','床帘','收纳用品'])assert.equal(resolveRationalPrepContent(profile('secondary')).suggestions.some(item=>item.name===name),true)

// 专本科：原大学主体逻辑保留，但不再区分专科/本科，也不再生成细分衣物。
const undergraduate=generateChecklist(profile('undergraduate','new','dorm',true,'yes'))
for(const name of ['录取通知书','校园卡办理','床单','衣服','鞋子','手机','防磨脚贴'])assert.equal(has(undergraduate,name),true,`专本科新生缺少 ${name}`)
for(const name of detailedClothes)assert.equal(has(undergraduate,name),false,`专本科仍显示细分衣物 ${name}`)
assert.equal(find(visible(undergraduate),'衣服')?.helperText,'带自己需要的、适合季节的就好')
assert.equal(find(visible(undergraduate),'衣服')?.purchaseStatus,'not_required')
const undergraduateReturning=generateChecklist(profile('undergraduate','returning','commute',false,'no'))
for(const name of ['衣服','鞋子','睡衣','录取通知书','新生报到材料','床单'])assert.equal(has(undergraduateReturning,name),false,`专本科老生本地走读仍显示 ${name}`)
assert.equal(has(undergraduateReturning,'确认返校日期'),true)

// 研究生：使用可覆盖硕士、博士、直博等路径的前置学历表达。
const postgraduate=generateChecklist(profile('postgraduate','new','dorm',true,'no'))
const pgNames=['前置学历毕业证书','前置学历学位证书','前置学历证书复印件']
for(const name of pgNames)assert.equal(has(postgraduate,name,'documents'),true,`研究生证件缺少 ${name}`)
for(const name of ['本科毕业证','本科学位证','本科毕业证 / 学位证复印件'])assert.equal(has(postgraduate,name),false,`研究生仍显示旧材料 ${name}`)
for(const item of visible(postgraduate).filter(item=>pgNames.includes(item.name))){assert.equal(/硕士带本科|博士带硕士/.test(item.helperText||''),false);assert.equal(/前置学历/.test(item.name+(item.helperText||'')),true)}
assert.equal(has(postgraduate,'衣服'),true);for(const name of detailedClothes)assert.equal(has(postgraduate,name),false)

// 三类画像都不显示空分类。
for(const p of [profile('secondary','new','commute',false),profile('secondary'),profile('undergraduate'),profile('postgraduate')]){
 const items=generateChecklist(p);const shown=visible(items);const categories=generateCategories(p,items)
 for(const category of categories.filter(item=>!item.hidden))assert.equal(shown.some(item=>item.categoryId===category.id),true,`${p.educationStage} 显示空分类 ${category.id}`)
}

// 旧 profile/旧备份迁移成三值，且其他画像字段保持原样。
for(const [oldStage,newStage] of [['junior_high','secondary'],['high_school','secondary'],['vocational','undergraduate'],['vocational_college','undergraduate'],['undergraduate','undergraduate'],['postgraduate','postgraduate']]){
 const old=createDefaultData();old.version=12;old.onboarded=true;old.profile={studentStatus:'new',educationStage:oldStage,gender:'female',accommodation:'commute',outOfTown:false,militaryTraining:'unknown',registrationDate:'2026-09-01',needsIdentityConfirmation:true}
 const restored=migrateData(old);assert.equal(restored.profile.educationStage,newStage,`${oldStage} 迁移错误`);assert.equal(restored.profile.gender,'female');assert.equal(restored.profile.accommodation,'commute');assert.equal(restored.profile.outOfTown,false);assert.equal(restored.profile.militaryTraining,'unknown');assert.equal(restored.profile.registrationDate,'2026-09-01');assert.equal(restored.profile.needsIdentityConfirmation,true);assert.equal(restored.version,DATA_VERSION)
 const backup={appIdentifier:'open-school-checklist',backupVersion:3,exportedAt:new Date().toISOString(),data:old};assert.equal(migrateData(extractBackupData(backup)).profile.educationStage,newStage)
}
const newBackup=createDefaultData();newBackup.profile=profile('secondary');const serialized=JSON.stringify(createBackupPayload(newBackup));assert.match(serialized,/"educationStage":"secondary"/);assert.equal(/junior_high|high_school|vocational/.test(serialized),false)

// 未修改的旧系统细分衣物移除；有用户数据的旧细分项转为 legacy 用户事项，完整保留。
const legacy=createDefaultData();legacy.version=12;legacy.profile={...profile('high_school'),registrationDate:'2026-09-02'};legacy.items=[
 ...legacy.items,
 {id:'sys-old-short',name:'短袖',categoryId:'clothes',itemType:'physical',priority:'essential',preparationStatus:'unprepared',quantity:1,tags:[],isSystemItem:true,createdAt:'2026-01-01',updatedAt:'2026-01-01'},
 {id:'sys-old-trousers',name:'长裤',categoryId:'clothes',itemType:'physical',priority:'essential',priorityOverride:'recommended',preparationStatus:'prepared',purchaseStatus:'purchased',purchaseStatusOverride:'purchased',quantity:2,actualPrice:88,purchasePlatform:'线下',reminderDate:'2026-08-30',luggageId:'large',tags:['返校'],note:'保留这条记录',isSystemItem:true,createdAt:'2026-01-01',updatedAt:'2026-08-01'},
]
const migratedLegacy=migrateData(legacy)
assert.equal(migratedLegacy.profile.educationStage,'secondary')
assert.equal(migratedLegacy.items.some(item=>item.name==='短袖'),false)
const preserved=migratedLegacy.items.find(item=>item.name==='长裤');assert.ok(preserved);assert.equal(preserved.isSystemItem,false);assert.equal(preserved.id,'legacy-sys-old-trousers');assert.equal(preserved.preparationStatus,'prepared');assert.equal(preserved.purchaseStatus,'purchased');assert.equal(preserved.purchaseStatusOverride,'purchased');assert.equal(preserved.priorityOverride,'recommended');assert.equal(preserved.quantity,2);assert.equal(preserved.actualPrice,88);assert.equal(preserved.purchasePlatform,'线下');assert.equal(preserved.reminderDate,'2026-08-30');assert.equal(preserved.luggageId,'large');assert.equal(preserved.note,'保留这条记录');assert.equal(preserved.tags.includes('旧版保留'),true)
assert.equal(has(migratedLegacy.items,'衣服'),true)

// 用户自定义事项、购买、位置和备注不受三类教育阶段迁移影响。
const custom={id:'custom-coat',name:'演出服',categoryId:'clothes',itemType:'physical',priority:'optional',preparationStatus:'in_progress',purchaseStatus:'to_buy',purchaseStatusOverride:'to_buy',quantity:1,actualPrice:120,luggageId:'mail',note:'社团演出',tags:[],isSystemItem:false,createdAt:'2026-01-01',updatedAt:'2026-08-01'}
const customData=createDefaultData();customData.version=12;customData.profile={...profile('vocational')};customData.items=[...customData.items,custom]
const customRestored=migrateData(customData).items.find(item=>item.id==='custom-coat');assert.deepEqual({preparationStatus:customRestored.preparationStatus,purchaseStatus:customRestored.purchaseStatus,purchaseStatusOverride:customRestored.purchaseStatusOverride,actualPrice:customRestored.actualPrice,luggageId:customRestored.luggageId,note:customRestored.note},{preparationStatus:'in_progress',purchaseStatus:'to_buy',purchaseStatusOverride:'to_buy',actualPrice:120,luggageId:'mail',note:'社团演出'})

// UI 只保留三种新阶段，兼容旧值只允许出现在 migration/test 中。
const onboarding=fs.readFileSync('src/app/onboarding/page.tsx','utf8');const profilePage=fs.readFileSync('src/app/profile/page.tsx','utf8')
for(const text of ['初高中','专本科','研究生']){assert.equal(onboarding.includes(text),true);assert.equal(profilePage.includes(text),true)}
for(const value of ['junior_high','high_school','vocational']){assert.equal(onboarding.includes(value),false);assert.equal(profilePage.includes(value),false)}

console.log('三类教育阶段、衣物精简、前置学历、旧画像/备份与 legacy 衣物迁移测试通过')
