const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;
const paddleWidth = 10;
let leftPaddleHeight = 100;
let rightPaddleHeight = 100;
let leftPaddleY = (canvas.height - leftPaddleHeight) / 2;
let rightPaddleY = (canvas.height - rightPaddleHeight) / 2;
let leftPaddleSpeed = 10;
let rightPaddleSpeed = 10;
let player1Score = 0;
let player2Score = 0;
const winningScore = 5;
let gameOver = false;
let showStartScreen = true;
let isOnePlayer = false;
let difficulty = 'medium';

// Difficulty Settings
const difficultySettings = {
    easy: {
        aiSpeed: 4,
    },
    medium: {
        aiSpeed: 6,
    },
    hard: {
        aiSpeed: 8,
    }
};

// Key Presses
let wPressed = false;
let sPressed = false;
let upPressed = false;
let downPressed = false;

// Mobile Controls
const leftUpBtn = document.getElementById('left-up');
const leftDownBtn = document.getElementById('left-down');
const rightUpBtn = document.getElementById('right-up');
const rightDownBtn = document.getElementById('right-down');
const mobileControls = document.getElementById('mobile-controls');

// DOM Elements
const startScreen = document.getElementById('start-screen');
const onePlayerBtn = document.getElementById('one-player-btn');
const twoPlayerBtn = document.getElementById('two-player-btn');
const tutorialBtn = document.getElementById('tutorial-btn');
const difficultyScreen = document.getElementById('difficulty-screen');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const startGameScreen = document.getElementById('start-game-screen');
const startGameBtn = document.getElementById('start-game-btn');
const gameOverScreen = document.getElementById('game-over-screen');
const winnerText = document.getElementById('winner-text');
const restartBtn = document.getElementById('restart-btn');
const player1ScoreDisplay = document.getElementById('player1-score');
const player2ScoreDisplay = document.getElementById('player2-score');
const tutorialModal = document.getElementById('tutorial-modal');
const closeBtn = document.querySelector('.close-btn');

// Sound Effects
const paddleHitSound = new Audio('paddle_hit.mp3');
const scoreSound = new Audio('score.mp3');

// Background Music
const musicFiles = [
    'music1.mp3',
    'music2.mp3',
    'music3.mp3',
    'music4.mp3',
    'music5.mp3',
    'music6.mp3',
    'music7.mp3'
];
let backgroundMusic = null;

// Particle Effects
let particles = [];

// Power-ups
let powerUps = [];
const powerUpTypes = [
    {
        type: 'increasePaddleSize',
        emoji: '🛡️',
        effectDuration: 5000 // milliseconds
    },
    {
        type: 'speedBoost',
        emoji: '⚡',
        effectDuration: 5000
    },
    {
        type: 'decreaseOpponentPaddleSize',
        emoji: '❌',
        effectDuration: 5000
    }
];
let activePowerUps = {
    player1: null,
    player2: null
};

// Limit Power-ups
let maxPowerUpsPerGame = 5; // Adjust as needed
let powerUpsSpawned = 0;

// Event Listeners for Start Screen
onePlayerBtn.addEventListener('click', () => {
    isOnePlayer = true;
    startScreen.style.display = 'none';
    difficultyScreen.style.display = 'block';
});

twoPlayerBtn.addEventListener('click', () => {
    isOnePlayer = false;
    startScreen.style.display = 'none';
    startGameScreen.style.display = 'block';
});

tutorialBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'block';
});

// Close Tutorial Modal
closeBtn.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
});

// Close Tutorial Modal when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target == tutorialModal) {
        tutorialModal.style.display = 'none';
    }
});

// Event Listeners for Difficulty Buttons
difficultyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        difficulty = btn.getAttribute('data-difficulty');
        difficultyScreen.style.display = 'none';
        startGameScreen.style.display = 'block';
    });
});

// Start Game Button
startGameBtn.addEventListener('click', () => {
    startGameScreen.style.display = 'none';
    showStartScreen = false;
    startBackgroundMusic();
});

// Restart Game
restartBtn.addEventListener('click', () => {
    player1Score = 0;
    player2Score = 0;
    gameOver = false;
    gameOverScreen.style.display = 'none';
    resetGame();
    startBackgroundMusic(); // Start a new music track
});

// Start Background Music
function startBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
    let randomIndex = Math.floor(Math.random() * musicFiles.length);
    backgroundMusic = new Audio(musicFiles[randomIndex]);
    backgroundMusic.loop = true;
    backgroundMusic.play();
}

// Detect Touch Device and Show Mobile Controls
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints;
}

if (isTouchDevice()) {
    mobileControls.style.display = 'flex';
}

// Draw Functions
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawPaddle(x, y, width, height) {
    // Apply gradient to paddles
    let gradient = ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, '#ff00ff');
    gradient.addColorStop(1, '#00ffff');
    ctx.fillStyle = gradient;
    // Add shadow
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(x, y, width, height);
    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawBall(x, y, radius) {
    // Apply gradient to ball
    let gradient = ctx.createRadialGradient(x, y, radius / 2, x, y, radius);
    gradient.addColorStop(0, '#ffff00');
    gradient.addColorStop(1, '#ff0000');
    ctx.fillStyle = gradient;
    // Add shadow
    ctx.shadowColor = '#ff0';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawNet() {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fff';
    ctx.shadowBlur = 10;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 20);
    }
    ctx.shadowBlur = 0;
}

