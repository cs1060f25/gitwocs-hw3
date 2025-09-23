// Main App Controller
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
        
        this.lessonProgress = 0;
        this.currentChunk = 1;
        this.totalChunks = 3;
        this.adCountdown = 15;
        this.lessonTimer = null;
        this.adTimer = null;
        this.lastSession = null;
        
        // Initialize modules
        this.auth = new AuthManager(this);
        this.dashboard = new DashboardManager(this);
        
        // Lesson definitions
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
                    }
                ]
            },
            'focus-pack': {
                lessonTitle: 'Focus Pack',
                chunks: [
                    {
                        title: 'Warm Up',
                        items: [
                            { primary: 'Breathing', secondary: '4-7-8 technique' },
                            { primary: 'Stretch', secondary: 'Neck/shoulders' },
                            { primary: 'Intent', secondary: 'Pick a goal' }
                        ]
                    }
                ]
            }
        };
        
        this.init();
    }

    init() {
        console.log('App initializing...');
        this.setupEventListeners();
        this.showScreen('discover-screen');
    }

    setupEventListeners() {
        // Logo click
        const logo = document.querySelector('.nav-logo');
        if (logo) {
            logo.style.cursor = 'pointer';
            logo.addEventListener('click', (e) => {
                e.preventDefault();
                this.resetToDiscover();
            });
        }
    }

    showScreen(screenId) {
        console.log('Showing screen:', screenId);
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
            this.currentScreen = screenId;
        } else {
            console.error('Screen not found:', screenId);
        }
        
        // Update navbar user chip visibility
        const chip = document.getElementById('user-chip');
        if (chip) chip.style.display = this.userData?.email ? 'flex' : 'none';
    }

    resetToDiscover() {
        // If user is signed in, ALWAYS go to dashboard
        if (this.userData && this.userData.email) {
            this.showScreen('dashboard-screen');
            this.dashboard.updateDashboard();
            return;
        }
        
        // Only reset to discover if user is NOT logged in
        this.showScreen('discover-screen');
    }

    ctaStart() {
        if (this.userData && this.userData.email) {
            // If profile complete, go to learn
            if (this.userData.interests && this.userData.interests.length > 0) {
                this.showScreen('learn-screen');
                return;
            }
            // Else go to onboarding
            this.onboardingStep = 2;
            document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
            document.getElementById('step-2').classList.add('active');
            this.showScreen('onboard-screen');
            this.updateOnboardingProgress();
        } else {
            this.showScreen('auth-screen');
        }
    }

    updateOnboardingProgress() {
        const progress = (this.onboardingStep / 3) * 100;
        const progressEl = document.getElementById('onboard-progress');
        if (progressEl) progressEl.style.width = `${progress}%`;
    }

    updateDashboard() {
        this.dashboard.updateDashboard();
    }

    showError(id, message) {
        const el = document.getElementById(id);
        if (!el) return;
        el.textContent = message || '';
        el.style.color = message ? '#d32f2f' : '';
        el.style.margin = message ? '0.5rem 0' : '';
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

// Global app instance
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    app = new CommutrApp();
});

// Global functions for HTML onclick handlers
function ctaStart() {
    if (app) app.ctaStart();
}

function signUp() {
    if (!app) return;
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim().toLowerCase();
    const password = document.getElementById('signup-password').value;
    
    console.log('SignUp button clicked:', { name, email, password });
    
    if (!name || !email || !password) {
        app.showError('signup-error', 'Please fill in all fields.');
        return;
    }
    app.auth.signUp(name, email, password);
}

function signIn() {
    if (!app) return;
    const email = document.getElementById('signin-email').value.trim().toLowerCase();
    const password = document.getElementById('signin-password').value;
    
    console.log('SignIn button clicked:', { email, password });
    
    if (!email || !password) {
        app.showError('signin-error', 'Please enter email and password.');
        return;
    }
    app.auth.signIn(email, password);
}

function signOut() {
    if (app) app.auth.signOut();
}

function resetToDiscover() {
    if (app) app.resetToDiscover();
}

function startQuickSession() {
    if (app) app.dashboard.startQuickSession();
}

function goToEditProfile() {
    if (app) app.dashboard.goToEditProfile();
}

function switchAuthTab(which) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.auth-tab[data-tab="${which}"]`).classList.add('active');
    document.getElementById(`${which}-panel`).classList.add('active');
}
