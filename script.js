// =================== GAME STATE ===================
const gameState = {
    // Game settings
    mode: 'pvp', // 'pvp' or 'ai'
    difficulty: 'medium', // 'easy', 'medium', 'hard'
    soundEnabled: true,
    
    // Game data
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameActive: true,
    scores: { X: 0, O: 0 },
    totalGames: 0,
    totalWins: 0,
    
    // AI
    aiThinking: false,
    
    // History
    moveHistory: []
};

// =================== INITIALIZATION ===================
window.addEventListener('DOMContentLoaded', () => {
    // Simulate loading
    setTimeout(() => {
        showScreen('main-menu');
        loadStats();
        setupAllEventListeners();
    }, 1000);
    
    initializeBoard();
    console.log('🎮 Tic Tac Toe Pro - AI Fixed Version');
});

// =================== SCREEN MANAGEMENT ===================
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
        playSound('click');
    }
}

// =================== GAME START FUNCTIONS ===================
function startGame(mode) {
    gameState.mode = mode;
    
    if (mode === 'pvp') {
        document.getElementById('gameMode').textContent = 'VS PLAYER';
        document.getElementById('currentDifficulty').style.display = 'none';
        startNewGame();
    } else if (mode === 'ai') {
        showScreen('difficulty-screen');
    }
}

function showDifficulty() {
    showScreen('difficulty-screen');
}

function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    
    // Update UI
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Find and select the clicked card
    event.target.closest('.difficulty-card').classList.add('selected');
    
    playSound('click');
}

function startGameWithAI() {
    if (!gameState.difficulty) {
        alert('Please select a difficulty level!');
        return;
    }
    
    document.getElementById('gameMode').textContent = 'VS COMPUTER';
    document.getElementById('currentDifficulty').textContent = gameState.difficulty.toUpperCase();
    document.getElementById('currentDifficulty').style.display = 'block';
    
    startNewGame();
}

// =================== BOARD MANAGEMENT ===================
function initializeBoard() {
    const board = document.getElementById('gameBoard');
    if (!board) return;
    
    board.innerHTML = '';
    
    // Create 3x3 board (9 cells)
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
}

// =================== GAME LOGIC ===================
function handleCellClick(index) {
    if (!gameState.gameActive || gameState.board[index] !== '' || gameState.aiThinking) return;
    
    playSound('move');
    
    // Make move
    makeMove(index, gameState.currentPlayer);
    gameState.moveHistory.push({ player: gameState.currentPlayer, index });
    
    // Check win/tie
    if (checkWin(gameState.currentPlayer)) {
        handleWin(gameState.currentPlayer);
    } else if (checkTie()) {
        handleTie();
    } else {
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateGameStatus();
        
        // AI move if needed
        if (gameState.mode === 'ai' && gameState.currentPlayer === 'O' && gameState.gameActive) {
            gameState.aiThinking = true;
            setTimeout(makeAIMove, 600);
        }
    }
}

function makeMove(index, player) {
    gameState.board[index] = player;
    
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (cell) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        cell.classList.add('occupied');
        
        // Animation
        cell.style.transform = 'scale(0)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 50);
    }
}