// Particle Effects Functions
function createParticles(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 100
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life -= 2;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.fillStyle = `rgba(255, 255, 0, ${p.life / 100})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Power-up Functions
function spawnPowerUp() {
    // Randomly decide whether to spawn a power-up
    if (Math.random() < 0.01 && powerUpsSpawned < maxPowerUpsPerGame) {
        let typeIndex = Math.floor(Math.random() * powerUpTypes.length);
        let powerUpType = powerUpTypes[typeIndex];
        let powerUp = {
            type: powerUpType.type,
            emoji: powerUpType.emoji,
            x: Math.random() * (canvas.width - 100) + 50, // Avoid edges
            y: Math.random() * (canvas.height - 100) + 50,
            dx: (Math.random() - 0.5) * 2, // Random horizontal speed
            dy: (Math.random() - 0.5) * 2, // Random vertical speed
            width: 30,
            height: 30,
            effectDuration: powerUpType.effectDuration
        };
        powerUps.push(powerUp);
        powerUpsSpawned++;
    }
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerUp.emoji, powerUp.x, powerUp.y);
    });
}

function updatePowerUps() {
    powerUps.forEach((powerUp, index) => {
        // Move power-up
        powerUp.x += powerUp.dx;
        powerUp.y += powerUp.dy;

        // Bounce off walls
        if (powerUp.x <= 0 || powerUp.x >= canvas.width) {
            powerUp.dx = -powerUp.dx;
        }
        if (powerUp.y <= 0 || powerUp.y >= canvas.height) {
            powerUp.dy = -powerUp.dy;
        }

        // Check collision with left paddle
        if (
            powerUp.x < paddleWidth &&
            powerUp.y > leftPaddleY &&
            powerUp.y < leftPaddleY + leftPaddleHeight
        ) {
            applyPowerUp('player1', powerUp.type);
            powerUps.splice(index, 1);
        }
        // Check collision with right paddle
        else if (
            powerUp.x > canvas.width - paddleWidth &&
            powerUp.y > rightPaddleY &&
            powerUp.y < rightPaddleY + rightPaddleHeight
        ) {
            applyPowerUp('player2', powerUp.type);
            powerUps.splice(index, 1);
        }
    });
}

function applyPowerUp(player, type) {
    let opponent = player === 'player1' ? 'player2' : 'player1';
    switch (type) {
        case 'increasePaddleSize':
            if (!activePowerUps[player]) {
                activePowerUps[player] = type;
                if (player === 'player1') {
                    leftPaddleHeight *= 1.5;
                    leftPaddleY -= (leftPaddleHeight / 6);
                } else {
                    rightPaddleHeight *= 1.5;
                    rightPaddleY -= (rightPaddleHeight / 6);
                }
                setTimeout(() => {
                    if (player === 'player1') {
                        leftPaddleHeight /= 1.5;
                        leftPaddleY += (leftPaddleHeight / 4);
                    } else {
                        rightPaddleHeight /= 1.5;
                        rightPaddleY += (rightPaddleHeight / 4);
                    }
                    activePowerUps[player] = null;
                }, 5000);
            }
            break;
        case 'speedBoost':
            if (!activePowerUps[player]) {
                activePowerUps[player] = type;
                if (player === 'player1') {
                    leftPaddleSpeed *= 1.5;
                } else {
                    rightPaddleSpeed *= 1.5;
                }
                setTimeout(() => {
                    if (player === 'player1') {
                        leftPaddleSpeed /= 1.5;
                    } else {
                        rightPaddleSpeed /= 1.5;
                    }
                    activePowerUps[player] = null;
                }, 5000);
            }
            break;
        case 'decreaseOpponentPaddleSize':
            if (!activePowerUps[opponent]) {
                activePowerUps[opponent] = type;
                if (opponent === 'player1') {
                    leftPaddleHeight /= 1.5;
                    leftPaddleY += (leftPaddleHeight / 6);
                } else {
                    rightPaddleHeight /= 1.5;
                    rightPaddleY += (rightPaddleHeight / 6);
                }
                setTimeout(() => {
                    if (opponent === 'player1') {
                        leftPaddleHeight *= 1.5;
                        leftPaddleY -= (leftPaddleHeight / 4);
                    } else {
                        rightPaddleHeight *= 1.5;
                        rightPaddleY -= (rightPaddleHeight / 4);
                    }
                    activePowerUps[opponent] = null;
                }, 5000);
            }
            break;
        default:
            break;
    }
}

function resetBall() {
    if (player1Score >= winningScore || player2Score >= winningScore) {
        gameOver = true;
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
    }
    // Create particles at the ball's position
    createParticles(ballX, ballY);

    ballSpeedX = -ballSpeedX;
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedY = 5;
}

function resetGame() {
    // Reset variables
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = 5;
    ballSpeedY = 5;
    leftPaddleHeight = 100;
    rightPaddleHeight = 100;
    leftPaddleSpeed = 10;
    rightPaddleSpeed = 10;
    leftPaddleY = (canvas.height - leftPaddleHeight) / 2;
    rightPaddleY = (canvas.height - rightPaddleHeight) / 2;
    activePowerUps.player1 = null;
    activePowerUps.player2 = null;
    powerUps = [];
    particles = [];
    powerUpsSpawned = 0; // Reset the power-up counter
    // No need to play background music here
}

function moveEverything() {
    if (gameOver || showStartScreen) {
        return;
    }

    // Move Ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and Bottom Collision
    if (ballY <= 0 || ballY >= canvas.height) {
        ballSpeedY = -ballSpeedY;
    }

    // Left Paddle Collision
    if (ballX <= paddleWidth) {
        if (ballY > leftPaddleY && ballY < leftPaddleY + leftPaddleHeight) {
            ballSpeedX = -ballSpeedX;
            paddleHitSound.play();
            let deltaY = ballY - (leftPaddleY + leftPaddleHeight / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player2Score++;
            scoreSound.play();
            resetBall();
        }
    }

    // Right Paddle Collision
    if (ballX >= canvas.width - paddleWidth) {
        if (ballY > rightPaddleY && ballY < rightPaddleY + rightPaddleHeight) {
            ballSpeedX = -ballSpeedX;
            paddleHitSound.play();
            let deltaY = ballY - (rightPaddleY + rightPaddleHeight / 2);
            ballSpeedY = deltaY * 0.35;
        } else {
            player1Score++;
            scoreSound.play();
            resetBall();
        }
    }

    // Move Left Paddle
    if (wPressed && leftPaddleY > 0) {
        leftPaddleY -= leftPaddleSpeed;
    }
    if (sPressed && leftPaddleY < canvas.height - leftPaddleHeight) {
        leftPaddleY += leftPaddleSpeed;
    }

    // Move Right Paddle
    if (isOnePlayer) {
        // AI for One-Player Mode based on difficulty
        let aiSpeed = difficultySettings[difficulty].aiSpeed;
        if (rightPaddleY + rightPaddleHeight / 2 < ballY - 35) {
            rightPaddleY += aiSpeed;
        } else if (rightPaddleY + rightPaddleHeight / 2 > ballY + 35) {
            rightPaddleY -= aiSpeed;
        }
    } else {
        if (upPressed && rightPaddleY > 0) {
            rightPaddleY -= rightPaddleSpeed;
        }
        if (downPressed && rightPaddleY < canvas.height - rightPaddleHeight) {
            rightPaddleY += rightPaddleSpeed;
        }
    }

    // Update Scores
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;

    // Check for Game Over
    if (gameOver) {
        gameOverScreen.style.display = 'block';
        winnerText.textContent = player1Score >= winningScore ? 'Player 1 Wins!' : 'Player 2 Wins!';
    }
}

function drawEverything() {
    // Clear Screen
    drawRect(0, 0, canvas.width, canvas.height, '#000');

    if (showStartScreen) {
        return;
    }

    // Draw Net
    drawNet();

    // Draw Left Paddle
    drawPaddle(0, leftPaddleY, paddleWidth, leftPaddleHeight);

    // Draw Right Paddle
    drawPaddle(canvas.width - paddleWidth, rightPaddleY, paddleWidth, rightPaddleHeight);

    // Draw Ball
    drawBall(ballX, ballY, 10);

    // Draw Power-Ups
    drawPowerUps();

    // Draw Particles
    drawParticles();
}

function gameLoop() {
    moveEverything();
    drawEverything();
    updateParticles();
    spawnPowerUp();
    updatePowerUps();
}

setInterval(gameLoop, 1000 / 60);

// Keyboard Event Listeners
document.addEventListener('keydown', function (e) {
    switch (e.key) {
        case 'w':
        case 'W':
            wPressed = true;
            break;
        case 's':
        case 'S':
            sPressed = true;
            break;
        case 'ArrowUp':
            upPressed = true;
            break;
        case 'ArrowDown':
            downPressed = true;
            break;
    }
});

document.addEventListener('keyup', function (e) {
    switch (e.key) {
        case 'w':
        case 'W':
            wPressed = false;
            break;
        case 's':
        case 'S':
            sPressed = false;
            break;
        case 'ArrowUp':
            upPressed = false;
            break;
        case 'ArrowDown':
            downPressed = false;
            break;
    }
});

// Mobile Controls Event Listeners
leftUpBtn.addEventListener('touchstart', () => { wPressed = true; });
leftUpBtn.addEventListener('touchend', () => { wPressed = false; });

leftDownBtn.addEventListener('touchstart', () => { sPressed = true; });
leftDownBtn.addEventListener('touchend', () => { sPressed = false; });

rightUpBtn.addEventListener('touchstart', () => { upPressed = true; });
rightUpBtn.addEventListener('touchend', () => { upPressed = false; });

rightDownBtn.addEventListener('touchstart', () => { downPressed = true; });
rightDownBtn.addEventListener('touchend', () => { downPressed = false; });
