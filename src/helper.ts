import { NS } from "@ns";

/**
 * Scans for all servers in the whole network.
 *
 * @param ns - The NetScriptAPI object.
 * @returns Array of server hostnames as strings.
 */
export function scanAllServers(ns: NS) {
  let allServers = new Array<string>();
  let stack = new Array<string>();
  let home = ns.getHostname();
  stack.push(home);
  while (stack.length > 0) {
    let server = stack.pop();
    let scan = ns.scan(server);
    for (let i = 0; i < scan.length; i++) {
      if (scan[i] !== server && !allServers.includes(scan[i])) {
        allServers.push(scan[i]);
        stack.push(scan[i]);
      }
    }
  }
  return allServers;
}

/**
 * Scans for all servers in a specified depth. The depth
 * specfies how many hops the servers can be away from
 * home.
 *
 * @param ns - The NetScriptAPI object.
 * @param n - Number specifying the depth in which the
 * function scans for servers.
 * @returns Array containing server hostnames as strings.
 */
export function scanDepth(ns: NS, n: number) {
  let allServers = new Array<string>();
  let queue = new Array<{ server: string; depth: number }>();
  let home = ns.getHostname();
  queue.push({ server: home, depth: 0 });
  while (queue.length > 0) {
    let { server, depth } = queue.shift()!;
    if (depth === n) {
      allServers.push(server);
    } else if (depth < n) {
      let scan = ns.scan(server);
      for (let i = 0; i < scan.length; i++) {
        if (scan[i] !== server && !allServers.includes(server[i])) {
          queue.push({ server: scan[i], depth: depth + 1 });
        }
      }
    }
  }
  return allServers;
}

/**
 * Print out the stats of the provided servers
 * to the terminal.
 *
 * @param ns - The NetScriptAPI object.
 * @param servers - Array containing server hostnames as strings.
 */
export function printServers(ns: NS, servers: string[]) {
  // Print table header
  ns.tprintf(
    "%-18s  |  %-15s  |  %-15s  |  %-15s  |  %-15s",
    "Server",
    "Available Money",
    "Max Money",
    "Security",
    "Req. Level"
  );
  // Loop over all servers
  for (let server of servers) {
    // Get server information
    let availMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let security = ns.getServerSecurityLevel(server);
    let reqLevel = ns.getServerRequiredHackingLevel(server);
    // Color coding for money values
    let moneyPercent = (availMoney / maxMoney) * 100;
    let colorReset = "\u001b[0m";
    let moneyColor = "";
    if (moneyPercent >= 70) {
      moneyColor = "\u001b[32m"; // Green
    } else if (moneyPercent >= 25 && moneyPercent < 75) {
      moneyColor = "\u001b[33m"; // Yellow
    } else {
      moneyColor = "\u001b[31m"; // Red
    }
    let availMoneyString = moneyColor + availMoney.toFixed(2) + colorReset;
    // Print values
    ns.tprintf(
      "%-18s  |  %24s  |  %15s  |  %15s  |  %15s",
      server,
      availMoneyString,
      maxMoney.toFixed(2),
      security.toFixed(2),
      reqLevel.toString()
    );
  }
}

/**
 * Print out the stats and score of the provided servers
 * to the terminal.
 *
 * @param ns - The NetScriptAPI object.
 * @param servers - Array containing server hostnames as strings.
 */
export function printServerScores(ns: NS, servers: string[]) {
  // Print table header
  ns.tprintf(
    "%-22s  │  %-15s  │   %-15s",
    "\u001b[1m" + "Server",
    "Money",
    "Score" + "\u001b[0m"
  );
  ns.tprintf("%'-58s", "");

  // Define a array for the server scores
  let scores = [];

  // Loop over all servers
  for (let server of servers) {
    // Get server information
    let availMoney = ns.getServerMoneyAvailable(server);
    let maxMoney = ns.getServerMaxMoney(server);
    let security = ns.getServerSecurityLevel(server);
    let moneyPercent = (availMoney / maxMoney) * 100;
    let securityScore = (100 - security) * 10;

    // Calculate score of the server
    let score = moneyPercent + securityScore;

    // Color coding for money values
    let colorReset = "\u001b[0m";
    let moneyColor = "";
    if (moneyPercent >= 70) {
      moneyColor = "\u001b[32m"; // Green
    } else if (moneyPercent >= 25 && moneyPercent < 75) {
      moneyColor = "\u001b[33m"; // Yellow
    } else {
      moneyColor = "\u001b[31m"; // Red
    }
    let moneyString = moneyColor + moneyPercent.toFixed(2) + colorReset;

    // Push the values to the scores array
    scores.push({ server: server, score: score, moneyPercent: moneyString });
  }

  // Sort the array
  scores.sort((a, b) => b.score - a.score);

  // Loop over the array to print out our scores
  for (let i = 0; i < scores.length; i++) {
    ns.tprintf(
      "%-18s  │  %24s  │  %15s",
      scores[i].server,
      scores[i].moneyPercent + " %",
      scores[i].score.toFixed(2)
    );
  }
}

