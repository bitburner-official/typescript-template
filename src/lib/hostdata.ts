import { NS } from '@ns'

const STATE_FILE = "state.js"

export class HostData {
    public hostname: string
    public path: string[]
    public hacked: boolean
    public owned: boolean
    public backdoor: boolean

    constructor(hostname: string, path: string[], hacked: boolean, owned: boolean, backdoor: boolean) {
        this.hostname = hostname
        this.path = path
        this.hacked = hacked
        this.owned = owned
        this.backdoor = backdoor
   }
}

export class HostList {

    hosts: HostData[]

    constructor(hosts: HostData[]) {
        this.hosts = hosts
    }

    save(ns: NS): void {
        if (ns.fileExists(STATE_FILE)) {
            ns.rm(STATE_FILE)
        }
        const serialized = JSON.stringify(this.hosts)
        ns.write(STATE_FILE, serialized, 'w')
    }

    filtered(predicate: (elem: HostData) => boolean): HostData[] {
        return this.hosts.filter(predicate)
    }

    static load(ns: NS): HostList {
        const stateFile = ns.read(STATE_FILE)
        const hosts = JSON.parse(stateFile)
        return new HostList(hosts)
    }
}