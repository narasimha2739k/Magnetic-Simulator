// =======================================================
// Interactive Physics Laboratory
// Magnetic Field Simulator
// Version 2.0
// PART 1
// =======================================================

// ===============================
// Canvas
// ===============================

const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// ===============================
// UI Elements
// ===============================

const slider = document.getElementById("currentSlider");
const currentValue = document.getElementById("currentValue");

const directionRadios =
document.querySelectorAll('input[name="direction"]');

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const infoCurrent =
document.getElementById("infoCurrent");

const infoDirection =
document.getElementById("infoDirection");

const infoDistance =
document.getElementById("infoDistance");

const infoField =
document.getElementById("infoField");

// ===============================
// Constants
// ===============================

const MU_SCALE = 220;

// ===============================
// Simulation State
// ===============================

let current = Number(slider.value);

let currentDirection = "out";

let animationRunning = false;

let animationAngle = 0;
// Compass animation
let compassAngle = 0;

// ===============================
// Wires
// ===============================

let wires = [

{
    x: canvas.width/2,
    y: canvas.height/2,
    current: current
},

{
    x: canvas.width/2 + 140,
    y: canvas.height/2,
    current: -4
}

];

// ===============================
// Mouse Probe
// ===============================

let mouseX = canvas.width/2;
let mouseY = canvas.height/2;

// ===============================
// Compass
// ===============================

let compassX = canvas.width/2 + 120;
let compassY = canvas.height/2;

let draggingCompass = false;

let draggingWire = null;

let compassOffsetX = 0;
let compassOffsetY = 0;

// ===============================
// Utility
// ===============================

function safeDistance(dx,dy){

    return Math.sqrt(dx*dx+dy*dy)+0.0001;

}

// ===============================
// Draw Background
// ===============================

function drawBackground(){

    ctx.fillStyle="#ffffff";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

}

// ===============================
// Draw Grid
// ===============================

function drawGrid(){

    const size=25;

    ctx.strokeStyle="#e7e7e7";
    ctx.lineWidth=1;

    for(let x=0;x<=canvas.width;x+=size){

        ctx.beginPath();

        ctx.moveTo(x,0);

        ctx.lineTo(x,canvas.height);

        ctx.stroke();

    }

    for(let y=0;y<=canvas.height;y+=size){

        ctx.beginPath();

        ctx.moveTo(0,y);

        ctx.lineTo(canvas.width,y);

        ctx.stroke();

    }

}
// ===============================
// Draw Magnetic Field Rings
// ===============================
function drawFieldRings() {

    for (const wire of wires) {

        const rings = Math.floor(current * 1.2) + 2;

        for (let r = 1; r <= rings; r++) {

            const radius = 35 + r * 22;

            const alpha = Math.min(
                0.15 + current * 0.05,
                0.75
            );

            ctx.beginPath();

            ctx.arc(
                wire.x,
                wire.y,
                radius,
                0,
                Math.PI * 2
            );

            ctx.strokeStyle =
                `rgba(33,150,243,${alpha})`;

            ctx.lineWidth = 1.6;

            ctx.stroke();

        }

    }

}

// ===============================
// Magnetic Field Vector
// ===============================

function getFieldVector(x,y){

    let fx=0;
    let fy=0;

    for(const wire of wires){

        const dx=x-wire.x;
        const dy=y-wire.y;

        const r2=dx*dx+dy*dy;

        const r=Math.sqrt(r2);

        if(r<6) continue;

        const B=(MU_SCALE*wire.current)/r2;

        fx+=(-dy/r)*B;
        fy+=(dx/r)*B;

    }

    return {fx,fy};

}

// ===============================
// Streamlines
// ===============================

function drawStreamLines(){

    const spacing=35;

    ctx.strokeStyle="rgba(33,150,243,0.18)";
    ctx.lineWidth=1.2;

    for(let x=0;x<canvas.width;x+=spacing){

        for(let y=0;y<canvas.height;y+=spacing){

            let px=x;
            let py=y;

            ctx.beginPath();

            ctx.moveTo(px,py);

            for(let i=0;i<8;i++){

                const v=getFieldVector(px,py);

                const mag=Math.sqrt(
                    v.fx*v.fx+
                    v.fy*v.fy
                );

                if(mag<0.001) break;

                px+=(v.fx/mag)*7;
                py+=(v.fy/mag)*7;

                ctx.lineTo(px,py);

            }

            ctx.stroke();

        }

    }

}

// ===============================
// Arrow
// ===============================

function drawArrow(x,y,angle){

    const length=15;

    ctx.save();

    ctx.translate(x,y);

    ctx.rotate(angle);

    ctx.beginPath();

    ctx.moveTo(-length/2,0);

    ctx.lineTo(length/2,0);

    ctx.strokeStyle="#0d47a1";

    ctx.lineWidth=2;

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(length/2,0);

    ctx.lineTo(length/2-5,-4);

    ctx.lineTo(length/2-5,4);

    ctx.closePath();

    ctx.fillStyle="#0d47a1";

    ctx.fill();

    ctx.restore();

}

// ===============================
// Direction Arrows
// ===============================

