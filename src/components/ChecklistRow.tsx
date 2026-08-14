'use client'
import { Check,ChevronRight } from 'lucide-react'
import { ChecklistItem } from '@/types/checklist'
import { isDone } from '@/lib/utils'
import { getItemSecondaryText } from '@/lib/selectors'
import { preparationStatusLabels,priorityLabels,purchaseStatusLabels } from '@/lib/constants'
import { supportsLocation,supportsPurchase } from '@/lib/itemCapabilities'
export function ChecklistRow({item,locationName,onToggle,onOpen,selectMode=false,selected=false,onSelect}:{item:ChecklistItem;locationName?:string;onToggle:()=>void;onOpen:()=>void;selectMode?:boolean;selected?:boolean;onSelect?:()=>void}){
 const done=isDone(item);const secondary=getItemSecondaryText(item);const meta=[priorityLabels[item.priority],supportsPurchase(item)&&item.purchaseStatus?purchaseStatusLabels[item.purchaseStatus]:null,supportsLocation(item)?locationName:null].filter(Boolean)
 return <div className={`check-row ${done?'done':''} ${item.priority==='optional'?'optional-item':''} ${selectMode?'selecting':''}`}><button className={`check-button ${selectMode&&selected?'selected':''}`} onClick={selectMode?onSelect:onToggle} aria-label={selectMode?(selected?'取消选择':'选择事项'):(done?'标记未准备':'标记已准备')}>{(selectMode?selected:done)&&<Check/>}</button><button className="check-content" onClick={selectMode?onSelect:onOpen}><span><strong>{item.name}</strong>{secondary&&<small className={secondary.type==='note'?'personal-note':'helper-text'}>{secondary.text}</small>}<small>{meta.slice(0,2).join(' · ')}</small></span><em className={`prep-status ${item.preparationStatus}`}>{preparationStatusLabels[item.preparationStatus]}</em><ChevronRight/></button></div>
}
