const searchInput = document.getElementById("searchInput");
const cards = [...document.querySelectorAll(".game-card")];
const noGames = document.getElementById("noGames");
let activeCategory = "All";

function filterGames() {
  const term = searchInput.value.toLowerCase().trim();
  let count = 0;
  cards.forEach(card => {
    const matchesTerm = card.dataset.name.toLowerCase().includes(term) || card.textContent.toLowerCase().includes(term);
    const matchesCategory = activeCategory === "All" || card.dataset.category === activeCategory;
    const show = matchesTerm && matchesCategory;
    card.hidden = !show;
    if (show) count++;
  });
  noGames.hidden = count !== 0;
}
searchInput.addEventListener("input", filterGames);
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  activeCategory = btn.dataset.category;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === btn));
  filterGames();
}));

const modal = document.getElementById("gameModal");
const area = document.getElementById("gameArea");
const title = document.getElementById("gameTitle");
let cleanupGame = () => {};
function closeGame() {
  cleanupGame();
  cleanupGame = () => {};
  modal.classList.remove("show");
  area.innerHTML = "";
}
document.getElementById("closeGame").addEventListener("click", closeGame);
modal.addEventListener("click", e => { if (e.target === modal) closeGame(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("show")) closeGame(); });

const gameTitles = {
  racing:"Speed Racer", basketball:"Basketball Challenge", memory:"Gem Match",
  clicker:"Alien Clicker", space:"Space Dodge", number:"Number Mystery",
  snake:"Snake Trail", tictactoe:"Tic-Tac-Toe", reaction:"Reaction Test", color:"Color Match", word:"Word Scramble", pong:"Pixel Pong", stars:"Star Catch"
};
document.querySelectorAll(".play-game").forEach(btn => btn.addEventListener("click", () => {
  closeGame();
  title.textContent = gameTitles[btn.dataset.game];
  modal.classList.add("show");
  const launch = {
    racing:()=>driveGame(false), space:()=>driveGame(true), basketball:basketballGame,
    memory:memoryGame, clicker:clickerGame, number:numberGame, snake:snakeGame,
    tictactoe:ticTacToe, reaction:reactionGame, color:colorGame, word:wordScramble, pong:pixelPong, stars:starCatch
  };
  launch[btn.dataset.game]();
}));

function basketballGame() {
  let score = 0, attempts = 0, target = 0, direction = 1, timer = null, playing = true;
  area.innerHTML = `<p>Press SHOOT when the moving marker is inside the bright target zone.</p>
    <p class="game-status">Score: <b id="hoopScore">0</b> · Shots: <b id="hoopShots">0</b></p>
    <div style="height:30px;background:#263a5a;border-radius:20px;position:relative;margin:25px 0;overflow:hidden">
      <div style="position:absolute;left:42%;width:16%;height:100%;background:#28d8a0;opacity:.85"></div>
      <div id="hoopMarker" style="position:absolute;left:0;width:12px;height:100%;background:#fff;box-shadow:0 0 12px #fff"></div>
    </div><div style="font-size:55px">🏀</div><button id="shootBtn">SHOOT</button><button id="resetHoop">Restart</button><p id="hoopMessage" class="game-status">Get ready!</p>`;
  const marker = document.getElementById("hoopMarker");
  const tick = () => { target += direction * 1.7; if (target > 96 || target < 0) direction *= -1; marker.style.left = target + "%"; };
  timer = setInterval(tick, 20);
  document.getElementById("shootBtn").onclick = () => {
    if (!playing) return;
    attempts++;
    const made = target >= 42 && target <= 58;
    if (made) score++;
    document.getElementById("hoopScore").textContent = score;
    document.getElementById("hoopShots").textContent = attempts;
    document.getElementById("hoopMessage").textContent = made ? "SWISH! Nice timing." : "Just missed. Try again!";
  };
  document.getElementById("resetHoop").onclick = () => { cleanupGame(); basketballGame(); };
  cleanupGame = () => { playing = false; clearInterval(timer); };
}

