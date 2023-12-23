import { NS } from '@ns'
import { Scanner } from 'lib/scanner.js'
import { Allocator, Allocation} from '/v1/coordinate/allocator.js'
import { killProcess, makeid } from '/lib/process.js'
import { allocateHack } from '/v1/coordinate/algo/hack'
import { allocateWeaken } from '/v1/coordinate/algo/weaken'
import { allocateGrowing } from '/v1/coordinate/algo/grow'

export class Coordinator {

    async runAllocationsOnWorker(ns: NS, worker: string, scripts: Allocation[]): Promise<void> {

        const allocID = makeid(10)

        scripts.sort((a, b) => a.worker.localeCompare(b.worker))

        if (worker !== "home") {
            const toKill = Array.from(ns.ps(worker)
                .filter((elem) => !elem.filename.endsWith("_once.js")))
            for (let i = 0; i < toKill.length; i++) {
                await killProcess(ns, worker, toKill[i])
            }
        }


        for (let i = 0; i < scripts.length; i++) {
            const g = scripts[i]
            ns.scp(g.script, g.worker)
            let result = "started"
            if (!ns.exec(g.script, g.worker, g.threads, g.target, allocID)) {
                result = "failed"
                ns.print({
                    "action": result,
                    "worker": g.worker,
                    "target": g.target,
                    "started": g.script,
                    "threads": g.threads
                })    
            }
        }
    }

    async runAllocations(ns: NS): Promise<void> {

        const servers = new Scanner()
            .scan(ns)
            .hosts
            .map((item) => ns.getServer(item.hostname))

        const inProgress = new Set<string>()

        servers.forEach((srv) =>
            ns.ps(srv.hostname).forEach((pi) => 
                inProgress.add(pi.args[0].toString())
            )
        )

        const targets = servers.filter((srv) => 
            srv.hasAdminRights && 
                !inProgress.has(srv.hostname)
        )

        const allocator = new Allocator(ns, servers)

        if (!allocator.hasCapacity()) {
            return
        }
        const allocations: Allocation[] = []

        allocateHack(ns, allocator, targets)
            .forEach((elem) => {
                allocations.push(elem)
            }
        )
        allocateGrowing(ns, allocator, targets)
            .forEach((elem) => {
                allocations.push(elem)
            }
        )
        allocateWeaken(ns, allocator, targets)
            .forEach((elem) => {
                allocations.push(elem)
            } 
        )

        allocator.report(ns)

        const byWorker: Map<string, Allocation[]> = new Map()        

        allocations.sort((a, b) => a.worker.localeCompare(b.worker))

        allocations.forEach((alloc) => {
            const items = byWorker.get(alloc.worker) ?? []
            items.push(alloc)
            byWorker.set(alloc.worker, items)
        })

        for (const entry of Array.from(byWorker.entries())) {
            const worker = entry[0]
            const allocations = entry[1]
            await this.runAllocationsOnWorker(ns, worker, allocations)
        }
    }
}

