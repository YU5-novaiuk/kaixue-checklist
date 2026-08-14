import { ChecklistItem } from '@/types/checklist'
export const isDone=(item:ChecklistItem)=>item.preparationStatus==='prepared'
export const progress=(items:ChecklistItem[])=>{const relevant=items.filter(x=>!x.hidden);const done=relevant.filter(isDone).length;return {done,total:relevant.length,percent:relevant.length?Math.round(done/relevant.length*100):0}}
export const essentialProgress=(items:ChecklistItem[])=>progress(items.filter(x=>x.priority==='essential'))
export const markPrepared=(item:ChecklistItem)=>({...item,preparationStatus:'prepared' as const,updatedAt:new Date().toISOString()})
export const markUnprepared=(item:ChecklistItem)=>({...item,preparationStatus:'unprepared' as const,updatedAt:new Date().toISOString()})
export const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
export const daysUntil=(date?:string)=>date?Math.ceil((new Date(date+'T12:00:00').getTime()-Date.now())/86400000):null
export const money=(n:number)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(n)
