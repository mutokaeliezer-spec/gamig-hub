
const searchInput = document.getElementById("searchInput");
const gameCards = document.querySelectorAll(".game-card");
const gameGrid = document.getElementById("gameGrid");
const noGames = document.getElementById("noGames");

let selectedCategory = "All";

// SEARCH GAMES
function filterGames() {
    const search = searchInput.value.toLowerCase();
    let visible = 0;

    gameCards.forEach(card => {
        const name = card.innerText.toLowerCase();
        const category = card.dataset.category;

        const matchesSearch = name.includes(search);
        const matchesCategory =
            selectedCategory === "All" ||
            category === selectedCategory;

        const show = matchesSearch && matchesCategory;

        card.style.display = show ? "" : "none";

        if (show) visible++;
    });

    noGames.hidden = visible !== 0;
}

searchInput.addEventListener("input", filterGames);

// CATEGORY FILTERS
document.querySelectorAll(".category-list button").forEach(button => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        document.querySelectorAll(".category-list button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");
        filterGames();
    });
});


// GAME WINDOW
const modal = document.getElementById("gameModal");
const gameArea = document.getElementById("gameArea");
const gameTitle = document.getElementById("gameTitle");

document.getElementById("closeGame").addEventListener("click", closeGame);

function closeGame() {
    modal.classList.remove("show");
    gameArea.innerHTML = "";
}

function openGame(title) {
    gameTitle.textContent = title;
    modal.classList.add("show");
}

document.querySelectorAll(".game-button").forEach(button => {
    button.addEventListener("click", () => {
        const game = button.dataset.game;

        const titles = {
            racing: "🏎️ Speed Racer",
            basketball: "🏀 Basketball Challenge",
            memory: "🧩 Memory Master",
            clicker: "👾 Alien Clicker",
            space: "🚀 Space Adventure",
            number: "🔢 Number Mystery"
        };

        openGame(titles[game]);

        if (game === "racing") racingGame();
        if (game === "basketball") basketballGame();
        if (game === "memory") memoryGame();
        if (game === "clicker") clickerGame();
        if (game === "space") spaceGame();
        if (game === "number") numberGame();
    });
});


// BASKETBALL GAME
function basketballGame() {
    let score = 0;

    gameArea.innerHTML = `
        <h3>Score as many baskets as you can!</h3>
        <p>Score: <strong id="basketScore">0</strong></p>
        <div style="font-size:100px;margin:20px">🏀</div>
        <button id="shootButton">SHOOT THE BALL 🏀</button>
        <p id="basketMessage">Tap the button to shoot!</p>
    `;

    document.getElementById("shootButton").onclick = () => {
        score++;
        document.getElementById("basketScore").textContent = score;
        document.getElementById("basketMessage").textContent =
            "Great shot! Keep going!";
    };
}


// ALIEN CLICKER
function clickerGame() {
    let score = 0;
    let time = 15;
    let active = true;

    gameArea.innerHTML = `
        <h3>Catch the aliens!</h3>
        <p>Time: <span id="clickTime">15</span> seconds</p>
        <p>Score: <span id="clickScore">0</span></p>
        <button id="alienButton" style="font-size:45px">👾</button>
        <p id="clickMessage">Click the alien!</p>
    `;

    const timer = setInterval(() => {
        if (!active) {
            clearInterval(timer);
            return;
        }

        time--;
        document.getElementById("clickTime").textContent = time;

        if (time <= 0) {
            active = false;
            document.getElementById("clickMessage").textContent =
                "Game over! Your score: " + score;
            document.getElementById("alienButton").disabled = true;
        }
    }, 1000);

    document.getElementById("alienButton").onclick = () => {
        if (!active) return;

        score++;
        document.getElementById("clickScore").textContent = score;
    };
}


// MEMORY MASTER
function memoryGame() {
    const symbols = ["🚀","🏀","🎮","⭐","🚀","🏀","🎮","⭐"];
    const shuffled = symbols.sort(() => Math.random() - 0.5);

    let first = null;
    let second = null;
    let locked = false;
    let matches = 0;

    gameArea.innerHTML = `
        <h3>Find matching pictures!</h3>
        <p>Matches: <span id="matchScore">0</span>/4</p>
        <div class="memory-grid" id="memoryGrid"></div>
    `;

    const grid = document.getElementById("memoryGrid");

    shuffled.forEach((symbol, index) => {
        const card = document.createElement("button");
        card.className = "memory-card";
        card.textContent = "❔";

        card.onclick = () => {
            if (locked || card.textContent !== "❔") return;

            card.textContent = symbol;

            if (!first) {
                first = card;
                return;
            }

            second = card;
            locked = true;

            if (first.textContent === second.textContent) {
                matches++;
                document.getElementById("matchScore").textContent = matches;
                first = null;
                second = null;
                locked = false;

                if (matches === 4) {
                    setTimeout(() => {
                        if (modal.classList.contains("show")) {
                            gameArea.innerHTML = "<h2>🏆 YOU WIN!</h2>";
                        }
                    }, 300);
                }
            } else {
                setTimeout(() => {
                    if (modal.classList.contains("show")) {
                        first.textContent = "❔";
                        second.textContent = "❔";
                    }

                    first = null;
                    second = null;
                    locked = false;
                }, 800);
            }
        };

        grid.appendChild(card);
    });
}


