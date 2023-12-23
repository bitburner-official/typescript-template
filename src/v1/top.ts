import { NS } from '@ns'
import { Scanner } from 'lib/scanner.js'
import { tabulate } from '/lib/tabulate';
import { scriptType } from './coordinate/allocator';

export async function main(ns : NS) : Promise<void> {

    type InProgress = {
        "Worker": string,
        "Threads": number,
        "Targets": string[],
    }

    // eslint-disable-next-line no-constant-condition
    while(true) {
        const servers = new Scanner()
        .scan(ns)
        .hosts
        .map((item) => ns.getServer(item.hostname))

        const inProgress: {[worker:string]: InProgress} = {}

        servers.forEach((srv) => {
            const workerState: InProgress = {
                Worker: srv.hostname,
                Targets: [],
                Threads: 0
            }
            ns.ps(srv.hostname).forEach((pi) =>  {
                const target=`${scriptType("/" + pi.filename)}:${pi.args[0].toString()}`
                workerState.Targets.push(target)
                workerState.Threads += pi.threads
            })
            inProgress[srv.hostname] = workerState
        })

        tabulate(ns, Object.keys(inProgress).map(key => inProgress[key]), 
           ["Worker", "Threads", "Targets"]
        )
        await ns.sleep(2000)
    }
}