// =================== AI FUNCTIONS - SIMPLE & WORKING ===================
function makeAIMove() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'O') {
        gameState.aiThinking = false;
        return;
    }
    
    console.log("AI thinking with difficulty:", gameState.difficulty);
    
    // Find all empty cells
    let emptyCells = [];
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            emptyCells.push(i);
        }
    }
    
    if (emptyCells.length === 0) {
        gameState.aiThinking = false;
        return;
    }
    
    let aiMoveIndex = -1;
    
    // EASY AI: Completely random
    if (gameState.difficulty === 'easy') {
        aiMoveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    
    // MEDIUM AI: Smart but not perfect
    else if (gameState.difficulty === 'medium') {
        // Try to win
        aiMoveIndex = findWinningMove('O');
        
        // Block player if they can win
        if (aiMoveIndex === null) {
            aiMoveIndex = findWinningMove('X');
        }
        
        // Take center
        if (aiMoveIndex === null && gameState.board[4] === '') {
            aiMoveIndex = 4;
        }
        
        // Take random corner
        if (aiMoveIndex === null) {
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(corner => gameState.board[corner] === '');
            if (availableCorners.length > 0) {
                aiMoveIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }
        
        // Random move
        if (aiMoveIndex === null) {
            aiMoveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }
    
    // HARD AI: Very smart
    else if (gameState.difficulty === 'hard') {
        // Try to win
        aiMoveIndex = findWinningMove('O');
        
        // Block player
        if (aiMoveIndex === null) {
            aiMoveIndex = findWinningMove('X');
        }
        
        // Take center
        if (aiMoveIndex === null && gameState.board[4] === '') {
            aiMoveIndex = 4;
        }
        
        // Take opposite corner if player took corner
        if (aiMoveIndex === null) {
            const corners = [[0,8], [2,6], [6,2], [8,0]];
            for (const [corner, opposite] of corners) {
                if (gameState.board[corner] === 'X' && gameState.board[opposite] === '') {
                    aiMoveIndex = opposite;
                    break;
                }
            }
        }
        
        // Take empty corner
        if (aiMoveIndex === null) {
            const corners = [0, 2, 6, 8];
            const availableCorners = corners.filter(corner => gameState.board[corner] === '');
            if (availableCorners.length > 0) {
                aiMoveIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
            }
        }
        
        // Take empty side
        if (aiMoveIndex === null) {
            const sides = [1, 3, 5, 7];
            const availableSides = sides.filter(side => gameState.board[side] === '');
            if (availableSides.length > 0) {
                aiMoveIndex = availableSides[Math.floor(Math.random() * availableSides.length)];
            }
        }
        
        // Random move (fallback)
        if (aiMoveIndex === null) {
            aiMoveIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
    }
    
    // Make the AI move
    if (aiMoveIndex !== null && aiMoveIndex !== -1) {
        setTimeout(() => {
            makeMove(aiMoveIndex, 'O');
            gameState.moveHistory.push({ player: 'O', index: aiMoveIndex });
            
            // Check win/tie after AI move
            if (checkWin('O')) {
                handleWin('O');
            } else if (checkTie()) {
                handleTie();
            } else {
                gameState.currentPlayer = 'X';
                gameState.aiThinking = false;
                updateGameStatus();
            }
        }, 300);
    } else {
        gameState.aiThinking = false;
    }
}

function findWinningMove(player) {
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Columns
        [0,4,8], [2,4,6]           // Diagonals
    ];
    
    for (const combo of winningCombos) {
        const cells = combo.map(idx => gameState.board[idx]);
        const emptyIndex = combo[cells.indexOf('')];
        
        // Check if player has 2 in this combo and 1 empty
        if (cells.filter(cell => cell === player).length === 2 && cells.includes('')) {
            return emptyIndex;
        }
    }
    return null;
}

// =================== WIN/TIE CHECK ===================
function checkWin(player) {
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Columns
        [0,4,8], [2,4,6]           // Diagonals
    ];
    
    return winningCombos.some(combo => {
        return combo.every(index => gameState.board[index] === player);
    });
}

function checkTie() {
    return gameState.board.every(cell => cell !== '');
}

function handleWin(winner) {
    gameState.gameActive = false;
    gameState.scores[winner]++;
    gameState.totalGames++;
    gameState.totalWins++;
    gameState.aiThinking = false;
    
    // Update UI
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay) {
        statusDisplay.innerHTML = `<i class="fas fa-trophy"></i><span>Player ${winner} Wins!</span>`;
        statusDisplay.className = 'status-display status-win';
    }
    
    // Update scores
    document.getElementById(`score${winner}`).textContent = gameState.scores[winner];
    
    // Highlight winning cells
    const winningCombos = [
        [0,1,2], [3,4,5], [6,7,8], [0,3,6], 
        [1,4,7], [2,5,8], [0,4,8], [2,4,6]
    ];
    
    for (const combo of winningCombos) {
        if (combo.every(index => gameState.board[index] === winner)) {
            combo.forEach(index => {
                const cell = document.querySelector(`.cell[data-index="${index}"]`);
                if (cell) cell.classList.add('win-cell');
            });
            break;
        }
    }
    
    playSound('win');
    saveStats();
}

