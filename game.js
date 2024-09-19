// Select the canvas element and set its size
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game Variables
let spaceship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 50,
  speed: 10,
  movingLeft: false,
  movingRight: false,
};

let bullets = [];
let aliens = [];
let alienRows = 3;
let alienCols = 7;
let alienSpeed = 2;
let alienDirection = 1; // 1 = right, -1 = left
let gameOver = false;
let score = 0;

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

function drawSpaceship() {
  ctx.fillStyle = "white";
  ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

// Bullets
function shootBullet() {
  bullets.push({
    x: spaceship.x + spaceship.width / 2 - 2.5, // Center of the spaceship
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

// Aliens
function createAliens() {
  for (let row = 0; row < alienRows; row++) {
    for (let col = 0; col < alienCols; col++) {
      aliens.push({
        x: col * 80 + 50,
        y: row * 60 + 30,
        width: 40,
        height: 40,
        destroyed: false,
      });
    }
  }
}

function drawAliens() {
  ctx.fillStyle = "green";
  for (let alien of aliens) {
    if (!alien.destroyed) {
      ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
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
    alert("You Win! Score: " + score);
    document.location.reload();
  }

  if (gameOver) {
    alert("Game Over! Score: " + score);
    document.location.reload();
  }
}

// Main Game Loop
function gameLoop() {
  if (!gameOver) {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    moveSpaceship();
    moveBullets();
    moveAliens();
    detectCollisions();
    checkGameOver();

    drawSpaceship();
    drawBullets();
    drawAliens();

    requestAnimationFrame(gameLoop); // Loop the game
  }
}

// Initialize the game
createAliens();
gameLoop();
