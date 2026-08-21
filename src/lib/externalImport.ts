import { Category,Priority } from '@/types/checklist'

export interface ExternalImportDraft{id:string;name:string;categoryId:string;priority:Priority;note:string;include:boolean;duplicate:boolean}

const cleanName=(value:unknown)=>String(value??'').replace(/^\s*(?:[-*•·]|\d+[.)、])\s*/,'').trim()
const exactKey=(value:string)=>value.trim().replace(/\s+/g,' ').toLocaleLowerCase()
const headerKey=(value:unknown)=>String(value??'').trim().toLocaleLowerCase().replace(/[\s_-]+/g,'')
const headerAliases={name:new Set(['名称','name','物品','事项','项目']),category:new Set(['分类','category']),priority:new Set(['重要程度','重要性','importance','priority']),note:new Set(['备注','note','说明'])}

export function parsePastedText(text:string){
 const lines=text.split(/\r?\n/).map(cleanName).filter(Boolean)
 if(lines.length>1)return lines
 return (lines[0]||'').split(/[、，,；;]/).map(cleanName).filter(Boolean)
}

export function parsePriority(value:unknown):Priority{
 const key=headerKey(value)
 if(['必需','必须','重要','essential','required'].includes(key))return 'essential'
 if(['建议','推荐','recommended','suggested'].includes(key))return 'recommended'
 return 'optional'
}

function categoryIdFor(value:unknown,categories:Category[]){
 const key=headerKey(value);if(!key)return 'uncategorized'
 return categories.find(category=>headerKey(category.name)===key||headerKey(category.id)===key)?.id||'uncategorized'
}

function withDuplicateState(rows:Array<Omit<ExternalImportDraft,'duplicate'|'include'>>,existingNames:Iterable<string>){
 const seen=new Set([...existingNames].map(exactKey))
 return rows.map(row=>{const key=exactKey(row.name);const duplicate=seen.has(key);seen.add(key);return {...row,duplicate,include:!duplicate}})
}

export function draftsFromNames(names:string[],categories:Category[],existingNames:Iterable<string>):ExternalImportDraft[]{
 const timestamp=Date.now();const rows=names.map((name,index)=>({id:`external-${timestamp}-${index}`,name:cleanName(name),categoryId:categoryIdFor('',categories),priority:'optional' as const,note:''})).filter(row=>row.name)
 return withDuplicateState(rows,existingNames)
}

export function draftsFromTable(table:unknown[][],categories:Category[],existingNames:Iterable<string>):ExternalImportDraft[]{
 const rows=table.filter(row=>Array.isArray(row)&&row.some(value=>String(value??'').trim()))
 if(!rows.length)return []
 const first=rows[0].map(headerKey);const indexes={name:first.findIndex(value=>headerAliases.name.has(value)),category:first.findIndex(value=>headerAliases.category.has(value)),priority:first.findIndex(value=>headerAliases.priority.has(value)),note:first.findIndex(value=>headerAliases.note.has(value))};const hasHeader=indexes.name>=0;const dataRows=hasHeader?rows.slice(1):rows;const nameIndex=hasHeader?indexes.name:0;const timestamp=Date.now()
 const drafts=dataRows.map((row,index)=>({id:`external-${timestamp}-${index}`,name:cleanName(row[nameIndex]),categoryId:categoryIdFor(indexes.category>=0?row[indexes.category]:'',categories),priority:parsePriority(indexes.priority>=0?row[indexes.priority]:''),note:indexes.note>=0?String(row[indexes.note]??'').trim():''})).filter(row=>row.name)
 return withDuplicateState(drafts,existingNames)
}
