from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room, disconnect, rooms
import random
import string

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", logger=True, engineio_logger=True)

# Game state storage
games = {}

@app.route('/')
def index():
    return render_template('index.html')

# Helper function to generate a room code
def generate_room_code():
    return ''.join(random.choices(string.digits, k=4))

@socketio.on('connect')
def handle_connect():
    print(f"Client connected")
    emit('connection_established', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected")
    current_rooms = [room for room in rooms() if room in games]
    for room_code in current_rooms:
        handle_player_leave(room_code)

@socketio.on('create_tic_tac_toe_room')
def handle_create_room():
    room_code = generate_room_code()
    while room_code in games:
        room_code = generate_room_code()
    
    games[room_code] = {
        'board': [['' for _ in range(3)] for _ in range(3)],
        'players': {},
        'current_turn': 'X',
        'game_started': False
    }
    
    # Add creator as player X
    join_room(room_code)
    session_id = rooms()[1]  # First room is session, second is game room
    games[room_code]['players'][session_id] = 'X'
    
    print(f"Created room {room_code}")
    # Send room created event only
    emit('tic_tac_toe_room_created', {
        'room_code': room_code,
        'your_symbol': 'X'
    })

@socketio.on('join_tic_tac_toe_room')
def handle_join_room(data):
    if not isinstance(data, dict) or 'room_code' not in data:
        emit('tic_tac_toe_room_error', {'message': 'Invalid room code format'})
        return

    room_code = data['room_code']
    if not room_code or not isinstance(room_code, str):
        emit('tic_tac_toe_room_error', {'message': 'Invalid room code'})
        return

    if room_code not in games:
        emit('tic_tac_toe_room_error', {'message': 'Room not found'})
        return
    
    if len(games[room_code]['players']) >= 2:
        emit('tic_tac_toe_room_error', {'message': 'Room is full'})
        return
    
    join_room(room_code)
    session_id = rooms()[1]  # First room is session, second is game room
    games[room_code]['players'][session_id] = 'O'
    games[room_code]['game_started'] = True
    
    print(f"Player joined room {room_code}")
    
    # Notify both players about the game start
    # Send to O player (joiner)
    emit('tic_tac_toe_game_start', {
        'board': games[room_code]['board'],
        'current_turn': games[room_code]['current_turn'],
        'your_symbol': 'O',
        'room_code': room_code
    })
    
    # Send to all other players in the room (including X)
    emit('tic_tac_toe_game_start', {
        'board': games[room_code]['board'],
        'current_turn': games[room_code]['current_turn'],
        'your_symbol': 'X',
        'room_code': room_code
    }, to=room_code, skip_sid=session_id)

@socketio.on('make_tic_tac_toe_move')
def handle_move(data):
    if not data or 'row' not in data or 'col' not in data or 'room_code' not in data:
        emit('tic_tac_toe_room_error', {'message': 'Invalid move data'})
        return

    room_code = data['room_code']
    if room_code not in games:
        emit('tic_tac_toe_room_error', {'message': 'Game not found'})
        return
    
    game = games[room_code]
    session_id = rooms()[1]  # First room is session, second is game room
    player_symbol = game['players'].get(session_id)
    
    if not player_symbol:
        emit('tic_tac_toe_room_error', {'message': 'Player not in game'})
        return
    
    if player_symbol != game['current_turn']:
        emit('tic_tac_toe_room_error', {'message': 'Not your turn'})
        return
    
    row, col = data['row'], data['col']
    if not (0 <= row < 3 and 0 <= col < 3):
        emit('tic_tac_toe_room_error', {'message': 'Invalid move position'})
        return
    
    if game['board'][row][col]:
        emit('tic_tac_toe_room_error', {'message': 'Cell already occupied'})
        return
    
    # Make the move
    game['board'][row][col] = player_symbol
    game['current_turn'] = 'O' if player_symbol == 'X' else 'X'
    
    # Broadcast the move to all players in the room
    emit('tic_tac_toe_move_made', {
        'row': row,
        'col': col,
        'symbol': player_symbol,
        'next_turn': game['current_turn']
    }, to=room_code)
    
    # Check for win or draw
    if check_winner(game['board']):
        emit('tic_tac_toe_game_over', {
            'winner': player_symbol
        }, to=room_code)
        cleanup_game(room_code)
    elif is_board_full(game['board']):
        emit('tic_tac_toe_game_over', {
            'winner': None
        }, to=room_code)
        cleanup_game(room_code)

@socketio.on('cancel_room')
def handle_cancel_room(data):
    if not isinstance(data, dict) or 'room_code' not in data:
        emit('tic_tac_toe_room_error', {'message': 'Invalid room code format'})
        return

    room_code = data['room_code']
    if room_code not in games:
        emit('tic_tac_toe_room_error', {'message': 'Room not found'})
        return

    # Notify other players in the room
    emit('tic_tac_toe_room_cancelled', {'message': 'Room has been cancelled by the host'}, 
         to=room_code, include_self=False)

    # Clean up the game state
    cleanup_game(room_code)

    print(f"Room {room_code} cancelled")
    emit('tic_tac_toe_room_cancelled', {'message': 'Room cancelled successfully'})

def check_winner(board):
    # Check rows, columns and diagonals
    for i in range(3):
        if board[i][0] and board[i][0] == board[i][1] == board[i][2]:
            return True
        if board[0][i] and board[0][i] == board[1][i] == board[2][i]:
            return True
    if board[0][0] and board[0][0] == board[1][1] == board[2][2]:
        return True
    if board[0][2] and board[0][2] == board[1][1] == board[2][0]:
        return True
    return False

def is_board_full(board):
    return all(all(cell != '' for cell in row) for row in board)

def cleanup_game(room_code):
    if room_code in games:
        del games[room_code]

def handle_player_leave(room_code):
    if room_code in games:
        # Notify remaining players that opponent left
        emit('tic_tac_toe_opponent_left', {}, to=room_code)
        # Reset the game board
        games[room_code]['board'] = [['' for _ in range(3)] for _ in range(3)]
        games[room_code]['current_turn'] = 'X'
        games[room_code]['game_started'] = False
        cleanup_game(room_code)

if __name__ == '__main__':
    # Use eventlet for WebSocket support
    import eventlet
    eventlet.monkey_patch()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)