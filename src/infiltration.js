// Automated infiltration
//
// alias inf="home ; run infiltration.js --status"
// alias infon="home ; run infiltration.js --start"
// alias infoff="home ; run infiltration.js --stop" 


const state = {
    // Name of the company that's infiltrated.
    company: "",
    // Whether infiltration started. False means, we're
    // waiting to arrive on the infiltration screen.
    started: false,
    // Details/state of the current mini game.
    // Is reset after every game.
    game: {},
};
// Speed of game actions, in milliseconds.
const speed = 22;
// Small hack to save RAM.
// This will work smoothly, because the script does not use
// any "ns" functions, it's a pure browser automation tool.
const wnd = eval("window");
const doc = wnd["document"];
// List of all games and an automated solver.
const infiltrationGames = [
    {
        name: "type it backward",
        init: function (screen) {
            const lines = getLines(getEl(screen, "p"));
            state.game.data = lines[0].split("");
        },
        play: function (screen) {
            if (!state.game.data || !state.game.data.length) {
                delete state.game.data;
                return;
            }
            pressKey(state.game.data.shift());
        },
    },
    {
        name: "enter the code",
        init: function (screen) { },
        play: function (screen) {
            const h4 = getEl(screen, "h4");
            const code = h4[1].textContent;
            switch (code) {
                case "↑":
                    pressKey("w");
                    break;
                case "↓":
                    pressKey("s");
                    break;
                case "←":
                    pressKey("a");
                    break;
                case "→":
                    pressKey("d");
                    break;
            }
        },
    },
    {
        name: "close the brackets",
        init: function (screen) {
            const data = getLines(getEl(screen, "p"));
            const brackets = data.join("").split("");
            state.game.data = [];
            for (let i = brackets.length - 1; i >= 0; i--) {
                const char = brackets[i];
                if ("<" == char) {
                    state.game.data.push(">");
                }
                else if ("(" == char) {
                    state.game.data.push(")");
                }
                else if ("{" == char) {
                    state.game.data.push("}");
                }
                else if ("[" == char) {
                    state.game.data.push("]");
                }
            }
        },
        play: function (screen) {
            if (!state.game.data || !state.game.data.length) {
                delete state.game.data;
                return;
            }
            pressKey(state.game.data.shift());
        },
    },
    {
        name: "slash when his guard is down",
        init: function (screen) {
            state.game.data = "wait";
        },
        play: function (screen) {
            const data = getLines(getEl(screen, "h4"));
            if ("attack" === state.game.data) {
                pressKey(" ");
                state.game.data = "done";
            }
            // Attack in next frame - instant attack sometimes
            // ends in failure.
            if ('wait' === state.game.data && -1 !== data.indexOf("ATTACKING!")) {
                state.game.data = "attack";
            }
        },
    },
    {
        name: "say something nice about the guard",
        init: function (screen) { },
        play: function (screen) {
            const correct = [
                "affectionate",
                "agreeable",
                "bright",
                "charming",
                "creative",
                "determined",
                "energetic",
                "friendly",
                "funny",
                "generous",
                "polite",
                "likable",
                "diplomatic",
                "helpful",
                "giving",
                "kind",
                "hardworking",
                "patient",
                "dynamic",
                "loyal",
                "based",
            ];
            const word = getLines(getEl(screen, "h5"))[1];
            if (-1 !== correct.indexOf(word)) {
                pressKey(" ");
            }
            else {
                pressKey("w");
            }
        },
    },
    {
        name: "remember all the mines",
        init: function (screen) {
            const rows = getEl(screen, "p");
            let gridSize = null;
            switch (rows.length) {
                case 9:
                    gridSize = [3, 3];
                    break;
                case 12:
                    gridSize = [3, 4];
                    break;
                case 16:
                    gridSize = [4, 4];
                    break;
                case 20:
                    gridSize = [4, 5];
                    break;
                case 25:
                    gridSize = [5, 5];
                    break;
                case 30:
                    gridSize = [5, 6];
                    break;
                case 36:
                    gridSize = [6, 6];
                    break;
            }
            if (gridSize == null) {
                return;
            }
            //12 20 30 42
            state.game.data = [];
            let index = 0;
            //for each row
            for (let y = 0; y < gridSize[1]; y++) {
                //initialize array data
                state.game.data[y] = [];
                for (let x = 0; x < gridSize[0]; x++) {
                    //for each column in the row add to state data if it has a child
                    if (rows[index].children.length > 0) {
                        state.game.data[y].push(true);
                    }
                    else
                        state.game.data[y].push(false);
                    index += 1;
                }
            }
        },
        play: function (screen) { },
    },
    {
        name: "mark all the mines",
        init: function (screen) {
            state.game.x = 0;
            state.game.y = 0;
            state.game.cols = state.game.data[0].length;
            state.game.dir = 1;
        },
        play: function (screen) {
            let { data, x, y, cols, dir } = state.game;
            if (data[y][x]) {
                pressKey(" ");
                data[y][x] = false;
            }
            x += dir;
            if (x < 0 || x >= cols) {
                x = Math.max(0, Math.min(cols - 1, x));
                y++;
                dir *= -1;
                pressKey("s");
            }
            else {
                pressKey(dir > 0 ? "d" : "a");
            }
            state.game.data = data;
            state.game.x = x;
            state.game.y = y;
            state.game.dir = dir;
        },
    },
    {
        name: "match the symbols",
        init: function (screen) {
            const data = getLines(getEl(screen, "h5 span"));
            const rows = getLines(getEl(screen, "p"));
            const keypad = [];
            const targets = [];
            let gridSize = null;
            switch (rows.length) {
                case 9:
                    gridSize = [3, 3];
                    break;
                case 12:
                    gridSize = [3, 4];
                    break;
                case 16:
                    gridSize = [4, 4];
                    break;
                case 20:
                    gridSize = [4, 5];
                    break;
                case 25:
                    gridSize = [5, 5];
                    break;
                case 30:
                    gridSize = [5, 6];
                    break;
                case 36:
                    gridSize = [6, 6];
                    break;
            }
            if (gridSize == null) {
                return;
            }
            //build the keypad grid.
            let index = 0;
            for (let i = 0; i < gridSize[1]; i++) {
                keypad[i] = [];
                for (let y = 0; y < gridSize[0]; y++) {
                    keypad[i].push(rows[index]);
                    index += 1;
                }
            }
            //foreach data get coords of keypad entry
            for (let i = 0; i < data.length; i++) {
                const symbol = data[i].trim();
                //for each keypad entry
                for (let j = 0; j < keypad.length; j++) {
                    const k = keypad[j].indexOf(symbol);
                    if (-1 !== k) {
                        targets.push([j, k]);
                        break;
                    }
                }
            }
            state.game.data = targets;
            state.game.x = 0;
            state.game.y = 0;
        },
        play: function (screen) {
            const target = state.game.data[0];
            let { x, y } = state.game;
            if (!target) {
                return;
            }
            const to_y = target[0];
            const to_x = target[1];
            if (to_y < y) {
                y--;
                pressKey("w");
            }
            else if (to_y > y) {
                y++;
                pressKey("s");
            }
            else if (to_x < x) {
                x--;
                pressKey("a");
            }
            else if (to_x > x) {
                x++;
                pressKey("d");
            }
            else {
                pressKey(" ");
                state.game.data.shift();
            }
            state.game.x = x;
            state.game.y = y;
        },
    },
    {
        name: "cut the wires with the following properties",
        init: function (screen) {
            let numberHack = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
            const colors = {
                red: "red",
                white: "white",
                blue: "blue",
                "rgb(255, 193, 7)": "yellow",
            };
            const wireColor = {
                red: [],
                white: [],
                blue: [],
                yellow: [],
            };
            //gather the instructions
            var instructions = [];
            for (let child of screen.children)
                instructions.push(child);
            var wiresData = instructions.pop();
            instructions.shift();
            instructions = getLines(instructions);
            //get the wire information
            const samples = getEl(wiresData, "p");
            const wires = [];
            //get the amount of wires
            let wireCount = 0;
            for (let i = wireCount; i < samples.length; i++) {
                if (numberHack.includes(samples[i].innerText))
                    wireCount += 1;
                else
                    break;
            }
            let index = 0;
            //get just the first 3 rows of wires.
            for (let i = 0; i < 3; i++) {
                //for each row
                for (let j = 0; j < wireCount; j++) {
                    const node = samples[index];
                    const color = colors[node.style.color];
                    if (!color) {
                        index += 1;
                        continue;
                    }
                    wireColor[color].push(j + 1);
                    index += 1;
                }
            }
            for (let i = 0; i < instructions.length; i++) {
                const line = instructions[i].trim().toLowerCase();
                if (!line || line.length < 10) {
                    continue;
                }
                if (-1 !== line.indexOf("cut wires number")) {
                    const parts = line.split(/(number\s*|\.)/);
                    wires.push(parseInt(parts[2]));
                }
                if (-1 !== line.indexOf("cut all wires colored")) {
                    const parts = line.split(/(colored\s*|\.)/);
                    const color = parts[2];
                    if (!wireColor[color]) {
                        // should never happen.
                        continue;
                    }
                    wireColor[color].forEach((num) => wires.push(num));
                }
            }
            // new Set() removes duplicate elements.
            state.game.data = [...new Set(wires)];
        },
        play: function (screen) {
            const wire = state.game.data;
            //state.game.data.shift();
            if (!wire) {
                return;
            }
            for (let i = 0; i < wire.length; i++) {
                pressKey(wire[i].toString());
            }
        },
    },
];
/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([
        ["start", false],
        ["stop", false],
        ["status", false],
        ["quiet", false],
    ]);
    function print(msg) {
        if (!args.quiet) {
            ns.tprint(`\n${msg}\n`);
        }
    }
    if (args.status) {
        if (wnd.tmrAutoInf) {
            print("Automated infiltration is active");
        }
        else {
            print("Automated infiltration is inactive");
        }
        return;
    }
    if (wnd.tmrAutoInf) {
        print("Stopping automated infiltration...");
        clearInterval(wnd.tmrAutoInf);
        delete wnd.tmrAutoInf;
    }
    if (args.stop) {
        return;
    }
    print("Automated infiltration is enabled...\nVWhen you visit the infiltration screen of any company, all tasks are completed automatically.");
    endInfiltration();
    // Monitor the current screen and start infiltration once a
    // valid screen is detected.
    wnd.tmrAutoInf = setInterval(infLoop, speed);
    // Modify the addEventListener logic.
    wrapEventListeners();
}
/**
 * The infiltration loop, which is called at a rapid interval
 */
