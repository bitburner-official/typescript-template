
export type Grow = {
    hostname: string;
    threads: number;
    time: number;
    earning: number;
    security: number
}

export type Hack = {
    hostname: string;
    earnings: number;
    money: number;
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