function handleTie() {
    gameState.gameActive = false;
    gameState.totalGames++;
    gameState.aiThinking = false;
    
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay) {
        statusDisplay.innerHTML = `<i class="fas fa-handshake"></i><span>Game Tied!</span>`;
        statusDisplay.className = 'status-display status-tie';
    }
    
    playSound('tie');
    saveStats();
}

// =================== GAME CONTROLS ===================
function startNewGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    gameState.moveHistory = [];
    gameState.aiThinking = false;
    
    // Clear board
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.classList.remove('win-cell');
    });
    
    // Show game screen
    showScreen('game-screen');
    
    // Update UI
    updateGameStatus();
    playSound('click');
}

function restartGame() {
    gameState.board = ['', '', '', '', '', '', '', '', ''];
    gameState.currentPlayer = 'X';
    gameState.gameActive = true;
    gameState.moveHistory = [];
    gameState.aiThinking = false;
    
    // Clear board
    document.querySelectorAll('.cell').forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.classList.remove('win-cell');
    });
    
    updateGameStatus();
    playSound('click');
}

function showHint() {
    if (!gameState.gameActive || gameState.currentPlayer !== 'X') return;
    
    // Find best move for player
    const hintIndex = findWinningMove('X') || findBestMove();
    
    if (hintIndex !== null) {
        const cell = document.querySelector(`.cell[data-index="${hintIndex}"]`);
        if (cell) {
            const originalBg = cell.style.background;
            cell.style.background = 'rgba(245, 158, 11, 0.5)';
            setTimeout(() => {
                cell.style.background = originalBg;
            }, 1000);
        }
    }
    
    playSound('click');
}

function findBestMove() {
    // Try center first
    if (gameState.board[4] === '') return 4;
    
    // Try corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(idx => gameState.board[idx] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Random move
    const emptyCells = [];
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') emptyCells.push(i);
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function undoMove() {
    if (gameState.moveHistory.length === 0) return;
    
    const lastMove = gameState.moveHistory.pop();
    if (lastMove) {
        gameState.board[lastMove.index] = '';
        gameState.currentPlayer = lastMove.player;
        gameState.gameActive = true;
        gameState.aiThinking = false;
        
        const cell = document.querySelector(`.cell[data-index="${lastMove.index}"]`);
        if (cell) {
            cell.textContent = '';
            cell.className = 'cell';
        }
        
        updateGameStatus();
        playSound('click');
    }
}

// =================== UI UPDATES ===================
function updateGameStatus() {
    // Update player status
    const player1 = document.querySelector('.player1');
    const player2 = document.querySelector('.player2');
    const playerXStatus = document.getElementById('playerXStatus');
    const playerOStatus = document.getElementById('playerOStatus');
    
    if (player1) player1.classList.toggle('active', gameState.currentPlayer === 'X');
    if (player2) player2.classList.toggle('active', gameState.currentPlayer === 'O');
    
    if (playerXStatus) {
        playerXStatus.textContent = gameState.currentPlayer === 'X' ? 'Your Turn' : 'Waiting';
    }
    
    if (playerOStatus) {
        if (gameState.mode === 'ai') {
            playerOStatus.textContent = gameState.currentPlayer === 'O' ? 'AI Thinking...' : 'Waiting';
        } else {
            playerOStatus.textContent = gameState.currentPlayer === 'O' ? 'Your Turn' : 'Waiting';
        }
    }
    
    // Update status display
    const statusDisplay = document.getElementById('statusDisplay');
    if (statusDisplay && gameState.gameActive) {
        let statusText = `Player ${gameState.currentPlayer}'s Turn`;
        if (gameState.mode === 'ai' && gameState.currentPlayer === 'O') {
            statusText = 'AI Thinking...';
        }
        
        statusDisplay.innerHTML = `<i class="fas fa-${gameState.currentPlayer === 'X' ? 'times' : 'circle'}"></i><span>${statusText}</span>`;
        statusDisplay.className = 'status-display';
    }
}

// =================== SOUND SYSTEM ===================
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    try {
        const sound = document.getElementById(`${type}Sound`);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio error:', e));
        }
    } catch (error) {
        console.log('Sound error:', error);
    }
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const icon = document.getElementById('soundIcon');
    if (icon) {
        icon.className = gameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    }
    playSound('click');
    saveSettings();
}

