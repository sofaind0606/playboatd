let boardSize = parseInt(localStorage.getItem('boardSize') || '4', 10);
let cards = [];
let firstCard = null;
let secondCard = null;
let lock = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;
let isPaused = false;
const boardEl        = document.getElementById('board');
const movesEl        = document.getElementById('moves');
const finalMovesEl   = document.getElementById('final-moves');
const gameScreen     = document.getElementById('game-screen');
const startScreen    = document.getElementById('start-screen');
const settingsScreen = document.getElementById('settings-screen');
const winScreen      = document.getElementById('win-screen');
const offlineScreen  = document.getElementById('offline-screen');
const btnStart     = document.querySelector('#btn-start');
const btnSettings  = document.querySelector('#btn-settings');
const btnBack      = document.querySelector('#btn-back');
const btnRestart   = document.querySelector('#btn-restart');
const btnPlayAgain = document.querySelector('#btn-play-again');
const btnGameBack  = document.querySelector('#btn-game-back');
const btnWinBack   = document.querySelector('#btn-win-back');

//переход на другую странцицу
function goTo(page) {
  window.location.href = page;
}

//генерировать пары символов
function generateValues(pairs) {
  const symbols = ['🍎','🍌','🍇','🍒','🍓','🍑','🍍','🥝'];
  const chosen = symbols.slice(0, pairs);
  return chosen.concat(chosen);
}

//перемешать символы
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

//если нет доски выйти. пока есть первый ребенок удалить
function buildBoard() {
  if (!boardEl) return;

  while (boardEl.firstChild) {
    boardEl.removeChild(boardEl.firstChild);
  }



//динамичоность дом дерева
  //1б доступ к коллецкии элементов
  const screensByClass = document.getElementsByClassName('screen');
  console.log('Экранов найдено:', screensByClass.length);

  //1а доступ по порядковому номеру
  const firstScreen = document.body.children[0];
  console.log('Первый экран body:', firstScreen.id);

  //      1а доступ по name через гет элемент
  const sizeRadios = document.getElementsByName('size');
  for (let i = 0; i < sizeRadios.length; i++) {
    if (sizeRadios[i].checked) {
      boardSize = parseInt(sizeRadios[i].value, 10);
    }
  }//цикл по всвем но чек только одно

  const cols = 4;
  const rows = boardSize === 4 ? 4 : 2; //доска размер
  boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  totalPairs = (cols * rows) / 2;
  matchedPairs = 0;
  moves = 0;
  if (movesEl) movesEl.textContent = '0';

  // 3а,3г prepend+innerText надпись в начало игрового экрана
  let caption = document.getElementById('board-caption');
  if (caption) caption.remove();//если есть старая надпись удалить

  caption = document.createElement('p');
  caption.id = 'board-caption';
  caption.innerText = 'Найдите все пары';
  gameScreen.prepend(caption);

  //3а before отступ перед кнопкой заново
  let beforeRestart = document.getElementById('before-restart');
  if (beforeRestart) beforeRestart.remove();

  beforeRestart = document.createElement('div');
  beforeRestart.id = 'before-restart';
  beforeRestart.style.height = '10px';
  if (btnRestart) btnRestart.before(beforeRestart);

  cards = shuffle(generateValues(totalPairs)); //перемешать символы

  cards.forEach((value, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.value = value;
    card.dataset.index = index;
    card.setAttribute('data-value', value);

    //2б hasAttribute/removeAttribute
    card.setAttribute('data-temp', 'temp');
    if (card.hasAttribute('data-temp')) {
      card.removeAttribute('data-temp');
    }

    //2в атрибут как узел Attr
    const attrNode = card.getAttributeNode('data-value');
    console.log('Attr-узел:', attrNode.name, '=', attrNode.value);

    const newAttr = document.createAttribute('data-created');
    newAttr.value = 'yes';
    card.setAttributeNode(newAttr);

    const span = document.createElement('span');
    span.textContent = value;
    card.append(span);

    card.addEventListener('click', onCardClick);
    card.addEventListener('touchstart', onCardTouch, { passive: false });
    card.addEventListener('animationend', onAnimationEnd);

    //3а appendChild/insertBefore
    if (index === 0) {
      boardEl.appendChild(card);
    } else {
      boardEl.insertBefore(card, boardEl.lastChild);
    }

    //3а after разделитель после поля
    if (index === cards.length - 1) {
      const endMark = document.createElement('div');
      endMark.style.height = '10px';
      boardEl.after(endMark);
    }
  });

  //1г специальные свойства узлов
  console.log('parentNode поля:', boardEl.parentNode.id);
  console.log('firstChild поля:', boardEl.firstChild);
  console.log('lastChild поля:', boardEl.lastChild);
  const someCard = boardEl.querySelector('.card');
  if (someCard) {
    console.log('nextSibling карточки:', someCard.nextSibling);
    console.log('previousSibling карточки:', someCard.previousSibling);
  }

  //3в replaceChild
  const firstCardEl = boardEl.querySelector('.card');
  if (firstCardEl) {
    const oldSpan = firstCardEl.querySelector('span');
    const newSpan = oldSpan.cloneNode(true);
    firstCardEl.replaceChild(newSpan, oldSpan);
  }
}

