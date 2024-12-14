// Game state
let gameBoard = Array(3).fill(null).map(() => Array(3).fill(''));
let currentPlayer = 'X';
let gameMode = 'local';
let gameActive = true;
let playerSymbol = 'X';
let aiDifficulty = 'medium';

// Initialize the game board
function initializeBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const cell = document.createElement('button');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleCellClick(i, j));
            board.appendChild(cell);
        }
    }
    updateBoard();
}

// Handle cell clicks
function handleCellClick(row, col) {
    if (!gameActive || gameBoard[row][col] !== '') return;
    
    if (gameMode === 'online') {
        if (currentPlayer !== playerSymbol) {
            console.log('Not your turn - current player:', currentPlayer, 'your symbol:', playerSymbol);
            return;
        }
        sendMove(row, col);
    } else {
        makeMove(row, col);
    }
}

// Make a move
function makeMove(row, col) {
    if (gameBoard[row][col] === '' && gameActive) {
        gameBoard[row][col] = currentPlayer;
        updateBoard();
        
        if (checkWinner()) {
            return;
        }
        
        if (checkDraw()) {
            const message = "🤝 It's a Draw! 🤝";
            updateStatus(message);
            showResult(message);
            gameActive = false;
            return;
        }
        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        if (gameMode === 'online') {
            updateStatus(currentPlayer === playerSymbol ? "Your Turn" : "Opponent's Turn");
        } else {
            updateStatus(`${currentPlayer}'s Turn`);
        }
        
        if (gameMode === 'ai' && gameActive && currentPlayer === 'O') {
            setTimeout(makeAIMove, 500);
        }
    }
}

// Update the game board display
function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        cell.textContent = gameBoard[row][col];
        cell.className = 'cell ' + gameBoard[row][col].toLowerCase();
    });
}

// Check for a winner
function checkWinner() {
    const lines = [
        [[0, 0], [0, 1], [0, 2]],
        [[1, 0], [1, 1], [1, 2]],
        [[2, 0], [2, 1], [2, 2]],
        [[0, 0], [1, 0], [2, 0]],
        [[0, 1], [1, 1], [2, 1]],
        [[0, 2], [1, 2], [2, 2]],
        [[0, 0], [1, 1], [2, 2]],
        [[2, 0], [1, 1], [0, 2]]
    ];

    for (let line of lines) {
        const [[a, b], [c, d], [e, f]] = line;
        if (gameBoard[a][b] && 
            gameBoard[a][b] === gameBoard[c][d] && 
            gameBoard[a][b] === gameBoard[e][f]) {
            
            // Stop game immediately
            gameActive = false;
            const winner = gameBoard[a][b];
            let message;
            
            if (gameMode === 'local') {
                message = `${winner} Won!`;
            } else {
                message = winner === playerSymbol ? 
                    '🎉 Congratulations! You Win! 🏆' : 
                    '😔 Game Over! You Lost! 🎮';
            }

            // Add winning animation class
            const cells = document.querySelectorAll('.cell');
            line.forEach(([row, col]) => {
                const index = row * 3 + col;
                cells[index].classList.add('winning');
            });

            // Update status and show result immediately
            // (showResult will handle the delay)
            updateStatus(message);
            showResult(message);

            // Remove animation class after it completes
            setTimeout(() => {
                line.forEach(([row, col]) => {
                    const index = row * 3 + col;
                    cells[index].classList.remove('winning');
                });
            }, 1500);

            return true;
        }
    }
    return false;
}

// Check for a draw
function checkDraw() {
    return gameBoard.every(row => row.every(cell => cell !== ''));
}

// Update game status display
function updateStatus(message) {
    const status = document.getElementById('game-status');
    status.textContent = message;
}

// Restart the game
function restartGame() {
    hideResultModal();
    gameBoard = Array(3).fill(null).map(() => Array(3).fill(''));
    gameActive = true;
    currentPlayer = 'X';
    
    // Remove winning animation classes
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('winning');
        cell.textContent = '';
    });
    
    updateBoard();
    updateStatus(gameMode === 'online' ? (currentPlayer === playerSymbol ? "Your Turn" : "Opponent's Turn") : "Player X's Turn");
    
    // If AI mode and AI goes first, make AI move
    if (gameMode === 'ai' && playerSymbol === 'O') {
        setTimeout(makeAIMove, 500);
    }
}

// Show mode selection screen
function showModeSelection() {
    hideResultModal();
    hideAllScreens();
    document.getElementById('mode-selection-screen').classList.add('active');
    
    // Reset game state
    gameBoard = Array(3).fill(null).map(() => Array(3).fill(''));
    currentPlayer = 'X';
    gameActive = true;
    playerSymbol = 'X';
}

// Show AI difficulty selection screen
function showAIDifficultySelect() {
    hideAllScreens();
    document.getElementById('ai-difficulty-screen').classList.add('active');
}

