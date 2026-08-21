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
const visible=items=>items.filter(item=>!item.hidden)
const find=(items,name,category)=>items.find(item=>item.name===name&&(!category||item.categoryId===category))
const has=(items,name,category)=>!!find(visible(items),name,category)
const junior=(studentStatus,accommodation,outOfTown,militaryTraining)=>({studentStatus,educationStage:'junior_high',gender:'male',accommodation,outOfTown,militaryTraining})

// Case 1：初中新生、本地走读、不军训，保持轻量并使用初中特殊文案。
const newCommute=generateChecklist(junior('new','commute',false,'no'))
for(const category of ['dorm','wash','clean','food','beauty','electronics','training'])assert.equal(visible(newCommute).some(item=>item.categoryId===category),false,`初中本地走读仍显示 ${category}`)
for(const name of ['联系室友','确认宿舍床铺尺寸','行李箱','学校快递站','防磨脚贴'])assert.equal(has(newCommute,name),false,`初中本地走读仍显示 ${name}`)
for(const name of ['笔记本','签字笔','铅笔','橡皮','红笔','尺子','笔袋','草稿本','双肩包','校服'])assert.equal(has(newCommute,name),true,`初中基础清单缺少 ${name}`)
assert.equal(find(visible(newCommute),'身份证')?.priority,'optional')
assert.match(find(visible(newCommute),'身份证')?.helperText||'',/尚未办理/)
assert.equal(find(visible(newCommute),'检查手机')?.priority,'optional')
assert.match(find(visible(newCommute),'检查手机')?.helperText||'',/学校是否允许携带/)
assert.equal(has(newCommute,'检查充电器'),false)
assert.equal(find(visible(newCommute),'计算器')?.priority,'optional')
assert.equal(find(visible(newCommute),'计算器')?.purchaseStatus,undefined)
assert.equal(visible(newCommute).some(item=>/托运行李/.test(item.helperText||'')),false)

// Case 2/3：住校才增加住宿内容，异地也不机械生成电子设备。
const newDorm=generateChecklist(junior('new','dorm',false,'no'))
for(const name of ['床单','被套','枕套','被子','牙刷','牙膏','拖鞋'])assert.equal(has(newDorm,name),true,`初中新生住校缺少 ${name}`)
for(const name of ['床垫','床帘']){const item=find(visible(newDorm),name);assert.ok(item);assert.equal(item.priority,'optional');assert.equal(item.purchaseStatus,undefined);assert.match(item.helperText||'',/学校/)}
for(const name of ['路由器','打印机','大功率电器'])assert.equal(has(newDorm,name),false)
const remoteDorm=generateChecklist(junior('new','dorm',true,'no'))
assert.equal(has(remoteDorm,'行李箱'),true)
assert.equal(visible(remoteDorm).some(item=>item.categoryId==='electronics'),false)
assert.equal(find(visible(remoteDorm),'身份证')?.priority,'optional')
assert.equal(find(visible(remoteDorm),'床垫')?.purchaseStatus,undefined)

// Case 4/5：老生隐藏一次性入学与首次入住内容，仅保留返校和补充。
const returningCommute=generateChecklist(junior('returning','commute',false,'no'))
for(const name of ['录取通知书','新生报到材料','校园卡办理','床单','联系室友'])assert.equal(has(returningCommute,name),false,`初中老生走读仍显示 ${name}`)
for(const name of ['确认返校日期','查看新学期课表','检查教材或课程资料'])assert.equal(has(returningCommute,name),true,`初中老生走读缺少 ${name}`)
const returningDorm=generateChecklist(junior('returning','dorm',false,'no'))
for(const name of ['床单','被套','床垫','床帘','宿舍入住登记'])assert.equal(has(returningDorm,name),false,`初中老生住校重复首次用品 ${name}`)
for(const name of ['检查洗漱用品是否需要补货','检查纸巾和清洁用品库存','查看宿舍开放时间'])assert.equal(has(returningDorm,name),true,`初中老生住校缺少补充事项 ${name}`)

