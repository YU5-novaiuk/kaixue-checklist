export type Priority = 'essential' | 'recommended' | 'optional'
export type ItemType = 'physical' | 'document' | 'task'
export type ItemStatus = 'unchecked' | 'unprepared' | 'prepared' | 'todo' | 'owned' | 'to_buy' | 'purchased' | 'packed' | 'buy_after_arrival' | 'completed' | 'not_needed'
export interface ChecklistItem { id:string; name:string; categoryId:string; itemType:ItemType; priority:Priority; status:ItemStatus; helperText?:string; quantity?:number; estimatedPrice?:number; actualPrice?:number; purchasePlatform?:string; reminderDate?:string; luggageId?:string; tags:string[]; note?:string; isSystemItem:boolean; hidden?:boolean; createdAt:string; updatedAt:string }
export interface Category { id:string; name:string; icon:string; order:number; isSystemCategory:boolean; hidden?:boolean }
export interface Luggage { id:string; name:string; icon:string; order:number }
export interface UserProfile { studentType:'undergraduate_new'|'postgraduate_new'|'returning'|'other'; accommodation:'dorm'|'commute'; outOfTown:boolean; militaryTraining:'yes'|'no'|'unknown'; city?:string; registrationDate?:string; enableSkincare:boolean; enableMakeup:boolean; enableBudget:boolean; enableLuggage:boolean }
export interface AppData { version:number; onboarded:boolean; profile:UserProfile; categories:Category[]; items:ChecklistItem[]; luggage:Luggage[] }
