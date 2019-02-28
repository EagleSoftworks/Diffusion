// EagleSoftworks
// 2019 - Diffusion Simulation Javascript

// A science simulation which demonstrates how molecules move via diffusion

// jshint maxerr:300
// This sets the context of the canvas
/********************************************
                UI ELEMENTS
********************************************/
const canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Variables for molecule 1 size slider
const mole1Slider = document.getElementById("mole1-slider");
const mole1Span = document.getElementById("mole1-span");

// Variables for molecule 2 size slider
const mole2Slider = document.getElementById("mole2-slider");
const mole2Span = document.getElementById("mole2-span");

const tempSpan = document.getElementById("temp-span");

const spanAT = document.getElementById("at-span");

// Variables for port 1
const port1Span = document.getElementById("port1-span");

// Variables for port 2
const port2Span = document.getElementById("port2-span");

// Variables for including the big molecule
const mole1BtnSpan = document.getElementById("mole1Visible-span");

// Variables for the timer toggle
const timerBtnSpan = document.getElementById("timerBtn-span");

// Ticking variables, timerTicking for starting/stopping interval on tick()
const timerInput = document.getElementById("timer-input");

/********************************************
                GLOBALS
********************************************/

// Height and width are in html so js can access them
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

// Var to easily change wall thickness and keep wall centered
const wallWidth = 50;
const wallX = (canvasWidth - wallWidth) / 2;
const wallXEnd = wallX + wallWidth;

// canvasDrawing for starting/stopping interval for draw()
var canvasDrawing;

var mole1Radius = mole1Slider.value;
var mole2Radius = mole2Slider.value;

// Enum for molecule type, frozen so that it isn't manipulated later:
// https://stackoverflow.com/questions/287903/what-is-the-preferred-syntax-for-defining-enums-in-javascript
var moleculeEnum = {"bigMolecule":1, "smallMolecule":2};
Object.freeze(moleculeEnum);

// Change the speed here to make the particles move faster/slower
var temp = 50;
var speed = 5;

var activeAT = false;
// AT gradient doesn't need to move, so it's outside the function
let gradientAT = ctx.createLinearGradient(325, 0, 425, 0);
gradientAT.addColorStop(0, "#115fc4");
gradientAT.addColorStop(0.25, "#6409a0");
gradientAT.addColorStop(0.75, "#ba09b4");
gradientAT.addColorStop(1, "#c4092c");

var port1Open = true;
var port2Open = true;

var molecule1Visible = true;

var timerOn = false;
var timerTicking;

/********************************************
            DRAWING FUNCTIONS
********************************************/

// Draw object for the functions that draw on the canvas
draw = {
    // Base function for drawing a circle
    circle: function(x, y, radius, color) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();
    },
    // Base function for drawing a rectangle
    rectangle: function(x, y, width, height, color) {
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.fill();
    },
    // Base function for drawing an arc
    arc: function(x1, y1, x2, y2, x3, y3, color) {
        ctx.beginPath();
        // Start point (1)
        ctx.moveTo(x1, y1);
        // Middle point (2) and end point (3)
        ctx.quadraticCurveTo(x2, y2, x3, y3);
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.lineWidth = 1;
    },
    // Draws AT, with gradient if AT is enabled
    activeTransport: function(midpoint, y) {
        // If AT not active then no gradient
        let colorAT = "#55066d";
        // If AT active then there is a gradient
        if (activeAT === true) {
            colorAT = gradientAT;
        }
        
        // Draw arcs for AT
        draw.arc(midpoint-45, y-25, midpoint, y+50, midpoint+60, y-30, colorAT);
        draw.arc(midpoint-45, y+25, midpoint, y-50, midpoint+60, y+30, colorAT);
        draw.arc(midpoint-50, y+15, midpoint+10, y-60, midpoint+65, y-10, colorAT);
        draw.arc(midpoint-50, y-15, midpoint+10, y+60, midpoint+65, y+10, colorAT);
    },
    // Draws a closed port
    port: function(x, y) {
        draw.circle((wallWidth/2) + x, y, wallWidth/2, "orange");
        draw.rectangle(x, y, wallWidth, 75, "orange");
        draw.circle((wallWidth/2) + x, 75 + y, wallWidth/2, "orange");
    },
    // Draws walls depending on what is enabled/disabled
    wall: function() {
        // Dark walls
        draw.rectangle(wallX, 0, wallWidth, 145, "grey"); 
        draw.rectangle(wallX, 220, wallWidth, 60, "grey"); // Leaves 75px for ports
        draw.rectangle(wallX, 355, wallWidth, 145, "grey");
        
        // Draw ports if ports are open
        if (port1Open === false) {
            draw.port(wallX, 145);
        }
        if (port2Open === false) {
            draw.port(wallX, 280);
        }
        
        //draw.rectangle(wallX+wallWidth, 30, 50, 80, "black");
        //draw.rectangle(wallX + wallWidth, 390, 50, 80, "black");
        
        // Draws active transport
        draw.activeTransport(canvasWidth/2, 70);
        draw.activeTransport(canvasWidth/2, 430);
    }
};

