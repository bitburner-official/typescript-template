
export type Grow = {
    hostname: string;
    threads: number;
    time: number;
    earning: number;
    money: number;
    moneyMax: number;
    security: number
}

export type Hack = {
    hostname: string;
    earnings: number;
    money: number;
    moneyMax: number;
    threads: number;
    chance: number;
    time: number;
    security: number[];
}

export type Weaken = {
    hostname: string;
    amount: number;
    threads: number;
    time: number;
    security: number[];
}

