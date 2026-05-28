/**
 * EquiliFlow League — Premium Frontend Engine
 * WebSocket-driven reactor visualization + curriculum engine.
 */

/* ------------------------------------------------------------------ */
/*  ADVANCED MOLECULAR PHYSICS ENGINE (Verlet Integration)              */
/* ------------------------------------------------------------------ */

class MolecularEngine {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.particles = [];
        this.temp = 1.0;
        this.entropy = 0;
        this.tier = 0; // Cadet
        this.bounds = { w: 0, h: 0 };
        this.raf = null;

        this._resize();
        window.addEventListener('resize', () => this._resize());
        this._loop();
    }

    _resize() {
        if (!this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        // Prevent height explosion
        const h = Math.min(rect.height, 800);
        this.canvas.width = rect.width;
        this.canvas.height = h;
        this.bounds = { w: rect.width, h: h };
    }

    spawn(x, y) {
        const p = {
            x: x || Math.random() * this.bounds.w,
            y: y || Math.random() * this.bounds.h,
            oldX: (x || Math.random() * this.bounds.w) - (Math.random() - 0.5) * 5,
            oldY: (y || Math.random() * this.bounds.h) - (Math.random() - 0.5) * 5,
            r: 4 + Math.random() * 6,
            color: this._getTierColor(),
            mass: 1.0
        };
        this.particles.push(p);
    }

    _getTierColor() {
        const colors = [
            ['#00c4cc', '#00c07a'], // L1: Cyan/Green
            ['#00c07a', '#4a9eff'], // L2: Green/Blue
            ['#e89b1a', '#e8384a'], // L3: Amber/Red
            ['#f0f0f0', '#7c5cfc']  // L4: White/Purple
        ];
        const pair = colors[this.tier] || colors[0];
        return Math.random() > 0.5 ? pair[0] : pair[1];
    }

    heat() { this.temp = Math.min(this.temp + 0.5, 10.0); }
    cool() { this.temp = Math.max(this.temp - 0.5, 0.1); }

    _update() {
        const friction = 0.99;
        const gravity = 0.1;

        for (let p of this.particles) {
            let vx = (p.x - p.oldX) * friction;
            let vy = (p.y - p.oldY) * friction;

            p.oldX = p.x;
            p.oldY = p.y;

            p.x += vx + (Math.random() - 0.5) * this.temp * 0.2;
            p.y += vy + (Math.random() - 0.5) * this.temp * 0.2 + gravity;

            // Boundaries
            if (p.x > this.bounds.w - p.r) { p.x = this.bounds.w - p.r; p.oldX = p.x + vx; }
            if (p.x < p.r) { p.x = p.r; p.oldX = p.x + vx; }
            if (p.y > this.bounds.h - p.r) { p.y = this.bounds.h - p.r; p.oldY = p.y + vy; }
            if (p.y < p.r) { p.y = p.r; p.oldY = p.y + vy; }
        }

        // Collisions
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = p1.r + p2.r;

                if (dist < minDist) {
                    const angle = Math.atan2(dy, dx);
                    const tx = p1.x + Math.cos(angle) * minDist;
                    const ty = p1.y + Math.sin(angle) * minDist;
                    const ax = (tx - p2.x) * 0.5;
                    const ay = (ty - p2.y) * 0.5;
                    p1.x -= ax; p1.y -= ay;
                    p2.x += ax; p2.y += ay;
                    this.entropy += 0.01 * this.temp;
                }
            }
        }
    }

    _draw() {
        this.ctx.clearRect(0, 0, this.bounds.w, this.bounds.h);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.bounds.w; i += 50) {
            this.ctx.beginPath(); this.ctx.moveTo(i, 0); this.ctx.lineTo(i, this.bounds.h); this.ctx.stroke();
        }
        for (let i = 0; i < this.bounds.h; i += 50) {
            this.ctx.beginPath(); this.ctx.moveTo(0, i); this.ctx.lineTo(this.bounds.w, i); this.ctx.stroke();
        }

        let totalKe = 0;
        for (let p of this.particles) {
            const vx = p.x - p.oldX;
            const vy = p.y - p.oldY;
            const speed = Math.sqrt(vx*vx + vy*vy);
            totalKe += 0.5 * p.mass * (vx * vx + vy * vy);

            const grd = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.5);
            grd.addColorStop(0, p.color + 'ff');
            grd.addColorStop(0.4, p.color + '66');
            grd.addColorStop(1, p.color + '00');
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = grd;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            
            // Tier-based glow
            if (this.tier >= 2) {
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = p.color;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0; 
        }

        // Update UI counters
        const kinEEl = document.getElementById('kin-e');
        const entropyEl = document.getElementById('entropy-val');
        if (kinEEl) kinEEl.textContent = totalKe.toFixed(2);
        if (entropyEl) entropyEl.textContent = (this.entropy * 0.1).toFixed(2);
    }

    _loop() {
        this._update();
        this._draw();
        this.raf = requestAnimationFrame(() => this._loop());
    }
}

/* ------------------------------------------------------------------ */
/*  REACTOR CANVAS RENDERER                                             */
/* ------------------------------------------------------------------ */

class ReactorCanvas {
    constructor(canvasEl) {
        this.canvas = canvasEl;
        this.ctx = canvasEl.getContext('2d');
        this.physics = { flow_rate: 50, temp_k: 350, pressure_pa: 101325, conversion: 0.75, rate_const: 0.001, pump_power: 50 };
        this.particles = [];
        this.raf = null;
        this.t = 0;
        
        // Interaction State
        this.mouse = { x: 0, y: 0, down: false, hoveredNode: null, draggedNode: null };
        this.shockwaves = []; // Visual feedback for clicks/interaction

        this._resize();
        this._spawnParticles(80);

        this._setupInteraction();
        window.addEventListener('resize', () => this._resize());
        this._loop();
    }

