import { NS } from "@ns";
import { getTarget } from "./helper";

export async function main(ns: NS): Promise<void> {
  ns.tprint(getTarget(ns, 1));
}
