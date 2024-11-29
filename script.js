document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu');
  const lobby = document.querySelector('.lobby');
  const settings = document.querySelector('.settings');
  const game = document.querySelector('.game');
  const board = document.getElementById('board');

  const localBtn = document.getElementById('local-btn');
  const onlineBtn = document.getElementById('online-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const backFromLobbyBtn = document.getElementById('back-from-lobby');
  const backFromSettingsBtn = document.getElementById('back-from-settings');
  const backFromGameBtn = document.getElementById('back-from-game');
  const player1ColorInput = document.getElementById('player1-color');
  const player2ColorInput = document.getElementById('player2-color');

  let player1Color = player1ColorInput.value;
  let player2Color = player2ColorInput.value;
  let isGameOver = false;


  // Switch views
  function showMenu() {
    menu.classList.remove('hidden');
    lobby.classList.add('hidden');
    settings.classList.add('hidden');
    game.classList.add('hidden');
  }

  function showLobby() {
    menu.classList.add('hidden');
    lobby.classList.remove('hidden');
  }

  function showSettings() {
    menu.classList.add('hidden');
    settings.classList.remove('hidden');
  }

  function showGame() {
    menu.classList.add('hidden');
    game.classList.remove('hidden');
    createBoard();
  }

  // Create the game board
  function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.addEventListener('click', () => handleCellClick(cell, i));
      board.appendChild(cell);
    }
  }

  let currentPlayer = 'X';

  function handleCellClick(cell, index) {
    if (cell.textContent !== '') return;

    cell.textContent = currentPlayer;
    cell.style.color = currentPlayer === 'X' ? player1Color : player2Color;
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  }

  function checkGameOver() {
  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  const cells = Array.from(board.children);
  for (let combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      cells[a].textContent &&
      cells[a].textContent === cells[b].textContent &&
      cells[a].textContent === cells[c].textContent
    ) {
      showGameOver(`${cells[a].textContent} Wins!`);
      return true;
    }
  }

  // Check for a draw
  if (cells.every(cell => cell.textContent !== '')) {
    showGameOver("It's a Draw!");
    return true;
  }

  return false;
}

  function showGameOver(message) {
  isGameOver = true;
  const gameOverScreen = document.querySelector('.game-over');
  const gameOverMessage = document.getElementById('game-over-message');
  gameOverMessage.textContent = message;
  gameOverScreen.classList.remove('hidden');
}

  const gameOverReturnBtn = document.getElementById('game-over-return');
gameOverReturnBtn.addEventListener('click', () => {
  isGameOver = false;
  const gameOverScreen = document.querySelector('.game-over');
  gameOverScreen.classList.add('hidden');
  showMenu(); // Return to main menu
});

  function handleCellClick(cell, index) {
  if (cell.textContent !== '' || isGameOver || symbol === null) return;

  cell.textContent = symbol;
  cell.style.color = symbol === 'X' ? player1Color : player2Color;

  socket.emit('makeMove', { room, index, symbol });

  if (checkGameOver()) return; // Stop further moves if game ends

  // Switch to the next player
  symbol = symbol === 'X' ? 'O' : 'X';
}

  socket.on('moveMade', ({ index, symbol }) => {
  const cell = board.children[index];
  cell.textContent = symbol;
  cell.style.color = symbol === 'X' ? player1Color : player2Color;

  checkGameOver(); // Check if the opponent’s move ends the game
});

  let gameKey = null; // Unique game ID
let playerSymbol = null; // 'X' or 'O'

// Connect to Firebase Realtime Database
const gameRef = db.ref('games');

// Create or Join Game
function createGame() {
  const newGameRef = gameRef.push();
  newGameRef.set({
    board: Array(9).fill(''),
    currentPlayer: 'X',
    status: 'waiting'
  });
  gameKey = newGameRef.key;
  playerSymbol = 'X';
  monitorGame();
}

function joinGame(key) {
  gameKey = key;
  playerSymbol = 'O';
  gameRef.child(gameKey).update({ status: 'playing' });
  monitorGame();
}

  function makeMove(index) {
  gameRef.child(gameKey).once('value').then(snapshot => {
    const gameData = snapshot.val();
    if (gameData.board[index] === '' && gameData.currentPlayer === playerSymbol) {
      gameData.board[index] = playerSymbol;
      gameData.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';
      gameRef.child(gameKey).set(gameData);
    }
  });
}

function monitorGame() {
  gameRef.child(gameKey).on('value', snapshot => {
    const gameData = snapshot.val();
    if (!gameData) return;

    updateBoard(gameData.board);

    if (checkWinner(gameData.board)) {
      alert(`${playerSymbol} Wins!`);
      gameRef.child(gameKey).off(); // Stop listening
    } else if (gameData.board.every(cell => cell !== '')) {
      alert("It's a draw!");
      gameRef.child(gameKey).off(); // Stop listening
    }
  });
}

function updateBoard(board) {
  const cells = document.querySelectorAll('.cell');
  board.forEach((symbol, index) => {
    cells[index].textContent = symbol;
  });
}




  // Event Listeners
  localBtn.addEventListener('click', showGame);
  onlineBtn.addEventListener('click', showLobby);
  settingsBtn.addEventListener('click', showSettings);
  backFromLobbyBtn.addEventListener('click', showMenu);
  backFromSettingsBtn.addEventListener('click', showMenu);
  backFromGameBtn.addEventListener('click', showMenu);

  player1ColorInput.addEventListener('input', (e) => player1Color = e.target.value);
  player2ColorInput.addEventListener('input', (e) => player2Color = e.target.value);

  // Initialize the view
  showMenu();
});