function infLoop() {
    if (!state.started) {
        waitForStart();
    }
    else {
        playGame();
    }
}
/**
 * Returns a list of DOM elements from the main game
 * container.
 */
function getEl(parent, selector) {
    let prefix = ":scope";
    if ("string" === typeof parent) {
        selector = parent;
        parent = doc;
        prefix = ".MuiBox-root>.MuiBox-root>.MuiBox-root";
        if (!doc.querySelectorAll(prefix).length) {
            prefix = ".MuiBox-root>.MuiBox-root>.MuiGrid-root";
        }
        if (!doc.querySelectorAll(prefix).length) {
            prefix = ".MuiContainer-root>.MuiPaper-root";
        }
        if (!doc.querySelectorAll(prefix).length) {
            return [];
        }
    }
    selector = selector.split(",");
    selector = selector.map((item) => `${prefix} ${item}`);
    selector = selector.join(",");
    return parent.querySelectorAll(selector);
}
/**
 * Returns the first element with matching text content.
 */
function filterByText(elements, text) {
    text = text.toLowerCase();
    for (let i = 0; i < elements.length; i++) {
        const content = elements[i].textContent.toLowerCase();
        if (-1 !== content.indexOf(text)) {
            return elements[i];
        }
    }
    return null;
}
/**
 * Returns an array with the text-contents of the given elements.
 *
 * @param {NodeList} elements
 * @returns {string[]}
 */
