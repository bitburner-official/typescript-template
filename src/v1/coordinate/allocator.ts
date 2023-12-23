import { Capacity } from '/v1/coordinate/capacity' 
import { NS, Server } from '/../NetscriptDefinitions.js'

export enum WorkType {
    any,
    hacking,
    weaking,
    growing 
}

export type Allocation = {
    worker: string;
    target: string;
    script: string;
    threads: number;
}

const workerGrow = "/worker/grow_once.js"
const workerHack = "/worker/hack_once.js"
const workerWeaken = "/worker/weaken_once.js"

export type WorkTypeShare = Map<WorkType, number>

export class Allocator {

    private capacity: Capacity
    private maxWorkTypeThreads: WorkTypeShare = new Map()

    constructor(ns: NS, workers: Server[], maxWorkTypeShare: WorkTypeShare | undefined = undefined) {
        this.capacity = new Capacity(ns, workers)

        if (maxWorkTypeShare !== undefined) {
            maxWorkTypeShare.forEach((share, wt) => 
                this.maxWorkTypeThreads.set(wt, Math.ceil(share * this.capacity.totalThreads))
            )
        }
        this.report(ns)
    }

    report(ns: NS) {
        ns.print(`Allocator: totalThreads=${this.capacity.totalThreads}}`)
        if (this.maxWorkTypeThreads !== undefined) {
            ns.print(`Allocator: maxWorkTypeThreads=${JSON.stringify(Array.from(this.maxWorkTypeThreads.entries()))}`)
        }
    }

    hasCapacity(): boolean {
        return this.capacity.totalThreads > 0
    }

    allocate(type: WorkType, maxThreads: number, target: string): Allocation[] {

        const allocations: Allocation[] = []

        let toAllocate = this.availableThreads(type, maxThreads)
        if (!toAllocate) {
            return allocations
        }
        
        const workerEntries =  Array.from(this.capacity.workers.entries())
        workerEntries.sort((a, b) => a[1] - b[1])
        for (const entry of workerEntries) {
            const hostname = entry[0]
            const available = entry[1]
            
            if (toAllocate == 0) {
                break
            }

            const allocated = Math.min(available, toAllocate)
            const leftover = available - allocated
            if (leftover > 2) {
                this.capacity.workers.set(hostname, leftover)
            } else {
                this.capacity.workers.delete(hostname)
            }
            toAllocate -= allocated
            this.allocateThreads(type, allocated)

            allocations.push({
                worker: hostname,
                target: target,
                script: scriptName(type),
                threads: allocated
            } as Allocation)

        }
        return allocations
    }

    private availableThreads(type: WorkType, maxThreads: number): number {
        const maxAvailable = 
            Math.min(
                this.maxWorkTypeThreads.get(type) ?? this.capacity.totalThreads,
                this.capacity.totalThreads)
        return Math.floor(Math.min(maxAvailable, maxThreads))
    }

    private allocateThreads(type: WorkType, threads: number): void {
        this.capacity.totalThreads -= threads
        const currentValue = this.maxWorkTypeThreads.get(type)
        if (currentValue !== undefined) {
            this.maxWorkTypeThreads.set(type, currentValue - threads)
        }
    }

}

export function scriptName(type: WorkType): string {
    switch(type) {
        case WorkType.hacking: return workerHack; break
        case WorkType.growing: return workerGrow; break
        case WorkType.weaking: return workerWeaken; break
        default: return ""
    }
}


export function scriptType(script: string): WorkType {
    switch(script) {
        case workerHack: return WorkType.hacking; break
        case workerGrow: return WorkType.growing; break
        case workerWeaken: return WorkType.weaking; break
        default: return WorkType.any
    }
}
