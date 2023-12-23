import { NS, Server } from '@ns'
import { Allocator, Allocation, WorkType } from '/v1/coordinate/allocator.js'
import { Hack } from '/v1/coordinate/types'

export function hackCandidates(ns: NS, targets: Server[]): Hack[] {
    const eligable = targets.filter((target) => {
        return (target.moneyMax ?? 0)> 0 && 
            (target.moneyAvailable ?? 0) > ((target.moneyMax ?? 0) * 0.5) 
            && ns.getServerSecurityLevel(target.hostname) <= ns.getServerMinSecurityLevel(target.hostname) * 1.1 
            && ns.hackAnalyzeChance(target.hostname) > 0.1
    })

    const inOrder = eligable
    .map((target) => {
        const hackTime = ns.getHackTime(target.hostname)

        const hackFraction = ns.hackAnalyze(target.hostname)
        const hackThreads = 0.5 / hackFraction
        const hackAmount = (target.moneyAvailable ?? 0) * hackFraction * hackThreads
        const hackChance = ns.hackAnalyzeChance(target.hostname)
        
        const earnings = hackAmount / hackTime
        const security = [
            ns.getServerMinSecurityLevel(target.hostname),
            ns.getServerSecurityLevel(target.hostname)
        ]
        return { 
            hostname: target.hostname,
            earnings: earnings,
            money: target.moneyAvailable ?? 0,
            moneyMax: target.moneyMax ?? 0,
            threads: Math.floor(hackThreads),
            chance: hackChance,
            time: hackTime,
            security: security
        } as Hack
    }).filter((elem) => elem.threads > 0)
    inOrder.sort((a, b) => a.threads - b.threads)
    return inOrder
}

export function allocateHack(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {
    const allocations: Allocation[] = []

    const toHack = hackCandidates(ns, targets)
    for (let idx = 0; idx < toHack.length; idx++) {
        const hack = toHack[idx]
        const allocated = allocator.allocate(WorkType.hacking, hack.threads, hack.hostname)
        if(allocated.length == 0) {
            break
        }
        allocated.forEach((elem) => allocations.push(elem))
    }
    
    return allocations
}