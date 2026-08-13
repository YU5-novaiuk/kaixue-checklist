'use client'
import { ArrowLeft,Plus,ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { useChecklist } from '@/hooks/useChecklist'
import { useToast } from '@/components/ui/Toast'
const suggestions=[['床帘','先确认学校床铺尺寸。'],['床垫','先确认尺寸和学校是否统一提供。'],['收纳架','先看看宿舍的实际空间。'],['路由器','部分学校校园网不需要路由器。'],['打印机','学校通常有便利的打印点。'],['垃圾桶','可以和室友共同购买。'],['大瓶洗衣液','异地出行时不必增加行李重量。'],['大功率电器','部分宿舍禁止使用，请先查看规定。']]
export default function Later(){const {data,addItem}=useChecklist();const toast=useToast();if(data.profile.accommodation!=='dorm')return <AppShell><header className="page-header"><div className="with-back"><Link href="/" className="icon-btn"><ArrowLeft/></Link><div><p className="eyebrow">走读准备</p><h1>无需宿舍购物建议</h1></div></div><p className="lead">你的清单已按走读场景生成，首页不会展示宿舍用品建议。</p></header></AppShell>;return <AppShell><header className="page-header"><div className="with-back"><Link href="/" className="icon-btn"><ArrowLeft/></Link><div><p className="eyebrow">不急着买</p><h1>建议到校后再决定</h1></div></div><p className="lead">确认空间、尺寸与规定之后再购买，减少浪费。</p></header><div className="suggestion-list">{suggestions.map(([name,reason])=>{const exists=data.items.some(x=>x.name===name);return <article key={name}><ShoppingBag/><div><h2>{name}</h2><p>{reason}</p></div><button disabled={exists} onClick={()=>{addItem({id:`later-${Date.now()}`,name,categoryId:'dorm',itemType:'physical',priority:'optional',status:'buy_after_arrival',quantity:1,tags:['到校后'],note:reason,isSystemItem:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});toast('已加入清单')}}>{exists?<span>已加入</span>:<><Plus/>加入</>}</button></article>})}</div></AppShell>}

