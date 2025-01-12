// Screens
const screens = {
    home: document.getElementById('homeScreen'),
    nickname: document.getElementById('nicknameScreen'),
    game: document.getElementById('gameScreen'),
    leaderboard: document.getElementById('leaderboardScreen')
};

// Home screen elements
const homeElements = {
    startButton: document.getElementById('startHomeButton'),
    leaderboardButton: document.getElementById('homeLeaderboardButton'),
    themeToggle: document.getElementById('homeThemeToggle'),
    totalPlayers: document.getElementById('totalPlayers'),
    gamesPlayed: document.getElementById('gamesPlayed'),
    highestScore: document.getElementById('highestScore')
};

// Support elements
const supportElements = {
    dialog: document.getElementById('supportDialog'),
    form: document.getElementById('supportForm'),
    button: document.getElementById('supportButton'),
    closeButton: document.getElementById('closeSupportDialog'),
    nameInput: document.getElementById('supportName'),
    emailInput: document.getElementById('supportEmail'),
    subjectInput: document.getElementById('supportSubject'),
    messageInput: document.getElementById('supportMessage')
};

// Game elements
const elements = {
    // Game stats
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    timer: document.getElementById('timer'),
    question: document.getElementById('question'),
    options: document.querySelectorAll('.option'),
    currentStreak: document.getElementById('currentStreak'),
    highScore: document.getElementById('highScore'),
    playerNickname: document.getElementById('playerNickname'),
    
    // Control buttons
    pauseButton: document.getElementById('pauseButton'),
    soundToggle: document.getElementById('soundToggle'),
    themeToggle: document.getElementById('themeToggle'),
    toggleLeaderboard: document.getElementById('toggleLeaderboard'),
    
    // Powerup buttons
    powerups: {
        doublePoints: document.getElementById('doublePoints'),
        extraTime: document.getElementById('extraTime'),
        shield: document.getElementById('shield'),
        fiftyFifty: document.getElementById('fiftyFifty')
    },
    
    // Dialogs
    pauseDialog: document.getElementById('pauseDialog'),
    gameOverDialog: document.getElementById('gameOverDialog'),
    inGameLeaderboardDialog: document.getElementById('inGameLeaderboardDialog'),
    
    // Dialog buttons
    resumeGame: document.getElementById('resumeGame'),
    restartCurrentGame: document.getElementById('restartCurrentGame'),
    quitToMenu: document.getElementById('quitToMenu'),
    restartButton: document.getElementById('restartGame'),
    
    // Leaderboard elements
    leaderboardList: document.querySelector('.leaderboard-list'),
    miniLeaderboard: document.querySelector('.mini-leaderboard'),
    gameLeaderboard: document.querySelector('.game-leaderboard'),
    closeGameLeaderboard: document.getElementById('closeGameLeaderboard'),
    closeInGameLeaderboard: document.getElementById('closeInGameLeaderboard'),
    showLeaderboardAfterGame: document.getElementById('showLeaderboardAfterGame'),
    closeLeaderboard: document.getElementById('closeLeaderboard'),
    
    // Stats elements
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    questionsAnswered: document.getElementById('questionsAnswered'),
    finalNickname: document.getElementById('finalNickname'),
    
    // Nickname elements
    nicknameInput: document.getElementById('nicknameInput'),
    startButton: document.getElementById('startButton')
}; 

// Game state
const gameState = {
    level: 1,
    score: 0,
    timer: 20,
    isPlaying: false,
    streak: 0,
    nickname: '',
    highScore: localStorage.getItem('highScore') || 0,
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    powerups: {
        doublePoints: { active: false, timer: null },
        shield: { active: false },
        fiftyFifty: { active: false }
    },
    isPaused: false,
    hasLeaderboardUpdates: false,
    questionsAnswered: 0
};

// Initialize sound settings
let isDarkTheme = localStorage.getItem('darkTheme') === 'true';
let timerInterval;

