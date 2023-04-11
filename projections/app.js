"use strict";
var canvas;
var gl;
var vertices = [];
var faces = [];
var numPositions  = 36;
var positions = [];
var colors = [];
var state;
var axis;
var theta = [0, 0, 0];
var scale = [1, 1, 1];
var translate = [0, 0, 0];
var deltaS = 0.1;
var deltaR = 1.0;
var deltaT = 1.0;
var transformationID;
var thetaLoc;
var program;
var cBuffer;
var vBuffer;
var positionLoc;
var u_xformMatrix;
var key;
var height = 1.0;
var radius = 2.0;
var cameraTheta = 0.0;
var eye;
var fovy = 90;
var aspect;
var near = 1.0
var far = 40.0
const at = vec3(0, 0, 0);
const up = vec3(0, 1, 0);
var modelViewMatrix;
var projectionMatrix;
var modelviewLoc;
var projectionLoc;



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    deltaR = 1.0;
    colorObject();

    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var Sx = 1.0, Sy = 1.0, Sz = 1.0;
    var xformMatrix = new Float32Array([
       Sx,   0.0,  0.0,  0.0,
       0.0,  Sy,   0.0,  0.0,
       0.0,  0.0,  Sz,   0.0,
       0.0,  0.0,  0.0,  1.0  
    ]);
    var u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);


    positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    aspect = canvas.width/canvas.height;

    modelViewMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);

    projectionMatrix = new Float32Array([
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0,
    ]);
   
    modelviewLoc = gl.getUniformLocation(program, "uModelView");
    projectionLoc = gl.getUniformLocation(program, "uProjection");


    console.log(modelViewMatrix);
    console.log(projectionMatrix);

    
    render();
}
function loadFileAJAX(name) {
    var xhr = new XMLHttpRequest(),
    okStatus = document.location.protocol === "file:" ? 0 : 200;
    xhr.open('GET', name, false);
    xhr.send(null);
    return xhr.status == okStatus ? xhr.responseText : null;
};


function processSMF(fname){
    var smf_file = loadFileAJAX(fname); 
    var lines = smf_file.split('\n');
    for(var line = 0; line < lines.length; line++){
    var strings = lines[line].split(' ');
        switch(strings[0]){
            case('v'):
            var one = parseFloat(strings[1]);
            var two = parseFloat(strings[2]);
            var three = parseFloat(strings[3]);
            var four = 1.0;
            var value = vec4(one, two, three, four);
            vertices.push(value);
            case('f'):
            var fone = parseFloat(strings[1]);
            var ftwo = parseFloat(strings[2]);
            var fthree = parseFloat(strings[3]);
            var ffour = 1.0;
            var fvalue = vec4(fone, ftwo, fthree, ffour);
            if (strings[0]=='f'){
                 faces.push(fvalue);
            }            
        }
    } 
}

function colorObject()
{
    processSMF('bunny.smf');
    console.log(vertices);
    console.log(faces);
    for ( var i = 0; i < faces.length; ++i ) { 
        quad(faces[i][0]-1, faces[i][1]-1, faces[i][2]-1)
    }
    normalColoring(positions);
}

function normalColoring(){
    for (var i = 0; i < (positions.length); i += 3) {
        // Get the coordinates of the three vertices of the triangle
        var v1 = vec3(positions[i][0], positions[i][1], positions[i][2]);
        var v2 = vec3(positions[i+1][0], positions[i+1][1], positions[i+1][2]);
        var v3 = vec3(positions[i+2][0], positions[i+2][1], positions[i+2][2]);
    
        // Calculate the surface normal of the triangle
        var normal = cross(subtract(v2, v1), subtract(v3, v1));
        console.log(normal);
        normal = normalize(normal);
        console.log("hi");
        
    
        // Set the color of the triangle based on the surface normal
        colors.push(vec4(Math.abs((normal[0])), Math.abs((normal[1])), Math.abs((normal[2])), 1.0));
        colors.push(vec4(Math.abs((normal[0])), Math.abs((normal[1])), Math.abs((normal[2])), 1.0));
        colors.push(vec4(Math.abs((normal[0])), Math.abs((normal[1])), Math.abs((normal[2])), 1.0));
    }
}

function quad(a, b, c)
{
    console.log(a, b, c);


    var indices = [a, b, c];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
    }
    
    
    
}


function render()
{
    console.log(positions);
    console.log(colors);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius * Math.sin(cameraTheta), height, radius * Math.cos(cameraTheta));
    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv( modelviewLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionLoc, false, flatten(projectionMatrix) );
    gl.drawArrays(gl.TRIANGLES, 0, (faces.length * 3));
}







function rotateFunction(ax, operation){
    axis = ax;
    if (operation){
        theta[axis] += 5.0;
    }
    else{
        theta[axis] -= 5.0;
    }
    gl.uniform3fv(thetaLoc, theta);
    requestAnimationFrame(render);
}


function stateFunction(){
    transformationID = document.getElementById('transformation');
    state = transformationID.options[transformationID.selectedIndex].text;
    if (state=="perspective"){
        height = 1.0;
        radius = 2.0;
        cameraTheta = 270.0;
        theta = [0, 0, 0];
        gl.uniform3fv(thetaLoc, theta);
        render();
        document.onkeydown = function (e) {
            key = e.key;
            console.log(e);
            if (key == 'r'){
                radius += 0.5;
                render()
            }
            else if (key == 'R'){
                radius -= 0.5;
                if (radius >= 1.0){
                    render();
                }
                else{
                    radius = 1.0;
                }
                
            }
            else if (key == 'h'){
                height += 0.5;
                render()
            }
            else if (key == 'H'){
                height -= 0.5;
                render();
            }
            else if (key == 'ArrowLeft'){
                rotateFunction(1, false);
            }
            else if (key == 'ArrowRight'){
                rotateFunction(1, true);
            }
            else if (key == 'Escape'){
                window.location.reload();
            }
            else{
                cancelAnimationFrame(render);
            }
        }
        
    }
    else if (state=="parallel"){
        height = 0.5;
        radius = 2.0;
        cameraTheta = 0.0;
        theta = [0, 0, 0];
        gl.uniform3fv(thetaLoc, theta);
        render();
        document.onkeydown = function (e) {
            key = e.key;
            console.log(e);
            if (key == 'ArrowLeft'){
                rotateFunction(1, false);
            }
            else if (key == 'ArrowRight'){
                rotateFunction(1, true);
            }
            else if (key == 'ArrowUp'){
                rotateFunction(0, false);
            }
            else if (key == 'ArrowDown'){
                rotateFunction(0, true);
            }
            else if (key == 'Escape'){
                window.location.reload();
            }
            else{
                cancelAnimationFrame(render);
            }
        }
        
    }
}

