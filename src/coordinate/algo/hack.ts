import { NS, Server } from '@ns'
import { Allocator, Allocation, WorkType } from 'coordinate/allocator.js'
import { Hack } from 'coordinate/types'

export function hackCandidates(ns: NS, targets: Server[]): Hack[] {
    const eligable = targets.filter((target) => {
        return (target.moneyMax ?? 0)> 0 && 
            (target.moneyAvailable ?? 0) > ((target.moneyMax ?? 0) * 0.85) &&
            ns.hackAnalyzeChance(target.hostname) > 0.1
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
            threads: Math.floor(hackThreads),
            chance: hackChance,
            time: hackTime,
            security: security
        } as Hack
    }).filter((elem) => elem.threads > 0)
    inOrder.sort((a, b) => b.earnings - a.earnings)
    return inOrder
}

export function allocateHack(ns: NS, allocator: Allocator, targets: Server[]): Allocation[] {
    const allocations: Allocation[] = []

    const toHack = hackCandidates(ns, targets)
    for (const hack of toHack) {
        ns.print(`HACK: ${hack.hostname}: earning=${hack.earnings} time=${hack.time/60.0/1000.0}min threads=${hack.threads} chance=${hack.chance}`)
    }

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