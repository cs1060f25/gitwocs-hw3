// Commutr App JavaScript
// Handles the complete user journey flow for free-plan users

class CommutrApp {
    constructor() {
        this.currentScreen = 'discover';
        this.onboardingStep = 1;
        this.userData = {
            name: 'Michael',
            commuteDuration: 25,
            interests: ['spanish', 'ai'],
            streak: 3,
            currentVibe: 'curious',
            selectedContent: 'spanish-basics'
        };
        this.lessonProgress = 0;
        this.currentChunk = 1;
        this.totalChunks = 3;
        this.adCountdown = 15;
        this.lessonTimer = null;
        this.adTimer = null;
        // Audio / TTS
        this.voices = [];
        this.preferredVoice = null;
        this.ttsReady = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStreakDisplay();
        this.loadUserData();
        this.initVoices();
    }

    setupEventListeners() {
        // Onboarding option selections
        document.querySelectorAll('.commute-option').forEach(option => {
            option.addEventListener('click', () => this.selectCommuteOption(option));
        });

        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleInterest(tag));
        });

        document.querySelectorAll('.vibe-option').forEach(option => {
            option.addEventListener('click', () => this.selectVibe(option));
        });

        document.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', () => this.selectContentCard(card));
        });

        // Audio buttons
        document.querySelectorAll('.play-audio').forEach(button => {
            button.addEventListener('click', () => this.playAudio(button));
        });
    }

    // Screen Navigation
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    // Discovery to Onboarding
    startOnboarding() {
        this.showScreen('onboard-screen');
        this.updateOnboardingProgress();
    }

    // Onboarding Flow
    nextStep() {
        if (this.onboardingStep === 1) {
            // Save name
            const nameInput = document.getElementById('user-name');
            this.userData.name = nameInput.value || 'Michael';
        }

        this.onboardingStep++;
        
        // Hide current step
        document.querySelectorAll('.onboard-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show next step
        document.getElementById(`step-${this.onboardingStep}`).classList.add('active');
        this.updateOnboardingProgress();
    }

    updateOnboardingProgress() {
        const progress = (this.onboardingStep / 3) * 100;
        document.getElementById('onboard-progress').style.width = `${progress}%`;
    }

    selectCommuteOption(option) {
        document.querySelectorAll('.commute-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        this.userData.commuteDuration = parseInt(option.dataset.duration);
    }

    toggleInterest(tag) {
        const interest = tag.dataset.interest;
        tag.classList.toggle('selected');
        
        if (tag.classList.contains('selected')) {
            if (!this.userData.interests.includes(interest)) {
                this.userData.interests.push(interest);
            }
        } else {
            this.userData.interests = this.userData.interests.filter(i => i !== interest);
        }
    }

    completeOnboarding() {
        this.showScreen('learn-screen');
        this.updateSessionInfo();
    }

    // Learning Flow
    updateSessionInfo() {
        const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 'Evening';
        document.getElementById('session-title').textContent = `${timeOfDay} Commute`;
        document.getElementById('session-time').textContent = `${this.userData.commuteDuration} minutes available`;
    }

    selectVibe(option) {
        document.querySelectorAll('.vibe-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        this.userData.currentVibe = option.dataset.vibe;
    }

    startLearning() {
        // Hide vibe check, show content selection
        document.getElementById('vibe-check').classList.remove('active');
        document.getElementById('content-selection').classList.add('active');
        
        // Simulate AI curation based on vibe and interests
        this.curateContent();
    }

    curateContent() {
        // Simulate AI content curation
        const contentCards = document.querySelectorAll('.content-card');
        
        // Update content based on user preferences
        if (this.userData.interests.includes('spanish')) {
            contentCards[0].classList.add('recommended');
        }
        
        // Add loading effect
        document.getElementById('content-selection').classList.add('loading');
        
        setTimeout(() => {
            document.getElementById('content-selection').classList.remove('loading');
        }, 1500);
    }

    selectContentCard(card) {
        document.querySelectorAll('.content-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
        this.userData.selectedContent = card.dataset.content;
    }

    selectContent() {
        // Hide content selection, show active lesson
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.add('active');
        
        this.startLesson();
    }

    startLesson() {
        this.lessonProgress = 0;
        this.currentChunk = 1;
        this.updateLessonProgress();
        this.startLessonTimer();
    }

    startLessonTimer() {
        let timeRemaining = this.userData.commuteDuration * 60; // Convert to seconds
        
        this.lessonTimer = setInterval(() => {
            timeRemaining--;
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            document.getElementById('lesson-time').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
            
            if (timeRemaining <= 0) {
                this.completeLesson();
            }
        }, 1000);
    }

    nextChunk() {
        if (this.currentChunk < this.totalChunks) {
            this.currentChunk++;
            this.lessonProgress = (this.currentChunk / this.totalChunks) * 100;
            this.updateLessonProgress();
            this.updateChunkContent();
        } else {
            this.completeLesson();
        }
    }

    previousChunk() {
        if (this.currentChunk > 1) {
            this.currentChunk--;
            this.lessonProgress = (this.currentChunk / this.totalChunks) * 100;
            this.updateLessonProgress();
            this.updateChunkContent();
        }
    }

    updateLessonProgress() {
        document.getElementById('lesson-progress').style.width = `${this.lessonProgress}%`;
        
        // Update circular progress
        const progressCircle = document.querySelector('.progress-circle');
        const progressDegrees = (this.lessonProgress / 100) * 360;
        progressCircle.style.background = 
            `conic-gradient(#667eea ${progressDegrees}deg, #e0e0e0 ${progressDegrees}deg)`;
        
        document.getElementById('progress-text').textContent = `${Math.round(this.lessonProgress)}%`;
    }

    updateChunkContent() {
        // Hide all chunks
        document.querySelectorAll('.content-chunk').forEach(chunk => {
            chunk.classList.remove('active');
        });
        
        // Show current chunk (for demo, we'll just update the existing one)
        const currentChunkEl = document.getElementById('chunk-1');
        currentChunkEl.classList.add('active');
        
        // Update content based on chunk
        const chunkTitles = [
            'Essential Airport Vocabulary',
            'Hotel Check-in Phrases', 
            'Restaurant Ordering'
        ];
        
        const chunkContent = [
            [
                { spanish: 'El aeropuerto', english: 'The airport' },
                { spanish: 'La puerta de embarque', english: 'The boarding gate' },
                { spanish: 'El equipaje', english: 'The luggage' }
            ],
            [
                { spanish: 'Una habitación', english: 'A room' },
                { spanish: 'La reserva', english: 'The reservation' },
                { spanish: 'El check-in', english: 'Check-in' }
            ],
            [
                { spanish: 'La carta', english: 'The menu' },
                { spanish: 'Quiero pedir', english: 'I want to order' },
                { spanish: 'La cuenta', english: 'The bill' }
            ]
        ];
        
        if (this.currentChunk <= chunkTitles.length) {
            currentChunkEl.querySelector('h4').textContent = chunkTitles[this.currentChunk - 1];
            
            const vocabList = currentChunkEl.querySelector('.vocab-list');
            vocabList.innerHTML = '';
            
            chunkContent[this.currentChunk - 1].forEach(item => {
                const vocabItem = document.createElement('div');
                vocabItem.className = 'vocab-item';
                vocabItem.innerHTML = `
                    <span class="spanish">${item.spanish}</span>
                    <span class="english">${item.english}</span>
                    <button class="play-audio"><i class="fas fa-volume-up"></i></button>
                `;
                vocabList.appendChild(vocabItem);
            });
            
            // Re-attach audio event listeners
            vocabList.querySelectorAll('.play-audio').forEach(button => {
                button.addEventListener('click', () => this.playAudio(button));
            });
        }
    }

    // Initialize Web Speech voices and choose a Spanish voice if available
    initVoices() {
        try {
            if (!('speechSynthesis' in window)) {
                console.warn('Speech Synthesis API not supported in this browser.');
                return;
            }
            const populate = () => {
                this.voices = window.speechSynthesis.getVoices();
                // Prefer Spanish voices
                const esVoices = this.voices.filter(v => (v.lang || '').toLowerCase().startsWith('es'));
                this.preferredVoice = esVoices[0] || this.voices.find(v => v.default) || this.voices[0] || null;
                this.ttsReady = !!this.preferredVoice;
                // Kick the engine to ensure voices are loaded on some browsers
                if (!this.ttsReady) {
                    window.speechSynthesis.cancel();
                }
            };
            populate();
            window.speechSynthesis.onvoiceschanged = () => populate();
        } catch (e) {
            console.warn('Error initializing voices', e);
        }
    }

    speak(text, lang = 'es-ES') {
        try {
            if (!('speechSynthesis' in window)) return false;
            const utterance = new SpeechSynthesisUtterance(text);
            // Use preferred Spanish voice if set, otherwise match by lang, fallback default
            if (this.preferredVoice && (this.preferredVoice.lang || '').toLowerCase().startsWith('es')) {
                utterance.voice = this.preferredVoice;
            } else {
                const alt = window.speechSynthesis.getVoices().find(v => (v.lang || '').toLowerCase().startsWith('es'))
                    || this.preferredVoice
                    || null;
                if (alt) utterance.voice = alt;
            }
            utterance.lang = (utterance.voice && utterance.voice.lang) || lang;
            utterance.rate = 0.95; // slightly slower for clarity
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            window.speechSynthesis.cancel(); // stop any previous speech
            window.speechSynthesis.speak(utterance);
            return true;
        } catch (e) {
            console.warn('TTS error:', e);
            return false;
        }
    }

    playAudio(button) {
        const word = button.parentElement.querySelector('.spanish')?.textContent?.trim() || '';
        // Visual feedback
        button.style.transform = 'scale(1.2)';
        button.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
            button.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }, 250);

        // Attempt TTS playback
        const ok = this.speak(word, 'es-ES');
        if (!ok) {
            console.log('Audio playback fallback for:', word);
        }
    }

    completeLesson() {
        if (this.lessonTimer) {
            clearInterval(this.lessonTimer);
        }
        
        this.showScreen('engage-screen');
        this.startAdCountdown();
    }

    // Engagement (Ad) Flow
    startAdCountdown() {
        this.adCountdown = 15;
        const skipButton = document.getElementById('skip-button');
        const adCountdownEl = document.getElementById('ad-countdown');
        const skipCountdownEl = document.getElementById('skip-countdown');
        
        skipButton.disabled = true;
        
        this.adTimer = setInterval(() => {
            this.adCountdown--;
            adCountdownEl.textContent = this.adCountdown;
            skipCountdownEl.textContent = this.adCountdown;
            
            if (this.adCountdown <= 0) {
                clearInterval(this.adTimer);
                skipButton.disabled = false;
                skipButton.textContent = 'Continue';
            }
        }, 1000);
    }

    completeSession() {
        if (this.adTimer) {
            clearInterval(this.adTimer);
        }
        
        // Update streak
        this.userData.streak++;
        this.updateStreakDisplay();
        
        this.showScreen('reflect-screen');
        this.updateReflectionData();
    }

    // Reflection Flow
    updateReflectionData() {
        document.getElementById('current-streak').textContent = this.userData.streak;
        document.getElementById('streak-count').textContent = this.userData.streak;
        
        // Simulate mastery progress update
        const spanishProgress = document.querySelector('.mastery-item .level-fill');
        const currentWidth = parseInt(spanishProgress.style.width) || 65;
        spanishProgress.style.width = `${Math.min(currentWidth + 5, 100)}%`;
    }

    updateStreakDisplay() {
        document.getElementById('streak-count').textContent = this.userData.streak;
    }

    resetToDiscover() {
        this.showScreen('discover-screen');
        this.onboardingStep = 1;
        
        // Reset onboarding steps
        document.querySelectorAll('.onboard-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('step-1').classList.add('active');
        
        // Reset learning sections
        document.getElementById('vibe-check').classList.add('active');
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.remove('active');
    }

    // Data Persistence (localStorage simulation)
    saveUserData() {
        localStorage.setItem('commutrUserData', JSON.stringify(this.userData));
    }

    loadUserData() {
        const savedData = localStorage.getItem('commutrUserData');
        if (savedData) {
            this.userData = { ...this.userData, ...JSON.parse(savedData) };
            this.updateStreakDisplay();
        }
    }
}

// Global functions for HTML onclick handlers
function startOnboarding() {
    app.startOnboarding();
}

function nextStep() {
    app.nextStep();
}

function completeOnboarding() {
    app.completeOnboarding();
}

function startLearning() {
    app.startLearning();
}

function selectContent() {
    app.selectContent();
}

function nextChunk() {
    app.nextChunk();
}

function previousChunk() {
    app.previousChunk();
}

function completeSession() {
    app.completeSession();
}

function resetToDiscover() {
    app.resetToDiscover();
}

// Initialize app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CommutrApp();
});

