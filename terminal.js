const consoleInput = document.getElementById("consoleInput");
const consoleOutput = document.getElementById("consoleOutput");
const runButton = document.getElementById("runCode");
const clearButton = document.getElementById("clearConsole");
const terminalStatus = document.getElementById("terminalStatus");
const autocompleteMenu =
    document.getElementById("autocompleteMenu");

let autocompleteRequest = 0;
let autocompleteSelection = 0;
let autocompleteResults = [];
let autocompleteRange = null;
let autocompleteTimer = null;

const commandHistory = [];
let historyPosition = 0;
let requestNumber = 0;

const pendingRequests = new Map();

/*
 * The sandbox intentionally excludes allow-same-origin.
 * Code can execute, but it cannot access the parent page,
 * site cookies, localStorage, or sessionStorage.
 */
const sandbox = document.createElement("iframe");

sandbox.hidden = true;
sandbox.sandbox = "allow-scripts";

sandbox.srcdoc = `
<!DOCTYPE html>
<html>
<body>
<script>
    const originalConsole = {
        log: console.log.bind(console),
        info: console.info.bind(console),
        warn: console.warn.bind(console),
        error: console.error.bind(console)
    };

    let activeRequest = null;

    function formatValue(value) {
        if (value === undefined) {
            return "undefined";
        }

        if (value === null) {
            return "null";
        }

        if (typeof value === "string") {
            return value;
        }

        if (
            typeof value === "function" ||
            typeof value === "symbol" ||
            typeof value === "bigint"
        ) {
            return String(value);
        }

        if (value instanceof Error) {
            return value.stack || value.message;
        }

        try {
            const seen = new WeakSet();

            return JSON.stringify(
                value,
                (key, nestedValue) => {
                    if (
                        typeof nestedValue === "object" &&
                        nestedValue !== null
                    ) {
                        if (seen.has(nestedValue)) {
                            return "[Circular]";
                        }

                        seen.add(nestedValue);
                    }

                    if (typeof nestedValue === "function") {
                        return String(nestedValue);
                    }

                    if (typeof nestedValue === "bigint") {
                        return nestedValue + "n";
                    }

                    return nestedValue;
                },
                2
            );
        } catch {
            return String(value);
        }
    }

    function send(type, values, requestId = activeRequest) {
        parent.postMessage({
            source: "localhost-js-console",
            requestId,
            type,
            values: values.map(formatValue)
        }, "*");
    }

    console.log = (...values) => {
        originalConsole.log(...values);
        send("log", values);
    };

    console.info = (...values) => {
        originalConsole.info(...values);
        send("info", values);
    };

    console.warn = (...values) => {
        originalConsole.warn(...values);
        send("warn", values);
    };

    console.error = (...values) => {
        originalConsole.error(...values);
        send("error", values);
    };

    window.addEventListener("error", (event) => {
        send("error", [
            event.error || event.message
        ]);
    });

    window.addEventListener(
        "unhandledrejection",
        (event) => {
            send("error", [
                event.reason || "Unhandled promise rejection"
            ]);
        }
    );

    window.addEventListener("message", async (event) => {
        if (event.source !== parent) {
            return;
        }

        const message = event.data;

        if (
            !message ||
            message.source !== "localhost-js-console-parent"
        ) {
            return;
        }

        if (message.type === "autocomplete") {
    const codeBeforeCursor = message.code.slice(
        0,
        message.cursor
    );

    const keywords = [
        "async",
        "await",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "function",
        "if",
        "import",
        "in",
        "instanceof",
        "let",
        "new",
        "null",
        "of",
        "return",
        "static",
        "super",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "undefined",
        "var",
        "void",
        "while",
        "with",
        "yield"
    ];

    let suggestions = [];
    let partial = "";
    let replacementStart = message.cursor;

    const propertyMatch = codeBeforeCursor.match(
        /([A-Za-z_$][\\w$]*(?:\\.[A-Za-z_$][\\w$]*)*)\\.([A-Za-z_$][\\w$]*)?$/
    );

    if (propertyMatch) {
        const objectExpression = propertyMatch[1];
        partial = propertyMatch[2] || "";

        replacementStart =
            message.cursor - partial.length;

        try {
            const object = (0, eval)(objectExpression);
            const propertyNames = new Set();

            let currentObject = object;
            let prototypeDepth = 0;

            while (
                currentObject != null &&
                prototypeDepth < 6
            ) {
                Object.getOwnPropertyNames(
                    currentObject
                ).forEach(name => {
                    propertyNames.add(name);
                });

                currentObject =
                    Object.getPrototypeOf(currentObject);

                prototypeDepth += 1;
            }

            suggestions = [...propertyNames];
        } catch {
            suggestions = [];
        }
    } else {
        const wordMatch = codeBeforeCursor.match(
            /[A-Za-z_$][\\w$]*$/
        );

        partial = wordMatch ? wordMatch[0] : "";
        replacementStart =
            message.cursor - partial.length;

        suggestions = [
            ...Object.getOwnPropertyNames(globalThis),
            ...keywords
        ];
    }

    const normalizedPartial = partial.toLowerCase();

    suggestions = [...new Set(suggestions)]
        .filter(name => {
            if (!normalizedPartial) {
                return false;
            }

            return (
                name.toLowerCase().startsWith(
                    normalizedPartial
                ) &&
                name !== partial
            );
        })
        .sort((a, b) => {
            const aExactCase = a.startsWith(partial);
            const bExactCase = b.startsWith(partial);

            if (aExactCase !== bExactCase) {
                return aExactCase ? -1 : 1;
            }

            return a.localeCompare(b);
        })
        .slice(0, 30);

    parent.postMessage({
    source: "localhost-js-console",
    type: "autocomplete-results",
    requestId: message.requestId,
    suggestions,
    replacementStart,
    replacementEnd: message.cursor
}, "*");

return;
}

if (message.type !== "execute") {
    return;
}

activeRequest = message.requestId;

        try {
            /*
             * Global indirect eval acts more like a browser console.
             * Expressions return their value, while statements run
             * normally.
             */
            let result = (0, eval)(message.code);

            if (
                result &&
                typeof result.then === "function"
            ) {
                result = await result;
            }

            if (result !== undefined) {
                send("result", [result], message.requestId);
            }

            parent.postMessage({
                source: "localhost-js-console",
                requestId: message.requestId,
                type: "complete"
            }, "*");
        } catch (error) {
            send(
                "error",
                [error],
                message.requestId
            );

            parent.postMessage({
                source: "localhost-js-console",
                requestId: message.requestId,
                type: "complete"
            }, "*");
        } finally {
            activeRequest = null;
        }
    });

    parent.postMessage({
        source: "localhost-js-console",
        type: "ready"
    }, "*");
<\/script>
</body>
</html>
`;

