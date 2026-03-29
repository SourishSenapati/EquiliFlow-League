/**
 * CoreFlow Script: Manages the progressive simulator state and narrative engine.
 * Connects the frontend UI to the FastAPI physics backend.
 */

class CoreFlowApp {
    constructor() {
        this.currentYear = 1;
        this.capital = 1000.00;
        this.unlockedYears = [1];
        
        // DOM Elements
        this.elements = {
            yearDisplay: document.getElementById('current-year'),
            capitalDisplay: document.getElementById('capital-display'),
            examineBtn: document.getElementById('examine-btn'),
            notifArea: document.getElementById('notif-area'),
            currSteps: document.querySelectorAll('.curr-step'),
            controlsPanel: document.getElementById('controls-panel'),
            resultsGrid: document.getElementById('results-grid'),
            regimeText: document.getElementById('regime-text'),
            resetBtn: document.getElementById('reset-system')
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.syncWithBackend();
        this.startPassiveEconomy();
    }

    async syncWithBackend() {
        if (this.isPolling) return;
        this.isPolling = true;
        
        const poll = async () => {
            try {
                const response = await fetch('/api/v1/status');
                if (response.ok) {
                    const data = await response.json();
                    this.currentYear = data.year;
                    this.capital = data.capital;
                    this.unlockedYears = Array.from({length: this.currentYear}, (_, i) => i + 1);
                    this.updateUI();
                    this.updateControls();
                    this.setTelemetryStatus(true);
                }
            } catch (err) {
                this.setTelemetryStatus(false);
            }
            setTimeout(poll, 2000);
        };
        poll();
    }

    setTelemetryStatus(online) {
        const indicator = document.getElementById('telemetry-status');
        if (indicator) {
            indicator.textContent = online ? 'Link: ACTIVE' : 'Link: OFFLINE';
            indicator.className = online ? 'status-pill online' : 'status-pill offline';
        }
    }

    setupEventListeners() {
        this.elements.examineBtn.addEventListener('click', () => this.handleExamination());
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', async () => {
                const confirmed = confirm("[WARNING] CRITICAL OVERRIDE: Re-initialize the entire simulation? All progress and capital will be reset.");
                if (confirmed) {
                    try {
                        const res = await fetch('/api/v1/simulation/reset', { method: 'POST' });
                        if (res.ok) location.reload();
                    } catch (e) { this.showNotification("System Reset Failed."); }
                }
            });
        }

        // Y1 Controls (Material Balance)
        document.getElementById('y1-q').addEventListener('input', (e) => {
            document.getElementById('y1-q-val').textContent = e.target.value;
            this.runSimulation();
        });
        document.getElementById('y1-x').addEventListener('input', (e) => {
            document.getElementById('y1-x-val').textContent = e.target.value;
            this.runSimulation();
        });
    }

    async handleExamination() {
        if (this.currentYear < 4) {
            const success = confirm(`Engineering Faculty Audit: Are you ready to submit your Year ${this.currentYear} flowsheet for evaluation?`);
            if (success) {
                await this.advanceYear();
            }
        } else {
            this.showNotification("Simulation at maximum curriculum tier.");
        }
    }

    async advanceYear() {
        try {
            const response = await fetch('/api/v1/curriculum/advance', { method: 'POST' });
            const data = await response.json();
            
            if (data.new_year) {
                this.currentYear = data.new_year;
                this.unlockedYears.push(this.currentYear);
                this.showNotification(`Curriculum advancement successful. Accessing Year ${this.currentYear} modules.`);
                this.updateUI();
                this.updateControls();
            } else {
                this.showNotification(data.message);
            }
        } catch (err) {
            this.showNotification("Advancement failed: Backend communication error.");
        }
    }

    updateUI() {
        this.elements.yearDisplay.textContent = this.currentYear;
        this.elements.capitalDisplay.textContent = `$${this.capital.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        this.elements.currSteps.forEach(step => {
            const stepYear = parseInt(step.dataset.year);
            step.classList.toggle('active', stepYear === this.currentYear);
            step.classList.toggle('unlocked', this.unlockedYears.includes(stepYear));
        });
    }

    updateControls() {
        if (this.currentYear === 2) {
            this.elements.controlsPanel.innerHTML = `
                <div class="year-layer" id="y2-controls">
                    <h4>Hydrodynamics & Pumping (Y2)</h4>
                    <div class="control-group">
                        <label>Pipe Diameter (mm)</label>
                        <input type="range" min="10" max="250" value="50" id="y2-d">
                        <span class="val-display" id="y2-d-val">50</span>
                    </div>
                </div>
            `;
            document.getElementById('y2-d').addEventListener('input', (e) => {
                document.getElementById('y2-d-val').textContent = e.target.value;
                this.runSimulation();
            });
            this.elements.regimeText.textContent = "Calculated Physics: Year 2 Foundation";
        }
    }

    async runSimulation() {
        if (this.currentYear === 1) {
            const q = parseFloat(document.getElementById('y1-q').value);
            const x = parseFloat(document.getElementById('y1-x').value) / 100;
            const prod = q * x;
            const waste = q - prod;

            document.getElementById('res-prod-flow').textContent = `${prod.toFixed(2)} m3/hr`;
            document.getElementById('res-waste-flow').textContent = `${waste.toFixed(2)} m3/hr`;
        } else if (this.currentYear === 2) {
            const d = parseFloat(document.getElementById('y2-d').value);
            
            try {
                const response = await fetch('/api/v1/simulation/hydrodynamics/solve', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tank_id: "T-101",
                        pump_id: "P-101",
                        pipe_id: "L-101",
                        target_flow: 50.0, // Fixed for demo, or take from Y1 Q
                        tank_pressure: 101325.0,
                        pipe_diameter_mm: d,
                        pipe_length_m: 100.0
                    })
                });
                
                const data = await response.json();
                const physics = data.physics;
                this.capital = data.economics.remaining_capital;
                this.updateUI();

                this.elements.resultsGrid.innerHTML = `
                    <div class="metric-card">
                        <label>Pump Power</label>
                        <div class="metric-val">${(physics.pump_power_w / 1000).toFixed(2)} kW</div>
                    </div>
                    <div class="metric-card">
                        <label>Reynolds No.</label>
                        <div class="metric-val">${Math.round(physics.reynolds).toLocaleString()}</div>
                    </div>
                    <div class="metric-card">
                        <label>Friction Factor</label>
                        <div class="metric-val">${physics.friction_factor.toFixed(4)}</div>
                    </div>
                `;
            } catch (err) {
                console.error("Simulation error:", err);
            }
        }
    }

    startPassiveEconomy() {
        // Passive income generation simulation (Micro-Layer)
        setInterval(() => {
            this.capital += 0.05 * this.currentYear;
            this.elements.capitalDisplay.textContent = `$${this.capital.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }, 1000);
    }

    showNotification(msg) {
        const div = document.createElement('div');
        div.className = 'notif';
        div.textContent = `SYSTEM ALERT: ${msg}`;
        this.elements.notifArea.appendChild(div);
        setTimeout(() => div.remove(), 5000);
    }
}

// 4. Initialize the App
window.addEventListener('load', () => {
    window.app = new CoreFlowApp();
});
