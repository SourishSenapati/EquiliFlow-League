/**
 * EquiliFlow League: Forensic Narrative & Simulation Engine.
 * This class orchestrates the premium digital twin interface.
 */

class EquiliFlowApp {
    constructor() {
        this.state = {
            year: 1,
            capital: 1000.00,
            online: false,
            solving: false
        };

        this.elements = {
            yearDisplay: document.getElementById('current-year'),
            capitalDisplay: document.getElementById('capital-display'),
            statusPill: document.getElementById('telemetry-status'),
            controlsPanel: document.getElementById('controls-panel'),
            resultsGrid: document.getElementById('results-grid'),
            regimeText: document.getElementById('regime-text'),
            notifArea: document.getElementById('notif-area'),
            examineBtn: document.getElementById('examine-btn'),
            resetBtn: document.getElementById('reset-system'),
            currSteps: document.querySelectorAll('.curr-step')
        };

        this.init();
    }

    init() {
        this.setupBaseListeners();
        this.pollBackend();
        this.setupPassiveIncome();
        this.renderYearUI();
    }

    // --- SYSTEMS MONITORING ---

    async pollBackend() {
        /** Keep the identity stats in sync with the central engine. */
        const poll = async () => {
            try {
                const res = await fetch('/api/v1/status');
                if (res.ok) {
                    const data = await res.json();
                    const yearChanged = this.state.year !== data.year;
                    this.state.year = data.year;
                    this.state.capital = data.capital;
                    this.state.online = true;

                    if (yearChanged) this.renderYearUI();
                    this.updateHeader();
                } else {
                    this.state.online = false;
                }
            } catch (err) {
                this.state.online = false;
            }
            this.updateTelemetryIndicator();
            setTimeout(poll, 2500);
        };
        poll();
    }

