import { WORDS } from "./words.js";

//localStorage.setItem("winStreak", 0)
//localStorage.setItem("highStreak", 0)
//localStorage.clear()
let winStreak = 0;
let boardsSolved = 0;
let gameState = true;
if (localStorage.getItem("winStreak") == null) {
    localStorage.setItem("winStreak", 0)
} else {
    winStreak = parseInt(localStorage.getItem("winStreak"))
}

if (localStorage.getItem("highStreak") == null) {
    localStorage.setItem("highStreak", 0)
}

if (localStorage.getItem("boardsSolved") == null) {
    localStorage.setItem("boardsSolved", 0)
} else {
    boardsSolved = parseInt(localStorage.getItem("boardsSolved"))
}

let numberOfBoards = (Math.pow(winStreak + 1, 2));
const NUMBER_OF_GUESSES = numberOfBoards + 5;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessStringArray = [];

for (let i = 0; i < numberOfBoards; i++) {
    let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
    console.log(rightGuessString)
    rightGuessStringArray.push(rightGuessString)
}

function initBoards() {
    let boardGrid = document.getElementById("game-board-grid");
    for (let h = 0; h < numberOfBoards; h++) {
        let board = document.createElement("div")
        board.className = "game-board"

        for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
            let row = document.createElement("div")
            row.className = "letter-row"

            for (let j = 0; j < 5; j++) {
                let box = document.createElement("div")
                box.className = "letter-box"
                row.appendChild(box)
            }

            board.appendChild(row)
        }
        boardGrid.appendChild(board)
    }
}

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    for (let i = 0; i < numberOfBoards; i++) {
        let board = document.getElementsByClassName("game-board")[i]
        let row = board.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
        let box = row.children[nextLetter]
        if (!board.classList.contains("solved")) {
            box.textContent = pressedKey
            box.classList.add("filled-box")
        }
    }
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter() {
    for (let i = 0; i < numberOfBoards; i++) {
        let board = document.getElementsByClassName("game-board")[i]
        let row = board.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
        let box = row.children[nextLetter - 1]
        box.textContent = ""
        box.classList.remove("filled-box")
    }
    currentGuess.pop()
    nextLetter -= 1
}

function checkGuess() {
    for (let h = 0; h < numberOfBoards; h++) {
        let board = document.getElementsByClassName("game-board")[h]
        let row = board.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining]
        let guessString = ''
        let rightGuess = Array.from(rightGuessStringArray[h])

        for (const val of currentGuess) {
            guessString += val
        }

        if (guessString.length != 5) {
            toastr.error("Not enough letters!")
            return
        }

        if (!WORDS.includes(guessString)) {
            toastr.error("Word not in list!")
            return
        }

        for (let i = 0; i < 5; i++) {
            let letterColor = ''
            let box = row.children[i]
            let letter = currentGuess[i]
            let isGray = false
            
            let letterPosition = rightGuess.indexOf(currentGuess[i])
            // is letter in the correct guess
            if (letterPosition === -1) {
                letterColor = 'gray'
                isGray = true
            } else {
                // now, letter is definitely in word
                // if letter index and right guess index are the same
                // letter is in the right position 
                if (currentGuess[i] === rightGuess[i]) {
                    // shade green 
                    letterColor = 'green'
                } else {
                    // shade box yellow
                    letterColor = 'yellow'
                }

                rightGuess[letterPosition] = "#"
            }

            if (!board.classList.contains("solved")) {
                box.classList.add(letterColor)
                markGray(letter, isGray)
            }
        }

        if (guessString === rightGuessStringArray[h]) {
            board.classList.add("solved")
        }
    }

    if (document.getElementsByClassName("solved").length == numberOfBoards) {
        winStreak++
        localStorage.setItem("winStreak", winStreak.toString())
        boardsSolved += numberOfBoards
        localStorage.setItem("boardsSolved", boardsSolved.toString())
        if (winStreak > parseInt(localStorage.getItem("highStreak"))) {
            localStorage.setItem("highStreak", winStreak.toString())
        }
        winScreen()
        return
    } else {
        guessesRemaining -= 1;
        console.log(guessesRemaining)
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            localStorage.setItem("winStreak", 0)
            loseScreen()
            localStorage.setItem("boardsSolved", 0)
        }
    }
}

function markGray(letter, isGray) {
    if (isGray) {
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if (elem.textContent === letter && !elem.classList.contains("not-gray") && !elem.classList.contains("gray")) {
                elem.classList.add("gray")
            }
        }
    } else {
        for (const elem of document.getElementsByClassName("keyboard-button")) {
            if (elem.textContent === letter) {
                elem.classList.add("not-gray")
                elem.classList.remove("gray")
            }
        }
    }
}
//Device keyboard
document.addEventListener("keyup", (e) => {

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0 && gameState) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        if (gameState) {
            checkGuess()
        } else {
            location.reload()
        }
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})
//On-screen keyboard
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button")) {
        return
    }
    let key = target.textContent

    if (target.classList.contains("backspace")) {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

function cleanUp() {
    document.getElementById("title").classList.add("blur")
    document.getElementById("game-board-grid").classList.add("blur")
    document.getElementById("keyboard-cont").classList.add("blur")
    gameState = false
}
function loseScreen() {
    cleanUp()
    gameState = false
    let element = document.getElementById('lose')
    element.style.display = 'block'
    document.getElementById("lose-message").innerHTML = `Your win streak was: ${winStreak}<br/>Boards solved this streak: ${boardsSolved + document.getElementsByClassName("solved").length}<br/>Highest streak: ${localStorage.getItem("highStreak")}`
}

function winScreen() {
    cleanUp()
    let element = document.getElementById('win')
    element.style.display = 'block'
    document.getElementById("win-message").innerHTML = `Your win streak is: ${winStreak}<br/>Boards solved this streak: ${boardsSolved}<br/>Highest streak: ${localStorage.getItem("highStreak")}<br/>Next game will have ${(Math.pow(winStreak + 1, 2))} boards. Good luck.`
}

initBoards();