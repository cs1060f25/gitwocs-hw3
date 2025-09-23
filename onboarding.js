// Onboarding Module
class OnboardingManager {
    constructor(app) {
        this.app = app;
    }

    nextStep() {
        console.log('Next step called, current step:', this.app.onboardingStep);
        
        if (this.app.onboardingStep === 1) {
            // Save name
            const nameInput = document.getElementById('user-name');
            if (nameInput && nameInput.value) {
                this.app.userData.name = nameInput.value;
                console.log('Name saved:', this.app.userData.name);
            }
        }

        this.app.onboardingStep++;
        
        // Hide current step
        document.querySelectorAll('.onboard-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show next step
        const nextStep = document.getElementById(`step-${this.app.onboardingStep}`);
        if (nextStep) {
            nextStep.classList.add('active');
            this.updateOnboardingProgress();
        }
    }

    updateOnboardingProgress() {
        const progress = (this.app.onboardingStep / 3) * 100;
        const progressEl = document.getElementById('onboard-progress');
        if (progressEl) progressEl.style.width = `${progress}%`;
    }

    selectCommuteOption(option) {
        document.querySelectorAll('.commute-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        this.app.userData.commuteDuration = parseInt(option.dataset.duration);
        console.log('Commute duration set:', this.app.userData.commuteDuration);
    }

    toggleInterest(tag) {
        const interest = tag.dataset.interest;
        tag.classList.toggle('selected');
        
        if (tag.classList.contains('selected')) {
            if (!this.app.userData.interests.includes(interest)) {
                this.app.userData.interests.push(interest);
            }
        } else {
            this.app.userData.interests = this.app.userData.interests.filter(i => i !== interest);
        }
        console.log('Interests updated:', this.app.userData.interests);
    }

    completeOnboarding() {
        console.log('Complete onboarding called');
        
        // Validate at least one interest
        if (!this.app.userData.interests || this.app.userData.interests.length === 0) {
            this.app.showError('interests-error', 'Please select at least one interest to continue.');
            return;
        }
        
        this.app.showError('interests-error', '');
        console.log('Onboarding complete, user data:', this.app.userData);
        
        // Go to learn screen
        this.app.showScreen('learn-screen');
    }

    setupEventListeners() {
        // Commute options
        document.querySelectorAll('.commute-option').forEach(option => {
            option.addEventListener('click', () => this.selectCommuteOption(option));
        });

        // Interest tags
        document.querySelectorAll('.interest-tag').forEach(tag => {
            tag.addEventListener('click', () => this.toggleInterest(tag));
        });
    }
}
