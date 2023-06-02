import { NS } from '@ns'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function main(ns : NS) : Promise<void> {
    const stocks = [
        33,97,5,150,5,5,50,2,62,148,79,170,199,96,45,110,105,125,132,130,156,153,15,139,121,81,43,111,69,56,150,42,158,32,89,125,13,41,88,20,114,161,2,42
    ]

    // 33 -> 97 = 64
    //          5 -> 150 = 145
    // 

    let pi = 0
    let total = 0
    let profit = 0
    for (let ps = 1; ps < stocks.length; ps++) {
        const buying = stocks[pi]
        profit = stocks[ps] - buying

        if (stocks[ps] < stocks[ps-1]) { // price drop
            total += stocks[ps-1] - buying
            ns.tprintf("drop at %d, [%d, %d] %d ups total to %d", ps, pi, ps-1,  stocks[ps-1] - buying, total)
            pi = ps
            profit = 0
        }
    }
    if (profit > 0) {
        total += profit
        ns.tprintf("last profit [%d, %d] %d ups total to %d", pi, stocks.length-1, profit, total)
    }
    ns.tprintf("max profit %d", total)
}