// =================== SETTINGS ===================
function showSettings() {
    // Update toggle states
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) soundToggle.checked = gameState.soundEnabled;
    
    showScreen('settings-screen');
}

function resetStats() {
    if (confirm('Reset all statistics?')) {
        gameState.scores = { X: 0, O: 0 };
        gameState.totalGames = 0;
        gameState.totalWins = 0;
        
        const scoreX = document.getElementById('scoreX');
        const scoreO = document.getElementById('scoreO');
        const totalGames = document.getElementById('totalGames');
        const totalWins = document.getElementById('totalWins');
        
        if (scoreX) scoreX.textContent = '0';
        if (scoreO) scoreO.textContent = '0';
        if (totalGames) totalGames.textContent = '0';
        if (totalWins) totalWins.textContent = '0';
        
        saveStats();
        playSound('click');
    }
}

// =================== STORAGE ===================
function saveSettings() {
    localStorage.setItem('ticTacToeSettings', JSON.stringify({
        soundEnabled: gameState.soundEnabled
    }));
}

function saveStats() {
    localStorage.setItem('ticTacToeStats', JSON.stringify({
        scores: gameState.scores,
        totalGames: gameState.totalGames,
        totalWins: gameState.totalWins
    }));
}

function loadStats() {
    try {
        const settings = JSON.parse(localStorage.getItem('ticTacToeSettings'));
        const stats = JSON.parse(localStorage.getItem('ticTacToeStats'));
        
        if (settings) gameState.soundEnabled = settings.soundEnabled;
        if (stats) {
            gameState.scores = stats.scores || { X: 0, O: 0 };
            gameState.totalGames = stats.totalGames || 0;
            gameState.totalWins = stats.totalWins || 0;
        }
        
        // Update UI
        const soundIcon = document.getElementById('soundIcon');
        const scoreX = document.getElementById('scoreX');
        const scoreO = document.getElementById('scoreO');
        const totalGames = document.getElementById('totalGames');
        const totalWins = document.getElementById('totalWins');
        
        if (soundIcon) soundIcon.className = gameState.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        if (scoreX) scoreX.textContent = gameState.scores.X;
        if (scoreO) scoreO.textContent = gameState.scores.O;
        if (totalGames) totalGames.textContent = gameState.totalGames;
        if (totalWins) totalWins.textContent = gameState.totalWins;
    } catch (error) {
        console.log('Load error:', error);
    }
}

