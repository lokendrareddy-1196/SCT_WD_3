/**
 * Tic-Tac-Toe Modern Web Application
 * 
 * Complete feature set:
 *  - Dynamic Themes (Dark, Neon, Light) with localStorage persistence
 *  - Custom Player Names with auto-save & dynamic UI labels
 *  - Radial Visual Countdown Clock for Turn Timer (PvP)
 *  - Move History with Cell Position Names & Undo Last Move
 *  - Canvas Confetti Particle Burst on Win
 *  - Unbeatable Minimax (Hard), Tactical (Medium), Random (Easy) AI
 *  - Smooth SVG Strike-Through Win Line
 *  - Synthesized Web Audio SFX (Click, Win, Draw, Timer Ticks)
 *  - Arrow-Key Grid Navigation & Keyboard Accessibility
 *  - Smart Share/Copy Result generator
 *  - Draw Auto-Continue Flow vs Modal Win Flow
 */

// ==========================================
// 1. CONSTANTS & CONFIGURATION
// ==========================================

const PLAYER_X = 'X';
const PLAYER_O = 'O';
const TURN_TIME_LIMIT = 15;
const CLOCK_CIRCUMFERENCE = 2 * Math.PI * 14; // ~87.96 for r=14

const CELL_NAMES = [
  'Top-Left',    'Top-Center',    'Top-Right',
  'Mid-Left',    'Center',        'Mid-Right',
  'Bottom-Left', 'Bottom-Center', 'Bottom-Right'
];

// Winning combinations and SVG line stroke coordinates (viewBox 0 0 300 300)
const WINNING_COMBINATIONS = [
  // Rows
  { combo: [0, 1, 2], line: { x1: 20, y1: 50, x2: 280, y2: 50 } },
  { combo: [3, 4, 5], line: { x1: 20, y1: 150, x2: 280, y2: 150 } },
  { combo: [6, 7, 8], line: { x1: 20, y1: 250, x2: 280, y2: 250 } },
  // Columns
  { combo: [0, 3, 6], line: { x1: 50, y1: 20, x2: 50, y2: 280 } },
  { combo: [1, 4, 7], line: { x1: 150, y1: 20, x2: 150, y2: 280 } },
  { combo: [2, 5, 8], line: { x1: 250, y1: 20, x2: 250, y2: 280 } },
  // Diagonals
  { combo: [0, 4, 8], line: { x1: 30, y1: 30, x2: 270, y2: 270 } },
  { combo: [2, 4, 6], line: { x1: 270, y1: 30, x2: 30, y2: 270 } }
];

// ==========================================
// 2. STATE MANAGEMENT
// ==========================================

const gameState = {
  board: Array(9).fill(null),
  currentPlayer: PLAYER_X,
  isGameActive: true,
  isLocked: false,
  mode: 'pvp', // 'pvp' | 'pvc'
  aiDifficulty: 'hard', // 'easy' | 'medium' | 'hard'
  theme: 'dark', // 'dark' | 'neon' | 'light'
  isMuted: false,
  timerEnabled: false,
  timerRemaining: TURN_TIME_LIMIT,
  timerInterval: null,
  names: {
    x: 'Player X',
    o: 'Player O'
  },
  scores: {
    x: 0,
    o: 0,
    draws: 0
  },
  moveHistory: [], // Stack of { player, index, cellName }
  lastWinner: null
};

// ==========================================
// 3. DOM ELEMENTS
// ==========================================

const cells = Array.from(document.querySelectorAll('.cell'));
const statusMessage = document.getElementById('status-message');
const themeSelect = document.getElementById('theme-select');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const soundIcon = document.getElementById('sound-icon');
const modePvpBtn = document.getElementById('mode-pvp');
const modePvcBtn = document.getElementById('mode-pvc');
const difficultyWrapper = document.getElementById('difficulty-wrapper');
const diffButtons = document.querySelectorAll('.diff-btn');
const nameInputX = document.getElementById('name-input-x');
const nameInputO = document.getElementById('name-input-o');
const nameIconO = document.getElementById('name-icon-o');
const timerWrapper = document.getElementById('timer-wrapper');
const timerToggle = document.getElementById('timer-toggle');
const clockContainer = document.getElementById('clock-container');
const clockProgress = document.getElementById('clock-progress');
const clockNumber = document.getElementById('clock-number');

