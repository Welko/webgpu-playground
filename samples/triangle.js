{
    const shader =
`struct Output {
    @builtin(position) Position : vec4<f32>,
    @location(0) vColor : vec4<f32>
};

@stage(vertex)
fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> Output {
    var pos = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 0.5),
        vec2<f32>(-0.5, -0.5),
        vec2<f32>(0.5, -0.5)
    );

    var color = array<vec3<f32>, 3>(
        vec3<f32>(1.0, 0.0, 0.0),
        vec3<f32>(0.0, 1.0, 0.0),
        vec3<f32>(0.0, 0.0, 1.0)
    );

    var output: Output;
    output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
    output.vColor = vec4<f32>(color[VertexIndex], 1.0);
    return output;
}

@stage(fragment)
fn fs_main(@location(0) vColor: vec4<f32>) -> @location(0) vec4<f32> {
    return vColor;
}`

    SAMPLES.Triangle = class extends Sample {
        init() {
            this._shaders = {
                Triangle: shader
            }
            this.reload("Triangle", shader);
            //this.animate();
            //setTimeout(() => this.stop(), 2000);

            const window = new GUI.Window("Settings");
            window.add(new GUI.Text("Hello world!\nInsert line breaks with \\n :)"));
            window.add(new GUI.Button("Click me!", () => this.gui.alert("Gotcha!")));
            const section = new GUI.Section("It's nice to organize things");
            section.add(new GUI.ComboBox(["Option 1", "Some other option", "Don't choose me", "Option 4"], (selected) => this.gui.alert("You chose \"" + selected + "\".\nGreat choice!")))
            const dontDoThis = new GUI.Element(document.createElement("div"));
            dontDoThis.node.textContent = "Going low level is not recommended";
            dontDoThis.node.style.textDecoration = "underline";
            dontDoThis.node.style.color = "red";
            section.add(dontDoThis);
            window.add(section);
            this.gui.add(window);

            const window2 = new GUI.Window("Second window");
            window2.add(new GUI.Text("Some shenanigans\nI don't know...\n\nClick this window's title\nbar to collapse"));
            this.gui.add(window2);
        }

        draw() {
            const commandEncoder = this.device.createCommandEncoder();
            const textureView = this.context.getCurrentTexture().createView();
            const renderPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: textureView,
                    clearValue: { r: 0, g: 0, b: 0, a: 1},
                    loadOp: "clear",
                    loadValue: { r: 0, g: 0, b: 0, a: 1},
                    storeOp: "store"
                }]
            });
            renderPass.setPipeline(this.pipeline);
            renderPass.draw(3, 1, 0, 0);
            renderPass.end();
            this.device.queue.submit([commandEncoder.finish()]);
        }

        shaders() {
            return this._shaders;
        }

        reload(shaderName, shaderCode) {
            if (shaderName !== "Triangle") return;
            this.pipeline = this.device.createRenderPipeline({
                layout: "auto",
                vertex: {
                    module: this.device.createShaderModule({
                        code: shaderCode
                    }),
                    entryPoint: "vs_main"
                },
                fragment: {
                    module: this.device.createShaderModule({
                        code: shaderCode
                    }),
                    entryPoint: "fs_main",
                    targets: [{
                        format: this.context.getPreferredFormat(this.adapter)
                    }]
                },
                primitive:{
                    topology: "triangle-list"
                }
            });
        }

        resize(width, height) {
            super.resize(width, height);
        }
    }
}