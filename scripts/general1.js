

//If the max is hit, go down at leas this many levels or until the min is hit, whichever is first
const difficultyDeltaDown = 7
//Difficulty above base (1-100) to kick into damage control mode, should be less than difficultyDeltaDown
const failLineThresh = 10
//target range from min difficulty
const securityRange = 10

/** @param {import("../NetscriptDefinitions").NS} ns **/
export async function main(ns) {
	var target = ns.args[0]

	var moneyFloor = 1000
	var moneyFloorIndex = ns.args.findIndex(a => a === "--floor")
	if (moneyFloorIndex > -1) {
		moneyFloor = ns.args[moneyFloorIndex + 1]
	}

	var minTake = 1000
	var minTakeIndex = ns.args.findIndex(a => a === "--minTake")
	if (minTakeIndex > -1) {
		minTake = ns.args[minTakeIndex + 1]
	}
	//var minHackFloat = ns.args[1] ? ns.args[1] : 5
	//var minMoney = ns.args[2] ? ns.args[2] : 20000

	//getServerNumPortsRequired('server') - figures out the min number of ports for NUKE to take
	//nuke('server') - goes after ports for server access, using NUKE.exe, nuke will probably open ports, 
	//   but not necessarily gain acces, just keep going
	// NOTE: there are other implied programs at work here
	//hasRootAccess('server') - the ultimate sign to stop nuking

	//getServerMoneyAvailable('server') - how much money there is to take on a hack
	//hack('server, {threads: <num>, stock: <bool>}) - tries to steal money, but only if a server has a low enough hack-level
	//   	returns money stolen, 0 on a fail
	//grow('server', {threads: <num>, stock: <bool>}) - generates money on the server
	//weaken('server', {threads: <num>}) - makes a server easier to hack() by lowering the Security Level
	//		returns amount weakend by, (.05 * threads, usually)
	//getServerRequiredHackingLevel('server') - returns the hacklevel needed to successfully hack
	//getServerMinSecurityLevel('server') - the lowest a server can be weakened to
	//getHackingLevel() - returns your hacking level

	//tprint('') - like print, but for here

	//script that auto rate corrects?

	//step 0: who? where?
	if (!ns.serverExists(target)) {
		ns.tprint(`Server ${target} doesn't exist!`)
		return 1
	}

	var reqLevel = ns.getServerRequiredHackingLevel(target)
	var myLevel = ns.getHackingLevel()
	if (reqLevel > myLevel) {
		ns.tprint(`Server ${target} is way too hard right now (S:${reqLevel} / Y:${myLevel}`)
	}

	var moneyCieling = 100000
	var moneyCielingIndex = ns.args.findIndex(a => a === "--cieling")
	if (moneyCielingIndex > -1) {
		moneyCieling = ns.args[moneyCielingIndex + 1]
	}

	var startNumberPorts = ns.getServerNumPortsRequired(target)
	ns.tprint(`Server ${target} requires ${startNumberPorts} to pop.`)

	//step 1: do we have access?
	while (!ns.hasRootAccess(target)) {

		ns.nuke(target)
		await ns.sleep(500)
	}
	ns.tprint('In and Ready')

	//step 2: just... take everything
	var moneyMode = 'take'
	var failureRows = 0
	var moneyMade = 0
	var downfall = 0
	ns.tprint(`Current: ${ns.getServerMoneyAvailable(target)} / Stop Thresh: ${moneyFloor}`)
	while (ns.getServerMoneyAvailable(target) > moneyFloor) {

		if (moneyMode === 'take') {
			var moneySwing = await ns.hack(target)
			moneyMade += moneySwing
			ns.tprint(`${target} | Hacked for \$${moneySwing}`)

			//failing too often trips a soften run
			if (moneySwing <= 0) {
				failureRows += 1
				if (failureRows >= failLineThresh) {
					moneyMode = 'adjust'
					downfall = 0
					ns.tprint(`Failed too often, softening...`)
				}
			}
			else {
				failureRows = 0
			}

			if (
				ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + securityRange
				|| ns.getServerSecurityLevel(target) >= 100) {
				ns.tprint('Too hard, softening...')
				moneyMode = 'adjust'
			}
			else if (moneySwing < minTake || ns.getServerMoneyAvailable(target) < moneyFloor) {
				ns.tprint(`${target} is out of money!`)
				moneyMode = 'grow'
			}
		}
		else if (moneyMode === 'adjust') {
			//things have got too hard, soften the server
			downfall += await ns.weaken(target)

			//weaken until you shouldn't or can't
			if (downfall >= difficultyDeltaDown || ns.getServerSecurityLevel(target) <= ns.getServerMinSecurityLevel(target)) {
				//we have done enough, resume hack
				moneyMode = 'take'
				downfall = 0
				ns.tprint('Resuming hack...')
			}
		}
		else if (moneyMode == 'grow') {
			ns.tprint(`growing ${target}`)
			await ns.grow(target)

			if(ns.getServerMoneyAvailable(target) > moneyCieling){
				ns.tprint(`${target} recovered, continuing...`)
				moneyMode = 'take'
				downfall = 0
			}

			if (
				ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target) + securityRange
				|| ns.getServerSecurityLevel(target) >= 100) {
				ns.tprint('Too hard, softening...')
				moneyMode = 'adjust'
				downfall = 0
			}
		}



	}

	ns.tprint(`MONEY THRESHOLD REACHED`)
	ns.tprint(`Took $${moneyMade}`)

}