const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreDrawsEl = document.getElementById('score-draws');
const labelXEl = document.getElementById('label-x');
const labelOEl = document.getElementById('label-o');
const cardXEl = document.getElementById('card-x');
const cardOEl = document.getElementById('card-o');

const strikeLine = document.getElementById('strike-line');
const moveHistoryList = document.getElementById('move-history-list');
const undoBtn = document.getElementById('undo-btn');
const restartBtn = document.getElementById('restart-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');

// Result Modal
const resultModal = document.getElementById('result-modal');
const modalBadge = document.getElementById('modal-badge');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalPlayAgainBtn = document.getElementById('modal-play-again-btn');
const modalShareBtn = document.getElementById('modal-share-btn');
const shareBtnText = document.getElementById('share-btn-text');
const modalCloseBtn = document.getElementById('modal-close-btn');

// Confetti Canvas
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;

// ==========================================
// 4. SOUND ENGINE (Web Audio API)
// ==========================================

class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick() {
    if (gameState.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(820, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playWin() {
    if (gameState.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playDraw() {
    if (gameState.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const tones = [440, 329.63];
    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = this.ctx.currentTime + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  playTimerWarning() {
    if (gameState.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }
}

const sounds = new SoundEngine();

// ==========================================
// 5. CONFETTI CELEBRATION ENGINE
// ==========================================

let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
  if (!confettiCanvas) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);

function launchConfetti() {
  if (!confettiCtx) return;
  resizeConfettiCanvas();
  confettiParticles = [];

  const colors = ['#00f2fe', '#ff007f', '#ffd700', '#39ff14', '#6366f1', '#f43f5e'];
  const particleCount = 75;

  for (let i = 0; i < particleCount; i++) {
    confettiParticles.push({
      x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 120,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.8) * 14 - 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
  renderConfetti();
}

function renderConfetti() {
  if (!confettiCtx) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  let activeParticles = 0;

  confettiParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.4; // Gravity
    p.rotation += p.vRot;
    p.opacity -= 0.009;

    if (p.opacity > 0 && p.y < confettiCanvas.height) {
      activeParticles++;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = Math.max(0, p.opacity);
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }
  });

  if (activeParticles > 0) {
    confettiAnimationId = requestAnimationFrame(renderConfetti);
  } else {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiAnimationId = null;
  }
}

// ==========================================
// 6. INITIALIZATION & LOCAL STORAGE
// ==========================================

function initGame() {
  resizeConfettiCanvas();
  loadPreferences();
  setupEventListeners();
  updateThemeUI();
  updateNamesUI();
  updateScoreboardUI();
  updateModeView();
  resetBoard();
}

function loadPreferences() {
  // Theme
  const savedTheme = localStorage.getItem('ttt_theme');
  if (savedTheme && ['dark', 'neon', 'light'].includes(savedTheme)) {
    gameState.theme = savedTheme;
  }

  // Scores
  const savedScores = localStorage.getItem('ttt_scores_v2');
  if (savedScores) {
    try {
      const parsed = JSON.parse(savedScores);
      gameState.scores.x = Number(parsed.x) || 0;
      gameState.scores.o = Number(parsed.o) || 0;
      gameState.scores.draws = Number(parsed.draws) || 0;
    } catch (e) {
      console.error('Error parsing scores:', e);
    }
  }

  // Mute
  const savedMuted = localStorage.getItem('ttt_sound_muted');
  if (savedMuted !== null) {
    gameState.isMuted = savedMuted === 'true';
    updateSoundUI();
  }

  // Player Names
  const savedNameX = localStorage.getItem('ttt_name_x');
  const savedNameO = localStorage.getItem('ttt_name_o');
  if (savedNameX) gameState.names.x = savedNameX;
  if (savedNameO) gameState.names.o = savedNameO;
}

function saveScores() {
  localStorage.setItem('ttt_scores_v2', JSON.stringify(gameState.scores));
}

function updateThemeUI() {
  document.documentElement.setAttribute('data-theme', gameState.theme);
  themeSelect.value = gameState.theme;
}

function updateSoundUI() {
  soundIcon.textContent = gameState.isMuted ? '🔇' : '🔊';
  soundToggleBtn.setAttribute('title', gameState.isMuted ? 'Unmute Sound' : 'Mute Sound');
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================

function setupEventListeners() {
  // Theme Selector
  themeSelect.addEventListener('change', (e) => {
    gameState.theme = e.target.value;
    localStorage.setItem('ttt_theme', gameState.theme);
    updateThemeUI();
  });

  // Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    sounds.init();
    gameState.isMuted = !gameState.isMuted;
    localStorage.setItem('ttt_sound_muted', gameState.isMuted);
    updateSoundUI();
  });

  // Cell clicks & Keyboard navigation
  cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
    cell.addEventListener('keydown', (e) => handleCellKeydown(e, index));
  });

  // Player Names Inputs
  nameInputX.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    gameState.names.x = val || (gameState.mode === 'pvc' ? 'Player' : 'Player X');
    localStorage.setItem('ttt_name_x', val);
    updateNamesUI();
    updateStatusUI();
  });

  nameInputO.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    gameState.names.o = val || (gameState.mode === 'pvc' ? '🤖 AI' : 'Player O');
    localStorage.setItem('ttt_name_o', val);
    updateNamesUI();
    updateStatusUI();
  });

  // Mode Selection
  modePvpBtn.addEventListener('click', () => switchMode('pvp'));
  modePvcBtn.addEventListener('click', () => switchMode('pvc'));

  // Difficulty selection
  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      diffButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
      gameState.aiDifficulty = btn.getAttribute('data-diff');
      resetBoard();
    });
  });

  // Turn Timer Toggle
  timerToggle.addEventListener('change', (e) => {
    gameState.timerEnabled = e.target.checked;
    if (gameState.timerEnabled && gameState.mode === 'pvp') {
      clockContainer.classList.remove('hidden');
      startTurnTimer();
    } else {
      clockContainer.classList.add('hidden');
      stopTurnTimer();
    }
  });

  // Undo button
  undoBtn.addEventListener('click', handleUndo);

  // Restart & Reset Scores
  restartBtn.addEventListener('click', () => resetBoard());
  
  resetScoreBtn.addEventListener('click', () => {
    gameState.scores = { x: 0, o: 0, draws: 0 };
    saveScores();
    updateScoreboardUI();
    resetBoard();
  });

  // Modal actions
  modalPlayAgainBtn.addEventListener('click', () => {
    hideModal();
    resetBoard();
  });

  modalShareBtn.addEventListener('click', handleShareResult);
  modalCloseBtn.addEventListener('click', () => hideModal());

  // First gesture sound init
  document.body.addEventListener('click', () => sounds.init(), { once: true });
}

