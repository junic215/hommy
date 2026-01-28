document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-btn');
    const scoreEl = document.getElementById('score');

    // Game Constants
    const GROUND_Y = 250;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -10;

    // Game State
    let isPlaying = false;
    let score = 0;
    let frame = 0;
    let obstacles = [];
    let animationId;

    // Dog (Player)
    const dog = {
        x: 40,
        y: GROUND_Y,
        width: 28, // Slightly wider for fluffy poodle
        height: 24,
        dy: 0,
        isJumping: false,
        color: '#E6CEAA' // Apricot/Light Brown (Poodle color)
    };

    // Sprites (Procedural Pixel Art)
    function drawPixelDog(x, y) {
        const mainColor = dog.color;
        const shadowColor = '#D7B48C'; // Darker shade for legs/ears

        // --- Fluffy Body ---
        ctx.fillStyle = mainColor;
        // Main bulk
        ctx.fillRect(x + 4, y + 4, 20, 14);
        // Fluff bumps
        ctx.fillRect(x + 2, y + 6, 2, 10); // Back fluff
        ctx.fillRect(x + 6, y + 2, 16, 2); // Top fluff

        // --- Fluffy Head ---
        // Neck connection
        ctx.fillRect(x + 18, y, 6, 6);
        // Head shape
        ctx.fillRect(x + 16, y - 10, 14, 12);
        // Poodle Topknot (The crown)
        ctx.fillRect(x + 18, y - 12, 10, 4);

        // --- Floppy Ear ---
        ctx.fillStyle = shadowColor;
        ctx.fillRect(x + 14, y - 8, 4, 10); // Ear hanging down

        // --- Tail (Pom Pom) ---
        ctx.fillStyle = mainColor;
        ctx.fillRect(x - 2, y - 2, 6, 6); // Circle-ish tail

        // --- Legs (Animation) ---
        ctx.fillStyle = shadowColor;
        // If running (frame based) or jumping
        const legH = 10;
        const legW = 4;
        const legY = y + 16;

        if (Math.floor(frame / 10) % 2 === 0 || dog.isJumping) {
            // Stride 1
            ctx.fillRect(x + 6, legY, legW, legH); // Back leg
            ctx.fillRect(x + 18, legY, legW, legH); // Front leg
        } else {
            // Stride 2
            ctx.fillRect(x + 4, legY, legW, legH);
            ctx.fillRect(x + 20, legY, legW, legH);
        }

        // --- Face Details ---
        // Eye
        ctx.fillStyle = '#3E2723';
        ctx.fillRect(x + 24, y - 6, 2, 2);
        // Nose
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 29, y - 6, 2, 2);
    }

    function drawObstacle(obs) {
        // Puddle or Rock
        if (obs.type === 'rock') {
            ctx.fillStyle = '#757575'; // Grey rock
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            // Detail
            ctx.fillStyle = '#616161';
            ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
        } else {
            ctx.fillStyle = '#2196F3'; // Blue puddle
            ctx.fillRect(obs.x, obs.y + 10, obs.width, 10);
        }
    }

    function gameLoop() {
        if (!isPlaying) return;

        // Update
        frame++;

        // Generate Obstacles
        if (frame % 120 === 0) { // Every ~2 seconds
            let type = Math.random() > 0.5 ? 'rock' : 'puddle';
            obstacles.push({
                x: canvas.width,
                y: GROUND_Y,
                width: 20,
                height: 20,
                type: type,
                speed: 3 + (score * 0.1) // Speed up slightly over time
            });
        }

        // Physics (Dog)
        if (dog.isJumping) {
            dog.dy += GRAVITY;
            dog.y += dog.dy;

            if (dog.y >= GROUND_Y) {
                dog.y = GROUND_Y;
                dog.isJumping = false;
                dog.dy = 0;
            }
        }

        // Move Obstacles
        obstacles.forEach(obs => {
            obs.x -= obs.speed;
        });

        // Remove off-screen obstacles
        if (obstacles.length > 0 && obstacles[0].x < -50) {
            obstacles.shift();
            score++;
            scoreEl.textContent = `SCORE: ${score}`;
        }

        // Collision Detection
        for (let obs of obstacles) {
            // Simple AABB
            let dogHitbox = { x: dog.x, y: dog.y, w: 28, h: 24 }; // Approximate
            let obsHitbox = { x: obs.x, y: obs.y, w: obs.width, h: obs.height };

            // Adjust puddle hitbox (lower)
            if (obs.type === 'puddle') {
                obsHitbox.y += 10;
                obsHitbox.h = 10;
            }

            if (
                dogHitbox.x < obsHitbox.x + obsHitbox.w &&
                dogHitbox.x + dogHitbox.w > obsHitbox.x &&
                dogHitbox.y < obsHitbox.y + obsHitbox.h &&
                dogHitbox.y + dogHitbox.h > obsHitbox.y
            ) {
                gameOver();
                return;
            }
        }

        // Draw
        draw();
        animationId = requestAnimationFrame(gameLoop);
    }

    function draw() {
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#8D6E63'; // Dirt path
        ctx.fillRect(0, GROUND_Y + 24, canvas.width, canvas.height - (GROUND_Y + 24));
        // Grass top
        ctx.fillStyle = '#66BB6A';
        ctx.fillRect(0, GROUND_Y + 24, canvas.width, 10);

        // Clouds
        ctx.fillStyle = '#fff';
        let cloudX = (frame * 0.5) % (canvas.width + 100) - 50;
        ctx.fillRect(cloudX, 50, 40, 20);
        ctx.fillRect(cloudX + 100, 80, 50, 20);

        // Dog
        drawPixelDog(dog.x, dog.y);

        // Obstacles
        obstacles.forEach(drawObstacle);
    }

    function jump() {
        if (!dog.isJumping && isPlaying) {
            dog.dy = JUMP_FORCE;
            dog.isJumping = true;
        }
    }

    function startGame() {
        if (isPlaying) return;

        // Reset
        dog.y = GROUND_Y;
        dog.dy = 0;
        dog.isJumping = false;
        obstacles = [];
        score = 0;
        frame = 0;
        scoreEl.textContent = `SCORE: 0`;

        isPlaying = true;
        startBtn.textContent = 'JUMP!';
        startBtn.onclick = jump; // Button becomes jump button

        gameLoop();
    }

    function gameOver() {
        isPlaying = false;
        cancelAnimationFrame(animationId);

        // Draw Game Over Text
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '20px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('Try Again?', canvas.width / 2, canvas.height / 2 + 30);

        startBtn.textContent = 'RESTART';
        startBtn.onclick = startGame;
    }

    // Initial Draw
    draw();
    ctx.fillStyle = '#000';
    ctx.font = '16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Press START', canvas.width / 2, canvas.height / 2);

    // Inputs
    startBtn.addEventListener('click', startGame);
    canvas.addEventListener('click', jump);
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            if (!isPlaying && startBtn.textContent !== 'JUMP!') {
                startGame();
            } else {
                jump();
            }
            e.preventDefault();
        }
    });

});