/********************************************
            TOGGLES AND INPUT
********************************************/

// Change on input function for molecule 1 slider
mole1Slider.oninput = function() {
    // Set molecule 1 radius based off of slider
    mole1Radius = mole1Slider.value;
    // Set molecule 1 radius display text based off of slider
    mole1Span.textContent = mole1Slider.value;
    // Update canvas if needed
    updateDrawing();
};

// Change on input function for molecule 2 slider
mole2Slider.oninput = function() {
    // Set molecule 2 radius based off of slider
    mole2Radius = mole2Slider.value;
    // Set molecule 2 radius display text based off of slider
    mole2Span.textContent = mole2Slider.value;
    // Update canvas if needed
    updateDrawing();
};

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

// Toggles timer (and drawing) on/off
function toggleTimer() {
    if (timerOn === false && timerInput.value > 0) {
        timerOn = true;
        timerBtnSpan.textContent = "Pause";
        canvasDrawing = setInterval(drawCanvas, 100);
        timerTicking = setInterval(tick, 1000);
    }
    else {
        timerOn = false;
        timerBtnSpan.textContent = "Start";
        clearInterval(canvasDrawing);
        clearInterval(timerTicking);
    }
}

// Toggles port 1 open/close
function togglePort1() {
    if (port1Open === false) {
        port1Open = true;
        port1Span.textContent = "Close";
    }
    else {
        port1Open = false;
        port1Span.textContent = "Open";
    }
    // Update canvas if needed
    updateDrawing();
}

// Toggles port 2 open/close
function togglePort2() {
    if (port2Open === false) {
        port2Open = true;
        port2Span.textContent = "Close";
    }
    else {
        port2Open = false;
        port2Span.textContent = "Open";
    }
    // Update canvas if needed
    updateDrawing();
}

// Toggles big molecules on/off
function toggleMolecule1() {
    if (molecule1Visible === true) {
        molecule1Visible = false;
        mole1BtnSpan.textContent = "Include";
    }
    else {
        molecule1Visible = true;
        mole1BtnSpan.textContent = "Exclude";
    }

    // If simulation has not started, update the new molecule start locations
    if (!timerOn) {
        particleStartLocations();
    }

    updateDrawing();
}

/********************************************
    Temperature Functions and Globals
********************************************/

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
    function isInCanvas(radius, x, y) {
        if (x > (0+radius-1) && y > (0+radius-1) && y < (canvasHeight-radius+1) && x < (canvasWidth-radius+1)) {
            return true;
        } else {
            return false;
        }
    }

    function isInWall(radius, x, y) {
        if (x < (wallX-radius) || (wallX + wallWidth + radius) < x)
            return false;
        return true;
    }

    // Checks if molecule x y are in a given port
    function isInPort(portNum, radius, y) {
        if (portNum == "1" && port1Open === true && y > (145+radius) && y < (220-radius)) {
            return true; 
        }
        else if (portNum == "2" && port2Open === true && y > (280+radius) && y < (335-radius)) {
            return true;
        }
        return false;
    }
    
    // Checks if molecule is near AT input
    function isInAT(ATNum, radius, x, y) {
        if (activeAT === false || (wallX + wallWidth) > x || x > (wallX + wallWidth + 40 + radius)){
            return false;
        }
        else if (ATNum == "1" && (40-radius) <= y && y <= (100+radius)) {
            return true; 
        }
        else if (ATNum == "2" && (400-radius) <= y && y <= (460+radius)) {
            return true;
        }
        return false;
    }

class Molecule {

    constructor(moleculeType, startX, startY) {
        this.moleculeType = moleculeType;
        this.x = startX;
        this.y = startY;
    }

    /************************************/

    /************************************/

    /************************************/

