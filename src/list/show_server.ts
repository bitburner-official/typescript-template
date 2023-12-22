import { NS } from '@ns'
import { tabulate } from '/lib/tabulate'

export async function main(ns : NS) : Promise<void> {
    const hostname = ns.args[0] as string

    const player = ns.getPlayer()
    const server = ns.getServer(hostname)

    ns.tprint(JSON.stringify({
        hostname: hostname,
        minSecurityLevel: ns.getServerMinSecurityLevel(hostname),
        securityLevel: ns.getServerSecurityLevel(hostname),
        weakenPerThread: ns.weakenAnalyze(1),
        hackSecurity: ns.hackAnalyzeSecurity(1),
        growSecurity: ns.growthAnalyzeSecurity(1),
    }, undefined, 2))

    const maxThreads = ns.formulas.hacking.growThreads(server, player, server.moneyMax ?? 0)

    type ThreadLine = {
        id: number,
        growPercent: number;
        growTime: number;
        growThreads: number;
    }

    const threads: ThreadLine[]  = []

    for (let i = 0; i < maxThreads; i+=maxThreads/50+1) {
        threads.push({
            id: i,
            growPercent: ns.formulas.hacking.growPercent(server, i, player),
            growTime: ns.formulas.hacking.growTime(server, player),
            growThreads: ns.formulas.hacking.growThreads(server, player, server.moneyMax ?? 0)
        })
    }

    tabulate(ns, threads, undefined, true)
}
