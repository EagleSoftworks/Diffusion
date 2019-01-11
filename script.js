// EagleSoftworks
// 2019 - Diffusion Simulation Javascript

// A science simulation which demonstrates how molecules move via diffusion

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
// Draws a rectangle
function drawRectangle(x, y, width, height, color) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
}
// Draws an arc
function drawArc(x1, y1, x2, y2, x3, y3, color) {
    ctx.beginPath();
    // Start point (1)
    ctx.moveTo(x1, y1);
    // Middle point (2) and end point (3)
    ctx.quadraticCurveTo(x2, y2, x3, y3);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.lineWidth = 1;
}

// Variables for molecule 1 size slider
const mole1Slider = document.getElementById("mole1-slider");
const mole1Span = document.getElementById("mole1-span");
var mole1Radius = mole1Slider.value;
// Change on input function for molecule 1 slider
mole1Slider.oninput = function() {
    // Set molecule 1 radius based off of slider
    mole1Radius = mole1Slider.value;
    // Set molecule 1 radius display text based off of slider
    mole1Span.textContent = mole1Slider.value;
    // Update canvas if needed
    updateDrawing();
};
// Variables for molecule 2 size slider
const mole2Slider = document.getElementById("mole2-slider");
const mole2Span = document.getElementById("mole2-span");
var mole2Radius = mole2Slider.value;
// Change on input function for molecule 2 slider
mole2Slider.oninput = function() {
    // Set molecule 2 radius based off of slider
    mole2Radius = mole2Slider.value;
    // Set molecule 2 radius display text based off of slider
    mole2Span.textContent = mole2Slider.value;
    // Update canvas if needed
    updateDrawing();
};

// Draws a big red particle
function drawBigParticle(x, y) {
    // Linear gradient for style
    let redGradient = ctx.createLinearGradient(x-75, 0, x+100, 0);
    redGradient.addColorStop(0, "#540000");
    redGradient.addColorStop(0.5, "red");
    redGradient.addColorStop(1, "#ffac75");
    
    // Use radius from slider, starting value is 50
    drawCircle(x, y, mole1Radius, redGradient);
}

// Draws a little particle
function drawLilParticle(x, y) {
    let darkGradient = ctx.createRadialGradient(x, y, mole2Radius*(2/3), x, y, mole2Radius*(2/15));
    darkGradient.addColorStop(0, "#002602");
    darkGradient.addColorStop(0.75, "#47772c"); // inside color
    
    // Use radius from slider, starting value is 10
    drawCircle(x, y, mole2Radius, darkGradient);
}

/********************************************
    Temperature Functions and Globals
********************************************/

var tempSpan = document.getElementById("temp-span");
var temp = 50;

// Adds/Subtracts 5 from temp
// Speed is also changed here (is a fifth of temp)
function minusTemp() {
    if (temp > 25) {
        temp = temp - 5;
        speed = temp / 5;
    }
    tempSpan.textContent = temp;
}
function addTemp() {
    if (temp < 75) {
        temp = temp + 5;
        speed = temp/5;
    }
    tempSpan.textContent = temp;
}

/********************************************
    Active Transport Functions and Globals
********************************************/

spanAT = document.getElementById("at-span");
var activeAT = false;
function toggleAT() {
    if (activeAT === false) {
        activeAT = true;
        spanAT.textContent = "Disable";
    }
    else {
        activeAT = false;
        spanAT.textContent = "Enable";
    }
    // Update canvas if needed
    updateDrawing();
}

// AT gradient doesn't need to move, so it's outside the function
let gradientAT = ctx.createLinearGradient(325, 0, 425, 0);
gradientAT.addColorStop(0, "#115fc4");
gradientAT.addColorStop(0.25, "#6409a0");
gradientAT.addColorStop(0.75, "#ba09b4");
gradientAT.addColorStop(1, "#c4092c");