// 军训只认明确 yes；no/unknown/老生均不产生军训用品或待购买残留。
for(const state of ['no','unknown']){const items=generateChecklist(junior('new','dorm',false,state));assert.equal(visible(items).some(item=>item.categoryId==='training'),false);assert.equal(items.filter(item=>item.name==='防磨脚贴'&&item.isSystemItem).some(item=>item.purchaseStatus||item.purchaseStatusOverride),false)}
const training=generateChecklist(junior('new','dorm',false,'yes'))
assert.equal(has(training,'防磨脚贴','training'),true)
assert.equal(visible(training).some(item=>item.categoryId==='training'),true)
assert.equal(visible(returningDorm).some(item=>item.categoryId==='training'),false)

// 初中理性准备四组合：走读无宿舍项，住校新生只有三类谨慎建议，老生仅补充。
for(const profile of [junior('new','commute',false,'no'),junior('returning','commute',false,'no')]){
 const content=resolveRationalPrepContent(profile);assert.equal(content.show,true)
 for(const name of ['床垫','床帘','收纳用品','个人用品补充','路由器','打印机','大功率电器'])assert.equal(content.suggestions.some(item=>item.name===name),false)
 assert.equal(content.suggestions.every(item=>item.preparationStatus==='unprepared'&&item.purchaseStatus===undefined),true)
}
const juniorDormPrep=resolveRationalPrepContent(junior('new','dorm',false,'no'))
for(const name of ['教辅资料','大量练习册','计算器','平板电脑','笔记本电脑','额外校服','床垫','床帘','收纳用品'])assert.equal(juniorDormPrep.suggestions.some(item=>item.name===name),true,`初中住校理性准备缺少 ${name}`)
for(const name of ['路由器','打印机','大功率电器','宿舍清洁用品'])assert.equal(juniorDormPrep.suggestions.some(item=>item.name===name),false)
const juniorReturningPrep=resolveRationalPrepContent(junior('returning','dorm',false,'no'))
assert.equal(juniorReturningPrep.suggestions.some(item=>item.name==='个人用品补充'),true)
for(const name of ['床垫','床帘','收纳用品'])assert.equal(juniorReturningPrep.suggestions.some(item=>item.name===name),false)

// 强制显示分类不得绕过初中身份、住宿和军训硬条件；用户自定义事项仍完整保留。
const custom={id:'custom-tablet',name:'我的平板',categoryId:'electronics',itemType:'physical',priority:'optional',preparationStatus:'unprepared',quantity:1,tags:[],isSystemItem:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}
const forced=generateChecklist(junior('new','commute',false,'no'),[custom],['electronics','dorm','training'])
assert.equal(visible(forced).some(item=>item.isSystemItem&&['electronics','dorm','training'].includes(item.categoryId)),false)
assert.equal(has(forced,'我的平板','electronics'),true)
const categories=generateCategories(junior('new','commute',false,'no'),forced)
for(const category of ['dorm','training'])assert.equal(categories.find(item=>item.id===category)?.hidden,true)
assert.equal(categories.find(item=>item.id==='electronics')?.hidden,false)

// 备份导出/恢复保持 junior_high，旧 high_school 不被改写。
const data=createDefaultData();data.onboarded=true;data.profile=junior('new','commute',false,'no');data.items=newCommute
const restored=migrateData(extractBackupData(createBackupPayload(data)))
assert.equal(restored.profile.educationStage,'junior_high')
const legacyHigh=createDefaultData();legacyHigh.profile={...legacyHigh.profile,educationStage:'high_school'}
assert.equal(migrateData(legacyHigh).profile.educationStage,'high_school')

// 高中关键回归：原画像仍保留高中专用建议和现有过滤。
const highSchool={studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:false,militaryTraining:'no'}
const highItems=generateChecklist(highSchool)
assert.equal(has(highItems,'校服'),true);assert.equal(has(highItems,'床帘'),true);assert.equal(find(visible(highItems),'床帘')?.helperText,'部分学校宿舍不允许安装床帘，先看住宿规定')
assert.equal(visible(highItems).some(item=>item.categoryId==='electronics'),false)
assert.equal(resolveRationalPrepContent(highSchool).suggestions.some(item=>item.name==='宿舍清洁用品'),true)

console.log('初中五类画像、军训、理性准备、强制分类、备份恢复与高中回归通过')
