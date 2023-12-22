import { NS } from '@ns'

export async function ttabulate( ns: NS, 
    objects: Record<string, unknown>[], 
    keys = Object.keys(objects[0]||{})): Promise<void> {
        return tabulate(ns, objects, keys, true)
}

export async function tabulate( ns: NS, 
                                objects: Record<string, unknown>[], 
                                keys = Object.keys(objects[0]||{}),
                                terminal = false): Promise<void> {
	const columns: {[id: string] : number} = {}

	// Compute the required width of all columns
	for (const key of keys) {
		const lengths = objects.map(v => String(v[key]).length);
		columns[key] = Math.max(key.length, ...lengths) + 1;
	}

	let table = "\n";

	// Add header row and a vertical bar
	let header="|", vbar="+";
	for (const key in columns){
		header += key.padStart(columns[key]) + "|";
		vbar += "-".repeat(columns[key]) + "+";
	}
	table += header + "\n" + vbar + "\n";

	for (const obj of objects) {
		let row = "|";
		for (const key in columns)
			row += String(obj[key]).padStart(columns[key]) + "|";
		table += row + "\n";
	}

    if (terminal) {
        ns.tprint(table);
    } else {
        ns.print(table);
    }
}

