import { defaultCategories, makeDefaultItems } from '../data/defaults'
import { Category,ChecklistItem,ItemApplicability,ItemRuleOverride,ItemType,Priority,PurchaseStatus,StudentStatus,UserProfile } from '@/types/checklist'
import { isSecondaryStudent } from './profileRules'

type ExtraSeed=[id:string,categoryId:string,name:string,itemType:ItemType,priority:Priority,helperText?:string,applicability?:ItemApplicability]
const ALL_STATUSES:StudentStatus[]=['new','returning']
const undergraduateOnly=new Set(['团员证','助学贷款材料'])
const SANITARY_PAD_ID='ctx-female-sanitary-pad'
const firstAdmissionDocuments=new Set(['录取通知书','身份证复印件','户口迁移材料','学籍档案','一寸证件照','二寸证件照','电子证件照'])
const firstAdmissionTasks=new Set(['查看报到日期','确认报到地点','完成线上注册','缴纳学费','查询宿舍安排','校园卡办理','宿舍入住登记','激活学校邮箱','登录教务系统','确认学费','确认住宿费','激活银行卡','学校统一身份认证','学校邮箱'])
const firstDormItems=new Set(['床单','被套','枕套','枕头','被子','床垫','床帘','蚊帐','衣架','收纳盒','挂钩','小锁','插线板'])
const dormOnly=new Set(['查询宿舍安排','宿舍入住登记','确认住宿费','漱口杯','浴巾','拖鞋','洗衣液','湿巾','消毒湿巾','粘毛器','小扫把','睡衣','饭盒','筷子','餐具','少量零食','联系室友','确认宿舍床铺尺寸'])
const outOfTownOnly=new Set(['行李箱','颈枕','行李牌','证件包','确认车票'])
const luggageModuleOnly=new Set(['行李箱','行李牌','证件包'])
const returningExcluded=new Set([...firstAdmissionDocuments,...firstAdmissionTasks,...firstDormItems,'检查录取通知书','确认报到地址'])
const commuteKeep=new Set(['身份证','银行卡','手机','电脑','耳机','手机充电器','电脑充电器','数据线','充电宝','纸巾','衣服','鞋子','双肩包','个人长期使用药物','笔记本','签字笔','铅笔','橡皮','荧光笔','便利贴','文件夹','计算器','专业学习工具','水杯','雨伞','少量现金','手机资料备份','电脑资料备份','检查身份证','检查手机','检查充电器','设置紧急联系人'])
const returningDormKeep=new Set([...commuteKeep,'牙刷','牙膏','洗面奶','洗发水','沐浴露','毛巾','拖鞋','洗衣液','湿巾','垃圾袋','睡衣','体温计','退烧药','感冒药','餐具','联系室友'])
const localCommuteKeepByCategory=new Set(['electronics:手机','electronics:电脑','electronics:耳机','electronics:手机充电器','electronics:电脑充电器','electronics:数据线','electronics:充电宝','medical:个人长期使用药物','study:笔记本','study:签字笔','study:文件夹','study:计算器','study:专业学习工具','travel:双肩包','travel:雨伞','travel:充电宝','travel:少量现金'])
const offCampusExclude=new Set(['床帘','蚊帐','衣架','收纳盒','挂钩','小锁','插线板','查询宿舍安排','宿舍入住登记','确认住宿费','联系室友','确认宿舍床铺尺寸','查看宿舍开放时间'])
const offCampusLivingCategories=new Set(['wash','clean','clothes','food'])
const returningFixedDorm=new Set(['漱口杯','拖鞋','餐具'])
const returningPersonal=new Set(['牙刷','洗面奶','毛巾'])
const returningConsumables=new Set(['牙膏','洗发水','沐浴露','洗衣液','纸巾','湿巾','垃圾袋','退烧药','感冒药'])
const studyBasics=new Set(['笔记本','签字笔','铅笔','橡皮','荧光笔','便利贴','文件夹','计算器','专业学习工具'])
const outOfTownDormConsumables=new Set(['洗衣液','洗发水','沐浴露','纸巾'])
const secondaryLifeCategories=new Set(['dorm','wash','clean','clothes','beauty','medical','study','food','travel','training','commute'])
const secondaryAllowedItems=new Set([
 'documents:身份证','documents:身份证复印件','documents:一寸证件照','documents:二寸证件照','documents:新生报到材料',
 'registration:查看报到日期','registration:确认报到地点','registration:查询宿舍安排','registration:宿舍入住登记','registration:确认是否需要参加军训',
 'finance:校园卡充值',
 'departure:查看报到当天天气','departure:确认车票','departure:确认报到地址','departure:联系室友','departure:确认宿舍床铺尺寸','departure:检查身份证','departure:检查手机','departure:检查充电器','departure:设置紧急联系人','departure:查看新学期开学通知','departure:确认返校日期','departure:查看宿舍开放时间','departure:确认当天课程 / 集合安排',
])
const secondaryBlockedItems=new Set(['travel:充电宝','study:专业学习工具','study:查看选课结果','study:查看学院 / 导师 / 辅导员通知'])
const secondaryAdditionalAllowedItems=new Set(['documents:户口本或其他身份证明','registration:校园卡办理'])
const secondaryNeutralPurchaseItems=new Set([...firstDormItems,'小扫把','洗衣液','计算器','衣服','鞋子','校服'])

