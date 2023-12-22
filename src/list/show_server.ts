import { NS } from '@ns'
import { tabulate } from '/lib/tabulate'

export async function main(ns : NS) : Promise<void> {
    const hostname = ns.args[0] as string

    const player = ns.getPlayer()
    const server = ns.getServer(hostname)

    ns.tprint({
        hostname: hostname,
        moneyAvailable: server.moneyAvailable,
        moneyMax: server.moneyMax,
        serverGrowth: server.serverGrowth,
        minSecurityLevel: ns.getServerMinSecurityLevel(hostname),
        securityLevel: ns.getServerSecurityLevel(hostname),
        hackChance: ns.formulas.hacking.hackChance(server, player),
        hackPercent: ns.formulas.hacking.hackPercent(server, player),
        hackTime: ns.formulas.hacking.hackTime(server, player),
        weakenTime: ns.formulas.hacking.weakenTime(server, player)
    })

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
