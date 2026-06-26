// Get the canvas element
const canvas = document.getElementById("simulationCanvas");

// Get the drawing context (our pen)
const ctx = canvas.getContext("2d");

// Function to draw the wire
function drawWire() {

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find the center of the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw the wire
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();

}

// Draw once
drawWire();