// Show online options screen
function showOnlineOptions() {
    hideAllScreens();
    document.getElementById('online-options-screen').classList.add('active');
}

// Start local game
function startLocalGame() {
    gameMode = 'local';
    setupGame('Local Game');
}

// Start AI game
function startAIGame(difficulty) {
    gameMode = 'ai';
    aiDifficulty = difficulty;
    setupGame(`vs AI (${difficulty})`);
}

// Setup game with mode
function setupGame(modeDisplay) {
    hideAllScreens();
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('game-mode-display').textContent = modeDisplay;
    
    // Hide restart button in online mode
    const restartButton = document.querySelector('.game-controls button:first-child');
    restartButton.style.display = gameMode === 'online' ? 'none' : 'block';
    
    restartGame();
}

// Hide all screens
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Show specific screen
function showScreen(screenId) {
    hideAllScreens();
    document.getElementById(screenId).classList.add('active');
}

// Highlight winning combination
function highlightWinner() {
    const cells = document.querySelectorAll('.cell');
    let winningCombination = null;

    // Check rows
    for (let i = 0; i < 3; i++) {
        if (gameBoard[i][0] === currentPlayer && 
            gameBoard[i][1] === currentPlayer && 
            gameBoard[i][2] === currentPlayer) {
            winningCombination = [i*3, i*3+1, i*3+2];
        }
    }

    // Check columns
    for (let i = 0; i < 3; i++) {
        if (gameBoard[0][i] === currentPlayer && 
            gameBoard[1][i] === currentPlayer && 
            gameBoard[2][i] === currentPlayer) {
            winningCombination = [i, i+3, i+6];
        }
    }

    // Check diagonals
    if (gameBoard[0][0] === currentPlayer && 
        gameBoard[1][1] === currentPlayer && 
        gameBoard[2][2] === currentPlayer) {
        winningCombination = [0, 4, 8];
    }

    if (gameBoard[0][2] === currentPlayer && 
        gameBoard[1][1] === currentPlayer && 
        gameBoard[2][0] === currentPlayer) {
        winningCombination = [2, 4, 6];
    }

    // Highlight winning cells
    if (winningCombination) {
        winningCombination.forEach(index => {
            cells[index].classList.add('winner');
        });
        
        // Add celebration animation to game board
        const gameBoard = document.getElementById('game-board');
        gameBoard.classList.add('game-won');
        
        // Update status with winning message
        updateStatus(`${currentPlayer} Wins! 🎉`);
        
        // Disable all cells
        cells.forEach(cell => {
            cell.style.pointerEvents = 'none';
        });
    }
}

// Show result in modal
function showResult(message) {
    const resultModal = document.getElementById('result-modal');
    const resultMessage = document.getElementById('result-message');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    resultMessage.textContent = message;
    
    // Hide play again button in online mode
    if (gameMode === 'online') {
        playAgainBtn.style.display = 'none';
    } else {
        playAgainBtn.style.display = 'inline-block';
    }
    
    // Add a small delay before showing the modal
    setTimeout(() => {
        resultModal.style.display = 'flex';
    }, 1500);
}

// Hide the result modal
function hideResultModal() {
    const resultModal = document.getElementById('result-modal');
    resultModal.style.display = 'none';
}

// AI move implementation
function makeAIMove() {
    if (!gameActive) return;

    let bestMove;
    switch(aiDifficulty) {
        case 'easy':
            bestMove = findRandomMove();
            break;
        case 'medium':
            // Check if there's a winning move or if we need to block opponent
            let smartMove = findSmartMove();
            if (smartMove) {
                bestMove = smartMove;
            } else {
                // If no critical moves, 70% chance of making a strategic move
                bestMove = Math.random() < 0.7 ? findBestMove() : findRandomMove();
            }
            break;
        case 'hard':
            bestMove = findBestMove();
            break;
        default:
            bestMove = findRandomMove();
    }

    if (bestMove) {
        makeMove(bestMove.row, bestMove.col);
    }
}

// Find a random empty cell
function findRandomMove() {
    const emptyCells = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] === '') {
                emptyCells.push({row: i, col: j});
            }
        }
    }
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

// Find the best move using minimax algorithm
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] === '') {
                gameBoard[i][j] = 'O';
                let score = minimax(gameBoard, 0, false);
                gameBoard[i][j] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {row: i, col: j};
                }
            }
        }
    }
    return bestMove;
}

// Find a winning move or blocking move
function findSmartMove() {
    // First check if AI can win
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] === '') {
                gameBoard[i][j] = 'O';
                if (checkWinningMove(gameBoard)) {
                    gameBoard[i][j] = '';
                    return {row: i, col: j};
                }
                gameBoard[i][j] = '';
            }
        }
    }

    // Then check if need to block opponent
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] === '') {
                gameBoard[i][j] = 'X';
                if (checkWinningMove(gameBoard)) {
                    gameBoard[i][j] = '';
                    return {row: i, col: j};
                }
                gameBoard[i][j] = '';
            }
        }
    }

    // Check if center is available (strategic position)
    if (gameBoard[1][1] === '') {
        return {row: 1, col: 1};
    }

    return null;
}

