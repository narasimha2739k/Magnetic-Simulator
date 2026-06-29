// ===============================
// Magnetic Force Simulator
// ===============================

// ===============================
// Canvas
// ===============================
const canvas = document.getElementById("forceCanvas");
const ctx = canvas.getContext("2d");

// ===============================
// UI Elements
// ===============================
const fieldSlider = document.getElementById("fieldSlider");
const velocitySlider = document.getElementById("velocitySlider");

const fieldValue = document.getElementById("fieldValue");
const velocityValue = document.getElementById("velocityValue");

const chargeRadios =
    document.querySelectorAll('input[name="charge"]');

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const infoField = document.getElementById("infoField");
const infoVelocity = document.getElementById("infoVelocity");
const infoCharge = document.getElementById("infoCharge");
const infoForce = document.getElementById("infoForce");
const infoRadius = document.getElementById("infoRadius");

// ===============================
// Simulation State
// ===============================
let magneticField = Number(fieldSlider.value);

let velocity = Number(velocitySlider.value);

let particleCharge = 1;

let animationRunning = false;

// ===============================
// Particle
// ===============================
let particle = {

    x: 150,

    y: canvas.height / 2,

    radius: 10,

    vx: velocity,

    vy: 0

};

// ===============================
// Draw Coordinate Grid
// ===============================
function drawGrid() {

    const grid = 25;

    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = 1;

    for (let x = 0; x <= canvas.width; x += grid) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();

    }

    for (let y = 0; y <= canvas.height; y += grid) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

    }

}

// ===============================
// Draw Uniform Magnetic Field
// ===============================
function drawMagneticField() {

    ctx.fillStyle = "#1565C0";

    for (let x = 35; x < canvas.width; x += 35) {

        for (let y = 35; y < canvas.height; y += 35) {

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    }

}

// ===============================
// Draw Particle
// ===============================
function drawParticle() {

    ctx.beginPath();

    ctx.arc(

        particle.x,

        particle.y,

        particle.radius,

        0,

        Math.PI * 2

    );

    ctx.fillStyle =
        particleCharge > 0
        ? "#ff4444"
        : "#ffaa00";

    ctx.fill();

    ctx.strokeStyle = "#222";
    ctx.stroke();

}

// ===============================
// Draw Velocity Arrow
// ===============================
function drawVelocityArrow() {

    const arrowLength = 60;

    ctx.beginPath();

    ctx.moveTo(

        particle.x,

        particle.y

    );

    ctx.lineTo(

        particle.x + arrowLength,

        particle.y

    );

    ctx.strokeStyle = "green";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(

        particle.x + arrowLength,

        particle.y

    );

    ctx.lineTo(

        particle.x + arrowLength - 10,

        particle.y - 6

    );

    ctx.lineTo(

        particle.x + arrowLength - 10,

        particle.y + 6

    );

    ctx.closePath();

    ctx.fillStyle = "green";
    ctx.fill();

}

// ===============================
// Draw Magnetic Force Arrow
// ===============================
function drawForceArrow() {

    const arrowLength = 50;

    const direction =
        particleCharge > 0
        ? -1
        : 1;

    ctx.beginPath();

    ctx.moveTo(

        particle.x,

        particle.y

    );

    ctx.lineTo(

        particle.x,

        particle.y + direction * arrowLength

    );

    ctx.strokeStyle = "orange";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(

        particle.x,

        particle.y + direction * arrowLength

    );

    ctx.lineTo(

        particle.x - 6,

        particle.y + direction * arrowLength - direction * 10

    );

    ctx.lineTo(

        particle.x + 6,

        particle.y + direction * arrowLength - direction * 10

    );

    ctx.closePath();

    ctx.fillStyle = "orange";
    ctx.fill();

}// ===============================
// Draw Scene
// ===============================
function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    drawMagneticField();

    drawParticle();

    drawVelocityArrow();

    drawForceArrow();

}

// ===============================
// Update Information Panel
// ===============================
function updateInfoPanel() {

    const force = Math.abs(
        particleCharge *
        velocity *
        magneticField
    );

    const radius =
        velocity * 20 /
        Math.max(magneticField, 1);

    infoField.textContent =
        magneticField + " T";

    infoVelocity.textContent =
        velocity + " m/s";

    infoCharge.textContent =
        particleCharge > 0
        ? "Positive (+)"
        : "Negative (-)";

    infoForce.textContent =
        force.toFixed(2) + " N";

    infoRadius.textContent =
        radius.toFixed(1) + " px";

}

// ===============================
// Particle Physics
// ===============================
function updateParticle() {

    // Move particle horizontally
    particle.x += particle.vx;

    // Simple Lorentz force effect
    if (particleCharge > 0) {

        particle.y -=
            magneticField * 0.25;

    }
    else {

        particle.y +=
            magneticField * 0.25;

    }

    // Reset when particle exits canvas
    if (

        particle.x >

        canvas.width + 40 ||

        particle.y < -40 ||

        particle.y >

        canvas.height + 40

    ) {

        particle.x = 150;

        particle.y = canvas.height / 2;

        particle.vx = velocity;

        particle.vy = 0;

    }

}

// ===============================
// Animation Loop
// ===============================
function animate() {

    if (animationRunning) {

        updateParticle();

        draw();

        updateInfoPanel();

    }

    requestAnimationFrame(animate);

}

// ===============================
// Slider Events
// ===============================
fieldSlider.addEventListener("input", () => {

    magneticField =
        Number(fieldSlider.value);

    fieldValue.textContent =
        magneticField;

    updateInfoPanel();

    draw();

});

velocitySlider.addEventListener("input", () => {

    velocity =
        Number(velocitySlider.value);

    particle.vx =
        velocity;

    velocityValue.textContent =
        velocity;

    updateInfoPanel();

    draw();

});

// ===============================
// Charge Selection
// ===============================
chargeRadios.forEach(radio => {

    radio.addEventListener("change", () => {

        particleCharge =

            radio.value === "positive"

            ? 1

            : -1;

        updateInfoPanel();

        draw();

    });

});

// ===============================
// Buttons
// ===============================
startBtn.addEventListener("click", () => {

    animationRunning = true;

});

pauseBtn.addEventListener("click", () => {

    animationRunning = false;

});

resetBtn.addEventListener("click", () => {

    animationRunning = false;

    particle.x = 150;

    particle.y = canvas.height / 2;

    particle.vx = velocity;

    particle.vy = 0;

    updateInfoPanel();

    draw();

});

// ===============================
// Initialize
// ===============================
updateInfoPanel();

draw();

animate();