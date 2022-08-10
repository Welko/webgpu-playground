# RTVis WebGPU Playground

Serverless playground to implement WebGPU samples.

Online version: [welko.github.io/webgpu-playground](https://welko.github.io/webgpu-playground/)

## Tutorial to create your own sample
1) Create a new file under the /samples directory (it can be anywhere though)
2) Add this file as a \<script> in index.html (look for \<!-- Samples go here! -->)
3) Now back to your new file, choose a unique name for your sample like "SomeCoolName" and register the sample by writing: SAMPLES.SomeCoolName = class extends Sample { ... }
4) Check the base class Sample at the end of the file main.js to see what functions you can use and override. Overriding the constructor is not recommended. The comments there should help
5) Check the existing samples under the /samples directory for nice ways to do things
6) If you wish to create a GUI for your sample in [nanogui](https://github.com/wjakob/nanogui) fashion, you can! Have a look at gui/gui.js for the elements that are implemented. Create a window with `const window = new GUI.Window(...)` and add it to the workspace with `this.gui.add(window)`. this.gui is a GUI.Workspace
7) Enjoy