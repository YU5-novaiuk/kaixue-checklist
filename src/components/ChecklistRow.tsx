'use client'
import { Check,ChevronRight } from 'lucide-react'
import { ChecklistItem } from '@/types/checklist'
import { isDone } from '@/lib/utils'
import { priorityLabels,statusLabels } from '@/lib/constants'
export function ChecklistRow({item,onToggle,onOpen}:{item:ChecklistItem;onToggle:()=>void;onOpen:()=>void}){const done=isDone(item);return <div className={`check-row ${done?'done':''} ${item.priority==='optional'?'optional-item':''}`}><button className="check-button" onClick={onToggle} aria-label={done?'标记未完成':'标记完成'}>{done&&<Check/>}</button><button className="check-content" onClick={onOpen}><span><strong>{item.name}</strong>{item.helperText&&<small className="helper-text">{item.helperText}</small>}<small>{statusLabels[item.status]}{item.quantity&&item.quantity>1?` · ${item.quantity} 件`:''}</small></span><em className={item.priority}>{priorityLabels[item.priority]}</em><ChevronRight/></button></div>}
