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
 *  3. have root access
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
    let serverRam =
      ns.getServerMaxRam(servers[i]) - ns.getServerUsedRam(servers[i]);
    let serverHackingLevel = ns.getServerRequiredHackingLevel(servers[i]);
    let serverHasRoot = ns.hasRootAccess(servers[i]);
    let playerHackingLevel = ns.getHackingLevel();

    // Check if the server is meeting following conditions:
    //  1. serverRam >= 8
    //  2. serverHackingLevel <= playerHackingLevel
    //  3. serverHasRoot
    if (
      serverRam >= 8 &&
      serverHackingLevel <= playerHackingLevel &&
      serverHasRoot
    ) {
      // If conditions are met push the server to the workers array
      workers.push({ server: servers[i], ram: serverRam });
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
 * Each object should have a 'server' property indicating the server hostname, and a 'ram' property indicating the server's RAM.
 */
export function deployScripts(
  ns: NS,
  workers: { server: string; ram: number }[]
) {
  for (let worker of workers) {
    // Check if scripts exist on target worker
    if (
      ns.fileExists("hack.js", worker.server) &&
      ns.fileExists("grow.js", worker.server) &&
      ns.fileExists("weaken.js", worker.server)
    ) {
      return;
    } else {
      // If not copy over the scripts
      ns.scp(["hack.js", "grow.js", "weaken.js"], worker.server);
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
function prepWorker(ns: NS, server: string) {
  // First check if we still need root access
  if (!ns.hasRootAccess(server)) {
    // Check which exploits are available, and use them.
    if (ns.fileExists("BruteSSH.exe", server)) {
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
