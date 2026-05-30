const ball = document.querySelector(".ball");

// DOM Elements
const valPosEl = document.getElementById("valPos");
const valTotalBouncesEl = document.getElementById("valTotalBounces");
const countTopEl = document.getElementById("countTop");
const countBottomEl = document.getElementById("countBottom");
const countLeftEl = document.getElementById("countLeft");
const countRightEl = document.getElementById("countRight");
const valLastWallEl = document.getElementById("valLastWall");

// Physics Variables (Adjusted for slower motion)
let x = 120;
let y = 200;       // Started slightly lower to give room for the upward jump
let speedX = 2.2;   // Reduced from 3.5 (Slower X)
let speedY = -3.5;  // Negative value launches the ball UPWARD instantly to hit the top wall first
let g = 0.1;       // Reduced from 0.2 (Slower Gravity)

// Sequence Logic
let totalBounces = 0;
const MAX_BOUNCES = 10;
let isEnding = false;
let ballOpacity = 1;

// Wall Statistics Config
const wallStats = {
    top: { name: "Top (Cyan)", color: "#00fff0", hits: 0, el: countTopEl },
    bottom: { name: "Bottom (Light Blue)", color: "#00a8ff", hits: 0, el: countBottomEl },
    left: { name: "Left (Neon Teal)", color: "#00ffc4", hits: 0, el: countLeftEl },
    right: { name: "Right (Dark Blue)", color: "#0066ff", hits: 0, el: countRightEl }
};

// Collision Handler
function handleWallHit(wallKey, impactX, impactY) {
    if (isEnding) return;

    const wall = wallStats[wallKey];
    const audio = new Audio("audio.mp3");
    audio.play();

    wall.hits++;
    wall.el.textContent = wall.hits;

    totalBounces++;
    valTotalBouncesEl.textContent = `${totalBounces} / ${MAX_BOUNCES}`;

    valLastWallEl.textContent = wall.name;
    valLastWallEl.style.color = wall.color;

    ball.style.background = wall.color;
    ball.style.boxShadow = `0 0 20px ${wall.color}`;

    createImpact(impactX, impactY, wall.color);

    if (totalBounces >= MAX_BOUNCES) {
        isEnding = true;
        valLastWallEl.textContent = "Centering & Fading...";
        valLastWallEl.style.color = "#ffff00";
    }
}

// Create Ripple Effect
function createImpact(posX, posY, color) {
    const effect = document.createElement("div");
    effect.className = "impact-effect";
    effect.style.left = `${posX}px`;
    effect.style.top = `${posY}px`;
    effect.style.borderColor = color;
    effect.style.boxShadow = `inset 0 0 10px ${color}, 0 0 10px ${color}`;
    document.body.appendChild(effect);

    setTimeout(() => effect.remove(), 400);
}
function play(){
    const elementTxt = document.createElement("span");
    elementTxt.textContent = "play";
    elementTxt.className = "playTxt";
    document.body.appendChild(elementTxt);
    elementTxt.onclick = ()=>{
        elementTxt.remove();
        playBall();
    };
}
// Main Engine Loop (60 FPS)
function playBall(){
    const simulationLoop = setInterval(() => {
    const ballRect = ball.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const offset = 10; // Wall thickness

    if (!isEnding) {
        // NORMAL MODE: Physics engine active
        speedY += g;
        y += speedY;
        x += speedX;

        // 1. Bottom Wall Collision
        if (y + ballRect.height >= windowHeight - offset) {
            speedY = -speedY;
            y = windowHeight - ballRect.height - offset + speedY;
            handleWallHit("bottom", x + ballRect.width / 2, windowHeight - offset);
        }
        // 2. Top Wall Collision
        else if (y <= offset) {
            y = offset;
            speedY = -speedY;
            handleWallHit("top", x + ballRect.width / 2, offset);
        }

        // 3. Right Wall Collision
        if (x + ballRect.width >= windowWidth - offset) {
            x = windowWidth - ballRect.width - offset;
            speedX = -speedX;
            handleWallHit("right", windowWidth - offset, y + ballRect.height / 2);
        }
        // 4. Left Wall Collision
        else if (x <= offset) {
            x = offset;
            speedX = -speedX;
            handleWallHit("left", offset, y + ballRect.height / 2);
        }
    } else {
        // ENDING MODE: Move to exact center and fade out
        const targetX = (windowWidth - ballRect.width) / 2;
        const targetY = (windowHeight - ballRect.height) / 2;

        // Smooth interpolation to center
        x += (targetX - x) * 0.06;
        y += (targetY - y) * 0.06;

        // Fade out gradually
        ballOpacity -= 0.012;
        if (ballOpacity < 0) ballOpacity = 0;
        ball.style.opacity = ballOpacity;
        ball.style.boxShadow = `0 0 ${15 * ballOpacity}px rgba(255,255,255,${ballOpacity})`;

        if (ballOpacity <= 0) {
            clearInterval(simulationLoop);
            valLastWallEl.textContent = "Finished";
        }
    }

    // Update Ball Style positions
    ball.style.top = `${y}px`;
    ball.style.left = `${x}px`;

    // Update Telemetry Coordinates
    valPosEl.textContent = `${Math.round(x)}px , ${Math.round(y)}px`;

}, 1000 / 60);
};
