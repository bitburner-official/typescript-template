import { NS } from '@ns'

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

    for (let i = 0; i < maxThreads; i+=maxThreads/50+1) {
        ns.tprintf("%d\t%f\t%f\t%f", 
            i, 
            ns.formulas.hacking.growPercent(server, i, player),
            ns.formulas.hacking.growTime(server, player),
            ns.formulas.hacking.growThreads(server, player, server.moneyMax ?? 0)
            )
    }
}
