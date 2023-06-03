import { NS, Server } from '@ns'
import { Scanner } from 'lib/scanner.js'
import { Allocator, Allocation, WorkType } from 'coordinate/allocator.js'
import { Grow, Hack, Weaken } from 'coordinate/types.js'
import { killProcess, makeid } from '/lib/process.js'



const debug = false

export class Coordinator {
    
    allocateGrowing(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {

        const allocations: Allocation[] = []

        const eligable = targets.filter((target) => (target.moneyMax ?? 0) > 0 &&
        (target.moneyAvailable ?? 0) < (target.moneyMax ?? 0) &&
            ns.getServerSecurityLevel(target.hostname) < ns.getServerMinSecurityLevel(target.hostname) * 1.05)

        const inOrder = eligable.map((target) => {
            const growTime = ns.getGrowTime(target.hostname)
            const coeff = (target.moneyMax ?? 0) / (target.moneyAvailable ?? 1)
            let threads: number
            if (coeff < 2) {
                const threadsToDouble = ns.growthAnalyze(target.hostname, 2)
                threads = Math.floor(threadsToDouble * coeff/2.0)
            } else {
                threads = Math.floor(ns.growthAnalyze(target.hostname, coeff))
            }
            
            return {
                hostname: target.hostname,
                time: growTime,
                threads: Math.floor(threads),
            } as Grow
        }).filter((elem) => elem.threads > 0)

        inOrder.sort((a, b) => a.threads - b.threads)
        ns.print({
            growing: inOrder
        })


        for (let idx = 0; idx < inOrder.length; idx++) {
            const grow = inOrder[idx]
            const allocated = allocator.allocate(WorkType.growing, grow.threads, grow.hostname)
            if(allocated.length == 0) {
                break
            }
            allocated.forEach((elem) => allocations.push(elem))
        }
        
        return allocations
    }

    allocateHack(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {
        const allocations: Allocation[] = []

        const eligable = targets.filter((target) => {
            return (target.moneyMax ?? 0)> 0 && 
                (target.moneyAvailable ?? 0) > (target.moneyMax ?? 0) * 0.95 &&
                ns.hackAnalyzeChance(target.hostname) > 0.5
        })

        const inOrder = eligable
        .map((target) => {
            const hackTime = ns.getHackTime(target.hostname)

            const hackFraction = ns.hackAnalyze(target.hostname)
            const hackThreads = 0.5 / hackFraction
            const hackAmount = (target.moneyAvailable ?? 0) * hackFraction * hackThreads
            
            const earnings = hackAmount / hackTime
            const security = [
                ns.getServerMinSecurityLevel(target.hostname),
                ns.getServerSecurityLevel(target.hostname)
            ]
            return { 
                hostname: target.hostname,
                earnings: earnings,
                threads: Math.floor(hackThreads),
                time: hackTime,
                security: security
            } as Hack
        }).filter((elem) => elem.threads > 0)

        inOrder.sort((a, b) => b.earnings - a.earnings)
        ns.print({
            hacking: inOrder
        })

        for (let idx = 0; idx < inOrder.length; idx++) {
            const hack = inOrder[idx]
            const allocated = allocator.allocate(WorkType.hacking, hack.threads, hack.hostname)
            if(allocated.length == 0) {
                break
            }
            allocated.forEach((elem) => allocations.push(elem))
        }
        
        return allocations
    }

    allocateWeaken(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {
        const allocations: Allocation[] = []

        const eligable = targets.filter((target) => {
            return (target.moneyMax ?? 0) > 0 && 
               ns.getServerSecurityLevel(target.hostname) > ns.getServerMinSecurityLevel(target.hostname) * 1.15
        })

        const weakenDecrese = ns.weakenAnalyze(1)

        const inOrder = eligable
        .map((target) => {
            const weakenTime = ns.getWeakenTime(target.hostname)
            const weakenAmount = ns.getServerSecurityLevel(target.hostname) - ns.getServerMinSecurityLevel(target.hostname)
            const weakenThreads = Math.ceil(weakenAmount / weakenDecrese)
            const security = [
                ns.getServerMinSecurityLevel(target.hostname),
                ns.getServerSecurityLevel(target.hostname)
            ]
             return { 
                hostname: target.hostname,
                amount: weakenAmount,
                threads: Math.floor(weakenThreads),
                time: weakenTime,
                security: security
            } as Weaken
        }).filter((elem) => elem.threads > 0)

        inOrder.sort((a, b) => a.time - b.time)

        ns.print({
            weaken: inOrder
        })

        for (let idx = 0; idx < inOrder.length; idx++) {
            const weaken = inOrder[idx]
            const allocated = allocator.allocate(WorkType.weaking, weaken.threads, weaken.hostname)
            if(allocated.length == 0) {
                break
            }
            allocated.forEach((elem) => allocations.push(elem))
        }
        
        return allocations
    }

    async runAllocationsOnWorker(ns: NS, worker: string, scripts: Allocation[]): Promise<void> {

        const allocID = makeid(10)

        scripts.sort((a, b) => a.worker.localeCompare(b.worker))

        if (worker !== "home") {
            const toKill = Array.from(await ns.ps(worker)
                .filter((elem) => !elem.filename.endsWith("_once.js")))
            for (let i = 0; i < toKill.length; i++) {
                await killProcess(ns, worker, toKill[i])
            }

            ns.print({
                allocations: scripts,
                ps: toKill
            })
        }


        for (let i = 0; i < scripts.length; i++) {
            const g = scripts[i]
            await ns.scp(g.script, g.worker)
            let result = "started"
            if (!await ns.exec(g.script, g.worker, g.threads, g.target, allocID)) {
                result = "failed"
            }
            ns.print({
                "action": result,
                "worker": g.worker,
                "target": g.target,
                "started": g.script,
                "threads": g.threads
            })    
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
                (srv.moneyAvailable ?? 0) > 0 && 
                !inProgress.has(srv.hostname)
        )

        ns.print(targets.map((srv) => srv.hostname))

        const allocator = new Allocator(ns, servers)

        ns.print({
            capacity: JSON.stringify(allocator.capacity),
            workers: Array.from(allocator.capacity.workers.keys())
        })    
        
        if (allocator.capacity.totalThreads < 1) {
            return
        }
        const allocations: Allocation[] = []

        this.allocateHack(ns, allocator, targets
            .filter((target) => !inProgress.has(target.hostname)))
            .forEach((elem) => allocations.push(elem))
        allocations.forEach((alloc) => inProgress.add(alloc.target))
        this.allocateGrowing(ns, allocator, targets
            .filter((target) => !inProgress.has(target.hostname)))
            .forEach((elem) => allocations.push(elem))
        allocations.forEach((alloc) => inProgress.add(alloc.target))
        this.allocateWeaken(ns, allocator, targets
            .filter((target) => !inProgress.has(target.hostname)))
            .forEach((elem) => allocations.push(elem))

        const byWorker: Map<string, Allocation[]> = new Map()        

        allocations.sort((a, b) => a.worker.localeCompare(b.worker))

        allocations.forEach((alloc) => {
            const items = byWorker.get(alloc.worker) ?? []
            items.push(alloc)
            byWorker.set(alloc.worker, items)
        })

        if (debug) {
            ns.print(byWorker)
        }

        for (const entry of Array.from(byWorker.entries())) {
            const worker = entry[0]
            const allocations = entry[1]
            await this.runAllocationsOnWorker(ns, worker, allocations)
        }
    }
}

