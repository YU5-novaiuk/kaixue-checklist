'use client'
import { useMemo,useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft,ArrowRight,Check,GraduationCap } from 'lucide-react'
import { useChecklist } from '@/hooks/useChecklist'
import { UserProfile } from '@/types/checklist'
export default function Onboarding(){
 const {data,saveProfile}=useChecklist();const [step,setStep]=useState(0);const [p,setP]=useState<UserProfile>(data.profile);const router=useRouter()
 const steps=useMemo(()=>(p.studentStatus==='new'?['status','stage','accommodation','distance','training','date']:['status','accommodation','distance','date']),[p.studentStatus]);const current=steps[step]||steps[0]
 const finish=()=>{saveProfile({...p,educationStage:p.studentStatus==='new'?(p.educationStage||'undergraduate'):undefined,militaryTraining:p.studentStatus==='new'?(p.militaryTraining||'unknown'):'no',needsIdentityConfirmation:false});router.push('/')}
 const chooseStatus=(studentStatus:UserProfile['studentStatus'])=>setP({...p,studentStatus,educationStage:studentStatus==='new'?(p.educationStage||'undergraduate'):undefined,militaryTraining:studentStatus==='new'?(p.militaryTraining||'unknown'):'no'})
 return <main className="onboarding"><div className="onboard-top"><div className="brand"><GraduationCap/>开学准备</div><span>{step+1} / {steps.length}</span></div><div className="step-track"><i style={{width:`${(step+1)/steps.length*100}%`}}/></div><div className="onboard-content">
 {data.profile.needsIdentityConfirmation&&current==='status'&&<p className="lead">开学身份选项已经更新，请重新确认你的情况。</p>}
 {current==='status'&&<Step title="这次开学属于哪种情况？" lead="第一次到当前学校正式报到，或已经在校、只是新学期返校。"><Choice value={p.studentStatus} options={[['new','新生'],['returning','老生返校']]} onChange={v=>chooseStatus(v as UserProfile['studentStatus'])}/></Step>}
 {current==='stage'&&<Step title="你的入学阶段" lead="本科与研究生会获得不同的材料和培养事项。"><Choice value={p.educationStage||'undergraduate'} options={[['undergraduate','本科'],['postgraduate','研究生']]} onChange={v=>setP({...p,educationStage:v as UserProfile['educationStage']})}/></Step>}
 {current==='accommodation'&&<Step title="你的住宿方式" lead="住校生成宿舍准备内容，走读生成通勤清单。"><Choice value={p.accommodation} options={[['dorm','住校'],['commute','走读']]} onChange={v=>setP({...p,accommodation:v as UserProfile['accommodation']})}/></Step>}
 {current==='distance'&&<Step title="是否异地上学？" lead="异地用户会增加车票、行李和长途出行提醒。"><Choice value={p.outOfTown?'yes':'no'} options={[['yes','是，异地上学'],['no','否，本地上学']]} onChange={v=>setP({...p,outOfTown:v==='yes'})}/></Step>}
 {current==='training'&&<Step title="是否需要参加军训？" lead="明确参加时生成军训用品；不确定时先加入确认事项。"><Choice value={p.militaryTraining||'unknown'} options={[['yes','是'],['no','否'],['unknown','不确定']]} onChange={v=>setP({...p,militaryTraining:v as UserProfile['militaryTraining']})}/></Step>}
 {current==='date'&&<Step title={p.studentStatus==='new'?'预计报到日期':'预计返校日期'} lead="可跳过；填写后首页会显示倒计时。"><label className="field"><span>日期（可选）</span><input type="date" value={p.registrationDate||''} onChange={e=>setP({...p,registrationDate:e.target.value})}/></label></Step>}
 </div><footer className="onboard-actions">{step>0?<button className="secondary" onClick={()=>setStep(step-1)}><ArrowLeft/>上一步</button>:<span/>}{step<steps.length-1?<button className="primary" onClick={()=>setStep(step+1)}>继续<ArrowRight/></button>:<button className="primary" onClick={finish}>生成我的清单<Check/></button>}</footer></main>
}
function Step({title,lead,children}:{title:string;lead:string;children:React.ReactNode}){return <><p className="eyebrow">定制你的清单</p><h1>{title}</h1><p className="lead">{lead}</p>{children}</>}
function Choice({value,options,onChange}:{value:string;options:string[][];onChange:(v:string)=>void}){return <div className="option-list">{options.map(([v,n])=><button className={value===v?'selected':''} onClick={()=>onChange(v)} key={v}><strong>{n}</strong>{value===v&&<Check/>}</button>)}</div>}
