import { NS, NodeStats } from '@ns'
import { tabulate } from './lib/tabulate';

const targetNodes = 30
const targetCores = 16
const targetRam = 64
const targetLevel = 200    


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function main(ns : NS) : Promise<void> {

    const myMoney = (): number => {
        return ns.getPlayer().money
    }
    
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("sleep")
    
    const hacknet = ns.hacknet

    
    // eslint-disable-next-line no-constant-condition
    while(true) {
        while(hacknet.numNodes() < targetNodes) {
            const cost = hacknet.getPurchaseNodeCost()
            if (myMoney() < cost) {
                break
            }
        }
        
        for (let i = 0; i < hacknet.numNodes(); i++) {
            if (hacknet.getNodeStats(i).level <= targetLevel) {
                const cost = hacknet.getLevelUpgradeCost(i, 10)
                if (myMoney() < cost) {
                    break
                }
                hacknet.upgradeLevel(i, 10)
            }
        }
        
        for (let i = 0; i < hacknet.numNodes(); i++) {
            while (hacknet.getNodeStats(i).ram < targetRam) {
                const cost = hacknet.getRamUpgradeCost(i, 2)
                if (myMoney() < cost) {
                    break
                }
                hacknet.upgradeRam(i, 2)
            }
        }
        
        for (let i = 0; i < hacknet.numNodes(); i++) {
            while (hacknet.getNodeStats(i).cores < targetCores) {
                const cost = hacknet.getCoreUpgradeCost(i, 1)
                if (myMoney() < cost) {
                    break
                }
                hacknet.upgradeCore(i, 1)
            }
        }
        printDashboard(ns)
        await ns.sleep(5000)
    }

}

async function printDashboard(ns: NS): Promise<void> {
    ns.clearLog();
    
    const nodes: NodeStats[]  = []
    for (let i = 0; i < ns.hacknet.numNodes(); i++) {
        nodes.push(ns.hacknet.getNodeStats(i))
    }
    const maxNodes = ns.hacknet.maxNumNodes() < targetNodes ? targetNodes : Infinity
    ns.print(`Nodes: ${nodes.length} of ${maxNodes}`);
    ns.print(`Total Production: ${nodes.length === 0 ? "$0 /s" : ns.formatNumber(nodes.map((v, i) => ns.hacknet.getNodeStats(i).production).reduce((a, b) => a + b))} /s`)
    ns.print(`Total Produced: ${nodes.length === 0 ? "$0" : ns.formatNumber(nodes.map((v, i) => ns.hacknet.getNodeStats(i).totalProduction).reduce((a, b) => a + b))}`)
    
    type NodeInfo = {
        "Node": string
         "Produced": string, 
         "Uptime": string, 
         "Production": string, 
         "Lv": number, 
         "RAM": string, 
         "Cores": number
    }

    const rows: NodeInfo[] = nodes.map( (nodeState) => 
        ({
            Node: nodeState.name,
            Produced: ns.formatNumber(nodeState.totalProduction),
            Uptime: ns.tFormat(nodeState.timeOnline*1000),
            Production: `${ns.formatNumber(nodeState.production)} / s`,
            Lv: nodeState.level,
            RAM: ns.formatRam(nodeState.ram),
            Cores: nodeState.cores,
        } as NodeInfo)
    )

    tabulate(ns, rows, undefined, false)
}