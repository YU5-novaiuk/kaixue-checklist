import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require=createRequire(import.meta.url)
const {chromium}=require('C:/Users/35032/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'})

async function onboard(page,{stage,accommodation='住校',distance='是，异地上学',training='否'}){
 await page.goto('http://localhost:3211/onboarding',{waitUntil:'networkidle'})
 await page.getByRole('button',{name:'新生',exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 assert.equal(await page.getByRole('heading',{name:'你目前处于哪个阶段？'}).isVisible(),true)
 for(const label of ['初高中','专本科','研究生'])assert.equal(await page.getByRole('button',{name:label,exact:true}).isVisible(),true)
 for(const label of ['初中','高中','专科','本科'])assert.equal(await page.getByRole('button',{name:label,exact:true}).count(),0)
 await page.getByRole('button',{name:stage,exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 await page.getByRole('button',{name:'男',exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 await page.getByRole('button',{name:accommodation,exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 await page.getByRole('button',{name:distance,exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 await page.getByRole('button',{name:training,exact:true}).click();await page.getByRole('button',{name:'继续'}).click()
 await page.getByRole('button',{name:'生成我的清单'}).click();await page.waitForURL('http://localhost:3211/');await page.waitForTimeout(250)
 return page.evaluate(()=>JSON.parse(localStorage.getItem('campus-ready-data-v1')))
}

try{
 const secondaryContext=await browser.newContext({viewport:{width:390,height:760}});const secondary=await secondaryContext.newPage();let data=await onboard(secondary,{stage:'初高中',accommodation:'走读',distance:'否，本地上学'});let shown=data.items.filter(item=>!item.hidden);assert.equal(data.profile.educationStage,'secondary');assert.equal(shown.some(item=>item.name==='衣服'||item.name==='短袖'||item.name==='长裤'),false);assert.equal(shown.find(item=>item.name==='身份证')?.priority,'optional');assert.equal(shown.find(item=>item.name==='检查手机')?.priority,'optional');assert.equal(shown.some(item=>item.categoryId==='dorm'),false);await secondary.goto('http://localhost:3211/later',{waitUntil:'networkidle'});for(const name of ['教辅资料','大量练习册','手机','平板电脑','笔记本电脑'])assert.equal(await secondary.getByRole('heading',{name,exact:true}).isVisible(),true);for(const name of ['路由器','打印机','大功率电器','床垫'])assert.equal(await secondary.getByRole('heading',{name,exact:true}).count(),0);await secondaryContext.close()

 const undergraduateContext=await browser.newContext({viewport:{width:390,height:760}});const undergraduate=await undergraduateContext.newPage();data=await onboard(undergraduate,{stage:'专本科',training:'是'});shown=data.items.filter(item=>!item.hidden);assert.equal(data.profile.educationStage,'undergraduate');assert.ok(shown.some(item=>item.name==='衣服'));assert.ok(shown.some(item=>item.name==='防磨脚贴'&&item.categoryId==='training'));assert.equal(shown.some(item=>item.name==='短袖'||item.name==='长裤'),false);await undergraduateContext.close()

 const postgraduateContext=await browser.newContext({viewport:{width:390,height:760}});const postgraduate=await postgraduateContext.newPage();data=await onboard(postgraduate,{stage:'研究生'});shown=data.items.filter(item=>!item.hidden);assert.equal(data.profile.educationStage,'postgraduate');for(const name of ['前置学历毕业证书','前置学历学位证书','前置学历证书复印件'])assert.ok(shown.some(item=>item.name===name),`研究生缺少 ${name}`);for(const name of ['本科毕业证','本科学位证','本科毕业证 / 学位证复印件'])assert.equal(shown.some(item=>item.name===name),false);await postgraduate.goto('http://localhost:3211/profile',{waitUntil:'networkidle'});await postgraduate.getByRole('button',{name:/编辑/}).click();for(const label of ['初高中','专本科','研究生'])assert.equal(await postgraduate.locator('select').nth(1).getByRole('option',{name:label,exact:true}).count(),1);await postgraduateContext.close()

 console.log('实页用例通过：三选项 onboarding、初高中轻量清单、专本科军训、研究生前置学历与 Profile 选项')
}finally{await browser.close()}
