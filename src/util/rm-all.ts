import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    
    ns.ls(ns.getHostname())
        .filter(name => name.endsWith('.js'))
        .filter(name => name !== 'rm-all.ts')
        .forEach((fname)=>{
            ns.tprint(fname)
            ns.rm(fname)
        })
        
}