// ==========================================
// 8. KEYBOARD NAVIGATION
// ==========================================

function handleCellKeydown(e, index) {
  let targetIndex = index;
  const row = Math.floor(index / 3);
  const col = index % 3;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      targetIndex = row > 0 ? index - 3 : index + 6; // wrap or step
      break;
    case 'ArrowDown':
      e.preventDefault();
      targetIndex = row < 2 ? index + 3 : index - 6;
      break;
    case 'ArrowLeft':
      e.preventDefault();
      targetIndex = col > 0 ? index - 1 : index + 2;
      break;
    case 'ArrowRight':
      e.preventDefault();
      targetIndex = col < 2 ? index + 1 : index - 2;
      break;
    case 'Enter':
    case ' ':
      e.preventDefault();
      handleCellClick(index);
      return;
    default:
      return;
  }

  if (cells[targetIndex]) {
    cells[targetIndex].focus();
  }
}

// ==========================================
// 9. MODE & PLAYER NAME MANAGEMENT
// ==========================================

function switchMode(newMode) {
  if (gameState.mode === newMode) return;
  gameState.mode = newMode;
  updateModeView();
  resetBoard();
}

function updateModeView() {
  if (gameState.mode === 'pvp') {
    modePvpBtn.classList.add('active');
    modePvpBtn.setAttribute('aria-checked', 'true');
    modePvcBtn.classList.remove('active');
    modePvcBtn.setAttribute('aria-checked', 'false');

    nameIconO.textContent = 'O';
    nameInputX.placeholder = 'Player X';
    nameInputO.placeholder = 'Player O';

    difficultyWrapper.classList.add('hidden');
    timerWrapper.classList.remove('hidden');
    if (gameState.timerEnabled) clockContainer.classList.remove('hidden');
  } else {
    modePvcBtn.classList.add('active');
    modePvcBtn.setAttribute('aria-checked', 'true');
    modePvpBtn.classList.remove('active');
    modePvpBtn.setAttribute('aria-checked', 'false');

    nameIconO.textContent = '🤖';
    nameInputX.placeholder = 'Player';
    nameInputO.placeholder = '🤖 AI';

    difficultyWrapper.classList.remove('hidden');
    timerWrapper.classList.add('hidden');
    clockContainer.classList.add('hidden');
    stopTurnTimer();
  }
  updateNamesUI();
}