document.body.appendChild(sandbox);


function addConsoleLine(type, value, prefix = "") {
    const line = document.createElement("div");
    line.className = `console-line ${type}`;

    if (prefix) {
        const prefixElement = document.createElement("span");
        prefixElement.className = "console-prefix";
        prefixElement.textContent = prefix;

        line.appendChild(prefixElement);
    }

    const content = document.createElement("pre");
    content.textContent = value;

    line.appendChild(content);
    consoleOutput.appendChild(line);

    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function requestAutocomplete(force = false) {
    clearTimeout(autocompleteTimer);

    autocompleteTimer = setTimeout(() => {
        const cursor = consoleInput.selectionStart;
        const code = consoleInput.value;
        const beforeCursor = code.slice(0, cursor);

        const hasCompletableText =
            /[A-Za-z_$][\w$]*$/.test(beforeCursor) ||
            /\.[A-Za-z_$]*$/.test(beforeCursor);

        if (!force && !hasCompletableText) {
            hideAutocomplete();
            return;
        }

        const requestId = ++autocompleteRequest;

        sandbox.contentWindow.postMessage({
            source: "localhost-js-console-parent",
            type: "autocomplete",
            requestId,
            code,
            cursor
        }, "*");
    }, force ? 0 : 100);
}


function showAutocomplete(message) {
    autocompleteResults = message.suggestions || [];
    autocompleteSelection = 0;

    autocompleteRange = {
        start: message.replacementStart,
        end: message.replacementEnd
    };

    autocompleteMenu.replaceChildren();

    if (autocompleteResults.length === 0) {
        hideAutocomplete();
        return;
    }

    autocompleteResults.forEach((suggestion, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "autocomplete-option";
        button.setAttribute("role", "option");

        const name = document.createElement("span");
        name.className = "autocomplete-name";
        name.textContent = suggestion;

        const hint = document.createElement("span");
        hint.className = "autocomplete-hint";
        hint.textContent = index === 0 ? "Tab" : "";

        button.append(name, hint);

        button.addEventListener("mousedown", event => {
            event.preventDefault();
            acceptAutocomplete(index);
        });

        autocompleteMenu.appendChild(button);
    });

    autocompleteMenu.hidden = false;
    updateAutocompleteSelection();
}


function hideAutocomplete() {
    autocompleteMenu.hidden = true;
    autocompleteMenu.replaceChildren();

    autocompleteResults = [];
    autocompleteRange = null;
    autocompleteSelection = 0;
}


function updateAutocompleteSelection() {
    const options = autocompleteMenu.querySelectorAll(
        ".autocomplete-option"
    );

    options.forEach((option, index) => {
        const selected =
            index === autocompleteSelection;

        option.classList.toggle("selected", selected);
        option.setAttribute(
            "aria-selected",
            String(selected)
        );
    });

    options[autocompleteSelection]?.scrollIntoView({
        block: "nearest"
    });
}


function moveAutocompleteSelection(direction) {
    if (autocompleteResults.length === 0) {
        return;
    }

    autocompleteSelection =
        (
            autocompleteSelection +
            direction +
            autocompleteResults.length
        ) % autocompleteResults.length;

    updateAutocompleteSelection();
}


function acceptAutocomplete(index = autocompleteSelection) {
    const suggestion = autocompleteResults[index];

    if (!suggestion || !autocompleteRange) {
        return;
    }

    const code = consoleInput.value;

    consoleInput.value =
        code.slice(0, autocompleteRange.start) +
        suggestion +
        code.slice(autocompleteRange.end);

    const newCursor =
        autocompleteRange.start +
        suggestion.length;

    consoleInput.setSelectionRange(
        newCursor,
        newCursor
    );

    consoleInput.focus();
    hideAutocomplete();
}

consoleInput.addEventListener("input", () => {
    requestAutocomplete();
});

consoleInput.addEventListener("click", () => {
    hideAutocomplete();
});

consoleInput.addEventListener("blur", () => {
    setTimeout(hideAutocomplete, 150);
});

consoleInput.addEventListener(
    "keydown",
    event => {
        const autocompleteVisible =
            !autocompleteMenu.hidden &&
            autocompleteResults.length > 0;

        if (
            event.ctrlKey &&
            event.code === "Space"
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();

            requestAutocomplete(true);
            return;
        }

        if (!autocompleteVisible) {
            return;
        }

        if (event.key === "ArrowDown") {
            event.preventDefault();
            event.stopImmediatePropagation();

            moveAutocompleteSelection(1);
            return;
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();
            event.stopImmediatePropagation();

            moveAutocompleteSelection(-1);
            return;
        }

        if (
            event.key === "Tab" ||
            event.key === "Enter"
        ) {
            event.preventDefault();
            event.stopImmediatePropagation();

            acceptAutocomplete();
            return;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            event.stopImmediatePropagation();

            hideAutocomplete();
        }
    },
    true
);

function runCode() {
    const code = consoleInput.value.trim();

    if (!code || !sandbox.contentWindow) {
        return;
    }

    commandHistory.push(code);
    historyPosition = commandHistory.length;

    addConsoleLine("command", code, ">");

    const requestId = ++requestNumber;

    pendingRequests.set(requestId, true);

    terminalStatus.textContent = "Running...";
    terminalStatus.classList.add("running");

    sandbox.contentWindow.postMessage({
    source: "localhost-js-console-parent",
    type: "execute",
    requestId,
    code
}, "*");
}


window.addEventListener("message", (event) => {
    if (event.source !== sandbox.contentWindow) {
        return;
    }

    const message = event.data;

    if (
        !message ||
        message.source !== "localhost-js-console"
    ) {
        return;
    }

    if (message.type === "ready") {
        terminalStatus.textContent = "Ready";
        return;
    }

    if (message.type === "complete") {
        pendingRequests.delete(message.requestId);

        if (pendingRequests.size === 0) {
            terminalStatus.textContent = "Ready";
            terminalStatus.classList.remove("running");
        }

        return;
    }

    if (message.type === "autocomplete-results") {
        if (message.requestId === autocompleteRequest) {
            showAutocomplete(message);
        }

        return;
    }

    const outputType = {
        log: "log",
        info: "info",
        warn: "warn",
        error: "error",
        result: "result"
    }[message.type] || "log";

    const prefix = {
        log: "›",
        info: "ℹ",
        warn: "⚠",
        error: "×",
        result: "←"
    }[message.type] || "›";

    for (const value of message.values || []) {
        addConsoleLine(outputType, value, prefix);
    }
});


runButton.addEventListener("click", runCode);

clearButton.addEventListener("click", () => {
    consoleOutput.replaceChildren();

    addConsoleLine(
        "system",
        "Console cleared.",
        "●"
    );

    terminalStatus.textContent = "Ready";
});


consoleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.ctrlKey) {
        event.preventDefault();
        runCode();
        return;
    }

    if (
        event.key === "ArrowUp" &&
        !event.shiftKey &&
        consoleInput.selectionStart === 0
    ) {
        if (historyPosition > 0) {
            event.preventDefault();
            historyPosition -= 1;
            consoleInput.value =
                commandHistory[historyPosition];
        }

        return;
    }

    if (
        event.key === "ArrowDown" &&
        !event.shiftKey &&
        consoleInput.selectionStart ===
        consoleInput.value.length
    ) {
        if (
            historyPosition <
            commandHistory.length - 1
        ) {
            event.preventDefault();
            historyPosition += 1;
            consoleInput.value =
                commandHistory[historyPosition];
        } else if (
            historyPosition ===
            commandHistory.length - 1
        ) {
            event.preventDefault();
            historyPosition =
                commandHistory.length;
            consoleInput.value = "";
        }
    }
});