import { cp, copyFile, mkdir, rm, writeFile } from 'node:fs/promises'

await rm('dist', { recursive: true, force: true })
await mkdir('dist/server', { recursive: true })
await mkdir('dist/.openai', { recursive: true })
await cp('out', 'dist/assets', { recursive: true })
await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json')
await writeFile('dist/server/index.js', `export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request)
  }
}\n`)
