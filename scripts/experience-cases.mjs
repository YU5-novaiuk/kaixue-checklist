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

const {migrateItem,migrateData,createBackupPayload,extractBackupData}=load('src/lib/dataMigration.ts')
const {filterPurchases,getPurchaseStats}=load('src/lib/selectors.ts')
const {isPackedForLuggage}=load('src/lib/itemTransitions.ts')
const {progress}=load('src/lib/utils.ts')
const {createDefaultData}=load('src/data/defaults.ts')
const {generateChecklist}=load('src/lib/checklistGenerator.ts')
const {supportsLocation,supportsPurchase}=load('src/lib/itemCapabilities.ts')
const {applyBatchItemPatch}=load('src/lib/batchItems.ts')

const now=new Date().toISOString()
const base={id:'x',name:'床单',categoryId:'dorm',itemType:'physical',priority:'essential',preparationStatus:'unprepared',tags:[],isSystemItem:false,createdAt:now,updatedAt:now}
const categories=[{id:'dorm',name:'宿舍',icon:'Bed',order:0,isSystemCategory:false}]

// 三种主状态与原采购、位置统计保持独立。
const inProgress={...base,preparationStatus:'in_progress',purchaseStatus:'to_buy'}
const packed={...base,id:'packed',preparationStatus:'prepared',purchaseStatus:'purchased',luggageId:'large',actualPrice:52}
const station={...base,id:'station',name:'洗衣液',preparationStatus:'prepared',purchaseStatus:'purchased',luggageId:'campus_parcel_station',actualPrice:30}
assert.equal(isPackedForLuggage(packed),true)
assert.equal(isPackedForLuggage(station),false)
const preparationProgress=progress([inProgress,packed]);assert.equal(preparationProgress.done,1);assert.equal(preparationProgress.total,2);assert.equal(preparationProgress.percent,50)
const stats=getPurchaseStats([inProgress,packed,station],categories)
assert.equal(stats.purchasedCount,2);assert.equal(stats.pendingCount,1);assert.equal(stats.actual,82)

// capability：证件可放置但不可购买，电子证件照和任务都不支持位置。
const identity={...base,id:'identity',name:'身份证',categoryId:'documents',itemType:'document'}
const notice={...identity,id:'notice',name:'录取通知书'}
const diploma={...identity,id:'diploma',name:'本科毕业证'}
const archive={...identity,id:'archive',name:'学籍档案'}
const digitalPhoto={...identity,id:'digital',name:'电子证件照'}
const tuition={...base,id:'tuition',name:'缴纳学费',itemType:'task'}
const computer={...base,id:'computer',name:'电脑'}
for(const item of [identity,notice,diploma,archive]){assert.equal(supportsLocation(item),true);assert.equal(supportsPurchase(item),false)}
assert.equal(supportsLocation(digitalPhoto),false);assert.equal(supportsLocation(tuition),false)
assert.equal(supportsPurchase(computer),true);assert.equal(supportsLocation(computer),true)

// 混合批量操作：只更新适用事项，其余跳过。
const mixed=[identity,notice,computer,{...base,id:'sheet'},tuition]
const located=mixed.map(item=>applyBatchItemPatch(item,{luggageId:'carry'},now))
assert.equal(located.filter(item=>item.luggageId==='carry').length,4);assert.equal(located.find(item=>item.id==='tuition')?.luggageId,undefined)
const purchased=mixed.map(item=>applyBatchItemPatch(item,{purchaseStatus:'purchased'},now))
assert.equal(purchased.filter(item=>item.purchaseStatus==='purchased').length,2)
assert.equal(purchased.find(item=>item.id==='identity')?.purchaseStatus,undefined)
const buyAtSchool=mixed.map(item=>applyBatchItemPatch(item,{purchaseStatus:'buy_after_arrival'},now))
assert.equal(buyAtSchool.filter(item=>item.purchaseStatus==='buy_after_arrival').length,2);assert.equal(buyAtSchool.find(item=>item.id==='computer')?.purchaseStatusOverride,'buy_after_arrival')

// 系统购买情况按画像解析，用户手动选择优先于系统推荐。
const newRemoteDorm={studentStatus:'new',educationStage:'undergraduate',accommodation:'dorm',outOfTown:true,militaryTraining:'yes'}
const remoteItems=generateChecklist(newRemoteDorm)
const byName=(items,name,category)=>items.find(item=>item.name===name&&(!category||item.categoryId===category))
const curtain=byName(remoteItems,'床帘','dorm');const detergent=byName(remoteItems,'洗衣液','wash');const charger=byName(remoteItems,'手机充电器','electronics');const sheet=byName(remoteItems,'床单','dorm')
assert.equal(curtain?.priority,'optional');assert.equal(curtain?.purchaseStatus,'buy_after_arrival')
assert.equal(detergent?.purchaseStatus,'buy_after_arrival');assert.equal(charger?.purchaseStatus,undefined);assert.equal(sheet?.purchaseStatus,'to_buy')
const localCommute={studentStatus:'new',educationStage:'undergraduate',accommodation:'commute',outOfTown:false,militaryTraining:'no'}
const commuteItems=generateChecklist(localCommute)
assert.equal(byName(commuteItems,'床帘','dorm')?.hidden,true);assert.equal(byName(commuteItems,'洗衣液','wash')?.hidden,true);assert.equal(byName(commuteItems,'手机充电器','electronics')?.purchaseStatus,undefined)
const returningDorm={studentStatus:'returning',accommodation:'dorm',outOfTown:true,militaryTraining:'no'}
const returningItems=generateChecklist(returningDorm)
assert.equal(byName(returningItems,'洗衣液','wash')?.purchaseStatus,'not_required');assert.match(byName(returningItems,'洗衣液','wash')?.helperText||'',/剩余量/)
const manual={...curtain,purchaseStatus:'purchased',purchaseStatusOverride:'purchased'}
const regenerated=generateChecklist(newRemoteDorm,[manual])
const regeneratedCurtain=byName(regenerated,'床帘','dorm')
assert.equal(regeneratedCurtain?.purchaseStatus,'purchased');assert.equal(regeneratedCurtain?.purchaseStatusOverride,'purchased')