// NUMBER MYSTERY
function numberGame() {
    const secret = Math.floor(Math.random() * 20) + 1;
    let attempts = 5;

    gameArea.innerHTML = `
        <h3>Guess a number between 1 and 20!</h3>
        <p>You have 5 attempts.</p>
        <input type="number" id="numberGuess" min="1" max="20">
        <button id="guessButton">GUESS</button>
        <p id="guessMessage">Good luck!</p>
    `;

    document.getElementById("guessButton").onclick = () => {
        const guess = Number(document.getElementById("numberGuess").value);
        const message = document.getElementById("guessMessage");

        if (!Number.isInteger(guess) || guess < 1 || guess > 20) {
            message.textContent = "Enter a number from 1 to 20.";
            return;
        }

        if (attempts <= 0) return;

        attempts--;

        if (guess === secret) {
            message.textContent = "🎉 Correct! You won!";
            return;
        }

        if (attempts === 0) {
            message.textContent = "Game over! The number was " + secret;
            return;
        }

        message.textContent =
            (guess < secret ? "Too low!" : "Too high!") +
            " Attempts left: " + attempts;
    };
}


// SIMPLE RACING AND SPACE GAME
function arcadeDriving(space = false) {
    gameArea.innerHTML = `
        <h3>${space ? "Avoid the asteroids!" : "Avoid the obstacles!"}</h3>
        <p>Move with the arrow keys or buttons.</p>
        <canvas id="gameCanvas" width="360" height="400"></canvas>
        <div>
            <button id="leftMove">⬅️ LEFT</button>
            <button id="rightMove">RIGHT ➡️</button>
        </div>
        <p id="driveScore">Score: 0</p>
        <button id="restartDrive">RESTART</button>
    `;

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    let player = 180;
    let obstacle = { x: 90, y: -30 };
    let score = 0;
    let running = true;
    let animation;

    function move(direction) {
        player = Math.max(20, Math.min(340, player + direction));
    }

    document.getElementById("leftMove").onclick = () => move(-35);
    document.getElementById("rightMove").onclick = () => move(35);

    function keyMove(event) {
        if (event.key === "ArrowLeft") move(-25);
        if (event.key === "ArrowRight") move(25);
    }

    window.addEventListener("keydown", keyMove);

    function draw() {
        if (!running || !modal.classList.contains("show")) {
            cancelAnimationFrame(animation);
            window.removeEventListener("keydown", keyMove);
            return;
        }

        ctx.clearRect(0, 0, 360, 400);

        ctx.fillStyle = "#14294c";
        ctx.fillRect(0, 0, 360, 400);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(178, 0, 4, 400);

        ctx.font = "35px Arial";
        ctx.fillText(space ? "🚀" : "🏎️", player - 18, 350);

        ctx.fillText(space ? "☄️" : "🚧", obstacle.x, obstacle.y);

        obstacle.y += 4;

        if (obstacle.y > 400) {
            obstacle.y = -35;
            obstacle.x = 30 + Math.random() * 280;
            score++;
            document.getElementById("driveScore").textContent =
                "Score: " + score;
        }

        if (
            obstacle.y > 310 &&
            obstacle.y < 365 &&
            Math.abs(player - obstacle.x) < 35
        ) {
            running = false;
            ctx.font = "25px Arial";
            ctx.fillStyle = "#ffffff";
            ctx.fillText("GAME OVER!", 105, 200);
            window.removeEventListener("keydown", keyMove);
            return;
        }

        animation = requestAnimationFrame(draw);
    }

    document.getElementById("restartDrive").onclick = () => {
        running = false;
        cancelAnimationFrame(animation);
        window.removeEventListener("keydown", keyMove);
        arcadeDriving(space);
    };

    draw();
}

function racingGame() {
    arcadeDriving(false);
}

function spaceGame() {
    arcadeDriving(true);
}


// ORIGINAL INSTRUMENTAL BACKGROUND MUSIC
let audioContext;
let musicInterval;
let musicPlaying = false;

const musicButton = document.getElementById("musicButton");

function startMusic() {
    const AudioContext = window.AudioContext ||
                         window.webkitAudioContext;

    if (!AudioContext) return;

    if (!audioContext) {
        audioContext = new AudioContext();
    }

    audioContext.resume();

    const notes = [261.63, 329.63, 392, 329.63,
                   293.66, 349.23, 440, 349.23];

    let note = 0;

    function playNote(frequency, duration, volume, type) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gain.gain.setValueAtTime(volume, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + duration
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + duration);
    }

    musicInterval = setInterval(() => {
        const frequency = notes[note % notes.length];

        playNote(frequency, 0.7, 0.045, "triangle");
        playNote(frequency / 2, 1, 0.025, "sine");

        note++;
    }, 650);

    musicPlaying = true;
    musicButton.textContent = "♪ Music: ON";
}

function stopMusic() {
    clearInterval(musicInterval);
    musicPlaying = false;
    musicButton.textContent = "♪ Music: OFF";
}

musicButton.addEventListener("click", () => {
    if (musicPlaying) {
        stopMusic();
    } else {
        startMusic();
    }
});


// CLOSE WINDOW BY CLICKING OUTSIDE
modal.addEventListener("click", event => {
    if (event.target === modal) closeGame();
});

