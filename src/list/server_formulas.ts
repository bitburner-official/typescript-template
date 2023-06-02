import { NS } from '@ns'
import { Scanner } from 'lib/scanner.js'

export async function main(ns : NS) : Promise<void> {

    const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))


    for (const server of servers) {

        const player = ns.getPlayer()

        if (!server.moneyMax) {
            continue
        }

        const growPercent = ns.formulas.hacking.growPercent(server, 1, player, 1)
        const growTime = ns.formulas.hacking.growTime(server, player)
        const growThreads = ns.formulas.hacking.growThreads(server, player, server.moneyMax)

        ns.tprintf("%s: growPercent: %f, growTime: %f, threadsToMax: %d",
                    server.hostname,
                    growPercent, 
                    growTime,
                    growThreads)


        const hackPercent = ns.formulas.hacking.hackPercent(server, player)
        const hackTime = ns.formulas.hacking.hackTime(server, player)
        const hackChance = ns.formulas.hacking.hackChance(server, player)


        const weakenTime = ns.formulas.hacking.weakenTime(server, player)

        ns.tprintf("%s: hackPercent: %f, hackTime: %f, hackChance: %d, weakenTime: %f",
                server.hostname,
                hackPercent, 
                hackTime,
                hackChance,
                weakenTime)

    }
}