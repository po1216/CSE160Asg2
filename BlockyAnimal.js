// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation* u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotation;

function setUpWebGL() {
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Enable depth test
  gl.enable(gl.DEPTH_TEST);
}

function connectVarsToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotation
  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  if (!u_GlobalRotation) {
    console.log('Failed to get the storage location of u_GlobalRotation');
    return;
  }

  // Set an initial value for this matrix to identity
  let identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;
const LINE = 3;

// Global variables related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedType = POINT;
let g_selectedSeg = 10;
let g_selectedLength = 30;
let g_animalGlobalRotationX = 50;
let g_animalGlobalRotationY = 0;
let g_breathingAnimation = true;
let g_walkingAnimation = g_tailAnimation = false;
let g_rightArmAnimation = g_leftArmAnimation = g_rightLegAnimation = g_leftLegAnimation = false;
let g_rightArm1Angle = g_leftArm1Angle = 180;
let g_rightArm2Angle = g_leftArm2Angle = 10;
let g_rightFFeetAngle = g_leftFFeetAngle = g_rightFeetAngle = g_leftFeetAngle = 60;
let g_rightLegAngle = g_leftLegAngle = 160; 
let g_bodyPos = 0;
let g_headPos = 0;
let g_tailAngle = 0;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
  // Clear canvas button
  // document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderScene(); };

  // Camera angle slider event
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_animalGlobalRotationX = parseInt(this.value); renderScene(); });
  document.getElementById('resetAngleButton').onclick = function() { 
    g_animalGlobalRotationX = g_animalGlobalRotationY = 0; 
    document.getElementById('angleSlide').value = 0;
  };

  // Animation button
  document.getElementById('freezeButton').onclick = function() { g_breathingAnimation = g_walkingAnimation = g_tailAnimation = g_rightArmAnimation = g_leftArmAnimation = g_rightLegAnimation = g_leftLegAnimation = false; };
  document.getElementById('breatheButton').onclick = function() { g_breathingAnimation = true; };
  document.getElementById('walkButton').onclick = function() { g_breathingAnimation = g_walkingAnimation = true; };

  // Right arm
  document.getElementById('rightArmOnButton').onclick = function() { g_rightArmAnimation = true; };
  document.getElementById('rightArmOffButton').onclick = function() { g_rightArmAnimation = false; };
  document.getElementById('rightArm1Slide').addEventListener('mousemove', function() { g_rightArm1Angle = this.value; renderScene(); });
  document.getElementById('rightArm2Slide').addEventListener('mousemove', function() { g_rightArm2Angle = this.value; renderScene(); });
  document.getElementById('rightFrontFeetSlide').addEventListener('mousemove', function() { g_rightFFeetAngle = this.value; renderScene(); });

  // Left arm
  document.getElementById('leftArmOnButton').onclick = function() { g_leftArmAnimation = true; };
  document.getElementById('leftArmOffButton').onclick = function() { g_leftArmAnimation = false; };
  document.getElementById('leftArm1Slide').addEventListener('mousemove', function() { g_leftArm1Angle = this.value; renderScene(); });
  document.getElementById('leftArm2Slide').addEventListener('mousemove', function() { g_leftArm2Angle = this.value; renderScene(); });
  document.getElementById('leftFrontFeetSlide').addEventListener('mousemove', function() { g_leftFFeetAngle = this.value; renderScene(); });

  // Right leg
  document.getElementById('rightLegOnButton').onclick = function() { g_rightLegAnimation = true; };
  document.getElementById('rightLegOffButton').onclick = function() { g_rightLegAnimation = false; };
  document.getElementById('rightLegSlide').addEventListener('mousemove', function() { g_rightLegAngle = this.value; renderScene(); });
  document.getElementById('rightBackFeetSlide').addEventListener('mousemove', function() { g_rightFeetAngle = this.value; renderScene(); });

  // Left leg
  document.getElementById('leftLegOnButton').onclick = function() { g_leftLegAnimation = true; };
  document.getElementById('leftLegOffButton').onclick = function() { g_leftLegAnimation = false; };
  document.getElementById('leftLegSlide').addEventListener('mousemove', function() { g_leftLegAngle = this.value; renderScene(); });
  document.getElementById('leftBackFeetSlide').addEventListener('mousemove', function() { g_leftFeetAngle = this.value; renderScene(); });

  document.getElementById('resetPosition').onclick = function() { 
    g_rightArm1Angle = g_leftArm1Angle = 180;
    document.getElementById('rightArm1Slide').value = 180;
    document.getElementById('leftArm1Slide').value = 180;
    g_rightArm2Angle = g_leftArm2Angle = 10;
    document.getElementById('rightArm2Slide').value = 10;
    document.getElementById('leftArm2Slide').value = 10;
    g_rightFFeetAngle = g_leftFFeetAngle = g_rightFeetAngle = g_leftFeetAngle = 60;
    document.getElementById('rightFrontFeetSlide').value = 60;
    document.getElementById('leftFrontFeetSlide').value = 60;
    document.getElementById('rightBackFeetSlide').value = 60;
    document.getElementById('leftBackFeetSlide').value = 60;
    g_rightLegAngle = g_leftLegAngle = 160; 
    document.getElementById('rightLegSlide').value = 160;
    document.getElementById('leftLegSlide').value = 160;

  };

  // Shift + click event
  document.getElementById('webgl').addEventListener('click', function (ev) {
    if(ev.shiftKey) {
      g_tailAnimation = !g_tailAnimation;
    }
  });
}