function updateNamesUI() {
  const savedNameX = localStorage.getItem('ttt_name_x');
  const savedNameO = localStorage.getItem('ttt_name_o');

  if (savedNameX) nameInputX.value = savedNameX;
  if (savedNameO) nameInputO.value = savedNameO;

  const displayNameX = gameState.names.x || (gameState.mode === 'pvc' ? '🎮 Player' : '🧑 Player X');
  const displayNameO = gameState.names.o || (gameState.mode === 'pvc' ? '🤖 AI' : '🧑 Player O');

  labelXEl.textContent = displayNameX;
  labelOEl.textContent = displayNameO;
}

function getPlayerDisplayName(player) {
  if (player === PLAYER_X) {
    return gameState.names.x || (gameState.mode === 'pvc' ? '🎮 Player' : 'Player X');
  }
  return gameState.names.o || (gameState.mode === 'pvc' ? '🤖 AI' : 'Player O');
}

// ==========================================
// 10. GAMEPLAY & MOVE HISTORY
// ==========================================

function handleCellClick(cellIndex) {
  if (
    gameState.board[cellIndex] !== null || 
    !gameState.isGameActive || 
    gameState.isLocked
  ) {
    return;
  }

  sounds.playClick();
  makeMove(cellIndex, gameState.currentPlayer);

  // If vs AI and it's AI's turn
  if (gameState.isGameActive && gameState.mode === 'pvc' && gameState.currentPlayer === PLAYER_O) {
    executeComputerTurn();
  }
}

function makeMove(index, player) {
  gameState.board[index] = player;
  
  // Record history
  gameState.moveHistory.push({
    player,
    index,
    cellName: CELL_NAMES[index]
  });
  renderMoveHistory();
  updateUndoButtonState();

  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add('filled', player.toLowerCase());
  cell.setAttribute('aria-label', `${CELL_NAMES[index]}, ${player}`);

  checkGameState();
}

function renderMoveHistory() {
  if (gameState.moveHistory.length === 0) {
    moveHistoryList.innerHTML = `<span class="no-moves-text">Game started. Make your first move!</span>`;
    return;
  }

  moveHistoryList.innerHTML = '';
  gameState.moveHistory.forEach((move, i) => {
    const chip = document.createElement('span');
    chip.className = `move-chip ${move.player.toLowerCase()}-chip`;
    chip.textContent = `#${i + 1} ${move.player}: ${move.cellName}`;
    moveHistoryList.appendChild(chip);
  });

  // Scroll to latest move
  moveHistoryList.scrollLeft = moveHistoryList.scrollWidth;
}

function updateUndoButtonState() {
  const canUndo = gameState.isGameActive && !gameState.isLocked && gameState.moveHistory.length > 0;
  undoBtn.disabled = !canUndo;
}

function handleUndo() {
  if (!gameState.isGameActive || gameState.isLocked || gameState.moveHistory.length === 0) return;

  // In PvC mode, if player presses undo, revert both the AI's move and the player's move
  // so the human player can replay their turn
  const movesToRevert = (gameState.mode === 'pvc' && gameState.moveHistory.length >= 2) ? 2 : 1;

  for (let i = 0; i < movesToRevert; i++) {
    if (gameState.moveHistory.length === 0) break;
    const lastMove = gameState.moveHistory.pop();
    gameState.board[lastMove.index] = null;

    const cell = cells[lastMove.index];
    cell.textContent = '';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `Cell ${lastMove.index + 1}, empty`);
  }

  // Determine current active player based on remaining moves
  if (gameState.moveHistory.length === 0) {
    gameState.currentPlayer = PLAYER_X;
  } else {
    const lastRecorded = gameState.moveHistory[gameState.moveHistory.length - 1];
    gameState.currentPlayer = lastRecorded.player === PLAYER_X ? PLAYER_O : PLAYER_X;
  }

  renderMoveHistory();
  updateUndoButtonState();
  updateStatusUI();

  if (gameState.mode === 'pvp' && gameState.timerEnabled) {
    startTurnTimer();
  }
}