function getLines(elements) {
    const lines = [];
    elements.forEach((el) => lines.push(el.textContent));
    return lines;
}
/**
 * Reset the state after infiltration is done.
 */
function endInfiltration() {
    unwrapEventListeners();
    state.company = "";
    state.started = false;
}
/**
 * Simulate a keyboard event (keydown + keyup).
 *
 * @param {string|int} keyOrCode A single letter (string) or key-code to send.
 */
function pressKey(keyOrCode) {
    let keyCode = 0;
    let key = "";
    if ("string" === typeof keyOrCode && keyOrCode.length > 0) {
        key = keyOrCode.toLowerCase().substr(0, 1);
        keyCode = key.charCodeAt(0);
    }
    else if ("number" === typeof keyOrCode) {
        keyCode = keyOrCode;
        key = String.fromCharCode(keyCode);
    }
    if (!keyCode || key.length !== 1) {
        return;
    }
    function sendEvent(event) {
        const keyboardEvent = new KeyboardEvent(event, {
            key,
            keyCode,
        });
        doc.dispatchEvent(keyboardEvent);
    }
    sendEvent("keydown");
}
/**
 * Infiltration monitor to start automatic infiltration.
 *
 * This function runs asynchronously, after the "main" function ended,
 * so we cannot use any "ns" function here!
 */
function waitForStart() {
    if (state.started) {
        return;
    }
    const h4 = getEl("h4");
    if (!h4.length) {
        return;
    }
    const title = h4[0].textContent;
    if (0 !== title.indexOf("Infiltrating")) {
        return;
    }
    const btnStart = filterByText(getEl("button"), "Start");
    if (!btnStart) {
        return;
    }
    state.company = title.substr(13);
    state.started = true;
    wrapEventListeners();
    ns.tprint("Start automatic infiltration of", state.company);
    btnStart.click();
}
/**
 * Identify the current infiltration game.
 */
