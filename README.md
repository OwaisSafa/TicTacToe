# Tic Tac Toe Game

A web-based Tic Tac Toe game with multiple game modes built using Flask and Socket.IO.

## Features

- 🎮 Game Modes:
  - Local 2-Player Mode
  - AI Mode with different difficulty levels (Easy, Medium, Hard)
  - Online Multiplayer Mode

- 🎯 Game Features:
  - Real-time multiplayer using WebSocket
  - Room-based matchmaking for online play
  - Winner highlighting animations

- 💻 Technical Features:
  - Flask backend
  - Socket.IO for real-time communication
  - Modern CSS with animations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/OwaisSafa/TicTacToe.git
cd TicTacToe
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the server:
```bash
python server.py
```

4. Open your browser and navigate to:
```
http://localhost:5000
```

## Game Modes

### Local Mode
- Play against a friend on the same device
- X's and O's take turns
- Winner is highlighted

### AI Mode
- Play against the computer
- Three difficulty levels: Easy, Medium, Hard
- Uses minimax algorithm in Hard mode

### Online Mode
- Real-time game updates
- Room-based matchmaking
- Player turn indicators

## Technologies Used

- Backend:
  - Python
  - Flask
  - Flask-SocketIO

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Socket.IO Client

## Author

- [@OwaisSafa](https://github.com/OwaisSafa)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