function main() {
  // Set up canvas and gl variables
  setUpWebGL();

  // Set up GLSL shader programs and connect GLSL variables
  connectVarsToGLSL();

  // Set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = rotateCamera;
  canvas.onmousemove = function(ev) { 
    if(ev.buttons == 1) { rotateCamera(ev)}
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.5, 0.75, 0.46, 1.0);

  // Clear <canvas>
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // renderScene();
  requestAnimationFrame(tick);

}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

// Called by the browser repeatedly whenever its time
function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0 - g_startTime;
  
  // Update animation angles
  updateAnimationAngles()

  // Draw everything
  renderScene();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

var g_shapesList = [];

function rotateCamera(ev) {
  // g_animalGlobalRotationX = 0;
  g_animalGlobalRotationX += ev.movementX;
  g_animalGlobalRotationY += ev.movementY;
  document.getElementById('angleSlide').value = g_animalGlobalRotationX;
}

function click(ev) {
  // Extract the event click and return it in WebGL coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  // Create and store the new point
  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
    point.segments = g_selectedSeg;
  }
  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  // Draw every shape that is supposed to be in the canvas
  renderScene();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return ([x,y]);
}

// Update the angles of everything if currently animated
function updateAnimationAngles() {
  if(g_breathingAnimation) {
    g_bodyPos = g_headPos = (0.016 * Math.sin(1.5 * g_seconds));
  }

  if(g_walkingAnimation) {
    g_rightArm1Angle = (45 * Math.sin(2 * g_seconds) + 170);
    g_leftArm1Angle = (45 * Math.sin(2 * g_seconds + 10) + 170);
    g_rightLegAngle = (30 * Math.sin(2 * g_seconds + 10) - 200);
    g_leftLegAngle = (30 * Math.sin(2 * g_seconds) - 200);
  }

  if(g_rightArmAnimation) {
    g_rightArm1Angle = (45 * Math.sin(g_seconds) + 170);
  }

  if(g_leftArmAnimation) {
    g_leftArm1Angle = (45 * Math.sin(g_seconds + 10) + 170);
  }

  if(g_rightLegAnimation) {
    g_rightLegAngle = (30 * Math.sin(g_seconds + 10) - 200);
  }

  if(g_leftLegAnimation) {
    g_leftLegAngle = (30 * Math.sin(g_seconds) - 200);
  }

  if(g_tailAnimation) {
    g_tailAngle = (20 * Math.sin(8 * g_seconds));
    g_headPos = (0.014 * Math.sin(5 * g_seconds));
  } else {
    g_tailAngle = 0;
    if(g_breathingAnimation) {
      g_headPos = (0.016 * Math.sin(1.5 * g_seconds));
    } else {
      g_headPos = 0;
    }
  }
}