function memoryGame() {
  const symbols = ["💎","🌟","🪐","🎧","💎","🌟","🪐","🎧"];
  symbols.sort(() => Math.random() - .5);
  let first = null, lock = false, matched = 0, moves = 0;
  area.innerHTML = `<p>Turn over two cards at a time and find all four pairs.</p><p class="game-status">Pairs: <b id="pairs">0</b>/4 · Moves: <b id="moves">0</b></p><div class="memory-grid" id="memoryGrid"></div><button id="memoryRestart">Restart</button>`;
  const grid = document.getElementById("memoryGrid");
  symbols.forEach(symbol => {
    const b = document.createElement("button"); b.textContent = "?"; b.dataset.symbol = symbol;
    b.onclick = () => {
      if (lock || b.disabled || b === first) return;
      b.textContent = symbol; b.disabled = true;
      if (!first) { first = b; return; }
      moves++; document.getElementById("moves").textContent = moves;
      if (first.dataset.symbol === b.dataset.symbol) {
        matched++; document.getElementById("pairs").textContent = matched; first = null;
        if (matched === 4) document.getElementById("memoryRestart").textContent = "You won! Play again";
      } else {
        lock = true; const old = first; setTimeout(() => { old.textContent = "?"; b.textContent = "?"; old.disabled = false; b.disabled = false; first = null; lock = false; }, 750);
      }
    };
    grid.appendChild(b);
  });
  document.getElementById("memoryRestart").onclick = memoryGame;
}

function clickerGame() {
  let score = 0, seconds = 15, active = true;
  area.innerHTML = `<p>Tap the friendly alien as often as you can in 15 seconds.</p><p class="game-status">Time: <b id="alienTime">15</b> · Score: <b id="alienScore">0</b></p><button id="alienTap" style="font-size:58px;padding:15px 28px">👽</button><p id="alienMessage" class="game-status">Ready?</p>`;
  const timer = setInterval(() => {
    seconds--; document.getElementById("alienTime").textContent = seconds;
    if (seconds <= 0) { active = false; clearInterval(timer); document.getElementById("alienTap").disabled = true; document.getElementById("alienMessage").textContent = `Time! Your score: ${score}`; }
  }, 1000);
  document.getElementById("alienTap").onclick = () => { if (!active) return; score++; document.getElementById("alienScore").textContent = score; };
  cleanupGame = () => { active = false; clearInterval(timer); };
}

function numberGame() {
  const secret = 1 + Math.floor(Math.random()*30); let tries = 6;
  area.innerHTML = `<p>Guess the secret number from 1 to 30. You have six tries.</p><input id="guess" type="number" min="1" max="30" placeholder="1–30"><button id="guessBtn">Guess</button><p class="game-status" id="guessMsg">Enter your first guess.</p><button id="guessAgain">New round</button>`;
  document.getElementById("guessBtn").onclick = () => {
    const n = Number(document.getElementById("guess").value), msg = document.getElementById("guessMsg");
    if (!Number.isInteger(n) || n < 1 || n > 30) { msg.textContent = "Enter a whole number from 1 to 30."; return; }
    if (tries <= 0) return;
    tries--;
    if (n === secret) { msg.textContent = "🎉 Correct! You solved it."; tries = 0; }
    else if (tries === 0) msg.textContent = `Round over. The number was ${secret}.`;
    else msg.textContent = `${n < secret ? "Try a higher number." : "Try a lower number."} ${tries} tries left.`;
  };
  document.getElementById("guessAgain").onclick = numberGame;
}

function driveGame(space) {
  area.innerHTML = `<p>Use ← and → keys or the buttons to move. Avoid the obstacles.</p><p class="game-status" id="driveScore">Score: 0</p><canvas class="game-canvas" id="driveCanvas" width="420" height="360"></canvas><button id="driveLeft">← Left</button><button id="driveRight">Right →</button><button id="driveRestart">Restart</button><p id="driveMsg" class="game-status">Good luck!</p>`;
  const c = document.getElementById("driveCanvas"), ctx = c.getContext("2d");
  let x = 210, obstacle = {x:80,y:-40}, score=0, alive=true, raf, left=false, right=false;
  const key = e => { if(e.key==="ArrowLeft") left=true; if(e.key==="ArrowRight") right=true; };
  const keyup = e => { if(e.key==="ArrowLeft") left=false; if(e.key==="ArrowRight") right=false; };
  window.addEventListener("keydown",key); window.addEventListener("keyup",keyup);
  document.getElementById("driveLeft").onpointerdown=()=>left=true; document.getElementById("driveLeft").onpointerup=()=>left=false;
  document.getElementById("driveRight").onpointerdown=()=>right=true; document.getElementById("driveRight").onpointerup=()=>right=false;
  function frame(){
    if(!alive) return;
    ctx.fillStyle="#071326";ctx.fillRect(0,0,420,360);
    ctx.strokeStyle="#315078";ctx.lineWidth=5;ctx.setLineDash([22,18]);ctx.beginPath();ctx.moveTo(210,0);ctx.lineTo(210,360);ctx.stroke();ctx.setLineDash([]);
    if(left)x-=4;if(right)x+=4;x=Math.max(22,Math.min(398,x));
    ctx.font="36px Arial";ctx.textAlign="center";ctx.fillText(space?"🚀":"🏎️",x,315);
    ctx.fillText(space?"☄️":"🚧",obstacle.x,obstacle.y);
    obstacle.y += 3.2 + Math.min(score*.12,4);
    if(obstacle.y>390){obstacle.y=-35;obstacle.x=35+Math.random()*350;score++;document.getElementById("driveScore").textContent="Score: "+score;}
    if(obstacle.y>275 && obstacle.y<330 && Math.abs(x-obstacle.x)<38){alive=false;document.getElementById("driveMsg").textContent="Round over! Your score: "+score;return;}
    raf=requestAnimationFrame(frame);
  }
  document.getElementById("driveRestart").onclick=()=>{cleanupGame();driveGame(space);};
  frame();
  cleanupGame=()=>{alive=false;cancelAnimationFrame(raf);window.removeEventListener("keydown",key);window.removeEventListener("keyup",keyup);};
}

