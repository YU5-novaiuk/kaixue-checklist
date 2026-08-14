'use client'
import Link from 'next/link'
import { ArrowRight,Check,ChevronRight,CircleDotDashed,Clock3,PackageCheck } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ProgressCard } from '@/components/ProgressCard'
import { DynamicIcon } from '@/components/ui/Icons'
import { useChecklist } from '@/hooks/useChecklist'
import { preparationStatusLabels } from '@/lib/constants'
import { daysUntil,essentialProgress,isDone,markPrepared } from '@/lib/utils'
import { getPersonalizedTips } from '@/lib/checklistGenerator'
import { getItemSecondaryText,getVisibleItems } from '@/lib/selectors'
export default function Home(){
 const {data,updateItem}=useChecklist();const items=getVisibleItems(data.items,data.categories);const p=essentialProgress(items);const days=daysUntil(data.profile.registrationDate);const dateLabel=data.profile.studentStatus==='returning'?'返校':'报到';const priority=items.filter(x=>x.priority==='essential'&&!isDone(x)).sort((a,b)=>(a.reminderDate||'9999').localeCompare(b.reminderDate||'9999')).slice(0,4);const cats=data.categories.filter(x=>!x.hidden).slice(0,8);const stats=[['未准备',items.filter(x=>x.preparationStatus==='unprepared').length,'unprepared',CircleDotDashed],['准备中',items.filter(x=>x.preparationStatus==='in_progress').length,'in_progress',Clock3],['已准备',items.filter(x=>x.preparationStatus==='prepared').length,'prepared',PackageCheck]] as const;const departure=items.filter(x=>x.categoryId==='departure').slice(0,5);const tips=getPersonalizedTips(data.profile)
 return <AppShell><header className="page-header hero"><p className="eyebrow">{data.profile.studentStatus==='returning'?'新学期返校准备':'新生报到准备'}</p><h1>你好，准备得怎么样？</h1>{days!==null&&<p className="countdown">{days>=0?`距离${dateLabel}还有 ${days} 天`:`${dateLabel}日已经到了`}</p>}</header>
 <ProgressCard {...p} href="/checklist?quick=prepared"/>
 <section className="section"><div className="section-title"><h2>需要优先处理</h2><Link href="/checklist?quick=essential">查看全部 <ArrowRight/></Link></div><div className="list-card">{priority.length?priority.map(item=>{const secondary=getItemSecondaryText(item);return <button className="priority-row" key={item.id} onClick={()=>updateItem(markPrepared(item))}><span className="check-circle"/><span className="grow">{item.name}{secondary&&<small className={secondary.type==='note'?'personal-note':'home-helper'}>{secondary.text}</small>}</span><em>必需</em><small>{preparationStatusLabels[item.preparationStatus]}</small></button>}):<div className="empty-compact"><Check/>必需事项已经全部准备好了</div>}</div></section>
 <section className="stat-grid">{stats.map(([label,count,quick,Icon])=><Link href={`/checklist?quick=${quick}`} key={label} className="stat-card"><Icon size={18}/><strong>{count}</strong><span>{label}</span></Link>)}</section>
 <section className="section"><div className="section-title"><h2>分类</h2><Link href="/categories">管理 <ArrowRight/></Link></div><div className="category-grid">{cats.map(c=><Link href={`/checklist?category=${c.id}`} key={c.id} className="category-card"><DynamicIcon name={c.icon} size={19}/><span>{c.name}</span><ChevronRight size={16}/></Link>)}</div></section>
 {data.profile.accommodation==='dorm'&&<section className="section delay-buy"><div className="section-title"><div><p className="eyebrow">理性准备</p><h2>建议到校后再决定</h2></div><Link href="/later">查看 <ArrowRight/></Link></div><p>先确认尺寸、空间和宿舍规定，减少买错与闲置。</p></section>}
 <section className="section"><div className="section-title"><h2>给你的准备建议</h2></div><div className="list-card simple">{tips.map(tip=><div key={tip}><span className="dot"/>{tip}</div>)}</div></section><section className="section"><div className="section-title"><h2>出发前别忘了</h2></div><div className="list-card simple">{departure.map(item=><div key={item.id}><span className="dot"/>{item.name}</div>)}</div></section></AppShell>
}