// 旧四状态和旧到校购买迁移，不丢备注、价格、位置等其他数据。
const oldNotNeeded=migrateItem({...base,preparationStatus:'not_needed',note:'保留备注',actualPrice:88,luggageId:'large'})
assert.equal(oldNotNeeded.preparationStatus,'prepared');assert.equal(oldNotNeeded.note,'保留备注');assert.equal(oldNotNeeded.actualPrice,88);assert.equal(oldNotNeeded.luggageId,'large')
const oldAfterArrival=migrateItem({id:'legacy-buy',name:'洗衣液',categoryId:'wash',itemType:'physical',priority:'essential',status:'buy_after_arrival',tags:[],isSystemItem:false,createdAt:now,updatedAt:now})
assert.equal(oldAfterArrival.preparationStatus,'in_progress');assert.equal(oldAfterArrival.purchaseStatus,'buy_after_arrival')
const timingAfter=migrateItem({...base,purchaseTiming:'after_arrival'},undefined,10);assert.equal(timingAfter.purchaseStatus,'buy_after_arrival')
const purchasedWins=migrateItem({...base,purchaseStatus:'purchased',purchaseTiming:'before_arrival'},undefined,10);assert.equal(purchasedWins.purchaseStatus,'purchased')
const timingOverride=migrateItem({...base,purchaseTimingOverride:'before_arrival'},undefined,10);assert.equal(timingOverride.purchaseStatus,'to_buy');assert.equal(timingOverride.purchaseStatusOverride,'to_buy')
const migratedDocument=migrateItem({...identity,luggageId:'carry'});assert.equal(migratedDocument.luggageId,'carry')

// 四种购买情况进入采购筛选与本站备份，旧 purchaseTiming 不再导出。
const afterItem={...base,id:'after',purchaseStatus:'buy_after_arrival'};const purchaseStats=getPurchaseStats([inProgress,packed,afterItem],categories)
assert.equal(purchaseStats.buyAfterArrivalCount,1);assert.equal(filterPurchases(purchaseStats.items,'buy_after_arrival').length,1)
const data=createDefaultData();data.onboarded=true;data.items=[{...packed,purchaseStatusOverride:'purchased',note:'取件码123'}]
const payload=createBackupPayload(data);const serialized=JSON.stringify(payload)
assert.equal(payload.backupVersion,3);assert.equal(serialized.includes('purchaseTiming'),false);assert.equal(serialized.includes('"before_arrival"'),false);assert.equal(serialized.includes('"after_arrival"'),false);assert.equal(serialized.includes('not_needed'),false)
assert.equal(extractBackupData(payload),payload.data);assert.throws(()=>extractBackupData({items:[]}))
const restoredData=migrateData(extractBackupData(payload));const restoredItem=restoredData.items.find(item=>item.id==='packed')
assert.equal(restoredItem?.purchaseStatusOverride,'purchased');assert.equal(restoredItem?.note,'取件码123');assert.equal(restoredItem?.actualPrice,52)

// Sticky 操作区和学校快递站单入口保持在指定页面层，不改变位置数据。
const checklistSource=fs.readFileSync('src/app/checklist/page.tsx','utf8');const cssSource=fs.readFileSync('src/app/globals.css','utf8');const luggageSource=fs.readFileSync('src/app/luggage/page.tsx','utf8')
assert.match(checklistSource,/className="checklist-sticky"/);assert.match(cssSource,/\.checklist-sticky\{position:sticky;top:0/);assert.match(cssSource,/safe-area-inset-top/);assert.match(cssSource,/@media\(max-width:430px\)\{\.checklist-sticky/)
assert.match(luggageSource,/data\.luggage\.filter\(l=>l\.id!==\'campus_parcel_station\'\)/);assert.match(luggageSource,/location=campus_parcel_station/)
for(const file of ['src/types/checklist.ts','src/data/defaults.ts','src/lib/checklistGenerator.ts','src/components/ItemSheet.tsx','src/components/ChecklistRow.tsx','src/lib/selectors.ts'])assert.equal(fs.readFileSync(file,'utf8').includes('purchaseTiming'),false)

console.log('定向用例通过：四种购买情况、用户覆盖、旧 purchaseTiming 迁移、证件位置与备份')
