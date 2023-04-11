import { NS } from "@ns";
import {
  deployScripts,
  getTarget,
  getWorkers,
  optimizeThreads,
  prepTarget,
  getMaxThreads,
  formatTime,
} from "./helper";

export async function main(ns: NS): Promise<void> {
  // Settings:
  const scriptRam = 1.75; // Max RAM used by one of the hgw scripts
  const depth = 1; // Change the depth in which we look for our target
  ns.disableLog("ALL");

  // DEBUG:
  ns.tail();

  // Get the best target
  const target = getTarget(ns, depth);
  ns.print("INFO: Target is " + target);

  // Get available worker servers
  let workers = getWorkers(ns, depth);
  ns.print("Available workers are:");
  ns.print("-----------------------");
  for (let worker of workers) {
    ns.print(worker);
  }
  ns.print("-----------------------");

  // Run deploy script, to ensure our scripts exist on all workers
  deployScripts(ns, workers);

  // First prep the traget
  await prepTarget(ns, target, workers, scriptRam);

  // Get the amount of RAM needed for one thread of any script
  let ramPerThread = 1.75;

  // Run an infinite loop
  while (true) {
    // Get the optimal number of threads for each script using the optimizeThreads function
    let [hackThreads, weakenThreads, growThreads] = optimizeThreads(
      ns,
      target,
      getMaxThreads(ns, workers, ramPerThread)
    );

    // Print the optimal number of threads for each script
    ns.print(
      "Optimal threads for attacking " +
        target +
        ": hack = " +
        hackThreads +
        ", weaken = " +
        weakenThreads +
        ", grow = " +
        growThreads
    );

    // Loop through the worker servers
    for (let worker of workers) {
      // Get the name and available RAM of the worker server
      let ram = ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker);

      // Calculate how many threads can be run on this server
      let maxThreads = Math.floor(ram / ramPerThread);

      // Check if there are any hack threads left to run
      if (hackThreads > 0) {
        // Run as many hack threads as possible on this server
        let threads = Math.floor(Math.min(hackThreads, maxThreads));
        ns.exec("hack.js", worker, threads, target);
        // Update the remaining hack threads and RAM
        hackThreads -= threads;
        ram -= threads * ramPerThread;
        // Print the number of hack threads and RAM used on this server
        ns.print(
          "Running " +
            threads +
            " hack threads on " +
            worker +
            " using " +
            threads * ramPerThread +
            " GB RAM"
        );
      }
    }

    // Calculate wait time for the grow and weaken scripts
    let gwWaitTime =
      Math.max(ns.getWeakenTime(target), ns.getGrowTime(target)) + 500;

    // Loop through the worker servers again
    for (let worker of workers) {
      // Get the name and available RAM of the worker server
      let ram = ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker);

      // Calculate how many threads can be run on this server
      let maxThreads = Math.floor(ram / ramPerThread);

      // Check if there are any weaken threads left to run
      if (weakenThreads > 0 && maxThreads >= 1) {
        // Run as many weaken threads as possible on this server
        let threads = Math.floor(Math.min(weakenThreads, maxThreads));
        ns.exec("weaken.js", worker, threads, target);
        // Update the remaining weaken threads and RAM
        weakenThreads -= threads;
        ram -= threads * ramPerThread;
        // Print the number of weaken threads and RAM used on this server
        ns.print(
          "Running " +
            threads +
            " weaken threads on " +
            worker +
            " using " +
            threads * ramPerThread +
            " GB RAM"
        );
      }

      // Check if there are any grow threads left to run
      if (growThreads > 0 && maxThreads >= 1) {
        // Run as many grow threads as possible on this server
        let threads = Math.floor(Math.min(growThreads, maxThreads));
        ns.exec("grow.js", worker, threads, target);
        // Update the remaining grow threads and RAM
        growThreads -= threads;
        ram -= threads * ramPerThread;
        // Print the number of grow threads and RAM used on this server
        ns.print(
          "Running " +
            threads +
            " grow threads on " +
            worker +
            " using " +
            threads * ramPerThread +
            " GB RAM"
        );
      }
    }

    // Wait for all scripts to finish before checking again
    ns.print("Tasks will finish in " + formatTime(gwWaitTime));
    await ns.sleep(gwWaitTime);
  }
}
