'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Check,ChevronRight,PackageCheck,Plus,ShieldCheck,Trash2,X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { DynamicIcon } from '@/components/ui/Icons'
import { useChecklist } from '@/hooks/useChecklist'
import { isDone,markPrepared,markUnprepared,uid } from '@/lib/utils'
import { isPackedForLuggage,toggleLuggageCompletion } from '@/lib/itemTransitions'
import { Luggage } from '@/types/checklist'
import { useToast } from '@/components/ui/Toast'
import { getVisibleItems } from '@/lib/selectors'
export default function LuggagePage(){
 const {data,addLuggage,removeLuggage,updateItem}=useChecklist();const [selected,setSelected]=useState<Luggage>();const [deleting,setDeleting]=useState<Luggage>();const [add,setAdd]=useState(false);const [name,setName]=useState('');const [checkMode,setCheckMode]=useState(false);const toast=useToast()
 const visible=getVisibleItems(data.items,data.categories);const packable=visible.filter(i=>i.itemType==='physical'&&i.luggageId!=='campus_parcel_station');const packedCount=packable.filter(isPackedForLuggage).length;const remaining=Math.max(0,packable.length-packedCount);const percent=packable.length?Math.round(packedCount/packable.length*100):0;const stationItems=visible.filter(i=>i.itemType==='physical'&&i.luggageId==='campus_parcel_station');const essential=visible.filter(i=>i.priority==='essential').slice(0,12);const unchecked=essential.filter(i=>!isDone(i)).length
 if(data.profile.accommodation==='commute'&&!data.profile.outOfTown)return <AppShell><header className="page-header"><p className="eyebrow">本地走读</p><h1>无需整理搬运行李</h1><p className="lead">你的清单以通勤随身物品为主，因此已隐藏搬运行李流程。</p></header></AppShell>
 if(checkMode)return <main className="departure-check"><header><button className="icon-btn" onClick={()=>setCheckMode(false)} aria-label="关闭"><X/></button><div><p className="eyebrow">出发检查</p><h1>重要事项确认</h1></div></header><p className="lead">出门前，再花一分钟确认这些重要事项。</p><div className="departure-list">{essential.map(item=><button key={item.id} className={isDone(item)?'done':''} onClick={()=>updateItem(isDone(item)?markUnprepared(item):markPrepared(item))}><span>{isDone(item)&&<Check/>}</span>{item.name}</button>)}</div><footer><strong>{unchecked?`还有 ${unchecked} 项未确认`:'重要事项已经检查完成'}</strong><button className="primary" onClick={()=>setCheckMode(false)}>完成检查</button></footer></main>
 const selectedItems=selected?visible.filter(i=>i.itemType==='physical'&&i.luggageId===selected.id):[]
 return <AppShell><header className="page-header inline"><div><p className="eyebrow">东西放在哪，一目了然</p><h1>行李</h1></div><button className="primary compact" onClick={()=>setAdd(true)}><Plus/>添加</button></header>
 <Link href="/checklist?location=packed" className="luggage-summary luggage-summary-link dark-card"><div className="dark-card-heading"><span className="dark-card-title">已装箱</span><strong className="dark-card-value">{packedCount} / {packable.length}</strong></div><p className="dark-card-meta">还有 {remaining} 件物品尚未完成装箱</p><div className="progress-track dark-card-track"><i className="dark-card-fill" style={{width:`${percent}%`}}/></div></Link>
 <Link href="/checklist?location=campus_parcel_station" className="station-card"><PackageCheck/><span><strong>学校快递站</strong><small>{stationItems.length} 件物品</small></span><b>{stationItems.length}</b><ChevronRight/></Link>
 <div className="luggage-grid">{data.luggage.filter(l=>l.id!=='campus_parcel_station').map(l=>{const count=visible.filter(i=>i.itemType==='physical'&&i.luggageId===l.id).length;return <button className="luggage-card" key={l.id} onClick={()=>setSelected(l)}><DynamicIcon name={l.icon}/><span><strong>{l.name}</strong><small>{count} 件物品</small></span><ChevronRight/></button>})}</div>
 <button className="departure-banner dark-card" onClick={()=>setCheckMode(true)}><ShieldCheck/><span><strong>开始出发检查</strong><small>快速确认身份证、手机和重要随身物品</small></span><ChevronRight/></button>
 <Modal open={!!selected} onClose={()=>setSelected(undefined)} title={selected?.name||''}>{selected&&<>{selectedItems.length?<div className="packed-list">{selectedItems.map(item=><button key={item.id} onClick={()=>updateItem(toggleLuggageCompletion(item,selected.id))}><span className={isDone(item)?'mini-check checked':'mini-check'}>{isDone(item)&&<Check/>}</span>{item.name}</button>)}</div>:<div className="empty-compact">还没有物品放在这里，可在事项详情或批量管理中设置。</div>}<button className="text-danger" onClick={()=>setDeleting(selected)}><Trash2/>删除这个位置</button></>}</Modal>
 <ConfirmDialog open={!!deleting} title={`删除“${deleting?.name||''}”？`} description="该位置中的物品不会被删除，只会变为未分配。" onCancel={()=>setDeleting(undefined)} onConfirm={()=>{if(deleting)removeLuggage(deleting.id);setDeleting(undefined);setSelected(undefined);toast('位置已删除')}}/>
 <Modal open={add} onClose={()=>setAdd(false)} title="添加自定义位置"><label className="field"><span>名称 *</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="例如：邮寄箱 ①" autoFocus/></label><div className="actions"><button className="secondary" onClick={()=>setAdd(false)}>取消</button><button className="primary" disabled={!name.trim()} onClick={()=>{addLuggage({id:uid(),name:name.trim(),icon:'Package',order:data.luggage.length});setAdd(false);setName('');toast('位置已添加')}}>保存</button></div></Modal></AppShell>
}
