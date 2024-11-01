var cvs = document.getElementById('canvas');
var ctx = cvs.getContext('2d');
var scoreText = document.getElementById('score');

var fieldW = 20; //field size in cells
var fieldH = 20; //field size in cells

var cellsW = cvs.width / fieldW;
var cellsH = cvs.height / fieldH;
const cellObject = {
    x: 0,
    y: 0,
    type: 'void',
    color: 'white',
    oldX: 0, //only for snake
    oldY: 0, //only for snake
    justSpawned: false, //only for snake
};
var snake = [];
var food = {};
Object.assign(food, cellObject);
var cells = [];
var direction = '';
const keyCodes = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    65: 'left',
    87: 'up',
    68: 'right',
    83: 'down',
};
const blockedDirections = {
    'left': 'right',
    'right': 'left',
    'up': 'down',
    'down': 'up'
}
var score = 0;
var isDead = false;
var isStarted = false;
var bordersKill = false;

function init() {
    cells = [];
    for(h = 0; h < fieldH; h++) {
        cells[h] = [];
        for(w = 0; w < fieldW; w++) {
            cells[h][w] = {}
            Object.assign(cells[h][w], cellObject);
            cells[h][w].x = w;
            cells[h][w].y = h;
        }
    }
}

function getEmptyCells() {
    var emptyCells = [];
    for(h = 0; h < cells.length; h++) {
        for(w = 0; w < cells[h].length; w++) {
            var cell = cells[h][w];
            if(cell.type == 'void') emptyCells.push(cell);
        }
    }

    return emptyCells;
}

function editCell(xold, yold, x, y, type, color) {
    for(h = 0; h < cells.length; h++) {
        for(w = 0; w < cells[h].length; w++) {
            var cell = cells[h][w];
            if(cell.x == xold && cell.y == yold) {
                if(x != -1 && y != -1) {
                    cell.x = x;
                    cell.y = y;
                }
                if(type) cell.type = type;
                if(color) cell.color = color;
            }
        }
    } 
}

function getCell(x, y) {
    for(h = 0; h < cells.length; h++) {
        for(w = 0; w < cells[h].length; w++) {
            var cell = cells[h][w];
            if(cell.x == x && cell.y == y) return cell;
        }
    }  
}

function spawnSnake() {
    var emptyCells = getEmptyCells();
    var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    snake = [];
    snake[0] = {};
    Object.assign(snake[0], cellObject);
    snake[0].x = randomCell.x;
    snake[0].y = randomCell.y;
    snake[0].type = 'snake';
    snake[0].color = 'lightgreen';
}

function spawnFood() {
    var emptyCells = getEmptyCells();
    var randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    food.x = randomCell.x;
    food.y = randomCell.y;
    food.type = 'food';
    food.color = 'red';
}

document.addEventListener('keydown', function(event) {
    if(isDead && event.keyCode == 32) {
        init();
        spawnSnake();
        spawnFood();
        direction = 38;
        isDead = false;
        score = 0;
    }
    if(!keyCodes[event.keyCode] || isDead) return;
    if(blockedDirections[keyCodes[direction]] == keyCodes[event.keyCode]) return;
    direction = event.keyCode;
    isStarted = true;
});