function snakeGame() {
  area.innerHTML = `<p>Use arrow keys. Collect the glowing dots and avoid the walls or your tail.</p><p class="game-status" id="snakeScore">Score: 0</p><canvas class="game-canvas" id="snakeCanvas" width="360" height="360"></canvas><button id="snakeRestart">Restart</button>`;
  const c=document.getElementById("snakeCanvas"),ctx=c.getContext("2d"),cell=18, count=20;
  let body=[{x:9,y:10},{x:8,y:10},{x:7,y:10}],dir={x:1,y:0},food={x:14,y:10},score=0,alive=true,loop;
  const key=e=>{const map={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};const d=map[e.key];if(d&&!(d.x===-dir.x&&d.y===-dir.y)){dir=d;e.preventDefault();}};
  window.addEventListener("keydown",key);
  function draw(){ctx.fillStyle="#071326";ctx.fillRect(0,0,360,360);ctx.fillStyle="#ffcf5a";ctx.fillRect(food.x*cell+3,food.y*cell+3,12,12);body.forEach((p,i)=>{ctx.fillStyle=i?"#1dbd9b":"#83ffd7";ctx.fillRect(p.x*cell+1,p.y*cell+1,16,16);});}
  function step(){if(!alive)return;const head={x:body[0].x+dir.x,y:body[0].y+dir.y};if(head.x<0||head.y<0||head.x>=count||head.y>=count||body.some(p=>p.x===head.x&&p.y===head.y)){alive=false;document.getElementById("snakeScore").textContent="Game over — score: "+score;clearInterval(loop);return;}body.unshift(head);if(head.x===food.x&&head.y===food.y){score++;document.getElementById("snakeScore").textContent="Score: "+score;food={x:Math.floor(Math.random()*count),y:Math.floor(Math.random()*count)};}else body.pop();draw();}
  draw();loop=setInterval(step,125);document.getElementById("snakeRestart").onclick=()=>{cleanupGame();snakeGame();};
  cleanupGame=()=>{alive=false;clearInterval(loop);window.removeEventListener("keydown",key);};
}

function ticTacToe() {
  let board=Array(9).fill(""),turn="X",finished=false;
  area.innerHTML=`<p>Take turns with a friend on the same device.</p><p id="ticStatus" class="game-status">Player X's turn</p><div class="tic-grid" id="ticGrid"></div><button id="ticReset">New game</button>`;
  const grid=document.getElementById("ticGrid");
  const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  board.forEach((_,i)=>{const b=document.createElement("button");b.textContent="";b.onclick=()=>{if(finished||board[i])return;board[i]=turn;b.textContent=turn;b.style.color=turn==="X"?"#8feeff":"#ff8ad7";const won=wins.some(line=>line.every(n=>board[n]===turn));if(won){finished=true;document.getElementById("ticStatus").textContent=`Player ${turn} wins!`; }else if(board.every(Boolean)){finished=true;document.getElementById("ticStatus").textContent="It's a draw!";}else{turn=turn==="X"?"O":"X";document.getElementById("ticStatus").textContent=`Player ${turn}'s turn`;}};grid.appendChild(b);});
  document.getElementById("ticReset").onclick=ticTacToe;
}

