import { createDefaultData,defaultCategories,defaultLuggage,defaultProfile,makeDefaultItems } from '@/data/defaults'
import { generateCategories,generateChecklist } from '@/lib/checklistGenerator'
import { APP_IDENTIFIER,BACKUP_SCHEMA_VERSION,DATA_VERSION } from '@/lib/constants'
import { AppData,BackupPayload,Category,ChecklistItem,PreparationStatus,PurchaseStatus,UserProfile } from '@/types/checklist'

type Loose=Record<string,unknown>
const isObject=(value:unknown):value is Loose=>!!value&&typeof value==='object'&&!Array.isArray(value)
const preparationValues:PreparationStatus[]=['unprepared','in_progress','prepared']
const purchaseValues:PurchaseStatus[]=['not_required','to_buy','purchased','buy_after_arrival']
const timingToStatus=(value:unknown):PurchaseStatus|undefined=>value==='after_arrival'?'buy_after_arrival':value==='before_arrival'?'to_buy':undefined

function migrateProfile(value:unknown):UserProfile{
 const source=isObject(value)?sourceProfile(value):{}
 const legacyType=source.studentType
 const studentStatus=source.studentStatus==='returning'||legacyType==='returning'?'returning':'new'
 const educationStage=studentStatus==='new'?(source.educationStage==='postgraduate'||legacyType==='postgraduate_new'?'postgraduate':'undergraduate'):undefined
 const accommodation=source.accommodation==='commute'?'commute':'dorm'
 const militaryTraining=studentStatus==='new'&&(source.militaryTraining==='yes'||source.militaryTraining==='no'||source.militaryTraining==='unknown')?source.militaryTraining:studentStatus==='new'?'unknown':'no'
 return {...defaultProfile,studentStatus,educationStage,accommodation,outOfTown:source.outOfTown===true,militaryTraining,registrationDate:typeof source.registrationDate==='string'?source.registrationDate:undefined,needsIdentityConfirmation:source.needsIdentityConfirmation===true}
}
function sourceProfile(value:Loose){const rest={...value};for(const key of ['city','schoolCity','locationCity','enableBudget','enableLuggage','enableSkincare','enableMakeup'])delete rest[key];return rest}

function migrateStatuses(source:Loose,sourceVersion:number){
 const current=source.preparationStatus==='not_needed'?'prepared':preparationValues.includes(source.preparationStatus as PreparationStatus)?source.preparationStatus as PreparationStatus:undefined
 const currentPurchase=purchaseValues.includes(source.purchaseStatus as PurchaseStatus)?source.purchaseStatus as PurchaseStatus:undefined
 const storedOverride=purchaseValues.includes(source.purchaseStatusOverride as PurchaseStatus)?source.purchaseStatusOverride as PurchaseStatus:undefined
 const timingOverride=timingToStatus(source.purchaseTimingOverride);const timingStatus=timingToStatus(source.purchaseTiming)
 const migratedPurchase=currentPurchase??timingOverride??timingStatus
 const migratedOverride=storedOverride??(sourceVersion<DATA_VERSION?currentPurchase??timingOverride:undefined)
 if(current)return {preparationStatus:current,purchaseStatus:migratedPurchase,purchaseStatusOverride:migratedOverride,luggageId:typeof source.luggageId==='string'&&source.luggageId!=='arrival'?source.luggageId:undefined}
 const old=String(source.status||'unprepared')
 let preparationStatus:PreparationStatus='unprepared';let purchaseStatus:PurchaseStatus|undefined=migratedPurchase;let purchaseStatusOverride:PurchaseStatus|undefined=migratedOverride;let luggageId=typeof source.luggageId==='string'&&source.luggageId!=='arrival'?source.luggageId:undefined
 if(['to_buy','buy_after_arrival'].includes(old)){preparationStatus='in_progress';purchaseStatus=old as PurchaseStatus;purchaseStatusOverride=purchaseStatus}
 else if(['purchased','online_ordered','online_purchased'].includes(old)){preparationStatus='in_progress';purchaseStatus='purchased'}
 else if(old==='packed')preparationStatus='prepared'
 else if(['campus_parcel_station','school_station'].includes(old)){preparationStatus='prepared';purchaseStatus='purchased';luggageId='campus_parcel_station'}
 else if(old==='owned'){preparationStatus='prepared';purchaseStatus='not_required'}
 else if(['prepared','completed'].includes(old))preparationStatus='prepared'
 else if(old==='not_needed')preparationStatus='prepared'
 if(purchaseStatus&&!purchaseStatusOverride)purchaseStatusOverride=purchaseStatus
 return {preparationStatus,purchaseStatus,purchaseStatusOverride,luggageId}
}

