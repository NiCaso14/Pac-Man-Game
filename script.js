// Tamaño del mapa: 28x31 celdas como Pac-Man original
const COLS = 28;
const ROWS = 31;
const CELL = 16;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const pacmanColor = '#ffe600';
const wallColor = '#3333ff';
const pelletColor = '#fff';
const ghostColors = ['#ff5fa3', '#5fffd7'];

let map = [];
let pellets = [];
let score = 0;

// Mapa simple (paredes = 1, camino = 0, pellet = .)
function initMap() {
  // Mapa básico con bordes y caminos centrales
  // Puedes mejorar el mapa agregando más paredes
  map = [];
  pellets = [];
  for (let y = 0; y < ROWS; y++) {
    map[y] = [];
    for (let x = 0; x < COLS; x++) {
      if (y === 0 || y === ROWS-1 || x === 0 || x === COLS-1) {
        map[y][x] = 1; // pared
      } else {
        map[y][x] = 0; // camino
        pellets.push({x, y});
      }
    }
  }
  // Entrada y salida en el centro
  for(let x = 12; x < 16; x++) {
    map[15][x] = 0;
  }
}

const pacman = {
  x: 14,
  y: 23,
  dx: 0,
  dy: 0,
  dir: 'left',
};

const ghosts = [
  { x: 13, y: 15, dx: 1, dy: 0, color: ghostColors[0], scatter: false },
  { x: 14, y: 15, dx: -1, dy: 0, color: ghostColors[1], scatter: false }
];

function drawMap() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (map[y][x] === 1) {
        ctx.fillStyle = wallColor;
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
    }
  }
}

function drawPellets() {
  ctx.fillStyle = pelletColor;
  pellets.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x * CELL + CELL/2, p.y * CELL + CELL/2, 3, 0, 2 * Math.PI);
    ctx.fill();
  });
}

function drawPacman() {
  ctx.save();
  ctx.translate(pacman.x * CELL + CELL/2, pacman.y * CELL + CELL/2);
  ctx.rotate({
    'right': 0,
    'down': Math.PI/2,
    'left': Math.PI,
    'up': -Math.PI/2
  }[pacman.dir]);
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.arc(0, 0, 7, Math.PI/6, 2*Math.PI - Math.PI/6);
  ctx.lineTo(0,0);
  ctx.fillStyle = pacmanColor;
  ctx.fill();
  ctx.restore();
}

function drawGhosts() {
  ghosts.forEach(g => {
    ctx.beginPath();
    ctx.arc(g.x * CELL + CELL/2, g.y * CELL + CELL/2, 7, 0, 2 * Math.PI);
    ctx.fillStyle = g.color;
    ctx.fill();
    // ojos
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.x * CELL + CELL/2 - 2, g.y * CELL + CELL/2 - 2, 2, 0, 2*Math.PI);
    ctx.arc(g.x * CELL + CELL/2 + 2, g.y * CELL + CELL/2 - 2, 2, 0, 2*Math.PI);
    ctx.fill();
  });
}

function drawScore() {
  ctx.font = '18px Arial';
  ctx.fillStyle = '#fff';
  ctx.fillText('Puntos: ' + score, 10, 26);
}

function updatePacman() {
  let nx = pacman.x + pacman.dx;
  let ny = pacman.y + pacman.dy;
  if (map[ny] && map[ny][nx] === 0) {
    pacman.x = nx;
    pacman.y = ny;
  }
  // Come pellet
  for (let i = pellets.length-1; i >= 0; i--) {
    if (pellets[i].x === pacman.x && pellets[i].y === pacman.y) {
      pellets.splice(i, 1);
      score += 10;
    }
  }
}

function updateGhosts() {
  ghosts.forEach(g => {
    // Movimiento aleatorio básico
    if (Math.random() < 0.25) {
      let dirs = [
        {dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}
      ];
      let valid = dirs.filter(d => map[g.y+d.dy] && map[g.y+d.dy][g.x+d.dx] === 0);
      if (valid.length) {
        let d = valid[Math.floor(Math.random()*valid.length)];
        g.dx = d.dx;
        g.dy = d.dy;
      }
    }
    let nx = g.x + g.dx;
    let ny = g.y + g.dy;
    if (map[ny] && map[ny][nx] === 0) {
      g.x = nx;
      g.y = ny;
    }
  });
}

function checkCollision() {
  for (let g of ghosts) {
    if (g.x === pacman.x && g.y === pacman.y) {
      alert('¡Has perdido! Puntuación: ' + score);
      resetGame();
      break;
    }
  }
  if (pellets.length === 0) {
    alert('¡Ganaste! Puntuación: ' + score);
    resetGame();
  }
}

function resetGame() {
  score = 0;
  initMap();
  pacman.x = 14; pacman.y = 23; pacman.dx = 0; pacman.dy = 0; pacman.dir = 'left';
  ghosts[0].x = 13; ghosts[0].y = 15;
  ghosts[1].x = 14; ghosts[1].y = 15;
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { pacman.dx = 1; pacman.dy = 0; pacman.dir = 'right'; }
  if (e.key === 'ArrowLeft')  { pacman.dx = -1; pacman.dy = 0; pacman.dir = 'left'; }
  if (e.key === 'ArrowUp')    { pacman.dx = 0; pacman.dy = -1; pacman.dir = 'up'; }
  if (e.key === 'ArrowDown')  { pacman.dx = 0; pacman.dy = 1; pacman.dir = 'down'; }
});

function gameLoop() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  drawMap();
  drawPellets();
  drawPacman();
  drawGhosts();
  drawScore();
  updatePacman();
  updateGhosts();
  checkCollision();
  requestAnimationFrame(gameLoop);
}

initMap();
gameLoop();
