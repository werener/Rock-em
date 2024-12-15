// credit to kroften4 for making this snake:     https://kroften4.github.io/

class Vec {
    constructor(x, y) {
        this.x = x; this.y = y;
    }
    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
    equals(other) {
        if (this.x == other.x && this.y == other.y)
            return true;
    }
}

class State {
    constructor(snake, apple, status) {
        this.snake = snake;
        this.apple = apple;
        this.status = status;
    }

    update(keys) {
        let newSnake = this.snake.update(keys);
        let newApple = this.apple.apple;
        if (this.apple.exists && this.apple.isEaten(newSnake)) {
            newSnake = newSnake.extend();
            newApple = Apple.spawn(newSnake.tail);
        }
        let status = Snake.checkState(newSnake.tail);
        if (this.status == "winning")
            status = "won";
        if (status == "lost" || this.status == "won") {
            this.status = status;
            return this;
        }
        return new State(newSnake, newApple, status);
    }

    static create() {
        let snake = Snake.create();
        let apple = Apple.spawn(snake.tail);
        let status = "playing";
        return new State(snake, apple, status);
    }
}

class Snake {
    constructor(tail, currDirection, prevEndPos) {
        this.tail = tail;
        this.#currDirection = currDirection;
        this.prevEndPos = prevEndPos;
    }

