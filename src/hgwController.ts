import { NS } from "@ns";
import { deployScripts, getTarget, getWorkers } from "./helper";

export async function main(ns: NS): Promise<void> {
  // Settings:
  const depth = 1; // Change the depth in which we look for our target
  ns.disableLog("ALL");
  const scriptRam = 1.75; // Max RAM used by one of the hgw scripts (for now hardcoded)

  // Get best target
  const target = getTarget(ns, depth);
  ns.print("INFO: " + target);

  // Prepare workers

  // Get available worker servers
  const workers = getWorkers(ns, depth);

  // Run deploy script, to ensure our scripts exist on all workers
  deployScripts(ns, workers);
}
