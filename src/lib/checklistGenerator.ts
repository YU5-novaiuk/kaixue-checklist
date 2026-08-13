import { defaultCategories, makeDefaultItems } from '../data/defaults'
import { Category, ChecklistItem, ItemApplicability, ItemRuleOverride, ItemStatus, ItemType, Priority, StudentStatus, UserProfile } from '@/types/checklist'

type ExtraSeed=[id:string,categoryId:string,name:string,itemType:ItemType,priority:Priority,helperText?:string,applicability?:ItemApplicability]
const ALL_STATUSES:StudentStatus[]=['new','returning']
const undergraduateOnly=new Set(['团员证','助学贷款材料'])
const firstAdmissionDocuments=new Set(['录取通知书','身份证复印件','户口迁移材料','学籍档案','一寸证件照','二寸证件照','电子证件照'])
const firstAdmissionTasks=new Set(['查看报到日期','确认报到地点','完成线上注册','缴纳学费','查询宿舍安排','校园卡办理','宿舍入住登记','激活学校邮箱','登录教务系统','确认学费','确认住宿费','激活银行卡','学校统一身份认证','学校邮箱'])
const firstDormItems=new Set(['床单','被套','枕套','枕头','被子','床垫','床帘','蚊帐','衣架','收纳盒','挂钩','小锁','插线板'])
const dormOnly=new Set(['查询宿舍安排','宿舍入住登记','确认住宿费','漱口杯','浴巾','拖鞋','洗衣液','湿巾','消毒湿巾','粘毛器','小扫把','睡衣','饭盒','筷子','餐具','少量零食','联系室友','确认宿舍床铺尺寸'])
const outOfTownOnly=new Set(['行李箱','颈枕','行李牌','证件包','确认车票'])
const luggageModuleOnly=new Set(['行李箱','行李牌','证件包'])
const returningExcluded=new Set([...firstAdmissionDocuments,...firstAdmissionTasks,...firstDormItems,'检查录取通知书','确认报到地址'])
const commuteKeep=new Set(['身份证','银行卡','手机','电脑','耳机','手机充电器','电脑充电器','数据线','充电宝','纸巾','短袖','长袖','长裤','内衣','袜子','外套','运动鞋','双肩包','个人长期使用药物','笔记本','签字笔','铅笔','橡皮','荧光笔','便利贴','文件夹','计算器','专业学习工具','水杯','雨伞','少量现金','手机资料备份','电脑资料备份','检查身份证','检查手机','检查充电器','设置紧急联系人'])
const returningDormKeep=new Set([...commuteKeep,'牙刷','牙膏','洗面奶','洗发水','沐浴露','毛巾','拖鞋','洗衣液','湿巾','垃圾袋','睡衣','体温计','退烧药','感冒药','餐具','联系室友'])
const localCommuteKeepByCategory=new Set(['electronics:手机','electronics:电脑','electronics:耳机','electronics:手机充电器','electronics:电脑充电器','electronics:数据线','electronics:充电宝','medical:个人长期使用药物','study:笔记本','study:签字笔','study:文件夹','study:计算器','study:专业学习工具','travel:双肩包','travel:雨伞','travel:充电宝','travel:少量现金'])
const offCampusExclude=new Set(['床帘','蚊帐','衣架','收纳盒','挂钩','小锁','插线板','查询宿舍安排','宿舍入住登记','确认住宿费','联系室友','确认宿舍床铺尺寸','查看宿舍开放时间'])
const offCampusLivingCategories=new Set(['wash','clean','clothes','food'])
const returningFixedDorm=new Set(['漱口杯','拖鞋','餐具','睡衣'])
const returningPersonal=new Set(['牙刷','洗面奶','毛巾'])
const returningConsumables=new Set(['牙膏','洗发水','沐浴露','洗衣液','纸巾','湿巾','垃圾袋','退烧药','感冒药'])
const studyBasics=new Set(['笔记本','签字笔','铅笔','橡皮','荧光笔','便利贴','文件夹','计算器','专业学习工具'])

