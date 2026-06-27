// ===============================
// Magnetic Field Simulator
// ===============================

// Canvas
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// ===============================
// UI Elements
// ===============================
const slider = document.getElementById("currentSlider");
const currentValue = document.getElementById("currentValue");

const directionRadios = document.querySelectorAll(
    'input[name="direction"]'
);

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const infoCurrent = document.getElementById("infoCurrent");
const infoDirection = document.getElementById("infoDirection");
const infoDistance = document.getElementById("infoDistance");
const infoField = document.getElementById("infoField");

// ===============================
// Simulation State
// ===============================
let current = Number(slider.value);
let currentDirection = "out";
let animationRunning = false;
let animationAngle = 0;
// Multiple Wires (NEW)
let wires = [
    { x: canvas.width / 2, y: canvas.height / 2, current: 1 },
    { x: canvas.width / 2 + 120, y: canvas.height / 2, current: -1 }
];

// Mouse Position
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// ===============================
// Compass State (ADDED)
// ===============================
let compassX = canvas.width / 2 + 120;
let compassY = canvas.height / 2;

let draggingCompass = false;
let compassOffsetX = 0;
let compassOffsetY = 0;

// ===============================
// Mouse Events (UPDATED + ADDED)
// ===============================
canvas.addEventListener("mousemove", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    mouseX = mx;
    mouseY = my;

    // Drag compass
    if (draggingCompass) {
        compassX = mx - compassOffsetX;
        compassY = my - compassOffsetY;
    }

    updateInfoPanel();
});

canvas.addEventListener("mousedown", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const dx = mx - compassX;
    const dy = my - compassY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 15) {
        draggingCompass = true;
        compassOffsetX = dx;
        compassOffsetY = dy;
    }
});

canvas.addEventListener("mouseup", () => {
    draggingCompass = false;
});

// ===============================
// Draw Coordinate Grid
// ===============================
function drawGrid() {

    const gridSize = 25;

    ctx.strokeStyle = "#303030";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}
function drawFieldLines() {

    for (let w of wires) {

        const step = 25;

        for (let r = 30; r <= current * 25 + 80; r += step) {

            ctx.beginPath();
            ctx.arc(w.x, w.y, r, 0, Math.PI * 2);

            ctx.strokeStyle =
                w.current > 0 ? "#2196F3" : "#64B5F6";

            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
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

    ctx.beginPath();
    ctx.moveTo(-length / 2, 0);
    ctx.lineTo(length / 2, 0);
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 2;
    ctx.stroke();

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

    const radius = 40;

    for (let w of wires) {

        for (let i = 0; i < 8; i++) {

            const theta = animationAngle + (i * Math.PI) / 4;

            const x = w.x + radius * Math.cos(theta);
            const y = w.y + radius * Math.sin(theta);

            let angle =
                w.current > 0
                    ? theta + Math.PI / 2
                    : theta - Math.PI / 2;

            drawArrow(x, y, angle);
        }
    }
}

// ===============================
// Draw Wire
// ===============================
function drawWire() {

    for (let w of wires) {

        ctx.beginPath();
        ctx.arc(w.x, w.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (w.current > 0) {
            ctx.fillText("•", w.x, w.y);
        } else {
            ctx.fillText("×", w.x, w.y);
        }
    }
}
// ===============================
// Probe (ADDED)
// ===============================
function drawProbe() {

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "lime";
    ctx.fill();
}

// ===============================
// Compass Angle (ADDED)
// ===============================
function getFieldAngle(x, y) {

    let fx = 0;
    let fy = 0;

    for (let w of wires) {

        const dx = x - w.x;
        const dy = y - w.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        const strength = (w.current * 100) / Math.max(dist * dist, 1);

        fx += -dy * strength;
        fy += dx * strength;
    }

    return Math.atan2(fy, fx);
}

// ===============================
// Compass (ADDED)
// ===============================
function drawCompass() {

    const angle = getFieldAngle(compassX, compassY);

    ctx.beginPath();
    ctx.arc(compassX, compassY, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.rotate(angle);

    // red north
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

    // blue south
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 14);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("N", compassX - 4, compassY - 22);
}

// ===============================
// Draw Scene (UPDATED)
// ===============================
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawFieldLines();
    drawDirectionArrows();
    drawProbe();        // ADDED
    drawWire();
    drawCompass();      // ADDED
}

// ===============================
// Update Information Panel (UPDATED)
// ===============================
function updateInfoPanel() {

    infoCurrent.textContent = current + " A";

    infoDirection.textContent =
        currentDirection === "out"
            ? "Out of Page"
            : "Into Page";

    let totalField = 0;

for (let w of wires) {

    const dx = mouseX - w.x;
    const dy = mouseY - w.y;

    const dist = Math.sqrt(dx * dx + dy * dy);

    const contribution = (w.current * 100) / Math.max(dist, 1);

    totalField += contribution;
}

infoField.textContent = totalField.toFixed(2) + " μT";
}

// ===============================
// Animation Loop
// ===============================
function animate() {

    if (animationRunning) {

        if (currentDirection === "out") {
            animationAngle += 0.02;
        } else {
            animationAngle -= 0.02;
        }

        draw();
    }

    requestAnimationFrame(animate);
}

// ===============================
// Events (unchanged)
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

startBtn.addEventListener("click", () => {
    animationRunning = true;
});

pauseBtn.addEventListener("click", () => {
    animationRunning = false;
});

resetBtn.addEventListener("click", () => {
    animationRunning = false;
    animationAngle = 0;
    draw();
});

// ===============================
// Initial Draw
// ===============================
updateInfoPanel();
draw();
animate();