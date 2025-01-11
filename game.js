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
    watchAdForContinue: document.getElementById('watchAdForContinue'),
    
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
    canWatchAd: true,
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
    correct: new Audio('https://www.soundjay.com/buttons/sounds/button-09a.mp3'),
    wrong: new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'),
    powerup: new Audio('https://www.soundjay.com/buttons/sounds/button-35.mp3'),
    gameOver: new Audio('https://www.soundjay.com/mechanical/sounds/warning-1.mp3'),
    buttonClick: new Audio('https://www.soundjay.com/buttons/sounds/button-08.mp3'),
    levelUp: new Audio('https://www.soundjay.com/buttons/sounds/button-37.mp3')
};

// Preload all sounds
Object.values(sounds).forEach(sound => {
    sound.load();
    sound.preload = 'auto';
});

// Set initial volumes
sounds.correct.volume = 0.3;
sounds.wrong.volume = 0.2;
sounds.powerup.volume = 0.3;
sounds.gameOver.volume = 0.3;
sounds.buttonClick.volume = 0.2;
sounds.levelUp.volume = 0.3;

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
function initializeGame() {
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
    playSound('buttonClick');
    isDarkTheme = !isDarkTheme;
    localStorage.setItem('darkTheme', isDarkTheme);
    updateTheme();
} 

