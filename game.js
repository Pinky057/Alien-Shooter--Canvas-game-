// Select the canvas element and set its size
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game Variables
let spaceship = {
  x: canvas.width / 2 - 40, // Adjusted x position for the UFO
  y: canvas.height - 100, // Adjusted y position for UFO height
  width: 80,
  height: 40,
  speed: 10,
  movingLeft: false,
  movingRight: false,
};

let bullets = [];
let aliens = [];
let alienRows = 3;
let alienCols = 7;
let alienSpeed = 2;
let alienDirection = 1;
let gameOver = false;
let score = 0;
let stars = [];
let restartButton = document.getElementById("restartButton");

// Spaceship Movement
window.addEventListener("keydown", function (e) {
  if (e.key === "ArrowLeft") spaceship.movingLeft = true;
  if (e.key === "ArrowRight") spaceship.movingRight = true;
  if (e.key === " ") shootBullet(); // Fire a bullet on spacebar
});

window.addEventListener("keyup", function (e) {
  if (e.key === "ArrowLeft") spaceship.movingLeft = false;
  if (e.key === "ArrowRight") spaceship.movingRight = false;
});

function moveSpaceship() {
  if (spaceship.movingLeft && spaceship.x > 0) {
    spaceship.x -= spaceship.speed;
  }
  if (spaceship.movingRight && spaceship.x < canvas.width - spaceship.width) {
    spaceship.x += spaceship.speed;
  }
}

// Draw the UFO spaceship
function drawUFO() {
  // Draw the UFO body (base)
  ctx.fillStyle = "silver";
  ctx.beginPath();
  ctx.ellipse(
    spaceship.x + spaceship.width / 2,
    spaceship.y + spaceship.height / 2,
    40,
    20,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.closePath();

  // Draw the dome (top)
  ctx.fillStyle = "lightblue";
  ctx.beginPath();
  ctx.arc(
    spaceship.x + spaceship.width / 2,
    spaceship.y + spaceship.height / 2 - 10,
    15,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.closePath();

  // Draw lights on the UFO base
  ctx.fillStyle = "yellow";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(
      spaceship.x + 10 + i * 15,
      spaceship.y + spaceship.height - 5,
      5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }
}

// Retro Night Sky Background
function createStars() {
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
    });
  }
}

function drawStars() {
  ctx.fillStyle = "white";
  for (let star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Bullets
function shootBullet() {
  bullets.push({
    x: spaceship.x + spaceship.width / 2 - 2.5, // Center of the UFO
    y: spaceship.y,
    width: 5,
    height: 10,
    speed: 8,
  });
}

function drawBullets() {
  ctx.fillStyle = "red";
  for (let bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function moveBullets() {
  for (let bullet of bullets) {
    bullet.y -= bullet.speed; // Move the bullet upwards
  }

  // Remove bullets that go off the screen
  bullets = bullets.filter((bullet) => bullet.y > 0);
}

// Aliens with random colors and new shapes
function createAliens() {
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      // Generate a random color for each alien
      let color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;

      aliens.push({
        x: col * 80 + 50,
        y: row * 60 + 30,
        width: 40,
        height: 40,
        color: color, // Assign random color to the alien
        destroyed: false,
      });
    }
  }
}

function drawAliens() {
  for (let alien of aliens) {
    if (!alien.destroyed) {
      // Alien body (circle)
      ctx.fillStyle = alien.color;
      ctx.beginPath();
      ctx.arc(
        alien.x + alien.width / 2,
        alien.y + alien.height / 2,
        alien.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.closePath();

      // Alien antenna (lines)
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(alien.x + alien.width / 2 - 10, alien.y); // Left antenna
      ctx.lineTo(alien.x + alien.width / 2 - 20, alien.y - 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(alien.x + alien.width / 2 + 10, alien.y); // Right antenna
      ctx.lineTo(alien.x + alien.width / 2 + 20, alien.y - 20);
      ctx.stroke();

      // Alien eyes (small circles)
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        alien.x + alien.width / 2 - 10,
        alien.y + alien.height / 2 - 5,
        5,
        0,
        Math.PI * 2
      ); // Left eye
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        alien.x + alien.width / 2 + 10,
        alien.y + alien.height / 2 - 5,
        5,
        0,
        Math.PI * 2
      ); // Right eye
      ctx.fill();
    }
  }
}

function moveAliens() {
  for (let alien of aliens) {
    alien.x += alienSpeed * alienDirection;
  }

  // Reverse direction and drop down if aliens hit the edge of the screen
  let hitEdge = aliens.some(
    (alien) =>
      (alien.x <= 0 && !alien.destroyed) ||
      (alien.x + alien.width >= canvas.width && !alien.destroyed)
  );
  if (hitEdge) {
    alienDirection *= -1; // Reverse direction
    for (let alien of aliens) {
      alien.y += 40; // Move the aliens down
    }
  }
}

function detectCollisions() {
  for (let bullet of bullets) {
    for (let alien of aliens) {
      if (
        !alien.destroyed &&
        bullet.x < alien.x + alien.width &&
        bullet.x + bullet.width > alien.x &&
        bullet.y < alien.y + alien.height &&
        bullet.y + bullet.height > alien.y
      ) {
        // Collision detected
        alien.destroyed = true;
        bullet.y = -10; // Move the bullet off-screen
        score += 10;
      }
    }
  }
}

// Game Over and Victory
function checkGameOver() {
  for (let alien of aliens) {
    if (!alien.destroyed && alien.y + alien.height >= spaceship.y) {
      gameOver = true;
    }
  }

  if (aliens.every((alien) => alien.destroyed)) {
    displayRestartButton();
  }

  if (gameOver) {
    displayRestartButton();
  }
}

function displayRestartButton() {
  restartButton.style.display = "block"; // Show the restart button
}

function restartGame() {
  document.location.reload(); // Reload the page to restart the game
}

// Main Game Loop
function gameLoop() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    drawStars(); // Draw the retro night sky background

    moveSpaceship();
    moveBullets();
    moveAliens();
    detectCollisions();
    checkGameOver();

    drawUFO(); // Draw UFO
    drawBullets();
    drawAliens(); // Draw updated alien shapes

    requestAnimationFrame(gameLoop); // Loop the game
  }
}

// Initialize the game
createStars(); // Create stars for background
createAliens(); // Create aliens
gameLoop(); // Start the game
