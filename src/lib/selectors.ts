import { Category,ChecklistItem } from '@/types/checklist'
import { isDone } from './utils'
import { supportsPurchase } from './itemCapabilities'
export type QuickFilter='all'|'essential'|'unprepared'|'in_progress'|'prepared'
export type PurchaseFilter='all'|'pending'|'buy_after_arrival'|'purchased'
export function getItemSecondaryText(item:ChecklistItem){const note=item.note?.trim();if(note)return {text:note,type:'note' as const};if(item.helperText&&!item.systemTipHidden)return {text:item.helperText,type:'system-tip' as const};return null}
export function getVisibleItems(items:ChecklistItem[],categories:Category[]){return items.filter(item=>!item.hidden&&categories.some(c=>c.id===item.categoryId&&!c.hidden))}
export function matchesQuickFilter(item:ChecklistItem,filter:string){if(filter==='essential')return item.priority==='essential';if(filter==='unprepared'||filter==='in_progress'||filter==='prepared')return item.preparationStatus===filter;return true}
export function getFilteredItems(items:ChecklistItem[],categories:Category[],filter:string){return getVisibleItems(items,categories).filter(item=>matchesQuickFilter(item,filter))}
export const isPendingPurchase=(item:ChecklistItem)=>supportsPurchase(item)&&item.purchaseStatus==='to_buy'
export const isPurchased=(item:ChecklistItem)=>supportsPurchase(item)&&item.purchaseStatus==='purchased'
export const isBuyAfterArrival=(item:ChecklistItem)=>supportsPurchase(item)&&item.purchaseStatus==='buy_after_arrival'
export function getPurchasableItems(items:ChecklistItem[],categories:Category[]){return getVisibleItems(items,categories).filter(item=>supportsPurchase(item)&&(item.purchaseStatus==='to_buy'||item.purchaseStatus==='buy_after_arrival'||item.purchaseStatus==='purchased'||item.actualPrice!==undefined))}
export function filterPurchases(items:ChecklistItem[],filter:PurchaseFilter){if(filter==='pending')return items.filter(isPendingPurchase);if(filter==='buy_after_arrival')return items.filter(isBuyAfterArrival);if(filter==='purchased')return items.filter(isPurchased);return items}
export function getPurchaseStats(items:ChecklistItem[],categories:Category[]){const purchasable=getPurchasableItems(items,categories);return {items:purchasable,actual:purchasable.reduce((sum,i)=>sum+(i.actualPrice||0),0),pendingCount:purchasable.filter(isPendingPurchase).length,buyAfterArrivalCount:purchasable.filter(isBuyAfterArrival).length,purchasedCount:purchasable.filter(isPurchased).length,missingActualCount:purchasable.filter(i=>isPurchased(i)&&i.actualPrice===undefined).length}}
export const getPreparedCount=(items:ChecklistItem[])=>items.filter(isDone).length