// Sound effects with better URLs
const sounds = {
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    powerup: new Audio('sounds/powerup.mp3'),
    gameOver: new Audio('sounds/game-over.mp3')
};

// Preload all sounds
Object.values(sounds).forEach(sound => {
    sound.load();
    sound.preload = 'auto';
});

// Set initial volumes
sounds.correct.volume = 0.3;
sounds.wrong.volume = 0.2;
sounds.powerup.volume = 0.4;
sounds.gameOver.volume = 0.3;

// Sound playing function
async function playSound(soundName) {
    if (!gameState.soundEnabled || !sounds[soundName]) return;

    try {
        const sound = sounds[soundName];
        
        // Reset the sound
        sound.pause();
        sound.currentTime = 0;
        
        // Create a new promise for playing
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
            try {
                await playPromise;
            } catch (error) {
                console.log('Playback failed:', error);
                // Try playing with a new instance
                const newSound = new Audio(sound.src);
                newSound.volume = sound.volume;
                await newSound.play();
            }
        }
    } catch (error) {
        console.error('Sound playback error:', error);
    }
}

// Tüm sesleri durduran fonksiyon
function stopAllSounds() {
    Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
}

// Screen management
function showScreen(screenId) {
    // Hide all screens first
    Object.values(screens).forEach(screen => {
        if (screen) {
            screen.classList.remove('active');
        }
    });
    
    // Show the requested screen
    if (screens[screenId]) {
        screens[screenId].classList.add('active');
        
        // Additional actions for specific screens
        if (screenId === 'home') {
            updateGameStats();
            gameState.isPlaying = false;
            gameState.isPaused = false;
            if (timerInterval) clearInterval(timerInterval);
        }
        else if (screenId === 'nickname') {
            elements.nicknameInput.value = '';
            elements.nicknameInput.focus();
        }
        else if (screenId === 'game') {
            gameState.isPlaying = true;
            gameState.isPaused = false;
            startGame();
        }
    }
}

// Initialize the game
async function initializeGame() {
    // Set initial theme
    isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    updateTheme();
    
    // Initialize EmailJS
    emailjs.init("RVxxJr0By_5Fz5ZRL");
    
    // Initialize game state
    gameState.isPlaying = false;
    gameState.isPaused = false;
    gameState.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    gameState.highScore = parseInt(localStorage.getItem('highScore')) || 0;
    
    // Update sound button state
    if (elements.soundToggle) {
        elements.soundToggle.innerHTML = gameState.soundEnabled ? '🔊 Sound' : '🔇 Mute';
    }
    
    // Clear any existing intervals
    if (timerInterval) clearInterval(timerInterval);
    
    // Show home screen by default
    showScreen('home');
    
    // Update initial stats
    updateGameStats();
}

// Call initialization when document is ready
document.addEventListener('DOMContentLoaded', initializeGame); 

// Theme handling
function updateTheme() {
    document.body.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    
    // Update all theme toggle buttons
    const themeText = isDarkTheme ? '☀️ Light' : '🌙 Dark';
    if (elements.themeToggle) elements.themeToggle.innerHTML = themeText;
    if (homeElements.themeToggle) homeElements.themeToggle.innerHTML = themeText;
}

// Theme toggle event listeners
if (elements.themeToggle) {
    elements.themeToggle.addEventListener('click', toggleTheme);
}
if (homeElements.themeToggle) {
    homeElements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('darkTheme', isDarkTheme);
    updateTheme();
} 

