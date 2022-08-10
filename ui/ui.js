const UI = {}

UI.Element = class {
    constructor(node) {
        this.node = node;
        this.node.className = "Element";
        const style = this.style();
        if (style) {
            const styleNode = document.createElement("style");
            styleNode.innerHTML = style;
            document.head.appendChild(styleNode);
        }
    }
    style() {
        // Override me! Return a stylesheet string
    }
    addEventListener(event, listener) {
        this.node.addEventListener(event, listener);
    }
    toggleClass(className) {
        if (this.node.classList.contains(className)) this.node.classList.remove(className);
        else this.node.classList.add(className);
    }
    clear() {
        this.node.value = "";
        this.node.textContent = "";
    }
    dispose() {
        this.node.remove();
    }
}

UI.Button = class extends UI.Element {
    constructor(text, onClick) {
        super(document.createElement("button"));
        this.node.classList.add("Button");
        this.node.textContent = text;
        this.node.addEventListener("click", () => onClick());
    }
}

UI.Text = class extends UI.Element {
    constructor(text) {
        super(document.createElement("span"));
        this.node.classList.add("Text");
        this.node.textContent = text;
    }
    set text(text) {
        this.node.textContent = text;
    }
}

UI.Header = class extends UI.Text {
    constructor(text) {
        super(text);
        this.node.classList.add("Header");
    }
}

UI.TextArea = class extends UI.Element {
    constructor(text) {
        super(document.createElement("textarea"));
        this.node.classList.add("TextArea");
        if (text) this.node.value = text;
        this.node.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "Tab":
                    const start = this.node.selectionStart;
                    const end = this.node.selectionEnd;
                    const tab = "    ";
                    this.text = this.text.substring(0, start) + tab + this.text.substring(end);
                    this.node.selectionStart = start + tab.length;
                    this.node.selectionEnd = this.node.selectionStart;
                    break;
                default:
                    return;
            }
            event.preventDefault();
        })
    }
    set text(text) {
        this.node.value = text;
    }
    get text() {
        return this.node.value;
    }
    select(lineNum, startPos, length) {
        --lineNum;  // Line numbers start at 1 and our array starts at 0
        --startPos; // ...Same here
        //return this.text.split("\n")[lineNum].substring(startPos, startPos + length);

        let index = startPos;
        const lines = this.text.split("\n");
        for (let i = 0; i < lineNum; ++i) {
            const line = lines[i];
            index += (line.length + 1); // +1 to account for '\n'
        }

        this.node.selectionStart = index;
        this.node.selectionEnd = index + length;
        this.node.focus();
    }
}

UI.List = class extends UI.Element {
    constructor() {
        super(document.createElement("ul"));
        this.node.classList.add("List");
        this.items = [];
    }
    add(text, onClick) {
        const li = document.createElement("li");
        li.textContent = text;
        if (onClick) {
            li.addEventListener("click", onClick);
            li.className = "clickable";
        }
        this.items.push(li);
        this.node.appendChild(li);
    }
}

UI.ComboBox = class extends UI.Element {
    constructor(options, onChange, defaultOption) {
        super(document.createElement("select"));
        this.node.classList.add("ComboBox");

        // Set up options
        this._default = "-- choose an option --";
        const firstOptions = defaultOption ? [] : [this._default];
        for (const optionName of firstOptions.concat(options)) {
            const option = document.createElement("option");
            option.value = optionName;
            option.textContent = optionName;
            this.node.appendChild(option);
        }
        this.node.addEventListener("change", () => onChange(this.selected));
    }
    get selected() {
        return this.node.value === this._default ? null : this.node.value;
    }
}

UI.Separator = class extends UI.Element {
    constructor() {
        super(document.createElement("div"));
        this.node.classList.add("Separator");
    }
}

UI.Panel = class extends UI.Element {
    constructor(node) {
        super(node || document.createElement("div"));
        this.node.classList.add("Panel");
    }
    add(element) {
        this.node.appendChild(element.node);
    }
}

UI.Section = class extends UI.Panel {
    constructor(title) {
        super();
        this.node.classList.add("Section");
        this._header = new UI.Text(title);
        this._header.addEventListener("click", (event) => {
            if (event.button !== 2) return; // Only proceed for RIGHT mouse button
            this.toggleClass("collapsed")
        });
        this.add(this._header);
    }
}

UI.Window = class extends UI.Section {
    constructor(title) {
        super(title);
        this.node.classList.add("Window");

        let dragging = false;
        this._header.addEventListener("mousedown", () => dragging = true);
        this._header.addEventListener("mouseup", () => dragging = false);
        this._header.addEventListener("mousemove", (event) => {
            if (!dragging) return;
            const x = event.clientX;
            const y = event.clientY;
            // TODO
            console.log("Drag occurred on position " + x + ", " + y);
        });
    }
}

UI.Alert = class extends UI.Window {
    constructor(text, title) {
        super(title || "Alert");
        this.node.classList.add("Alert");

        const content = document.createElement("div");
        content.textContent = text + "\n\n" + "Click this window to close it";
        console.log(text);
        this.node.addEventListener("click", () => this.dispose());
        this.node.appendChild(content);
    }
}

UI.Workspace = class extends UI.Element {
    constructor(node) {
        super(node || document.createElement("div"));
        this.node.classList.add("Workspace");
    }
    alert(text, title) {
        this.node.appendChild(new UI.Alert(text, title).node);
    }
    add(window) {
        this.node.appendChild(window.node);
    }
}