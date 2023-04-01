import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // Light hack script

  // Get hacking target from passed args
  const target = ns.args[0].toString();

  // Hack the given target
  await ns.hack(target);
}
