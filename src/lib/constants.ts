import { ItemStatus, ItemType, Priority } from '@/types/checklist'
export const statusLabels:Record<ItemStatus,string>={unchecked:'未确认',unprepared:'未准备',prepared:'已准备',todo:'待办理',owned:'已有',to_buy:'待购买',purchased:'已购买',packed:'已装箱',buy_after_arrival:'到校购买',completed:'已完成',not_needed:'暂不需要'}
export const priorityLabels:Record<Priority,string>={essential:'必需',recommended:'建议',optional:'按需'}
export const itemTypeLabels:Record<ItemType,string>={physical:'物品',document:'证件资料',task:'待办事项'}
export const statusesByType:Record<ItemType,ItemStatus[]>={physical:['unchecked','owned','to_buy','purchased','packed','buy_after_arrival','not_needed'],document:['unprepared','prepared','packed','not_needed'],task:['todo','completed','not_needed']}
export const doneStatuses:ItemStatus[]=['owned','prepared','packed','completed','not_needed']
export const storageKey='campus-ready-data-v1'