// Navigation event listeners
function setupNavigationListeners() {
    // Home screen buttons
    homeElements.startButton.addEventListener('click', () => {
        showScreen('nickname');
    });

    // Back button on nickname screen
    document.getElementById('backToHome').addEventListener('click', () => {
        showScreen('home');
    });

    homeElements.leaderboardButton.addEventListener('click', () => {
        displayLeaderboard();
        showScreen('leaderboard');
    });

    // Nickname screen buttons
    elements.startButton.addEventListener('click', () => {
        const nickname = elements.nicknameInput.value.trim();
        if (nickname) {
            gameState.nickname = nickname;
            elements.playerNickname.textContent = nickname;
            elements.finalNickname.textContent = nickname;
            showScreen('game');
            startGame();
        } else {
            elements.nicknameInput.focus();
        }
    });

    // Enter key for nickname input
    elements.nicknameInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const nickname = elements.nicknameInput.value.trim();
            if (nickname) {
                gameState.nickname = nickname;
                elements.playerNickname.textContent = nickname;
                elements.finalNickname.textContent = nickname;
                showScreen('game');
                startGame();
            }
        }
    });

    // Leaderboard navigation
    if (elements.closeLeaderboard) {
        elements.closeLeaderboard.addEventListener('click', () => {
            showScreen('home');
        });
    }

    elements.showLeaderboardAfterGame.addEventListener('click', () => {
        elements.gameOverDialog.classList.remove('active');
        displayLeaderboard();
        showScreen('leaderboard');
    });

    // Game over navigation
    elements.restartButton.addEventListener('click', () => {
        elements.gameOverDialog.classList.remove('active');
        startGame();
        resetPowerups();
    });

    // Game over quit to menu
    document.getElementById('quitToMenuGameOver').addEventListener('click', () => {
        elements.gameOverDialog.classList.remove('active');
        showScreen('home');
    });

    // Pause menu navigation
    elements.quitToMenu.addEventListener('click', () => {
        gameState.isPlaying = false;
        gameState.isPaused = false;
        clearInterval(timerInterval);
        elements.pauseDialog.classList.remove('active');
        showScreen('home');
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation listeners
    setupNavigationListeners();
    
    // Game control listeners
    setupGameControls();
    
    // Support form listeners
    setupSupportListeners();
    
    // Pause menu buttons
    if (elements.restartCurrentGame) {
        elements.restartCurrentGame.addEventListener('click', () => {
            elements.pauseDialog.classList.remove('active');
            startGame();
        });
    }

    if (elements.quitToMenu) {
        elements.quitToMenu.addEventListener('click', () => {
            gameState.isPlaying = false;
            gameState.isPaused = false;
            clearInterval(timerInterval);
            elements.pauseDialog.classList.remove('active');
            showScreen('home');
        });
    }
}

// Support form event listeners
function setupSupportListeners() {
    if (supportElements.button) {
        supportElements.button.addEventListener('click', () => {
            supportElements.dialog.classList.add('active');
            if (gameState.isPlaying) {
                pauseGame();
            }
        });
    }

    if (supportElements.closeButton) {
        supportElements.closeButton.addEventListener('click', () => {
            supportElements.dialog.classList.remove('active');
            if (gameState.isPlaying && gameState.isPaused) {
                elements.pauseDialog.classList.add('active');
            }
        });
    }

    if (supportElements.form) {
        supportElements.form.addEventListener('submit', handleSupportFormSubmit);
    }
}

// Pause handling functions
function pauseGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = true;
    elements.pauseDialog.classList.add('active');
}

function resumeGame() {
    if (!gameState.isPlaying) return;
    
    gameState.isPaused = false;
    elements.pauseDialog.classList.remove('active');
}

