// ===============================
// Magnetic Field Simulator
// ===============================

// Canvas
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// UI
const slider = document.getElementById("currentSlider");
const currentValue = document.getElementById("currentValue");

const directionRadios = document.querySelectorAll(
    'input[name="direction"]'
);

// State
let current = Number(slider.value);

let currentDirection = "out";

// ===============================
// Draw Field Lines
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
// Draw Wire
// ===============================
function drawWire() {

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.beginPath();

    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);

    if(currentDirection==="out"){

        ctx.fillStyle="red";

        ctx.fill();

        ctx.fillStyle="white";

        ctx.font="20px Arial";

        ctx.textAlign="center";

        ctx.textBaseline="middle";

        ctx.fillText("•",centerX,centerY);

    }

    else{

        ctx.fillStyle="red";

        ctx.fill();

        ctx.strokeStyle="white";

        ctx.lineWidth=3;

        ctx.beginPath();

        ctx.moveTo(centerX-7,centerY-7);

        ctx.lineTo(centerX+7,centerY+7);

        ctx.moveTo(centerX+7,centerY-7);

        ctx.lineTo(centerX-7,centerY+7);

        ctx.stroke();

    }

}

// ===============================
// Draw Scene
// ===============================
function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawFieldLines();

    drawWire();

}

// ===============================
// Slider
// ===============================
slider.addEventListener("input",()=>{

    current=Number(slider.value);

    currentValue.textContent=current;

    draw();

});

// ===============================
// Radio Buttons
// ===============================
directionRadios.forEach(radio=>{

    radio.addEventListener("change",()=>{

        currentDirection=radio.value;

        draw();

    });

});

// Initial Draw
draw();