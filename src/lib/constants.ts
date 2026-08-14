import { ItemType,PreparationStatus,Priority,PurchaseStatus } from '@/types/checklist'
export const preparationStatusLabels:Record<PreparationStatus,string>={unprepared:'未准备',in_progress:'准备中',prepared:'已准备'}
export const purchaseStatusLabels:Record<PurchaseStatus,string>={not_required:'不需要购买',to_buy:'待购买',purchased:'已购买',buy_after_arrival:'到校购买'}
export const priorityLabels:Record<Priority,string>={essential:'必需',recommended:'建议',optional:'按需'}
export const itemTypeLabels:Record<ItemType,string>={physical:'物品',document:'证件资料',task:'待办事项'}
export const preparationStatuses:PreparationStatus[]=['unprepared','in_progress','prepared']
export const purchaseStatuses:PurchaseStatus[]=['not_required','to_buy','purchased','buy_after_arrival']
export const storageKey='campus-ready-data-v1'
export const DATA_VERSION=11
export const BACKUP_SCHEMA_VERSION=3
export const APP_IDENTIFIER='open-school-checklist'