// Game control event listeners
function setupGameControls() {
    // Pause button
    if (elements.pauseButton) {
        elements.pauseButton.addEventListener('click', pauseGame);
    }

    // Resume button
    if (elements.resumeGame) {
        elements.resumeGame.addEventListener('click', resumeGame);
    }

    // Sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            localStorage.setItem('soundEnabled', gameState.soundEnabled);
            elements.soundToggle.innerHTML = gameState.soundEnabled ? '🔊 Sound' : '🔇 Mute';
        });
    }

    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Powerup buttons
    if (elements.powerups.doublePoints) {
        elements.powerups.doublePoints.addEventListener('click', activateDoublePoints);
    }
    if (elements.powerups.extraTime) {
        elements.powerups.extraTime.addEventListener('click', activateExtraTime);
    }
    if (elements.powerups.shield) {
        elements.powerups.shield.addEventListener('click', activateShield);
    }
    if (elements.powerups.fiftyFifty) {
        elements.powerups.fiftyFifty.addEventListener('click', activateFiftyFifty);
    }

    // Leaderboard toggle
    if (elements.toggleLeaderboard) {
        elements.toggleLeaderboard.addEventListener('click', () => {
            if (!gameState.isPlaying) return;
            
            // Pause the game
            if (!gameState.isPaused) {
                gameState.isPaused = true;
            }
            
            // Show leaderboard dialog
            elements.inGameLeaderboardDialog.classList.add('active');
            displayLeaderboard(elements.miniLeaderboard, 5);
            elements.toggleLeaderboard.classList.remove('has-updates');
            gameState.hasLeaderboardUpdates = false;
        });
    }

    // Close in-game leaderboard
    if (elements.closeInGameLeaderboard) {
        elements.closeInGameLeaderboard.addEventListener('click', () => {
            elements.inGameLeaderboardDialog.classList.remove('active');
            
            // Resume the game
            if (gameState.isPlaying) {
                gameState.isPaused = false;
            }
        });
    }

    // Game over buttons
    if (elements.restartButton) {
        elements.restartButton.addEventListener('click', () => {
            elements.gameOverDialog.classList.remove('active');
            startGame();
            resetPowerups();
        });
    }

    // Pause menu buttons
    if (elements.restartCurrentGame) {
        elements.restartCurrentGame.addEventListener('click', () => {
            elements.pauseDialog.classList.remove('active');
            startGame();
        });
    }

    if (elements.quitToMenu) {
        elements.quitToMenu.addEventListener('click', () => {
            gameState.isPlaying = false;
            gameState.isPaused = false;
            clearInterval(timerInterval);
            elements.pauseDialog.classList.remove('active');
            showScreen('home');
        });
    }
}

// Call setup when document is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupEventListeners();
}); 

// Update game stats function
async function updateGameStats() {
    try {
        const { ref, get } = window.firebaseFunctions;
        const db = window.firebaseDatabase;
        const leaderboardRef = ref(db, 'leaderboard');
        
        const snapshot = await get(leaderboardRef);
        if (!snapshot.exists()) {
            return;
        }
        
        const allEntries = Object.values(snapshot.val());
        const totalPlayers = new Set(allEntries.map(entry => entry.nickname)).size;
        const highestScore = Math.max(...allEntries.map(entry => entry.score));

        // Sadece totalPlayers ve highestScore'u güncelle
        animateNumber(homeElements.totalPlayers, 0, totalPlayers, 1500);
        animateNumber(homeElements.highestScore, 0, highestScore, 2000);
    } catch (error) {
        console.error('Error updating game stats:', error);
        homeElements.totalPlayers.textContent = '0';
        homeElements.highestScore.textContent = '0';
    }
}

// Number animation function
function animateNumber(element, start, end, duration) {
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        if (current >= end) {
            element.textContent = Math.round(end).toLocaleString();
        } else {
            element.textContent = Math.round(current).toLocaleString();
            requestAnimationFrame(animate);
        }
    };
    
    animate();
} 

// Leaderboard functions
async function getLeaderboard() {
    try {
        const { ref, get } = window.firebaseFunctions;
        const db = window.firebaseDatabase;
        const leaderboardRef = ref(db, 'leaderboard');
        
        const snapshot = await get(leaderboardRef);
        
        if (!snapshot.exists()) {
            return [];
        }
        
        // Convert to array and sort by score
        const entries = Object.entries(snapshot.val()).map(([key, value]) => ({
            ...value,
            id: key
        }));
        
        // Sort by score (highest first) and get top 5
        return entries
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Sadece en yüksek 5 skor
            
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        return [];
    }
}

