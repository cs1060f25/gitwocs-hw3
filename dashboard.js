// Dashboard Module
class DashboardManager {
    constructor(app) {
        this.app = app;
    }

    updateDashboard() {
        console.log('Updating dashboard for user:', this.app.userData);
        
        const first = (this.app.userData.name || '').split(' ')[0] || 'Learner';
        const fnEl = document.getElementById('dash-first-name');
        if (fnEl) fnEl.textContent = first;
        
        const ds = document.getElementById('dash-streak');
        if (ds) ds.textContent = this.app.userData.streak || 0;

        // Resume card
        const resumeTitle = document.getElementById('resume-title');
        const resumeSub = document.getElementById('resume-sub');
        if (this.app.lastSession && resumeTitle && resumeSub) {
            resumeTitle.textContent = this.app.lessonDefinitions[this.app.lastSession.contentId]?.lessonTitle || 'Last session';
            const when = new Date(this.app.lastSession.at).toLocaleString();
            resumeSub.textContent = `Last viewed • ${when}`;
        }

        // Suggestions from interests
        this.updateSuggestions();
        this.updateGoalsUI();
        this.updateFreezeBanner();
    }

    updateSuggestions() {
        const container = document.getElementById('dash-suggestions');
        if (!container) return;
        
        container.innerHTML = '';
        const topics = this.app.userData.interests?.length ? this.app.userData.interests : ['general'];
        const map = {
            spanish: 'spanish-basics', ai: 'ai-research', history: 'history-mini',
            business: 'biz-tactics', science: 'sci-discoveries', coding: 'code-snippets', general: 'focus-pack'
        };
        
        topics.slice(0, 3).forEach((t, idx) => {
            const id = map[t] || 'focus-pack';
            const def = this.app.lessonDefinitions[id];
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
                <p>Fit to ${this.app.userData.commuteDuration} min • Based on your interests</p>
                <div class="card-meta">
                    <span><i class="fas fa-clock"></i> ${this.app.userData.commuteDuration} min</span>
                    <span><i class="fas fa-star"></i> Personalized</span>
                </div>`;
            container.appendChild(card);
            
            card.addEventListener('click', () => {
                this.app.userData.selectedContent = id;
                this.app.showScreen('learn-screen');
                document.getElementById('vibe-check').classList.add('active');
                document.getElementById('content-selection').classList.remove('active');
                document.getElementById('active-lesson').classList.remove('active');
            });
        });
    }

    updateGoalsUI() {
        const target = 60; // minutes per week goal
        const data = this.readWeeklyMinutes();
        const minutes = Math.min(data.minutes, target);
        const percent = Math.round((minutes / target) * 100);
        
        const ring = document.querySelector('.goal-ring');
        const label = document.getElementById('goal-percent');
        const mEl = document.getElementById('goal-minutes');
        const tEl = document.getElementById('goal-target');
        
        if (ring) ring.style.background = `conic-gradient(#667eea ${percent * 3.6}deg, #e0e0e0 0deg)`;
        if (label) label.textContent = `${percent}%`;
        if (mEl) mEl.textContent = minutes;
        if (tEl) tEl.textContent = target;
    }

    updateFreezeBanner() {
        const el = document.getElementById('freeze-banner');
        if (!el) return;
        const last = this.app.lastSession?.at || 0;
        const hours = (Date.now() - last) / (1000*60*60);
        el.style.display = hours > 48 ? 'flex' : 'none';
    }

    readWeeklyMinutes() {
        if (!this.app.userData.email) return { week: this.getWeekKey(), minutes: 0 };
        const key = `commutrWeek_${this.app.userData.email}`;
        try {
            const obj = JSON.parse(localStorage.getItem(key) || 'null');
            if (!obj) return { week: this.getWeekKey(), minutes: 0 };
            if (obj.week !== this.getWeekKey()) return { week: this.getWeekKey(), minutes: 0 };
            return obj;
        } catch {
            return { week: this.getWeekKey(), minutes: 0 };
        }
    }

    getWeekKey() {
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0,0,0,0);
        return monday.toISOString().slice(0,10);
    }

    startQuickSession() {
        const topics = this.app.userData.interests && this.app.userData.interests.length ? this.app.userData.interests : ['general'];
        const map = { spanish: 'spanish-basics', ai: 'ai-research', history: 'history-mini', business: 'biz-tactics', science: 'sci-discoveries', coding: 'code-snippets', general: 'focus-pack' };
        const id = map[topics[0]] || 'focus-pack';
        this.app.userData.selectedContent = id;
        this.app.showScreen('learn-screen');
        document.getElementById('vibe-check').classList.add('active');
        document.getElementById('content-selection').classList.remove('active');
        document.getElementById('active-lesson').classList.remove('active');
    }

    goToEditProfile() {
        this.app.onboardingStep = 2;
        document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
        document.getElementById('step-2').classList.add('active');
        this.app.showScreen('onboard-screen');
        this.app.updateOnboardingProgress();
    }
}
