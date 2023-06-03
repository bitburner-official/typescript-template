import { NS, Server } from '@ns'
import { Allocator, Allocation, WorkType } from 'coordinate/allocator.js'
import { Weaken } from 'coordinate/types'

export function weakenCandidate(ns: NS, targets: Server[]): Weaken[] {
    const eligable = targets.filter((target) => {
        return (target.moneyMax ?? 0) > 0
    })

    const weakenDecrese = ns.weakenAnalyze(1)

    const inOrder = eligable
    .map((target) => {
        const weakenTime = ns.getWeakenTime(target.hostname)
        const weakenAmount = ns.getServerSecurityLevel(target.hostname)/2
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
    return inOrder
}

export function allocateWeaken(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {
    const allocations: Allocation[] = []

    const inOrder = weakenCandidate(ns, targets)
    for (const weak of inOrder) {
        ns.print(`WEAK: ${weak.hostname}: time=${weak.time/60.0/1000.0}min threads=${weak.threads} security=${weak.security}`)
    }

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
