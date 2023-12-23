import { NS } from '@ns'
import { Queue } from 'lib/queue'
import { HostData, HostList } from 'lib/hostdata.js'


export type ScannerConfig = {
    directConnected: boolean
}

export const defaultScannerConfig: ScannerConfig = {
    directConnected: false
}

export class Scanner {

    scan(ns: NS, config: ScannerConfig = defaultScannerConfig): HostList {
        
        const toScan = new Queue<HostData>()

        const visited = new Set<string>()
        const hosts: HostData[] = []

        toScan.pushAll(ns.scan("home").map(host => new HostData(host, [], false, false, false)))

        do {
            const nextHost = toScan.pop()
            if (nextHost == null) {
                break
            }
            if (visited.has(nextHost.hostname)) {
                continue
            }
            visited.add(nextHost.hostname)
    
            const server = ns.getServer(nextHost.hostname)
            nextHost.hacked = server.hasAdminRights
            nextHost.owned = server.purchasedByPlayer
            nextHost.backdoor = server.backdoorInstalled ?? false
            hosts.push(nextHost)
    
            // only traverse to a next host only if 
            if (! config.directConnected 
                || server.backdoorInstalled 
                || server.purchasedByPlayer) {
                const scanned = ns.scan(server.hostname)
                toScan.pushAll(scanned.map((elem) => {
                    return new HostData(
                        elem, 
                        nextHost.path.concat([nextHost.hostname]),
                        false, 
                        false,
                        false)
                }))
            }
        } while (!toScan.isEmpty())
        return new HostList(hosts.filter((elem) => elem.hostname !== "home"))
    }
}