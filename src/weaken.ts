import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // Light weaken script

  // Get weaken target from passed args
  const target = ns.args[0].toString();

  // Weaken the given target
  await ns.weaken(target);
}

