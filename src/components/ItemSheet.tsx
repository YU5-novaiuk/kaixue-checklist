'use client'
import { useEffect,useState } from 'react'
import { Lightbulb,Trash2,X } from 'lucide-react'
import { Modal } from './ui/Modal'
import { ConfirmDialog } from './ui/ConfirmDialog'
import { useChecklist } from '@/hooks/useChecklist'
import { ChecklistItem,ItemType,PreparationStatus,Priority,PurchaseStatus } from '@/types/checklist'
import { itemTypeLabels,preparationStatusLabels,preparationStatuses,priorityLabels,purchaseStatusLabels,purchaseStatuses } from '@/lib/constants'
import { uid } from '@/lib/utils'
import { useToast } from './ui/Toast'
import { applyPurchaseStatusChange } from '@/lib/itemTransitions'
import { supportsLocation,supportsPurchase } from '@/lib/itemCapabilities'
const blank=(categoryId:string):ChecklistItem=>({id:uid(),name:'',categoryId,itemType:'physical',priority:'recommended',preparationStatus:'unprepared',quantity:1,tags:[],isSystemItem:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()})
export function ItemSheet({open,onClose,item,initialCategory='documents'}:{open:boolean;onClose:()=>void;item?:ChecklistItem;initialCategory?:string}){
 const {data,addItem,updateItem,removeItem}=useChecklist();const [draft,setDraft]=useState<ChecklistItem>(item||blank(initialCategory));const [confirm,setConfirm]=useState(false);const toast=useToast()
 useEffect(()=>setDraft(item?{...item}:blank(initialCategory)),[item,open,initialCategory])
 const set=<K extends keyof ChecklistItem>(key:K,value:ChecklistItem[K])=>setDraft(d=>({...d,[key]:value}))
 const changeType=(itemType:ItemType)=>setDraft(d=>{const next={...d,itemType};if(!supportsPurchase(next)){next.purchaseStatus=undefined;next.purchaseStatusOverride=undefined;next.actualPrice=undefined}if(!supportsLocation(next))next.luggageId=undefined;return next})
 const changePurchase=(purchaseStatus?:PurchaseStatus)=>setDraft(d=>{const auto=purchaseStatus==='to_buy'&&d.preparationStatus==='unprepared';if(auto)toast('已将准备状态更新为“准备中”');return applyPurchaseStatusChange(d,purchaseStatus)})
 const save=()=>{if(!draft.name.trim())return;const next={...draft,name:draft.name.trim(),updatedAt:new Date().toISOString()};item?updateItem(next):addItem(next);toast(item?'保存成功':'已添加到清单');onClose()}
 const setTipHidden=(hidden:boolean)=>{const next={...draft,systemTipHidden:hidden,updatedAt:new Date().toISOString()};setDraft(next);if(item)updateItem(next);toast(hidden?'系统建议已隐藏':'系统建议已恢复')}
 const canPurchase=supportsPurchase(draft);const canLocation=supportsLocation(draft)
 return <><Modal open={open} onClose={onClose} title={item?'编辑事项':'添加事项'} wide><div className="form-grid">
  <label className="field full"><span>事项名称 *</span><input value={draft.name} autoFocus placeholder="要准备什么？" onChange={e=>set('name',e.target.value)}/></label>
  <label className="field"><span>分类</span><select value={draft.categoryId} onChange={e=>set('categoryId',e.target.value)}>{data.categories.filter(x=>!x.hidden).map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
  <label className="field"><span>事项类型</span><select value={draft.itemType} disabled={draft.isSystemItem} onChange={e=>changeType(e.target.value as ItemType)}>{Object.entries(itemTypeLabels).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  <label className="field"><span>必要程度</span><select value={draft.priority} onChange={e=>{const priority=e.target.value as Priority;setDraft(d=>({...d,priority,priorityOverride:d.isSystemItem?priority:undefined}))}}>{Object.entries(priorityLabels).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
  <label className="field"><span>准备状态</span><select value={draft.preparationStatus} onChange={e=>set('preparationStatus',e.target.value as PreparationStatus)}>{preparationStatuses.map(v=><option value={v} key={v}>{preparationStatusLabels[v]}</option>)}</select></label>
  {canPurchase&&<><label className="field"><span>购买情况</span><select value={draft.purchaseStatus||''} onChange={e=>changePurchase((e.target.value||undefined) as PurchaseStatus|undefined)}><option value="">未设置</option>{purchaseStatuses.map(v=><option value={v} key={v}>{purchaseStatusLabels[v]}</option>)}</select></label>
  <label className="field"><span>实际支出</span><input type="number" min="0" value={draft.actualPrice??''} placeholder="¥" onChange={e=>set('actualPrice',e.target.value?Number(e.target.value):undefined)}/></label>
  <label className="field"><span>数量</span><input type="number" min="1" value={draft.quantity||''} onChange={e=>set('quantity',Number(e.target.value)||undefined)}/></label></>}
  {canLocation&&<label className="field"><span>放置位置</span><select value={draft.luggageId||''} onChange={e=>set('luggageId',e.target.value||undefined)}><option value="">未分配</option>{data.luggage.map(l=><option value={l.id} key={l.id}>{l.name}</option>)}</select></label>}
  <label className="field full personal-note-field"><span>个人备注</span><textarea rows={3} value={draft.note||''} placeholder="记录取件码、购买安排或其他信息" onChange={e=>set('note',e.target.value)}/></label>
  {draft.helperText&&!draft.systemTipHidden&&<div className="system-tip full"><Lightbulb/><div><div className="tip-title"><strong>系统建议</strong><button aria-label="隐藏系统建议" onClick={()=>setTipHidden(true)}><X/></button></div><p>{draft.helperText}</p></div></div>}
  {draft.helperText&&draft.systemTipHidden&&<div className="restore-tip full"><span>系统建议已隐藏</span><button onClick={()=>setTipHidden(false)}>恢复系统建议</button></div>}
  <label className="field"><span>提醒日期</span><input type="date" value={draft.reminderDate||''} onChange={e=>set('reminderDate',e.target.value)}/></label>
  <label className="field"><span>标签</span><input value={draft.tags.join('、')} placeholder="宿舍、到校前" onChange={e=>set('tags',e.target.value.split(/[、，,]/).map(x=>x.trim()).filter(Boolean))}/></label>
 </div><div className="sheet-footer">{item?<button className="text-danger" onClick={()=>setConfirm(true)}><Trash2/>删除事项</button>:<span/>}<button className="primary" disabled={!draft.name.trim()} onClick={save}>保存</button></div></Modal>
 <ConfirmDialog open={confirm} title={draft.isSystemItem?'隐藏这个系统事项？':'删除这个事项？'} description={draft.isSystemItem?'之后仍可在分类管理中重新显示系统推荐。':'删除后无法恢复。'} onCancel={()=>setConfirm(false)} onConfirm={()=>{removeItem(draft.id);toast(draft.isSystemItem?'系统事项已隐藏':'事项已删除');setConfirm(false);onClose()}}/></>
}