// ==========================================
// 11. WIN / DRAW / TURN EVALUATIONS
// ==========================================

function checkGameState() {
  const winInfo = checkWinner(gameState.board);

  if (winInfo) {
    handleWin(winInfo);
    return;
  }

  if (checkDraw(gameState.board)) {
    handleDraw();
    return;
  }

  // Switch player
  gameState.currentPlayer = gameState.currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  updateStatusUI();

  if (gameState.mode === 'pvp' && gameState.timerEnabled) {
    startTurnTimer();
  }
}

function checkWinner(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const { combo, line } = WINNING_COMBINATIONS[i];
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo, line };
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null);
}

function handleWin(winInfo) {
  gameState.isGameActive = false;
  gameState.isLocked = true;
  gameState.lastWinner = winInfo.winner;
  stopTurnTimer();
  updateUndoButtonState();

  sounds.playWin();
  drawStrikeLine(winInfo.line, winInfo.winner);
  launchConfetti();

  if (winInfo.winner === PLAYER_X) {
    gameState.scores.x++;
  } else {
    gameState.scores.o++;
  }
  saveScores();
  updateScoreboardUI();

  const winnerName = getPlayerDisplayName(winInfo.winner);
  statusMessage.className = 'status-message';
  statusMessage.innerHTML = `🎉 <strong>${winnerName} Wins!</strong>`;
  highlightActiveTurn(null);

  setTimeout(() => {
    showWinModal(winInfo.winner, winnerName);
    gameState.isLocked = false;
  }, 500);
}

function handleDraw() {
  gameState.isGameActive = false;
  gameState.isLocked = true;
  gameState.lastWinner = 'draw';
  stopTurnTimer();
  updateUndoButtonState();

  sounds.playDraw();
  gameState.scores.draws++;
  saveScores();
  updateScoreboardUI();

  statusMessage.className = 'status-message draw';
  statusMessage.innerHTML = `🤝 <strong>It's a Draw! Starting next round...</strong>`;
  highlightActiveTurn(null);

  // Automatic reset after 1.2 seconds for Draws
  setTimeout(() => {
    resetBoard();
  }, 1200);
}

function drawStrikeLine(lineCoords, winner) {
  strikeLine.setAttribute('x1', lineCoords.x1);
  strikeLine.setAttribute('y1', lineCoords.y1);
  strikeLine.setAttribute('x2', lineCoords.x2);
  strikeLine.setAttribute('y2', lineCoords.y2);

  strikeLine.className = `strike-line ${winner.toLowerCase()}-winner`;
  void strikeLine.offsetWidth;
  strikeLine.classList.add('active');
}

function clearStrikeLine() {
  strikeLine.classList.remove('active');
  strikeLine.setAttribute('x1', 0);
  strikeLine.setAttribute('y1', 0);
  strikeLine.setAttribute('x2', 0);
  strikeLine.setAttribute('y2', 0);
}

// ==========================================
// 12. RADIAL CLOCK & TURN TIMER (PvP)
// ==========================================

function startTurnTimer() {
  stopTurnTimer();
  if (!gameState.timerEnabled || gameState.mode !== 'pvp' || !gameState.isGameActive) {
    clockContainer.classList.add('hidden');
    return;
  }

  clockContainer.classList.remove('hidden');
  gameState.timerRemaining = TURN_TIME_LIMIT;
  updateClockVisual();

  gameState.timerInterval = setInterval(() => {
    gameState.timerRemaining--;
    updateClockVisual();

    if (gameState.timerRemaining <= 3 && gameState.timerRemaining > 0) {
      sounds.playTimerWarning();
    }

    if (gameState.timerRemaining <= 0) {
      handleTimeExpired();
    }
  }, 1000);
}

function stopTurnTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

function updateClockVisual() {
  clockNumber.textContent = gameState.timerRemaining;
  
  // Radial stroke-dashoffset: 0 when full, CLOCK_CIRCUMFERENCE when empty
  const progressRatio = gameState.timerRemaining / TURN_TIME_LIMIT;
  const offset = CLOCK_CIRCUMFERENCE * (1 - progressRatio);
  clockProgress.style.strokeDashoffset = offset;

  // Color classes
  clockProgress.className = 'clock-progress';
  if (gameState.timerRemaining <= 3) {
    clockProgress.classList.add('danger');
  } else if (gameState.timerRemaining <= 7) {
    clockProgress.classList.add('warning');
  }
}

