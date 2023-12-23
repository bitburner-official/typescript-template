import { NS } from '@ns'
import { Scanner } from '/lib/scanner.js'
import { hackCandidates } from '/v1/coordinate/algo/hack'
import { Grow, Hack, Weaken } from '/v1/coordinate/types'
import { weakenCandidate } from '/v1/coordinate/algo/weaken'
import { growCandidates } from '/v1/coordinate/algo/grow'
import { ttabulate } from '/lib/tabulate'

export async function main(ns : NS) : Promise<void> {

    const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))

    const inProgress = new Set<string>()

    type InProgress = {
        "Target": string,
        "Worker": string,
        "Script": string
    }

    const inProgressRows: InProgress[] = []

    servers.forEach((srv) =>
        ns.ps(srv.hostname).forEach((pi) =>  {
            inProgress.add(pi.args[0].toString())
            inProgressRows.push({
                "Worker": srv.hostname,
                "Target": pi.args[0].toString(),
                "Script": pi.filename
            })
        })
    )

    const targets = servers.filter((srv) => 
        srv.hasAdminRights 
        // && 
        //     !inProgress.has(srv.hostname)
    )

    ns.tprintf("In Progress:")
    ttabulate(ns, inProgressRows)

    const hackable: Hack[] = hackCandidates(ns, targets)

    ns.tprintf("Hackable:")
    ttabulate(ns, hackable)

    const weakable: Weaken[] = weakenCandidate(ns, targets)

    ns.tprintf("Weakable:")
    ttabulate(ns, weakable)

    const growable: Grow[] = growCandidates(ns, targets)

    ns.tprintf("Growable:")
    ttabulate(ns, growable)
}