    #directions = {
        "ArrowUp": new Vec(0, -1),
        "ArrowDown": new Vec(0, 1),
        "ArrowRight": new Vec(1, 0),
        "ArrowLeft": new Vec(-1, 0)
    }

    #currDirection;

    get currDirection() {
        return this.#currDirection;
    }

    get directions() {
        return this.#directions;
    }

    move(key) {
        let newTail = this.tail.slice();
        let prevEndPos = newTail.pop();
        let newPos = newTail[0].plus(this.#directions[key])
        // newPos.x = (fieldSize.x + newPos.x) % fieldSize.x;
        // newPos.y = (fieldSize.y + newPos.y) % fieldSize.y;
        newTail.unshift(newPos);
        return new Snake(newTail, key, prevEndPos);
    }

    static checkState(tail) {
        if (tail.length === fieldSize.x * fieldSize.y)
            return "winning";
        let headPos = tail[0];
        if (headPos.x < 0 || headPos.x >= fieldSize.x ||
            headPos.y < 0 || headPos.y >= fieldSize.y)
            return "lost";
        for (let partPos of tail.slice(1)) {
            if (tail[0].equals(partPos))
                return "lost";
        }
        return "playing";
    }

    update(recentKeys) {
        let nextDirection = this.#currDirection;
        let amount = 0;
        for (let key of recentKeys.keys) {
            amount += 1;
            if (key == this.#currDirection)
                continue;
            let newPos = this.tail[0].plus(this.#directions[key])
            let prevPos = this.tail[1]
            if (!newPos.equals(prevPos)) {
                nextDirection = key;
                break;
            }
        }
        recentKeys.keys = recentKeys.keys.slice(amount);
        return this.move(nextDirection);
    }

    extend() {
        let newTail = this.tail.slice();
        newTail.push(this.prevEndPos);
        return new Snake(newTail, this.#currDirection);
    }

    static create() {
        let x = Math.floor(fieldSize.x / 2);
        let y = Math.floor(fieldSize.y / 2);
        let pos = new Vec(x, y);
        const initialLength = 3;
        let tail = [];
        for (let i = 0; i < initialLength; i++) {
            let tile = new Vec(pos.x + i, pos.y)
            tail.push(tile);
        }
        return new Snake(tail, "ArrowLeft");
    }
}

class Apple {
    constructor(pos, exists, isNew) {
        this.pos = pos;
        this.exists = exists;
        this.isNew = isNew;
    }

    static spawn(tail) {
        let spawningSpace = [];
        for (let x = 0; x < fieldSize.x; x++) {
            for (let y = 0; y < fieldSize.y; y++) {
                let tile = new Vec(x, y);
                if (!tail.some(partPos => partPos.equals(tile)))
                    spawningSpace.push(tile);
            }
        }
        if (spawningSpace.length != 0) {
            let randomTileIndex = Math.floor(Math.random() * spawningSpace.length);
            return new Apple(spawningSpace[randomTileIndex], true, true);
        }
        return new Apple(null, false);
    }

    isEaten(snake) {
        if (snake.tail[0].equals(this.pos))
            return true;
        return false;
    }

    get apple() {
        return new Apple(this.pos, true);
    }
}

function trackRecentKeys(keys) {
    let recent = Object.create(null);
    recent.keys = []
    function track(event) {
        if (keys.includes(event.key)) {
            if (event.key != recent.keys.slice(-1) && recent.keys.length < 3)
                recent.keys.push(event.key);
            event.preventDefault();
        }
    }
    window.addEventListener("keydown", track);
    return recent;
}

function drawField() {
    cx.clearRect(0, 0, canvas.width, canvas.height);
    // cx.fillStyle = "LightGreen";
    cx.fillStyle = "rgb(200,191,231)"
    cx.fillRect(0, 0, fieldSize.x * scale, fieldSize.y * scale);
}

function drawSnake(snake) {
    let tail = snake.tail;
    //body
    // cx.fillStyle = "Green";
    cx.fillStyle = "rgb(119,178,85)";
    for (let tailPart of tail) {
        cx.fillRect(tailPart.x * scale, tailPart.y * scale, scale, scale);
    }
    //head
    const turn = 0.5 * Math.PI;
    const angles = {
        "ArrowUp": turn,
        "ArrowRight": turn * 2,
        "ArrowDown": turn * 3,
        "ArrowLeft": 0
    }
    let headPos = tail[0];
    let headCenter = new Vec(headPos.x * scale + scale / 2, headPos.y * scale + scale / 2);
    cx.save();
    cx.translate(headCenter.x, headCenter.y);
    cx.rotate(angles[snake.currDirection]);
    cx.translate(-headCenter.x, -headCenter.y);
    cx.fillStyle = "Black";
    // eyes
    const eyeSize = new Vec(scale * 0.18, scale * 0.18)
    cx.fillRect(headPos.x * scale + scale * 0.25 - eyeSize.x / 2, headPos.y * scale + scale * 0.28 - eyeSize.y / 2, eyeSize.x, eyeSize.y)
    cx.fillRect(headPos.x * scale + scale * 0.25 - eyeSize.x / 2, headPos.y * scale + scale * 0.72 - eyeSize.y / 2, eyeSize.x, eyeSize.y)
    // tongue
    const tongueSize = new Vec(scale * 0.33, scale * 0.25);
    cx.fillStyle = "Red";
    cx.fillRect(headPos.x * scale - tongueSize.x, headPos.y * scale + (scale - tongueSize.y) / 2, tongueSize.x, tongueSize.y);
    // hat
    const outerHeadSize = new Vec(scale * 0.8, scale * 0.8)
    cx.fillStyle = "rgb(102,69,0)";
    cx.fillRect(headPos.x * scale + (scale * 1.8 - outerHeadSize.x) / 2,
        headPos.y * scale + (scale - outerHeadSize.x) / 2, outerHeadSize.x, outerHeadSize.y)
    const innerHeadSize = new Vec(scale * 0.5, scale * 0.5)
    cx.fillStyle = "rgb(130,93,14)";
    cx.fillRect(headPos.x * scale + (scale * 1.8 - innerHeadSize.x) / 2,
        headPos.y * scale + (scale - innerHeadSize.x) / 2, innerHeadSize.x, innerHeadSize.y)
    cx.restore();
    // cx.fillRect(headCenter.x - 1.5, headCenter.y - 1.5, 3, 3); // cyclope
}



function drawApple(apple) {
    let applePos = new Vec(apple.pos.x * scale, apple.pos.y * scale);
    if (apple.isNew) {
        appleImg = Math.floor(Math.random() * exoticApplesImgs.length)
    }
    let img = exoticApplesImgs[appleImg];
    cx.drawImage(img, applePos.x, applePos.y, scale, scale);
    // cx.fillStyle = "red";
    // cx.beginPath();
    // cx.arc(apple.pos.x * scale + scale * 0.4625, apple.pos.y * scale + scale * 0.4625, scale * 0.4625, 0, 7);
    // cx.shadowColor = "Black";
    // cx.shadowOffsetX = scale * 0.075;
    // cx.shadowOffsetY = scale * 0.075;
    // cx.fill();
    // cx.shadowOffsetX = 0;
    // cx.shadowOffsetY = 0;
}

let scoreDisplay = document.querySelector("#krftn-snake-score");
if (scoreDisplay !== null) {
    scoreDisplay.style = "display: none";
    document.body.appendChild(scoreDisplay);
}
function drawState(state) {
    if (state.status == "playing" || state.status == "winning") {
        let snake = state.snake;
        let apple = state.apple;
        if (scoreDisplay !== null) {
            scoreDisplay.innerText = "Score: " + snake.tail.length;
            scoreDisplay.style = "";
        }
        drawField();
        if (apple.exists)
            drawApple(apple);
        drawSnake(snake);
        return;
    }
    if (scoreDisplay !== null)
        scoreDisplay.style = "display: none";
    let message = "";
    if (state.status == "lost") {
        message = "GAME OVER";
        cx.fillStyle = "DarkRed";
    } else if (state.status == "won") {
        message = "VICTORY";
        cx.fillStyle = "SteelBlue";
    }
    cx.textAlign = "center";
    cx.textBaseline = "middle"
    cx.font = `normal ${scale * 1.5}px Arial`;
    cx.fillText(message, fieldSize.x * scale / 2, fieldSize.y * scale / 2);
}

const lennonDomain = "https://kroften4.github.io/LennonTheSnake/"
const exoticApplesSrc = [
    lennonDomain + "assets/apple.svg",
    lennonDomain + "assets/avocado.svg",
    lennonDomain + "assets/beans.svg",
    lennonDomain + "assets/cherries.svg",
    lennonDomain + "assets/corn.svg",
    lennonDomain + "assets/ginger.svg",
    lennonDomain + "assets/grapes.svg",
    lennonDomain + "assets/mushroom.svg",
    lennonDomain + "assets/pineapple.svg",
    lennonDomain + "assets/tea_leaves.svg"
];

function preloadImages(urls) {
    const promises = urls.map((url) => {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.src = url;

            image.onload = () => resolve(image);
            image.onerror = () => reject(`Image failed to load: ${url}`);
        });
    });

    return Promise.all(promises);
}

let exoticApplesImgs;
let recentArrowKeys;
let fieldSize;
let canvas;
let cx;
let scale;
let state;
let appleImg;
async function initializeGame() {
    exoticApplesImgs = await preloadImages(exoticApplesSrc);
    recentArrowKeys = trackRecentKeys(["ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"]);
    fieldSize = new Vec(15, 15);
    canvas = document.querySelector("#krftn-snake-game");
    if (canvas === null)
        throw new Error("krftn Snake Game: couldn't find canvas with id krftn-snake-game");
    scale = canvas.getAttribute("data-scale") ?? 30;
    appleImg = Math.floor(Math.random() * exoticApplesImgs.length);
    canvas.height = scale * fieldSize.x;
    canvas.width = scale * fieldSize.y;
    cx = canvas.getContext("2d");
    state = State.create();
    drawState(state);
    cx.textAlign = "center";
    cx.fillStyle = "black";
    cx.font = `bold ${scale / 2}px Arial`;
    cx.fillText("Click to start the game", fieldSize.x * scale * 0.5, fieldSize.y * scale * 0.7);
    canvas.addEventListener("click", function startGame(event) {
        runGame();
        event.preventDefault();
    }, { once: true });
}

function runGame() {
    let interval = setInterval(() => {
        let ended = false;
        requestAnimationFrame((timestamp) => {
            state = state.update(recentArrowKeys);
            drawState(state);
            if (state.status == "won" || state.status == "lost") {
                cx.textAlign = "center";
                cx.fillStyle = "black";
                cx.font = `bold ${scale / 2}px Arial`;
                cx.fillText(`Your score: ${state.snake.tail.length}. Click to restart`,
                    fieldSize.x * scale * 0.5, fieldSize.y * scale * 0.7);
                clearInterval(interval);
                canvas.addEventListener("click", function startGame(event) {
                    initializeGame();
                }, { once: true });
            }
        })
    }, 150)
}

initializeGame();