const extras:ExtraSeed[]=[
 ['new-materials','documents','新生报到材料','document','essential','按学校通知逐项核对，纸质材料集中放入证件袋',{studentStatuses:['new'],newStudentOnly:true,reason:'新生报到'}],
 ['ug-party','documents','党员材料','document','optional','如需转接组织关系，按学院通知准备',{studentStatuses:['new'],educationStages:['undergraduate'],reason:'本科新生按需'}],
 ['ug-hardship','documents','家庭经济困难相关材料','document','optional','申请资助时按学校要求准备',{studentStatuses:['new'],educationStages:['undergraduate'],reason:'本科新生按需'}],
 ['pg-diploma','documents','本科毕业证','document','essential','部分学校报到时需要核验原件，请以学校通知为准',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-degree','documents','本科学位证','document','essential','建议携带原件，并提前准备复印件',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-degree-copy','documents','本科毕业证 / 学位证复印件','document','recommended','可提前准备 2–3 份，具体以学校要求为准',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-school','registration','确认学院报到要求','task','essential','研究生院和学院可能分别发布通知，建议都查看',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生学院报到'}],
 ['pg-system','registration','查看研究生培养系统','task','recommended','部分学校研究生课程和培养计划使用独立系统',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生培养'}],
 ['pg-supervisor','registration','查看导师 / 课题组通知','task','optional','如已收到导师或课题组安排，注意及时确认',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生按需'}],
 ['pg-lab','registration','学院 / 实验室报到','task','recommended','确认是否需要到学院、培养单位或实验室另行报到',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生学院报到'}],
 ['student-card','documents','学生证 / 校园卡','document','recommended','返校出行、进校或办理校园事务时可能会用到',{studentStatuses:['returning'],reason:'已有校园身份'}],
 ['term-notice','departure','查看新学期开学通知','task','essential','确认返校日期、进校要求及学院通知',{studentStatuses:['returning'],returningStudentOnly:true,reason:'老生返校'}],
 ['return-date','departure','确认返校日期','task','essential',undefined,{studentStatuses:['returning'],returningStudentOnly:true,reason:'老生返校'}],
 ['dorm-open','departure','查看宿舍开放时间','task','recommended','避免早于宿舍开放时间到校',{studentStatuses:['returning'],accommodations:['dorm'],reason:'住校返校'}],
 ['card-status','finance','检查校园卡状态','task','recommended','确认校园卡可正常使用，余额不足可提前充值',{studentStatuses:['returning'],reason:'老生返校'}],
 ['network-status','finance','检查校园网 / 校园账号','task','recommended','确认密码和账号状态，避免开学后无法登录',{studentStatuses:['returning'],reason:'老生返校'}],
 ['timetable','study','查看新学期课表','task','essential',undefined,{studentStatuses:['returning'],reason:'新学期学习'}],
 ['course-result','study','查看选课结果','task','recommended',undefined,{studentStatuses:['returning'],reason:'新学期学习'}],
 ['course-material','study','检查教材或课程资料','task','recommended',undefined,{studentStatuses:['returning'],reason:'新学期学习'}],
 ['school-notice','study','查看学院 / 导师 / 辅导员通知','task','recommended',undefined,{studentStatuses:['returning'],reason:'新学期安排'}],
 ['replenish-wash','wash','检查洗漱用品是否需要补货','task','recommended','先回忆宿舍剩余库存，不够再补',{studentStatuses:['returning'],accommodations:['dorm'],reason:'返校补货'}],
 ['replenish-clean','clean','检查纸巾和清洁用品库存','task','recommended','先回忆宿舍剩余库存，不够再补',{studentStatuses:['returning'],accommodations:['dorm'],reason:'返校补货'}],
 ['commute-route','commute','查看通勤路线','task','essential','开学前确认公交、地铁或校车路线及所需时间',{accommodations:['commute'],reason:'走读通勤'}],
 ['commute-time','commute','预留通勤时间','task','recommended','开学初建议多预留一些时间，避免迟到',{accommodations:['commute'],reason:'走读通勤'}],
 ['commute-card','commute','校园卡 / 学生证','document','essential','每天进校或办理校园事务时随身携带',{accommodations:['commute'],reason:'走读日常携带'}],
 ['commute-bag','commute','随身包','physical','recommended','集中放置校园卡、纸巾、充电设备和课程资料',{accommodations:['commute'],reason:'走读日常携带'}],
 ['commute-material','commute','当天课程资料','physical','recommended','出门前按课表检查教材、作业和课堂用品',{accommodations:['commute'],reason:'走读日常携带'}],
 ['commute-water','commute','通勤水杯','physical','recommended','可长期放在通勤包，出门前确认已装水',{accommodations:['commute'],reason:'走读日常携带'}],
 ['commute-tissue','commute','随身纸巾','physical','recommended','放一小包在通勤包中，按需补充',{accommodations:['commute'],reason:'走读日常携带'}],
 ['training-unknown','registration','确认是否需要参加军训','task','recommended','查看学校新生通知，确认军训时间和物品要求',{studentStatuses:['new'],reason:'军训安排尚未确认'}],
]

const initialStatus=(type:ItemType):ItemStatus=>type==='physical'?'unchecked':type==='document'?'unprepared':'todo'
const makeExtra=(seed:ExtraSeed):ChecklistItem=>({id:`ctx-${seed[0]}`,categoryId:seed[1],name:seed[2],itemType:seed[3],priority:seed[4],helperText:seed[5],applicability:seed[6],status:initialStatus(seed[3]),quantity:1,tags:[],isSystemItem:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})

const matches=(rule:ItemRuleOverride,profile:UserProfile)=>{const w=rule.when;return (!w.studentStatuses||w.studentStatuses.includes(profile.studentStatus))&&(!w.educationStages||(!!profile.educationStage&&w.educationStages.includes(profile.educationStage)))&&(!w.accommodations||w.accommodations.includes(profile.accommodation))&&(w.outOfTown===undefined||w.outOfTown===profile.outOfTown)&&(!w.militaryTraining||w.militaryTraining.includes(profile.militaryTraining||'no'))}
function scenarioRules(item:ChecklistItem):ItemRuleOverride[]{const rules:ItemRuleOverride[]=[]
 if(item.categoryId==='clothes'||item.categoryId==='beauty')rules.push({when:{accommodations:['commute'],outOfTown:false},visible:false})
 if(['dorm','wash','clean','food'].includes(item.categoryId))rules.push({when:{accommodations:['commute'],outOfTown:false},visible:false})
 if(profileKey(item)&&localCommuteKeepByCategory.has(profileKey(item)))rules.push({when:{accommodations:['commute'],outOfTown:false},visible:true})
 if(offCampusExclude.has(item.name)||item.categoryId==='dorm')rules.push({when:{accommodations:['commute'],outOfTown:true},visible:false})
 if(offCampusLivingCategories.has(item.categoryId))rules.push({when:{accommodations:['commute'],outOfTown:true},visible:true,priority:'recommended',helperText:'校外住处如已配备或假期留存，可直接标记为已有'})
 if(firstDormItems.has(item.name)&&['床单','被套','枕套','枕头','被子','床垫'].includes(item.name))rules.push({when:{studentStatuses:['new'],accommodations:['commute'],outOfTown:true},visible:true,priority:item.name==='床垫'?'recommended':'essential',helperText:'如校外住处未提供，请提前确认配置'})
 if(returningFixedDorm.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:false})
 if(returningPersonal.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:true,priority:'optional',helperText:'如果假期带回家了记得带回；留在宿舍可直接标记为已有'})
 if(returningConsumables.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:true,priority:'recommended',helperText:'先确认宿舍剩余量，不够再补',tags:['返校补货']})
 if(studyBasics.has(item.name))rules.push({when:{studentStatuses:['returning']},priority:item.priority==='optional'?'optional':'recommended',helperText:'先检查上学期剩余用品，需要再补'})
 if(item.categoryId==='beauty')rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},priority:'optional',helperText:'带日常使用的即可；如留在宿舍可直接标记为已有'})
 if(item.categoryId==='medical'&&item.name!=='个人长期使用药物')rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},priority:'optional',helperText:'先检查宿舍现有药品是否过期或需要补充'},{when:{accommodations:['commute'],outOfTown:false},visible:false})
 return rules}
