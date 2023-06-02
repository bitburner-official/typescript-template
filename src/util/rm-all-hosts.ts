import { NS } from '@ns'
import { killAll } from 'lib/process'
import { Scanner } from 'lib/scanner'

export async function main(ns : NS) : Promise<void> {
    
    const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))
        
    for (let i = 0; i < servers.length; i++) {

        await killAll(ns, servers[i].hostname)

        const files = Array.from(ns.ls(servers[i].hostname)
            .filter(name => name.endsWith('.js'))
            .filter(name => name !== 'rm-all.ts'))

        for (let j =0; j < files.length; j++) {
            ns.tprint({
                host: servers[i].hostname,
                file: files[j]
            })
            await ns.rm(files[j], ns.getHostname())
        }

    }

        
}