//нажать по карточке
function onCardClick(event) {
  //10 свойства Event
  console.log('target:', event.target);
  console.log('timeStamp:', event.timeStamp);
  console.log('bubbles:', event.bubbles);

  event.stopPropagation();
  const card = event.target.closest('.card');
  if (!card) return;
  flipCard(card);
}

//сенсорное соб
function onCardTouch(event) {
  event.preventDefault();
  const card = event.target.closest('.card');
  if (!card) return;
  flipCard(card);
}

//анимация переворота дсоки
function onAnimationEnd(event) {
  if (event.animationName === 'flip') {
    
  }
}


function flipCard(card) {
  if (isPaused) return;
  if (lock) return;
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

  card.classList.add('flipped');

  const flipEvent = new CustomEvent('game:flip', {
    detail: { index: card.dataset.index, value: card.dataset.value }
  });
  document.dispatchEvent(flipEvent);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  if (movesEl) movesEl.textContent = moves;
  lock = true;

  checkMatch();
}

//проверка совпалений
function checkMatch() {
  const v1 = firstCard.getAttribute('data-value');
  const v2 = secondCard.getAttribute('data-value');

  if (v1 === v2) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    matchedPairs++;
    resetTurn();

    if (matchedPairs === totalPairs) {
      const winEvent = new CustomEvent('game:win', { detail: { moves } });
      document.dispatchEvent(winEvent);
    }
  } else {
    firstCard.style.borderColor = 'red';
    secondCard.style.borderColor = 'red';

    wait(1000).then(() => {
      firstCard.classList.remove('flipped');
      secondCard.classList.remove('flipped');
      firstCard.style.borderColor = '';
      secondCard.style.borderColor = '';
      resetTurn();
    });
  }
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lock = false;
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// событие ползб
document.addEventListener('game:flip', (event) => {
  console.log('game:flip ->', event.detail);
});

document.addEventListener('game:win', (event) => {
  localStorage.setItem('moves', event.detail.moves);
  goTo('win.html');
});

// кнопки
if (btnStart) {
  btnStart.onclick = () => {
    goTo('game.html');
  };
}

if (btnSettings) {
  btnSettings.onclick = () => {
    goTo('settings.html');
  };
}

if (btnBack) {
  btnBack.onclick = () => {
    const selected = document.querySelector('input[name="size"]:checked');
    boardSize = parseInt(selected.value, 10);
    localStorage.setItem('boardSize', boardSize);
    goTo('index.html');
  };
}

if (btnRestart) {
  btnRestart.onclick = () => {
    buildBoard();
  };
}

if (btnGameBack) {
  btnGameBack.onclick = () => {
    goTo('index.html');
  };
}

if (btnPlayAgain) {
  btnPlayAgain.onclick = () => {
    goTo('game.html');
  };
}

if (btnWinBack) {
  btnWinBack.onclick = () => {
    goTo('index.html');
  };
}

// клавиатура
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    goTo('index.html');
  }
});

//blur/focus пауза при сворачивании вкладки
window.addEventListener('blur', () => {
  isPaused = true;
});

window.addEventListener('focus', () => {
  isPaused = false;
});

//нет интернета
function showOffline() {
  if (!offlineScreen) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  offlineScreen.classList.remove('hidden');
}

function hideOffline() {
  if (!offlineScreen) return;
  offlineScreen.classList.add('hidden');
  document.querySelectorAll('.screen').forEach(s => {
    if (s.id !== 'offline-screen') s.classList.remove('hidden');
  });
}

if (!navigator.onLine) {
  showOffline();
}

window.addEventListener('offline', showOffline);
window.addEventListener('online', hideOffline);

//старт: если открыта game.html построить поле 
if (boardEl) {
  buildBoard();
}

// если открыта win.html показать результат
if (finalMovesEl) {
  const savedMoves = localStorage.getItem('moves') || '0';
  finalMovesEl.textContent = savedMoves;

  //3в replaceWith — заменить заголовок на странице победы
  const oldH2 = winScreen.querySelector('h2');
  if (oldH2) {
    const newH2 = document.createElement('h2');
    newH2.textContent = 'Победа!';
    oldH2.replaceWith(newH2);
  }

  localStorage.removeItem('moves');
}