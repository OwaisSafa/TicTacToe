// Initialize variables for online play
let multiplayerRoomCode = '';
let multiplayerPlayerSymbol = '';

// Initialize socket connection
const socket = io();

// Socket connection status
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});

socket.on('tic_tac_toe_opponent_left', () => {
    if (gameMode === 'online') {
        updateRoomStatus('Opponent left the game');
        showResult('Opponent left the game');
        // Reset the game board
        gameBoard = Array(3).fill(null).map(() => Array(3).fill(''));
        updateBoard();
        // Show menu button and hide restart
        const restartButton = document.querySelector('.game-controls button:first-child');
        if (restartButton) {
            restartButton.style.display = 'none';
        }
    }
});

// Game events
socket.on('tic_tac_toe_room_created', (data) => {
    console.log('Room created with code:', data.room_code);
    multiplayerRoomCode = data.room_code;
    // Update the room code display
    const roomCodeElement = document.getElementById('room-code');
    if (roomCodeElement) {
        roomCodeElement.textContent = data.room_code;
    }
});

socket.on('tic_tac_toe_opponent_joined', (data) => {
    console.log('Opponent joined:', data);
    updateRoomStatus('Opponent joined! Starting game...');
});

socket.on('tic_tac_toe_game_start', (data) => {
    console.log('Game started:', data);
    // Only update if we don't have a symbol yet or if it matches our current symbol
    if (!multiplayerPlayerSymbol || multiplayerPlayerSymbol === data.your_symbol) {
        multiplayerPlayerSymbol = data.your_symbol;
        multiplayerRoomCode = data.room_code;
        
        // Initialize the game board with the received data
        window.initOnlineGame(data.board, data.current_turn, data.your_symbol);
        
        // Switch to game screen
        showScreen('game-screen');
        document.getElementById('game-mode-display').textContent = `Online Game (You are ${data.your_symbol})`;
    }
});

socket.on('tic_tac_toe_move_made', (data) => {
    console.log('Move made:', data);
    window.handleOpponentMove(data.row, data.col, data.symbol, data.next_turn);
});

socket.on('tic_tac_toe_game_over', (data) => {
    console.log('Game over:', data);
    gameActive = false;
    const message = data.winner === multiplayerPlayerSymbol ? 
        '🎉 Congratulations! You Win! 🏆' : 
        '😔 Game Over! You Lost! 🎮';
    showResult(message);
    highlightWinner();
});

socket.on('tic_tac_toe_player_left', () => {
    gameActive = false;
    showResult('😕 Opponent left the game');
});

socket.on('tic_tac_toe_game_draw', () => {
    gameActive = false;
    showResult("🤝 It's a Draw! 🤝");
});

socket.on('tic_tac_toe_room_error', (error) => {
    console.error('Game error:', error);
    alert(error.message);
});

// Room management functions
function createRoom() {
    console.log('Creating room...');
    socket.emit('create_tic_tac_toe_room');
}

function joinRoom(roomCode) {
    console.log('Joining room:', roomCode);
    multiplayerRoomCode = roomCode;
    socket.emit('join_tic_tac_toe_room', {
        room_code: roomCode
    });
}

function sendMove(row, col) {
    console.log('Sending move:', {row, col, roomCode: multiplayerRoomCode});
    if (!multiplayerRoomCode) {
        console.log('No room code available');
        return;
    }
    socket.emit('make_tic_tac_toe_move', {
        row: row,
        col: col,
        room_code: multiplayerRoomCode
    });
}

// Room cancellation function
function cancelRoom() {
    if (multiplayerRoomCode) {
        socket.emit('cancel_room', {
            room_code: multiplayerRoomCode
        });
        // Reset multiplayer state
        multiplayerRoomCode = '';
        multiplayerPlayerSymbol = '';
        // Clear room code display
        const roomCodeElement = document.getElementById('room-code');
        if (roomCodeElement) {
            roomCodeElement.textContent = '';
        }
    }
}

// Make functions available globally
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.sendMove = sendMove;
window.multiplayerRoomCode = multiplayerRoomCode;
window.multiplayerPlayerSymbol = multiplayerPlayerSymbol;