function handleTimeExpired() {
  stopTurnTimer();
  sounds.playTimerWarning();

  const skippedPlayer = gameState.currentPlayer;
  gameState.currentPlayer = skippedPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
  
  const skippedName = getPlayerDisplayName(skippedPlayer);
  statusMessage.className = 'status-message draw';
  statusMessage.innerHTML = `⏰ <strong>${skippedName} ran out of time! Turn skipped.</strong>`;

  setTimeout(() => {
    if (gameState.isGameActive) {
      updateStatusUI();
      startTurnTimer();
    }
  }, 900);
}

// ==========================================
// 13. COMPUTER AI (Easy, Medium, Hard)
// ==========================================

function executeComputerTurn() {
  gameState.isLocked = true;
  stopTurnTimer();
  updateUndoButtonState();

  statusMessage.className = 'status-message thinking';
  statusMessage.innerHTML = `🤖 ${getPlayerDisplayName(PLAYER_O)} is thinking...`;
  highlightActiveTurn(PLAYER_O);

  const delay = gameState.aiDifficulty === 'easy' ? 300 : 450;

  setTimeout(() => {
    if (!gameState.isGameActive) {
      gameState.isLocked = false;
      updateUndoButtonState();
      return;
    }

    let moveIndex = -1;
    if (gameState.aiDifficulty === 'easy') {
      moveIndex = getEasyAiMove(gameState.board);
    } else if (gameState.aiDifficulty === 'medium') {
      moveIndex = getMediumAiMove(gameState.board);
    } else {
      moveIndex = getHardAiMove(gameState.board);
    }

    gameState.isLocked = false;

    if (moveIndex !== -1 && moveIndex !== undefined) {
      sounds.playClick();
      makeMove(moveIndex, PLAYER_O);
    }
  }, delay);
}

function getEasyAiMove(board) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;
  return available[Math.floor(Math.random() * available.length)];
}

function getMediumAiMove(board) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // Immediate win
  for (const move of available) {
    const temp = [...board];
    temp[move] = PLAYER_O;
    if (checkWinner(temp)) return move;
  }
  // Immediate block
  for (const move of available) {
    const temp = [...board];
    temp[move] = PLAYER_X;
    if (checkWinner(temp)) return move;
  }
  // Center
  if (board[4] === null && Math.random() > 0.4) return 4;

  return getEasyAiMove(board);
}

function getHardAiMove(board) {
  const available = getAvailableMoves(board);
  if (available.length === 0) return -1;

  // Fast tactical shortcut
  for (const move of available) {
    const temp = [...board]; temp[move] = PLAYER_O;
    if (checkWinner(temp)) return move;
  }
  for (const move of available) {
    const temp = [...board]; temp[move] = PLAYER_X;
    if (checkWinner(temp)) return move;
  }

  let bestScore = -Infinity;
  let chosenMove = available[0];

  for (const move of available) {
    const temp = [...board];
    temp[move] = PLAYER_O;
    const score = minimax(temp, 0, false);
    if (score > bestScore) {
      bestScore = score;
      chosenMove = move;
    }
  }

  return chosenMove;
}

function minimax(board, depth, isMaximizing) {
  const winInfo = checkWinner(board);
  if (winInfo) {
    return winInfo.winner === PLAYER_O ? (10 - depth) : (depth - 10);
  }
  if (checkDraw(board)) return 0;

  const available = getAvailableMoves(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of available) {
      board[move] = PLAYER_O;
      const evaluation = minimax(board, depth + 1, false);
      board[move] = null;
      maxEval = Math.max(maxEval, evaluation);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of available) {
      board[move] = PLAYER_X;
      const evaluation = minimax(board, depth + 1, true);
      board[move] = null;
      minEval = Math.min(minEval, evaluation);
    }
    return minEval;
  }
}

function getAvailableMoves(board) {
  const moves = [];
  board.forEach((cell, idx) => {
    if (cell === null) moves.push(idx);
  });
  return moves;
}

// ==========================================
// 14. MODAL & SHARE RESULT
// ==========================================