    updateMolecule() {
        let randomX, randomY, radius;
        if (this.moleculeType == moleculeEnum.smallMolecule) {
            radius = parseInt(mole2Radius);
            
            // Random added value in a variable so it can be removed
            randomX = randomCo();
            randomY = randomCo();
            this.x += randomX;
            this.y += randomY;
            
            // Only looks to see if X is inside the canvas, go the other way
            if (!isInCanvas(radius, this.x, 200)) {
                this.x -= (randomX * 2);
            }
            // Only looks to see if Y is inside the canvas, go the other way
            if (!isInCanvas(radius, 200, this.y)) {
                this.y -= (randomY * 2);
            }
            
            // Only do other checks if molecule is in a certain range
            if (this.x >= (wallX - radius) && this.x <= (440 + radius)) {
                if (isInWall(radius, this.x, this.y)) {
                    // If molecule's inside the port, move it so it's not hitting the top or bottom
                    if (isInPort(1, -Math.abs(randomY), this.y)) {
                        if (this.y < (145 + radius)) {
                            this.y = (145 + radius);
                        }
                        else if (this.y > (220 - radius)) {
                            this.y = (220 - radius);
                        }
                    }
                    else if (isInPort(2, -Math.abs(randomY), this.y)) {
                        if (this.y < (280 + radius)) {
                            this.y = 280 + radius;
                        }
                        else if (this.y > (335 - radius)) {
                            this.y = 335 - radius;
                        }
                    }
                    // Move molecules away from the wall
                    else {
                        // Check for x or y, then adjust accordingly
                        if (this.x < 375) {
                            // Sets molecule outside wall
                            this.x = wallX - radius;
                        }
                        else {
                            // Fix this to do the same as the other
                            this.x = wallX + wallWidth + radius;
                        }
                    }
                    //clearInterval(canvasDrawing);
                    //clearInterval(timerTicking);
                }
                else if (this.x > (wallXEnd)) {
                    if (isInAT(1, radius, this.x, this.y)) {
                        this.x = 325 - radius;
                        this.y = 70;
                    }
                    else if (isInAT(2, radius, this.x, this.y)) {
                        this.x = 325 - radius;
                        this.y = 430;
                    }
                }
            }
        }
        // Separated big molecule checks
        else if (this.moleculeType == moleculeEnum.bigMolecule && molecule1Visible === true) {
            radius = parseInt(mole1Radius);
            
            randomX = randomCo();
            randomY = randomCo();
            this.x += randomX;
            this.y += randomY;
            
            // Only looks to see if X is inside the canvas, go the other way
            if (!isInCanvas(radius, this.x, 200) || this.x > (wallX-radius)) {
                this.x -= (randomX * 2);
            }
            // Only looks to see if Y is inside the canvas, go the other way
            if (!isInCanvas(radius, 200, this.y)) {
                this.y -= (randomY * 2);
            }
        }
    }

    draw() {
        // Draws Large molecule type
        if (this.moleculeType == moleculeEnum.bigMolecule) {
            if (molecule1Visible === true) {
                // Linear gradient for style
                let gradient = ctx.createLinearGradient(this.x-75, 0, this.x+100, 0);
                gradient.addColorStop(0, "#540000");
                gradient.addColorStop(0.5, "red");
                gradient.addColorStop(1, "#ffac75");
                
                draw.circle(this.x, this.y, mole1Radius, gradient);
            }
        } else {
            // Draws Small molecule type
            let gradient = ctx.createRadialGradient(this.x, this.y, mole2Radius*(2/3), this.x, this.y, mole2Radius*(2/15));
            gradient.addColorStop(0, "#002602");
            gradient.addColorStop(0.75, "#47772c"); // inside color
            
            draw.circle(this.x, this.y, mole2Radius, gradient);
        }
    }
}

// Function to fill the coordinate arrays in an orderly fashion
function particleStartLocations() {
    if (timerOn === false) {
        // Clear array
        molecules = [];

        // puts the two big molecules in the first two slots
        molecules = [new Molecule(moleculeEnum.bigMolecule, 160, 125), new Molecule(moleculeEnum.bigMolecule, 160, 375)];

        // iterates over rows (r) and columns (c)
        for (let r = 0; r < 10; r++) {
            for (let c = 0; c < 7; c++) {
                // adds a small molecule at a specific interval
                molecules.push(new Molecule(moleculeEnum.smallMolecule, (25 + (c * 45)), (25 + (r * 50))));

                // removes small molecule if near the big one
                if (molecule1Visible && (2 <= c && c <= 4) && ((1 <= r && r <= 3) || (6 <= r && r <= 8))) {
                    molecules.pop();
                }
            }
        }
        drawCanvas(); 
    }
}

// Draws things
function drawCanvas() {
    // Resets canvas
    draw.rectangle(0, 0, canvasWidth, canvasHeight, "white");
    
    draw.wall();

    // Iterates over all the molecules
    for (let i = 0; i < molecules.length; i++) {
        // updates movement if timer is on
        if (timerOn === true) {
            molecules[i].updateMolecule();
        }

        molecules[i].draw();
    }
}

// Update canvas only if timer is not on, update if neeeded
function updateDrawing() {
    if (timerOn === false) {
        drawCanvas();
    }
}

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