/**
 * Uses the scanDepth() function and sorts the output after a score.
 * Score is calculated by adding up the percentage of available money
 * and the securityScore.
 *
 * @param ns - The NetScriptAPI object.
 * @param depth - Optional. The depth in which the scanDepth() function scans for
 * servers.
 * @returns Sorted array of servers with their coresponding scores.
 *
 */
function getWeightedServers(ns: NS, depth: number = 1) {
  // Define array to return at the end
  let weightedServers = [];

  // Get Server array with specified depth
  const servers = scanDepth(ns, depth);

  // Loop over all servers
  for (let server of servers) {
    // Define our sort criterias
    let moneyPercent =
      (ns.getServerMoneyAvailable(server) / ns.getServerMaxMoney(server)) * 100;
    let securityScore = (100 - ns.getServerSecurityLevel(server)) * 10;

    // Calculate score
    let score = moneyPercent + securityScore;

    // Push values to weightedServers
    weightedServers.push({ server: server, score: score });
  }
  // Sort the array
  weightedServers.sort((a, b) => b.score - a.score);

  // Return our array
  return weightedServers;
}

/**
 * Returns the name of the server with the highest weight, based on its hacking difficulty
 * and the amount of money it contains.
 *
 * @param ns - The NetScriptAPI object.
 * @param depth - Optional. The maximum depth to search for servers. Default is 1.
 * @returns The name of the target server.
 */
export function getTarget(ns: NS, depth: number = 1) {
  const weightedServers = getWeightedServers(ns, depth);
  return weightedServers[0].server;
}

/**
 * Returns an array of server names that meet the following conditions:
 *  1. have at least 8GB of RAM
 *  2. require a hacking level equal to or lower than the player's hacking level
 *  3. have root access (or if the server has not root yet, try to gain root)
 *
 * @param ns - The NetScriptAPI object.
 * @param depth - Optional. The maximum depth to search for servers. Default is 1.
 * @returns An array of server names that meet the conditions.
 */
export function getWorkers(ns: NS, depth: number = 1) {
  // Get all servers in the specified depth
  let servers = scanDepth(ns, depth);

  // Define the array we want to return
  let workers = [];

  for (let i = 0; i < servers.length; i++) {
    // Check each server if it is a vailable worker for us
    let serverHackingLevel = ns.getServerRequiredHackingLevel(servers[i]);
    let serverHasRoot = ns.hasRootAccess(servers[i]);
    let playerHackingLevel = ns.getHackingLevel();

    // Check if the server is meeting following conditions:
    // serverHackingLevel <= playerHackingLevel
    if (serverHackingLevel <= playerHackingLevel) {
      if (serverHasRoot) {
        // If conditions are met push the server to the workers array
        workers.push(servers[i]);
      } else {
        // If server has no root try to gain root
        if (gainRoot(ns, servers[i])) {
          workers.push(servers[i]);
        }
      }
    }
  }

  // Return the array
  return workers;
}

/**
 * Deploys the necessary scripts to a list of workers.
 *
 * @param ns - The namespace object used to interact with the game world.
 * @param workers - An array of objects representing the workers to deploy scripts to.
 */
export function deployScripts(ns: NS, workers: string[]) {
  for (let worker of workers) {
    // Check if scripts exist on target worker
    if (
      !ns.fileExists("hack.js", worker) ||
      !ns.fileExists("grow.js", worker) ||
      !ns.fileExists("weaken.js", worker)
    ) {
      // Scripts dont exist, copy them over
      ns.scp(["hack.js", "grow.js", "weaken.js"], worker, "home");
    }
  }
}

