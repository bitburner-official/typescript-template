import { NS } from "../NetscriptDefinitions"
import { Queue } from "./lib/queue"

export async function main(ns: NS): Promise<void> {
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("sleep")

    const baseName = "π-"
    let multi = 2 // assumes you need up to 8gb for your hack and distro script. you may be able to lower this accordingly.
    const maxRam = ns.getPurchasedServerMaxRam()

    const servers = ns.getPurchasedServers()
    if (servers.length > 0) {
        const maxRam = servers.reduce((a, e) => Math.max(a, ns.getServerMaxRam(e)), 3)
        while (Math.pow(2, multi) < maxRam) multi++
    }
    while (ns.getPurchasedServerCost(Math.pow(2, multi)) < ns.getPlayer().money) multi++
    multi = Math.max(2, multi-1)

    const queue = new Queue<string>()
    for (let i = 0; i < servers.length; i++) {
        queue.push(servers[i])
    }

    ns.tprintf("Starting multiplier: %d", multi)

    const running = true
    let nameCounter = 1
    while (running) {
        if (Math.pow(2, multi) >= maxRam) {
            ns.tprint("maxed on servers, killing process")
            return
        }

        const count = queue.length()
        const cash = ns.getPlayer().money
        const ram = Math.pow(2, multi)
        const cost = ns.getPurchasedServerCost(ram)

        if (count >= ns.getPurchasedServerLimit() && cash >= cost) {
            const peek = queue.peek()
            if (!peek) {
                continue
            }
            
            if (Math.min(maxRam, Math.pow(2, multi)) <= ns.getServerMaxRam(peek)) {
                ns.tprint("bumping ram multi from " + multi + " to " + (multi + 1))
                multi++
                continue
            }
            else {
                const current = queue.pop()
                if (current) {
                    ns.print("deleting " + current)
                    ns.killall(current)
                    ns.deleteServer(current)
                }
            }
        }
        else if (count < ns.getPurchasedServerLimit() && cash >= cost) {
            const name = baseName + pad(nameCounter, 8)
            nameCounter++
            const newBox = ns.purchaseServer(name, ram)
            ns.tprint({
                purchased: name,
                ram: ram
            })
            queue.push(newBox)
        }

        await ns.asleep(1000)
    }

}

function pad(num: number, size: number): string {
    const s = "000000000" + num
    return s.substr(s.length-size)
}

