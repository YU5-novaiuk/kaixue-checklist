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

const {generateChecklist,getPersonalizedTips}=load('src/lib/checklistGenerator.ts')
const profiles=[
 ['高中新生·本地走读',{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'commute',outOfTown:false,militaryTraining:'no'}],
 ['高中新生·本地住校',{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:false,militaryTraining:'no'}],
 ['高中新生·异地住校',{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:true,militaryTraining:'no'}],
 ['高中新生·异地校外住宿',{studentStatus:'new',educationStage:'high_school',gender:'male',accommodation:'commute',outOfTown:true,militaryTraining:'no'}],
 ['高中老生·本地走读',{studentStatus:'returning',educationStage:'high_school',gender:'male',accommodation:'commute',outOfTown:false,militaryTraining:'no'}],
 ['高中老生·住校',{studentStatus:'returning',educationStage:'high_school',gender:'male',accommodation:'dorm',outOfTown:false,militaryTraining:'no'}],
]

for(const [label,profile] of profiles){
 const visible=generateChecklist(profile).filter(item=>!item.hidden)
 const departure=visible.filter(item=>item.categoryId==='departure')
 console.log(`\n${label}｜出发前 ${departure.length} 项`)
 for(const item of departure)console.log(`- ${item.name} [${item.priority}]${item.helperText?`：${item.helperText}`:''}`)
 console.log(`建议：${getPersonalizedTips(profile).join('｜')}`)
}

const getVisible=profile=>generateChecklist(profile).filter(item=>!item.hidden)
const find=(items,name,categoryId)=>items.find(item=>item.name===name&&(!categoryId||item.categoryId===categoryId))
const assert=(condition,message)=>{if(!condition)throw new Error(message)}
const [localCommuteProfile,localDormProfile,outOfTownDormProfile,offCampusProfile,returningCommuteProfile,returningDormProfile]=profiles.map(([,profile])=>profile)
const localCommute=getVisible(localCommuteProfile)
const outOfTownDorm=getVisible(outOfTownDormProfile)
const returningCommute=getVisible(returningCommuteProfile)

for(const [label,profile] of profiles){
 const visible=getVisible(profile)
 assert(!visible.some(item=>item.categoryId==='electronics'),`${label} 仍显示电子产品分类事项`)
 assert(!visible.some(item=>item.categoryId==='training'),`${label} 未参加军训仍显示军训用品`)
 assert(!visible.some(item=>item.name==='防磨脚贴'),`${label} 未参加军训仍显示防磨脚贴`)
 for(const name of ['检查身份证','检查手机','检查充电器']){const item=find(visible,name,'departure');if(item)assert(item.priority==='optional',`${label} ${name} 不是按需`)}
 const searchable=[...visible.map(item=>`${item.name} ${item.helperText||''}`),...getPersonalizedTips(profile)]
 for(const term of ['托运行李','航班','登机','机场','高铁托运','学院','研究生','培养系统','大学校园网','宿舍公共电器','学校快递站'])assert(!searchable.some(text=>text.includes(term)),`${label} 仍出现不适合的建议关键词：${term}`)
}

for(const name of ['联系室友','检查充电器'])assert(!find(localCommute,name),`高中新生本地走读仍显示：${name}`)
for(const name of ['行李箱','颈枕','行李牌','证件包','防磨脚贴'])assert(!find(localCommute,name),`高中新生本地走读仍显示：${name}`)
for(const categoryId of ['dorm','wash','clean','food'])assert(!localCommute.some(item=>item.categoryId===categoryId),`高中新生本地走读仍显示住宿生活分类：${categoryId}`)
assert(find(localCommute,'检查身份证','departure')?.helperText==='如学校要求携带，出门前确认带好','高中本地走读身份证建议不正确')
assert(find(localCommute,'检查手机','departure')?.helperText?.includes('学校相关规定'),'高中本地走读手机建议未体现学校规定')
assert(find(localCommute,'确认当天课程 / 集合安排','departure')?.priority==='essential','高中本地走读缺少当天安排必需项')
assert(find(localCommute,'确认校服 / 穿着要求','departure')?.priority==='optional','高中本地走读缺少按需穿着要求提醒')

assert(find(outOfTownDorm,'联系室友','departure')?.priority==='optional','高中异地住校联系室友不是按需')
assert(find(outOfTownDorm,'检查充电器','departure')?.priority==='optional','高中异地住校检查充电器不是按需')
for(const name of ['确认车票','行李箱','证件包'])assert(find(outOfTownDorm,name),`高中异地住校缺少：${name}`)
assert(!find(getVisible(offCampusProfile),'联系室友'),'高中异地校外住宿仍显示联系室友')

for(const name of ['录取通知书','新生报到材料','宿舍入住登记','校服'])assert(!find(returningCommute,name),`高中老生本地走读仍显示新生事项：${name}`)
for(const name of ['联系室友','检查充电器','行李箱'])assert(!find(returningCommute,name),`高中老生本地走读仍显示：${name}`)
for(const name of ['查看新学期开学通知','确认返校日期','确认当天课程 / 集合安排'])assert(find(returningCommute,name),`高中老生本地走读缺少：${name}`)
assert(find(getVisible(returningDormProfile),'联系室友','departure')?.priority==='optional','高中老生住校联系室友规则错误')

const forcedDeparture=generateChecklist(localCommuteProfile,[],['departure']).filter(item=>!item.hidden)
assert(!find(forcedDeparture,'联系室友'),'强制显示出发前分类绕过高中走读室友条件')
assert(!find(forcedDeparture,'检查充电器'),'强制显示出发前分类绕过高中本地走读充电器条件')
const forcedDorm=generateChecklist(localCommuteProfile,[],['dorm']).filter(item=>!item.hidden)
assert(!forcedDorm.some(item=>item.categoryId==='dorm'),'强制显示宿舍分类绕过高中走读住宿条件')
const forcedTraining=generateChecklist(localDormProfile,[],['training']).filter(item=>!item.hidden)
assert(!forcedTraining.some(item=>item.categoryId==='training'),'强制显示军训分类绕过未参加军训条件')
for(const item of generateChecklist(localDormProfile).filter(item=>item.isSystemItem&&item.categoryId==='training'))assert(item.purchaseStatus===undefined,`未参加军训的 ${item.name} 仍有默认购买状态`)

const generated=generateChecklist(localDormProfile)
const phone=generated.find(item=>item.name==='检查手机'&&item.categoryId==='departure')
const overridden={...phone,priority:'recommended',priorityOverride:'recommended',note:'保留我的备注',systemTipHidden:true}
const regenerated=generateChecklist(localDormProfile,[overridden])
const kept=regenerated.find(item=>item.id===overridden.id)
assert(kept.priority==='recommended','用户必要程度覆盖被系统默认覆盖')
assert(kept.note==='保留我的备注','用户备注被系统默认覆盖')
assert(kept.systemTipHidden===true,'用户隐藏系统建议设置被覆盖')

console.log('\n高中出发前六类画像、关键词、军训硬条件和用户覆盖测试通过')
