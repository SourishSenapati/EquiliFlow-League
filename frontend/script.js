/**
 * EquiliFlow League | Industrial Digital Twin Engine v1.0.6
 * Integrated Physics Engine, Career Progression, and Curriculum Sync.
 * Developed by Soul Architect for Sourish Senapati.
 */

/* ------------------------------------------------------------------ */
/*  MOLECULAR ENGINE (Process Thermodynamics)                         */
/* ------------------------------------------------------------------ */

class MolecularEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.temp = 1.0;
        this.entropy = 0;
        this.tier = 0;
        this.bounds = { w: 0, h: 0 };
        this._resize();
        window.addEventListener('resize', () => this._resize());
        this._loop();
    }

    _resize() {
        if (!this.canvas.parentElement) return;
        const r = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = r.width;
        this.canvas.height = Math.min(r.height, 800);
        this.bounds = { w: this.canvas.width, h: this.canvas.height };
    }

    spawn() {
        const p = {
            x: Math.random() * this.bounds.w,
            y: Math.random() * this.bounds.h,
            oldX: Math.random() * this.bounds.w,
            oldY: Math.random() * this.bounds.h,
            r: 4 + Math.random() * 6,
            color: this._getColor(),
            mass: 1.0
        };
        this.particles.push(p);
    }

    _getColor() {
        const pairs = [['#8b5cf6', '#06b6d4'], ['#10b981', '#3b82f6'], ['#f59e0b', '#ef4444'], ['#ffffff', '#8b5cf6']];
        const p = pairs[this.tier] || pairs[0];
        return Math.random() > 0.5 ? p[0] : p[1];
    }

    heat() { this.temp = Math.min(this.temp + 0.5, 10.0); }
    cool() { this.temp = Math.max(this.temp - 0.5, 0.1); }

    _update() {
        const f = 0.99, g = 0.1;
        for (let p of this.particles) {
            let vx = (p.x - p.oldX) * f;
            let vy = (p.y - p.oldY) * f;
            p.oldX = p.x; p.oldY = p.y;
            p.x += vx + (Math.random()-0.5) * this.temp * 0.2;
            p.y += vy + (Math.random()-0.5) * this.temp * 0.2 + g;
            if (p.x > this.bounds.w - p.r) { p.x = this.bounds.w - p.r; p.oldX = p.x + vx; }
            if (p.x < p.r) { p.x = p.r; p.oldX = p.x + vx; }
            if (p.y > this.bounds.h - p.r) { p.y = this.bounds.h - p.r; p.oldY = p.y + vy; }
            if (p.y < p.r) { p.y = p.r; p.oldY = p.y + vy; }
        }
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i], p2 = this.particles[j];
                const dx = p2.x-p1.x, dy = p2.y-p1.y, dist = Math.sqrt(dx*dx+dy*dy), min = p1.r+p2.r;
                if (dist < min) {
                    const angle = Math.atan2(dy, dx);
                    const tx = p1.x + Math.cos(angle)*min, ty = p1.y + Math.sin(angle)*min;
                    const ax = (tx - p2.x)*0.5, ay = (ty - p2.y)*0.5;
                    p1.x -= ax; p1.y -= ay; p2.x += ax; p2.y += ay;
                    this.entropy += 0.01 * this.temp;
                }
            }
        }
    }

    _draw() {
        this.ctx.clearRect(0, 0, this.bounds.w, this.bounds.h);
        this.ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        for (let i=0; i<this.bounds.w; i+=50) { this.ctx.beginPath(); this.ctx.moveTo(i,0); this.ctx.lineTo(i,this.bounds.h); this.ctx.stroke(); }
        let totalKe = 0;
        for (let p of this.particles) {
            totalKe += 0.5 * p.mass * ((p.x-p.oldX)**2 + (p.y-p.oldY)**2);
            const g = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*2.5);
            g.addColorStop(0, p.color+'aa'); g.addColorStop(1, p.color+'00');
            this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2); this.ctx.fillStyle=g; this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(p.x,p.y,p.r,0,Math.PI*2); this.ctx.fillStyle=p.color; this.ctx.fill();
        }
        const keEl = document.getElementById('kin-e'), entEl = document.getElementById('entropy-val');
        if (keEl) keEl.textContent = totalKe.toFixed(2);
        if (entEl) entEl.textContent = (this.entropy * 0.1).toFixed(2);
    }

    _loop() { this._update(); this._draw(); this.raf = requestAnimationFrame(() => this._loop()); }
}

