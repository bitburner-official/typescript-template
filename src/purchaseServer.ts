import { NS } from "@ns";

export async function main(ns: NS): Promise<void> {
  // How much RAM should the servers have?
  let ram = 16;
  ns.tprint("Trying to buy a server with " + ram + "GB of RAM...");

  // Check if we have enough money
  if (ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(ram)) {
    let hostname = ns.purchaseServer("vServer", ram);
    ns.tprint("INFO: Purchased server " + hostname);
  } else {
    ns.tprint("ERROR: Not enoug money to purchase a new server!");
  }
}
