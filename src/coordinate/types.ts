
export interface Grow {
    hostname: string;
    threads: number;
    time: number;
}

export interface Hack {
    hostname: string;
    earnings: number;
    threads: number;
    time: number;
    security: number[];
}

export interface Weaken {
    hostname: string;
    amount: number;
    threads: number;
    time: number;
    security: number[];
}

