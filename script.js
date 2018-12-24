// EagleSoftworks
// 2018 - Diffusion Simulation Javascript

// This sets the context of the canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

// Height and width are in html so js can access them
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

// Starter values
var xCo = [200, 300];
var yCo = [200, 300];

// Change the speed here to make the particles move faster/slower
var speed = 5;

// Draws a circle
function circle(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
}

// Draws a big red particle
function bigParticle(x, y) {
    // Circular gradient, but linear one looks better
    /* var redGradient = ctx.createRadialGradient(x, y, 55, x, y, 15);
    redGradient.addColorStop(0, "#ff5151");
    redGradient.addColorStop(0.3, "#d11d1d");
    redGradient.addColorStop(1, "#9b0909"); // inside color*/
    
    // Linear gradient for style
    var redGradient = ctx.createLinearGradient(x-75, 0, x+100, 0);
    redGradient.addColorStop(0, "#9b0909");
    redGradient.addColorStop(0.5, "red");
    redGradient.addColorStop(1, "white");
    
    circle(x, y, 50, redGradient);
}

// Draws a little particle
function lilParticle(x, y) {
    var darkGradient = ctx.createRadialGradient(x, y, 10, x, y, 2);
    darkGradient.addColorStop(0, "black");
    darkGradient.addColorStop(1, "green"); // inside color
    
    circle(x, y, 15, darkGradient);
}

// Returns a negative or positive number for random movement
function randomCo() {
    // Speed + random value so there's always some movement
    var distance = speed + (Math.random() * Math.floor(speed));
    
    // Picks a direction of negative or positive
    var direction = (Math.random());
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

// Draws things
function draw() {
    if (isInCanvas(xCo[0], yCo[0]) && isInCanvas(xCo[1], yCo[1])) {
        // Erases canvas
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Moves the particle by random amounts
        xCo[0] += randomCo();
        yCo[0] += randomCo();
        xCo[1] += randomCo();
        yCo[1] += randomCo();
        
        // Draws a new particle
        bigParticle(xCo[0], yCo[0]);
        lilParticle(xCo[1], yCo[1]);
        }
    else {
        // Stops drawing once particle goes outside the canvas
        clearInterval(circleDrawing);
        console.log("stopped");
    }
}

// Draws things every 75ms
var circleDrawing = setInterval(draw, 75);