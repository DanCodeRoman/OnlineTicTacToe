document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('.menu');
  const lobby = document.querySelector('.lobby');
  const settings = document.querySelector('.settings');
  const game = document.querySelector('.game');
  const gameOverScreen = document.querySelector('.game-over');
  const board = document.getElementById('board');
  const gameKeyDisplay = document.getElementById('game-key-display');

  const localBtn = document.getElementById('local-btn');
  const onlineBtn = document.getElementById('online-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const backFromLobbyBtn = document.getElementById('back-from-lobby');
  const backFromSettingsBtn = document.getElementById('back-from-settings');
  const backFromGameBtn = document.getElementById('back-from-game');
  const gameOverReturnBtn = document.getElementById('game-over-return');
  const createGameBtn = document.getElementById('create-game');
  const joinGameBtn = document.getElementById('join-game');

  const player1ColorInput = document.getElementById('player1-color');
  const player2ColorInput = document.getElementById('player2-color');

  let player1Color = player1ColorInput.value;
  let player2Color = player2ColorInput.value;
  let currentPlayer = 'X';
  let gameKey = null;
  let playerSymbol = null;
  let isGameOver = false;

  // Firebase database reference
  const gameRef = ref(db, 'games'); // db is now properly initialized in the HTML script

  // UI Control Functions
  function showMenu() {
    menu.classList.remove('hidden');
    lobby.classList.add('hidden');
    settings.classList.add('hidden');
    game.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
  }

  function showLobby() {
    menu.classList.add('hidden');
    lobby.classList.remove('hidden');
  }

  function showGame() {
    menu.classList.add('hidden');
    game.classList.remove('hidden');
    createBoard();
  }

  function showGameOver(message) {
    isGameOver = true;
    const gameOverMessage = document.getElementById('game-over-message');
    gameOverMessage.textContent = message;
    gameOverScreen.classList.remove('hidden');
  }

  // Game Logic
  function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.addEventListener('click', () => handleMove(i));
      board.appendChild(cell);
    }
  }

  function handleMove(index) {
    if (isGameOver || currentPlayer !== playerSymbol) return;
    get(child(gameRef, gameKey)).then(snapshot => {
      const gameData = snapshot.val();
      if (gameData.board[index] === '') {
        gameData.board[index] = playerSymbol;
        gameData.currentPlayer = playerSymbol === 'X' ? 'O' : 'X';
        set(ref(gameRef, gameKey), gameData);
      }
    });
  }

  function updateBoard(boardState) {
    const cells = board.children;
    boardState.forEach((symbol, i) => {
      cells[i].textContent = symbol;
      cells[i].style.color = symbol === 'X' ? player1Color : player2Color;
    });
  }

  function monitorGame() {
    onValue(child(gameRef, gameKey), snapshot => {
      const gameData = snapshot.val();
      if (!gameData) return;
      updateBoard(gameData.board);
      if (checkWinner(gameData.board)) {
        showGameOver(`${gameData.currentPlayer === 'X' ? 'O' : 'X'} Wins!`);
        remove(child(gameRef, gameKey)); // End game and remove it from the database
      } else if (gameData.board.every(cell => cell !== '')) {
        showGameOver("It's a Draw!");
        remove(child(gameRef, gameKey));
      }
    });
  }

  function checkWinner(boardState) {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    return winningCombinations.some(([a, b, c]) => 
      boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]
    );
  }

  // Firebase Handlers
  function createGame() {
    const newGame = gameRef.push({
      board: Array(9).fill(''),
      currentPlayer: 'X',
      status: 'waiting'
    });
    gameKey = newGame.key;
    playerSymbol = 'X';
    gameKeyDisplay.textContent = `Game Key: ${gameKey}`;
    monitorGame();
  }

  function joinGame() {
    const key = prompt('Enter Game Key:');
    gameKey = key;
    playerSymbol = 'O';
    update(child(gameRef, gameKey), { status: 'playing' });
    monitorGame();
  }

  // Event Listeners
  localBtn.addEventListener('click', showGame);
  onlineBtn.addEventListener('click', showLobby);
  settingsBtn.addEventListener('click', () => settings.classList.remove('hidden'));
  backFromLobbyBtn.addEventListener('click', showMenu);
  backFromSettingsBtn.addEventListener('click', showMenu);
  backFromGameBtn.addEventListener('click', showMenu);
  gameOverReturnBtn.addEventListener('click', showMenu);
  createGameBtn.addEventListener('click', createGame);
  joinGameBtn.addEventListener('click', joinGame);
});
