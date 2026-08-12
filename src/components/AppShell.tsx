'use client'
import Link from 'next/link'
import { usePathname,useRouter } from 'next/navigation'
import { ClipboardList,Home,Luggage,UserRound } from 'lucide-react'
import { useChecklist } from '@/hooks/useChecklist'
import { ToastProvider } from './ui/Toast'
const tabs=[['/','首页',Home],['/checklist','清单',ClipboardList],['/luggage','行李',Luggage],['/profile','我的',UserRound]] as const
export function AppShell({children}:{children:React.ReactNode}){const path=usePathname();const router=useRouter();const {ready,data}=useChecklist();if(!ready)return <div className="loading">正在整理你的清单…</div>;if(!data.onboarded&&path!='/onboarding'){setTimeout(()=>router.replace('/onboarding'),0);return <div className="loading">正在开始…</div>}return <ToastProvider><main className="app-main">{children}</main>{data.onboarded&&<nav className="tabbar">{tabs.map(([href,label,Icon])=><Link key={href} href={href} className={(href==='/'?path===href:path.startsWith(href))?'active':''}><Icon size={21}/><span>{label}</span></Link>)}</nav>}</ToastProvider>}
