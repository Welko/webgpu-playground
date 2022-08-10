SAMPLES.Triangle = class extends Sample {
    init() {
        this._shaders = {
            Triangle: `
                
            `
        }

        this.animate();
        setTimeout(() => this.stop(), 2000);
    }
    draw() {
        //console.log("Drawing")
    }
    reload(shaderName, shaderCode) {
        super.reload(shaderName, shaderCode);
    }
    shaders() {
        return this._shaders;
    }
}