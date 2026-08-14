'use client'
import Link from 'next/link'
import { usePathname,useRouter } from 'next/navigation'
import { ClipboardList,Home,Luggage,UserRound } from 'lucide-react'
import { useChecklist } from '@/hooks/useChecklist'
import { ToastProvider } from './ui/Toast'
const tabs=[['/','首页',Home],['/checklist','清单',ClipboardList],['/luggage','行李',Luggage],['/profile','我的',UserRound]] as const
export function AppShell({children,hideTabs=false}:{children:React.ReactNode;hideTabs?:boolean}){const path=usePathname();const router=useRouter();const {ready,data}=useChecklist();if(!ready)return <div className="loading">正在整理你的清单…</div>;if((!data.onboarded||data.profile.needsIdentityConfirmation)&&path!='/onboarding'){setTimeout(()=>router.replace('/onboarding'),0);return <div className="loading">正在确认你的开学情况…</div>}const localCommute=data.profile.accommodation==='commute'&&!data.profile.outOfTown;const visibleTabs=tabs.filter(([href])=>href!=='/luggage'||!localCommute);return <ToastProvider><main className={`app-main ${hideTabs?'bulk-active':''}`}>{children}</main>{data.onboarded&&!hideTabs&&<nav className="tabbar" style={{'--tab-count':visibleTabs.length} as React.CSSProperties}>{visibleTabs.map(([href,label,Icon])=><Link key={href} href={href} className={(href==='/'?path===href:path.startsWith(href))?'active':''}><Icon size={21}/><span>{label}</span></Link>)}</nav>}</ToastProvider>}
