// Authentication Module
class AuthManager {
    constructor(app) {
        this.app = app;
    }

    async signUp(name, email, password) {
        console.log('SignUp called with:', { name, email, password });
        
        // Validation
        const emailOk = /.+@.+\..+/.test(email);
        if (!name) { 
            this.app.showError('signup-error', 'Please enter your name.'); 
            return false; 
        }
        if (!emailOk) { 
            this.app.showError('signup-error', 'Please enter a valid email address.'); 
            return false; 
        }
        if (!password || password.length < 6) { 
            this.app.showError('signup-error', 'Password must be at least 6 characters.'); 
            return false; 
        }
        
        this.app.setLoading('signup-submit', true, 'Creating...');
        
        // Simulate successful sign-up
        this.app.userData.email = email;
        this.app.userData.name = name;
        this.app.userData.streak = 0;
        
        console.log('User data set:', this.app.userData);
        
        // Go to onboarding
        this.app.onboardingStep = 2;
        document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-2').classList.add('active');
        this.app.showScreen('onboard-screen');
        this.app.updateOnboardingProgress();
        this.app.setLoading('signup-submit', false);
        
        return true;
    }

    async signIn(email, password) {
        console.log('SignIn called with:', { email, password });
        
        // Validation
        const emailOk = /.+@.+\..+/.test(email);
        if (!emailOk) { 
            this.app.showError('signin-error', 'Please enter a valid email address.'); 
            return false; 
        }
        if (!password) { 
            this.app.showError('signin-error', 'Please enter your password.'); 
            return false; 
        }
        
        this.app.setLoading('signin-submit', true, 'Signing in...');
        
        // Simulate successful sign-in
        this.app.userData.email = email;
        this.app.userData.name = email.split('@')[0];
        this.app.userData.streak = Math.floor(Math.random() * 10) + 1;
        this.app.userData.interests = ['ai', 'coding'];
        
        console.log('User signed in:', this.app.userData);
        
        // Update UI
        const userDisplay = document.getElementById('user-name-display');
        const userChip = document.getElementById('user-chip');
        if (userDisplay) userDisplay.textContent = this.app.userData.name;
        if (userChip) userChip.style.display = 'flex';
        
        // Go to dashboard
        this.app.showScreen('dashboard-screen');
        this.app.updateDashboard();
        this.app.setLoading('signin-submit', false);
        
        return true;
    }

    signOut() {
        this.app.userData = { 
            name: '', 
            email: '', 
            commuteDuration: 25, 
            interests: [], 
            streak: 0, 
            currentVibe: 'curious', 
            selectedContent: '' 
        };
        
        const userChip = document.getElementById('user-chip');
        if (userChip) userChip.style.display = 'none';
        
        this.app.showScreen('discover-screen');
    }
}
