import { Capacity } from 'coordinate/capacity' 
import { NS, Server } from '/../NetscriptDefinitions.js'

export enum WorkType {
    any,
    hacking,
    weaking,
    growing 
}

export interface Allocation {
    worker: string;
    target: string;
    script: string;
    threads: number;
}

const workerGrow = "/worker/grow_once.js"
const workerHack = "/worker/hack_once.js"
const workerWeaken = "/worker/weaken_once.js"


export class Allocator {

    ns: NS
    capacity: Capacity

    constructor(ns: NS, workers: Server[]) {
        this.ns = ns
        this.capacity = new Capacity(ns, workers)

    }

    freeCapacity(): number {
        let reminder = 0

        this.capacity.workers.forEach(val => {
            reminder += val
        })
        return reminder
    }

    allocate(type: WorkType, maxThreads: number, target: string): Allocation[] {

        const allocations: Allocation[] = []

        let toAllocate = this.availableThreads(type, maxThreads)
        if (!toAllocate) {
            return allocations
        }
        this.ns.tprintf("Allocating %s for %s: maxThreads=%d => %d", this.scriptName(type), target, maxThreads, toAllocate)
        
        const workerEntries =  Array.from(this.capacity.workers.entries())
        workerEntries.sort((a, b) => a[0].localeCompare(b[0]))
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
            this.ns.tprintf("Allocating threads for %s on %s: %d, capacity:%s", 
                target, hostname, allocated, JSON.stringify(this.capacity))
            this.allocateThreads(type, allocated)

            allocations.push({
                worker: hostname,
                target: target,
                script: this.scriptName(type),
                threads: allocated
            } as Allocation)

        }
        return allocations
    }

    private availableThreads(type: WorkType, maxThreads: number): number {
        return Math.floor(Math.min(this.capacity.totalThreads, maxThreads))
    }

    private allocateThreads(type: WorkType, threads: number): void {
        this.capacity.totalThreads -= threads
    }

    private scriptName(type: WorkType): string {
        switch(type) {
            case WorkType.hacking: return workerHack; break
            case WorkType.growing: return workerGrow; break
            case WorkType.weaking: return workerWeaken; break
            default: return ""
        }
    }

}

