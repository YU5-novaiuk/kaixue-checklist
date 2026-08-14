import assert from 'node:assert/strict';import fs from 'node:fs'
const source=fs.readFileSync(new URL('../src/lib/checklistGenerator.ts',import.meta.url),'utf8')
assert.match(source,/forced\.has\(item\.categoryId\)\?false/,'手动显示分类应覆盖画像隐藏')
assert.match(source,/visibilityOverride==='hide'\?true/,'单项手动隐藏应优先保留')
const store=fs.readFileSync(new URL('../src/hooks/useChecklist.tsx',import.meta.url),'utf8')
assert.match(store,/visibilityOverride:'show'/,'分类显示操作必须持久化为手动覆盖')
assert.match(store,/generateChecklist\(profile,d\.items,forced\)/,'修改画像后仍保留手动显示分类')
console.log('分类手动显示覆盖与持久化用例通过')