function drawDirectionArrows(){

    const rings = Math.floor(current * 1.2) + 2;

    for(const wire of wires){

        for(let r=1;r<=rings;r++){

            const radius = 35 + r * 22;

            const arrows = 8 + r * 5;

            for(let i=0;i<arrows;i++){

                const theta=
                animationAngle*(1/r)
                +(i*2*Math.PI/arrows);

                const x=
                wire.x+
                radius*Math.cos(theta);

                const y=
                wire.y+
                radius*Math.sin(theta);

                const angle=
                wire.current>0
                ?theta+Math.PI/2
                :theta-Math.PI/2;

                drawArrow(
                    x,
                    y,
                    angle
                );

            }

        }

    }

}
// ===============================
// Draw Wires
// ===============================
function drawWire() {

    for (const wire of wires) {

        ctx.beginPath();
        ctx.arc(wire.x, wire.y, 15, 0, Math.PI * 2);

        ctx.fillStyle = "#ff3b30";
        ctx.fill();

        ctx.strokeStyle = "#8b0000";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (wire.current > 0) {
            ctx.fillText("•", wire.x, wire.y);
        } else {
            ctx.fillText("×", wire.x, wire.y);
        }

    }

}

// ===============================
// Draw Probe
// ===============================
function drawProbe() {

    ctx.save();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,255,0,0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 4, 0, Math.PI * 2);

    ctx.fillStyle = "#00ff66";
    ctx.shadowColor = "#00ff66";
    ctx.shadowBlur = 15;

    ctx.fill();

    ctx.restore();

}

// ===============================
// Draw Compass
// ===============================
function drawCompass() {

    const field = getFieldVector(compassX, compassY);

    const targetAngle = Math.atan2(field.fy, field.fx);

   // Smoothly rotate the compass
    compassAngle += (targetAngle - compassAngle) * 0.08;

    ctx.beginPath();
    ctx.arc(compassX, compassY, 22, 0, Math.PI * 2);

    ctx.fillStyle = "#2d3748";
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();

    ctx.translate(compassX, compassY);
    ctx.rotate(compassAngle);

    // North
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -14);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.stroke();

    // South
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 14);

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText("N", compassX, compassY - 24);
    ctx.fillText("S", compassX, compassY + 34);
    ctx.fillText("E", compassX + 28, compassY + 4);
    ctx.fillText("W", compassX - 28, compassY + 4);

}

// ===============================
// Draw Scene
// ===============================
function draw() {

    drawBackground();

    drawGrid();

    drawFieldRings();

    drawStreamLines();

    drawDirectionArrows();

    drawWire();

    drawCompass();

    drawProbe();

}

// ===============================
// Information Panel
// ===============================
function updateInfoPanel() {

    infoCurrent.textContent = current + " A";

    infoDirection.textContent =
        currentDirection === "out"
            ? "Out of Page"
            : "Into Page";

    const dx = mouseX - wires[0].x;
    const dy = mouseY - wires[0].y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    infoDistance.textContent =
        distance.toFixed(1) + " px";

    const B =
        (MU_SCALE * Math.abs(wires[0].current)) /
        (distance + 1);

    infoField.textContent =
        B.toFixed(2) + " μT";

}

// ===============================
// Mouse Events
// ===============================
canvas.addEventListener("mousemove", (event) => {

    const rect = canvas.getBoundingClientRect();

    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;

    if (draggingCompass) {

        compassX = mouseX - compassOffsetX;
        compassY = mouseY - compassOffsetY;

    }

    if (draggingWire !== null) {

        wires[draggingWire].x = mouseX;
        wires[draggingWire].y = mouseY;

    }

    updateInfoPanel();

    draw();

});

canvas.addEventListener("mousedown", (event) => {

    const rect = canvas.getBoundingClientRect();

    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    const dcx = mx - compassX;
    const dcy = my - compassY;

    if (Math.sqrt(dcx * dcx + dcy * dcy) < 18) {

        draggingCompass = true;

        compassOffsetX = dcx;
        compassOffsetY = dcy;

        return;

    }

    for (let i = 0; i < wires.length; i++) {

        const dx = mx - wires[i].x;
        const dy = my - wires[i].y;

        if (Math.sqrt(dx * dx + dy * dy) < 18) {

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
// Slider
// ===============================
slider.addEventListener("input", () => {

    current = Number(slider.value);

    currentValue.textContent = current;

    wires[0].current =
        currentDirection === "out"
            ? current
            : -current;

    updateInfoPanel();

    draw();

});

// ===============================
// Direction
// ===============================
directionRadios.forEach(radio => {

    radio.addEventListener("change", () => {

        currentDirection = radio.value;

        wires[0].current =
            currentDirection === "out"
                ? current
                : -current;

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

    animationAngle = 0;

    current = 5;
    slider.value = 5;
    currentValue.textContent = "5";

    currentDirection = "out";

    directionRadios[0].checked = true;

    wires[0].x = canvas.width / 2;
    wires[0].y = canvas.height / 2;
    wires[0].current = 5;

    wires[1].x = canvas.width / 2 + 140;
    wires[1].y = canvas.height / 2;
    wires[1].current = -4;

    compassX = canvas.width / 2 + 120;
    compassY = canvas.height / 2;

    updateInfoPanel();

    draw();

});

// ===============================
// Animation
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
// Initialize
// ===============================
updateInfoPanel();

draw();

animate();