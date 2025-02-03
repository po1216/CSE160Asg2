class Pyramid {
    constructor() {
        this.type = "pyramid";
        this.color = [1.0, 0.0, 0.0, 1.0];
        this.matrix = new Matrix4();

        this.buffer = null;
    }

    drawPyramid(color) {
        if(this.buffer === null) {
            this.buffer = gl.createBuffer();
            if(!this.buffer) {
                console.log("Failed to create the buffer object");
                return -1;
            }
        }
        var rgba = color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of the pyramid
        drawTriangle3D( [ 0.0,0.0,0.0,  0.5,1.0,0.5,    1.0,0.0,0.0], this.buffer);

        // Bottom of the pyramid
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3D( [0.0,0.0,0.0,   1.0,0.0,1.0,    1.0,0.0,0.0], this.buffer);
        drawTriangle3D( [0.0,0.0,0.0,   0.0,0.0,1.0,    1.0,0.0,1.0], this.buffer);

        // Back of the pyramid
        drawTriangle3D( [ 0.5,1.0,0.5,  0.0,0.0,1.0,    1.0,0.0,1.0], this.buffer);

        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);
        // Left side of the pyramid
        drawTriangle3D( [ 0.0,0.0,0.0,  0.0,0.0,1.0,    0.5,1.0,0.5], this.buffer);

        // Right side of the pyramid
        drawTriangle3D( [ 1.0,0.0,0.0,  0.5,1.0,0.5,    1.0,0.0,1.0], this.buffer);
    }

    drawPyramidInverse(color) {
        if(this.buffer === null) {
            this.buffer = gl.createBuffer();
            if(!this.buffer) {
                console.log("Failed to create the buffer object");
                return -1;
            }
        }
        var rgba = color;

        // Pass the color of a point to u_FragColor uniform variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of the pyramid
        drawTriangle3D( [ 0.0,1.0,0.0,  0.5,0.0,0.5,    1.0,1.0,0.0], this.buffer);

        // Bottom of the pyramid
        gl.uniform4f(u_FragColor, rgba[0] * 0.5, rgba[1] * 0.5, rgba[2] * 0.5, rgba[3]);
        drawTriangle3D( [0.0,1.0,0.0,   1.0,1.0,1.0,    1.0,1.0,0.0], this.buffer);
        drawTriangle3D( [0.0,1.0,0.0,   0.0,1.0,1.0,    1.0,1.0,1.0], this.buffer);

        // Back of the pyramid
        drawTriangle3D( [ 0.5,0.0,0.5,  0.0,1.0,1.0,    1.0,1.0,1.0], this.buffer);

        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);
        // Left side of the pyramid
        drawTriangle3D( [ 0.0,1.0,0.0,  0.0,1.0,1.0,    0.5,0.0,0.5], this.buffer);

        // Right side of the pyramid
        drawTriangle3D( [ 1.0,1.0,0.0,  0.5,0.0,0.5,    1.0,1.0,1.0], this.buffer);

    }
}