// Draws AT, with gradient if AT is enabled
function drawAT(midpoint, y) {
    // If AT not active then no gradient
    let colorAT = "#55066d";
    // change later to AT 
    if (activeAT === true) {
        colorAT = gradientAT;
    }

    // Draw arcs for AT
    drawArc(midpoint-45, y-25, midpoint, y+50, midpoint+60, y-30, colorAT);
    drawArc(midpoint-45, y+25, midpoint, y-50, midpoint+60, y+30, colorAT);
    drawArc(midpoint-50, y+15, midpoint+10, y-60, midpoint+65, y-10, colorAT);
    drawArc(midpoint-50, y-15, midpoint+10, y+60, midpoint+65, y+10, colorAT);
}

// Var to easily change wall thickness and keep wall centered
var wallWidth = 30;
var wallX = (canvasWidth - wallWidth) / 2;

// Draws a closed port
function drawPort(x, y) {
    drawCircle((wallWidth/2) + x, 10 + y, wallWidth/2, "orange");
    drawRectangle(x, 10 + y, wallWidth, 75, "orange");
    drawCircle((wallWidth/2) + x, 85 + y, wallWidth/2, "orange");
}

// Draws walls depending on what is enabled/disabled
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
    
    // Draws active transport
    drawAT(canvasWidth/2, 50);
    drawAT(canvasWidth/2, 450);
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

// Starter locations of particles for testing with fewer particles
var xCo = [200, 250, 300, 100, 150, 250];
var yCo = [200, 425, 300, 350, 75, 20];
// Function to fill the coordinate arrays in an orderly fashion
function particleStartLocations() {
    if (timerOn === false) {
        // Clear arrays
        xCo = [];
        yCo = [];
        // Big particles
        xCo = [160, 160];
        yCo = [125, 375];
        // Lil particles
        // R for rows and C for columns
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 7; c++) {
                // Add lil particle coordinates to arrays
                xCo.push(25 + (c * 45));
                yCo.push(25 + (r * 50));
                
                // Remove lil particle coordinates if near big particle
                if ((2 <= c && c <= 4) && ((1 <= r && r <= 3) || (6 <= r && r <= 8))) {
                    xCo.pop();
                    yCo.pop();
                }
            }
        }
        draw(); 
    }
}

// Moves all the particles
function moveParticles() {
    let tempX, tempY;
    for(let i = 0; i < xCo.length; i++) {
        /* Add x y ranges for checks so lil particles far right/left don't have to go
        through the checks for the wall/AT and particles high up won't have to go 
        through checks for lower AT*/
        
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
// canvasDrawing for starting/stopping interval for draw()
var canvasDrawing;
// Update canvas only if timer is not on, update if neeeded
function updateDrawing() {
    if (timerOn === false) {
        draw();
    }
}

// Variables for the timer toggle
const timerBtnSpan = document.getElementById("timerBtn-span");
var timerOn = false;
// Toggles timer (and drawing) on/off
function toggleTimer() {
    if (timerOn === false && timerInput.value > 0) {
        timerOn = true;
        timerBtnSpan.textContent = "Pause";
        canvasDrawing = setInterval(draw, 75);
        timerTicking = setInterval(tick, 1000);
    }
    else {
        timerOn = false;
        timerBtnSpan.textContent = "Start";
        clearInterval(canvasDrawing);
        clearInterval(timerTicking);
    }
}
// Ticking variables, timerTicking for starting/stopping interval on tick()
const timerInput = document.getElementById("timer-input");
var timerTicking;
// Tick() incriments the timer
function tick() {
    if (timerInput.value > 1) {
        timerInput.value--;
    }
    else if (timerInput.value <= 1) {
        timerInput.value = 0;
        toggleTimer();
    }
}

// Initally populate arrays with coordinates after timerOn exists
particleStartLocations();

// Variables for port 1
const port1Span = document.getElementById("port1-span");
var port1Open = false;
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
    // Update canvas if needed
    updateDrawing();
}
// Variables for port 2
const port2Span = document.getElementById("port2-span");
var port2Open = false;
// Toggles port 2 open/close
function togglePort2() {
    if (port2Open === false) {
        port2Open = true;
        port2Span.textContent = "Open";
    }
    else {
        port2Open = false;
        port2Span.textContent = "Close";
    }
    // Update canvas if needed
    updateDrawing();
}

