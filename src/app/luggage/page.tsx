'use client'

import { useState } from 'react'
import { Check, ChevronRight, Plus, ShieldCheck, Trash2, X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { DynamicIcon } from '@/components/ui/Icons'
import { useChecklist } from '@/hooks/useChecklist'
import { isDone, progress, uid } from '@/lib/utils'
import { Luggage } from '@/types/checklist'
import { useToast } from '@/components/ui/Toast'

export default function LuggagePage() {
  const { data, addLuggage, removeLuggage, updateItem } = useChecklist()
  const [selected, setSelected] = useState<Luggage>()
  const [deleting, setDeleting] = useState<Luggage>()
  const [add, setAdd] = useState(false)
  const [name, setName] = useState('')
  const [checkMode, setCheckMode] = useState(false)
  const toast = useToast()
  const packedProgress = progress(data.items.filter((item) => item.luggageId && !item.hidden))
  const essential = data.items.filter((item) => item.priority === 'essential' && item.itemType !== 'task' && !item.hidden).slice(0, 12)
  const unchecked = essential.filter((item) => !isDone(item)).length

  if (data.profile.accommodation === 'commute' && !data.profile.outOfTown) return <AppShell><header className="page-header"><p className="eyebrow">本地走读</p><h1>无需整理搬运行李</h1><p className="lead">你的清单以通勤随身物品为主，因此已隐藏行李入口和装箱流程。</p></header></AppShell>

  if (checkMode) return <main className="departure-check"><header><button className="icon-btn" onClick={() => setCheckMode(false)} aria-label="关闭"><X /></button><div><p className="eyebrow">出发检查</p><h1>重要物品确认</h1></div></header><p className="lead">出门前，再花一分钟确认这些重要物品。</p><div className="departure-list">{essential.map((item) => <button key={item.id} className={isDone(item) ? 'done' : ''} onClick={() => updateItem({ ...item, status: isDone(item) ? 'unprepared' : 'completed', updatedAt: new Date().toISOString() })}><span>{isDone(item) && <Check />}</span>{item.name}</button>)}</div><footer><strong>{unchecked ? `还有 ${unchecked} 项未确认` : '重要物品已经检查完成'}</strong><button className="primary" onClick={() => setCheckMode(false)}>完成检查</button></footer></main>

  const selectedItems = selected ? data.items.filter((item) => item.luggageId === selected.id && !item.hidden) : []
  return <AppShell><header className="page-header inline"><div><p className="eyebrow">东西放在哪，一目了然</p><h1>行李</h1></div><button className="primary compact" onClick={() => setAdd(true)}><Plus />添加</button></header><section className="luggage-summary"><div><span>已装箱</span><strong>{packedProgress.done} / {packedProgress.total}</strong></div><div className="progress-track"><i style={{ width: `${packedProgress.percent}%` }} /></div></section><div className="luggage-grid">{data.luggage.map((luggage) => { const count = data.items.filter((item) => item.luggageId === luggage.id && !item.hidden).length; return <button className="luggage-card" key={luggage.id} onClick={() => setSelected(luggage)}><DynamicIcon name={luggage.icon} /><span><strong>{luggage.name}</strong><small>{count} 件物品</small></span><ChevronRight /></button> })}</div><button className="departure-banner" onClick={() => setCheckMode(true)}><ShieldCheck /><span><strong>开始出发检查</strong><small>快速确认身份证、手机和重要随身物品</small></span><ChevronRight /></button>
    <Modal open={!!selected} onClose={() => setSelected(undefined)} title={selected?.name || ''}>{selected && <>{selectedItems.length ? <div className="packed-list">{selectedItems.map((item) => <button key={item.id} onClick={() => updateItem({ ...item, status: isDone(item) ? 'unprepared' : 'packed', updatedAt: new Date().toISOString() })}><span className={isDone(item) ? 'mini-check checked' : 'mini-check'}>{isDone(item) && <Check />}</span>{item.name}</button>)}</div> : <div className="empty-compact">还没有物品放在这里，可在事项详情中设置。</div>}<button className="text-danger" onClick={() => setDeleting(selected)}><Trash2 />删除这个行李类别</button></>}</Modal>
    <ConfirmDialog open={!!deleting} title={`删除“${deleting?.name || ''}”？`} description="该类别中的物品不会被删除，只会变为暂未分配行李。" onCancel={() => setDeleting(undefined)} onConfirm={() => { if (deleting) removeLuggage(deleting.id); setDeleting(undefined); setSelected(undefined); toast('行李类别已删除') }} />
    <Modal open={add} onClose={() => setAdd(false)} title="添加行李"><label className="field"><span>名称 *</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：邮寄箱 ②" autoFocus /></label><div className="actions"><button className="secondary" onClick={() => setAdd(false)}>取消</button><button className="primary" disabled={!name.trim()} onClick={() => { addLuggage({ id: uid(), name: name.trim(), icon: 'Package', order: data.luggage.length }); setAdd(false); setName(''); toast('行李已添加') }}>保存</button></div></Modal>
  </AppShell>
}
