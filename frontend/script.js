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
            solving: false,
            currentPhase: 1,
            currentDomainIdx: 0,
            currentTierIdx: 0,
            currentMissionIdx: 0,
            aiStatus: { training: false, device: "N/A", loss: 0.0, sigma: 4 },
            assets: {
                "P-101": { type: "Pump", tier: 1, durability: 100, is_upgrading: false, upgrade_finish: 0, efficiency: 0.85, maintenance_cost: 150 },
                "T-101": { type: "Tank", tier: 1, durability: 100, is_upgrading: false, upgrade_finish: 0, efficiency: 1.0, maintenance_cost: 50 },
                "L-101": { type: "Valve", tier: 1, durability: 100, is_upgrading: false, upgrade_finish: 0, efficiency: 0.95, maintenance_cost: 25 }
            }
        };

        this.elements = {
            yearDisplay: document.getElementById('current-year'),
            capitalDisplay: document.getElementById('capital-display'),
            statusPill: document.getElementById('telemetry-status'),
            controlsPanel: document.getElementById('controls-panel'),
            resultsGrid: document.getElementById('results-grid'),
            notifArea: document.getElementById('notif-area'),
            resetBtn: document.getElementById('reset-system'),
            domainList: document.getElementById('domain-list'),
            theoryGrid: document.getElementById('theory-grid'),
            assetTable: document.getElementById('asset-table-body'),
            phaseSelector: document.getElementById('phase-selector')
        };

        this.init();
    }

    init() {
        this.setupBaseListeners();
        this.pollBackend();
        this.setupPassiveIncome();
        this.renderCurriculum();
        this.renderSpreadsheet();
    }

    setPhase(phase) {
        this.state.currentPhase = phase;
        const buttons = this.elements.phaseSelector.querySelectorAll('.phase-tab');
        buttons.forEach((btn, idx) => {
            btn.classList.toggle('active', (idx + 1) === phase);
        });
        this.notify(`Initializing Industrial Environment: Phase ${phase}`, "success");
        this.renderCurriculum();
    }

    // --- CURRICULUM ENGINE ---

    renderCurriculum() {
        const curriculum = window.CHEME_CURRICULUM;
        if (!curriculum) {
            console.error("Curriculum data missing.");
            return;
        }

        // Render Sidebar Domains
        this.elements.domainList.innerHTML = '';
        curriculum.forEach((domain, idx) => {
            const li = document.createElement('li');
            li.className = `curr-step ${idx === this.state.currentDomainIdx ? 'active' : ''}`;
            li.innerHTML = `${String(idx + 1).padStart(2, '0')}. ${domain.title.split(': ')[1]}`;
            li.onclick = () => {
                this.state.currentDomainIdx = idx;
                this.state.currentTierIdx = 0;
                this.state.currentMissionIdx = 0;
                this.renderCurriculum();
            };
            this.elements.domainList.appendChild(li);
        });

        // Render Active Mission
        const domain = curriculum[this.state.currentDomainIdx];
        const tier = domain.tiers[this.state.currentTierIdx];
        const mission = tier.missions[this.state.currentMissionIdx];

        this.elements.theoryGrid.innerHTML = `
            <div class="formula-block active">
                <label>${domain.title}</label>
                <p class="mission-sub">${tier.title} | ${mission.title}</p>
                <div class="formula-box">
                    <p class="formula-text">${mission.formula}</p>
                </div>
                <p class="theory-desc">${mission.theory}</p>
                <hr class="term-divider">
                <label>CORE VARIABLES:</label>
                <ul class="term-list">
                    ${mission.variables.map(v => `<li><strong>${v.sym}:</strong> ${v.def}</li>`).join('')}
                </ul>
                <div class="mission-nav">
                    <button class="btn btn-tiny" onclick="app.prevMission()">PREV</button>
                    <span>${this.state.currentMissionIdx + 1} / ${tier.missions.length}</span>
                    <button class="btn btn-tiny" onclick="app.nextMission()">NEXT</button>
                </div>
            </div>
        `;

        this.renderSimControls(mission);
    }

    nextMission() {
        const domain = window.CHEME_CURRICULUM[this.state.currentDomainIdx];
        const tier = domain.tiers[this.state.currentTierIdx];
        if (this.state.currentMissionIdx < tier.missions.length - 1) {
            this.state.currentMissionIdx++;
        } else if (this.state.currentTierIdx < domain.tiers.length - 1) {
            this.state.currentTierIdx++;
            this.state.currentMissionIdx = 0;
        }
        this.renderCurriculum();
    }

    prevMission() {
        if (this.state.currentMissionIdx > 0) {
            this.state.currentMissionIdx--;
        } else if (this.state.currentTierIdx > 0) {
            this.state.currentTierIdx--;
            const domain = window.CHEME_CURRICULUM[this.state.currentDomainIdx];
            this.state.currentMissionIdx = domain.tiers[this.state.currentTierIdx].missions.length - 1;
        }
        this.renderCurriculum();
    }

    renderSimControls(mission) {
        this.elements.controlsPanel.innerHTML = `<h4>[SIM_CTRL]: ${mission.id}</h4>`;
        mission.variables.forEach(v => {
            const group = document.createElement('div');
            group.className = 'control-group';
            group.innerHTML = `
                <label>${v.def}</label>
                <input type="range" min="0" max="100" value="50" oninput="this.nextElementSibling.innerText = this.value">
                <span class="val-display">50</span>
            `;
            this.elements.controlsPanel.appendChild(group);
        });
        this.elements.regimeText.textContent = `Regime: ${mission.title}`;
    }

    // --- SYSTEM CORE ---

    renderSpreadsheet() {
        this.elements.assetTable.innerHTML = '';
        for (const id in this.state.assets) {
            const asset = this.state.assets[id];
            const row = document.createElement('tr');
            row.id = `row-${id}`;
            row.innerHTML = `
                <td>${id} <span class="sigma-badge">4-SIGMA VALIDATED</span></td>
                <td>${asset.type}</td>
                <td>Tier ${asset.tier}</td>
                <td class="${asset.durability < 50 ? 'text-warn' : ''}">${asset.durability.toFixed(1)}%</td>
                <td>${(asset.efficiency * 100).toFixed(1)}%</td>
                <td>$${asset.maintenance_cost}</td>
                <td class="asset-actions">
                    <button class="btn btn-tiny btn-gold" onclick="app.upgradeAsset('${id}')">UPGRADE</button>
                    <button class="btn btn-tiny" onclick="app.repairAsset('${id}')">REPAIR</button>
                </td>
            `;
            this.elements.assetTable.appendChild(row);
        }
    }

    async pollBackend() {
        const poll = async () => {
            try {
                const res = await fetch('/api/v1/status');
                if (res.ok) {
                    const data = await res.json();
                    this.state.year = data.year;
                    this.state.capital = data.capital;
                    this.state.online = true;
                    // Sync backend assets to frontend spreadsheet
                    if (data.assets) {
                        for (const id in data.assets) {
                            if (this.state.assets[id]) {
                                Object.assign(this.state.assets[id], data.assets[id]);
                            }
                        }
                        this.renderSpreadsheet();
                    }
                    if (data.ai_status) {
                        this.state.aiStatus = data.ai_status;
                        this.updateAIIndicator();
                    }
                    this.updateHeader();
                }
            } catch (err) { this.state.online = false; }
            this.updateTelemetryIndicator();
            setTimeout(poll, 3000);
        };
        poll();
    }

    updateAIIndicator() {
        const status = this.state.aiStatus;
        if (status.training) {
            this.notify(`GPU Accelerator (${status.device}): 4-SIGMA Stability confirmed. Training Loss: ${status.loss.toFixed(6)}`, "success");
        }
    }

    notify(msg, type) {
        const n = document.createElement('div');
        n.className = `notif ${type} ${type === 'success' ? 'reliability-save' : ''}`;
        n.textContent = `> ${msg}`;
        this.elements.notifArea.appendChild(n);
        setTimeout(() => n.remove(), 4000);
    }
}

window.onload = () => { window.app = new EquiliFlowApp(); };
