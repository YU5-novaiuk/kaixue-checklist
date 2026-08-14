'use client'
import { useMemo,useState } from 'react'
import Link from 'next/link'
import { ArrowLeft,ChevronRight,Search,ShoppingBag,X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ItemSheet } from '@/components/ItemSheet'
import { useChecklist } from '@/hooks/useChecklist'
import { ChecklistItem } from '@/types/checklist'
import { money } from '@/lib/utils'
import { filterPurchases,getItemSecondaryText,getPurchaseStats,isPurchased,PurchaseFilter } from '@/lib/selectors'
import { purchaseStatusLabels } from '@/lib/constants'
const filters:[PurchaseFilter,string][]=[['all','全部'],['pending','待购买'],['buy_after_arrival','到校购买'],['purchased','已购买']]
export default function Purchases(){
 const {data}=useChecklist();const stats=getPurchaseStats(data.items,data.categories);const [filter,setFilter]=useState<PurchaseFilter>('all');const [query,setQuery]=useState('');const [category,setCategory]=useState('');const [editing,setEditing]=useState<ChecklistItem>();const categories=data.categories.filter(c=>!c.hidden&&stats.items.some(i=>i.categoryId===c.id));const visible=useMemo(()=>filterPurchases(stats.items,filter).filter(i=>{const cat=data.categories.find(c=>c.id===i.categoryId);const text=`${i.name} ${cat?.name||''} ${i.note||''} ${i.helperText||''} ${i.purchasePlatform||''}`.toLowerCase();return (!query||text.includes(query.toLowerCase()))&&(!category||i.categoryId===category)}),[stats.items,filter,query,category,data.categories])
 return <AppShell><header className="page-header inline"><div className="with-back"><Link href="/profile" className="icon-btn"><ArrowLeft/></Link><div><p className="eyebrow">购买情况与实际支出</p><h1>开学采购</h1></div></div></header>
 <section className="purchase-summary"><button onClick={()=>setFilter('all')}><small>实际支出</small><strong>{money(stats.actual)}</strong><span>仅统计已填写金额</span></button><button onClick={()=>setFilter('purchased')}><small>已购买</small><strong>{stats.purchasedCount} 件</strong><span>{stats.missingActualCount} 件未填写实际支出</span></button><button onClick={()=>setFilter('pending')}><small>待购买</small><strong>{stats.pendingCount} 件</strong><span>仍需处理</span></button></section>
 <div className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索物品、分类或备注"/>{query&&<button onClick={()=>setQuery('')}><X/></button>}</div><div className="filter-row purchase-filters">{filters.map(([v,n])=><button key={v} className={filter===v?'active':''} onClick={()=>setFilter(v)}>{n}</button>)}<select aria-label="按分类筛选" value={category} onChange={e=>setCategory(e.target.value)}><option value="">全部分类</option>{categories.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
 <div className="purchase-list">{visible.map(item=>{const cat=data.categories.find(c=>c.id===item.categoryId);const secondary=getItemSecondaryText(item);return <button className="purchase-row" key={item.id} onClick={()=>setEditing(item)}><span className={`purchase-status ${isPurchased(item)?'bought':'pending'}`}><ShoppingBag/></span><span className="grow"><strong>{item.name}</strong><small>{cat?.name} · {item.purchaseStatus?purchaseStatusLabels[item.purchaseStatus]:'未设置'}</small>{secondary&&<small className={secondary.type==='note'?'personal-note':'helper-text'}>{secondary.text}</small>}</span><span className="purchase-prices"><strong>{item.actualPrice!==undefined?money(item.actualPrice):isPurchased(item)?'未填写实际支出':'—'}</strong></span><ChevronRight/></button>})}{!visible.length&&<div className="empty-state"><ShoppingBag/><h2>这里暂时没有采购事项</h2><p>待购买、到校购买或已购买的实体物品会显示在这里。</p></div>}</div>
 <ItemSheet open={!!editing} item={editing} onClose={()=>setEditing(undefined)}/></AppShell>
}
