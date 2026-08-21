import { ItemType,PreparationStatus,PurchaseStatus,UserProfile } from '@/types/checklist'
import { isSecondaryStudent } from './profileRules'

export interface RationalPrepSuggestion{name:string;reason:string;categoryId:string;itemType:ItemType;preparationStatus:PreparationStatus;purchaseStatus?:PurchaseStatus;tag:string}
export interface RationalPrepContent{show:boolean;eyebrow:string;title:string;lead:string;summary:string;suggestions:RationalPrepSuggestion[]}

const collegeSuggestions=[
 ['床帘','先确认学校床铺尺寸。'],['床垫','先确认尺寸和学校是否统一提供。'],['收纳架','先看看宿舍的实际空间。'],['路由器','部分学校校园网不需要路由器。'],['打印机','学校通常有便利的打印点。'],['垃圾桶','可以和室友共同购买。'],['大瓶洗衣液','异地出行时不必增加行李重量。'],['大功率电器','部分宿舍禁止使用，请先查看规定。'],
] as const

const collegeItem=(name:string,reason:string):RationalPrepSuggestion=>({name,reason,categoryId:'dorm',itemType:'physical',preparationStatus:'in_progress',purchaseStatus:'buy_after_arrival',tag:'到校后'})
const secondaryItem=(name:string,reason:string,categoryId:string):RationalPrepSuggestion=>({name,reason,categoryId,itemType:'physical',preparationStatus:'unprepared',tag:'理性准备'})

function secondaryLearningSuggestions(profile:UserProfile){
 if(profile.studentStatus==='returning')return [
  secondaryItem('新学期教辅','先等任课老师或学校统一要求，再决定是否购买','study'),
  secondaryItem('练习册 / 作业本补充','不同老师要求可能不同，先检查已有用品，明确后再补','study'),
  secondaryItem('文具补充','先补齐基础文具，其他按实际课程需要准备','study'),
  secondaryItem('计算器','先确认课程和考试是否允许使用','study'),
  secondaryItem('手机','先确认学校是否允许携带，以及具体保管和使用规定','study'),
  secondaryItem('平板电脑','先确认学校是否允许携带以及是否真正需要','study'),
  secondaryItem('笔记本电脑','中学阶段通常不是日常必需品，先看学校规定和实际需要','study'),
  secondaryItem('额外校服','先确认现有校服是否够用和学校统一安排','study'),
 ]
 return [
  secondaryItem('教辅资料','先等老师或学校统一要求，再决定购买','study'),
  secondaryItem('大量练习册','不同老师要求可能不同，不建议提前大量购买','study'),
  secondaryItem('额外文具','先准备基础文具，其他按实际课程需要补充','study'),
  secondaryItem('计算器','先确认课程和考试是否允许使用','study'),
  secondaryItem('手机','先确认学校是否允许携带，以及具体保管和使用规定','study'),
  secondaryItem('平板电脑','先确认学校是否允许携带以及是否真正需要','study'),
  secondaryItem('笔记本电脑','中学阶段通常不是日常必需品，先看学校规定和实际需要','study'),
  secondaryItem('额外校服','先确认学校统一发放数量，再决定是否增购','study'),
 ]
}

function secondaryDormSuggestions(profile:UserProfile){
 if(profile.accommodation!=='dorm')return []
 if(profile.studentStatus==='returning')return [secondaryItem('个人用品补充','先检查现有用品，确实用完或缺少时再补','wash')]
 return [
  secondaryItem('床垫','先确认学校是否统一提供以及床铺规格','dorm'),
  secondaryItem('床帘','先确认学校是否允许使用','dorm'),
  secondaryItem('收纳用品','先看宿舍空间和学校规定','dorm'),
 ]
}

export function resolveRationalPrepContent(profile:UserProfile):RationalPrepContent{
 if(isSecondaryStudent(profile)){
  return {show:true,eyebrow:'理性准备',title:'先确认，再决定',lead:'先看学校通知、校规和老师要求，再决定是否需要购买。',summary:'学校是否提供、是否允许携带、是否真正需要，确认清楚再准备。',suggestions:[...secondaryLearningSuggestions(profile),...secondaryDormSuggestions(profile)]}
 }
 if(profile.accommodation!=='dorm')return {show:false,eyebrow:'走读准备',title:'无需宿舍购物建议',lead:'你的清单已按走读场景生成，首页不会展示宿舍用品建议。',summary:'',suggestions:[]}
 return {show:true,eyebrow:'不急着买',title:'建议到校后再决定',lead:'确认空间、尺寸与规定之后再购买，减少浪费。',summary:'先确认尺寸、空间和宿舍规定，减少买错与闲置。',suggestions:collegeSuggestions.map(([name,reason])=>collegeItem(name,reason))}
}