function playGame() {
    const screens = doc.querySelectorAll(".MuiContainer-root");
    if (!screens.length) {
        endInfiltration();
        return;
    }
    if (screens[0].children.length < 3) {
        return;
    }
    const screen = screens[0].children[2];
    const h4 = getEl(screen, "h4");
    if (!h4.length) {
        endInfiltration();
        return;
    }
    const title = h4[0].textContent.trim().toLowerCase().split(/[!.(]/)[0];
    if ("infiltration successful" === title) {
        endInfiltration();
        return;
    }
    if ("get ready" === title) {
        return;
    }
    const game = infiltrationGames.find((game) => game.name === title);
    if (game) {
        if (state.game.current !== title) {
            state.game.current = title;
            game.init(screen);
        }
        game.play(screen);
    }
    else {
        console.error("Unknown game:", title);
    }
}
/**
 * Wrap all event listeners with a custom function that injects
 * the "isTrusted" flag.
 *
 * Is this cheating? Or is it real hacking? Don't care, as long
 * as it's working :)
 */
function wrapEventListeners() {
    if (!doc._addEventListener) {
        doc._addEventListener = doc.addEventListener;
        doc.addEventListener = function (type, callback, options) {
            if ("undefined" === typeof options) {
                options = false;
            }
            let handler = false;
            // For this script, we only want to modify "keydown" events.
            if ("keydown" === type) {
                handler = function (...args) {
                    if (!args[0].isTrusted) {
                        const hackedEv = {};
                        for (const key in args[0]) {
                            if ("isTrusted" === key) {
                                hackedEv.isTrusted = true;
                            }
                            else if ("function" === typeof args[0][key]) {
                                hackedEv[key] = args[0][key].bind(args[0]);
                            }
                            else {
                                hackedEv[key] = args[0][key];
                            }
                        }
                        args[0] = hackedEv;
                    }
                    return callback.apply(callback, args);
                };
                for (const prop in callback) {
                    if ("function" === typeof callback[prop]) {
                        handler[prop] = callback[prop].bind(callback);
                    }
                    else {
                        handler[prop] = callback[prop];
                    }
                }
            }
            if (!this.eventListeners) {
                this.eventListeners = {};
            }
            if (!this.eventListeners[type]) {
                this.eventListeners[type] = [];
            }
            this.eventListeners[type].push({
                listener: callback,
                useCapture: options,
                wrapped: handler,
            });
            return this._addEventListener(type, handler ? handler : callback, options);
        };
    }
    if (!doc._removeEventListener) {
        doc._removeEventListener = doc.removeEventListener;
        doc.removeEventListener = function (type, callback, options) {
            if ("undefined" === typeof options) {
                options = false;
            }
            if (!this.eventListeners) {
                this.eventListeners = {};
            }
            if (!this.eventListeners[type]) {
                this.eventListeners[type] = [];
            }
            for (let i = 0; i < this.eventListeners[type].length; i++) {
                if (this.eventListeners[type][i].listener === callback &&
                    this.eventListeners[type][i].useCapture === options) {
                    if (this.eventListeners[type][i].wrapped) {
                        callback = this.eventListeners[type][i].wrapped;
                    }
                    this.eventListeners[type].splice(i, 1);
                    break;
                }
            }
            if (this.eventListeners[type].length == 0) {
                delete this.eventListeners[type];
            }
            return this._removeEventListener(type, callback, options);
        };
    }
}
/**
 * Revert the "wrapEventListeners" changes.
 */
function unwrapEventListeners() {
    if (doc._addEventListener) {
        doc.addEventListener = doc._addEventListener;
        delete doc._addEventListener;
    }
    if (doc._removeEventListener) {
        doc.removeEventListener = doc._removeEventListener;
        delete doc._removeEventListener;
    }
    delete doc.eventListeners;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5pZmlsdHJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbImluaWZpbHRyYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxLQUFLLEdBQUc7SUFDYiwwQ0FBMEM7SUFDMUMsT0FBTyxFQUFFLEVBQUU7SUFFWCxtREFBbUQ7SUFDbkQsZ0RBQWdEO0lBQ2hELE9BQU8sRUFBRSxLQUFLO0lBRWQsMENBQTBDO0lBQzFDLDZCQUE2QjtJQUM3QixJQUFJLEVBQUUsRUFBRTtDQUNSLENBQUM7QUFFRiwwQ0FBMEM7QUFDMUMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBRWpCLDBCQUEwQjtBQUMxQiwyREFBMkQ7QUFDM0QsMkRBQTJEO0FBQzNELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMzQixNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7QUFFNUIsNkNBQTZDO0FBQzdDLE1BQU0saUJBQWlCLEdBQUc7SUFDekI7UUFDQyxJQUFJLEVBQUUsa0JBQWtCO1FBQ3hCLElBQUksRUFBRSxVQUFVLE1BQU07WUFDckIsTUFBTSxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMzQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFDRCxJQUFJLEVBQUUsVUFBVSxNQUFNO1lBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDaEQsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdkIsT0FBTzthQUNQ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