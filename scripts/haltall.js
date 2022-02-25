/** @param {NS} ns **/
export async function main(ns) {
    var scriptToKill = 'general1.js'
    if (ns.args.length > 1 && ns.args[0]) {
        scriptToKill = ns.args[0]
    }

    var servers = ['home', 'leviathan', 'reaper']

    servers.forEach(async (s) => {
        if (ns.scriptRunning(scriptToKill, s)) {
            await ns.scriptKill(scriptToKill, s)
        }
    })
}
