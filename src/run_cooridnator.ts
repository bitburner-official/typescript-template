import { NS } from '@ns'
import { Coordinator } from 'coordinate/coordinator'

export async function main(ns : NS) : Promise<void> {
    const coordinator = new Coordinator()
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("sleep")
    while(true) {
        await coordinator.runAllocations(ns)
        await ns.sleep(5000)
    }
}