var start = null;
function move(time) {
    if(!start) start = time;
    var progress = time - start;
    if(progress > 100) {
        snake[0].oldX = snake[0].x;
        snake[0].oldY = snake[0].y;

        switch (keyCodes[direction]) {
          case 'left':
            snake[0].x -= 1;
            break;
          case 'right':
            snake[0].x += 1;
            break;
          case 'up':
            snake[0].y -= 1;
            break;
          case 'down':
            snake[0].y += 1;
            break;
        }

        //collision checks
        if(food.x == snake[0].x && food.y == snake[0].y) {
            spawnFood();
            score++;
            var part = {};
            Object.assign(part, cellObject);
            part.x = snake[snake.length - 1].x;
            part.y = snake[snake.length - 1].y;
            part.type = 'snake';
            part.color = 'lightgreen';
            part.justSpawned = true;
            snake.push(part);
        }

        for(i = 1; i < snake.length; i++) {
            if(snake[0].x == snake[i].x && snake[0].y == snake[i].y && !snake[i].justSpawned) {
                direction = '';
                isDead = true;
            }
        
        }

        if((snake[0].x < 0 || snake[0].x > fieldW - 1 || snake[0].y < 0 || snake[0].y > fieldH - 1 ) && bordersKill) {
            direction = '';
            isDead = true;
            return;
        }

        if(snake[0].x < 0) {
            snake[0].x = fieldW - 1;
        }

        if(snake[0].x > fieldW - 1) {
            snake[0].x = 0;
        }

        if(snake[0].y < 0) {
            snake[0].y = fieldH - 1;
        }

        if(snake[0].y > fieldH - 1) {
            snake[0].y = 0;
        }

        snake[snake.length - 1].justSpawned = false; //heck

        //snake follow head
        for(i = 1; i < snake.length; i++) {
            snake[i].oldX = snake[i].x;
            snake[i].oldY = snake[i].y;
            snake[i].x = snake[i - 1].oldX;
            snake[i].y = snake[i - 1].oldY;
        }

        //update
        for(h = 0; h < cells.length; h++) {
            for(w = 0; w < cells[h].length; w++) {
                var cell = cells[h][w];
                cell.type = 'void';
                cell.color = 'white';
            }
        }

        for (i = 0; i < snake.length; i++) {
            var snakePart = snake[i];
            editCell(snakePart.x, snakePart.y, -1, -1, snakePart.type, snakePart.color);
        }
        
        editCell(food.x, food.y, -1, -1, food.type, food.color);

        start = time;
    }
}

function draw() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);

    if(!isStarted || isDead) {
        ctx.filter = 'blur(3px)';
    } 

    for(h = 0; h < cells.length; h++) {
        for(w = 0; w < cells[h].length; w++) {
            var cell = cells[h][w];
            if(cell.type == 'void') continue;
            ctx.fillStyle = cell.color;
            ctx.beginPath();
            ctx.fillRect(cell.x * cellsW, cell.y * cellsH, cellsW, cellsH);
            ctx.fill();
        }
    
    }

    if(!isStarted) {
        ctx.filter = 'blur(0px)';
        ctx.font = '40px Montserrat, sans-serif ';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText('Press WASD or arrows to start!', cvs.width / 2, cvs.height / 2);
    }

    if(isDead) {
        ctx.filter = 'blur(0px)';
        ctx.font = '40px Montserrat, sans-serif ';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.fillText(`You are dead, your score is ${score}!`, cvs.width / 2, cvs.height / 2 - 25);
        ctx.fillText('Press SPACE to restart.', cvs.width / 2, cvs.height / 2 + 25);
    }

    scoreText.innerHTML = 'Score: ' + score;
}

function loop(time) {
    draw();
    if(!isDead) {
        move(time);
    }

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

init();
spawnSnake();
spawnFood();

var settingsButton = document.getElementById('settings-button');
var settingsForm = document.getElementById('settings-form');
var settingsContainer = document.getElementById('settings-container');
settingsContainer.style.visibility = 'hidden';

settingsForm.fieldw.value = fieldW;
settingsForm.fieldh.value = fieldH;
settingsForm.borders.checked = bordersKill;

settingsButton.addEventListener('click', function() {
    if(settingsContainer.style.visibility == 'hidden') {
        settingsContainer.style.visibility = 'visible' 
    } else {
        settingsForm.requestSubmit();
    }
});

settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    fieldW = settingsForm.fieldw.value;
    fieldH = settingsForm.fieldh.value;
    cellsW = cvs.width / fieldW;
    cellsH = cvs.height / fieldH;
    bordersKill = settingsForm.borders.checked;
    console.log(bordersKill);
    init();
    spawnSnake();
    spawnFood();
    direction = '';
    isDead = false;
    score = 0;
    isStarted = false;

    settingsContainer.style.visibility = 'hidden';
});