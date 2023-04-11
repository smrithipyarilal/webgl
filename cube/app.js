"use strict";
var canvas;
var gl;
var numPositions  = 36;
var positions = [];
var colors = [];
var state;
var axis;
var theta = [0, 0, 0];
var scale = [1, 1, 1];
var translate = [0, 0, 0];
var deltaS = 0.1;
var deltaR = 0.1;
var deltaT = 1.0;
var transformationID;
var thetaLoc;
var program;
var cBuffer;
var vBuffer;
var positionLoc;
var u_xformMatrix;
var key;



window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    deltaT = 0.1;
    deltaS = 0.1;
    deltaR = 1.0;
    colorCube();

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

    render();
}

function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),
        vec4(0.5,  0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];

    var vertexColors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(1.0, 1.0, 1.0, 1.0),   // white
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        
        
    ];

    // We need to partition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push( vertices[indices[i]] );
        colors.push( vertexColors[indices[i]] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    // if (rotate){
    //     theta[axis] += 2.0;
    //     gl.uniform3fv(thetaLoc, theta);
    //     requestAnimationFrame(render);
    // }
    // requestAnimationFrame(render);
}

function scaleFunction(axis, operation){

    if (operation){
        scale[axis] += deltaS;
    }
    else{
        scale[axis] -= deltaS;
    }
    
    var Sx = scale[0], Sy = scale[1], Sz = scale[2];
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
}

function translateFunction(axis, operation){
    if (operation){
        translate[axis] += deltaT;
    }
    else{
        translate[axis] -= deltaT;
    }

    var Dx = translate[0], Dy = translate[1], Dz = translate[2];
    var translation = gl.getUniformLocation(program, 'translation');
    gl.uniform4f(translation, Dx, Dy, Dz, 0.0);

    positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

}

function rotateFunction(ax, operation){
    axis = ax;
    if (operation){
        theta[axis] += deltaR;
    }
    else{
        theta[axis] -= deltaR;
    }
    gl.uniform3fv(thetaLoc, theta);
    requestAnimationFrame(render);
}


function stateFunction(){
    transformationID = document.getElementById('transformation');
    state = transformationID.options[transformationID.selectedIndex].text;
    if (state=="scale"){
        document.onkeydown = function (e) {
            key = e.key;
            console.log(e);

            if (key == 'p'){
                deltaS += 0.1;
            }
            else if (key == 'q'){
                deltaS -= 0.1;
            }
            else if (key == 'a'){
                scaleFunction(0, true);
            }
            else if (key == 'b'){
                scaleFunction(0, false);
            }
            else if (key == 'c'){
                scaleFunction(1, true);
            }
            else if (key == 'd'){
                scaleFunction(1, false);
            }
            else if (key == 'e'){
                scaleFunction(2, true);
            }
            else if (key == 'f'){
                scaleFunction(2, false);
            }
            else if (key == 'r'){
                window.location.reload();
            }
            else{
                alert("invalid key");
            }
            render();
          };
    }
    else if (state=="rotate"){
        document.onkeydown = function (e) {
            key = e.key;
            console.log(e);
            if (key == 'p'){
                deltaR += 0.5;
            }
            else if (key == 'q'){
                deltaR -= 0.5;
            }
            else if (key == 'a'){
                rotateFunction(0, true);
            }
            else if (key == 'b'){
                rotateFunction(0, false);
            }
            else if (key == 'c'){
                rotateFunction(1, true);
            }
            else if (key == 'd'){
                rotateFunction(1, false);
            }
            else if (key == 'e'){
                rotateFunction(2, true);
            }
            else if (key == 'f'){
                rotateFunction(2, false);
            }
            else if (key == 'r'){
                window.location.reload();
            }
            else{
                cancelAnimationFrame(render);
            }
        }
        
    }
    else if (state=="translate"){
        document.onkeydown = function (e) {
            key = e.key;
            console.log(e);
            if (key == 'p'){
                deltaT += 0.1;
            }
            else if (key == 'q'){
                deltaT -= 0.1;
            }
            else if (key == 'a'){
                translateFunction(0, true);
            }
            else if (key == 'b'){
                translateFunction(0, false);
            }
            else if (key == 'c'){
                translateFunction(1, true);
            }
            else if (key == 'd'){
                translateFunction(1, false);
            }
            else if (key == 'e'){
                translateFunction(2, true);
            }
            else if (key == 'f'){
                translateFunction(2, false);
            }
            else if (key == 'r'){
                window.location.reload();
            }
            else{
                alert("invalid key");
            }
            render();
        }
    }
    

}