const profileKey=(item:ChecklistItem)=>`${item.categoryId}:${item.name}`

function inferredApplicability(item:ChecklistItem):ItemApplicability {
 const a:ItemApplicability={studentStatuses:ALL_STATUSES,reason:'通用基础'}
 if(undergraduateOnly.has(item.name))Object.assign(a,{studentStatuses:['new'],educationStages:['undergraduate'],newStudentOnly:true,reason:'本科新生材料'})
 if(firstAdmissionDocuments.has(item.name)||firstAdmissionTasks.has(item.name))Object.assign(a,{studentStatuses:['new'],newStudentOnly:true,reason:'首次入学'})
 if(firstDormItems.has(item.name))Object.assign(a,{studentStatuses:['new'],accommodations:['dorm'],firstDormMoveInOnly:true,reason:'首次住校'})
 if(item.categoryId==='dorm'||dormOnly.has(item.name))Object.assign(a,{accommodations:['dorm'],reason:a.firstDormMoveInOnly?'首次住校':'住校生活'})
 if(item.categoryId==='training')Object.assign(a,{studentStatuses:['new'],militaryTraining:true,reason:'新生参加军训'})
 if(item.categoryId==='beauty')Object.assign(a,{modules:['beauty'],reason:'用户选择护肤或化妆'})
 if(outOfTownOnly.has(item.name))Object.assign(a,{outOfTown:true,reason:'异地出行'})
 if(luggageModuleOnly.has(item.name))Object.assign(a,{modules:['luggage'],reason:'用户启用行李整理'})
 return a
}

