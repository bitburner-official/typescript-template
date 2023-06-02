import { NS } from '@ns'
import { Scanner } from './lib/scanner'
import { executeTerminal } from './lib/terminal'

export async function main(ns : NS) : Promise<void> {
    const hostname = ns.args[0] as string
    const hosts = new Scanner().scan(ns)
    const command = "home; connect " + hosts.filtered((elem) => elem.hostname===hostname)[0].path.join(";connect ") + "; connect " + hostname
    executeTerminal(command)
}

export function autocomplete(data: {
    servers: string[]; // list of all servers in the game.
    txts:    string[]; // list of all text files on the current server.
    scripts: string[]; // list of all scripts on the current server.
    flags:   string[]; // the same flags function as passed with ns. Calling this function adds all the flags as autocomplete arguments
}, args: string[]): string[] {
    return [...data.servers]
}