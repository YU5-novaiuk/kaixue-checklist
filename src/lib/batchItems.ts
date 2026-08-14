import { ChecklistItem,PreparationStatus,Priority,PurchaseStatus } from '@/types/checklist'
import { applyPurchaseStatusChange } from '@/lib/itemTransitions'
import { supportsLocation,supportsPurchase } from '@/lib/itemCapabilities'
export type BatchItemPatch={categoryId?:string;priority?:Priority;preparationStatus?:PreparationStatus;purchaseStatus?:PurchaseStatus|null;luggageId?:string|null}
export function applyBatchItemPatch(item:ChecklistItem,patch:BatchItemPatch,updatedAt:string):ChecklistItem{
 let next={...item,updatedAt}
 if(patch.categoryId!==undefined)next.categoryId=patch.categoryId
 if(patch.priority!==undefined)next.priority=patch.priority
 if(patch.preparationStatus!==undefined)next.preparationStatus=patch.preparationStatus
 if(supportsPurchase(item)&&patch.purchaseStatus!==undefined)next=applyPurchaseStatusChange(next,patch.purchaseStatus||undefined)
 if(supportsLocation(item)&&patch.luggageId!==undefined)next.luggageId=patch.luggageId||undefined
 return next
}