// Navigation event listeners
function setupNavigationListeners() {
    // Home screen buttons
    homeElements.startButton.addEventListener('click', () => {
        playSound('buttonClick');
        showScreen('nickname');
    });

    // Back button on nickname screen
    document.getElementById('backToHome').addEventListener('click', () => {
        playSound('buttonClick');
        showScreen('home');
    });

    homeElements.leaderboardButton.addEventListener('click', () => {
        playSound('buttonClick');
        displayLeaderboard();
        showScreen('leaderboard');
    });

    // Nickname screen buttons
    elements.startButton.addEventListener('click', () => {
        const nickname = elements.nicknameInput.value.trim();
        if (nickname) {
            playSound('buttonClick');
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
                playSound('buttonClick');
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
            playSound('buttonClick');
            showScreen('home');
        });
    }

    elements.showLeaderboardAfterGame.addEventListener('click', () => {
        playSound('buttonClick');
        elements.gameOverDialog.classList.remove('active');
        displayLeaderboard();
        showScreen('leaderboard');
    });

    // Game over navigation
    elements.restartButton.addEventListener('click', () => {
        playSound('buttonClick');
        elements.gameOverDialog.classList.remove('active');
        showScreen('home');
        gameState.canWatchAd = true;
        resetPowerups();
    });

    // Pause menu navigation
    elements.quitToMenu.addEventListener('click', () => {
        playSound('buttonClick');
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
}

// Support form event listeners
function setupSupportListeners() {
    if (supportElements.button) {
        supportElements.button.addEventListener('click', () => {
            playSound('buttonClick');
            supportElements.dialog.classList.add('active');
            if (gameState.isPlaying) {
                pauseGame();
            }
        });
    }

    if (supportElements.closeButton) {
        supportElements.closeButton.addEventListener('click', () => {
            playSound('buttonClick');
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

// Game control event listeners
function setupGameControls() {
    // Pause button
    if (elements.pauseButton) {
        elements.pauseButton.addEventListener('click', () => {
            if (!gameState.isPlaying) return;
            playSound('buttonClick');
            pauseGame();
        });
    }

    // Resume button
    if (elements.resumeGame) {
        elements.resumeGame.addEventListener('click', () => {
            playSound('buttonClick');
            resumeGame();
        });
    }

    // Sound toggle
    if (elements.soundToggle) {
        elements.soundToggle.addEventListener('click', () => {
            gameState.soundEnabled = !gameState.soundEnabled;
            localStorage.setItem('soundEnabled', gameState.soundEnabled);
            elements.soundToggle.innerHTML = gameState.soundEnabled ? '🔊 Sound' : '🔇 Mute';
            playSound('buttonClick');
        });
    }

    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Leaderboard toggle
    if (elements.toggleLeaderboard) {
        elements.toggleLeaderboard.addEventListener('click', () => {
            if (!gameState.isPlaying) return;
            playSound('buttonClick');
            elements.gameLeaderboard.classList.toggle('hidden');
            if (!elements.gameLeaderboard.classList.contains('hidden')) {
                displayLeaderboard(elements.miniLeaderboard, 5);
                elements.toggleLeaderboard.classList.remove('has-updates');
                gameState.hasLeaderboardUpdates = false;
            }
        });
    }

    // Close game leaderboard
    if (elements.closeGameLeaderboard) {
        elements.closeGameLeaderboard.addEventListener('click', () => {
            playSound('buttonClick');
            elements.gameLeaderboard.classList.add('hidden');
        });
    }

    // Powerup buttons
    if (elements.powerups.doublePoints) {
        elements.powerups.doublePoints.addEventListener('click', () => {
            if (!gameState.isPlaying || gameState.isPaused) return;
            playSound('powerup');
            activateDoublePoints();
        });
    }

    if (elements.powerups.extraTime) {
        elements.powerups.extraTime.addEventListener('click', () => {
            if (!gameState.isPlaying || gameState.isPaused) return;
            playSound('powerup');
            activateExtraTime();
        });
    }

    if (elements.powerups.shield) {
        elements.powerups.shield.addEventListener('click', () => {
            if (!gameState.isPlaying || gameState.isPaused) return;
            playSound('powerup');
            activateShield();
        });
    }

    if (elements.powerups.fiftyFifty) {
        elements.powerups.fiftyFifty.addEventListener('click', () => {
            if (!gameState.isPlaying || gameState.isPaused) return;
            playSound('powerup');
            activateFiftyFifty();
        });
    }

    // Game over buttons
    if (elements.restartButton) {
        elements.restartButton.addEventListener('click', () => {
            playSound('buttonClick');
            elements.gameOverDialog.classList.remove('active');
            showScreen('home');
            gameState.canWatchAd = true;
            resetPowerups();
        });
    }

    // Pause menu buttons
    if (elements.restartCurrentGame) {
        elements.restartCurrentGame.addEventListener('click', () => {
            playSound('buttonClick');
            elements.pauseDialog.classList.remove('active');
            startGame();
        });
    }

    if (elements.quitToMenu) {
        elements.quitToMenu.addEventListener('click', () => {
            playSound('buttonClick');
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
        const leaderboard = await getLeaderboard();
        const totalPlayers = new Set(leaderboard.map(entry => entry.nickname)).size;
        const totalGames = leaderboard.length;
        const highestScore = leaderboard.length > 0 ? Math.max(...leaderboard.map(entry => entry.score)) : 0;

        // Animate numbers
        animateNumber(homeElements.totalPlayers, 0, totalPlayers, 1500);
        animateNumber(homeElements.gamesPlayed, 0, totalGames, 1500);
        animateNumber(homeElements.highestScore, 0, highestScore, 2000);
    } catch (error) {
        console.error('Error updating game stats:', error);
        // Set default values if there's an error
        homeElements.totalPlayers.textContent = '0';
        homeElements.gamesPlayed.textContent = '0';
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
        const snapshot = await firebase.database()
            .ref('leaderboard')
            .orderByChild('score')
            .limitToLast(10)
            .once('value');
        
        const leaderboard = [];
        snapshot.forEach((childSnapshot) => {
            leaderboard.push({
                nickname: childSnapshot.val().nickname,
                score: childSnapshot.val().score,
                date: childSnapshot.val().date
            });
        });
        
        return leaderboard.reverse(); // En yüksek skorlar başta olacak
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        return [];
    }
}

async function updateLeaderboard(nickname, score) {
    try {
        // Önce oyuncunun mevcut en yüksek skorunu kontrol et
        const playerRef = firebase.database().ref('leaderboard');
        const snapshot = await playerRef
            .orderByChild('nickname')
            .equalTo(nickname)
            .once('value');
        
        let updated = false;
        const playerData = {
            nickname,
            score,
            date: new Date().toISOString()
        };

        if (snapshot.exists()) {
            // Oyuncu zaten var, sadece daha yüksek skoru varsa güncelle
            snapshot.forEach((childSnapshot) => {
                const existingScore = childSnapshot.val().score;
                if (score > existingScore) {
                    childSnapshot.ref.update(playerData);
                    updated = true;
                }
            });
        } else {
            // Yeni oyuncu, direkt ekle
            await playerRef.push(playerData);
            updated = true;
        }

        if (updated) {
            gameState.hasLeaderboardUpdates = true;
            if (elements.toggleLeaderboard) {
                elements.toggleLeaderboard.classList.add('has-updates');
            }
        }

        return true;
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        return false;
    }
}

async function displayLeaderboard(container = elements.leaderboardList, limit = 10) {
    try {
        const leaderboard = await getLeaderboard();
        const itemsToShow = leaderboard.slice(0, limit);
        
        if (itemsToShow.length === 0) {
            container.innerHTML = `
                <div class="${container === elements.miniLeaderboard ? 'mini-leaderboard-item' : 'leaderboard-item'}" style="justify-content: center;">
                    <span style="color: var(--text-secondary);">No scores yet. Be the first!</span>
                </div>
            `;
            return;
        }
        
        const html = itemsToShow
            .map((entry, index) => `
                <div class="${container === elements.miniLeaderboard ? 'mini-leaderboard-item' : 'leaderboard-item'}">
                    <span class="${container === elements.miniLeaderboard ? 'mini-leaderboard-rank' : 'leaderboard-rank'}">#${index + 1}</span>
                    <span class="${container === elements.miniLeaderboard ? 'mini-leaderboard-nickname' : 'leaderboard-nickname'}">${entry.nickname}</span>
                    <span class="${container === elements.miniLeaderboard ? 'mini-leaderboard-score' : 'leaderboard-score'}">${entry.score}</span>
                </div>
            `)
            .join('');

        container.innerHTML = html;
    } catch (error) {
        console.error('Error displaying leaderboard:', error);
        container.innerHTML = '<div class="leaderboard-item">Error loading leaderboard</div>';
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
            button.classList.remove('active');
        }
    });
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        if (!gameState.isPaused && gameState.isPlaying) {
            gameState.timer--;
            elements.timer.textContent = gameState.timer;
            
            if (gameState.timer <= 5) {
                elements.timer.classList.add('timer-warning');
                playSound('buttonClick');
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
        
        // Add click event listener
        button.onclick = () => handleAnswer(options[index] === correctAnswer);
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

function handleAnswer(isCorrect) {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    if (isCorrect) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
    
    // Generate new question after a short delay
    setTimeout(generateQuestion, 1000);
}

function handleCorrectAnswer() {
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
    if (gameState.questionsAnswered % 5 === 0) {
        if (gameState.level < 10000) {
            levelUp();
        }
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
    showScorePopup(points, gameState.streak);
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
    playSound('levelUp');
    
    // Show level up popup
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <div class="level-up-text">Level Up!</div>
        <div class="new-level">Level ${gameState.level}</div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => {
        popup.remove();
    }, 1500);
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
    
    // Update watch ad button visibility
    elements.watchAdForContinue.style.display = gameState.canWatchAd ? 'block' : 'none';
}

function showScorePopup(points, streak) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerHTML = `
        <span class="points">+${points}</span>
        ${streak > 1 ? `<span class="streak">Streak x${streak}!</span>` : ''}
        ${gameState.powerups.doublePoints.active ? '<span class="multiplier">2x</span>' : ''}
    `;
    
    elements.question.parentElement.appendChild(popup);
    
    // Remove popup after animation
    setTimeout(() => {
        popup.remove();
    }, 1000);
} 