async function updateLeaderboard(nickname, score) {
    if (!nickname || typeof score !== 'number') {
        console.error('Invalid nickname or score');
        return;
    }

    try {
        const { ref, push, set, get, remove } = window.firebaseFunctions;
        const db = window.firebaseDatabase;
        
        if (!db || !ref || !push || !set || !get || !remove) {
            throw new Error('Firebase functions not initialized');
        }
        
        const leaderboardRef = ref(db, 'leaderboard');
        
        // Get current leaderboard
        const snapshot = await get(leaderboardRef);
        const leaderboard = snapshot.val() || {};
        
        // Check if player exists and update only if new score is higher
        const playerExists = Object.values(leaderboard).find(entry => entry.nickname === nickname);
        if (!playerExists || playerExists.score < score) {
            const newEntry = {
                nickname: nickname,
                score: score,
                date: new Date().toISOString()
            };
            
            try {
                // Generate a new unique key for the entry
                const newEntryRef = push(leaderboardRef);
                await set(newEntryRef, newEntry);
                
                // Remove old entry if exists
                if (playerExists) {
                    const oldEntryKey = Object.entries(leaderboard).find(([key, value]) => value.nickname === nickname)[0];
                    await remove(ref(db, `leaderboard/${oldEntryKey}`));
                }
                
                // Update UI to show new scores
                await displayLeaderboard();
                await updateGameStats();
            } catch (error) {
                console.error('Error updating leaderboard entry:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        // Show error message to user
        const errorMessage = document.createElement('div');
        errorMessage.className = 'leaderboard-error';
        errorMessage.textContent = 'Failed to update leaderboard. Please try again.';
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.remove();
            }
        }, 3000);
    }
}

async function displayLeaderboard() {
    const leaderboardList = document.querySelector('.leaderboard-list');
    const miniLeaderboard = document.querySelector('.mini-leaderboard');
    const inGameLeaderboard = document.querySelector('.leaderboard-content');
    
    if (!leaderboardList && !miniLeaderboard && !inGameLeaderboard) {
        console.error('No leaderboard elements found');
        return;
    }
    
    try {
        const entries = await getLeaderboard();
        
        if (!Array.isArray(entries)) {
            throw new Error('Invalid leaderboard data');
        }
        
        const leaderboardHTML = entries.map((entry, index) => {
            if (!entry || !entry.nickname || typeof entry.score !== 'number') {
                console.warn('Invalid leaderboard entry:', entry);
                return '';
            }
            
            return `
                <div class="leaderboard-item">
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-nickname">${entry.nickname}</span>
                    <span class="leaderboard-score">${entry.score}</span>
                </div>
            `;
        }).filter(Boolean).join('');
        
        const noScoresHTML = '<div class="leaderboard-item">No scores yet!</div>';
        const contentToShow = entries.length > 0 ? leaderboardHTML : noScoresHTML;
        
        // Update all leaderboard elements that exist
        if (leaderboardList) {
            leaderboardList.innerHTML = contentToShow;
        }
        
        if (inGameLeaderboard) {
            inGameLeaderboard.innerHTML = contentToShow;
        }
        
        if (miniLeaderboard) {
            miniLeaderboard.innerHTML = contentToShow;
        }
        
        // Update game stats if on home screen
        if (screens.home.classList.contains('active')) {
            updateGameStats();
        }
    } catch (error) {
        console.error('Error displaying leaderboard:', error);
        const errorMessage = '<div class="leaderboard-item">Failed to load leaderboard</div>';
        
        [leaderboardList, inGameLeaderboard, miniLeaderboard].forEach(element => {
            if (element) {
                element.innerHTML = errorMessage;
            }
        });
    }
}