/* ------------------------------------------------------------------ */
/*  REACTOR CANVAS (Process Flow Visualization)                        */
/* ------------------------------------------------------------------ */

class ReactorCanvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.physics = { flow_rate: 0, temp_k: 0, conversion: 0 };
        this._animate();
    }
    setPhysics(d) { Object.assign(this.physics, d); }
    _animate() { this.draw(); this.raf = requestAnimationFrame(() => this._animate()); }
    draw() {
        const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);
        const tempColor = this.physics.temp_k > 400 ? "#f43f5e" : (this.physics.temp_k > 300 ? "#fbbf24" : "#06b6d4");
        const flow = (this.physics.flow_rate || 50) / 100;
        this._drawPath(ctx, w, h, tempColor, flow);
        this._drawUnit(ctx, w*0.1, h*0.7, "FEED", "#94a3b8");
        this._drawUnit(ctx, w*0.3, h*0.8, "P-101", "#06b6d4", true);
        this._drawUnit(ctx, w*0.5, h*0.4, "HX-101", "#fbbf24", true, true);
        this._drawUnit(ctx, w*0.7, h*0.7, "PFR", "#f43f5e", true);
        this._drawUnit(ctx, w*0.9, h*0.7, "PRODUCT", "#22c55e");
    }
    _drawPath(ctx, w, h, color, flow) {
        ctx.beginPath(); ctx.moveTo(w*0.1, h*0.7); ctx.lineTo(w*0.3, h*0.8); ctx.lineTo(w*0.5, h*0.4); ctx.lineTo(w*0.7, h*0.7); ctx.lineTo(w*0.9, h*0.7);
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 4; ctx.stroke();
        const time = Date.now() * 0.002 * flow;
        ctx.setLineDash([8, 12]); ctx.lineDashOffset = -time * 20; ctx.strokeStyle = color + "88"; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]);
    }
    _drawUnit(ctx, x, y, label, color, isNode = false, glows = false) {
        if (isNode) {
            ctx.shadowBlur = glows ? 20 : 5; ctx.shadowColor = color; ctx.fillStyle = color + "33";
            ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2); ctx.fill(); ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke(); ctx.shadowBlur = 0;
        }
        ctx.fillStyle = "#94a3b8"; ctx.font = "bold 9px JetBrains Mono"; ctx.textAlign = "center"; ctx.fillText(label, x, y+25);
    }
}

/* ------------------------------------------------------------------ */
/*  EQUILIFLOW APPLICATION CORE                                         */
/* ------------------------------------------------------------------ */

class EquiliFlowApp {
    constructor() {
        this.state = this._loadLocalState() || {
            currentDomainIdx: 0, currentTierIdx: 0, sim_time: 0, capital: 154200, chellCredits: 5, isPro: false, xp: 0, role: 'Graduate Engineering Trainee',
            physics: { flow_rate:0, temp_k:0, conversion:0, entropy:0 }, assets: [], curriculum: null, activeModule: null, isAuthenticated: false, user: null, xpTarget: 1000
        };
        this.el = {
            yearDisplay: document.getElementById('current-year'), capitalDisplay: document.getElementById('capital-display'), chellCredits: document.getElementById('chell-credits'),
            chellFill: document.getElementById('chell-fill'), proBadge: document.getElementById('pro-badge'), userName: document.querySelector('.user-name'),
            userInitials: document.getElementById('user-avatar-initials'), userRole: document.getElementById('user-role'), statusChip: document.getElementById('telemetry-status'),
            statusLabel: document.getElementById('status-label'), statusPulse: document.getElementById('status-pulse'), domainList: document.getElementById('domain-list'),
            theoryGrid: document.getElementById('theory-grid'), assetTable: document.getElementById('asset-table-body'), modal: document.getElementById('tool-modal'),
            modalTitle: document.getElementById('modal-title'), modalBody: document.getElementById('modal-body'), gameTierLabel: document.getElementById('game-tier-label'),
            flowChip: document.getElementById('flow-chip'), tempChip: document.getElementById('temp-chip'), convChip: document.getElementById('conv-chip')
        };
        this.reactor = new ReactorCanvas(document.getElementById('reactor-canvas'));
        this.molecules = new MolecularEngine(document.getElementById('game-canvas'));
        this._checkAuth();
        this._initCurriculum();
        this._setupListeners();
        this._setupNexusHandlers();
        window.addEventListener('beforeunload', () => this._saveLocalState());
        this._updateProfileUI();
        lucide.createIcons();
    }

