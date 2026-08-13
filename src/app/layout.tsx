import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ChecklistProvider } from '@/hooks/useChecklist'
export const metadata:Metadata={title:'开学准备',description:'大学生开学准备助手'}
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#f6f6f4'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body><ChecklistProvider>{children}</ChecklistProvider></body></html>}