// =================== EVENT LISTENERS ===================
function setupAllEventListeners() {
    // Main menu buttons
    const playVsPlayerBtn = document.getElementById('playVsPlayer');
    const playVsComputerBtn = document.getElementById('playVsComputer');
    const settingsBtn = document.getElementById('settingsBtn');
    
    if (playVsPlayerBtn) playVsPlayerBtn.addEventListener('click', () => startGame('pvp'));
    if (playVsComputerBtn) playVsComputerBtn.addEventListener('click', showDifficulty);
    if (settingsBtn) settingsBtn.addEventListener('click', showSettings);
    
    // Difficulty selection
    document.querySelectorAll('.difficulty-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            const difficulty = this.querySelector('h3').textContent.toLowerCase();
            gameState.difficulty = difficulty;
            playSound('click');
        });
    });
    
    // Start game button in difficulty screen
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            if (gameState.difficulty) {
                gameState.mode = 'ai';
                startNewGame();
            } else {
                alert('Please select a difficulty level!');
            }
        });
    }
    
    // Settings toggles
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle) {
        soundToggle.checked = gameState.soundEnabled;
        soundToggle.addEventListener('change', toggleSound);
    }
    
    // Back buttons
    document.querySelectorAll('.back-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const currentScreen = document.querySelector('.screen.active');
            if (currentScreen.id === 'game-screen') {
                showScreen('main-menu');
            } else {
                showScreen('main-menu');
            }
        });
    });
    
    // How to Play button
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    if (howToPlayBtn) {
        howToPlayBtn.addEventListener('click', () => {
            showScreen('instructions-screen');
        });
    }
    
    // Got it button in instructions
    const gotItBtn = document.querySelector('.got-it-btn');
    if (gotItBtn) {
        gotItBtn.addEventListener('click', () => {
            showScreen('main-menu');
        });
    }
    
    // Home button in game
    const homeBtn = document.querySelector('.home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            if (confirm('Leave game?')) {
                showScreen('main-menu');
            }
        });
    }
    
    // Game control buttons
    const restartBtn = document.querySelector('.restart-btn');
    const hintBtn = document.querySelector('.hint-btn');
    const undoBtn = document.querySelector('.undo-btn');
    
    if (restartBtn) restartBtn.addEventListener('click', restartGame);
    if (hintBtn) hintBtn.addEventListener('click', showHint);
    if (undoBtn) undoBtn.addEventListener('click', undoMove);
    
    // Settings screen buttons
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', resetStats);
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.theme = this.dataset.theme;
            saveSettings();
        });
    });
    
    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            gameState.boardSize = parseInt(this.dataset.size);
            saveSettings();
        });
    });
    
    console.log('All event listeners setup complete');
}

