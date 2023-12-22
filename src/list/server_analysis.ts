import { NS } from '@ns'
import { Scanner } from 'lib/scanner.js'
import { hackCandidates } from 'coordinate/algo/hack'
import { Grow, Hack, Weaken } from 'coordinate/types'
import { weakenCandidate } from '/coordinate/algo/weaken'
import { growCandidates } from '/coordinate/algo/grow'
import { ttabulate } from '/lib/tabulate'

export async function main(ns : NS) : Promise<void> {

    const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))

    const hackable: Hack[] = hackCandidates(ns, servers)

    ns.tprintf("Hackable:")
    ttabulate(ns, hackable)

    const weakable: Weaken[] = weakenCandidate(ns, servers)

    ns.tprintf("Weakable:")
    ttabulate(ns, weakable)

    const growable: Grow[] = growCandidates(ns, servers)

    ns.tprintf("Growable:")
    ttabulate(ns, growable)
}