export function migrateItem(value:unknown,fallback?:ChecklistItem,sourceVersion=0):ChecklistItem{
 const source=isObject(value)?value:{};const migrated=migrateStatuses(source,sourceVersion);const itemType=source.itemType==='document'||source.itemType==='task'||source.itemType==='physical'?source.itemType:fallback?.itemType||'physical';const name=typeof source.name==='string'?source.name:fallback?.name||'未命名事项'
 const now=new Date().toISOString()
 const item:ChecklistItem={id:typeof source.id==='string'?source.id:fallback?.id||`recovered-${Date.now()}`,name,categoryId:typeof source.categoryId==='string'?source.categoryId:fallback?.categoryId||'uncategorized',itemType,priority:source.priority==='essential'||source.priority==='optional'||source.priority==='recommended'?source.priority:fallback?.priority||'recommended',preparationStatus:migrated.preparationStatus,purchaseStatus:migrated.purchaseStatus??fallback?.purchaseStatus,purchaseStatusOverride:migrated.purchaseStatusOverride,helperText:typeof source.helperText==='string'?source.helperText:fallback?.helperText,systemTipHidden:source.systemTipHidden===true,visibilityOverride:source.visibilityOverride==='hide'?'hide':undefined,applicability:fallback?.applicability,rules:fallback?.rules,quantity:typeof source.quantity==='number'?source.quantity:fallback?.quantity,actualPrice:typeof source.actualPrice==='number'?source.actualPrice:undefined,purchasePlatform:typeof source.purchasePlatform==='string'?source.purchasePlatform:undefined,reminderDate:typeof source.reminderDate==='string'?source.reminderDate:undefined,luggageId:migrated.luggageId,tags:Array.isArray(source.tags)?source.tags.filter((x):x is string=>typeof x==='string'):fallback?.tags||[],note:typeof source.note==='string'?source.note:undefined,isSystemItem:source.isSystemItem===true||fallback?.isSystemItem===true,hidden:source.hidden===true,createdAt:typeof source.createdAt==='string'?source.createdAt:fallback?.createdAt||now,updatedAt:typeof source.updatedAt==='string'?source.updatedAt:fallback?.updatedAt||now}
 return item
}

export function migrateData(value:unknown):AppData{
 if(!isObject(value))return createDefaultData()
 const profile=migrateProfile(value.profile);const defaults=makeDefaultItems();const rawItems=Array.isArray(value.items)?value.items:[];const sourceVersion=typeof value.version==='number'?value.version:0
 const normalized=rawItems.map(raw=>{const source=isObject(raw)?raw:{};const system=defaults.find(x=>x.id===source.id||(source.isSystemItem===true&&x.name===source.name&&x.categoryId===source.categoryId));return migrateItem(raw,system,sourceVersion)})
 const rawCategories=Array.isArray(value.categories)?value.categories.filter(isObject):[];const categories:Category[]=rawCategories.map((c,index)=>({id:typeof c.id==='string'?c.id:`category-${index}`,name:typeof c.name==='string'?c.name:'未命名分类',icon:typeof c.icon==='string'?c.icon:'Folder',order:typeof c.order==='number'?c.order:index,isSystemCategory:c.isSystemCategory===true,hidden:c.hidden===true,visibilityOverride:c.visibilityOverride==='show'||c.visibilityOverride==='hide'?c.visibilityOverride:undefined}))
 for(const category of defaultCategories)if(!categories.some(c=>c.id===category.id))categories.push({...category})
 const forced=[...new Set([...categories.filter(c=>c.visibilityOverride==='show').map(c=>c.id),...categories.filter(c=>c.id==='beauty'&&!c.hidden).map(c=>c.id)])]
 const items=generateChecklist(profile,normalized,forced);const generatedCategories=generateCategories(profile,items,categories);const uncategorized=generatedCategories.find(c=>c.id==='uncategorized');if(uncategorized)uncategorized.hidden=!items.some(i=>i.categoryId==='uncategorized'&&!i.hidden)
 const rawLuggage=Array.isArray(value.luggage)?value.luggage.filter(isObject):[];const luggage=rawLuggage.filter(l=>l.id!=='arrival').map((l,index)=>({id:typeof l.id==='string'?l.id:`luggage-${index}`,name:typeof l.name==='string'?l.name:'未命名位置',icon:typeof l.icon==='string'?l.icon:'Package',order:typeof l.order==='number'?l.order:index}));for(const place of defaultLuggage)if(!luggage.some(x=>x.id===place.id))luggage.push({...place})
 return {version:DATA_VERSION,onboarded:value.onboarded===true,profile,items,categories:generatedCategories,luggage}
}

export function createBackupPayload(data:AppData):BackupPayload{return {appIdentifier:APP_IDENTIFIER,backupVersion:BACKUP_SCHEMA_VERSION,exportedAt:new Date().toISOString(),data:migrateData(data)}}
export function extractBackupData(value:unknown):unknown{
 if(isObject(value)&&value.appIdentifier===APP_IDENTIFIER&&value.backupVersion===BACKUP_SCHEMA_VERSION&&isObject(value.data))return value.data
 if(isObject(value)&&typeof value.version==='number'&&value.version<DATA_VERSION&&Array.isArray(value.items)&&Array.isArray(value.categories)&&isObject(value.profile))return value
 throw new Error('INVALID_BACKUP')
}