/**
 * Tries to gain root on the specified server, and returns whether or not we were successfull.
 *
 * @param ns - The namespace object used to interact with the game world.
 * @param server - The hostname of the server to attack.
 * @returns True if we now have root access and false if we do not.
 */
function gainRoot(ns: NS, server: string) {
  // First check if we still need root access
  if (!ns.hasRootAccess(server)) {
    // Check which exploits are available, and use them.
    if (ns.fileExists("BruteSSH.exe", "home")) {
      ns.brutessh(server);
    }
    // ToDo: Add Code for the other exploits

    // After all exploits are run, nuke the server to gain
    // root access
    ns.nuke(server);
  }

  // Return hasRootAccess, so we know if we managed to gain root
  return ns.hasRootAccess(server);
}

/**
 * Returns the longer delay it takes to either grow or weaken the server.
 *
 * @param ns The game namespace object.
 * @param server The name of the server.
 * @returns The longer of the two times, in some unit of time.
 */
export function getGrowWeakenTime(ns: NS, server: string): number {
  // Get the time it takes to grow and weaken the server.
  let growTime = ns.getGrowTime(server);
  let weakenTime = ns.getWeakenTime(server);

  // Return the longer of the two times using the Math.max() function.
  // This simplifies the code and makes it more concise.
  return Math.max(growTime, weakenTime);
}

/**
 * Preps the target till the stats meet the thresholds.
 *
 * @param ns The game namespace object.
 * @param target The hostname of the target as string.
 * @param workers Array of available workers.
 * @param scriptRam Amount of Ram needed by the hack/grow/weaken scripts.
 */
export async function prepTarget(
  ns: NS,
  target: string,
  workers: string[],
  scriptRam: number
) {
  let moneyThresh = ns.getServerMaxMoney(target) * 0.75;
  let securityThresh = ns.getServerMinSecurityLevel(target) + 5;

  // Ensure root on target
  if (!ns.hasRootAccess(target)) {
    gainRoot(ns, target);
  }

  while (
    ns.getServerSecurityLevel(target) > securityThresh ||
    ns.getServerMoneyAvailable(target) < moneyThresh
  ) {
    let growWeakenTime = getGrowWeakenTime(ns, target) + 500;
    ns.print("Running grow/weaken task in " + formatTime(growWeakenTime));
    for (let worker of workers) {
      let serverRamAvail =
        ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker);
      let workerThreads = Math.floor(serverRamAvail / scriptRam);
      if (ns.getServerSecurityLevel(target) <= securityThresh) {
        ns.exec("grow.js", worker, workerThreads, target);
      } else if (workerThreads % 2 === 0) {
        ns.exec("grow.js", worker, workerThreads / 2, target);
        ns.exec("weaken.js", worker, workerThreads / 2, target);
      } else {
        ns.exec("grow.js", worker, (workerThreads + 1) / 2, target);
        ns.exec("weaken.js", worker, (workerThreads - 1) / 2, target);
      }
    }
    await ns.sleep(growWeakenTime);
  }
}

/**
 * Formats a given number of milliseconds into a human-readable string
 * with the time in the next biggest type (e.g. 1 minute and 32 seconds for an
 * input of 92000).
 * @param milliseconds The number of milliseconds to format.
 * @returns A string with the formatted time or "0 milliseconds" if the input is
 * zero or negative.
 */
export function formatTime(milliseconds: number): string {
  // Define the time units and their corresponding values in milliseconds
  const units = [
    { name: "day", value: 86400000 },
    { name: "hour", value: 3600000 },
    { name: "minute", value: 60000 },
    { name: "second", value: 1000 },
    { name: "millisecond", value: 1 },
  ];

  // Initialize an empty string to store the result
  let result = "";

  // Loop through the units from largest to smallest
  for (let i = 0; i < units.length; i++) {
    // Calculate how many times the current unit fits into the remaining
    // milliseconds
    let count = Math.floor(milliseconds / units[i].value);

    // If the count is positive, add it to the result with the unit name
    if (count > 0) {
      result += `${count} ${units[i].name}${count > 1 ? "s" : ""} `;
      // Subtract the counted milliseconds from the remaining milliseconds
      milliseconds -= count * units[i].value;
    }

    // If the result is not empty and the remaining milliseconds are zero, break
    //the loop
    if (result && milliseconds === 0) {
      break;
    }
  }

  // Return the result or "0 milliseconds" if it is empty
  return result || "0 milliseconds";
}

