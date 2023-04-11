var canvas = document.getElementById("myCanvas");
var gl = canvas.getContext("webgl");

// Clear the canvas
gl.viewport( 0, -75, canvas.width, canvas.height);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Concentric squares
var concentricArray = [];
for (var i = 6; i > 0; i--) {
    size = i/10
    concentricArray.push([
        -size, size, 0.0,
        -size, -size, 0.0,
        size, -size, 0.0,              
        size, size, 0.0]);
}

for (var i = 0; i<concentricArray.length; i++){
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(concentricArray[i]), gl.STATIC_DRAW);

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, 
        "attribute vec3 aPosition; void main() { gl_Position = vec4(aPosition, 1.0); }");
    gl.compileShader(vertexShader);

    var fragmentShader;
    if (i % 2 === 0) {
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, "void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); }");
    } else {
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, "void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }");
    }
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    var aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    // Draw the current square
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

//Ellipse
gl.viewport( -150, 175, canvas.width, canvas.height);
var vertices = [];
var numSegments = 360;
for (var i = 0; i <= numSegments; i++) {
    var angle = 2 * Math.PI * i / numSegments;
    vertices.push(Math.cos(angle) * 0.25, Math.sin(angle) * 0.15, 0);
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// Create the vertex shader
var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, 
    "attribute vec3 aPosition; void main() { gl_Position = vec4(aPosition, 1.0); }");
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, "void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }");
gl.compileShader(fragmentShader);

// Create the program and attach the shaders
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Get the location of the vertex position attribute
var aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

// Draw the ellipse
gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1);



















// Circle
// Create vertex buffer and fill it with position of each vertex
gl.viewport( 150, 175, canvas.width, canvas.height);
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

var vertices = [];
var numVertices = 100;
for (var i = 0; i < numVertices; i++) {
    var angle = i / numVertices * 2 * Math.PI;
    var x = Math.cos(angle)/4;
    var y = Math.sin(angle)/4;
    vertices.push(x, y);
}
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, 
    "attribute vec4 aPosition; varying vec2 v_texCoord; void main() {gl_Position = aPosition; v_texCoord = aPosition.xy * 0.5 + 0.5; }");
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, "precision mediump float; varying vec2 v_texCoord; uniform vec4 u_color; void main() { float d = length(v_texCoord); float color = smoothstep(0.5, 1.0, d); vec3 finalColor = mix(vec3(0,0,0), vec3(1,0,0), color); gl_FragColor = vec4(finalColor, 1);} ");
gl.compileShader(fragmentShader);

// Create the program and attach the shaders
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// enable the a_position attribute
var aPosition = gl.getAttribLocation(program, "aPosition");
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// Draw the circle
gl.drawArrays(gl.TRIANGLE_FAN, 0, numVertices);






//Triangle
gl.viewport( 0, 125, canvas.width, canvas.height);
var vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

var vertices = [
    0.0, 0.5, 1.0, 0.0, 0.0, 1.0,
    -0.3, 0.0, 0.0, 1.0, 0.0, 1.0,
    0.3, 0.0, 0.0, 0.0, 1.0, 1.0,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, 
    "attribute vec4 aPosition; attribute vec4 a_color; varying vec4 v_color; void main() { gl_Position = aPosition; v_color = a_color;}");
gl.compileShader(vertexShader);

var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, 
    "precision mediump float; varying vec4 v_color; void main() { gl_FragColor = v_color;} ");
gl.compileShader(fragmentShader);

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);
// enable the a_position and a_color attributes
var aPosition = gl.getAttribLocation(program, "aPosition");
var colorLocation = gl.getAttribLocation(program, "a_color");
gl.enableVertexAttribArray(aPosition);
gl.enableVertexAttribArray(colorLocation);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 24, 0);
gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 24, 8);

// Draw the triangle
gl.drawArrays(gl.TRIANGLES, 0, 3);




