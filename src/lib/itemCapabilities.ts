import { ChecklistItem } from '@/types/checklist'

const digitalOnlyDocuments=new Set(['电子证件照'])

export const supportsPurchase=(item:ChecklistItem)=>item.itemType==='physical'
export const supportsLocation=(item:ChecklistItem)=>item.itemType==='physical'||(item.itemType==='document'&&!digitalOnlyDocuments.has(item.name))
