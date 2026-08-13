'use client'
import { createContext,useCallback,useContext,useState,ReactNode } from 'react'
import { Check } from 'lucide-react'
const C=createContext<(message:string)=>void>(()=>{})
export function ToastProvider({children}:{children:ReactNode}){const [message,setMessage]=useState('');const show=useCallback((m:string)=>{setMessage(m);setTimeout(()=>setMessage(''),2200)},[]);return <C.Provider value={show}>{children}{message&&<div className="toast"><Check size={16}/>{message}</div>}</C.Provider>}
export const useToast=()=>useContext(C)