// Additional interactive features for enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scrolling for better mobile experience
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add touch feedback for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        
        // Add touch feedback to buttons
        document.addEventListener('touchstart', (e) => {
            if (e.target.matches('button, .commute-option, .interest-tag, .vibe-option, .content-card')) {
                e.target.style.transform = 'scale(0.95)';
            }
        });
        
        document.addEventListener('touchend', (e) => {
            if (e.target.matches('button, .commute-option, .interest-tag, .vibe-option, .content-card')) {
                setTimeout(() => {
                    e.target.style.transform = 'scale(1)';
                }, 100);
            }
        });
    }
    
    // Add keyboard navigation support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (e.target.matches('.commute-option, .interest-tag, .vibe-option, .content-card')) {
                e.preventDefault();
                e.target.click();
            }
        }
    });
    
    // Add focus management for accessibility
    document.querySelectorAll('.commute-option, .interest-tag, .vibe-option, .content-card').forEach(element => {
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
    });
});

// Performance monitoring (for development)
if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('commutr-app-loaded');
    
    window.addEventListener('load', () => {
        performance.mark('commutr-app-ready');
        performance.measure('commutr-load-time', 'commutr-app-loaded', 'commutr-app-ready');
        
        const loadTime = performance.getEntriesByName('commutr-load-time')[0];
        console.log(`Commutr app loaded in ${loadTime.duration.toFixed(2)}ms`);
    });
}