// =================== GLOBAL FUNCTIONS ===================
window.startGame = startGame;
window.showDifficulty = showDifficulty;
window.selectDifficulty = selectDifficulty;
window.showScreen = showScreen;
window.restartGame = restartGame;
window.showHint = showHint;
window.undoMove = undoMove;
window.toggleSound = toggleSound;
window.showSettings = showSettings;
window.resetStats = resetStats;
window.startGameWithAI = startGameWithAI;
// ========== AUTO SCROLL TO BUTTONS ==========
function ensureButtonsVisible() {
  setTimeout(() => {
    const buttons = document.querySelectorAll('button');
    if(buttons.length > 0) {
      const lastButton = buttons[buttons.length - 1];
      lastButton.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, 500);
}

// Call this when game loads
document.addEventListener('DOMContentLoaded', function() {
  ensureButtonsVisible();
  
  // Also call when difficulty is selected
  const difficultyButtons = document.querySelectorAll('[onclick*="difficulty"]');
  difficultyButtons.forEach(btn => {
    const oldClick = btn.getAttribute('onclick');
    btn.setAttribute('onclick', oldClick + '; ensureButtonsVisible();');
  });
});
// ========== GAME ENHANCEMENT VARIABLES ==========
let coins = 50;
let winStreak = 0;
let currentTheme = 'default';
let moveHistory = [];

// ========== RANDOM FIRST TURN ==========
function randomizeFirstTurn() {
  const players = ['player', 'ai'];
  const firstPlayer = players[Math.floor(Math.random() * 2)];
  
  if(firstPlayer === 'ai') {
    setTimeout(() => {
      if(gameActive) {
        makeAIMove();
      }
    }, 1000);
  }
}

// Call this in your startGame function
// Add this line in startGame(): randomizeFirstTurn();

// ========== SMARTER AI ==========
function makeAIMove() {
  let available = [];
  for(let i = 0; i < 9; i++) {
    if(board[i] === '') available.push(i);
  }
  
  // Random move 70% of time, strategic 30%
  if(Math.random() < 0.7 || available.length === 1) {
    const randomIndex = Math.floor(Math.random() * available.length);
    const move = available[randomIndex];
    makeMove(move);
  } else {
    // Try to win or block
    let strategicMove = findStrategicMove();
    if(strategicMove !== -1) {
      makeMove(strategicMove);
    } else {
      const randomIndex = Math.floor(Math.random() * available.length);
      makeMove(available[randomIndex]);
    }
  }
}

function findStrategicMove() {
  // Simple win/block logic
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  
  for(let pattern of winPatterns) {
    // Check for AI win
    let aiCount = 0, emptyIndex = -1;
    for(let pos of pattern) {
      if(board[pos] === 'O') aiCount++;
      else if(board[pos] === '') emptyIndex = pos;
    }
    if(aiCount === 2 && emptyIndex !== -1) return emptyIndex;
    
    // Check for block
    let playerCount = 0;
    emptyIndex = -1;
    for(let pos of pattern) {
      if(board[pos] === 'X') playerCount++;
      else if(board[pos] === '') emptyIndex = pos;
    }
    if(playerCount === 2 && emptyIndex !== -1) return emptyIndex;
  }
  
  // Center if available
  if(board[4] === '') return 4;
  
  // Corners
  const corners = [0,2,6,8];
  for(let corner of corners) {
    if(board[corner] === '') return corner;
  }
  
  return -1;
}

// ========== COIN SYSTEM ==========
function updateCoinDisplay() {
  document.getElementById('coin-count').textContent = coins;
  document.getElementById('streak-count').textContent = winStreak;
  
  // Streak glow effect
  const streakEl = document.getElementById('coin-system');
  if(winStreak >= 3) {
    streakEl.classList.add('streak-glow');
  } else {
    streakEl.classList.remove('streak-glow');
  }
}

function checkWinStreak() {
  // Add this in your win checking logic
  // After player wins:
  winStreak++;
  
  // Award coins for 3+ streak
  if(winStreak >= 3) {
    coins += 50;
    alert(`🔥 ${winStreak} Win Streak! +50 coins!`);
  }
  
  updateCoinDisplay();
}

// Reset streak on loss
function resetStreak() {
  winStreak = 0;
  updateCoinDisplay();
}

// ========== HINT SYSTEM ==========
function useHint() {
  if(coins < 20) {
    alert("Need 20 coins for hint!");
    return;
  }
  
  coins -= 20;
  updateCoinDisplay();
  
  // Find best move
  const bestMove = findStrategicMove();
  if(bestMove !== -1) {
    const cell = document.querySelectorAll('.cell')[bestMove];
    cell.style.boxShadow = '0 0 20px yellow';
    setTimeout(() => {
      cell.style.boxShadow = '';
    }, 2000);
    alert(`💡 Try position ${bestMove + 1}`);
  }
}

// ========== UNDO SYSTEM ==========
function useUndo() {
  if(coins < 15) {
    alert("Need 15 coins for undo!");
    return;
  }
  
  coins -= 15;
  updateCoinDisplay();
  
  // Remove last AI move
  for(let i = board.length - 1; i >= 0; i--) {
    if(board[i] === 'O') {
      board[i] = '';
      document.querySelectorAll('.cell')[i].textContent = '';
      break;
    }
  }
}

// ========== THEME SYSTEM ==========
function showThemes() {
  document.getElementById('theme-selector').style.display = 'block';
}

function closeThemes() {
  document.getElementById('theme-selector').style.display = 'none';
}

function buyTheme(themeName) {
  if(coins < 100) {
    alert("Need 100 coins to buy themes!");
    return;
  }
  
  coins -= 100;
  updateCoinDisplay();
  
  // Remove old theme
  document.body.classList.remove('theme-dark', 'theme-nature', 'theme-space');
  
  // Apply new theme
  if(themeName !== 'default') {
    document.body.classList.add('theme-' + themeName);
  }
  
  currentTheme = themeName;
  closeThemes();
  alert(`🎨 ${themeName} theme activated!`);
}

// ========== INITIALIZE ==========
// Call this when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateCoinDisplay();
  
  // Add to existing startGame function:
  // 1. Call randomizeFirstTurn();
  // 2. Reset winStreak on game start
});
