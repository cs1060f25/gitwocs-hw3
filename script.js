// Commutr App JavaScript
// Handles the complete user journey flow for free-plan users

class CommutrApp {
    constructor() {
        this.currentScreen = 'discover';
        this.onboardingStep = 1;
        this.userData = {
            name: '',
            email: '',
            commuteDuration: 25,
            interests: [],
            streak: 0,
            currentVibe: 'curious',
            selectedContent: ''
        };
        // Supabase
        this.supabase = null;
        this.hasSupabase = false;
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
        // Lesson definitions keyed by content id
        this.lessonDefinitions = {
            'spanish-basics': {
                lessonTitle: 'Spanish Travel Phrases',
                chunks: [
                    {
                        title: 'Essential Airport Vocabulary',
                        items: [
                            { primary: 'El aeropuerto', secondary: 'The airport' },
                            { primary: 'La puerta de embarque', secondary: 'The boarding gate' },
                            { primary: 'El equipaje', secondary: 'The luggage' }
                        ]
                    },
                    {
                        title: 'Hotel Check-in Phrases',
                        items: [
                            { primary: 'Una habitación', secondary: 'A room' },
                            { primary: 'La reserva', secondary: 'The reservation' },
                            { primary: 'El check-in', secondary: 'Check-in' }
                        ]
                    },
                    {
                        title: 'Restaurant Ordering',
                        items: [
                            { primary: 'La carta', secondary: 'The menu' },
                            { primary: 'Quiero pedir', secondary: 'I want to order' },
                            { primary: 'La cuenta', secondary: 'The bill' }
                        ]
                    }
                ]
            },
            'ai-research': {
                lessonTitle: 'AI Breakthroughs 2024',
                chunks: [
                    {
                        title: 'Frontier Models Overview',
                        items: [
                            { primary: 'Multimodal Reasoning', secondary: 'Vision + Text + Audio' },
                            { primary: 'Tool Use', secondary: 'Models calling external APIs' },
                            { primary: 'Distillation', secondary: 'Smaller, faster models' }
                        ]
                    },
                    {
                        title: 'Safety & Alignment',
                        items: [
                            { primary: 'RLHF', secondary: 'Reinforcement Learning from Human Feedback' },
                            { primary: 'Eval Suites', secondary: 'Bias, Safety, Robustness' },
                            { primary: 'Governance', secondary: 'Open weights vs APIs' }
                        ]
                    },
                    {
                        title: 'Where To Learn Next',
                        items: [
                            { primary: 'Papers With Code', secondary: 'Reproduce SOTA' },
                            { primary: 'Hugging Face', secondary: 'Models/Datasets/Spaces' },
                            { primary: 'ArXiv Sanity', secondary: 'Track new papers' }
                        ]
                    }
                ]
            },
            'history-mini': {
                lessonTitle: 'History Bites',
                chunks: [
                    {
                        title: 'Renaissance Spark',
                        items: [
                            { primary: 'Florence', secondary: 'Birthplace of the Renaissance' },
                            { primary: 'Printing Press', secondary: 'Knowledge explosion' },
                            { primary: 'Humanism', secondary: 'Focus on human potential' }
                        ]
                    },
                    {
                        title: 'Industrial Shift',
                        items: [
                            { primary: 'Steam Power', secondary: 'Mechanization of work' },
                            { primary: 'Urbanization', secondary: 'City growth' },
                            { primary: 'Labor Movements', secondary: 'Rise of unions' }
                        ]
                    },
                    {
                        title: 'Digital Era',
                        items: [
                            { primary: 'Internet', secondary: 'Global connectivity' },
                            { primary: 'Mobile', secondary: 'Computers in pockets' },
                            { primary: 'AI', secondary: 'Automation wave' }
                        ]
                    }
                ]
            },
            'biz-tactics': {
                lessonTitle: 'Business Tactics',
                chunks: [
                    { title: 'Growth Loops', items: [
                        { primary: 'Content → SEO', secondary: 'Compounding traffic' },
                        { primary: 'Referrals', secondary: 'Users invite users' },
                        { primary: 'Retention', secondary: 'Cohort improvements' }
                    ] },
                    { title: 'Pricing', items: [
                        { primary: 'Value-based', secondary: 'Charge for outcomes' },
                        { primary: 'Freemium', secondary: 'Upgrade path' },
                        { primary: 'Bundles', secondary: 'ARPU increase' }
                    ] },
                    { title: 'Experiments', items: [
                        { primary: 'A/B Testing', secondary: 'Measure impact' },
                        { primary: 'North Star', secondary: 'Unifying metric' },
                        { primary: 'Guardrails', secondary: 'Prevent regressions' }
                    ] }
                ]
            },
            'sci-discoveries': {
                lessonTitle: 'Science Discoveries',
                chunks: [
                    { title: 'Space & Time', items: [
                        { primary: 'Gravitational Waves', secondary: 'Ripples in spacetime' },
                        { primary: 'JWST', secondary: 'Deep universe images' },
                        { primary: 'Exoplanets', secondary: 'New worlds catalog' }
                    ] },
                    { title: 'Life Sciences', items: [
                        { primary: 'CRISPR', secondary: 'Edit DNA precisely' },
                        { primary: 'mRNA Vaccines', secondary: 'Rapid platform' },
                        { primary: 'Microbiome', secondary: 'Gut health insights' }
                    ] },
                    { title: 'Earth & Climate', items: [
                        { primary: 'Carbon Capture', secondary: 'Direct air capture' },
                        { primary: 'Renewables', secondary: 'Cost parity' },
                        { primary: 'Adaptation', secondary: 'Resilience planning' }
                    ] }
                ]
            },
            'code-snippets': {
                lessonTitle: 'Coding Snippets',
                chunks: [
                    { title: 'JavaScript Basics', items: [
                        { primary: 'map()', secondary: 'Transform arrays' },
                        { primary: 'filter()', secondary: 'Keep matching items' },
                        { primary: 'reduce()', secondary: 'Aggregate values' }
                    ] },
                    { title: 'Async Patterns', items: [
                        { primary: 'Promises', secondary: 'Handle async values' },
                        { primary: 'async/await', secondary: 'Write async like sync' },
                        { primary: 'fetch()', secondary: 'HTTP requests' }
                    ] },
                    { title: 'Tips', items: [
                        { primary: 'Debounce', secondary: 'Limit rapid calls' },
                        { primary: 'Throttling', secondary: 'Control rate' },
                        { primary: 'Memoization', secondary: 'Cache results' }
                    ] }
                ]
            },
            'focus-pack': {
                lessonTitle: 'Focus Pack',
                chunks: [
                    { title: 'Warm Up', items: [
                        { primary: 'Breathing', secondary: '4-7-8 technique' },
                        { primary: 'Stretch', secondary: 'Neck/shoulders' },
                        { primary: 'Intent', secondary: 'Pick a goal' }
                    ] },
                    { title: 'Learn', items: [
                        { primary: 'Pomodoro', secondary: 'Work in 25-min sprints' },
                        { primary: 'Recall', secondary: 'Test yourself' },
                        { primary: 'Spaced', secondary: 'Revisit for retention' }
                    ] },
                    { title: 'Cool Down', items: [
                        { primary: 'Journal', secondary: 'Note a win' },
                        { primary: 'Plan', secondary: 'Stack next habit' },
                        { primary: 'Reward', secondary: 'Celebrate small wins' }
                    ] }
                ]
            }
        };
        this.currentLesson = null;
        this.lastSession = null; // {contentId, title, at}
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initSupabase();
        this.updateStreakDisplay();
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

        // Clear auth errors on input
        ['signup-name','signup-email','signup-password','signin-email','signin-password'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', () => {
                this.showError(id.includes('signup') ? 'signup-error' : 'signin-error', '');
            });
        });

        // Logo click routes to dashboard (if signed-in) or discover (if logged out)
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetToDiscover();
            });
        }

        // Goals & freeze banner
        this.updateGoalsUI();
        this.updateFreezeBanner();
    }

    // Screen Navigation
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
        // Update navbar user chip visibility
        const chip = document.getElementById('user-chip');
        if (chip) chip.style.display = this.userData?.email ? 'flex' : 'none';
    }

    // Discovery CTA routing
    ctaStart() {
        if (this.userData && this.userData.email) {
            // If profile complete (has interests), go straight to learn
            if (this.userData.interests && this.userData.interests.length > 0) {
                this.showScreen('learn-screen');
                this.updateSessionInfo();
                return;
            }
            // Else go to onboarding from step-2 (skip name)
            this.onboardingStep = 2;
            document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
            document.getElementById('step-2').classList.add('active');
            this.showScreen('onboard-screen');
            this.updateOnboardingProgress();
        } else {
            this.showScreen('auth-screen');
        }
    }

    // Dashboard actions
    startQuickSession() {
        const topics = this.userData.interests && this.userData.interests.length ? this.userData.interests : ['general'];
        const map = { spanish: 'spanish-basics', ai: 'ai-research', history: 'history-mini', business: 'biz-tactics', science: 'sci-discoveries', coding: 'code-snippets', general: 'focus-pack' };
        const id = map[topics[0]] || 'focus-pack';
        this.userData.selectedContent = id;
        this.showScreen('learn-screen');
        document.getElementById('vibe-check').classList.add('active');
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.remove('active');
    }

    resumeLast() {
        if (!this.lastSession) {
            this.startQuickSession();
            return;
        }
        const id = this.lastSession.contentId || 'focus-pack';
        this.userData.selectedContent = id;
        this.currentLesson = this.lessonDefinitions[id] || this.lessonDefinitions['focus-pack'];
        this.showScreen('learn-screen');
        document.getElementById('vibe-check').classList.remove('active');
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.add('active');
        if (this.currentLesson) document.getElementById('lesson-title').textContent = this.currentLesson.lessonTitle;
        this.startLesson();
    }

    // Discovery to Onboarding (explicit)
    startOnboarding() { this.ctaStart(); }

    // Onboarding Flow
    nextStep() {
        if (this.onboardingStep === 1) {
            // Save or confirm name
            const nameInput = document.getElementById('user-name');
            if (nameInput) this.userData.name = nameInput.value || this.userData.name || 'Learner';
            this.persistUserProfile();
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
        // Validate at least one interest
        if (!this.userData.interests || this.userData.interests.length === 0) {
            this.showError('interests-error', 'Please select at least one interest to continue.');
            return;
        }
        this.showError('interests-error', '');
        this.showScreen('learn-screen');
        this.updateSessionInfo();
        // Save commute and interests as profile completion
        this.persistUserProfile();
    }

    // Learning Flow
    updateSessionInfo() {
        const timeOfDay = new Date().getHours() < 12 ? 'Morning' : 'Evening';
        document.getElementById('session-title').textContent = `${timeOfDay} Commute`;
        document.getElementById('session-time').textContent = `${this.userData.commuteDuration} minutes available`;
        // Navbar user display
        const nameEl = document.getElementById('user-name-display');
        if (nameEl) nameEl.textContent = this.userData.name || 'Guest';
        const first = (this.userData.name || '').split(' ')[0] || 'Learner';
        const firstEl = document.getElementById('user-first-name');
        if (firstEl) firstEl.textContent = first;
    }

    // Dashboard population
    updateDashboard() {
        const first = (this.userData.name || '').split(' ')[0] || 'Learner';
        const fnEl = document.getElementById('dash-first-name');
        if (fnEl) fnEl.textContent = first;
        const ds = document.getElementById('dash-streak');
        if (ds) ds.textContent = this.userData.streak || 0;

        // Resume card
        const resumeTitle = document.getElementById('resume-title');
        const resumeSub = document.getElementById('resume-sub');
        if (this.lastSession && resumeTitle && resumeSub) {
            resumeTitle.textContent = this.lessonDefinitions[this.lastSession.contentId]?.lessonTitle || 'Last session';
            const when = new Date(this.lastSession.at).toLocaleString();
            resumeSub.textContent = `Last viewed • ${when}`;
        }

        // Suggestions from interests
        const container = document.getElementById('dash-suggestions');
        if (container) {
            container.innerHTML = '';
            const topics = this.userData.interests?.length ? this.userData.interests : ['general'];
            const map = {
                spanish: 'spanish-basics', ai: 'ai-research', history: 'history-mini',
                business: 'biz-tactics', science: 'sci-discoveries', coding: 'code-snippets', general: 'focus-pack'
            };
            topics.slice(0, 3).forEach((t, idx) => {
                const id = map[t] || 'focus-pack';
                const def = this.lessonDefinitions[id];
                if (!def) return;
                const card = document.createElement('div');
                card.className = 'content-card' + (idx === 0 ? ' recommended' : '');
                card.dataset.content = id;
                card.innerHTML = `
                    <div class="card-header">
                        <i class="fas fa-book-open"></i>
                        ${idx === 0 ? '<span class="recommended-badge">Recommended</span>' : ''}
                    </div>
                    <h4>${def.lessonTitle}</h4>
                    <p>Fit to ${this.userData.commuteDuration} min • Based on your interests</p>
                    <div class="card-meta">
                        <span><i class="fas fa-clock"></i> ${this.userData.commuteDuration} min</span>
                        <span><i class="fas fa-star"></i> Personalized</span>
                    </div>`;
                container.appendChild(card);
                card.addEventListener('click', () => {
                    this.userData.selectedContent = id;
                    this.showScreen('learn-screen');
                    document.getElementById('vibe-check').classList.add('active');
                    document.getElementById('content-selection').classList.remove('active');
                    document.getElementById('active-lesson').classList.remove('active');
                });
            });
        }
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
        // Reset any stale previous selection (e.g., Spanish)
        this.userData.selectedContent = '';
        this.curateContent();
    }

    curateContent() {
        const container = document.querySelector('#content-selection .content-cards');
        if (!container) return;
        container.innerHTML = '';

        const choices = this.userData.interests && this.userData.interests.length ? this.userData.interests : ['general'];

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

        // Loading effect
        const section = document.getElementById('content-selection');
        section.classList.add('loading');
        setTimeout(() => section.classList.remove('loading'), 800);

        // Always default-select the first option to avoid stale previous topic
        const firstCard = container.querySelector('.content-card');
        if (firstCard) {
            container.querySelectorAll('.content-card').forEach(c => c.classList.remove('selected'));
            firstCard.classList.add('selected');
            this.userData.selectedContent = firstCard.dataset.content;
        }
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
        // Prepare lesson based on selected content
        this.currentLesson = this.lessonDefinitions[this.userData.selectedContent] || this.lessonDefinitions['focus-pack'];
        if (this.currentLesson) {
            document.getElementById('lesson-title').textContent = this.currentLesson.lessonTitle;
        }
        // Build a generative session plan from topic, vibe, and commute time
        this.sessionPlan = this.generateSessionPlan(this.userData.selectedContent, this.userData.currentVibe, this.userData.commuteDuration);
        this.totalChunks = this.sessionPlan.length || 3;
        this.startLesson();
    }

    startLesson() {
        this.lessonProgress = 0;
        this.currentChunk = 1;
        this.updateLessonProgress();
        // Render first chunk immediately so default HTML never shows
        this.updateChunkContent();
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
        const activity = (this.sessionPlan && this.sessionPlan[this.currentChunk - 1]) || null;
        if (!activity) return;
        currentChunkEl.querySelector('h4').textContent = activity.title;

        const container = currentChunkEl.querySelector('.vocab-list');
        container.innerHTML = '';

        const renderVocab = () => {
            activity.items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'vocab-item';
                row.innerHTML = `
                    <span class="spanish">${item.primary}</span>
                    <span class="english">${item.secondary}</span>
                    <button class="play-audio"><i class="fas fa-volume-up"></i></button>
                `;
                container.appendChild(row);
            });
            container.querySelectorAll('.play-audio').forEach(button => {
                button.addEventListener('click', () => this.playAudio(button));
            });
        };

        const renderQuiz = () => {
            const q = activity.question;
            const qEl = document.createElement('div');
            qEl.innerHTML = `<p style="margin-bottom:0.75rem; font-weight:600;">${q.prompt}</p>`;
            container.appendChild(qEl);
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'next-button';
                btn.style.marginBottom = '0.5rem';
                btn.textContent = opt;
                btn.addEventListener('click', () => {
                    if (idx === q.answer) {
                        btn.style.background = 'linear-gradient(135deg, #58cc02, #89e219)';
                        this.lessonProgress = Math.min(100, this.lessonProgress + 20);
                        this.updateLessonProgress();
                    } else {
                        btn.style.background = 'linear-gradient(135deg, #ff6b6b, #ff8e53)';
                    }
                });
                container.appendChild(btn);
            });
        };

        const renderScenario = () => {
            const p = document.createElement('p');
            p.textContent = activity.context;
            p.style.marginBottom = '0.75rem';
            container.appendChild(p);
            activity.choices.forEach(choice => {
                const btn = document.createElement('button');
                btn.className = 'next-button';
                btn.style.marginBottom = '0.5rem';
                btn.textContent = choice.text;
                btn.addEventListener('click', () => {
                    btn.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
                    const fb = document.createElement('small');
                    fb.textContent = choice.feedback;
                    fb.style.display = 'block';
                    fb.style.marginTop = '0.5rem';
                    container.appendChild(fb);
                });
                container.appendChild(btn);
            });
        };

        const renderCode = () => {
            const pre = document.createElement('pre');
            pre.style.background = '#0d1117';
            pre.style.color = '#c9d1d9';
            pre.style.padding = '1rem';
            pre.style.borderRadius = '10px';
            pre.textContent = activity.snippet;
            container.appendChild(pre);
            if (activity.check) {
                const btn = document.createElement('button');
                btn.className = 'next-button';
                btn.textContent = 'Run mental check';
                btn.addEventListener('click', () => {
                    const fb = document.createElement('small');
                    fb.textContent = activity.check;
                    fb.style.display = 'block';
                    fb.style.marginTop = '0.5rem';
                    container.appendChild(fb);
                });
                container.appendChild(btn);
            }
        };

        const renderPodcast = () => {
            const summary = document.createElement('p');
            summary.textContent = activity.summary;
            summary.style.marginBottom = '0.75rem';
            container.appendChild(summary);
            const play = document.createElement('button');
            play.className = 'next-button';
            play.innerHTML = '<i class="fas fa-headphones"></i> Listen summary';
            play.addEventListener('click', () => {
                this.speak(activity.summary, 'en-US');
            });
            container.appendChild(play);
        };

        switch (activity.type) {
            case 'vocab':
                renderVocab();
                break;
            case 'quiz':
                renderQuiz();
                break;
            case 'scenario':
                renderScenario();
                break;
            case 'code':
                renderCode();
                break;
            case 'podcast':
                renderPodcast();
                break;
            default:
                renderVocab();
        }
    }

    // Generative session plan (lightweight heuristic in client)
    generateSessionPlan(topicId, vibe, minutes) {
        const slots = Math.max(3, Math.min(6, Math.round(minutes / 5)));
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        const plan = [];

        const poolByTopic = {
            'spanish-basics': ['vocab', 'quiz', 'scenario', 'podcast'],
            'ai-research': ['podcast', 'quiz', 'scenario'],
            'history-mini': ['podcast', 'scenario', 'quiz'],
            'biz-tactics': ['scenario', 'quiz', 'podcast'],
            'sci-discoveries': ['podcast', 'quiz', 'scenario'],
            'code-snippets': ['code', 'quiz', 'podcast'],
            'focus-pack': ['podcast', 'scenario', 'quiz']
        };

        const types = poolByTopic[topicId] || poolByTopic['focus-pack'];
        const focusBias = vibe === 'focused' ? ['quiz', 'code'] : vibe === 'chill' ? ['podcast', 'scenario'] : types;

        for (let i = 0; i < slots; i++) {
            const t = pick(focusBias);
            if (t === 'vocab') {
                plan.push({
                    type: 'vocab',
                    title: 'Key Phrases You Can Use Today',
                    items: [
                        { primary: 'Hola', secondary: 'Hello' },
                        { primary: 'Gracias', secondary: 'Thank you' },
                        { primary: '¿Dónde está...?', secondary: 'Where is...?' }
                    ]
                });
            } else if (t === 'quiz') {
                plan.push({
                    type: 'quiz',
                    title: 'Quick Check',
                    question: {
                        prompt: this.quizPromptFor(topicId),
                        options: this.quizOptionsFor(topicId),
                        answer: 0
                    }
                });
            } else if (t === 'scenario') {
                plan.push({
                    type: 'scenario',
                    title: 'Scenario Practice',
                    context: this.scenarioContextFor(topicId),
                    choices: [
                        { text: 'Option A', feedback: 'Solid choice — here is why it works.' },
                        { text: 'Option B', feedback: 'Consider the trade-offs; this might be slower.' }
                    ]
                });
            } else if (t === 'code') {
                plan.push({
                    type: 'code',
                    title: 'Read & Reason: Code Snippet',
                    snippet: `// What does this output?\nconst nums = [1,2,3];\nconsole.log(nums.map(n => n * 2).join(', '));`,
                    check: 'It prints "2, 4, 6" — mapping doubles each element and join combines with commas.'
                });
            } else if (t === 'podcast') {
                plan.push({
                    type: 'podcast',
                    title: '2‑Minute Insight',
                    summary: this.podcastSummaryFor(topicId)
                });
            }
        }
        return plan;
    }

    quizPromptFor(topicId) {
        switch (topicId) {
            case 'ai-research': return 'Which approach helps models follow human intent?';
            case 'history-mini': return 'What invention accelerated knowledge spread in Europe?';
            case 'biz-tactics': return 'Which strategy increases average revenue per user (ARPU)?';
            case 'sci-discoveries': return 'JWST primarily advances our understanding of…';
            case 'code-snippets': return 'What does Array.map() do?';
            default: return 'How do you say “Thank you” in Spanish?';
        }
    }

    quizOptionsFor(topicId) {
        switch (topicId) {
            case 'ai-research': return ['RLHF', 'Dropout', 'Normalization', 'Data Augmentation'];
            case 'history-mini': return ['Printing Press', 'Steam Engine', 'Compass', 'Gunpowder'];
            case 'biz-tactics': return ['Bundles', 'Churn', 'Latency', 'Cold start'];
            case 'sci-discoveries': return ['Early universe/galaxies', 'Traffic patterns', 'GDP trends', 'Protein folding'];
            case 'code-snippets': return ['Transforms each element and returns a new array', 'Filters items in place', 'Sorts the array numerically', 'Mutates each object'];
            default: return ['Gracias', 'Adiós', 'Perdón', 'Por favor'];
        }
    }

    scenarioContextFor(topicId) {
        switch (topicId) {
            case 'biz-tactics': return 'You lead a SaaS with flat growth. Choose a tactic to try next.';
            case 'history-mini': return 'You are a printer in 1450s Mainz deciding where to expand.';
            case 'ai-research': return 'Your team must evaluate a new LLM for safety — what to prioritize?';
            case 'code-snippets': return 'You need to transform an array of prices to include tax.';
            default: return 'Real-world practice to apply what you just learned.';
        }
    }

    podcastSummaryFor(topicId) {
        switch (topicId) {
            case 'ai-research': return 'Today in AI: multimodal models unify text, images, and audio. Tool use lets them call APIs to solve real tasks.';
            case 'history-mini': return 'Renaissance to Industry: new tools like the printing press amplified ideas, reshaping economies and education.';
            case 'biz-tactics': return 'Growth loops beat funnels: design systems where each new user attracts another. Small compounding wins matter.';
            case 'sci-discoveries': return 'JWST reveals early galaxies; climate tech races forward with renewables and carbon capture innovations.';
            case 'code-snippets': return 'Async/await simplifies promises, helping you write clear network code. Remember to handle errors with try/catch.';
            default: return 'Practice bite-sized phrases you can use immediately during travel.';
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
            // Select voice matching requested language
            const voices = window.speechSynthesis.getVoices();
            const match = voices.find(v => (v.lang || '').toLowerCase().startsWith(lang.toLowerCase().slice(0,2)))
                || voices.find(v => v.default) || voices[0] || null;
            if (match) utterance.voice = match;
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
        const isSpanish = (this.userData.selectedContent === 'spanish-basics');
        const ok = this.speak(word, isSpanish ? 'es-ES' : 'en-US');
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
        const subtitle = document.getElementById('completion-subtitle');
        if (subtitle && this.currentLesson) {
            subtitle.textContent = `You've completed: ${this.currentLesson.lessonTitle}`;
        }
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
        this.persistUserProfile();
        
        this.showScreen('reflect-screen');
        this.updateReflectionData();
        this.saveLastSession();
        this.addWeeklyMinutes(this.userData.commuteDuration || 10);
    }

    // Reflection Flow
    updateReflectionData() {
        document.getElementById('current-streak').textContent = this.userData.streak;
        document.getElementById('streak-count').textContent = this.userData.streak;
        // Build mastery board based on interests
        const container = document.getElementById('mastery-items');
        if (container) {
            container.innerHTML = '';
            const interests = this.userData.interests && this.userData.interests.length ? this.userData.interests : ['general'];
            const iconMap = { spanish: 'fa-language', ai: 'fa-robot', history: 'fa-landmark', business: 'fa-chart-line', science: 'fa-flask', coding: 'fa-code', general: 'fa-lightbulb' };
            interests.forEach((topic, i) => {
                const levelPct = Math.min(100, 30 + i * 15 + (this.userData.streak * 3));
                const item = document.createElement('div');
                item.className = 'mastery-item';
                item.innerHTML = `
                    <div class="mastery-icon"><i class="fas ${iconMap[topic] || 'fa-lightbulb'}"></i></div>
                    <div class="mastery-info">
                        <h4>${this.prettyTopic(topic)}</h4>
                        <div class="mastery-level">
                            <span class="level-badge beginner">Beginner</span>
                            <div class="level-progress"><div class="level-fill" style="width: ${levelPct}%"></div></div>
                        </div>
                    </div>`;
                container.appendChild(item);
            });
        }
    }

    prettyTopic(key) {
        const map = { spanish: 'Spanish', ai: 'AI & Technology', history: 'History', business: 'Business', science: 'Science', coding: 'Programming', general: 'Focus' };
        return map[key] || key;
    }

    updateStreakDisplay() {
        document.getElementById('streak-count').textContent = this.userData.streak || 0;
    }

    resetToDiscover() {
        // If user is signed in, ALWAYS go to dashboard (Welcome back screen)
        if (this.userData && this.userData.email) {
            this.showScreen('dashboard-screen');
            this.updateDashboard();
            return; // Don't reset anything else if user is logged in
        }
        
        // Only reset to discover if user is NOT logged in
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

    // Last session helpers (local only for prototype)
    saveLastSession() {
        if (!this.userData.email) return;
        const key = `commutrLast_${this.userData.email}`;
        this.lastSession = { contentId: this.userData.selectedContent, at: Date.now() };
        localStorage.setItem(key, JSON.stringify(this.lastSession));
    }
    loadLastSession() {
        if (!this.userData.email) return;
        const key = `commutrLast_${this.userData.email}`;
        try { this.lastSession = JSON.parse(localStorage.getItem(key) || 'null'); } catch { this.lastSession = null; }
    }

    // Supabase integration
    initSupabase() {
        try {
            if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
                !window.SUPABASE_URL.includes('YOUR-PROJECT-REF') && !window.SUPABASE_ANON_KEY.includes('YOUR-ANON-KEY')) {
                this.supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
                this.hasSupabase = true;
                // Load existing session
                this.loadSessionFromSupabase();
                // Listen to auth changes
                this.supabase.auth.onAuthStateChange((_event, session) => {
                    if (session && session.user) {
                        this.handleSignedIn(session);
                    } else {
                        this.handleSignedOut();
                    }
                });
            } else {
                console.warn('Supabase not configured. Falling back to guest mode.');
                this.showScreen('discover-screen');
            }
        } catch (e) {
            console.warn('Supabase initialization failed', e);
            this.showScreen('discover-screen');
        }
    }

    async loadSessionFromSupabase() {
        if (!this.hasSupabase) return this.showScreen('discover-screen');
        const { data: { session } } = await this.supabase.auth.getSession();
        if (session && session.user) {
            await this.handleSignedIn(session);
        } else {
            this.showScreen('discover-screen');
        }
    }

    async handleSignedIn(session) {
        const user = session.user;
        this.userData.email = user.email;
        // Prime name from auth metadata if profile not set yet
        const authName = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name)) || '';
        if (authName && !this.userData.name) this.userData.name = authName;
        // Fetch profile
        await this.fetchProfile(user.id);
        document.getElementById('user-name-display').textContent = this.userData.name || (user.email?.split('@')[0]) || 'Learner';
        // Load last session (local only for prototype)
        this.loadLastSession();
        // Go to dashboard for signed-in users
        this.showScreen('dashboard-screen');
        this.updateDashboard();
    }

    handleSignedOut() {
        this.userData = { name: '', email: '', commuteDuration: 25, interests: [], streak: 0, currentVibe: 'curious', selectedContent: '' };
        this.updateStreakDisplay();
        this.showScreen('discover-screen');
    }

    async fetchProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('name, commute_duration, interests, streak, current_vibe')
                .eq('id', userId)
                .single();
            if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows
            if (data) {
                this.userData = {
                    ...this.userData,
                    name: data.name || this.userData.name,
                    commuteDuration: data.commute_duration ?? this.userData.commuteDuration,
                    interests: Array.isArray(data.interests) ? data.interests : (data.interests ? JSON.parse(data.interests) : []),
                    streak: data.streak ?? this.userData.streak,
                    currentVibe: data.current_vibe || this.userData.currentVibe
                };
                this.updateStreakDisplay();
            }
        } catch (e) {
            console.warn('fetchProfile error', e);
        }
    }

    async persistUserProfile() {
        try {
            if (!this.hasSupabase) return;
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) return;
            const payload = {
                id: user.id,
                name: this.userData.name || (user.email?.split('@')[0]),
                commute_duration: this.userData.commuteDuration,
                interests: this.userData.interests, // stored as jsonb
                streak: this.userData.streak,
                current_vibe: this.userData.currentVibe,
                updated_at: new Date().toISOString()
            };
            const { error } = await this.supabase.from('profiles').upsert(payload, { onConflict: 'id' });
            if (error) throw error;
        } catch (e) {
            console.warn('persistUserProfile error', e);
        }
    }

    async signUp({ name, email, password }) {
        // Client-side validation
        const emailOk = /.+@.+\..+/.test(email);
        if (!name) { this.showError('signup-error', 'Please enter your name.'); return; }
        if (!emailOk) { this.showError('signup-error', 'Please enter a valid email address.'); return; }
        if (!password || password.length < 6) { this.showError('signup-error', 'Password must be at least 6 characters.'); return; }
        
        this.setLoading('signup-submit', true, 'Creating...');
        
        // Simulate successful sign-up
        this.userData.email = email;
        this.userData.name = name;
        this.userData.streak = 0; // New user starts with 0 streak
        
        // Go to onboarding step 2
        const nameEl = document.getElementById('user-name');
        if (nameEl) nameEl.value = name;
        this.onboardingStep = 2;
        document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-2').classList.add('active');
        this.showScreen('onboard-screen');
        this.updateOnboardingProgress();
        this.updateSessionInfo();
        this.setLoading('signup-submit', false);
    }

    async signIn({ email, password }) {
        // For prototype: skip Supabase and simulate sign-in
        const emailOk = /.+@.+\..+/.test(email);
        if (!emailOk) { this.showError('signin-error', 'Please enter a valid email address.'); return; }
        if (!password) { this.showError('signin-error', 'Please enter your password.'); return; }
        
        this.setLoading('signin-submit', true, 'Signing in...');
        
        // Simulate successful sign-in
        this.userData.email = email;
        this.userData.name = email.split('@')[0]; // Use email prefix as name
        this.userData.streak = Math.floor(Math.random() * 10) + 1; // Random streak 1-10
        this.userData.interests = ['ai', 'coding']; // Default interests
        
        // Update UI elements
        document.getElementById('user-name-display').textContent = this.userData.name;
        document.getElementById('user-chip').style.display = 'flex';
        
        this.loadLastSession();
        this.showScreen('dashboard-screen');
        this.updateDashboard();
        this.setLoading('signin-submit', false);
    }

    async signOut() {
        if (this.hasSupabase) {
            await this.supabase.auth.signOut();
        }
        this.handleSignedOut();
    }

    // Dashboard: Edit Profile goes to onboarding steps
    goToEditProfile() {
        this.onboardingStep = 2;
        document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-2').classList.add('active');
        this.showScreen('onboard-screen');
        this.updateOnboardingProgress();
    }

    // Auth: resend email confirmation
    async resendConfirmation() {
        try {
            if (!this.hasSupabase) return;
            const email = (document.getElementById('signin-email')?.value || '').trim();
            const emailOk = /.+@.+\..+/.test(email);
            if (!emailOk) {
                this.showError('signin-error', 'Enter your email above, then press Resend confirmation.');
                return;
            }
            await this.supabase.auth.resend({ type: 'signup', email });
            this.showError('signin-error', 'Confirmation email sent. Check your inbox.');
        } catch (e) {
            this.showError('signin-error', e.message || 'Could not resend confirmation.');
        }
    }

    async forgotPassword(email) {
        if (!this.hasSupabase) return;
        const emailOk = /.+@.+\..+/.test(email || '');
        if (!emailOk) {
            this.showError('signin-error', 'Enter your email above and click “Forgot password?” again.');
            return;
        }
        try {
            // You can set a redirectTo URL in Supabase Auth settings; for local dev, localhost is fine
            await this.supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
            this.showError('signin-error', 'Password reset email sent. Check your inbox.');
        } catch (e) {
            this.showError('signin-error', e.message || 'Could not send reset email.');
        }
    }

    // UI helpers
    showError(id, message) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = message || '';
        el.style.color = message ? '#d32f2f' : '';
        el.style.margin = message ? '0.5rem 0' : '';
    }

    updateFreezeBanner() {
        const el = document.getElementById('freeze-banner');
        if (!el) return;
        const last = this.lastSession?.at || 0;
        const hours = (Date.now() - last) / (1000*60*60);
        el.style.display = hours > 48 ? 'flex' : 'none';
    }

    setLoading(buttonId, isLoading, loadingText) {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        if (isLoading) {
            btn.dataset.prevText = btn.textContent;
            if (loadingText) btn.textContent = loadingText;
            btn.disabled = true;
            btn.classList.add('loading');
        } else {
            btn.textContent = btn.dataset.prevText || btn.textContent;
            btn.disabled = false;
            btn.classList.remove('loading');
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

// New global wrappers for auth and CTA
function ctaStart() {
    app.ctaStart();
}

function signUp() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    if (!name || !email || !password) {
        app.showError('signup-error', 'Please fill in name, email, and password.');
        return;
    }
    app.signUp({ name, email, password });
}

function signIn() {
    const email = document.getElementById('signin-email').value.trim().toLowerCase();
    const password = document.getElementById('signin-password').value;
    if (!email || !password) {
        app.showError('signin-error', 'Please enter email and password.');
        return;
    }
    app.signIn({ email, password });
}

function signOut() {
    app.signOut();
}

function switchAuthTab(which) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${which}"]`).classList.add('active');
    document.getElementById(`${which}-panel`).classList.add('active');
}

// Dashboard global handlers
function startQuickSession() {
    app.startQuickSession();
}

function resumeLast() {
    app.resumeLast();
}

// Auth helper
function forgotPassword() {
    const email = document.getElementById('signin-email').value.trim();
    app.forgotPassword(email);
}

function goToEditProfile() {
    app.goToEditProfile();
}

function resendConfirmation() {
    app.resendConfirmation();
}

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

    // Fallback binding for the landing CTA
    const startBtn = document.getElementById('start-learning-btn');
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.app && typeof app.ctaStart === 'function') {
                app.ctaStart();
            }
        }, { once: false });
    }
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