function showWinModal(winner, winnerName) {
  if (gameState.mode === 'pvc') {
    if (winner === PLAYER_X) {
      modalBadge.textContent = '🏆';
      modalTitle.textContent = `${winnerName} Won!`;
      modalSubtitle.textContent = `Spectacular win against ${gameState.names.o || '🤖 AI'} (${gameState.aiDifficulty.toUpperCase()})!`;
    } else {
      modalBadge.textContent = '🤖';
      modalTitle.textContent = `${winnerName} Won!`;
      modalSubtitle.textContent = `The AI proved tough this round. Re-match?`;
    }
  } else {
    modalBadge.textContent = '🏆';
    modalTitle.textContent = `${winnerName} Wins!`;
    modalSubtitle.textContent = `A stellar match! Ready for round ${gameState.scores.x + gameState.scores.o + gameState.scores.draws + 1}?`;
  }

  resultModal.classList.remove('hidden');
}

function hideModal() {
  resultModal.classList.add('hidden');
}

function handleShareResult() {
  const nameX = getPlayerDisplayName(PLAYER_X);
  const nameO = getPlayerDisplayName(PLAYER_O);
  let text = '';

  if (gameState.mode === 'pvc') {
    if (gameState.lastWinner === PLAYER_X) {
      text = `🏆 I just beat ${nameO} (${gameState.aiDifficulty.toUpperCase()}) ${gameState.scores.x}-${gameState.scores.o} in Tic-Tac-Toe! ⚡🎮`;
    } else if (gameState.lastWinner === PLAYER_O) {
      text = `🤖 ${nameO} (${gameState.aiDifficulty.toUpperCase()}) won against ${nameX} in Tic-Tac-Toe! Overall Score: ${gameState.scores.x}-${gameState.scores.o} ⚡`;
    } else {
      text = `🤝 Tied match against ${nameO} in Tic-Tac-Toe! Score: ${gameState.scores.x}W - ${gameState.scores.o}L - ${gameState.scores.draws}D ⚡`;
    }
  } else {
    text = `🎮 Tic-Tac-Toe Match: ${nameX} (${gameState.scores.x}) vs ${nameO} (${gameState.scores.o}) [Draws: ${gameState.scores.draws}] ⚡`;
  }

  navigator.clipboard.writeText(text).then(() => {
    shareBtnText.textContent = 'Copied to Clipboard! ✓';
    setTimeout(() => {
      shareBtnText.textContent = 'Copy Result';
    }, 2000);
  }).catch(() => {
    shareBtnText.textContent = 'Failed to copy';
    setTimeout(() => {
      shareBtnText.textContent = 'Copy Result';
    }, 2000);
  });
}

// ==========================================
// 15. BOARD RESET & UI HELPERS
// ==========================================

function resetBoard() {
  stopTurnTimer();
  hideModal();
  clearStrikeLine();

  gameState.board = Array(9).fill(null);
  gameState.moveHistory = [];
  gameState.currentPlayer = PLAYER_X;
  gameState.isGameActive = true;
  gameState.isLocked = false;
  gameState.lastWinner = null;

  cells.forEach((cell, index) => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.setAttribute('aria-label', `${CELL_NAMES[index]}, empty`);
  });

  renderMoveHistory();
  updateUndoButtonState();
  updateStatusUI();

  if (gameState.mode === 'pvp' && gameState.timerEnabled) {
    startTurnTimer();
  }
}

function updateStatusUI() {
  if (!gameState.isGameActive) return;

  statusMessage.className = 'status-message';
  const currentName = getPlayerDisplayName(gameState.currentPlayer);

  if (gameState.currentPlayer === PLAYER_X) {
    statusMessage.innerHTML = `<span class="turn-symbol x-turn">${currentName}</span>'s Turn`;
  } else {
    statusMessage.innerHTML = `<span class="turn-symbol o-turn">${currentName}</span>'s Turn`;
  }

  highlightActiveTurn(gameState.currentPlayer);
}

function highlightActiveTurn(player) {
  cardXEl.classList.remove('active-turn');
  cardOEl.classList.remove('active-turn');

  if (player === PLAYER_X) {
    cardXEl.classList.add('active-turn');
  } else if (player === PLAYER_O) {
    cardOEl.classList.add('active-turn');
  }
}

function updateScoreboardUI() {
  scoreXEl.textContent = gameState.scores.x;
  scoreOEl.textContent = gameState.scores.o;
  scoreDrawsEl.textContent = gameState.scores.draws;
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initGame);
