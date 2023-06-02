# BitBurner scripts to rule the world

Note: Based on https://github.com/bitburner-official/typescript-template

## How to use scripts

(please note, all scripts are .js in the game and compiled from .ts)

`run_coordinator.ts` starts process of bin-packing nodes with worker tasks. It runs in a loop and assigns threads to work on weak, hack or grow.
Only eligable targets are considered:
* for hack only with low security and >95% money
* for grow only with low security
* for weaken everything else

Coordinator uses all hosts including home. However will keep a reserve of 128GB at home. Tunable in coordinate/capacity.ts

To open new hosts use `run_opener.ts`. This script will periodically scan hosts and try to hack them running port openers if they are available

To buy more servers `run_serverbuyer.ts` can be used. It will try to buy and maximize servers and will stop doing that once no more servers can be bought or upgraded

Hackned nodes can be constantly upgraded as well with `run_nodeupgrader.ts`. Do not recommend to run it in early stages as it a waste of money. As soon as you can get coordinator running - it will be much better in terms of money.

## Infiltration

Script `infiltration.js` is exactly for this. It runs in a background and waits until you start to inflitrate. It will automatically accomplish all the tasks.

```
alias inf="home ; run infiltration.js --status"
alias infon="home ; run infiltration.js --start"
alias infoff="home ; run infiltration.js --stop"
```
