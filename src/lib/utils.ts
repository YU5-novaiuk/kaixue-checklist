import { doneStatuses } from './constants'
import { ChecklistItem } from '@/types/checklist'
export const isDone=(item:ChecklistItem)=>doneStatuses.includes(item.status)
export const progress=(items:ChecklistItem[])=>{const visible=items.filter(x=>!x.hidden&&x.status!=='not_needed');const done=visible.filter(isDone).length;return {done,total:visible.length,percent:visible.length?Math.round(done/visible.length*100):0}}
export const essentialProgress=(items:ChecklistItem[])=>progress(items.filter(x=>x.priority==='essential'))
export const completedStatus=(item:ChecklistItem)=>item.itemType==='physical'?'owned':item.itemType==='document'?'prepared':'completed'
export const pendingStatus=(item:ChecklistItem)=>item.itemType==='physical'?'unchecked':item.itemType==='document'?'unprepared':'todo'
export const uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`
export const daysUntil=(date?:string)=>date?Math.ceil((new Date(date+'T12:00:00').getTime()-Date.now())/86400000):null
export const money=(n:number)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(n)
