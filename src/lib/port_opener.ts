import { NS, Server } from '@ns'


class OpenerProgram {
    name: string
    isOpen: (server: Server) => boolean
    opener: (hostname: string) => void

    constructor(
        name: string,  
        isOpen: (server: Server) => boolean, 
        opener: (hostname: string) => void  
    ) {
        this.name = name
        this.isOpen = isOpen
        this.opener = opener
    }
}


export class PortOpener {

    available: OpenerProgram[] = [];
    
    constructor(ns: NS) {
    
        const openers = [
            new OpenerProgram("BruteSSH.exe", (server: Server) => { return server.sshPortOpen }, (hostname: string) => { return ns.brutessh(hostname) }),
            new OpenerProgram("FTPCrack.exe", (server: Server) => { return server.ftpPortOpen }, (hostname: string) => { return ns.ftpcrack(hostname) }),
            new OpenerProgram("relaySMTP.exe", (server: Server) => { return server.smtpPortOpen }, (hostname: string) => { return ns.relaysmtp(hostname) }),
            new OpenerProgram("HTTPWorm.exe", (server: Server) => { return server.httpPortOpen }, (hostname: string) => { return ns.httpworm(hostname) }),
            new OpenerProgram("SQLInject.exe", (server: Server) => { return server.sqlPortOpen }, (hostname: string) => { return ns.sqlinject(hostname) }),
        ]
        
        openers.forEach((opener) => {
            if ( ns.fileExists(opener.name) ) {
                this.available.push(opener)
            }
        })
    }

    open(server: Server): boolean {
        if (server.numOpenPortsRequired == null) {
            return true
        }
        for (const idx in this.available) {
            const opener = this.available[idx]
            if (opener.isOpen(server)) {
                continue
            }
            opener.opener(server.hostname)
        }
        return server.openPortCount != null && (server.numOpenPortsRequired - server.openPortCount) < 1
    }

}