// Helper function to check if current board state has a winner
function checkWinningMove(board) {
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return true;
        }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
        if (board[0][j] !== '' && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
            return true;
        }
    }
    // Check diagonals
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return true;
    }
    if (board[0][2] !== '' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        return true;
    }
    return false;
}

// Minimax algorithm implementation
function minimax(board, depth, isMaximizing) {
    // Check for terminal states
    let winner = null;
    // Check rows
    for (let i = 0; i < 3; i++) {
        if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            winner = board[i][0];
        }
    }
    // Check columns
    for (let j = 0; j < 3; j++) {
        if (board[0][j] !== '' && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
            winner = board[0][j];
        }
    }
    // Check diagonals
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        winner = board[0][0];
    }
    if (board[0][2] !== '' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        winner = board[0][2];
    }

    if (winner) {
        return winner === 'O' ? 10 - depth : depth - 10;
    }

    // Check for draw
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                isDraw = false;
                break;
            }
        }
        if (!isDraw) break;
    }
    if (isDraw) return 0;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i][j] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[i][j] === '') {
                    board[i][j] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i][j] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
        }
        return bestScore;
    }
}

// Online game functions
function startOnlineGame(mode) {
    gameMode = 'online';
    if (mode === 'create') {
        document.getElementById('online-menu').style.display = 'none';
        document.getElementById('waiting-room').style.display = 'flex';
        createRoom();
    } else if (mode === 'join') {
        const roomCode = document.getElementById('room-code-input').value.trim();
        if (roomCode) {
            joinRoom(roomCode);
        } else {
            document.getElementById('room-status').style.display = 'block';
            document.getElementById('room-status').textContent = 'Please enter a room code';
            setTimeout(() => {
                document.getElementById('room-status').style.display = 'none';
            }, 3000);
        }
    }
}

function showJoinRoomOption() {
    document.getElementById('online-menu').style.display = 'none';
    document.getElementById('join-room-menu').style.display = 'flex';
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('room-status').style.display = 'none';
}

function showOnlineMenu() {
    // Cancel any existing room before showing the menu
    if (gameMode === 'online') {
        cancelRoom();
    }
    document.getElementById('online-menu').style.display = 'flex';
    document.getElementById('join-room-menu').style.display = 'none';
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('room-status').style.display = 'none';
    document.getElementById('room-code-input').value = '';
    // Reset game mode
    gameMode = 'local';
}

function initOnlineGame(board, turn, symbol) {
    hideAllScreens();
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('game-mode-display').textContent = `Online Game (You are ${symbol})`;
    
    // Hide restart button in online mode
    const restartButton = document.querySelector('.game-controls button:first-child');
    if (restartButton) {
        restartButton.style.display = 'none';
    }
    
    gameBoard = board;
    currentPlayer = turn;
    playerSymbol = symbol;
    gameMode = 'online'; // Ensure game mode is set
    gameActive = true;
    updateBoard();
    updateStatus(currentPlayer === playerSymbol ? "Your Turn" : "Opponent's Turn");
}

function handleOpponentMove(row, col, symbol, nextTurn) {
    if (gameBoard[row][col] === '') {
        gameBoard[row][col] = symbol;
        updateBoard();
        currentPlayer = nextTurn;
        
        // Check for winner after opponent's move
        if (checkWinner()) {
            return;  // checkWinner now handles the animation and delayed modal
        }
        
        if (checkDraw()) {
            const message = "🤝 It's a Draw! 🤝";
            gameActive = false;
            updateStatus(message);
            showResult(message);  // showResult now handles the delay
            return;
        }
        
        updateStatus(currentPlayer === playerSymbol ? "Your Turn" : "Opponent's Turn");
    }
}

function updateRoomStatus(message) {
    if (message.includes('Room created')) {
        // Extract just the room code number
        const roomCode = message.split(': ')[1];
        document.getElementById('room-code').textContent = roomCode;
    } else {
        const roomStatus = document.getElementById('room-status');
        if (roomStatus) {
            roomStatus.style.display = 'block';
            roomStatus.textContent = message;
        }
    }
}

// Make these functions available globally
window.startOnlineGame = startOnlineGame;
window.showOnlineMenu = showOnlineMenu;
window.showJoinRoomOption = showJoinRoomOption;
window.initOnlineGame = initOnlineGame;
window.handleOpponentMove = handleOpponentMove;
window.updateRoomStatus = updateRoomStatus;
window.showScreen = showScreen;

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    showModeSelection();
});
