import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const hostname = ns.args[0].toString()
    await ns.grow(hostname)
    ns.print({
        action: "complete",
        op: 'growing',
        target: hostname
    })
}