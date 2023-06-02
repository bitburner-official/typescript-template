import { NS, ProcessInfo } from '@ns'

export async function killProcess(ns: NS, worker: string, ps: ProcessInfo): Promise<void> {
    ns.print({
        acion: "kill", 
        worker: worker, 
        script: ps.filename,  
        pid: ps.pid
    })

    ns.kill(ps.filename, worker, ...ps.args)

    while (ns.getRunningScript(ps.pid, worker, ...ps.args)) {
        await ns.sleep(100)
    }
}

export async function killAll(ns: NS, hostname: string): Promise<void> {
    ns.print({
        acion: "killall", 
        hostname: hostname, 
    })


    while (ns.ps(hostname).length > 0) {
        ns.killall(hostname)
        await ns.sleep(100)
    }
}

export function makeid(length: number): string {
    let result           = ''
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
}
