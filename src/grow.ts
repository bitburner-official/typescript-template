import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // Light grow script

  // Get grow target from passed args
  const target = ns.args[0].toString();

  // Grow the given target
  await ns.grow(target);
}