    updateHeader() {
        this.elements.yearDisplay.textContent = this.state.year;
        this.elements.capitalDisplay.textContent = `$${this.state.capital.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

        this.elements.currSteps.forEach(step => {
            const stepYear = parseInt(step.dataset.year);
            step.classList.toggle('active', stepYear === this.state.year);
            step.classList.toggle('unlocked', stepYear <= this.state.year);
        });
    }

    updateTelemetryIndicator() {
        const text = this.state.online ? 'Link: Operational' : 'Link: Offline';
        this.elements.statusPill.textContent = text;
        this.elements.statusPill.className = `status-pill ${this.state.online ? 'online' : 'offline'}`;
    }

    // --- INPUT HANDLING ---

    setupBaseListeners() {
        this.elements.resetBtn.onclick = async () => {
            if (confirm("[FORENSIC OVERRIDE] Purge all plant telemetry and return to Year 1?")) {
                await fetch('/api/v1/simulation/reset', { method: 'POST' });
                location.reload();
            }
        };

        this.elements.examineBtn.onclick = async () => {
            if (this.state.year < 4) {
                if (confirm(`Submit flowsheets for Year ${this.state.year} Faculty Evaluation?`)) {
                    await this.advanceYear();
                }
            } else {
                this.notify("Curriculum capacity reached.", "info");
            }
        };
    }

    async advanceYear() {
        try {
            const res = await fetch('/api/v1/curriculum/advance', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                this.notify(`Tier ${data.new_year} Unlocked: Accessing Advanced Modules.`, "success");
                this.state.year = data.new_year;
                this.renderYearUI();
            } else {
                this.notify(data.detail || "Evaluation failed.", "error");
            }
        } catch (e) {
            this.notify("System communication fault.", "error");
        }
    }

    // --- YEAR-SPECIFIC RENDERERS ---

    renderYearUI() {
        /** Dynamically swap the control set based on current academic year. */
        const year = this.state.year;
        this.elements.controlsPanel.innerHTML = '';
        
        const cardTitle = document.createElement('h4');
        this.elements.resultsGrid.innerHTML = ''; 

        // Update active educational module
        document.querySelectorAll('.formula-block').forEach((block, idx) => {
            block.classList.toggle('active', (idx + 1) === year);
        });

        if (year === 1) {
            this.renderY1();
        } else if (year === 2) {
            this.renderY2();
        } else if (year === 3) {
            this.renderY3();
        } else {
            this.renderY4();
        }
    }

    renderY1() {
        const html = `
            <h4>Material Balance Control (Y1)</h4>
            <div class="control-group">
                <label>Feed Flow Rate (m³/hr)</label>
                <input type="range" min="1" max="500" value="10" id="y1-q">
                <span class="val-display" id="y1-q-val">10</span>
            </div>
            <div class="control-group">
                <label>Conversion Factor (X)</label>
                <input type="range" min="0" max="100" value="70" id="y1-x">
                <span class="val-display" id="y1-x-val">70</span>
            </div>
        `;
        this.elements.controlsPanel.innerHTML = html;
        this.elements.regimeText.textContent = "Data Stream: Steady State (Y1)";

        const qIn = document.getElementById('y1-q');
        const xIn = document.getElementById('y1-x');
        const update = () => {
            const q = parseFloat(qIn.value);
            const x = parseFloat(xIn.value) / 100;
            document.getElementById('y1-q-val').textContent = q;
            document.getElementById('y1-x-val').textContent = (x * 100).toFixed(0) + "%";

            this.elements.resultsGrid.innerHTML = `
                <div class="metric-card">
                    <label>Product Yield</label>
                    <div class="metric-val">${(q * x).toFixed(2)} m³/hr</div>
                </div>
                <div class="metric-card">
                    <label>Internal Loss</label>
                    <div class="metric-val">${(q * (1 - x)).toFixed(2)} m³/hr</div>
                </div>
            `;
        };
        qIn.oninput = xIn.oninput = update;
        update();
    }

    renderY2() {
        const html = `
            <h4>Hydrodynamics Matrix (Y2)</h4>
            <div class="control-group">
                <label>Pipe Inner Diameter (mm)</label>
                <input type="range" min="10" max="250" value="50" id="y2-d">
                <span class="val-display" id="y2-d-val">50 mm</span>
            </div>
            <div class="control-group">
                <label>System Length (m)</label>
                <input type="range" min="1" max="500" value="100" id="y2-l">
                <span class="val-display" id="y2-l-val">100 m</span>
            </div>
        `;
        this.elements.controlsPanel.innerHTML = html;
        this.elements.regimeText.textContent = "Data Stream: Navier-Stokes Tier (Y2)";

        const dIn = document.getElementById('y2-d');
        const lIn = document.getElementById('y2-l');
        
        const solve = async () => {
            document.getElementById('y2-d-val').textContent = dIn.value + " mm";
            document.getElementById('y2-l-val').textContent = lIn.value + " m";
            
            try {
                const res = await fetch('/api/v1/simulation/hydrodynamics/solve', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        pipe_diameter_mm: parseFloat(dIn.value),
                        pipe_length_m: parseFloat(lIn.value),
                        target_flow: 50.0
                    })
                });
                const data = await res.json();
                const p = data.physics;

                this.elements.resultsGrid.innerHTML = `
                    <div class="metric-card">
                        <label>Pump Power</label>
                        <div class="metric-val">${(p.pump_power_w / 1000).toFixed(2)} kW</div>
                    </div>
                    <div class="metric-card">
                        <label>Reynolds No.</label>
                        <div class="metric-val" style="color:#4ADE80">${Math.round(p.reynolds).toLocaleString()}</div>
                    </div>
                `;
            } catch (e) { console.error("Solve error", e); }
        };
        dIn.onchange = lIn.onchange = solve;
        solve();
    }

    renderY3() {
        const html = `
            <h4>Reactor Kinetics Analysis (Y3)</h4>
            <div class="control-group">
                <label>Reaction Temperature (K)</label>
                <input type="range" min="273" max="500" value="350" id="y3-t">
                <span class="val-display" id="y3-t-val">350 K</span>
            </div>
            <div class="control-group">
                <label>Stoichiometric Target (%)</label>
                <input type="range" min="1" max="99" value="75" id="y3-x">
                <span class="val-display" id="y3-x-val">75%</span>
            </div>
        `;
        this.elements.controlsPanel.innerHTML = html;
        this.elements.regimeText.textContent = "Data Stream: Arrhenius Kinetics (Y3)";

        const tIn = document.getElementById('y3-t');
        const xIn = document.getElementById('y3-x');

        const solve = async () => {
            document.getElementById('y3-t-val').textContent = tIn.value + " K";
            document.getElementById('y3-x-val').textContent = xIn.value + "%";

            try {
                const res = await fetch('/api/v1/simulation/kinetics/solve', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        temp_k: parseFloat(tIn.value),
                        conversion: parseFloat(xIn.value) / 100
                    })
                });
                const data = await res.json();
                this.elements.resultsGrid.innerHTML = `
                    <div class="metric-card">
                        <label>Rate Const (k)</label>
                        <div class="metric-val">${data.rate_constant.toFixed(4)}</div>
                    </div>
                    <div class="metric-card">
                        <label>CSTR Vol Req</label>
                        <div class="metric-val">${data.volume_required.toFixed(2)} m³</div>
                    </div>
                `;
            } catch (e) {}
        };
        tIn.onchange = xIn.onchange = solve;
        solve();
    }

    renderY4() {
        const html = `
            <h4>Financial Operations (Y4)</h4>
            <p style="font-size: 0.9rem; color: #A3A3A3; margin-top: 1rem;">
                The platform is now fully autonomous. Capital is derived from real-time process efficiency.
            </p>
            <div class="control-group" style="margin-top: 2rem;">
                <button class="btn btn-primary" onclick="alert('Digital Twin Fully Synced.')">Generate Revenue Report</button>
            </div>
        `;
        this.elements.controlsPanel.innerHTML = html;
        this.elements.regimeText.textContent = "Data Stream: Economics & Policy (Y4)";
        this.elements.resultsGrid.innerHTML = `
            <div class="metric-card">
                <label>Net Daily Margin</label>
                <div class="metric-val" style="color:#EAB308">+$2,450.00</div>
            </div>
            <div class="metric-card">
                <label>Asset Efficiency</label>
                <div class="metric-val">99.2%</div>
            </div>
        `;
    }

    // --- UTILS ---

    setupPassiveIncome() {
        setInterval(() => {
            if (this.state.online) {
                this.state.capital += (0.02 * this.state.year);
                this.updateHeader();
            }
        }, 1000);
    }

    notify(msg, type = "info") {
        const div = document.createElement('div');
        div.className = `notif ${type}`;
        div.textContent = msg;
        this.elements.notifArea.appendChild(div);
        setTimeout(() => div.remove(), 4000);
    }
}

// Global Launcher
window.addEventListener('load', () => window.equili = new EquiliFlowApp());
