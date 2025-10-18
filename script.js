// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// PWA Install Prompt
let deferredPrompt;
const installPrompt = document.getElementById('installPrompt');
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installPrompt.style.display = 'block';
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            installPrompt.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

// Your Original Crossword Game Logic
class SetswanaCrossword {
    constructor() {
        this.grid = [
            [1, 2, 3, 0, 4, 0, 5, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [6, 0, 0, 0, 7, 0, 0, 0, 8, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [9, 0, 0, 10, 0, 0, 11, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [12, 0, 0, 13, 0, 0, 14, 0, 0, 15],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [16, 0, 0, 0, 17, 0, 0, 0, 18, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        
        this.solutions = {
            across: {
                1: { word: "DUMELA", clue: "Greeting in Setswana", cells: [[0,0], [0,1], [0,2]] },
                4: { word: "TSWANA", clue: "Another name for Setswana people", cells: [[0,4], [0,5], [0,6], [0,7], [0,8], [0,9]] },
                6: { word: "PULA", clue: "Rain (also currency)", cells: [[2,0], [2,1], [2,2], [2,3]] },
                9: { word: "LORATO", clue: "Love", cells: [[4,0], [4,1], [4,2], [4,3], [4,4], [4,5]] },
                12: { word: "MME", clue: "Mother", cells: [[6,0], [6,1], [6,2]] },
                16: { word: "RRA", clue: "Father", cells: [[8,0], [8,1], [8,2]] }
            },
            down: {
                2: { word: "MPHO", clue: "Gift", cells: [[0,2], [1,2], [2,2], [3,2]] },
                3: { word: "LEBOGO", clue: "Thank you", cells: [[0,3], [1,3], [2,3], [3,3], [4,3], [5,3]] },
                5: { word: "NTLO", clue: "House", cells: [[0,6], [1,6], [2,6], [3,6]] },
                7: { word: "SELO", clue: "Thing", cells: [[2,4], [3,4], [4,4], [5,4]] },
                8: { word: "BORRA", clue: "Fathers (plural)", cells: [[2,8], [3,8], [4,8], [5,8], [6,8]] },
                10: { word: "MOSADI", clue: "Woman", cells: [[4,3], [5,3], [6,3], [7,3], [8,3], [9,3]] },
                13: { word: "MONNA", clue: "Man", cells: [[6,3], [7,3], [8,3], [9,3], [10,3]] },
                14: { word: "BANA", clue: "Children", cells: [[6,6], [7,6], [8,6], [9,6]] },
                15: { word: "LEFATSHE", clue: "Earth/World", cells: [[6,9], [7,9], [8,9], [9,9], [10,9], [11,9], [12,9], [13,9]] },
                17: { word: "KGOSI", clue: "King/Chief", cells: [[8,4], [9,4], [10,4], [11,4], [12,4]] },
                18: { word: "MOTSE", clue: "Village", cells: [[8,8], [9,8], [10,8], [11,8], [12,8]] }
            }
        };
        
        this.userAnswers = {};
        this.score = 0;
        this.initializeGame();
    }

    initializeGame() {
        this.createBoard();
        this.displayClues();
        this.setupEventListeners();
        this.updateScore();
    }

    createBoard() {
        const board = document.getElementById('crossword');
        board.innerHTML = '';
        
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.grid[row][col] === 0) {
                    cell.classList.add('block');
                } else {
                    const cellNumber = this.grid[row][col];
                    if (cellNumber > 0) {
                        cell.classList.add('numbered');
                        cell.dataset.number = cellNumber;
                    }
                    
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.row = row;
                    input.dataset.col = col;
                    cell.appendChild(input);
                }
                
                board.appendChild(cell);
            }
        }
    }

    displayClues() {
        const acrossClues = document.getElementById('across-clues');
        const downClues = document.getElementById('down-clues');
        
        acrossClues.innerHTML = '';
        downClues.innerHTML = '';
        
        Object.entries(this.solutions.across).forEach(([number, data]) => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue';
            clueElement.textContent = `${number}. ${data.clue}`;
            acrossClues.appendChild(clueElement);
        });
        
        Object.entries(this.solutions.down).forEach(([number, data]) => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue';
            clueElement.textContent = `${number}. ${data.clue}`;
            downClues.appendChild(clueElement);
        });
    }

    setupEventListeners() {
        // Input navigation
        document.addEventListener('input', (e) => {
            if (e.target.type === 'text') {
                this.handleInput(e.target);
            }
        });
        
        // Buttons
        document.getElementById('check-btn').addEventListener('click', () => this.checkAnswers());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetPuzzle());
        document.getElementById('hint-btn').addEventListener('click', () => this.provideHint());
    }

    handleInput(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = input.value.toUpperCase();
        
        if (value && /^[A-Z]$/.test(value)) {
            // Auto-advance to next cell
            const nextInput = this.findNextInput(row, col);
            if (nextInput) {
                nextInput.focus();
            }
        }
    }

    findNextInput(row, col) {
        // Simple auto-advance logic
        let nextCol = col + 1;
        let nextRow = row;
        
        if (nextCol >= 10) {
            nextCol = 0;
            nextRow++;
        }
        
        if (nextRow >= 10) return null;
        
        return document.querySelector(`input[data-row="${nextRow}"][data-col="${nextCol}"]`);
    }

    checkAnswers() {
        let correct = 0;
        let total = 0;
        
        // Check all solutions
        Object.values(this.solutions.across).forEach(data => {
            total++;
            if (this.checkWord(data.cells, data.word)) {
                correct++;
                this.highlightWord(data.cells, true);
            }
        });
        
        Object.values(this.solutions.down).forEach(data => {
            total++;
            if (this.checkWord(data.cells, data.word)) {
                correct++;
                this.highlightWord(data.cells, true);
            }
        });
        
        this.score = Math.round((correct / total) * 100);
        this.updateScore();
        
        if (correct === total) {
            alert('Congratulations! You completed the puzzle!');
        }
    }

    checkWord(cells, word) {
        return cells.every(([row, col], index) => {
            const input = document.querySelector(`input[data-row="${row}"][data-col="${col}"]`);
            return input && input.value.toUpperCase() === word[index];
        });
    }

    highlightWord(cells, isCorrect) {
        cells.forEach(([row, col]) => {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell && isCorrect) {
                cell.classList.add('correct');
            }
        });
    }

    resetPuzzle() {
        document.querySelectorAll('input[type="text"]').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('correct');
        });
        this.score = 0;
        this.updateScore();
    }

    provideHint() {
        // Find first incorrect word and reveal first letter
        const allWords = [...Object.values(this.solutions.across), ...Object.values(this.solutions.down)];
        
        for (const wordData of allWords) {
            if (!this.checkWord(wordData.cells, wordData.word)) {
                const [firstRow, firstCol] = wordData.cells[0];
                const input = document.querySelector(`input[data-row="${firstRow}"][data-col="${firstCol}"]`);
                if (input && !input.value) {
                    input.value = wordData.word[0];
                    this.score = Math.max(0, this.score - 10); // Penalty for hint
                    this.updateScore();
                    break;
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SetswanaCrossword();
});

// PWA: Track app usage
window.addEventListener('appinstalled', () => {
    console.log('Setswana Crossword PWA was installed');
});