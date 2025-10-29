
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))

function runPrefixed(cmd, args, name, cwd=root){
  const p = spawn(cmd, args, { cwd, shell: true })
  const tag = `[${name}]`
  p.stdout.on('data', d => process.stdout.write(`${tag} ${d}`))
  p.stderr.on('data', d => process.stderr.write(`${tag} ${d}`))
  p.on('close', code => console.log(`${tag} exited ${code}`))
  return p
}

async function main(){
  // ensure deps
  await new Promise((resolve, reject)=>{
    const p = runPrefixed('npm',['--prefix','server','i'],'server')
    p.on('close', c => c===0? resolve(): reject(new Error('server install failed')))
  })
  await new Promise((resolve, reject)=>{
    const p = runPrefixed('npm',['--prefix','client','i'],'client')
    p.on('close', c => c===0? resolve(): reject(new Error('client install failed')))
  })

  // run dev servers
  const ps = []
  ps.push(runPrefixed('npm',['--prefix','client','run','dev'],'client'))
  ps.push(runPrefixed('npm',['--prefix','server','run','dev'],'server'))

  const shutdown = () => {
    console.log('\n[main] shutting down...')
    for(const p of ps){ if(p && p.pid) { try { process.kill(p.pid) } catch{} } }
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch(e=>{ console.error(e); process.exit(1) })
