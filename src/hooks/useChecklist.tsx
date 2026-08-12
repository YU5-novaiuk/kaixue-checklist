'use client'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { createDefaultData, makeDefaultItems } from '@/data/defaults'
import { storageKey } from '@/lib/constants'
import { AppData, Category, ChecklistItem, Luggage, UserProfile } from '@/types/checklist'

type Store = { data:AppData; ready:boolean; saveProfile:(p:UserProfile)=>void; updateItem:(item:ChecklistItem)=>void; addItem:(item:ChecklistItem)=>void; removeItem:(id:string)=>void; updateCategory:(c:Category)=>void; addCategory:(c:Category)=>void; removeCategory:(id:string)=>void; addLuggage:(l:Luggage)=>void; removeLuggage:(id:string)=>void; reset:()=>void; replace:(d:AppData)=>void }
const Context=createContext<Store|null>(null)
export function ChecklistProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<AppData>(createDefaultData); const [ready,setReady]=useState(false)
 useEffect(()=>{try{const raw=localStorage.getItem(storageKey);if(raw){const saved=JSON.parse(raw) as AppData;const defaults=makeDefaultItems();setData({...saved,version:2,items:saved.items.map(item=>{const system=defaults.find(x=>x.name===item.name&&x.categoryId===item.categoryId);if(!system)return {...item,itemType:item.itemType||'physical'};return {...system,...item,itemType:system.itemType,helperText:system.helperText,priority:system.priority,status:item.itemType?item.status:system.status}})})}}catch{}setReady(true)},[])
 useEffect(()=>{if(ready)localStorage.setItem(storageKey,JSON.stringify(data))},[data,ready])
 const value=useMemo<Store>(()=>({data,ready,
  saveProfile:p=>setData(d=>({...d,profile:p,onboarded:true})),
  updateItem:item=>setData(d=>({...d,items:d.items.map(x=>x.id===item.id?item:x)})), addItem:item=>setData(d=>({...d,items:[item,...d.items]})), removeItem:id=>setData(d=>({...d,items:d.items.filter(x=>x.id!==id)})),
  updateCategory:c=>setData(d=>({...d,categories:d.categories.map(x=>x.id===c.id?c:x)})),addCategory:c=>setData(d=>({...d,categories:[...d.categories,c]})),removeCategory:id=>setData(d=>({...d,categories:d.categories.filter(x=>x.id!==id),items:d.items.filter(x=>x.categoryId!==id)})),
  addLuggage:l=>setData(d=>({...d,luggage:[...d.luggage,l]})),removeLuggage:id=>setData(d=>({...d,luggage:d.luggage.filter(x=>x.id!==id),items:d.items.map(x=>x.luggageId===id?{...x,luggageId:undefined}:x)})),
  reset:()=>setData(createDefaultData()),replace:d=>setData(d)
 }),[data,ready])
 return <Context.Provider value={value}>{children}</Context.Provider>
}
export const useChecklist=()=>{const value=useContext(Context);if(!value)throw new Error('Provider missing');return value}