const extras:ExtraSeed[]=[
 ['new-materials','documents','新生报到材料','document','essential','按学校通知逐项核对，纸质材料集中放入证件袋',{studentStatuses:['new'],newStudentOnly:true,reason:'新生报到'}],
 ['ug-party','documents','党员材料','document','optional','如需转接组织关系，按学院通知准备',{studentStatuses:['new'],educationStages:['undergraduate'],reason:'专本科新生按需'}],
 ['ug-hardship','documents','家庭经济困难相关材料','document','optional','申请资助时按学校要求准备',{studentStatuses:['new'],educationStages:['undergraduate'],reason:'专本科新生按需'}],
 ['pg-diploma','documents','前置学历毕业证书','document','essential','按学校报到要求准备前置学历毕业证书原件；具体以录取学校通知为准',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-degree','documents','前置学历学位证书','document','essential','按学校报到要求准备前置学历学位证书原件，具体以学校通知为准',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-degree-copy','documents','前置学历证书复印件','document','recommended','如学校要求，提前准备毕业证书、学位证书复印件',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生新生学历核验'}],
 ['pg-school','registration','确认学院报到要求','task','essential','研究生院和学院可能分别发布通知，建议都查看',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生学院报到'}],
 ['pg-system','registration','查看研究生培养系统','task','recommended','部分学校研究生课程和培养计划使用独立系统',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生培养'}],
 ['pg-supervisor','registration','查看导师 / 课题组通知','task','optional','如已收到导师或课题组安排，注意及时确认',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生按需'}],
 ['pg-lab','registration','学院 / 实验室报到','task','recommended','确认是否需要到学院、培养单位或实验室另行报到',{studentStatuses:['new'],educationStages:['postgraduate'],reason:'研究生学院报到'}],
 ['hs-uniform','clothes','校服','physical','recommended','先确认学校的校服发放或购买安排，避免重复准备',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学新生'}],
 ['hs-file-bag','study','资料袋 / 文件袋','physical','recommended','用于集中收纳入学材料、试卷和通知',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学学习用品'}],
 ['hs-workbooks','study','作业本','physical','recommended','先准备基础数量，其他规格可按老师要求补充',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学学习用品'}],
 ['hs-learning-materials','study','学校要求的学习资料','physical','optional','以学校或老师发布的清单为准，不用提前大量购买',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学按需'}],
 ['hs-day-arrangement','departure','确认当天课程 / 集合安排','task','essential','以学校或班级发布的通知为准，确认到校时间、地点和当天安排',{educationStages:['secondary'],reason:'中学开学当天安排'}],
 ['hs-dress-requirement','departure','确认校服 / 穿着要求','task','optional','如学校明确要求校服或特定穿着，按通知确认即可',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学新生穿着要求'}],
 ['jh-household-proof','documents','户口本或其他身份证明','document','optional','按学校通知准备；尚未办理身份证时，以学校认可的身份证明为准',{studentStatuses:['new'],educationStages:['secondary'],reason:'中学新生按需证明'}],
 ['jh-red-pen','study','红笔','physical','recommended','准备基础数量即可，用完后再补',{educationStages:['secondary'],reason:'中学基础文具'}],
 ['jh-ruler','study','尺子','physical','recommended','基础直尺即可，其他工具按课程要求准备',{educationStages:['secondary'],reason:'中学基础文具'}],
 ['jh-pencil-case','study','笔袋','physical','recommended','能收纳日常基础文具即可，不必追求复杂套装',{educationStages:['secondary'],reason:'中学基础文具'}],
 ['jh-scratch-paper','study','草稿本','physical','recommended','先准备少量，后续按老师要求补充',{educationStages:['secondary'],reason:'中学基础文具'}],
 ['female-sanitary-pad','wash','卫生巾','physical','recommended','经期按平时用量多备 2～3 天；非经期带少量备用即可，到校后再补充。',{genders:['female'],reason:'女性基础个人用品'}],
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

const makeExtra=(seed:ExtraSeed):ChecklistItem=>({id:`ctx-${seed[0]}`,categoryId:seed[1],name:seed[2],itemType:seed[3],priority:seed[4],helperText:seed[5],applicability:seed[6],preparationStatus:'unprepared',quantity:1,tags:[],isSystemItem:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})

const matches=(rule:ItemRuleOverride,profile:UserProfile)=>{const w=rule.when;return (!w.studentStatuses||w.studentStatuses.includes(profile.studentStatus))&&(!w.educationStages||(!!profile.educationStage&&w.educationStages.includes(profile.educationStage)))&&(!w.accommodations||w.accommodations.includes(profile.accommodation))&&(w.outOfTown===undefined||w.outOfTown===profile.outOfTown)&&(!w.militaryTraining||w.militaryTraining.includes(profile.militaryTraining||'no'))}
function scenarioRules(item:ChecklistItem):ItemRuleOverride[]{const rules:ItemRuleOverride[]=[]
 if(item.categoryId==='clothes'||item.categoryId==='beauty')rules.push({when:{accommodations:['commute'],outOfTown:false},visible:false})
 if(['dorm','wash','clean','food'].includes(item.categoryId)&&item.id!==SANITARY_PAD_ID)rules.push({when:{accommodations:['commute'],outOfTown:false},visible:false})
 if(profileKey(item)&&localCommuteKeepByCategory.has(profileKey(item)))rules.push({when:{accommodations:['commute'],outOfTown:false},visible:true})
 if(offCampusExclude.has(item.name)||item.categoryId==='dorm')rules.push({when:{accommodations:['commute'],outOfTown:true},visible:false})
 if(offCampusLivingCategories.has(item.categoryId))rules.push({when:{accommodations:['commute'],outOfTown:true},visible:true,priority:'recommended',helperText:'校外住处如已配备或假期留存，可直接标记为已准备'})
 if(item.name==='睡衣')rules.push({when:{accommodations:['commute']},visible:false})
 if(firstDormItems.has(item.name)&&['床单','被套','枕套','枕头','被子','床垫'].includes(item.name))rules.push({when:{studentStatuses:['new'],accommodations:['commute'],outOfTown:true},visible:true,priority:item.name==='床垫'?'recommended':'essential',helperText:'如校外住处未提供，请提前确认配置'})
 if(returningFixedDorm.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:false})
 if(returningPersonal.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:true,priority:'optional',helperText:'如果假期带回家了记得带回；留在宿舍可直接标记为已准备'})
 if(returningConsumables.has(item.name))rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},visible:true,priority:'recommended',helperText:'先确认宿舍剩余量，不够再补',tags:['返校补货']})
 if(studyBasics.has(item.name))rules.push({when:{studentStatuses:['returning']},priority:item.priority==='optional'?'optional':'recommended',helperText:'先检查上学期剩余用品，需要再补'})
 if(item.categoryId==='beauty')rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},priority:'optional',helperText:'带日常使用的即可；如留在宿舍可直接标记为已准备'})
 if(item.categoryId==='medical'&&item.name!=='个人长期使用药物')rules.push({when:{studentStatuses:['returning'],accommodations:['dorm']},priority:'optional',helperText:'先检查宿舍现有药品是否过期或需要补充'},{when:{accommodations:['commute'],outOfTown:false},visible:false})
 return rules}
const profileKey=(item:ChecklistItem)=>`${item.categoryId}:${item.name}`
const isSystemFootBlisterPatch=(item:ChecklistItem)=>item.isSystemItem&&item.name==='防磨脚贴'
const isFootBlisterPatchApplicable=(item:ChecklistItem,profile:UserProfile)=>!isSystemFootBlisterPatch(item)||(item.categoryId==='training'&&profile.studentStatus==='new'&&profile.militaryTraining==='yes')
export function isSecondarySystemItemApplicable(item:ChecklistItem){
 if(!item.isSystemItem)return true
 if(secondaryBlockedItems.has(profileKey(item)))return false
 if(item.categoryId==='electronics')return false
 if(item.applicability?.educationStages?.includes('secondary'))return true
 return secondaryLifeCategories.has(item.categoryId)||secondaryAllowedItems.has(profileKey(item))||secondaryAdditionalAllowedItems.has(profileKey(item))
}

function secondaryProfileRule(item:ChecklistItem,profile:UserProfile):Pick<ItemRuleOverride,'visible'|'priority'|'helperText'>|undefined{
 if(profile.educationStage!=='secondary'||!item.isSystemItem)return undefined
 const localCommute=profile.accommodation==='commute'&&!profile.outOfTown
 const isDorm=profile.accommodation==='dorm'
 if(item.categoryId==='documents'){
  if(item.name==='身份证')return {priority:'optional',helperText:'如学校报到要求携带，按通知准备相应身份证明即可'}
  if(item.name==='身份证复印件')return {priority:'optional',helperText:'按学校通知准备；未明确要求时不用自行多印'}
  if(item.name==='一寸证件照'||item.name==='二寸证件照')return {priority:'optional',helperText:'如学校通知要求纸质照片，再按要求准备对应尺寸'}
 }
 if(item.categoryId==='dorm'){
  if(['床单','被套','枕套','枕头','被子'].includes(item.name))return {priority:'recommended',helperText:'先确认学校是否统一提供及床铺规格，再按通知准备'}
  if(item.name==='床垫')return {priority:'optional',helperText:'先确认学校是否统一提供床垫或床褥以及床铺规格'}
  if(item.name==='床帘')return {priority:'optional',helperText:'先确认学校是否允许使用'}
  if(item.name==='收纳盒')return {priority:'optional',helperText:'先看宿舍空间和学校规定，再决定是否需要'}
  if(item.name==='蚊帐')return {priority:'optional',helperText:'先确认学校是否统一提供或允许安装'}
  if(item.name==='插线板')return {priority:'optional',helperText:'先确认宿舍是否允许使用及插座配置'}
 }
 if(item.categoryId==='clean'&&item.name==='小扫把')return {priority:'optional',helperText:'先确认宿舍是否已有或学校是否统一提供清洁工具'}
 if(item.categoryId==='clothes'&&item.name==='校服')return {visible:profile.studentStatus==='new',priority:'recommended',helperText:'先确认学校统一发放或购买安排，避免重复准备'}
 if(item.categoryId==='wash'&&item.name==='洗衣液')return {priority:'optional',helperText:profile.outOfTown?'体积较大，可以到校确认住宿安排后再决定':'先确认宿舍是否允许自行洗衣，以及是否有统一洗衣安排'}
 if(item.categoryId==='registration'&&item.name==='校园卡办理')return {visible:profile.studentStatus==='new',priority:'recommended',helperText:'如学校统一办理，按通知准备所需材料即可'}
 if(item.categoryId==='departure'){
  if(item.name==='联系室友')return {visible:isDorm,priority:'optional',helperText:'如果学校已提供联系方式，可以按需沟通；没有的话不用特意联系'}
  if(item.name==='确认宿舍床铺尺寸')return {visible:isDorm&&profile.studentStatus==='new',priority:'recommended',helperText:'先看学校住宿通知，确认是否统一提供床品及床铺规格'}
  if(item.name==='检查身份证')return {priority:'optional',helperText:localCommute?'如学校报到要求携带，按通知准备相应身份证明即可':'如需携带，建议和其他报到材料放在一起，方便取用'}
  if(item.name==='检查手机')return {priority:'optional',helperText:'先确认学校是否允许携带，以及具体保管和使用规定'}
  if(item.name==='检查充电器')return {visible:false}
  if(item.name==='查看报到当天天气')return {visible:profile.studentStatus==='new',priority:'recommended',helperText:'根据天气和学校当天安排准备即可'}
  if(item.name==='确认车票')return {visible:profile.outOfTown,priority:'essential',helperText:'异地到校时确认日期、到达时间和下车地点'}
  if(item.name==='确认报到地址')return {visible:profile.studentStatus==='new',priority:'essential',helperText:'确认校门、报到点或集合地点，避免当天走错'}
  if(item.name==='查看新学期开学通知')return {visible:profile.studentStatus==='returning',priority:'essential',helperText:'确认返校日期、进校要求及学校或班级通知'}
  if(item.name==='确认返校日期')return {visible:profile.studentStatus==='returning',priority:'essential',helperText:'以学校或班级发布的返校通知为准'}
  if(item.name==='查看宿舍开放时间')return {visible:profile.studentStatus==='returning'&&isDorm,priority:'recommended',helperText:'按学校住宿安排确认返校入住时间'}
 }
 if(item.categoryId==='travel'){
  if(item.name==='双肩包')return {priority:'recommended',helperText:'按学校要求和当天安排放入报到材料、基础文具和水杯'}
  if(item.name==='雨伞')return {priority:'optional',helperText:'根据当天预报和个人需要携带'}
  if(item.name==='少量现金')return {priority:'optional',helperText:'如有临时现金需求再少量准备'}
  if(['行李箱','颈枕','行李牌','证件包'].includes(item.name))return {visible:profile.outOfTown}
 }
 if(item.categoryId==='commute'){
  if(item.name==='校园卡 / 学生证')return {visible:profile.studentStatus==='returning',priority:'recommended',helperText:'如学校日常进校需要，出门前确认带好'}
  if(item.name==='随身包')return {priority:'recommended',helperText:'按当天安排放入报到材料、纸巾和基础学习用品即可'}
  if(item.name==='当天课程资料')return {priority:'recommended',helperText:'按学校或班级通知检查教材、作业和课堂用品'}
 }
 if(item.categoryId==='study'){
  if(item.name==='计算器')return {priority:'optional',helperText:'先确认数学等课程和考试是否允许使用，再决定是否准备'}
  if(item.name==='查看新学期课表')return {visible:profile.studentStatus==='returning',priority:'essential',helperText:'确认开学当天课程、集合时间和教室安排'}
  if(item.name==='检查教材或课程资料')return {visible:profile.studentStatus==='returning',priority:'recommended',helperText:'按学校或任课老师通知检查即可'}
 }
 if(item.categoryId==='medical'&&item.name==='体温计')return {helperText:'按学校规定和个人情况准备，不必重复购买'}
 if(localCommute&&['联系室友','确认宿舍床铺尺寸'].includes(item.name))return {visible:false}
 return undefined
}

function isSecondaryScenarioBlocked(item:ChecklistItem,profile:UserProfile){
 if(!isSecondaryStudent(profile)||!item.isSystemItem)return false
 if(!isSecondarySystemItemApplicable(item)||secondaryProfileRule(item,profile)?.visible===false)return true
 if(profile.accommodation==='commute'&&(item.categoryId==='dorm'||dormOnly.has(item.name)))return true
 if(profile.accommodation==='commute'&&!profile.outOfTown&&['wash','clean','food','clothes','beauty'].includes(item.categoryId)&&item.id!==SANITARY_PAD_ID&&item.id!=='ctx-hs-uniform')return true
 return false
}

function inferredApplicability(item:ChecklistItem):ItemApplicability {
 const a:ItemApplicability={studentStatuses:ALL_STATUSES,reason:'通用基础'}
 if(undergraduateOnly.has(item.name))Object.assign(a,{studentStatuses:['new'],educationStages:['undergraduate'],newStudentOnly:true,reason:'专本科新生材料'})
 if(firstAdmissionDocuments.has(item.name)||firstAdmissionTasks.has(item.name))Object.assign(a,{studentStatuses:['new'],newStudentOnly:true,reason:'首次入学'})
 if(firstDormItems.has(item.name))Object.assign(a,{studentStatuses:['new'],accommodations:['dorm'],firstDormMoveInOnly:true,reason:'首次住校'})
 if(item.categoryId==='dorm'||dormOnly.has(item.name))Object.assign(a,{accommodations:['dorm'],reason:a.firstDormMoveInOnly?'首次住校':'住校生活'})
 if(item.categoryId==='training')Object.assign(a,{studentStatuses:['new'],militaryTraining:true,reason:'新生参加军训'})
 if(item.categoryId==='beauty')Object.assign(a,{reason:'用户可在分类管理中自行启用'})
 if(outOfTownOnly.has(item.name))Object.assign(a,{outOfTown:true,reason:'异地出行'})
 if(luggageModuleOnly.has(item.name))Object.assign(a,{reason:'异地行李整理'})
 return a
}

function baseApplicability(item:ChecklistItem,profile:UserProfile){
 const a=item.applicability||inferredApplicability(item)
 if(profile.educationStage==='secondary'&&!isSecondarySystemItemApplicable(item))return false
 if(!isFootBlisterPatchApplicable(item,profile))return false
 if(a.studentStatuses&&!a.studentStatuses.includes(profile.studentStatus))return false
 if(a.educationStages&&(!profile.educationStage||!a.educationStages.includes(profile.educationStage)))return false
 if(a.genders&&(!profile.gender||!a.genders.includes(profile.gender)))return false
 if(a.accommodations&&!a.accommodations.includes(profile.accommodation))return false
 if(a.outOfTown!==undefined&&a.outOfTown!==profile.outOfTown)return false
 if(a.militaryTraining===true&&profile.militaryTraining!=='yes')return false
 if(item.id==='ctx-training-unknown'&&profile.militaryTraining!=='unknown')return false
 if(a.newStudentOnly&&profile.studentStatus!=='new')return false
 if(a.returningStudentOnly&&profile.studentStatus!=='returning')return false
 if(a.firstDormMoveInOnly&&(profile.accommodation!=='dorm'||profile.studentStatus!=='new'))return false
 if(item.categoryId==='beauty')return false
 if(profile.accommodation==='commute'&&item.categoryId!=='commute'&&!commuteKeep.has(item.name)&&!firstAdmissionDocuments.has(item.name)&&!firstAdmissionTasks.has(item.name)&&!undergraduateOnly.has(item.name)&&!item.id.startsWith('ctx-'))return false
 if(profile.studentStatus==='returning'&&(returningExcluded.has(item.name)||(!returningDormKeep.has(item.name)&&!item.id.startsWith('ctx-'))))return false
 if(!profile.outOfTown&&outOfTownOnly.has(item.name))return false
 return true
}

function resolvePurchaseStatus(item:ChecklistItem,profile:UserProfile):PurchaseStatus|undefined{
 if(item.itemType!=='physical')return undefined
 if(['衣服','鞋子'].includes(item.name))return 'not_required'
 if(profile.educationStage==='secondary'&&secondaryNeutralPurchaseItems.has(item.name))return undefined
 if(profile.studentStatus==='returning')return 'not_required'
 if(profile.studentStatus==='new'&&profile.accommodation==='dorm'&&profile.outOfTown&&outOfTownDormConsumables.has(item.name))return 'buy_after_arrival'
 return item.purchaseStatus
}

export function resolveItemForProfile(item:ChecklistItem,profile:UserProfile){
 let visible=baseApplicability(item,profile);let priority=item.priority;let helperText=item.helperText;let preparationStatus=item.preparationStatus;let tags=[...item.tags]
 for(const rule of [...scenarioRules(item),...(item.rules||[])])if(matches(rule,profile)){if(rule.visible!==undefined)visible=rule.visible;if(rule.priority)priority=rule.priority;if(rule.helperText!==undefined)helperText=rule.helperText;if(rule.preparationStatus)preparationStatus=rule.preparationStatus;if(rule.tags)tags=[...new Set([...tags,...rule.tags])]}
 const secondaryRule=secondaryProfileRule(item,profile);if(secondaryRule){if(secondaryRule.visible!==undefined)visible=secondaryRule.visible;if(secondaryRule.priority)priority=secondaryRule.priority;if(secondaryRule.helperText!==undefined)helperText=secondaryRule.helperText}
 if(item.applicability?.educationStages&&(!profile.educationStage||!item.applicability.educationStages.includes(profile.educationStage)))visible=false
 if(item.applicability?.genders&&(!profile.gender||!item.applicability.genders.includes(profile.gender)))visible=false
 if(item.categoryId==='training'&&(profile.studentStatus!=='new'||profile.militaryTraining!=='yes'))visible=false
 if(profile.educationStage==='secondary'&&!isSecondarySystemItemApplicable(item))visible=false
 if(!isFootBlisterPatchApplicable(item,profile))visible=false
 return {visible,priority,helperText,preparationStatus,purchaseStatus:isSystemFootBlisterPatch(item)&&!visible?undefined:resolvePurchaseStatus(item,profile),tags}
}
export function isItemApplicable(item:ChecklistItem,profile:UserProfile){return resolveItemForProfile(item,profile).visible}

export function generateChecklist(profile:UserProfile,previous:ChecklistItem[]=[],forcedVisibleCategories:string[]=[]){
 const custom=previous.filter(x=>!x.isSystemItem);const hasCustomSanitaryPad=custom.some(item=>item.name.trim()==='卫生巾')
 const master=[...makeDefaultItems(),...extras.map(makeExtra)].filter(item=>item.id!==SANITARY_PAD_ID||!hasCustomSanitaryPad).map(item=>({...item,applicability:item.applicability||inferredApplicability(item)}))
 const forced=new Set(forcedVisibleCategories);const prior=new Map(previous.filter(x=>x.isSystemItem).map(x=>[x.id,x]))
 return [...master.map(item=>{const resolved=resolveItemForProfile(item,profile);const old=prior.get(item.id);const merged=old?{...item,priorityOverride:old.priorityOverride,preparationStatus:old.preparationStatus,purchaseStatusOverride:old.purchaseStatusOverride,quantity:old.quantity,note:old.note,systemTipHidden:old.systemTipHidden??false,visibilityOverride:old.visibilityOverride,actualPrice:old.actualPrice,purchasePlatform:old.purchasePlatform,reminderDate:old.reminderDate,luggageId:old.luggageId,updatedAt:old.updatedAt}:item;const trainingBlocked=item.categoryId==='training'&&(profile.studentStatus!=='new'||profile.militaryTraining!=='yes');const strictlyBlocked=isSecondaryScenarioBlocked(item,profile)||trainingBlocked||!isFootBlisterPatchApplicable(item,profile);const clearSystemDefaultPurchase=strictlyBlocked&&item.isSystemItem&&!merged.purchaseStatusOverride;return {...merged,priority:old?.priorityOverride??resolved.priority,helperText:resolved.helperText,preparationStatus:old?.preparationStatus||resolved.preparationStatus,purchaseStatusOverride:strictlyBlocked&&isSystemFootBlisterPatch(item)?undefined:merged.purchaseStatusOverride,purchaseStatus:(strictlyBlocked&&isSystemFootBlisterPatch(item))||clearSystemDefaultPurchase?undefined:old?.purchaseStatusOverride??resolved.purchaseStatus,tags:resolved.tags,hidden:strictlyBlocked?true:old?.visibilityOverride==='hide'?true:forced.has(item.categoryId)?false:!resolved.visible}}),...custom]
}

export function generateCategories(profile:UserProfile,items:ChecklistItem[],previous:Category[]=defaultCategories){const existing=new Map(previous.map(c=>[c.id,c]));const custom=previous.filter(c=>!c.isSystemCategory);const merge=(c:Category)=>{const old=existing.get(c.id);const automatic=!items.some(i=>i.categoryId===c.id&&!i.hidden);return {...c,order:old?.order??c.order,visibilityOverride:old?.visibilityOverride,hidden:old?.visibilityOverride==='show'?false:old?.visibilityOverride==='hide'?true:automatic}};return [...defaultCategories.map(merge),...custom.map(merge)].sort((a,b)=>a.order-b.order)}
export function getPersonalizedTips(profile:UserProfile){const tips:string[]=[];const secondary=isSecondaryStudent(profile);if(profile.studentStatus==='new'&&secondary)tips.push('基础文具先少量准备，教辅和练习册等老师要求明确后再买。','身份证明、证件照等按学校通知准备，不用自行扩充。');if(profile.studentStatus==='new'&&profile.educationStage==='undergraduate')tips.push('报到材料建议统一放入文件袋，重要证件随身携带。','先查看学校是否统一提供床上用品，再决定购买。');if(profile.studentStatus==='new'&&profile.educationStage==='postgraduate')tips.push('提前查看研究生院和学院的报到要求。','前置学历证书原件与复印件建议按学校通知准备。');if(profile.studentStatus==='returning')tips.push(secondary?'查看学校或班级发布的返校、课程和集合安排。':'看一眼新学期课表、选课结果和学院通知。',secondary&&profile.accommodation==='commute'?'按新学期安排检查需要补带的学习和个人用品。':'先检查宿舍或家中剩余用品，不够再补货。');if(profile.accommodation==='commute')tips.push('提前确认通勤路线，开学第一周多预留一些时间。',secondary?'按学校规定和当天安排整理随身物品。':'雨伞、水杯和充电设备可长期放在通勤包。');else tips.push('确认宿舍开放时间和近期天气，再安排到校行程。');if(profile.outOfTown)tips.push(secondary?'车票和报到材料放在方便取用的位置，到校前再核对一次。':'车票、身份证和充电设备放在随身包，不要托运或邮寄。');return tips.slice(0,4)}
