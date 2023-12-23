import { NS } from '@ns'
import { Coordinator } from '/v1/coordinate/coordinator'

export async function main(ns : NS) : Promise<void> {
    const coordinator = new Coordinator()
    ns.disableLog('exec')
    ns.disableLog('getHackingLevel')
    ns.disableLog('getHackTime')
    ns.disableLog('getServerGrowth')
    ns.disableLog('getServerMaxMoney')
    ns.disableLog('getServerMaxRam')
    ns.disableLog('getServerMinSecurityLevel')
    ns.disableLog('getServerMoneyAvailable')
    ns.disableLog('getServerRequiredHackingLevel')
    ns.disableLog('getServerSecurityLevel')
    ns.disableLog('getServerUsedRam')
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("sleep")
    ns.disableLog("scp")
    // eslint-disable-next-line no-constant-condition
    while(true) {
        await coordinator.runAllocations(ns)
        await ns.sleep(5000)
    }
}