    _setupInteraction() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
            this._checkHover();
            this._handleDrag();
        });

        this.canvas.addEventListener('mousedown', () => {
            this.mouse.down = true;
            if (this.mouse.hoveredNode) {
                this.mouse.draggedNode = this.mouse.hoveredNode;
                this._createShockwave(this.mouse.x, this.mouse.y);
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
            this.mouse.draggedNode = null;
        });
    }

    _checkHover() {
        this.mouse.hoveredNode = null;
        Object.entries(this.layout).forEach(([id, node]) => {
            const dist = Math.hypot(this.mouse.x - node.x, this.mouse.y - node.y);
            if (dist < 30) this.mouse.hoveredNode = id;
        });
        this.canvas.style.cursor = this.mouse.hoveredNode ? 'grab' : 'default';
        if (this.mouse.draggedNode) this.canvas.style.cursor = 'grabbing';
    }

    _handleDrag() {
        if (this.mouse.draggedNode && this.mouse.down) {
            const node = this.layout[this.mouse.draggedNode];
            node.x += (this.mouse.x - node.x) * 0.4;
            node.y += (this.mouse.y - node.y) * 0.4;
            // Ripple particles toward drag
            this.particles.forEach(p => {
                const d = Math.hypot(p.curX - node.x, p.curY - node.y);
                if (d < 100) {
                    p.t += 0.01; // nudge
                }
            });
        }
    }

    _createShockwave(x, y) {
        this.shockwaves.push({ x, y, r: 0, opacity: 1 });
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width  = rect.width  || 600;
        this.canvas.height = rect.height || 380;
        this.W = this.canvas.width;
        this.H = this.canvas.height;
        this._buildLayout();
    }

    _buildLayout() {
        const W = this.W, H = this.H;
        const pad = 32;
        // P&ID node positions (relative to canvas)
        this.layout = {
            feed:   { x: pad,          y: H * 0.5,  label: 'FEED' },
            pump:   { x: W * 0.22,     y: H * 0.5,  label: 'P-101' },
            hx:     { x: W * 0.42,     y: H * 0.35, label: 'HX-101' },
            cstr:   { x: W * 0.60,     y: H * 0.5,  label: 'CSTR' },
            pfr:    { x: W * 0.80,     y: H * 0.5,  label: 'PFR' },
            product:{ x: W - pad,      y: H * 0.5,  label: 'PRODUCT' },
            // recycle line
            waste:  { x: W * 0.70,     y: H * 0.82, label: 'WASTE' },
        };
        // Pipe segments: [{from, to, color}]
        this.pipes = [
            { path: ['feed','pump'], color: '#38bdf8' },
            { path: ['pump','hx'],   color: '#38bdf8' },
            { path: ['hx','cstr'],   color: '#fbbf24' },   // hot line
            { path: ['cstr','pfr'],  color: '#f472b6' },
            { path: ['pfr','product'],color:'#34d399' },
            { path: ['cstr','waste'],color: '#f87171' },    // waste stream
        ];
        this._spawnParticles(60);
    }

    _spawnParticles(n) {
        this.particles = [];
        const paths = [
            ['feed','pump','hx','cstr','pfr','product'],
            ['cstr','waste'],
        ];
        for (let i = 0; i < n; i++) {
            const pathIdx = Math.random() < 0.85 ? 0 : 1;
            const path = paths[pathIdx];
            this.particles.push({
                pathIdx,
                path,
                t: Math.random(),
                speed: 0.003 + Math.random() * 0.004,
                r: 2 + Math.random() * 2,
                alpha: 0.5 + Math.random() * 0.5,
            });
        }
    }

    setPhysics(data) {
        this.physics = { ...this.physics, ...data };
        // Adjust particle speed by flow rate
        const speedFactor = this.physics.flow_rate / 50.0;
        this.particles.forEach(p => {
            p.speed = (0.003 + Math.random() * 0.004) * speedFactor;
        });
    }

    _getNodePos(name) {
        return this.layout[name] || { x: 0, y: 0 };
    }

    _getParticlePos(p) {
        const nodes = p.path;
        const segCount = nodes.length - 1;
        const progress = p.t * segCount;
        const segIdx = Math.min(Math.floor(progress), segCount - 1);
        const frac = progress - segIdx;
        const a = this._getNodePos(nodes[segIdx]);
        const b = this._getNodePos(nodes[segIdx + 1]);
        return {
            x: a.x + (b.x - a.x) * frac,
            y: a.y + (b.y - a.y) * frac,
            segIdx,
        };
    }

    _particleColor(p) {
        // Color by segment / path
        if (p.pathIdx === 1) return '#f87171'; // waste
        const segColors = ['#38bdf8','#38bdf8','#fbbf24','#f472b6','#34d399'];
        return segColors[Math.min(p.segIdx || 0, segColors.length - 1)];
    }

    _drawPipes(ctx) {
        this.pipes.forEach(pipe => {
            const pts = pipe.path.map(n => this._getNodePos(n));
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                ctx.lineTo(pts[i].x, pts[i].y);
            }
            ctx.strokeStyle = pipe.color + '44';
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.stroke();
            // Bright centerline
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.strokeStyle = pipe.color + '22';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    _drawNode(ctx, node, type) {
        const { x, y } = node;
        const phys = this.physics;

        ctx.save();
        ctx.translate(x, y);

        if (type === 'pump') {
            // Circle pump
            const r = 22;
            const grd = ctx.createRadialGradient(0, 0, 2, 0, 0, r);
            grd.addColorStop(0, 'rgba(0,196,204,0.5)');
            grd.addColorStop(1, 'rgba(0,196,204,0.05)');
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.strokeStyle = '#38bdf8aa';
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
            // Impeller blades
            for (let i = 0; i < 4; i++) {
                ctx.save();
                ctx.rotate(this.t * 2 + i * Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -14);
                ctx.strokeStyle = '#38bdf8cc';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        } else if (type === 'hx') {
            // Heat exchanger rectangle
            const w = 34, h = 24;
            const tempNorm = (phys.temp_k - 330) / 40;
            const hot = `rgba(${Math.round(251 + tempNorm * 4)},${Math.round(191 - tempNorm * 80)},36,0.7)`;
            ctx.beginPath();
            ctx.roundRect(-w/2, -h/2, w, h, 4);
            ctx.fillStyle = `rgba(251,191,36,0.12)`;
            ctx.strokeStyle = hot;
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
            // zig-zag heat lines
            ctx.beginPath();
            for (let i = -10; i <= 10; i += 5) {
                ctx.moveTo(i, -8);
                ctx.lineTo(i + 2.5, 0);
                ctx.lineTo(i, 8);
            }
            ctx.strokeStyle = hot + 'aa';
            ctx.lineWidth = 1;
            ctx.stroke();
        } else if (type === 'cstr') {
            // CSTR vessel — tall cylinder
            const convNorm = phys.conversion;
            const w = 38, h = 52;
            ctx.beginPath();
            ctx.roundRect(-w/2, -h/2, w, h, [4,4,8,8]);
            ctx.fillStyle = `rgba(244,114,182,0.10)`;
            ctx.strokeStyle = `rgba(244,114,182,0.7)`;
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
            // Liquid level
            const liquidH = h * convNorm;
            ctx.beginPath();
            ctx.roundRect(-w/2 + 2, h/2 - liquidH - 2, w - 4, liquidH, [0,0,6,6]);
            ctx.fillStyle = `rgba(244,114,182,0.25)`;
            ctx.fill();
            // Stirrer shaft
            ctx.beginPath();
            ctx.moveTo(0, -h/2 + 2);
            ctx.lineTo(0, h/2 - 10);
            ctx.strokeStyle = '#f472b6bb';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Stirrer blades (rotating)
            ctx.save();
            ctx.translate(0, 8);
            ctx.rotate(this.t * 3);
            [-12, 12].forEach(dx => {
                ctx.beginPath();
                ctx.moveTo(0, 0); ctx.lineTo(dx, 4);
                ctx.strokeStyle = '#f472b6cc';
                ctx.lineWidth = 2;
                ctx.stroke();
            });
            ctx.restore();
        } else if (type === 'pfr') {
            // PFR — horizontal tube
            const w = 44, h = 18;
            ctx.beginPath();
            ctx.roundRect(-w/2, -h/2, w, h, 9);
            ctx.fillStyle = `rgba(52,211,153,0.08)`;
            ctx.strokeStyle = `rgba(52,211,153,0.7)`;
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
            // Gradient fill to show conversion
            const grd = ctx.createLinearGradient(-w/2, 0, w/2, 0);
            grd.addColorStop(0, 'rgba(52,211,153,0.05)');
            grd.addColorStop(phys.conversion, 'rgba(52,211,153,0.35)');
            grd.addColorStop(1, 'rgba(52,211,153,0.05)');
            ctx.beginPath();
            ctx.roundRect(-w/2 + 2, -h/2 + 2, w - 4, h - 4, 7);
            ctx.fillStyle = grd;
            ctx.fill();
        } else if (type === 'feed' || type === 'product') {
            // Endpoint circles
            const color = type === 'feed' ? '#38bdf8' : '#34d399';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = color + '22';
            ctx.strokeStyle = color + '88';
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
        } else if (type === 'waste') {
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, Math.PI * 2);
            ctx.fillStyle = '#f8717122';
            ctx.strokeStyle = '#f8717188';
            ctx.lineWidth = 1.5;
            ctx.fill(); ctx.stroke();
        }

        // Label
        ctx.restore();
        ctx.font = '500 9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, x, y + (type === 'cstr' ? 40 : type === 'pfr' ? 20 : 22));
    }

    _drawDataOverlay(ctx) {
        const { flow_rate, temp_k, conversion, pressure_pa, pump_power } = this.physics;
        const px = this.layout.cstr;
        const ox = px.x - 50, oy = 12;
        const lines = [
            { label: 'T', val: `${temp_k.toFixed(1)} K`, color: '#fbbf24' },
            { label: 'Q', val: `${flow_rate.toFixed(1)} m³/h`, color: '#38bdf8' },
            { label: 'X', val: `${(conversion * 100).toFixed(1)}%`, color: '#f472b6' },
            { label: 'P', val: `${(pressure_pa / 1000).toFixed(1)} kPa`, color: '#a78bfa' },
        ];

        ctx.save();
        lines.forEach((l, i) => {
            ctx.font = '600 9.5px "JetBrains Mono", monospace';
            ctx.fillStyle = l.color + 'bb';
            ctx.textAlign = 'left';
            ctx.fillText(`${l.label}: ${l.val}`, ox + i * 90, oy + 14);
        });
        ctx.restore();
    }

    _loop() {
        this.raf = requestAnimationFrame(() => this._loop());
        this.t += 0.016;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.W, this.H);

        // Draw pipes
        this._drawPipes(ctx);

        // Draw nodes
        const nodeTypes = { feed:'feed', pump:'pump', hx:'hx', cstr:'cstr', pfr:'pfr', product:'product', waste:'waste' };
        Object.entries(this.layout).forEach(([key, node]) => {
            this._drawNode(ctx, node, key);
        });

        // Draw Shockwaves
        this.shockwaves = this.shockwaves.filter(s => {
            s.r += 4;
            s.opacity -= 0.02;
            if (s.opacity <= 0) return false;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(167, 139, 250, ${s.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            return true;
        });

        // Draw node hover effects
        if (this.mouse.hoveredNode) {
            const n = this.layout[this.mouse.hoveredNode];
            ctx.beginPath();
            ctx.arc(n.x, n.y, 40, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(167, 139, 250, 0.05)';
            ctx.fill();
        }

        // Draw particles with dragging trails
        this.particles.forEach(p => {
            p.t += p.speed;
            if (p.t >= 1) p.t = 0;
            const pos = this._getParticlePos(p);
            p.curX = pos.x; p.curY = pos.y; // track current pos
            p.segIdx = pos.segIdx;
            const color = this._particleColor(p);
            
            // Hover repulsion
            const md = Math.hypot(pos.x - this.mouse.x, pos.y - this.mouse.y);
            let drawX = pos.x;
            let drawY = pos.y;
            if (md < 60) {
                const angle = Math.atan2(pos.y - this.mouse.y, pos.x - this.mouse.x);
                drawX += Math.cos(angle) * (60 - md) * 0.5;
                drawY += Math.sin(angle) * (60 - md) * 0.5;
            }

            const grd = ctx.createRadialGradient(drawX, drawY, 0, drawX, drawY, p.r * 3);
            grd.addColorStop(0, color + 'ee');
            grd.addColorStop(1, color + '00');
            ctx.beginPath();
            ctx.arc(drawX, drawY, p.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
        });

        // Data overlay
        this._drawDataOverlay(ctx);
    }

    destroy() {
        cancelAnimationFrame(this.raf);
    }
}

/* ------------------------------------------------------------------ */
/*  MAIN APPLICATION CLASS                                              */
/* ------------------------------------------------------------------ */

class EquiliFlowApp {
    constructor() {
        this.state = this._loadLocalState() || {
            currentDomainIdx: 0,
            currentTierIdx: 0,
            currentMissionIdx: 0,
            sim_time: 0,
            capital: 154200,
            chellCredits: 5,
            isPro: false,
             xp: 0,
             role: 'Junior Process Engineer',
             physics: {
                 flow_rate: 0, temp_k: 0, conversion: 0, pressure_bar: 0, 
                 pump_power: 0, ai_loss: 0, entropy: 0, kinetic_e: 0
             },
             assets: [],
             curriculum: null, 
             activeModule: null,
             isAuthenticated: false,
             user: null,
             xpTarget: 1000 
         };

        this.el = {
            yearDisplay:    document.getElementById('current-year'),
            capitalDisplay: document.getElementById('capital-display'),
            chellCredits:   document.getElementById('chell-credits'),
            chellFill:      document.getElementById('chell-fill'),
            proBadge:       document.getElementById('pro-badge'),
            userName:       document.querySelector('.user-name'),
            userInitials:   document.getElementById('user-avatar-initials'),
            userRole:       document.getElementById('user-role'),
            statusChip:     document.getElementById('telemetry-status'),
            statusLabel:    document.getElementById('status-label'),
            statusPulse:    document.getElementById('status-pulse'),
            wsHz:           document.getElementById('ws-hz'),
            notifArea:      document.getElementById('notif-area'),
            resetBtn:       document.getElementById('reset-btn'),
            domainList:     document.getElementById('domain-list'),
            theoryGrid:     document.getElementById('theory-grid'),
            assetTable:     document.getElementById('asset-table-body'),
            modal:          document.getElementById('tool-modal'),
            modalTitle:     document.getElementById('modal-title'),
            modalBody:      document.getElementById('modal-body'),
            flowChip:       document.getElementById('flow-chip'),
            tempChip:       document.getElementById('temp-chip'),
            convChip:       document.getElementById('conv-chip'),
            gameTierLabel:  document.getElementById('game-tier-label'),
        };

        // Reactor & Physics canvases
        this.reactor = new ReactorCanvas(document.getElementById('reactor-canvas'));
        this.molecules = new MolecularEngine(document.getElementById('game-canvas'));

        // Auth initialization
        this.token = localStorage.getItem('equiliflow_token') || null;
        const savedUser = localStorage.getItem('equiliflow_user');
        if (this.token && savedUser) {
            this.state.isAuthenticated = true;
            this.state.user = JSON.parse(savedUser);
        } else {
            this.state.isAuthenticated = false;
            this.state.user = null;
        }
        this._checkAuth();

        // WebSocket
        this._wsFrameCount = 0;
        this._wsLastSecond = Date.now();
        this._initWebSocket();

        this._setupListeners();
        this._setupNexusHandlers();
        window.addEventListener('beforeunload', () => this._saveLocalState());
        
        // Final Init Sequence (Async)
        this._initCurriculum();
        lucide.createIcons();
    }

    _saveLocalState() {
        localStorage.setItem('equiliflow_user_state', JSON.stringify(this.state));
    }

    _loadLocalState() {
        const d = localStorage.getItem('equiliflow_user_state');
        return d ? JSON.parse(d) : null;
    }

    _checkAuth() {
        if (!this.state.isAuthenticated) {
            document.getElementById('auth-overlay').style.display = 'grid';
            document.getElementById('main-app').style.display = 'none';
        } else {
            this._showApp();
        }
    }

    async _apiFetch(url, options = {}) {
        options.headers = options.headers || {};
        if (this.token) {
            options.headers['X-User-Token'] = this.token;
        }
        return fetch(url, options);
    }

    switchAuthTab(tab) {
        const formLogin = document.getElementById('form-login');
        const formRegister = document.getElementById('form-register');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');
        
        if (tab === 'login') {
            formLogin.style.display = 'block';
            formRegister.style.display = 'none';
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
        } else {
            formLogin.style.display = 'none';
            formRegister.style.display = 'block';
            tabLogin.classList.remove('active');
            tabRegister.classList.add('active');
        }
    }

    async handleAuthSubmit(event, action) {
        event.preventDefault();
        
        if (action === 'login') {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const response = await fetch('/api/v1/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.token = data.token;
                    this.state.isAuthenticated = true;
                    this.state.user = {
                        name: data.name,
                        avatar: data.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    };
                    
                    localStorage.setItem('equiliflow_token', this.token);
                    localStorage.setItem('equiliflow_user', JSON.stringify(this.state.user));
                    this._saveLocalState();
                    
                    this.notify('Authentication Successful: Session Initialized', 'success');
                    
                    // Reset existing websocket if active
                    if (this._ws) {
                        this._ws.close();
                    }
                    
                    this._showApp();
                    this._initWebSocket();
                } else {
                    this.notify(data.message || 'Authentication Failed', 'error');
                }
            } catch (err) {
                console.error(err);
                this.notify('Server connection error', 'error');
            }
        } else if (action === 'register') {
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            
            try {
                const response = await fetch('/api/v1/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, username, password })
                });
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.notify('Registration Successful. Please Login.', 'success');
                    this.switchAuthTab('login');
                    document.getElementById('login-username').value = username;
                    document.getElementById('login-password').value = '';
                } else {
                    this.notify(data.message || 'Registration Failed', 'error');
                }
            } catch (err) {
                console.error(err);
                this.notify('Server connection error', 'error');
            }
        }
    }

    logout() {
        this.token = null;
        this.state.isAuthenticated = false;
        this.state.user = null;
        localStorage.removeItem('equiliflow_token');
        localStorage.removeItem('equiliflow_user');
        this._saveLocalState();
        this.notify('Session Terminated', 'info');
        
        if (this._ws) {
            this._ws.close();
        }
        
        document.getElementById('auth-overlay').style.display = 'grid';
        document.getElementById('main-app').style.display = 'none';
    }

    openUpgradeModal() {
        this.openModal('ENTERPRISE LICENSE UPGRADE', `
            <div class="payment-terminal liquid-glass">
                <div class="terminal-header">
                    <i data-lucide="shield-check" class="terminal-icon"></i>
                    <span>SECURE ENCRYPTED TRANSACTION</span>
                </div>
                <div class="terminal-display">
                    <div class="terminal-row"><span>PRODUCT:</span> <span>PROFESSIONAL LICENSE</span></div>
                    <div class="terminal-row"><span>PRICE:</span> <span>$299.00 / YEAR</span></div>
                    <div class="terminal-row"><span>LIMIT:</span> <span>UNLIMITED ASSET MODES</span></div>
                </div>
                <div class="terminal-input">
                    <input type="text" placeholder="XXXX-XXXX-XXXX-XXXX" class="liquid-input">
                    <div style="display:flex; gap:12px;">
                        <input type="text" placeholder="MM/YY" class="liquid-input" style="width:80px;">
                        <input type="text" placeholder="CVV" class="liquid-input" style="width:60px;">
                    </div>
                </div>
                <button class="auth-btn" style="width:100%;" onclick="app.processPayment()">
                    ACTIVATE LICENSE
                </button>
            </div>
        `);
        lucide.createIcons();
    }

    async processPayment() {
        try {
            const res = await this._apiFetch('/api/v1/user/upgrade', { method: 'POST' });
            const d = await res.json();
            if (d.status === 'success') {
                this.notify("Authorization Successful: Professional License Activated.", "success");
                this.state.isPro = true;
                this.state.chellCredits = "∞";
                this.closeModal();
                this._updateProfileUI();
                this._saveLocalState();
            } else {
                this.notify("Authorization Failed.", "error");
            }
        } catch {
            this.notify("Connection error during authorization.", "error");
        }
    }

    _showApp() {
        document.getElementById('auth-overlay').style.display = 'none';
        const mainApp = document.getElementById('main-app');
        mainApp.style.display = 'flex';
        // On mobile, allow scrolling
        if (window.innerWidth <= 900) {
            mainApp.style.flexDirection = 'column';
            mainApp.style.height = 'auto';
            mainApp.style.minHeight = '100dvh';
        }
        this._updateProfileUI();
        this._initCurriculum();
    }

    _updateProfileUI() {
        if (this.el.userName && this.state.user) {
            this.el.userName.textContent = this.state.user.name;
        }
        if (this.el.userInitials && this.state.user) {
            this.el.userInitials.textContent = this.state.user.avatar || 'EF';
        }
        
        if (this.el.chellCredits) {
            const count = this.state.chellCredits === '∞' ? '∞' : this.state.chellCredits;
            this.el.chellCredits.textContent = `${count} / 5`;
        }
        if (this.el.chellFill) {
            const w = this.state.chellCredits === '∞' ? 100 : (Number(this.state.chellCredits) / 5) * 100;
            this.el.chellFill.style.width = `${Math.max(0, w)}%`;
        }
        if (this.el.proBadge) {
            this.el.proBadge.style.display = this.state.isPro ? 'block' : 'none';
        }
        if (this.el.userRole) this.el.userRole.textContent = this.state.role || 'Junior Process Engineer';
        if (this.el.yearDisplay) this.el.yearDisplay.textContent = Math.floor(this.state.xp / 1000) + 1;
    }

    /* ----------------  WEBSOCKET  -------------------- */

    _initWebSocket() {
        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        const tokenParam = this.token ? `?token=${encodeURIComponent(this.token)}` : '';
        const url = `${proto}://${location.host}/ws/reactor${tokenParam}`;
        try {
            this._ws = new WebSocket(url);
            this._ws.onopen    = () => this._onWsOpen();
            this._ws.onmessage = (e) => this._onWsMessage(e);
            this._ws.onclose   = () => this._onWsClose();
            this._ws.onerror   = () => this._onWsClose();
        } catch (err) {
            this._startHttpPoll();
        }
    }

    _onWsOpen() {
        this._setOnline(true);
        this.notify('Telemetry Stream Established: 2 Hz real-time physics active', 'success');
        clearInterval(this._httpPollTimer);
    }

    _onWsMessage(e) {
        const data = JSON.parse(e.data);
        this._applyPhysics(data);

        // Hz counter
        this._wsFrameCount++;
        const now = Date.now();
        if (now - this._wsLastSecond >= 1000) {
            if (this.el.wsHz) this.el.wsHz.textContent = `${this._wsFrameCount} Hz`;
            this._wsFrameCount = 0;
            this._wsLastSecond = now;
        }
    }

    _onWsClose() {
        this._setOnline(false);
        if (this.el.wsHz) this.el.wsHz.textContent = '– Hz';
        // Fall back to HTTP polling
        this._startHttpPoll();
    }

    _startHttpPoll() {
        if (this._httpPollTimer) return;
        this._httpPollTimer = setInterval(() => this._httpPoll(), 3000);
        this._httpPoll();
    }

    async _httpPoll() {
        try {
            const res = await this._apiFetch('/api/v1/status');
            if (res.ok) {
                const data = await res.json();
                this._applyPhysics({ ...data, ...(data.ai_status || {}) });
                this._setOnline(true);
                if (data.assets) {
                    Object.entries(data.assets).forEach(([id, a]) => {
                        if (this.state.assets[id]) Object.assign(this.state.assets[id], a);
                    });
                    this._renderAssets();
                }
            }
        } catch { this._setOnline(false); }
    }

    _applyPhysics(data) {
        // Merge into state
        Object.assign(this.state.physics, data);
        if (data.capital !== undefined) this.state.capital = data.capital;
        if (data.year    !== undefined) this.state.year    = data.year;
        if (data.assets  !== undefined) {
            this.state.assets = data.assets;
            this._renderAssets();
        }

        this._updateHeader();
        this._updateStatusChips(data);
        this.reactor.setPhysics(data);
        this._renderTelemetry();

        // Sync control slider UI (only when user isn't dragging)
        if (data.physics) {
            const sliderFlow = document.getElementById('slider-flow');
            const sliderTemp = document.getElementById('slider-temp');
            const valFlow = document.getElementById('ctrl-flow-val');
            const valTemp = document.getElementById('ctrl-temp-val');
            
            if (sliderFlow && document.activeElement !== sliderFlow && data.physics.flow_rate !== undefined) {
                sliderFlow.value = data.physics.flow_rate;
            }
            if (sliderTemp && document.activeElement !== sliderTemp && data.physics.temp_k !== undefined) {
                sliderTemp.value = data.physics.temp_k;
            }
            if (valFlow && data.physics.flow_rate !== undefined) {
                valFlow.textContent = data.physics.flow_rate.toFixed(1);
            }
            if (valTemp && data.physics.temp_k !== undefined) {
                valTemp.textContent = data.physics.temp_k.toFixed(0);
            }
        }
    }

    _updateStatusChips(d) {
        if (d.flow_rate !== undefined && this.el.flowChip)
            this.el.flowChip.textContent = `Flow: ${d.flow_rate.toFixed(1)} m³/h`;
        if (d.temp_k !== undefined && this.el.tempChip)
            this.el.tempChip.textContent = `Temp: ${d.temp_k.toFixed(0)} K`;
        if (d.conversion !== undefined && this.el.convChip)
            this.el.convChip.textContent = `Conv: ${(d.conversion * 100).toFixed(1)}%`;
    }

    /* -----------------  ONLINE STATE  -----------------  */

    _setOnline(online) {
        this.state.online = online;
        const chip  = this.el.statusChip;
        const label = this.el.statusLabel;
        const pulse = this.el.statusPulse;
        if (!chip) return;
        if (online) {
            chip.classList.add('online');
            if (label) label.textContent = 'Live';
            if (pulse) pulse.classList.add('online');
        } else {
            chip.classList.remove('online');
            if (label) label.textContent = 'Offline';
            if (pulse) pulse.classList.remove('online');
        }
    }

    _updateHeader() {
        if (this.el.yearDisplay)    this.el.yearDisplay.textContent    = this.state.year;
        if (this.el.capitalDisplay) this.el.capitalDisplay.textContent =
            `$${this.state.capital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    /* -----------------  PHASE SWITCHING  --------------- */

    /* ----------------  CURRICULUM ENGINE  -------------------- */

    async _initCurriculum() {
        try {
            // Initial Data Fetch
            const dbRes = await this._apiFetch('/api/v1/db/state');
            const dbData = await dbRes.json();
            
            // Sync with persistent backend
            this.state.assets = dbData.assets || [];
            this.state.chellCredits = dbData.user?.credits !== undefined ? dbData.user.credits : 5;
            this.state.isPro = dbData.user?.is_pro || false;
            
            const res = await fetch('/curriculum/manifest.json');
            this.state.curriculum = await res.json();
            
            await this._loadActiveModule();
            this._renderCurriculumList();
            this._renderActiveModule();
            this._renderAssets(); 
            this._updateProfileUI(); // Ensure UI re-hydrated after fetch
        } catch (e) {
            console.error("Critical: CHELL Sync Failure", e);
            this.notify("System Offline: Site Data Correlation Error", "error");
        }
    }

    async _loadActiveModule() {
        if (!this.state.curriculum) return;
        const dom = this.state.curriculum.domains[this.state.currentDomainIdx];
        if (!dom) return;
        const file = dom.files[this.state.currentTierIdx];
        if (!file) return;
        const res = await fetch(`/curriculum/${file}`);
        this.state.activeModule = await res.json();
    }

    _renderCurriculumList() {
        if (!this.el.domainList || !this.state.curriculum) return;
        const list = this.state.curriculum.domains;
        if (!list) return;

        this.el.domainList.innerHTML = list.map((dom, i) => `
            <li class="domain-item ${i === this.state.currentDomainIdx ? 'active' : ''}" 
                onclick="window.app.selectDomain(${i})">
                <span class="domain-num">${(i+1).toString().padStart(2, '0')}</span>
                <span class="domain-name">${dom.title}</span>
            </li>
        `).join('');
    }

    async selectDomain(idx) {
        this.state.currentDomainIdx = idx;
        this.state.currentTierIdx = 0;
        await this._loadActiveModule();
        this._renderCurriculumList();
        this._renderActiveModule();
        this._saveLocalState();
    }

    _renderActiveModule() {
        const mod = this.state.activeModule;
        const panel = this.el.theoryGrid;
        if (!panel || !mod) return;

        // Update Game Tier Graphics
        this.molecules.tier = this.state.currentTierIdx;
        const tierNames = ["LEVEL 1: ACADEMIC FOUNDATION", "LEVEL 2: HYDRODYNAMICS", "LEVEL 3: REACTOR KINETICS", "LEVEL 4: PROCESS TWIN"];
        if (this.el.gameTierLabel) this.el.gameTierLabel.textContent = tierNames[this.state.currentTierIdx];

        panel.innerHTML = `
            <div class="theory-header">
                <h2 class="module-header">${mod.title}</h2>
                <div class="module-meta">Mastery Component ${this.state.currentDomainIdx + 1}.${this.state.currentTierIdx + 1}</div>
            </div>
            
            <div class="theory-main">
                <div class="formula-card">
                    <div class="formula-display">${mod.formula}</div>
                </div>
                <p class="theory-text">${mod.theory}</p>
            </div>

            <div class="variable-grid">
                ${mod.variables.map(v => `
                    <div class="var-card">
                        <span class="var-sym">${v.sym}</span>
                        <span class="var-def">${v.def}</span>
                    </div>
                `).join('')}
            </div>

            <!-- PROCESS CONTROL PANEL -->
            <div class="control-box-card" style="margin-top: 16px; padding: 14px; border-radius: 8px; border: 1px solid var(--border-light); background: rgba(0,0,0,0.15);">
                <div class="ctrl-header" style="font-family:'JetBrains Mono', monospace; font-size:10px; font-weight:800; color:var(--accent); margin-bottom:10px; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="sliders-horizontal" style="width:12px; height:12px;"></i> PROCESS SETPOINTS
                </div>
                <div class="control-group" style="margin-bottom: 10px;">
                    <label style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-sec); margin-bottom:4px; font-weight:600;">
                        <span>Feed Flow Rate (Q):</span>
                        <span><strong id="ctrl-flow-val" style="color:var(--accent); font-family:'JetBrains Mono';">${this.state.physics.flow_rate ? this.state.physics.flow_rate.toFixed(1) : '10.0'}</strong> m³/h</span>
                    </label>
                    <input type="range" id="slider-flow" min="1" max="25" step="0.5" value="${this.state.physics.flow_rate || 10}" style="width:100%; accent-color:var(--accent); height: 4px; border-radius: 2px;" oninput="app.updateControlParam('flow_rate', this.value)">
                </div>
                <div class="control-group">
                    <label style="display:flex; justify-content:space-between; font-size:10px; color:var(--text-sec); margin-bottom:4px; font-weight:600;">
                        <span>Reactor Temperature (T):</span>
                        <span><strong id="ctrl-temp-val" style="color:var(--warning); font-family:'JetBrains Mono';">${this.state.physics.temp_k ? this.state.physics.temp_k.toFixed(0) : '350'}</strong> K</span>
                    </label>
                    <input type="range" id="slider-temp" min="280" max="480" step="1" value="${this.state.physics.temp_k || 350}" style="width:100%; accent-color:var(--warning); height: 4px; border-radius: 2px;" oninput="app.updateControlParam('temp_k', this.value)">
                </div>
            </div>

            <div class="nav-controls">
                <button class="nav-pill secondary" onclick="app.prevMission()" ${this.state.currentTierIdx === 0 ? 'disabled' : ''}>
                    <i data-lucide="chevron-left"></i> Previous Tier
                </button>
                <button class="nav-pill" onclick="app.nextMission()">
                    Next Challenge <i data-lucide="chevron-right"></i>
                </button>
            </div>
        `;
        lucide.createIcons();
    }

    async updateControlParam(param, value) {
        // Update local state immediately for visual response
        this.state.physics[param] = parseFloat(value);
        if (param === 'flow_rate') {
            const valFlow = document.getElementById('ctrl-flow-val');
            if (valFlow) valFlow.textContent = parseFloat(value).toFixed(1);
        } else if (param === 'temp_k') {
            const valTemp = document.getElementById('ctrl-temp-val');
            if (valTemp) valTemp.textContent = parseFloat(value).toFixed(0);
        }
        
        // Push control setpoints to the backend simulation
        try {
            await this._apiFetch('/api/v1/simulation/control', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [param]: parseFloat(value) })
            });
        } catch (e) {
            console.error("Control parameter push failed", e);
        }
    }

    _updateRoleProgression() {
        const tier = this.state.currentTierIdx;
        
        if (tier === 0) this.state.role = "Junior Process Engineer";
        else if (tier === 1) this.state.role = "Operations Specialist";
        else if (tier === 2) this.state.role = "Senior Process Engineer";
        else if (tier === 3) this.state.role = "Principal Site Engineer";

        if (this.el.userRole) this.el.userRole.textContent = this.state.role;
        this._updateProfileUI();
    }

    async nextMission() {
        const domCount = this.state.curriculum.domains.length;
        const tierCount = 4;

        this.state.xp += 100;

        // Exponential XP Target Scaling
        if (this.state.xp >= this.state.xpTarget) {
            this.state.xp = 0;
            this.state.xpTarget = Math.floor(this.state.xpTarget * 1.5); // 50% resistance increase
            this.notify(`Career Milestone: Experience Cap Expanded to ${this.state.xpTarget}`, 'warning');
        }

        if (this.state.currentTierIdx < tierCount - 1) {
            this.state.currentTierIdx++;
        } else if (this.state.currentDomainIdx < domCount - 1) {
            this.state.currentDomainIdx++;
            this.state.currentTierIdx = 0;
            this.notify(`Domain Level Completed: ${this.state.curriculum.domains[this.state.currentDomainIdx].title}`, 'success');
        } else {
            this.notify('Certification Completed: Principal Site Engineer Status', 'success');
        }

        try {
            await this._apiFetch(`/api/v1/simulation/checkpoint?mission_id=${this.state.activeModule.id}`, { method: 'POST' });
        } catch(e) {}

        await this._loadActiveModule();
        this._updateRoleProgression();
        this._renderCurriculumList();
        this._renderActiveModule();
        this._saveLocalState();
    }

    async prevMission() {
        if (this.state.currentTierIdx > 0) {
            this.state.currentTierIdx--;
            await this._loadActiveModule();
            this._renderActiveModule();
            this._saveLocalState();
        }
    }

    /* -----------------  SIM CONTROLS  ----------------- */

    _renderSimControls(mission) {
        const panel = this.el.controlsPanel;
        panel.innerHTML = `
            <div class="ctrl-header">
                <i data-lucide="sliders-horizontal"></i>
                SIM CTRL — ${mission.id}
            </div>
        `;
        mission.variables.forEach(v => {
            const grp = document.createElement('div');
            grp.className = 'control-group';
            const uid = `ctrl-${v.sym.replace(/[^a-zA-Z0-9]/g, '')}`;
            grp.innerHTML = `
                <label for="${uid}">
                    <span>${v.def}</span>
                    <span class="ctrl-value" id="val-${uid}">50</span>
                </label>
                <input type="range" id="${uid}" min="0" max="100" value="50"
                    oninput="document.getElementById('val-${uid}').textContent=this.value">
            `;
            panel.appendChild(grp);
        });
        lucide.createIcons();
    }

    /* -----------------  ASSET TABLE  ------------------- */

    _renderAssets() {
        const tbody = this.el.assetTable;
        if (!tbody || !this.state.assets) return;
        tbody.innerHTML = '';

        this.state.assets.forEach(a => {
            const id = a.id;
            const dur = a.durability ?? 100;
            const fillClass = dur < 30 ? 'danger' : dur < 60 ? 'warn' : '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="asset-id-cell">
                        ${id}
                        <span class="sigma-tag">4-σ</span>
                    </div>
                </td>
                <td>${a.type}</td>
                <td>Tier&nbsp;<strong>${a.tier}</strong></td>
                <td>
                    <div class="durability-bar-wrap">
                        <div class="durability-bar">
                            <div class="durability-fill ${fillClass}" style="width:${dur.toFixed(0)}%"></div>
                        </div>
                        <span style="font-size:11px;color:var(--text-secondary)">${dur.toFixed(0)}%</span>
                    </div>
                </td>
                <td>${((a.efficiency ?? 1) * 100).toFixed(0)}%</td>
                <td>$${a.maintenance_cost}</td>
                <td>
                    <div class="action-cell">
                        <button class="table-btn" onclick="app.upgradeAsset('${id}')">
                            <i data-lucide="arrow-up-circle"></i> Upgrade
                        </button>
                        <button class="table-btn" onclick="app.repairAsset('${id}')">
                            <i data-lucide="wrench"></i> Repair
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        lucide.createIcons();
    }

    async upgradeAsset(id) {
        try {
            const res = await this._apiFetch(`/api/v1/upgrade/start?component_id=${id}`, { method: 'POST' });
            const d = await res.json();
            this.notify(d.message || 'Process upgrade initiated', 'success');
        } catch { this.notify('Process upgrade failed', 'error'); }
    }

    async repairAsset(id) {
        try {
            const res = await this._apiFetch(`/api/v1/maintenance/repair?component_id=${id}`, { method: 'POST' });
            const d = await res.json();
            this.notify(d.message || 'Asset restored to nominal condition', 'success');
            if (this.state.assets[id]) this.state.assets[id].durability = 100;
            this._renderAssets();
        } catch { this.notify('Maintenance operation failed', 'error'); }
    }

    /* -----------------  TELEMETRY PANEL  --------------- */

    _renderTelemetry() {
        const p = this.state.physics;
        if (this.el.flowChip) this.el.flowChip.textContent = `Q: ${p.flow_rate ? p.flow_rate.toFixed(1) : '--'}`;
        if (this.el.tempChip) this.el.tempChip.textContent = `T: ${p.temp_k ? p.temp_k.toFixed(0) : '--'} K`;
        if (this.el.convChip) this.el.convChip.textContent = `X: ${p.conversion ? (p.conversion * 100).toFixed(1) : '--'}%`;
    }

    /* -----------------  EVENTS  ------------------------ */

    _setupListeners() {
        if (this.el.resetBtn) {
            this.el.resetBtn.onclick = async () => {
                if (!confirm('Reset full simulation state?')) return;
                await this._apiFetch('/api/v1/simulation/reset', { method: 'POST' });
                this.notify('System configuration reset to default', 'success');
                if (this._ws) { this._ws.close(); }
                this._initWebSocket();
            };
        }
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
        if (this.el.examineBtn) {
            this.el.examineBtn.onclick = () => this.notify('Analytical report submitted for review.', 'success');
        }

        // Game Controls
        document.getElementById('spawn-mol').onclick = () => {
            for(let i=0; i<5; i++) this.molecules.spawn();
            this.notify('Molecular dynamic particles injected', 'info');
        };
        document.getElementById('heat-box').onclick = () => {
            this.molecules.heat();
            this.notify('Thermal heat flux increased', 'warning');
        };
        document.getElementById('cool-box').onclick = () => {
            this.molecules.cool();
            this.notify('Cooling water loop active', 'success');
        };
    }

    /* -----------------  DIGITAL NEXUS  ----------------- */

    _setupNexusHandlers() {
        const tools = {
            'btn-portfolio': () => this._generatePortfolio(),
            'btn-cv-extractor': () => this._extractCv(),
            'btn-ppt-gen': () => this._generatePpt()
        };
        Object.entries(tools).forEach(([id, fn]) => {
            const el = document.getElementById(id);
            if (el) el.onclick = fn;
        });
    }

    _consumeChellCredit() {
        if (this.state.isPro) return true;
        if (this.state.chellCredits <= 0) {
            this.openModal('PROFESSIONAL LICENSE REQUIRED', `
                <div style="text-align:center;">
                    <div style="width:60px; height:60px; background:var(--grad-all); border-radius:15px; margin:0 auto 24px; display:grid; place-items:center;">
                        <i data-lucide="award" style="color:#000; width:30px; height:30px;"></i>
                    </div>
                    <h3 style="color:white; margin-bottom:12px;">Upgrade to Professional License</h3>
                    <p style="color:var(--text-sec); margin-bottom:24px;">You have used all 5 free simulation credits. Please upgrade your license to unlock unlimited process analysis and exporting capabilities.</p>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                        <div class="theory-item" style="background:rgba(255,255,255,0.05); padding:16px; border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
                            <div style="font-size:24px; font-weight:800; color:white;">Free</div>
                            <div style="font-size:10px; color:var(--text-ter);">Evaluation Plan</div>
                        </div>
                        <div class="theory-item" style="background:rgba(139,92,246,0.1); padding:16px; border-radius:12px; border:1px solid var(--accent);">
                            <div style="font-size:24px; font-weight:800; color:var(--accent);">$299/yr</div>
                            <div style="font-size:10px; color:var(--text-ter);">Professional License</div>
                        </div>
                    </div>
                    <button class="nav-pill" style="width:100%; height:48px; margin-top:20px; font-weight:800; background:var(--grad-all); color:#000; border:none;" onclick="app.upgradeToPro()">
                        Upgrade Now
                    </button>
                    <p style="font-size:10px; color:var(--text-ter); margin-top:16px;">Secure payment checkout powered by Stripe.</p>
                </div>
            `);
            lucide.createIcons();
            return false;
        }
        this.state.chellCredits--;
        this._updateProfileUI();
        return true;
    }

    async upgradeToPro() {
        try {
            const res = await this._apiFetch('/api/v1/user/upgrade', { method: 'POST' });
            const d = await res.json();
            if (d.status === 'success') {
                this.state.isPro = true;
                this.state.chellCredits = '∞';
                this._updateProfileUI();
                this.notify('Professional License Activated', 'success');
                this.closeModal();
                this._saveLocalState();
            } else {
                this.notify('License upgrade failed', 'error');
            }
        } catch {
            this.notify('Connection error during upgrade', 'error');
        }
    }

    _generatePortfolio() {
        if (!this._consumeChellCredit()) return;
        this.notify('Generating Verified Achievement Portfolio...', 'info');
        this.openModal('Performance Portfolio — Level 1 Access', `
            <div class="portfolio-preview">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
                    <div>
                        <h3 style="color:white; margin:0;">Sourish Senapati</h3>
                        <span style="color:var(--accent); font-size:12px; font-weight:600;">Process Engineering Candidate</span>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:10px; color:var(--text-ter);">EquiliFlow ID</div>
                        <div style="font-family:'JetBrains Mono'; font-weight:700;">EF-2026-X8449</div>
                    </div>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="font-size:10px; color:var(--text-ter);">Simulated Capital</div>
                        <div style="font-size:18px; font-weight:800; color:var(--success);">+$5,142.10</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="font-size:10px; color:var(--text-ter);">CSTR Optimization</div>
                        <div style="font-size:18px; font-weight:800; color:var(--accent);">98.4% Efficiency</div>
                    </div>
                </div>
                <div style="margin-top:20px; font-size:12px; color:var(--text-sec);">
                    <p>Verified achievements in mass & energy balance via industrial digital twin simulation.</p>
                </div>
                <button class="liquid-btn" style="width:100%; margin-top:20px;" onclick="app.notify('Report export locked for Year 1 engineers','warning')">
                    <i data-lucide="download"></i> Download Official PDF
                </button>
            </div>
        `);
    }

    _extractCv() {
        if (!this._consumeChellCredit()) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.openModal('Resume Parsing System', `
                    <div style="text-align:center; padding:20px;">
                        <i data-lucide="file-text" style="width:48px; height:48px; color:var(--accent); margin-bottom:16px;"></i>
                        <p style="color:var(--text-sec);">Analyzing <strong>${file.name}</strong>...</p>
                        <div style="height:4px; background:rgba(255,255,255,0.1); border-radius:10px; margin:20px 0; overflow:hidden;">
                            <div id="cv-progress" style="height:100%; width:0; background:var(--accent); transition:1.5s;"></div>
                        </div>
                        <div id="cv-results" style="opacity:0; transition:0.5s;">
                            <h4 style="color:white; margin-bottom:12px;">Analysis Complete</h4>
                            <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
                                <span class="indicator-chip" style="background:rgba(6,182,212,0.1); color:var(--grad-cyan);">Heat Transfer</span>
                                <span class="indicator-chip" style="background:rgba(6,182,212,0.1); color:var(--grad-cyan);">Python (FastAPI)</span>
                                <span class="indicator-chip" style="background:rgba(6,182,212,0.1); color:var(--grad-cyan);">Process Safety</span>
                                <span class="indicator-chip" style="background:rgba(139,92,246,0.1); color:var(--accent);">Fluid Dynamics</span>
                            </div>
                        </div>
                    </div>
                `);
                setTimeout(() => document.getElementById('cv-progress').style.width = '100%', 100);
                setTimeout(() => document.getElementById('cv-results').style.opacity = '1', 1600);
            }
        };
        input.click();
    }

    _generatePpt() {
        if (!this._consumeChellCredit()) return;
        this.notify('Exporting Telemetry Data to Process Report...', 'info');
        const data = `EquiliFlow League - Process Report\nTime: ${new Date().toLocaleString()}\nCapital: $${this.state.capital}\nEfficiency: ${this.state.physics.conversion * 100}%\nConversion: 0.98`;
        const blob = new Blob([data], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'EquiliFlow_Q2_Report.txt';
        a.click();
    }

    openModal(title, body) {
        this.el.modalTitle.textContent = title;
        this.el.modalBody.innerHTML = body;
        this.el.modal.classList.add('active');
        lucide.createIcons();
    }

    closeModal() {
        this.el.modal.classList.remove('active');
    }

    /* -----------------  NOTIFICATIONS  ----------------- */

    notify(msg, type = 'info') {
        const n = document.createElement('div');
        n.className = `notif ${type}`;
        n.textContent = msg;
        this.el.notifArea.appendChild(n);
        setTimeout(() => n.remove(), 4500);
    }
}

/* ------------------------------------------------------------------ */
/*  BOOT                                                                */
/* ------------------------------------------------------------------ */

window.onload = () => {
    window.app = new EquiliFlowApp();
};
