import { NS } from '@ns'
import { HostData } from 'lib/hostdata'
import { Scanner } from 'lib/scanner'
import { executeTerminal } from 'lib/terminal'

export async function main(ns : NS) : Promise<void> {
    const hosts = new Scanner().scan(ns)
    const toBackdoor = hosts.filtered((elem: HostData) => elem.hacked && !elem.backdoor && !elem.owned)
    if (toBackdoor.length > 0) {
        // goto first and backdoor
        const hostData: HostData = toBackdoor[0]
        executeTerminal("home; connect " + 
            hostData.path.join(";connect ") + 
            "; connect " + hostData.hostname +
            "; backdoor")
    }    
}