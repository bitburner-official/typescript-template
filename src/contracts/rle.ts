import { NS } from '@ns'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function main(ns : NS) : Promise<void> {
    const input = 'BwwwwwwwwwwwwNN0000000hhhhhhhQQ7CCCCCCCCnnnJJ33WMcTT337NMMMMNN7777777TDDII1'

    const arr: string[] = [...input]

    let output = ''
    let letter = input[0]
    let counter = -1
    for (const idx in arr) {
        counter+=1
        if (letter != arr[idx]) {
            output = output.concat('' + counter)
            output = output.concat(letter)
            counter = 0
            letter = arr[idx]
            ns.tprintf('%s -> %s', arr[idx], output)
        }
        if (counter > 8) {
            output = output.concat('' + counter)
            output = output.concat(letter)
            counter = 0
        }
    }
    if (counter > 0) {
        output = output.concat('' + counter)
        output = output.concat(letter)
    }

    ns.tprintf('%s', output)
}