// Game functions
function startGame() {
    // Reset game state
    gameState.level = 1;
    gameState.score = 0;
    gameState.timer = 20;
    gameState.isPlaying = true;
    gameState.streak = 0;
    gameState.questionsAnswered = 0;
    gameState.isPaused = false;
    
    // Reset UI
    elements.level.textContent = gameState.level;
    elements.score.textContent = gameState.score;
    elements.timer.textContent = gameState.timer;
    elements.currentStreak.textContent = gameState.streak;
    elements.highScore.textContent = gameState.highScore;
    
    // Reset powerups
    resetPowerups();
    
    // Hide any active dialogs
    elements.pauseDialog.classList.remove('active');
    elements.gameOverDialog.classList.remove('active');
    elements.gameLeaderboard.classList.add('hidden');
    
    // Start the timer
    startTimer();
    
    // Generate first question
    generateQuestion();
}

function resetPowerups() {
    // Reset powerup states
    gameState.powerups = {
        doublePoints: { active: false, timer: null },
        shield: { active: false },
        fiftyFifty: { active: false }
    };
    
    // Reset powerup buttons
    Object.values(elements.powerups).forEach(button => {
        if (button) {
            button.disabled = false;
            button.classList.remove('active', 'used');
            button.style.visibility = 'visible';
        }
    });
    
    // Reset all option buttons visibility
    elements.options.forEach(button => {
        button.style.visibility = 'visible';
        button.disabled = false;
    });
    
    // Clear any existing timers
    if (gameState.powerups.doublePoints.timer) {
        clearTimeout(gameState.powerups.doublePoints.timer);
    }
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.timer--;
            elements.timer.textContent = gameState.timer;
            
            if (gameState.timer <= 5) {
                elements.timer.classList.add('timer-warning');
            }
            
            if (gameState.timer <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

function generateQuestion() {
    if (!gameState.isPlaying) return;
    
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2, correctAnswer;
    
    // Generate numbers based on level
    const maxNum = Math.min(10 + gameState.level * 2, 50);
    
    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            correctAnswer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
            correctAnswer = num1 - num2;
            break;
        case '*':
            num1 = Math.floor(Math.random() * Math.min(12, maxNum/2)) + 1;
            num2 = Math.floor(Math.random() * Math.min(12, maxNum/2)) + 1;
            correctAnswer = num1 * num2;
            break;
    }
    
    // Generate question text
    const questionText = `${num1} ${operation} ${num2} = ?`;
    elements.question.textContent = questionText;
    
    // Generate options
    const options = generateOptions(correctAnswer);
    
    // Update option buttons
    elements.options.forEach((button, index) => {
        button.textContent = options[index];
        button.classList.remove('correct', 'wrong');
        button.disabled = false;
        button.style.visibility = 'visible'; // Her yeni soruda tüm seçenekleri görünür yap
        
        // Add click event listener
        button.onclick = () => handleAnswer(options[index] === correctAnswer, button);
    });
}

function generateOptions(correctAnswer) {
    const options = [correctAnswer];
    const range = Math.max(10, Math.abs(correctAnswer));
    
    while (options.length < 4) {
        const wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1) * 
                          (Math.floor(Math.random() * range) + 1);
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
}

function handleAnswer(isCorrect, button) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    // Disable all option buttons temporarily
    elements.options.forEach(btn => btn.disabled = true);
    
    // Add visual feedback
    if (isCorrect) {
        button.classList.add('correct');
        handleCorrectAnswer(button);
    } else {
        button.classList.add('wrong');
        handleWrongAnswer();
    }
    
    // Generate new question after a shorter delay (500ms yerine 300ms)
    setTimeout(() => {
        elements.options.forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
        generateQuestion();
    }, 300); // Süreyi 1000ms'den 300ms'e düşürdük
}

