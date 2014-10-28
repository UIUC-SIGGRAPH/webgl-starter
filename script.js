/* Code adapted from http://learningwebgl.com/blog/?p=28. */
"use strict"; // This generates additional warnings for the code

/* Global variables used to store the vertex information.
 * Generally, global variables are BAD, but this is just
 * an example. */
var vertexBuffer;

// Hardcoded (x,y,z) coordinates for each point of the triangle.
var vertices = [
     0.0,  1.0, 0.0,
    -1.0, -1.0, 0.0,
     1.0, -1.0, 0.0
];

var gl; // Our reference to the WebGL context

/* The model view and perspective matrix. The model view matrix
 * defines transformations (move, rotate, scale) that should be done
 * to vertices drawn in the scene. The perspective matrix defines
 * the distortions necessary to add perspective to the scene. */
var modelViewMatrix = mat4.create();
var perspectiveMatrix = mat4.create();

function initGL(canvas)
{
    // Uncomment this line and comment out the line below it to enable debug mode.
    //gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl"), undefined, validateNoneOfTheArgsAreUndefined);
    gl = canvas.getContext("webgl");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    if (!gl) 
    {
        alert("WebGL failed to initialize.");
    }
}

// Function used for debug mode. Taken from https://www.khronos.org/webgl/wiki/Debugging#Interactive_Debugging_of_WebGL_applications.
function validateNoneOfTheArgsAreUndefined(functionName, args) 
{
    for (var ii = 0; ii < args.length; ++ii) 
    {
        if (args[ii] === undefined) 
        {
            console.error("undefined passed to gl." + functionName + "(" +
                    WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
        }
    }
} 

// Gets a shader from an HTML element with the given ID.
function getShader(gl, id)
{
    // Find the HMTL tag
    var shaderScript = document.getElementById(id);
    if (!shaderScript) 
    {
        return null;
    }

    // Get the text inside of the HTML tag
    var str = shaderScript.innerHTML;

    // Initialize the corresponding shader (fragment or vertex).
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") 
    {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } 
    else if (shaderScript.type == "x-shader/x-vertex") 
    {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } 
    else 
    {
        return null;
    }

    // Compile the shader code (yes, this is done at runtime).
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    // Make sure it compiled correctly.
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

/* The shader program we'll use. This defines how to draw
 * the vertices and pixels in the scene. */
var shaderProgram;

function initShaders()
{
    /* The fragment shader performs processing on the pixels
     * generated based on the geometry of the scene.*/
    var fragmentShader = getShader(gl, "shader-fs");
    /* The vertex shader performs processing on the vertices
     * in the scene before they're drawn. */
    var vertexShader = getShader(gl, "shader-vs");
   
    shaderProgram = gl.createProgram();
    // Attach the shaders to the program.
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    // Tell WebGL we want to use this shader for our app
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) 
    {
        alert("Could not initialize shaders.");
    }
    gl.useProgram(shaderProgram);
    
    // Get some attributes from the vertex shader.
    shaderProgram.vertexPosition = gl.getAttribLocation( 
            shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPosition);
    shaderProgram.perspectiveMatrix = gl.getUniformLocation(
            shaderProgram, "perspectiveMatrix");
    shaderProgram.modelViewMatrix = gl.getUniformLocation(
            shaderProgram, "modelViewMatrix");
}

function initBuffers()
{
    // Set up the triangle buffer.
    vertexBuffer = gl.createBuffer();
    /* Set the triangle vertex buffer as the active buffer.
     * This means later operations will act on this buffer.*/
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Allocate the buffer data onto the graphics card
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    // Add some properties about our vertex array to use later.
    vertexBuffer.itemSize = 3;
    vertexBuffer.numItems = 3;
}

// This sets the matrices used in the vertex shader to the ones in the Javascript.
function setMatrixUniforms() 
{
    gl.uniformMatrix4fv(shaderProgram.perspectiveMatrix, false, 
            perspectiveMatrix);
    gl.uniformMatrix4fv(shaderProgram.modelViewMatrix, false,   
            modelViewMatrix);
}

function drawScene()
{
    // Tells WebGL the size of our canvas.
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    /* We clear the canvas before drawing to it. This is
     * so we don't leave pixels from the last frame on 
     * the screen. */
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set up the perspective matrix. 
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1,
            100.0, perspectiveMatrix);
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, [0.0, 0.0, -7.0]);
    // Set the attributes of the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPosition,
            vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numItems);
}

function webGLStart()
{
    // First, we need to get the canvas. We use its ID attribute.
    var canvas = document.getElementById("gl-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();
    
    // Set the background color
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    
    drawScene();
}