function reactionGame() {
  let timeout,started=0,state="ready";
  area.innerHTML=`<p>Press Start, wait until the panel turns green, then click as quickly as you can.</p><button id="reactionPanel" style="display:block;width:100%;min-height:150px;font-size:22px;background:#23436a">Press Start</button><p id="reactionResult" class="game-status">Your time will appear here.</p>`;
  const panel=document.getElementById("reactionPanel"),result=document.getElementById("reactionResult");
  panel.onclick=()=>{
    if(state==="ready"){state="waiting";panel.textContent="Wait for green…";panel.style.background="#a65b35";timeout=setTimeout(()=>{state="go";started=performance.now();panel.textContent="CLICK NOW!";panel.style.background="#159b70";},1200+Math.random()*2600);}
    else if(state==="waiting"){clearTimeout(timeout);state="ready";panel.textContent="Too soon! Press to try again.";panel.style.background="#23436a";result.textContent="Wait until the panel turns green.";}
    else if(state==="go"){const ms=Math.round(performance.now()-started);state="ready";panel.textContent="Nice! Press to try again.";panel.style.background="#23436a";result.textContent=`Your reaction time: ${ms} ms.`;}
  };
  cleanupGame=()=>clearTimeout(timeout);
}

function colorGame() {
  const palette=["#20d9ff","#ff4f9a","#ffd34d","#a777ff","#55e58a","#ff874d"];
  let target=palette[Math.floor(Math.random()*palette.length)],round=1,points=0;
  area.innerHTML=`<p>Look at the target colour, then select the matching tile below.</p><div id="targetColor" style="width:100px;height:65px;border-radius:12px;margin:18px auto;background:${target};box-shadow:0 0 25px ${target}"></div><p class="game-status">Round <b id="colorRound">1</b>/8 · Score <b id="colorScore">0</b></p><div class="color-options" id="colorOptions"></div><p id="colorMsg" class="game-status">Choose the matching colour.</p>`;
  function newRound(){target=palette[Math.floor(Math.random()*palette.length)];document.getElementById("targetColor").style.background=target;document.getElementById("targetColor").style.boxShadow=`0 0 25px ${target}`;const opts=[...palette].sort(()=>Math.random()-.5);const box=document.getElementById("colorOptions");box.innerHTML="";opts.forEach(color=>{const b=document.createElement("button");b.style.background=color;b.setAttribute("aria-label","Choose colour");b.onclick=()=>{if(round>8)return;if(color===target){points++;document.getElementById("colorMsg").textContent="Correct!";}else document.getElementById("colorMsg").textContent="Not that one — next round!";round++;document.getElementById("colorRound").textContent=Math.min(round,8);document.getElementById("colorScore").textContent=points;if(round<=8)setTimeout(newRound,450);else document.getElementById("colorMsg").textContent=`Finished! You scored ${points}/8.`;};box.appendChild(b);});}
  newRound();
}


function wordScramble() {
  const words=["GALAXY","ARCADE","ROCKET","PLAYER","PUZZLE","PLANET","RACING","VICTORY"];
  let word="",round=0,score=0;
  area.innerHTML=`<p>Unscramble the letters. You have 8 rounds.</p><p class="game-status">Round <b id="wordRound">1</b>/8 · Score <b id="wordScore">0</b></p><h2 id="scrambled" style="letter-spacing:8px;font-size:32px;margin:20px">READY</h2><input id="wordGuess" maxlength="12" placeholder="Your answer"><button id="wordSubmit">Check</button><p id="wordMsg" class="game-status">Type the correct word.</p><button id="wordNext">New word</button>`;
  const next=()=>{word=words[Math.floor(Math.random()*words.length)];let mixed=word.split("").sort(()=>Math.random()-.5).join("");if(mixed===word)mixed=word.slice(1)+word[0];document.getElementById("scrambled").textContent=mixed;document.getElementById("wordGuess").value="";document.getElementById("wordRound").textContent=Math.min(round+1,8);};
  const submit=()=>{if(round>=8)return;const guess=document.getElementById("wordGuess").value.trim().toUpperCase();if(!guess)return;round++;if(guess===word){score++;document.getElementById("wordMsg").textContent="Correct! Great work.";}else document.getElementById("wordMsg").textContent=`Not quite — the word was ${word}.`;document.getElementById("wordScore").textContent=score;if(round<8)setTimeout(next,650);else document.getElementById("wordMsg").textContent=`Finished! You scored ${score}/8.`;};
  document.getElementById("wordSubmit").onclick=submit;document.getElementById("wordGuess").addEventListener("keydown",e=>{if(e.key==="Enter")submit();});document.getElementById("wordNext").onclick=()=>{if(round<8)next();};next();
}

