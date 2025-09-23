// Learning Module
class LearningManager {
    constructor(app) {
        this.app = app;
        this.sessionPlan = null;
    }

    selectVibe(option) {
        console.log('Vibe selected:', option.dataset.vibe);
        document.querySelectorAll('.vibe-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        this.app.userData.currentVibe = option.dataset.vibe;
    }

    startLearning() {
        console.log('Start learning called, generating session...');
        
        // Hide vibe check, show content selection
        document.getElementById('vibe-check').classList.remove('active');
        document.getElementById('content-selection').classList.add('active');
        
        // Generate content based on vibe and interests
        this.curateContent();
    }

    curateContent() {
        console.log('Curating content for:', this.app.userData);
        
        const container = document.querySelector('#content-selection .content-cards');
        if (!container) return;
        
        container.innerHTML = '';

        const choices = this.app.userData.interests && this.app.userData.interests.length ? 
            this.app.userData.interests : ['general'];

        const catalog = {
            spanish: {
                id: 'spanish-basics', icon: 'fa-language', title: 'Spanish Essentials',
                desc: 'Travel phrases and beginner vocabulary', minutes: 20, level: 'Beginner'
            },
            ai: {
                id: 'ai-research', icon: 'fa-robot', title: 'AI Breakthroughs 2024',
                desc: 'Latest developments in machine learning', minutes: 15, level: 'Intermediate'
            },
            history: {
                id: 'history-mini', icon: 'fa-landmark', title: 'History Bites',
                desc: 'Moments that changed the world', minutes: 10, level: 'All Levels'
            },
            business: {
                id: 'biz-tactics', icon: 'fa-chart-line', title: 'Business Tactics',
                desc: 'Micro-cases in strategy and growth', minutes: 12, level: 'All Levels'
            },
            science: {
                id: 'sci-discoveries', icon: 'fa-flask', title: 'Science Discoveries',
                desc: 'Curated recent findings', minutes: 14, level: 'All Levels'
            },
            coding: {
                id: 'code-snippets', icon: 'fa-code', title: 'Coding Snippets',
                desc: 'Hands-on micro exercises', minutes: 15, level: 'Beginner'
            },
            general: {
                id: 'focus-pack', icon: 'fa-lightbulb', title: 'Focus Pack',
                desc: 'A mix matched to your vibe', minutes: 10, level: 'All Levels'
            }
        };

        choices.forEach((key, idx) => {
            const item = catalog[key] || catalog.general;
            const card = document.createElement('div');
            card.className = 'content-card' + (idx === 0 ? ' recommended' : '');
            card.dataset.content = item.id;
            card.innerHTML = `
                <div class="card-header">
                    <i class="fas ${item.icon}"></i>
                    ${idx === 0 ? '<span class="recommended-badge">Recommended</span>' : ''}
                </div>
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
                <div class="card-meta">
                    <span><i class="fas fa-clock"></i> ${item.minutes} min</span>
                    <span><i class="fas fa-star"></i> ${item.level}</span>
                </div>`;
            container.appendChild(card);
            
            card.addEventListener('click', () => this.selectContentCard(card));
        });

        // Auto-select first option
        const firstCard = container.querySelector('.content-card');
        if (firstCard) {
            firstCard.classList.add('selected');
            this.app.userData.selectedContent = firstCard.dataset.content;
        }
    }

    selectContentCard(card) {
        console.log('Content card selected:', card.dataset.content);
        document.querySelectorAll('.content-card').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');
        this.app.userData.selectedContent = card.dataset.content;
    }

    selectContent() {
        console.log('Select content called, starting lesson...');
        
        // Hide content selection, show active lesson
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.add('active');
        
        // Prepare lesson
        const selectedContent = this.app.userData.selectedContent || 'focus-pack';
        const lesson = this.app.lessonDefinitions[selectedContent];
        
        if (lesson) {
            document.getElementById('lesson-title').textContent = lesson.lessonTitle;
            this.startLesson();
        }
    }

    startLesson() {
        console.log('Starting lesson...');
        this.app.lessonProgress = 0;
        this.app.currentChunk = 1;
        this.updateLessonProgress();
        this.updateChunkContent();
        this.startLessonTimer();
    }

    updateLessonProgress() {
        const progress = (this.app.currentChunk / this.app.totalChunks) * 100;
        const progressEl = document.getElementById('lesson-progress');
        if (progressEl) progressEl.style.width = `${progress}%`;
        
        // Update circular progress
        const progressCircle = document.querySelector('.progress-circle');
        if (progressCircle) {
            const progressDegrees = (progress / 100) * 360;
            progressCircle.style.background = 
                `conic-gradient(#667eea ${progressDegrees}deg, #e0e0e0 ${progressDegrees}deg)`;
        }
        
        const progressText = document.getElementById('progress-text');
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
    }

    updateChunkContent() {
        const selectedContent = this.app.userData.selectedContent || 'focus-pack';
        const lesson = this.app.lessonDefinitions[selectedContent];
        
        if (!lesson || !lesson.chunks) return;
        
        const chunk = lesson.chunks[this.app.currentChunk - 1] || lesson.chunks[0];
        const chunkEl = document.getElementById('chunk-1');
        
        if (chunkEl && chunk) {
            chunkEl.querySelector('h4').textContent = chunk.title;
            
            const vocabList = chunkEl.querySelector('.vocab-list');
            vocabList.innerHTML = '';
            
            chunk.items.forEach(item => {
                const vocabItem = document.createElement('div');
                vocabItem.className = 'vocab-item';
                vocabItem.innerHTML = `
                    <span class="spanish">${item.primary}</span>
                    <span class="english">${item.secondary}</span>
                    <button class="play-audio"><i class="fas fa-volume-up"></i></button>
                `;
                vocabList.appendChild(vocabItem);
            });
        }
    }

    startLessonTimer() {
        let timeRemaining = this.app.userData.commuteDuration * 60;
        
        this.app.lessonTimer = setInterval(() => {
            timeRemaining--;
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const timeEl = document.getElementById('lesson-time');
            if (timeEl) {
                timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
            }
            
            if (timeRemaining <= 0) {
                this.completeLesson();
            }
        }, 1000);
    }

    nextChunk() {
        console.log('Next chunk called');
        if (this.app.currentChunk < this.app.totalChunks) {
            this.app.currentChunk++;
            this.updateLessonProgress();
            this.updateChunkContent();
        } else {
            this.completeLesson();
        }
    }

    previousChunk() {
        console.log('Previous chunk called');
        if (this.app.currentChunk > 1) {
            this.app.currentChunk--;
            this.updateLessonProgress();
            this.updateChunkContent();
        }
    }

    completeLesson() {
        console.log('Lesson completed');
        if (this.app.lessonTimer) {
            clearInterval(this.app.lessonTimer);
        }
        
        this.app.showScreen('engage-screen');
        this.startAdCountdown();
    }

    startAdCountdown() {
        console.log('Starting ad countdown');
        this.app.adCountdown = 15;
        const skipButton = document.getElementById('skip-button');
        const adCountdownEl = document.getElementById('ad-countdown');
        const skipCountdownEl = document.getElementById('skip-countdown');
        
        if (skipButton) skipButton.disabled = true;
        
        this.app.adTimer = setInterval(() => {
            this.app.adCountdown--;
            if (adCountdownEl) adCountdownEl.textContent = this.app.adCountdown;
            if (skipCountdownEl) skipCountdownEl.textContent = this.app.adCountdown;
            
            if (this.app.adCountdown <= 0) {
                clearInterval(this.app.adTimer);
                if (skipButton) {
                    skipButton.disabled = false;
                    skipButton.textContent = 'Continue';
                }
            }
        }, 1000);
    }

    completeSession() {
        console.log('Session completed');
        if (this.app.adTimer) {
            clearInterval(this.app.adTimer);
        }
        
        // Update streak
        this.app.userData.streak++;
        
        this.app.showScreen('reflect-screen');
        this.updateReflectionData();
    }

    updateReflectionData() {
        const currentStreakEl = document.getElementById('current-streak');
        const streakCountEl = document.getElementById('streak-count');
        
        if (currentStreakEl) currentStreakEl.textContent = this.app.userData.streak;
        if (streakCountEl) streakCountEl.textContent = this.app.userData.streak;
    }

    setupEventListeners() {
        // Audio buttons
        document.querySelectorAll('.play-audio').forEach(button => {
            button.addEventListener('click', () => {
                alert('Audio playback feature has not been implemented yet. This is a prototype demonstration.');
            });
        });

        // Vibe options
        document.querySelectorAll('.vibe-option').forEach(option => {
            option.addEventListener('click', () => this.selectVibe(option));
        });

        // Content cards
        document.querySelectorAll('.content-card').forEach(card => {
            card.addEventListener('click', () => this.selectContentCard(card));
        });
    }
}
