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

const directionRadios = document.querySelectorAll('input[name="direction"]');

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const infoCurrent = document.getElementById("infoCurrent");
const infoDirection = document.getElementById("infoDirection");
const infoDistance = document.getElementById("infoDistance");
const infoField = document.getElementById("infoField");

// ===============================
// Physics Constant
// ===============================
const MU_SCALE = 200;

function safeDistance(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy) + 0.0001;
}

// ===============================
// Simulation State
// ===============================
let current = Number(slider.value);
let currentDirection = "out";
let animationRunning = false;
let animationAngle = 0;

// Multiple Wires
let wires = [
    { x: canvas.width / 2, y: canvas.height / 2, current: 1 },
    { x: canvas.width / 2 + 120, y: canvas.height / 2, current: -1 }
];

// Particles (MILESTONE 10)
let particles = [
    {
        x: canvas.width / 2 - 150,
        y: canvas.height / 2,
        vx: 2,
        vy: 1,
        charge: 1
    },
    {
        x: canvas.width / 2 + 150,
        y: canvas.height / 2,
        vx: -2,
        vy: 1,
        charge: -1
    }
];

// Mouse
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

// Compass
let compassX = canvas.width / 2 + 120;
let compassY = canvas.height / 2;

let draggingCompass = false;
let draggingWire = null;
let compassOffsetX = 0;
let compassOffsetY = 0;

// ===============================
// Mouse Events
// ===============================
canvas.addEventListener("mousemove", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    mouseX = mx;
    mouseY = my;

    if (draggingCompass) {
        compassX = mx - compassOffsetX;
        compassY = my - compassOffsetY;
    }

    if (draggingWire !== null) {
        wires[draggingWire].x = mx;
        wires[draggingWire].y = my;
    }

    updateInfoPanel();
});

canvas.addEventListener("mousedown", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const dxC = mx - compassX;
    const dyC = my - compassY;

    if (Math.sqrt(dxC * dxC + dyC * dyC) < 15) {
        draggingCompass = true;
        compassOffsetX = dxC;
        compassOffsetY = dyC;
        return;
    }

    for (let i = 0; i < wires.length; i++) {

        const w = wires[i];

        const dx = mx - w.x;
        const dy = my - w.y;

        if (Math.sqrt(dx * dx + dy * dy) < 15) {
            draggingWire = i;
            return;
        }
    }
});

canvas.addEventListener("mouseup", () => {
    draggingCompass = false;
    draggingWire = null;
});

// ===============================
// Grid
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

// ===============================
// Field Vector (CORE)
// ===============================
function getFieldVector(x, y) {

    let fx = 0;
    let fy = 0;

    for (let w of wires) {

        const dx = x - w.x;
        const dy = y - w.y;

        const r2 = dx * dx + dy * dy;

        const r = Math.sqrt(r2);

        if (r < 5) continue;

        const B = (MU_SCALE * w.current) / r2;

        fx += (-dy / r) * B;
        fy += (dx / r) * B;
    }

    return { fx, fy };
}

// ===============================
// STREAMLINES (MILESTONE 10)
// ===============================
function drawStreamlines() {

    const step = 30;

    for (let x = 0; x < canvas.width; x += step) {
        for (let y = 0; y < canvas.height; y += step) {

            let px = x;
            let py = y;

            ctx.beginPath();
            ctx.moveTo(px, py);

            for (let i = 0; i < 6; i++) {

                const v = getFieldVector(px, py);

                const mag = Math.sqrt(v.fx * v.fx + v.fy * v.fy);
                if (mag < 0.001) break;

                px += (v.fx / mag) * 6;
                py += (v.fy / mag) * 6;

                ctx.lineTo(px, py);
            }

            ctx.strokeStyle = "rgba(33,150,243,0.12)";
            ctx.stroke();
        }
    }
}

// ===============================
// Particle Physics (MILESTONE 10)
// ===============================
function getMagneticField(x, y) {

    let Bz = 0;

    for (let w of wires) {

        const dx = x - w.x;
        const dy = y - w.y;

        const r2 = dx * dx + dy * dy;

        if (r2 < 10) continue;

        Bz += (MU_SCALE * w.current) / r2;
    }

    return Bz;
}

function updateParticles() {

    for (let p of particles) {

        const B = getMagneticField(p.x, p.y);

        const ax = p.charge * p.vy * B * 0.01;
        const ay = -p.charge * p.vx * B * 0.01;

        p.vx += ax;
        p.vy += ay;

        p.x += p.vx;
        p.y += p.vy;

        if (
            p.x < 0 || p.x > canvas.width ||
            p.y < 0 || p.y > canvas.height
        ) {
            p.x = canvas.width / 2;
            p.y = canvas.height / 2;
            p.vx = 2;
            p.vy = 1;
        }
    }
}

function drawParticles() {

    for (let p of particles) {

        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);

        ctx.fillStyle = p.charge > 0 ? "yellow" : "orange";
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.stroke();
    }
}

// ===============================
// Arrow
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
// Direction Arrows
// ===============================
function drawDirectionArrows() {

    const radius = 40;

    for (let w of wires) {

        for (let i = 0; i < 8; i++) {

            const theta = animationAngle + (i * Math.PI) / 4;

            const x = w.x + radius * Math.cos(theta);
            const y = w.y + radius * Math.sin(theta);

            const angle =
                w.current > 0
                    ? theta + Math.PI / 2
                    : theta - Math.PI / 2;

            drawArrow(x, y, angle);
        }
    }
}

// ===============================
// Wire
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

        ctx.fillText(w.current > 0 ? "•" : "×", w.x, w.y);
    }
}

// ===============================
// Probe
// ===============================
function drawProbe() {

    ctx.save();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "lime";

    ctx.shadowColor = "lime";
    ctx.shadowBlur = 12;

    ctx.fill();

    ctx.restore();
}

// ===============================
// Compass
// ===============================
function drawCompass() {

    const angle = Math.atan2(
        getFieldVector(compassX, compassY).fy,
        getFieldVector(compassX, compassY).fx
    );

    ctx.beginPath();
    ctx.arc(compassX, compassY, 18, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

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
// Scene
// ===============================
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStreamlines();     // MILESTONE 10
    drawGrid();
    drawDirectionArrows();
    drawWire();
    drawParticles();
    drawCompass();
    drawProbe();
}

// ===============================
// Info Panel
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

        const dist = safeDistance(dx, dy);

        totalField += (MU_SCALE * w.current) / dist;
    }

    infoField.textContent = totalField.toFixed(2) + " μT";
}

// ===============================
// Animation Loop
// ===============================
function animate() {

    if (animationRunning) {

        animationAngle += currentDirection === "out" ? 0.02 : -0.02;

        updateParticles(); // MILESTONE 10

        draw();
    }

    requestAnimationFrame(animate);
}

// ===============================
// UI Events
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

startBtn.addEventListener("click", () => animationRunning = true);
pauseBtn.addEventListener("click", () => animationRunning = false);

resetBtn.addEventListener("click", () => {
    animationRunning = false;
    animationAngle = 0;
    draw();
});

// ===============================
// Init
// ===============================
updateInfoPanel();
draw();
animate();