import { NS } from '@ns'
import { Scanner } from 'lib/scanner.js'
import { hackCandidates } from 'coordinate/algo/hack'
import { Grow, Hack, Weaken } from 'coordinate/types'
import { weakenCandidate } from '/coordinate/algo/weaken'
import { growCandidates } from '/coordinate/algo/grow'

export async function main(ns : NS) : Promise<void> {

    const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))

    const hackable: Hack[] = hackCandidates(ns, servers)

    for (const hack of hackable) {
        ns.tprint(`HACK: ${hack.hostname}: earning=${hack.earnings} time=${hack.time/60.0/1000.0}min threads=${hack.threads} chance=${hack.chance}`)
    }

    const weakable: Weaken[] = weakenCandidate(ns, servers)

    for (const weak of weakable) {
        ns.tprint(`WEAK: ${weak.hostname}: time=${weak.time/60.0/1000.0}min threads=${weak.threads} security=${weak.security}`)
    }

    const growable: Grow[] = growCandidates(ns, servers)

    for (const grow of growable) {
        ns.tprint(`GROW: ${grow.hostname}: time=${grow.time/60.0/1000.0}min threads=${grow.threads} security=${grow.security} earning=${grow.earning}`)
    }
}