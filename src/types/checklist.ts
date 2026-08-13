export type Priority = 'essential' | 'recommended' | 'optional'
export type ItemType = 'physical' | 'document' | 'task'
export type StudentStatus = 'new'|'returning'
export type EducationStage = 'undergraduate'|'postgraduate'
export type AccommodationType = 'dorm'|'commute'
export type ItemStatus = 'unchecked' | 'unprepared' | 'prepared' | 'todo' | 'owned' | 'to_buy' | 'purchased' | 'packed' | 'buy_after_arrival' | 'completed' | 'not_needed'
export interface ItemApplicability { studentStatuses?:StudentStatus[]; educationStages?:EducationStage[]; accommodations?:AccommodationType[]; militaryTraining?:boolean; outOfTown?:boolean; newStudentOnly?:boolean; returningStudentOnly?:boolean; firstDormMoveInOnly?:boolean; modules?:Array<'beauty'|'luggage'>; reason?:string }
export interface ItemRuleCondition { studentStatuses?:StudentStatus[]; educationStages?:EducationStage[]; accommodations?:AccommodationType[]; outOfTown?:boolean; militaryTraining?:Array<'yes'|'no'|'unknown'> }
export interface ItemRuleOverride { when:ItemRuleCondition; visible?:boolean; priority?:Priority; helperText?:string; status?:ItemStatus; tags?:string[] }
export interface ChecklistItem { id:string; name:string; categoryId:string; itemType:ItemType; priority:Priority; status:ItemStatus; helperText?:string; applicability?:ItemApplicability; rules?:ItemRuleOverride[]; quantity?:number; estimatedPrice?:number; actualPrice?:number; purchasePlatform?:string; reminderDate?:string; luggageId?:string; tags:string[]; note?:string; isSystemItem:boolean; hidden?:boolean; createdAt:string; updatedAt:string }
export interface Category { id:string; name:string; icon:string; order:number; isSystemCategory:boolean; hidden?:boolean }
export interface Luggage { id:string; name:string; icon:string; order:number }
export interface UserProfile { studentStatus:StudentStatus; educationStage?:EducationStage; accommodation:AccommodationType; outOfTown:boolean; militaryTraining?:'yes'|'no'|'unknown'; city?:string; registrationDate?:string; enableSkincare:boolean; enableMakeup:boolean; enableBudget:boolean; enableLuggage:boolean; needsIdentityConfirmation?:boolean }
export interface AppData { version:number; onboarded:boolean; profile:UserProfile; categories:Category[]; items:ChecklistItem[]; luggage:Luggage[] }