function handleCorrectAnswer(button) {
    playSound('correct');
    gameState.questionsAnswered++;
    
    // Update streak
    gameState.streak++;
    elements.currentStreak.textContent = gameState.streak;
    
    // Calculate score
    const basePoints = 10;
    const streakBonus = Math.floor(gameState.streak / 5) * 5;
    const levelBonus = gameState.level * 2;
    let points = basePoints + streakBonus + levelBonus;
    
    // Apply double points if active
    if (gameState.powerups.doublePoints.active) {
        points *= 2;
    }
    
    // Update score
    gameState.score += points;
    elements.score.textContent = gameState.score;
    
    // Check for level up
    const shouldLevelUp = gameState.questionsAnswered % 5 === 0 && gameState.level < 10000;
    if (shouldLevelUp) {
        levelUp();
    }
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
        elements.highScore.textContent = gameState.highScore;
    }
    
    // Add time bonus
    gameState.timer = Math.min(gameState.timer + 2, 30);
    elements.timer.textContent = gameState.timer;
    
    // Show score popup
    showScorePopup(points, gameState.streak, button, shouldLevelUp);
}

function handleWrongAnswer() {
    playSound('wrong');
    
    // Check if shield is active
    if (gameState.powerups.shield.active) {
        gameState.powerups.shield.active = false;
        elements.powerups.shield.classList.remove('active');
        return;
    }
    
    // Reset streak
    gameState.streak = 0;
    elements.currentStreak.textContent = gameState.streak;
    
    // Reduce timer
    gameState.timer = Math.max(gameState.timer - 3, 1);
    elements.timer.textContent = gameState.timer;
}

function levelUp() {
    gameState.level++;
    elements.level.textContent = gameState.level;
}

function gameOver() {
    gameState.isPlaying = false;
    clearInterval(timerInterval);
    playSound('gameOver');
    
    // Update final stats
    elements.finalScore.textContent = gameState.score;
    elements.finalLevel.textContent = gameState.level;
    elements.questionsAnswered.textContent = gameState.questionsAnswered;
    
    // Update leaderboard
    updateLeaderboard(gameState.nickname, gameState.score);
    
    // Show game over dialog
    elements.gameOverDialog.classList.add('active');
}

function showScorePopup(points, streak, button, isLevelUp = false) {
    // Önceki popup'ı temizle
    const existingPopup = document.querySelector('.score-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'score-popup';
    
    let content = `
        <span class="points">+${points}</span>
        ${streak > 1 ? `<span class="streak">Streak x${streak}!</span>` : ''}
        ${gameState.powerups.doublePoints.active ? '<span class="multiplier">2x</span>' : ''}
        ${isLevelUp ? `<span class="level-up">Level ${gameState.level}!</span>` : ''}
    `;
    
    popup.innerHTML = content;
    
    // Popup'ı doğrudan body'e ekle
    document.body.appendChild(popup);
    
    // Popup'ı butonun üzerine konumlandır
    const buttonRect = button.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.top = `${buttonRect.top - 20}px`;
    popup.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    
    // Remove popup after animation
    setTimeout(() => {
        if (popup && popup.parentNode) {
            popup.remove();
        }
    }, 1000);
} 

// Powerup functions
function showPowerupEffect(button, text) {
    // Buton animasyonu
    button.classList.add('powerup-activate');
    setTimeout(() => button.classList.remove('powerup-activate'), 500);

    // Effect popup
    const effect = document.createElement('div');
    effect.className = 'powerup-effect';
    effect.textContent = text;
    
    // Popup'ı butonun üzerine konumlandır
    const buttonRect = button.getBoundingClientRect();
    effect.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
    effect.style.top = `${buttonRect.top}px`;
    
    document.body.appendChild(effect);
    
    // Remove effect after animation
    setTimeout(() => effect.remove(), 1000);
}

function activateDoublePoints() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const button = elements.powerups.doublePoints;
    if (button.disabled) return;
    
    // Play powerup sound
    playSound('powerup');
    
    // Activate double points
    gameState.powerups.doublePoints.active = true;
    button.disabled = true;
    button.classList.add('active');
    
    // Show effect
    showPowerupEffect(button, '2x Points Active!');
    
    // Clear existing timer if any
    if (gameState.powerups.doublePoints.timer) {
        clearTimeout(gameState.powerups.doublePoints.timer);
    }
    
    // Set timer for 5 seconds
    gameState.powerups.doublePoints.timer = setTimeout(() => {
        gameState.powerups.doublePoints.active = false;
        button.classList.remove('active');
    }, 5000);
}