// Draw every shape that is supposed to be in the canvas
function renderScene() {
  // Check the time at the start of this function
  var startTime = performance.now();

  // Pass the matrix to u_GlobalRotation
  var globalRotMat = new Matrix4().rotate(g_animalGlobalRotationX, 0, 1, 0).rotate(g_animalGlobalRotationY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotation, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Right iris
  var rightIris = new Cube();
  rightIris.matrix.translate(0.466, 0.32 + g_headPos, 0.13);
  rightIris.matrix.scale(0.07, 0.05, 0.04);
  rightIris.drawCube(rightIris.matrix, [0.0, 0.0, 0.0, 1.0]);

  // Left iris
  var leftIris = new Cube();
  leftIris.matrix.translate(0.466, 0.32 + g_headPos, 0.29);
  leftIris.matrix.scale(0.07, 0.05, 0.04);
  leftIris.drawCube(leftIris.matrix, [0.0, 0.0, 0.0, 1.0]);

  // Right eye
  var rightEye = new Cube();
  rightEye.matrix.translate(0.465, 0.32 + g_headPos, 0.12); // 0.32
  rightEye.matrix.scale(0.07, 0.07, 0.05);
  rightEye.drawCube(rightEye.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Left eye
  var leftEye = new Cube();
  leftEye.matrix.translate(0.465, 0.32 + g_headPos, 0.28); // 0.32
  leftEye.matrix.scale(0.07, 0.07, 0.05);
  leftEye.drawCube(leftEye.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Forehead band
  var forehead = new Cube();
  forehead.matrix.translate(0.26, 0.182 + g_headPos, 0.21);
  forehead.matrix.scale(0.28, 0.29, 0.04);
  forehead.drawCube(forehead.matrix, [0.9, 0.9, 0.9, 1.0]);

  // Head
  var head = new Cube();
  head.matrix.translate(0.25, 0.17 + g_headPos, 0.06); // 0.17
  head.matrix.scale(0.28, 0.30, 0.33);
  head.drawCube(head.matrix, [0.25, 0.25, 0.25, 1.0]);

  // Right ear
  var rightEar = new Pyramid();
  rightEar.matrix.translate(0.26, 0.45 + g_headPos, 0.06); // 0.45
  rightEar.matrix.scale(0.15, 0.23, 0.17);
  rightEar.drawPyramid([0.2, 0.2, 0.2, 1.0]);

  // Left ear
  var leftEar = new Pyramid();
  leftEar.matrix.translate(0.26, 0.45 + g_headPos, 0.21); // 0.45
  leftEar.matrix.scale(0.15, 0.23, 0.17);
  leftEar.drawPyramid([0.2, 0.2, 0.2, 1.0]);

  // Nose
  var nose = new Cube();
  nose.matrix.translate(0.63, 0.23 + g_headPos, 0.19); // 0.23
  nose.matrix.scale(0.07, 0.07, 0.07);
  nose.drawCube(nose.matrix, [0.1, 0.1, 0.1, 1.0]);

  // Fang
  var fang = new Cube();
  fang.matrix.translate(0.45, 0.18 + g_headPos, 0.125); 
  fang.matrix.scale(0.2, 0.15, 0.20);
  fang.drawCube(fang.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Tongue
  var tongue = new Cube();
  tongue.matrix.setTranslate(0.6, 0.1, 0.17);
  tongue.matrix.rotate(45, 0, 0, 1);
  tongue.matrix.scale(0.05, 0.15, 0.1);
  tongue.drawCube(tongue.matrix, [0.94, 0.60, 0.65, 1.0]);

  // Right shoulder
  var rightShoudler = new Cube();
  rightShoudler.matrix.rotate(7, 0, 0, 1);
  rightShoudler.matrix.translate(0, g_bodyPos - 0.2, 0.04);
  rightShoudler.matrix.scale(0.3, 0.4, 0.18);
  rightShoudler.drawCube(rightShoudler.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Left shoulder
  var leftShoulder = new Cube();
  leftShoulder.matrix.rotate(7, 0, 0, 1);
  leftShoulder.matrix.translate(0, g_bodyPos - 0.2, 0.23);
  leftShoulder.matrix.scale(0.3, 0.4, 0.18);
  leftShoulder.drawCube(leftShoulder.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Neck
  var neck = new Cube();
  neck.matrix.rotate(-5, 0, 0, 1);
  neck.matrix.translate(0.2, 0.22 + g_bodyPos, 0.07);
  neck.matrix.scale(0.2, 0.2, 0.3);
  neck.drawCube(neck.matrix, [0.25, 0.25, 0.25, 1.0]);

  // Right arm1
  var rightArm1 = new Cube();
  rightArm1.matrix.setTranslate(0.25, -0.07, 0.06);
  rightArm1.matrix.rotate(g_rightArm1Angle, 0, 0, 1);
  var rightArm1Coordinates = new Matrix4(rightArm1.matrix);
  rightArm1.matrix.scale(0.12, 0.30, 0.13);
  rightArm1.drawCube(rightArm1.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Right arm2
  var rightArm2 = new Cube();
  // rightArm2.matrix = rightArm1.matrix;
  rightArm2.matrix.setTranslate(0.01, 0, 0);
  rightArm2.matrix = rightArm1Coordinates;
  rightArm2.matrix.translate(0, 0.25, 0.01);
  rightArm2.matrix.rotate(g_rightArm2Angle, 0, 0, 1);
  var rightArm2Coordinates = new Matrix4(rightArm2.matrix);
  rightArm2.matrix.scale(0.12, 0.17, 0.12);
  rightArm2.drawCube(rightArm2.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Right front feet
  var rightFrontFeet = new Cube();
  rightFrontFeet.matrix = rightArm2Coordinates;
  //rightFrontFeet.matrix.translate(0.1, 0, 0);
  rightFrontFeet.matrix.translate(0.05, 0.15, 0.01);
  rightFrontFeet.matrix.rotate(g_rightFFeetAngle, 0, 0, 1);
  rightFrontFeet.matrix.scale(0.06, 0.13, 0.10);
  rightFrontFeet.drawCube(rightFrontFeet.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left arm1
  var leftArm1 = new Cube();
  leftArm1.matrix.setTranslate(0.25, -0.07, 0.26);
  leftArm1.matrix.rotate(g_leftArm1Angle, 0, 0, 1);
  var leftArm1Coordinates = new Matrix4(leftArm1.matrix);
  leftArm1.matrix.scale(0.12, 0.30, 0.13);
  leftArm1.drawCube(leftArm1.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left arm2
  var leftArm2 = new Cube();
  leftArm2.matrix.setTranslate(0.01, 0, 0);
  leftArm2.matrix = leftArm1Coordinates;
  leftArm2.matrix.translate(0, 0.25, 0.01);
  leftArm2.matrix.rotate(g_leftArm2Angle, 0, 0, 1);
  var leftArm2Coordinates = new Matrix4(leftArm2.matrix);
  leftArm2.matrix.scale(0.12, 0.17, 0.12);
  leftArm2.drawCube(leftArm2.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left front feet
  var leftFrontFeet = new Cube();
  leftFrontFeet.matrix = leftArm2Coordinates;
  leftFrontFeet.matrix.translate(0.05, 0.15, 0.01);
  leftFrontFeet.matrix.rotate(g_leftFFeetAngle, 0, 0, 1);
  leftFrontFeet.matrix.scale(0.06, 0.13, 0.10);
  leftFrontFeet.drawCube(leftFrontFeet.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Right leg1
  var rightLeg1 = new Cube();
  rightLeg1.matrix.setTranslate(-0.35, -0.07, 0.06);
  rightLeg1.matrix.rotate(g_rightLegAngle, 0, 0, 1);
  var rightLeg1Coordinates = new Matrix4(rightLeg1.matrix);
  rightLeg1.matrix.scale(0.15, 0.30, 0.13);
  rightLeg1.drawCube(rightLeg1.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Right leg2
  var rightLeg2 = new Cube();
  rightLeg2.matrix.setTranslate(0.01, 0, 0);
  rightLeg2.matrix = rightLeg1Coordinates;
  rightLeg2.matrix.translate(0.02, 0.25, 0.01);
  rightLeg2.matrix.rotate(25, 0, 0, 1);
  var rightLeg2Coordinates = new Matrix4(rightLeg2.matrix);
  rightLeg2.matrix.scale(0.12, 0.2, 0.12);
  rightLeg2.drawCube(rightLeg2.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Right back feet
  var rightBackFeet = new Cube();
  rightBackFeet.matrix = rightLeg2Coordinates;
  //rightFrontFeet.matrix.translate(0.1, 0, 0);
  rightBackFeet.matrix.translate(0.06, 0.15, 0.01);
  rightBackFeet.matrix.rotate(g_rightFeetAngle, 0, 0, 1);
  rightBackFeet.matrix.scale(0.08, 0.15, 0.10);
  rightBackFeet.drawCube(rightBackFeet.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left leg1
  var leftLeg1 = new Cube();
  leftLeg1.matrix.setTranslate(-0.35, -0.07, 0.26);
  leftLeg1.matrix.rotate(g_leftLegAngle, 0, 0, 1);
  var leftLeg1Coordinates = new Matrix4(leftLeg1.matrix);
  leftLeg1.matrix.scale(0.15, 0.30, 0.13);
  leftLeg1.drawCube(leftLeg1.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left leg2
  var leftLeg2 = new Cube();
  leftLeg2.matrix.setTranslate(0.01, 0, 0);
  leftLeg2.matrix = leftLeg1Coordinates;
  leftLeg2.matrix.translate(0.02, 0.25, 0.01);
  leftLeg2.matrix.rotate(25, 0, 0, 1);
  var leftLeg2Coordinates = new Matrix4(leftLeg2.matrix);
  leftLeg2.matrix.scale(0.12, 0.2, 0.12);
  leftLeg2.drawCube(leftLeg2.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Left back feet
  var leftBackFeet = new Cube();
  leftBackFeet.matrix = leftLeg2Coordinates;
  //rightFrontFeet.matrix.translate(0.1, 0, 0);
  leftBackFeet.matrix.translate(0.06, 0.15, 0.01);
  leftBackFeet.matrix.rotate(g_leftFeetAngle, 0, 0, 1);
  leftBackFeet.matrix.scale(0.08, 0.15, 0.10);
  leftBackFeet.drawCube(leftBackFeet.matrix, [0.98, 0.98, 0.98, 1.0]);

  // Spot
  var spot = new Cube();
  spot.matrix.translate(-0.35, g_bodyPos + 0.01, 0.04);
  spot.matrix.scale(0.3, 0.2, 0.35);
  spot.drawCube(spot.matrix, [0.2, 0.2, 0.2, 1.0]);

  // Body
  var body = new Cube();
  body.matrix.translate(-0.5, g_bodyPos - 0.2, 0.05);
  body.matrix.scale(0.6, 0.4, 0.35);
  body.drawCube(body.matrix, [1.0, 1.0, 1.0, 1.0]);

  // Tail
  var tail = new Pyramid();
  tail.matrix.setTranslate(-0.55, 0.05, 0.15);
  tail.matrix.rotate(25, 0, 0, 1);
  tail.matrix.rotate(g_tailAngle, 1, 0, 0);
  tail.matrix.scale(0.17, 0.4, 0.12);
  tail.drawPyramidInverse([1.0, 1.0, 1.0, 1.0]);

  // Check the time at the end of the function, and show on the web page
  var duration = performance.now() - startTime;
  sendTextToHTML("ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "performance");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML.");
    return;
  }
  htmlElm.innerHTML = text;
}