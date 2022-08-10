{
    // Entry point here!
    window.addEventListener("load", () => {

        const ui = new UI.Workspace(document.getElementById("ui"));

        main(ui)
            //.then(() => console.log("Successfully initialized!"))
            .catch((reason) => {
                ui.alert(reason, "Error");
            });
    });

    async function main(ui) {
        // Declare variables that will be used throughout this function
        let activeSample = null;

        // Set up the canvas
        const viewport = document.getElementById("viewport");
        const canvas = new UI.Element(document.getElementById("webGpuCanvas"));

        // Initialize WebGPU
        const gpu = navigator.gpu;
        const adapter = gpu && await gpu.requestAdapter();
        const device = adapter && await adapter.requestDevice();
        const context = device && canvas.node.getContext("webgpu");
        if (!device) throw "WebGPU not supported. Try using the latest version of Google Chrome";

        // Define WebGPU configuration and set up reconfiguration on resize
        // This is called at the end of this function
        const configure = () => {
            const width = viewport.clientWidth;
            const height = viewport.clientHeight;
            canvas.node.width = width;
            canvas.node.height = height;
            activeSample.resize(width, height);
        };
        window.addEventListener("resize", () => configure());

        // Set up the shader editor
        const editor = new Editor(document.getElementById("editor"), device, (shaderName, shaderCode) => {
            activeSample.reload(shaderName, shaderCode);
        });

        // Just to be sure, check if all samples extend the Sample class
        const samples = Object.keys(SAMPLES).filter(name => {
            const valid = SAMPLES[name].prototype instanceof Sample;
            if (!valid) console.error("Could not accept sample '" + name + "' because it does not extend 'Sample'");
            return valid;
        });
        if (samples.length === 0) {
            throw "Could not find any samples\nThere may be more details about this in the console";
        } else if (samples.length !== Object.keys(SAMPLES).length) {
            ui.alert("Some samples could not be accepted\nCheck the console for more details");
        }

        // Add samples to UI
        {
            const activateSample = (sampleName) => {
                if (activeSample) activeSample.stop();
                ui.clear();
                activeSample = new SAMPLES[sampleName](ui, gpu, adapter, device, context);
                editor.shaders = activeSample.shaders();
            };
            const samplesSelect = document.getElementById("samples");
            for (const sampleName of samples) {
                const option = document.createElement("option");
                option.value = sampleName;
                option.textContent = sampleName;
                samplesSelect.appendChild(option);
            }
            samplesSelect.addEventListener("change", () => activateSample(samplesSelect.value));
            samplesSelect.value = samples[0];
            activateSample(samplesSelect.value);
        }

        // Add settings to UI
        {
            const settingsSelect = document.getElementById("settings");
            const settings = {};
            const addSetting = (name, onSelected) => {
                const option = document.createElement("option");
                option.value = name;
                option.textContent = name;
                settingsSelect.appendChild(option);
                settings[name] = onSelected;
            }
            settingsSelect.addEventListener("change", () => {
                settings[settingsSelect.value]()
                settingsSelect.value = firstOption;
            });
            const firstOption = "- select -";
            addSetting(firstOption, () => {});
            addSetting("Toggle UI", () => ui.node.style.display = ui.node.style.display === "none" ? "" : "none");
            addSetting("Toggle shader editor", () => { editor.node.style.display = editor.node.style.display === "none" ? "" : "none" })
        }

        // Configure :)
        configure()
    }
}

// Object mapping the sample name to the sample class
const SAMPLES = {};
class Sample {
    /**
     * @param ui The main workspace (useful to add customizable parameters through windows, similar to nanogui)
     * @param adapter WebGPU adapter
     * @param device WebGPU device
     * @param context WebGPU context of HTMLCanvasElement
     */
    constructor(ui, gpu, adapter, device, context) {
        this.ui = ui;
        this.gpu = gpu;
        this.adapter = adapter;
        this.device = device;
        this.context = context;
        this._animating = false;
        this.init();
    }

    // Override the following methods in subclasses --------------------------------------------------------------------

    /** Override me! */
    init() {}

    /** Override me! */
    draw() {}

    /** Override me! Return an object mapping shader names to their respective codes: { [name: string]: string } */
    shaders() {}

    /** Override me! Implement shader reloading */
    reload(shaderName, shaderCode) {}

    /**
     * Feel free to override me too! Or not... up to you
     * You don't even have to call super() if you don't want to :)
     * But if you decide not to, I really recommend that you still call context.configure
     */
    resize() {
        this.context.configure({
            device: this.device,
            format: this.gpu.getPreferredCanvasFormat(),
            alphaMode: "opaque"
        });
    }

    // Use the following methods in subclasses or elsewhere ------------------------------------------------------------
    get name() {
        return this.constructor.name;
    }
    animate() {
        if (this._animating) return;
        this._animating = true;

        const draw = () => {
            this.draw();

            // Unused for now TODO
            const now = performance.now();
            const deltaTime = now - lastFrame;
            //this._fps.textContent = (1000 / deltaTime).toFixed(3);
            console.log("Frame"); // TODO remove logging
            lastFrame = now;

            if (this._animating) requestAnimationFrame(draw);
        };

        let lastFrame = performance.now();
        requestAnimationFrame(draw);
    }
    stop() {
        this._animating = false;
    }
}