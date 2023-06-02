import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    const infiltrations = ns.infiltration.getPossibleLocations().map((loc)=> ns.infiltration.getInfiltration(loc.name))
    infiltrations.sort((a, b) => a.reward.SoARep - b.reward.SoARep)
    ns.tprint(infiltrations)
}