function baseApplicability(item:ChecklistItem,profile:UserProfile){
 const a=item.applicability||inferredApplicability(item)
 if(a.studentStatuses&&!a.studentStatuses.includes(profile.studentStatus))return false
 if(a.educationStages&&(!profile.educationStage||!a.educationStages.includes(profile.educationStage)))return false
 if(a.accommodations&&!a.accommodations.includes(profile.accommodation))return false
 if(a.outOfTown!==undefined&&a.outOfTown!==profile.outOfTown)return false
 if(a.militaryTraining===true&&profile.militaryTraining!=='yes')return false
 if(item.id==='ctx-training-unknown'&&profile.militaryTraining!=='unknown')return false
 if(a.newStudentOnly&&profile.studentStatus!=='new')return false
 if(a.returningStudentOnly&&profile.studentStatus!=='returning')return false
 if(a.firstDormMoveInOnly&&(profile.accommodation!=='dorm'||profile.studentStatus!=='new'))return false
 if(a.modules?.includes('beauty')&&!profile.enableSkincare&&!profile.enableMakeup)return false
 if(a.modules?.includes('luggage')&&!profile.enableLuggage)return false
 if(profile.accommodation==='commute'&&item.categoryId!=='commute'&&!commuteKeep.has(item.name)&&!firstAdmissionDocuments.has(item.name)&&!firstAdmissionTasks.has(item.name)&&!undergraduateOnly.has(item.name)&&!item.id.startsWith('ctx-'))return false
 if(profile.studentStatus==='returning'&&(returningExcluded.has(item.name)||(!returningDormKeep.has(item.name)&&!item.id.startsWith('ctx-'))))return false
 if(!profile.outOfTown&&outOfTownOnly.has(item.name))return false
 return true
}

export function resolveItemForProfile(item:ChecklistItem,profile:UserProfile){
 let visible=baseApplicability(item,profile);let priority=item.priority;let helperText=item.helperText;let status=item.status;let tags=[...item.tags]
 for(const rule of [...scenarioRules(item),...(item.rules||[])])if(matches(rule,profile)){if(rule.visible!==undefined)visible=rule.visible;if(rule.priority)priority=rule.priority;if(rule.helperText!==undefined)helperText=rule.helperText;if(rule.status)status=rule.status;if(rule.tags)tags=[...new Set([...tags,...rule.tags])]}
 return {visible,priority,helperText,status,tags}
}
export function isItemApplicable(item:ChecklistItem,profile:UserProfile){return resolveItemForProfile(item,profile).visible}

export function generateChecklist(profile:UserProfile,previous:ChecklistItem[]=[]){
 const master=[...makeDefaultItems(),...extras.map(makeExtra)].map(item=>({...item,applicability:item.applicability||inferredApplicability(item)}))
 const prior=new Map(previous.filter(x=>x.isSystemItem).map(x=>[x.id,x]));const custom=previous.filter(x=>!x.isSystemItem)
 return [...master.map(item=>{const resolved=resolveItemForProfile(item,profile);const old=prior.get(item.id);const merged=old?{...item,status:old.status,quantity:old.quantity,note:old.note,estimatedPrice:old.estimatedPrice,actualPrice:old.actualPrice,purchasePlatform:old.purchasePlatform,reminderDate:old.reminderDate,luggageId:old.luggageId,updatedAt:old.updatedAt}:item;return {...merged,priority:resolved.priority,helperText:resolved.helperText,status:old?.status||resolved.status,tags:resolved.tags,hidden:!resolved.visible}}),...custom]
}

export function generateCategories(profile:UserProfile,items:ChecklistItem[],previous:Category[]=defaultCategories){const custom=previous.filter(c=>!c.isSystemCategory);return [...defaultCategories.map(c=>({...c,hidden:!items.some(i=>i.categoryId===c.id&&!i.hidden)})),...custom.map(c=>({...c,hidden:!items.some(i=>i.categoryId===c.id&&!i.hidden)}))]}
export function getPersonalizedTips(profile:UserProfile){const tips:string[]=[];if(profile.studentStatus==='new'&&profile.educationStage==='undergraduate')tips.push('报到材料建议统一放入文件袋，重要证件随身携带。','先查看学校是否统一提供床上用品，再决定购买。');if(profile.studentStatus==='new'&&profile.educationStage==='postgraduate')tips.push('提前查看研究生院和学院的报到要求。','毕业证、学位证原件与复印件建议分开放置。');if(profile.studentStatus==='returning')tips.push('看一眼新学期课表、选课结果和学院通知。','先检查宿舍或家中剩余用品，不够再补货。');if(profile.accommodation==='commute')tips.push('提前确认通勤路线，开学第一周多预留一些时间。','雨伞、水杯和充电设备可长期放在通勤包。');else tips.push('确认宿舍开放时间和近期天气，再安排到校行程。');if(profile.outOfTown)tips.push('车票、身份证和充电设备放在随身包，不要托运或邮寄。');return tips.slice(0,4)}