/**
 * A function that returns an array of numbers representing the optimal amount of threads
 * to run a script that hacks, weakens and grows a target server.
 * @param ns The games namespace object.
 * @param target The name of the target server to hack.
 * @param maxThreads The maximum number of threads available for the scripts.
 * @returns An array of numbers [hackThreads, weakenThreads, growThreads], where each number
 * is the optimal number of threads for the corresponding script.
 */
export function optimizeThreads(
  ns: NS,
  target: string,
  maxThreads: number
): number[] {
  // Get the target server's minimum security level, maximum money and current values
  let minSecurity = ns.getServerMinSecurityLevel(target);
  let maxMoney = ns.getServerMaxMoney(target);
  let currentSecurity = ns.getServerSecurityLevel(target);
  let currentMoney = ns.getServerMoneyAvailable(target);

  // Define the thresholds for security and money
  let securityThreshold = minSecurity + 5;
  let moneyThreshold = maxMoney * 0.75;

  // Initialize the number of threads for each script
  let hackThreads = 0;
  let weakenThreads = 0;
  let growThreads = 0;

  // Calculate how many threads are needed to hack a certain percentage of money from the target
  // The percentage is set to 0.7 by default, but can be changed
  let hackPercentage = 0.7;
  hackThreads = Math.ceil(hackPercentage / ns.hackAnalyze(target));

  // Calculate how many threads are needed to grow the money by a certain factor
  // The factor is set to maxMoney / currentMoney by default, but can be changed
  let growFactor = maxMoney / currentMoney;
  growThreads = Math.ceil(ns.growthAnalyze(target, growFactor));

  // Calculate how many threads are needed to weaken the security by a certain amount
  // The amount is set to currentSecurity - minSecurity by default, but can be changed
  let weakenAmount = currentSecurity - minSecurity;
  weakenThreads = Math.ceil(weakenAmount / ns.weakenAnalyze(1));

  // Check if there are enough threads available for each script
  // If not, reduce the number of threads proportionally
  let totalThreads = hackThreads + weakenThreads + growThreads;
  if (totalThreads > maxThreads) {
    let ratio = maxThreads / totalThreads;
    hackThreads = Math.floor(hackThreads * ratio);
    weakenThreads = Math.floor(weakenThreads * ratio);
    growThreads = Math.floor(growThreads * ratio);
    // Adjust for rounding errors
    let remainingThreads =
      maxThreads - (hackThreads + weakenThreads + growThreads);
    if (remainingThreads > 0) {
      // Allocate remaining threads to the most needed script
      if (currentSecurity > securityThreshold) {
        weakenThreads += remainingThreads;
      } else if (currentMoney < moneyThreshold) {
        growThreads += remainingThreads;
      } else {
        hackThreads += remainingThreads;
      }
    }
  }

  // Return an array of numbers representing the optimal number of threads for each script
  return [
    Math.floor(hackThreads),
    Math.floor(weakenThreads),
    Math.floor(growThreads),
  ];
}

/**
 * Returns the max number of threads we can run a script with the given
 * scriptRam on the provided worker servers.
 *
 * @param ns The namespace object of the Netscript API
 * @param workers Array of hostnames, representing the worker servers.
 * @param scriptRam Amount of RAM needed to run a script.
 * @returns The max number of threads we are able to run on all of our workers.
 */
export function getMaxThreads(
  ns: NS,
  workers: string[],
  scriptRam: number
): number {
  // Initalize our variable
  let maxThreads = 0;

  // Loop through the worker servers to find out how much threads can be run on each
  for (let worker of workers) {
    let workerThreads =
      (ns.getServerMaxRam(worker) - ns.getServerUsedRam(worker)) / scriptRam;
    maxThreads += workerThreads;
  }

  // Return the final result
  return maxThreads;
}