    _saveLocalState() { localStorage.setItem('equiliflow_user_state', JSON.stringify(this.state)); }
    _loadLocalState() { const d = localStorage.getItem('equiliflow_user_state'); return d ? JSON.parse(d) : null; }
    _checkAuth() { if (!this.state.isAuthenticated) { document.getElementById('auth-overlay').style.display='grid'; document.getElementById('main-app').style.display='none'; } else { this._showApp(); } }

    login(provider) {
        this.state.isAuthenticated = true;
        const name = provider === 'google' ? "Professional Engineer" : "Site Architect";
        this.state.user = { name, provider, avatar: name.split(' ').map(n=>n[0]).join('') };
        this.notify(`Auth: ${provider.toUpperCase()} Identity Verified`, 'success');
        setTimeout(() => { this._showApp(); this._saveLocalState(); }, 1000);
    }

    _showApp() { document.getElementById('auth-overlay').style.display='none'; document.getElementById('main-app').style.display='flex'; this._updateProfileUI(); this._initCurriculum(); }

    async _initCurriculum() {
        try {
            const dbRes = await fetch('/api/v1/db/state'); const dbData = await dbRes.json();
            this.state.assets = dbData.assets || []; 
            this.state.chellCredits = dbData.user?.credits !== undefined ? dbData.user.credits : 5;
            this.state.isPro = dbData.user?.is_pro || false;
            const res = await fetch('/curriculum/manifest.json'); this.state.curriculum = await res.json();
            await this._loadActiveModule(); this._renderCurriculumList(); this._renderActiveModule(); this._renderAssets(); this._updateProfileUI();
        } catch(e) { console.error(e); }
    }

    async _loadActiveModule() {
        if (!this.state.curriculum) return;
        const dom = this.state.curriculum.domains[this.state.currentDomainIdx];
        const file = dom?.files[this.state.currentTierIdx];
        if (file) { const res = await fetch(`/curriculum/${file}`); this.state.activeModule = await res.json(); }
    }

    _renderCurriculumList() {
        if (!this.el.domainList || !this.state.curriculum) return;
        this.el.domainList.innerHTML = this.state.curriculum.domains.map((dom, i) => `
            <li class="domain-item ${i === this.state.currentDomainIdx ? 'active' : ''}" onclick="window.app.selectDomain(${i})">
                <span class="domain-num">${(i+1).toString().padStart(2, '0')}</span>
                <span class="domain-name">${dom.title}</span>
            </li>
        `).join('');
    }

    async selectDomain(idx) {
        this.state.currentDomainIdx = idx; this.state.currentTierIdx = 0;
        await this._loadActiveModule(); this._renderCurriculumList(); this._renderActiveModule(); this._saveLocalState();
    }

    _renderActiveModule() {
        const mod = this.state.activeModule; if (!mod || !this.el.theoryGrid) return;
        this.molecules.tier = this.state.currentTierIdx;
        const tiers = ["CADET SIMULATION", "SYSTEMS OPERATOR", "PROCESS SENIOR", "PRINCIPAL DIGITAL TWIN"];
        if (this.el.gameTierLabel) this.el.gameTierLabel.textContent = tiers[this.state.currentTierIdx];
        this.el.theoryGrid.innerHTML = `
            <div class="theory-header"><h2 class="module-header">${mod.title}</h2><div class="module-meta">Component ${this.state.currentDomainIdx+1}.${this.state.currentTierIdx+1}</div></div>
            <div class="theory-main"><div class="formula-card"><div class="formula-display">${mod.formula}</div></div><p class="theory-text">${mod.theory}</p></div>
            <div class="variable-grid">${mod.variables.map(v=>`<div class="var-card"><span class="var-sym">${v.sym}</span><span class="var-def">${v.def}</span></div>`).join('')}</div>
            <div class="nav-controls">
                <button class="nav-pill secondary" onclick="app.prevMission()" ${this.state.currentTierIdx===0?'disabled':''}>Previous Tier</button>
                <button class="nav-pill" onclick="app.nextMission()">Next Challenge</button>
            </div>
        `;
        lucide.createIcons();
    }