function activateExtraTime() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const button = elements.powerups.extraTime;
    if (button.disabled) return;
    
    // Play powerup sound
    playSound('powerup');
    
    // Add 10 seconds to timer
    gameState.timer = Math.min(gameState.timer + 10, 60);
    elements.timer.textContent = gameState.timer;
    
    // Show effect
    showPowerupEffect(button, '+10 Seconds!');
    
    // Disable the button
    button.disabled = true;
    button.classList.add('used');
}

function activateShield() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const button = elements.powerups.shield;
    if (button.disabled) return;
    
    // Play powerup sound
    playSound('powerup');
    
    // Activate shield
    gameState.powerups.shield.active = true;
    button.disabled = true;
    button.classList.add('active');
    
    // Show effect
    showPowerupEffect(button, 'Shield Active!');
}

function activateFiftyFifty() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    const button = elements.powerups.fiftyFifty;
    if (button.disabled) return;

    // Play powerup sound
    playSound('powerup');

    // Show effect
    showPowerupEffect(button, '50:50 Active!');

    // Tüm seçenekleri al
    const allOptions = Array.from(elements.options);
    
    // Doğru seçeneği bul (doğru cevabı içeren buton)
    const correctAnswer = allOptions.find(option => {
        const value = parseInt(option.textContent);
        const questionText = elements.question.textContent;
        // Soruyu hesapla
        const [num1, operation, num2] = questionText.split(' ');
        let result;
        switch(operation) {
            case '+': result = parseInt(num1) + parseInt(num2); break;
            case '-': result = parseInt(num1) - parseInt(num2); break;
            case '*': result = parseInt(num1) * parseInt(num2); break;
        }
        return value === result;
    });

    if (!correctAnswer) return;

    // Yanlış seçenekleri al
    const wrongOptions = allOptions.filter(option => option !== correctAnswer);
    
    // Rastgele 2 yanlış seçeneği gizle
    for (let i = 0; i < 2 && wrongOptions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * wrongOptions.length);
        const optionToHide = wrongOptions.splice(randomIndex, 1)[0];
        optionToHide.style.visibility = 'hidden';
        optionToHide.disabled = true;
    }
    
    // Butonu devre dışı bırak
    button.disabled = true;
    button.classList.add('used');
} 

// Support form submit handler
async function handleSupportFormSubmit(event) {
    event.preventDefault();
    
    try {
        // Show loading state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        // Get form values
        const formData = new FormData(event.target);
        const templateParams = {
            to_name: formData.get('to_name'),
            from_email: formData.get('from_email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        console.log('Sending email with params:', templateParams);

        const response = await emailjs.send(
            'service_bb1qqab',
            'template_jjs572h',
            templateParams
        );

        console.log('EmailJS Response:', response);

        if (response.status === 200) {
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'support-success';
            successMessage.textContent = 'Message sent successfully!';
            supportElements.form.appendChild(successMessage);
            
            // Clear form
            supportElements.form.reset();
            
            // Remove success message and close dialog after 3 seconds
            setTimeout(() => {
                successMessage.remove();
                supportElements.dialog.classList.remove('active');
            }, 3000);
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
        
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'support-error';
        errorMessage.textContent = `Failed to send message: ${error.text || error.message || 'Please try again'}`;
        supportElements.form.appendChild(errorMessage);
        
        // Remove error message after 5 seconds
        setTimeout(() => errorMessage.remove(), 5000);
    } finally {
        // Reset button state
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.textContent = 'Send Message';
        submitButton.disabled = false;
    }
} 