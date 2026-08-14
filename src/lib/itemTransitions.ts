import { ChecklistItem,PurchaseStatus } from '@/types/checklist'
export const CAMPUS_PARCEL_LOCATION='campus_parcel_station'
export function applyPurchaseStatusChange(item:ChecklistItem,purchaseStatus?:PurchaseStatus):ChecklistItem{return {...item,purchaseStatus,purchaseStatusOverride:purchaseStatus,preparationStatus:(purchaseStatus==='to_buy'||purchaseStatus==='buy_after_arrival')&&item.preparationStatus==='unprepared'?'in_progress':item.preparationStatus}}
export function toggleLuggageCompletion(item:ChecklistItem,luggageId:string):ChecklistItem{return {...item,preparationStatus:item.preparationStatus==='prepared'?'unprepared':'prepared',luggageId,updatedAt:new Date().toISOString()}}
export function isPackedForLuggage(item:ChecklistItem){return item.itemType==='physical'&&item.preparationStatus==='prepared'&&!!item.luggageId&&![CAMPUS_PARCEL_LOCATION,'other'].includes(item.luggageId)}
