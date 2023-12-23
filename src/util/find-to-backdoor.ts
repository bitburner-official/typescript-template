import { NS } from '@ns'
import { Scanner, defaultScannerConfig } from '/lib/scanner'
import { ttabulate } from '/lib/tabulate'

export async function main(ns : NS) : Promise<void> {
    
    type ServerRow = {
        hostname: string,
        command: string
    }

    const servers: ServerRow[] = Array.from(new Scanner()
        .scan(ns)
        .hosts
        .filter((srv) => !srv.owned)
        .filter((srv) => srv.hacked)
        .filter((srv) => !srv.backdoor))
        .map((srv) => {
            const connection = srv.path.map((s) => `connect ${s};`).join(" ")
            return {
                hostname: srv.hostname,
                command: `home; ${connection} connect ${srv.hostname}; backdoor;`
        }})

    servers.sort((a, b) => a.hostname.localeCompare(b.hostname))

    ttabulate(ns, servers)
}