function pixelPong() {
  area.innerHTML=`<p>Move your paddle with the mouse, touch or ↑ and ↓ keys. Keep the ball in play!</p><p class="game-status" id="pongScore">Score: 0</p><canvas id="pongCanvas" class="game-canvas" width="420" height="300"></canvas><button id="pongRestart">Restart</button>`;
  const c=document.getElementById("pongCanvas"),ctx=c.getContext("2d");let py=120,by=150,bx=210,vx=3.2,vy=2.1,score=0,alive=true,raf;
  const move=e=>{const r=c.getBoundingClientRect();py=Math.max(0,Math.min(240,(e.clientY-r.top)*300/r.height-30));};
  const key=e=>{if(e.key==="ArrowUp")py=Math.max(0,py-18);if(e.key==="ArrowDown")py=Math.min(240,py+18);};c.addEventListener("pointermove",move);window.addEventListener("keydown",key);
  function frame(){if(!alive)return;ctx.fillStyle="#070b20";ctx.fillRect(0,0,420,300);ctx.fillStyle="#a800ff";ctx.fillRect(18,py,12,60);ctx.fillStyle="#35ddff";ctx.fillRect(390,120,12,60);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(bx,by,8,0,Math.PI*2);ctx.fill();bx+=vx;by+=vy;if(by<8||by>292)vy*=-1;if(bx<34&&by>py-5&&by<py+65){vx=Math.abs(vx)*1.04;score++;document.getElementById("pongScore").textContent="Score: "+score;}if(bx>382&&by>115&&by<185)vx=-Math.abs(vx);if(bx<0||bx>430){alive=false;document.getElementById("pongScore").textContent="Game over — score: "+score;return;}raf=requestAnimationFrame(frame);}frame();
  document.getElementById("pongRestart").onclick=()=>{cleanupGame();pixelPong();};cleanupGame=()=>{alive=false;cancelAnimationFrame(raf);c.removeEventListener("pointermove",move);window.removeEventListener("keydown",key);};
}

function starCatch() {
  area.innerHTML=`<p>Click the falling stars before they reach the bottom. You have 20 seconds!</p><p class="game-status">Time: <b id="starTime">20</b> · Stars: <b id="starScore">0</b></p><div id="starField" style="height:260px;position:relative;overflow:hidden;border:1px solid #63408d;border-radius:12px;background:radial-gradient(circle,#291052,#070b20)"></div><button id="starRestart">Play again</button>`;
  let score=0,seconds=20,active=true,spawn,tick;const field=document.getElementById("starField");
  function makeStar(){if(!active)return;const b=document.createElement("button");b.textContent="★";b.setAttribute("aria-label","Catch star");b.style.cssText=`position:absolute;top:0;left:${Math.random()*88+2}%;font-size:27px;color:#ffe26d;background:transparent;padding:0;border:0;`;field.appendChild(b);let y=0;const fall=setInterval(()=>{y+=4;b.style.top=y+"px";if(y>255){clearInterval(fall);b.remove();}},45);b.onclick=()=>{if(!active)return;score++;document.getElementById("starScore").textContent=score;clearInterval(fall);b.remove();};}
  spawn=setInterval(makeStar,650);tick=setInterval(()=>{seconds--;document.getElementById("starTime").textContent=seconds;if(seconds<=0){active=false;clearInterval(spawn);clearInterval(tick);field.innerHTML=`<h2 style="padding-top:90px">Time's up! ⭐</h2><p>You caught ${score} stars.</p>`;}},1000);makeStar();
  document.getElementById("starRestart").onclick=()=>{cleanupGame();starCatch();};cleanupGame=()=>{active=false;clearInterval(spawn);clearInterval(tick);};
}

// Gentle original synth notes; starts only after a visitor clicks the music button.
let audioCtx=null,musicTimer=null,musicOn=false;
const musicButton=document.getElementById("musicButton");
function toggleMusic(){
  if(musicOn){clearInterval(musicTimer);musicOn=false;musicButton.textContent="♫ Music: OFF";musicButton.setAttribute("aria-pressed","false");return;}
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC){musicButton.textContent="Music unavailable";return;}
  audioCtx=audioCtx||new AC();audioCtx.resume();
  const notes=[261.63,329.63,392,329.63,293.66,349.23,440,349.23];let i=0;
  function note(freq,duration,volume,type){const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(volume,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}
  musicTimer=setInterval(()=>{note(notes[i%notes.length],.75,.035,"triangle");note(notes[i%notes.length]/2,1,.018,"sine");i++;},650);
  musicOn=true;musicButton.textContent="♫ Music: ON";musicButton.setAttribute("aria-pressed","true");
}
musicButton.addEventListener("click",toggleMusic);
