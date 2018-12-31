// EagleSoftworks
// 2018 - Diffusion Simulation Javascript

// Almost every line comes up as a warning until the 100 limit is met
// This expands that limit because it's annoying:
// jshint maxerr:150

// This sets the context of the canvas
const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Height and width are in html so js can access them
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

// Change the speed here to make the particles move faster/slower
var speed = 5;

// Draws a circle
function drawCircle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawRectangle(x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
}

// Draws a big red particle
function drawBigParticle(x, y) {
    // Linear gradient for style
    let redGradient = ctx.createLinearGradient(x-75, 0, x+100, 0);
    redGradient.addColorStop(0, "#9b0909");
    redGradient.addColorStop(0.5, "red");
    redGradient.addColorStop(1, "white");
    
    drawCircle(x, y, 50, redGradient);
}

// Draws a little particle
function drawLilParticle(x, y) {
    let darkGradient = ctx.createRadialGradient(x, y, 10, x, y, 2);
    darkGradient.addColorStop(0, "black");
    darkGradient.addColorStop(1, "green"); // inside color
    
    drawCircle(x, y, 15, darkGradient);
}

// Var to easily change wall thickness and keep wall centered
var wallWidth = 40;
var wallX = (canvasWidth - wallWidth) / 2;

function drawPort(x, y) {
    drawCircle((wallWidth/2) + x, 10 + y, wallWidth/2, "orange");
    drawRectangle(x, 10 + y, wallWidth, 75, "orange");
    drawCircle((wallWidth/2) + x, 85 + y, wallWidth/2, "orange");
}

function drawWall() {
    // Dark walls
    drawRectangle(wallX, 0, wallWidth, 125, "grey");
    drawRectangle(wallX, 220, wallWidth, 60, "grey");
    drawRectangle(wallX, 375, wallWidth, 125, "grey");
    
    // Draw ports if ports are open
    if (port1Open === true) {
        drawPort(wallX, 125);
    }
    if (port2Open === true) {
        drawPort(wallX, 280);
    }
    
    // Draws active transoprt too
}

// Returns a negative or positive number for random movement
function randomCo() {
    // Speed + random value so there's always some movement
    let distance = speed + (Math.random() * Math.floor(speed));
    
    // Picks a direction of negative or positive
    let direction = (Math.random());
    if (direction > 0.5) {
        direction = 1;
    }
    else {
        direction = -1;
    }
    
    return (distance * direction);
}

// Checks if the x and y coordinates are inside the canvas
function isInCanvas(x, y) {
    if (x > 0 && y > 0 && y < canvasHeight && x < canvasWidth) {
        return true;
    }
    return false;
}

// Starter locations of particles
var xCo = [200, 250, 300, 100, 150, 250];
var yCo = [200, 425, 300, 350, 75, 20];

// Moves all the particles
function moveParticles() {
    let tempX, tempY;
    for(let i = 0; i < xCo.length; i++) {
        do {
            // Picks a new location for the particle
            tempX = xCo[i] + randomCo();
            tempY = yCo[i] + randomCo();
            // If new location is outside canvas, loop
        } 
        while (!isInCanvas(tempX, tempY));
        
        // Set particle coordinates to valid new location 
        xCo[i] = tempX;
        yCo[i] = tempY;
    }
}

// Draws things
function draw() {
    // Resets canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    drawWall();

    // Only move particles if timer is on
    if (timerOn === true) {
        moveParticles();
    }
    
    // Draws the particles
    drawBigParticle(xCo[0], yCo[0]);
    drawBigParticle(xCo[1], yCo[1]);
    for (let i = 2; i < xCo.length; i++) {
        drawLilParticle(xCo[i], yCo[i]);
    }
}
// Starts drawing every 75ms
var canvasDrawing;
function startDrawing() {
    canvasDrawing = setInterval(draw, 75);
}
// Stops drawing function
function stopDrawing() {
    clearInterval(canvasDrawing);
}
// Initial draw so the canvas isn't blank
draw();

// Variables for the timer toggle
const timerBtnSpan = document.getElementById("timerBtn-span");
var timerOn = false;
// Toggles timer (and drawing) on/off
function toggleTimer() {
    if (timerOn === false) {
        timerOn = true;
        timerBtnSpan.textContent = "Pause";
        startDrawing();
    }
    else {
        timerOn = false;
        timerBtnSpan.textContent = "Start";
        stopDrawing();
    }
}

// Variables for the two ports
const port1Span = document.getElementById("port1-span");
const port2Span = document.getElementById("port2-span");
var port1Open = false;
var port2Open = false;
// Toggles port 1 open/close
function togglePort1() {
    if (port1Open === false) {
        port1Open = true;
        port1Span.textContent = "Open";
    }
    else {
        port1Open = false;
        port1Span.textContent = "Close";
    }
    // If timer is off, draw() to update canvas
    if (timerOn === false) {
        draw();
    } 
}
// Togges port 2 open/close
function togglePort2() {
    if (port2Open === false) {
        port2Open = true;
        port2Span.textContent = "Open";
    }
    else {
        port2Open = false;
        port2Span.textContent = "Close";
    }
    // If timer is off, draw() to update canvas
    if (timerOn === false) {
        draw();
    } 
}

