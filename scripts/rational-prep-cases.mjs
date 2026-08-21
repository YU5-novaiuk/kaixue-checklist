import fs from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'
import { createRequire } from 'node:module'

const nodeRequire=createRequire(import.meta.url)
const cache=new Map()
function load(file){
 const key=file.replaceAll('\\','/')
 if(cache.has(key))return cache.get(key).exports
 const mod={exports:{}};cache.set(key,mod)
 const js=ts.transpileModule(fs.readFileSync(key,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
 const localRequire=request=>{if(request.startsWith('.')){let resolved=new URL(request,`file:///${key}`).pathname.slice(1).replaceAll('/','\\');if(!resolved.endsWith('.ts'))resolved+='.ts';return load(resolved)}return nodeRequire(request)}
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:localRequire,Date,console,Set,Map},{filename:key})
 return mod.exports
}

const {resolveRationalPrepContent}=load('src/lib/rationalPrep.ts')
const {generateChecklist}=load('src/lib/checklistGenerator.ts')
const assert=(condition,message)=>{if(!condition)throw new Error(message)}
const names=content=>content.suggestions.map(item=>item.name)
const has=(content,name)=>names(content).includes(name)
const forbiddenDormPurchases=['床帘','床垫','收纳架','路由器','垃圾桶','大瓶洗衣液','大功率电器','宿舍清洁用品']
const profiles={
 newCommute:{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'commute',outOfTown:false,militaryTraining:'no'},
 newDorm:{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:false,militaryTraining:'no'},
 returningDorm:{studentStatus:'returning',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:false,militaryTraining:'no'},
 returningCommute:{studentStatus:'returning',educationStage:'high_school',gender:'male',accommodation:'commute',outOfTown:false,militaryTraining:'no'},
 collegeDorm:{studentStatus:'new',educationStage:'undergraduate',gender:'male',accommodation:'dorm',outOfTown:true,militaryTraining:'no'},
 collegeCommute:{studentStatus:'new',educationStage:'undergraduate',gender:'male',accommodation:'commute',outOfTown:false,militaryTraining:'no'},
}

const newCommute=resolveRationalPrepContent(profiles.newCommute)
assert(newCommute.show&&newCommute.title==='先确认，再决定','高中新生走读未显示高中理性准备模块')
for(const name of forbiddenDormPurchases)assert(!has(newCommute,name),`高中新生走读仍推荐：${name}`)
for(const name of ['教辅资料','额外练习册','基础文具补充','计算器','平板电脑','笔记本电脑','额外校服'])assert(has(newCommute,name),`高中新生走读缺少：${name}`)

const newDorm=resolveRationalPrepContent(profiles.newDorm)
for(const name of ['床垫','床帘','收纳用品','宿舍清洁用品'])assert(has(newDorm,name),`高中新生住校缺少：${name}`)
for(const name of ['路由器','打印机','大功率电器','垃圾桶','大瓶洗衣液'])assert(!has(newDorm,name),`高中新生住校仍显示大学宿舍化推荐：${name}`)
assert(newDorm.suggestions.find(item=>item.name==='床帘')?.reason.includes('是否')||newDorm.suggestions.find(item=>item.name==='床帘')?.reason.includes('不允许'),'高中床帘建议未强调允许性')
assert(newDorm.suggestions.find(item=>item.name==='床垫')?.reason.includes('统一提供'),'高中床垫建议未强调学校提供')
assert(newDorm.suggestions.find(item=>item.name==='收纳用品')?.reason.includes('学校规定'),'高中收纳建议未强调学校规定')

const returningDorm=resolveRationalPrepContent(profiles.returningDorm)
for(const name of ['床垫','床帘','垃圾桶','小扫把','拖把','收纳架','收纳用品','宿舍清洁用品'])assert(!has(returningDorm,name),`高中老生住校仍重复推荐：${name}`)
for(const name of ['新学期教辅','练习册 / 作业本补充','文具补充','个人用品补货'])assert(has(returningDorm,name),`高中老生住校缺少：${name}`)

const returningCommute=resolveRationalPrepContent(profiles.returningCommute)
for(const name of forbiddenDormPurchases)assert(!has(returningCommute,name),`高中老生走读仍推荐：${name}`)
assert(!has(returningCommute,'个人用品补货'),'高中老生走读出现住校补货建议')
for(const name of ['新学期教辅','练习册 / 作业本补充','文具补充','平板电脑','笔记本电脑'])assert(has(returningCommute,name),`高中老生走读缺少：${name}`)

for(const [label,profile] of Object.entries(profiles).filter(([key])=>key.startsWith('new')||key.startsWith('returning'))){
 const content=resolveRationalPrepContent(profile)
 for(const suggestion of content.suggestions){
  assert(suggestion.purchaseStatus===undefined,`${label} 的 ${suggestion.name} 被自动设置为采购任务`)
  assert(suggestion.preparationStatus==='unprepared',`${label} 的 ${suggestion.name} 被自动设为准备中`)
  for(const term of ['室友共同购买','校园网','路由器','打印点','托运行李','宿舍公共电器','到校后购买大件','搬宿舍'])assert(!suggestion.reason.includes(term),`${label} 建议残留大学语境：${term}`)
 }
 for(const name of ['平板电脑','笔记本电脑','额外校服'])assert(content.suggestions.find(item=>item.name===name)?.categoryId==='study',`${label} 的 ${name} 加入后会落入隐藏分类`)
}

const college=resolveRationalPrepContent(profiles.collegeDorm)
assert(names(college).join('|')==='床帘|床垫|收纳架|路由器|打印机|垃圾桶|大瓶洗衣液|大功率电器','本科住校原推荐列表被修改')
assert(college.suggestions.every(item=>item.purchaseStatus==='buy_after_arrival'&&item.preparationStatus==='in_progress'),'本科住校原加入行为被修改')
assert(!resolveRationalPrepContent(profiles.collegeCommute).show,'本科走读原隐藏逻辑被修改')

const highSchoolChecklist=generateChecklist(profiles.newDorm)
for(const name of ['床帘','床垫','收纳盒']){
 const item=highSchoolChecklist.find(entry=>entry.name===name&&!entry.hidden)
 assert(item,`高中新生住校清单缺少：${name}`)
 assert(item.priority==='optional',`高中 ${name} 不是按需`)
 assert(item.purchaseStatus===undefined,`高中 ${name} 被自动设置购买情况`)
}
const bedCurtain=highSchoolChecklist.find(item=>item.name==='床帘'&&!item.hidden)
assert(bedCurtain.helperText.includes('不允许'),'高中默认床帘建议未同步')

console.log('高中理性准备四种画像、默认购买中立性与大学原逻辑回归通过')
