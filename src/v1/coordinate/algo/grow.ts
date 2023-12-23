import { NS, Server } from '@ns'
import { Allocator, Allocation, WorkType } from '/v1/coordinate/allocator.js'
import { Grow } from '/v1/coordinate/types'

export function growCandidates(ns: NS, targets: Server[]): Grow[] {
    const eligable = targets.filter((target) => (target.moneyMax ?? 0) > 0 &&
    (target.moneyAvailable ?? 0) < (target.moneyMax ?? 0) &&
        ns.getServerSecurityLevel(target.hostname) <= ns.getServerMinSecurityLevel(target.hostname) * 1.1 &&
        ns.getServerMaxMoney(target.hostname) > 0 && 
        (target.moneyAvailable ?? 0) / (target.moneyMax ?? 0) < 0.9)

    const inOrder = eligable.map((target) => {
        const growTime = ns.getGrowTime(target.hostname)
        const currentMoney = ns.getServerMoneyAvailable(target.hostname)
        const maxMoney = ns.getServerMaxMoney(target.hostname)

        const coeff = maxMoney/(currentMoney+1)
        const threads = Math.floor(ns.growthAnalyze(target.hostname, coeff))
        
        return {
            hostname: target.hostname,
            time: growTime,
            threads: Math.floor(threads),
            earning: maxMoney - currentMoney,
            money: target.moneyAvailable ?? 0,
            moneyMax: target.moneyMax ?? 0,
            security: ns.growthAnalyzeSecurity(threads, target.hostname)
        } as Grow
    }).filter((elem) => elem.threads > 0)

    inOrder.sort((a, b) => a.threads - b.threads)
    return inOrder
}

export function allocateGrowing(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {

    const allocations: Allocation[] = []

    const growable = growCandidates(ns, targets)
    for (let idx = 0; idx < growable.length; idx++) {
        const grow = growable[idx]
        const allocated = allocator.allocate(WorkType.growing, grow.threads, grow.hostname)
        if(allocated.length == 0) {
            break
        }
        allocated.forEach((elem) => allocations.push(elem))
    }
    
    return allocations
}