    async nextMission() {
        this.state.xp += 100;
        if (this.state.xp >= this.state.xpTarget) { this.state.xp = 0; this.state.xpTarget = Math.floor(this.state.xpTarget * 1.5); this.notify("XP Resilience Increased", "warning"); }
        if (this.state.currentTierIdx < 3) this.state.currentTierIdx++;
        else if (this.state.currentDomainIdx < this.state.curriculum.domains.length - 1) { this.state.currentDomainIdx++; this.state.currentTierIdx = 0; }
        await this._loadActiveModule(); this._renderCurriculumList(); this._renderActiveModule(); this._saveLocalState(); this._updateProfileUI();
    }

    async prevMission() { if (this.state.currentTierIdx > 0) { this.state.currentTierIdx--; await this._loadActiveModule(); this._renderActiveModule(); this._saveLocalState(); } }

    _renderAssets() {
        const tbody = this.el.assetTable; if (!tbody || !this.state.assets) return;
        tbody.innerHTML = this.state.assets.map(a => `
            <tr>
                <td><div class="asset-id-cell">${a.id}<span class="sigma-tag">4-σ</span></div></td>
                <td>${a.type}</td><td>Tier ${a.tier}</td>
                <td><div class="durability-bar-wrap"><div class="durability-bar"><div class="durability-fill ${a.durability<30?'danger':''}" style="width:${a.durability}%"></div></div><span>${a.durability}%</span></div></td>
                <td>${Math.floor(a.efficiency*100)}%</td><td>$${a.maintenance_cost}</td>
                <td><div class="action-cell"><button class="table-btn" onclick="app.repairAsset('${a.id}')">Repair</button></div></td>
            </tr>`).join('');
        lucide.createIcons();
    }

    async repairAsset(id) { this.notify(`Asset ${id} Re-stabilized`, 'success'); }

    _updateProfileUI() {
        if (this.state.user) { this.el.userName.textContent = this.state.user.name; this.el.userInitials.textContent = this.state.user.avatar; }
        const count = this.state.isPro ? '∞' : this.state.chellCredits;
        if (this.el.chellCredits) this.el.chellCredits.textContent = `${count} / 5`;
        if (this.el.chellFill) this.el.chellFill.style.width = this.state.isPro ? '100%' : `${(this.state.chellCredits/5)*100}%`;
        const year = Math.floor(this.state.xp / this.state.xpTarget) + 1;
        if (this.el.yearDisplay) this.el.yearDisplay.textContent = isNaN(year) ? 1 : year;
        if (this.el.proBadge) this.el.proBadge.textContent = this.state.isPro ? 'PRO' : 'FREE';
        this.reactor.setPhysics(this.state.physics);
    }

    _setupListeners() {
        document.getElementById('spawn-mol').onclick = () => { for(let i=0;i<5;i++) this.molecules.spawn(); };
        document.getElementById('heat-box').onclick = () => this.molecules.heat();
        document.getElementById('cool-box').onclick = () => this.molecules.cool();
    }

    _setupNexusHandlers() {
        const h = { 'btn-portfolio': ()=>this.notify('Portfolio Export Active','info'), 'btn-cv-extractor': ()=>this.notify('CV IQ Active','info'), 'btn-ppt-gen': ()=>this.notify('PPT Export active','info') };
        Object.entries(h).forEach(([id, f]) => { const el = document.getElementById(id); if (el) el.onclick = f; });
    }

    openUpgradeModal() {
        this.openModal('CHELL PRO — ACCESS TERMINAL', `<div class="payment-terminal liquid-glass"><div class="terminal-header"><span>SECURE AUTH V1.0.6</span></div><div class="terminal-display"><div class="terminal-row"><span>PRODUCT:</span> <span>CHELL PRO</span></div><div class="terminal-row"><span>FEE:</span> <span>$29.99/yr</span></div></div><input type="text" placeholder="CARD NUMBER" class="liquid-input"><button class="auth-btn" style="width:100%" onclick="app.upgradePro()">AUTHORIZE</button></div>`);
    }

    upgradePro() { this.state.isPro = true; this.state.chellCredits = '∞'; this._updateProfileUI(); this.notify('CHELL PRO ACTIVATED', 'success'); this.closeModal(); }

    openModal(title, body) { this.el.modalTitle.textContent = title; this.el.modalBody.innerHTML = body; this.el.modal.classList.add('active'); lucide.createIcons(); }
    closeModal() { this.el.modal.classList.remove('active'); }
    notify(msg, type='info') { const n = document.createElement('div'); n.className=`notif ${type}`; n.textContent=msg; document.getElementById('notif-area').appendChild(n); setTimeout(()=>n.remove(), 3000); }
}

window.onload = () => { window.app = new EquiliFlowApp(); };
