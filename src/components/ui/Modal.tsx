'use client'
import { X } from 'lucide-react'
export function Modal({open,onClose,title,children,wide=false}:{open:boolean;onClose:()=>void;title:string;children:React.ReactNode;wide?:boolean}){if(!open)return null;return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><section className={`sheet ${wide?'wide':''}`} role="dialog" aria-modal><header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="关闭"><X/></button></header><div className="sheet-body">{children}</div></section></div>}
