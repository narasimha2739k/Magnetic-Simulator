// ===============================
// Magnetic Field Simulator
// ===============================

// Canvas
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// UI
const slider = document.getElementById("currentSlider");
const currentValue = document.getElementById("currentValue");
const directionRadios = document.querySelectorAll('input[name="direction"]');
const infoCurrent = document.getElementById("infoCurrent");
const infoDirection = document.getElementById("infoDirection");
const infoDistance = document.getElementById("infoDistance");
const infoField = document.getElementById("infoField");

// Simulation State
let current = Number(slider.value);
let currentDirection = "out";
// ===============================
// Draw Coordinate Grid
// ===============================
function drawGrid() {

    const gridSize = 25;

    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

    }

    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

    }

}
// ===============================
// Draw Magnetic Field Lines
// ===============================
function drawFieldLines() {

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let radius = 40; radius <= current * 25 + 30; radius += 25) {

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);

        ctx.strokeStyle = "#2196F3";
        ctx.lineWidth = 2;
        ctx.stroke();

    }
}
// ===============================
// Draw Arrow
// ===============================
function drawArrow(x, y, angle) {

    const length = 18;

    ctx.save();

    ctx.translate(x, y);

    ctx.rotate(angle);

    // Arrow line
    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);

    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Arrow head
    ctx.beginPath();
    ctx.moveTo(length / 2, 0);
    ctx.lineTo(length / 2 - 5, -4);
    ctx.lineTo(length / 2 - 5, 4);
    ctx.closePath();

    ctx.fillStyle = "#1565C0";
    ctx.fill();

    ctx.restore();

}

// ===============================
// Draw Direction Arrows
// ===============================
function drawDirectionArrows() {

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const radius = 40;

    for (let i = 0; i < 8; i++) {

        const theta = (i * Math.PI) / 4;

        const x = centerX + radius * Math.cos(theta);

        const y = centerY + radius * Math.sin(theta);

        let angle;

        if (currentDirection === "out") {

            angle = theta + Math.PI / 2;

        } else {

            angle = theta - Math.PI / 2;

        }

        drawArrow(x, y, angle);

    }

}

// ===============================
// Draw Wire
// ===============================
function drawWire() {

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);

    ctx.fillStyle = "red";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if(currentDirection === "out"){

        ctx.fillText("•", centerX, centerY);

    }else{

        ctx.fillText("×", centerX, centerY);

    }

}

// ===============================
// Draw Scene
// ===============================
function draw() {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawGrid();

    drawFieldLines();

    drawDirectionArrows();

    drawWire();

}

// ===============================
// Events
// ===============================
slider.addEventListener("input", () => {

    current = Number(slider.value);

    currentValue.textContent = current;

    updateInfoPanel();

    draw();

});
directionRadios.forEach(radio => {

    radio.addEventListener("change", () => {

        currentDirection = radio.value;

        updateInfoPanel();

        draw();

    });

});

// ===============================
// Update Information Panel
// ===============================
function updateInfoPanel() {

    infoCurrent.textContent = current + " A";

    infoDirection.textContent =
        currentDirection === "out"
        ? "Out of Page"
        : "Into Page";

}

// ===============================
// Initial Draw
// ===============================
updateInfoPanel();
draw();