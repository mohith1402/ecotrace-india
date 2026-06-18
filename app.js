"use strict";

/* ==========================================================================
   EcoTrace India Core Logic - Theme Switcher, Aurora Grid, Real-Time Calculations
   ========================================================================== */

// --- Safe DOM Access Helpers ---
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
    return el;
}

function safeSetHTML(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
    return el;
}

function safeGetValue(id, defaultValue = "") {
    const el = document.getElementById(id);
    return el ? el.value : defaultValue;
}

function safeGetFloat(id, defaultValue = 0) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || defaultValue : defaultValue;
}

function safeGetInt(id, defaultValue = 0) {
    const el = document.getElementById(id);
    return el ? parseInt(el.value, 10) || defaultValue : defaultValue;
}

function safeGetChecked(id, defaultValue = false) {
    const el = document.getElementById(id);
    return el ? el.checked : defaultValue;
}

// --- Game and Level Configurations ---
const ECO_LEVELS = [
    { name: "Seedling", minXp: 0, maxXp: 100, icon: "eco", desc: "Starting your eco-journey. Track more habits to sprout!" },
    { name: "Sprout", minXp: 100, maxXp: 250, icon: "psychology_alt", desc: "Active tracker. You are starting to make a visible difference!" },
    { name: "Sapling", minXp: 250, maxXp: 500, icon: "forest", desc: "True conservationist. Your habits are spreading roots!" },
    { name: "Eco Guardian", minXp: 500, maxXp: 1000, icon: "shield_heart", desc: "A protector of nature. Inspiring others to live sustainably." },
    { name: "Forest Warden", minXp: 1000, maxXp: Infinity, icon: "public", desc: "Legendary status! You are a carbon-neutral force of nature." }
];

const PRESET_HABITS = [
    { id: "metro_commute", title: "Commute via local Metro or bus", category: "transport", co2: 3.8, xp: 20 },
    { id: "two_wheeler_pool", title: "Carpool / ride-share your motorcycle", category: "transport", co2: 2.2, xp: 12 },
    { id: "ac_star_saving", title: "Run AC at 24°C with ceiling fan", category: "energy", co2: 2.5, xp: 18 },
    { id: "switch_to_leds", title: "Replace house bulbs with energy-efficient LEDs", category: "energy", co2: 1.0, xp: 8 },
    { id: "mand_local", title: "Buy seasonal veggies from local Mandi", category: "food", co2: 1.2, xp: 10 },
    { id: "compost_waste", title: "Compost organic wet waste at home", category: "food", co2: 0.9, xp: 10 },
    { id: "kabadiwala_recycle", title: "Sort paper & plastic for local Kabadiwala", category: "consumption", co2: 1.5, xp: 15 },
    { id: "refuse_polybag", title: "Carry own cloth bag, refuse polybags", category: "consumption", co2: 0.8, xp: 8 }
];

const ACHIEVEMENT_BADGES = [
    { id: "first_calc", title: "Eco Scout", desc: "Completed your first carbon calculation", icon: "explore", gold: false, condition: (state) => state.calculatorResults.total > 0 },
    { id: "low_carbon", title: "Carbon Cutter", desc: "Achieve annual footprint under 1.5 tonnes (Global Target)", icon: "target", gold: false, condition: (state) => state.calculatorResults.total > 0 && state.calculatorResults.total < 1.5 },
    { id: "commute_pioneer", title: "Metro Rider", desc: "Logged Metro travel or two-wheeler pooling actions", icon: "train", gold: false, condition: (state) => state.completedHabits["metro_commute"] || state.completedHabits["two_wheeler_pool"] },
    { id: "local_champion", title: "Mandi Pioneer", desc: "Prioritize local seasonal Mandi purchasing habits", icon: "local_mall", gold: false, condition: (state) => state.completedHabits["mand_local"] },
    { id: "star_saver", title: "Grid Defender", desc: "Log AC saving or LED replacement home energy habits", icon: "bolt", gold: false, condition: (state) => state.completedHabits["ac_star_saving"] || state.completedHabits["switch_to_leds"] },
    { id: "forest_pioneer", title: "Forest Pioneer", desc: "Reach Level 3 (Sapling)", icon: "workspace_premium", gold: true, condition: (state) => state.level >= 3 }
];

// --- Global Application State ---
let state = {
    xp: 0,
    level: 1,
    calculatorResults: {
        transport: 0,
        energy: 0,
        food: 0,
        consumption: 0,
        total: 0
    },
    completedHabits: {},
    lifetimeSaved: 0.0,
    customHabits: [],
    unlockedBadges: [],
    currentForestIconCount: -1
};

// --- Chart Objects ---
let breakdownChart = null;
let projectionChart = null;

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    loadState();
    setupNavigation();
    setupCalculator();
    setupTracker();
    setupSimulator();
    setupChatbot();
    setupThemeToggler();
    setupRealTimeListeners();
    
    // Initial run of calculation to populate defaults
    calculateFootprint(true);
    
    updateUIElements();
    initCharts();
});

// --- HTML Sanitization (XSS Prevention) ---
function escapeHTML(str) {
    if (!str) return "";
    return str.toString().replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// --- Local Storage Management ---
function saveState() {
    try {
        localStorage.setItem("ecotrace_state_in_saas", JSON.stringify(state));
    } catch (e) {
        console.warn("Storage write failed", e);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem("ecotrace_state_in_saas");
        if (saved) {
            const parsed = JSON.parse(saved);
            state = { ...state, ...parsed };
        }
    } catch (e) {
        console.warn("Storage read failed", e);
    }
}

// --- Light & Dark Theme Controller ---
function setupThemeToggler() {
    const themeBtn = document.getElementById("theme-toggle-btn");
    const mobileThemeBtn = document.getElementById("mobile-theme-toggle-btn");
    
    const toggleFunc = () => {
        const body = document.body;
        body.classList.toggle("light-theme");
        
        const isLight = body.classList.contains("light-theme");
        localStorage.setItem("ecotrace_theme", isLight ? "light" : "dark");
        
        // Update both button icons
        const iconName = isLight ? "dark_mode" : "light_mode";
        safeSetText("theme-icon", iconName);
        safeSetText("mobile-theme-icon", iconName);
        
        // Refresh dynamic colors for Chart.js
        updateChartThemeColors(isLight);
    };

    if (themeBtn) themeBtn.addEventListener("click", toggleFunc);
    if (mobileThemeBtn) mobileThemeBtn.addEventListener("click", toggleFunc);
}

function loadTheme() {
    const savedTheme = localStorage.getItem("ecotrace_theme");
    
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        safeSetText("theme-icon", "dark_mode");
        safeSetText("mobile-theme-icon", "dark_mode");
    } else {
        document.body.classList.remove("light-theme");
        safeSetText("theme-icon", "light_mode");
        safeSetText("mobile-theme-icon", "light_mode");
    }
}

function updateChartThemeColors(isLight) {
    const gridColor = isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.03)";
    const labelColor = isLight ? "#475569" : "#64748b";
    
    if (breakdownChart) {
        breakdownChart.options.plugins.legend.labels.color = labelColor;
        breakdownChart.options.datasets[0].borderColor = isLight ? "#ffffff" : "#090c15";
        breakdownChart.update();
    }
    
    if (projectionChart) {
        projectionChart.options.scales.y.grid.color = gridColor;
        projectionChart.options.scales.y.ticks.color = labelColor;
        projectionChart.options.scales.x.ticks.color = labelColor;
        projectionChart.update();
    }
}

// --- Navigation Tabs & Mobile Drawer Control ---
function setupNavigation() {
    const navButtons = document.querySelectorAll(".nav-menu-btn");
    const panels = document.querySelectorAll(".panel");
    const sidebar = document.querySelector(".sidebar");
    const menuTrigger = document.getElementById("mobile-menu-trigger");

    // Desktop/Mobile navigation tabs
    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");
            
            navButtons.forEach(b => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            panels.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            
            const targetPanel = document.getElementById(`panel-${targetTab}`);
            if (targetPanel) {
                targetPanel.classList.add("active");
            }
            
            // Auto scroll main panel on navigation transitions
            const mainContent = document.querySelector(".main-content");
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
            
            // Close mobile sidebar menu drawer if active
            if (sidebar) {
                sidebar.classList.remove("active");
            }
            
            // Refresh charts upon tab change
            if (targetTab === "dashboard") {
                updateDashboardCharts();
            } else if (targetTab === "simulator") {
                updateSimulatorCharts();
            }
        });
    });

    // Mobile menu drawer toggle
    if (menuTrigger && sidebar) {
        menuTrigger.addEventListener("click", () => {
            sidebar.classList.toggle("active");
        });
    }
}

// --- Dynamic XP and Leveling Logic ---
function addXP(amount) {
    state.xp += amount;
    checkLevelProgression();
    checkBadges();
    saveState();
    updateUIElements();
}

function checkLevelProgression() {
    let currentLvlIndex = 0;
    for (let i = 0; i < ECO_LEVELS.length; i++) {
        if (state.xp >= ECO_LEVELS[i].minXp && state.xp < ECO_LEVELS[i].maxXp) {
            currentLvlIndex = i;
            break;
        }
    }
    const newLvl = currentLvlIndex + 1;
    if (newLvl > state.level) {
        state.level = newLvl;
        triggerLevelUpModal(ECO_LEVELS[currentLvlIndex]);
    } else if (newLvl < state.level) {
        state.level = newLvl;
    }
}

function triggerLevelUpModal(levelInfo) {
    const modal = document.getElementById("modal-level-up");
    const levelNameSpan = document.getElementById("modal-level-name");
    
    if (levelNameSpan) {
        levelNameSpan.textContent = levelInfo.name;
    }
    if (modal) {
        modal.classList.add("active");
        
        const closeBtn = document.getElementById("btn-close-modal");
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove("active");
            };
        }
    }
}

// --- Attach Real-Time Calculation Listeners ---
function setupRealTimeListeners() {
    const inputs = [
        "car-distance", "car-fuel", "bike-distance", "bike-fuel",
        "transit-hours", "flights-short", "flights-long", "electricity-bill",
        "regional-grid", "solar-energy", "lpg-cylinders", "household-members",
        "food-waste", "food-local", "shopping-frequency", "recycling-rate", "single-use-plastic"
    ];

    // Trigger calculation instantly on any value typing, sliding, or toggling
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => calculateFootprint(true));
            el.addEventListener("change", () => calculateFootprint(true));
        }
    });

    // Radio button listeners (Diet style)
    const dietRadios = document.querySelectorAll('input[name="diet"]');
    dietRadios.forEach(radio => {
        radio.addEventListener("change", () => calculateFootprint(true));
    });
}

// --- Multi-Step Calculator Wizard ---
function setupCalculator() {
    let currentStepIndex = 1;
    const totalSteps = 4;
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const stepLines = document.querySelectorAll(".step-line");
    
    if (!btnNext || !btnPrev) return;
    
    btnNext.addEventListener("click", () => {
        if (currentStepIndex < totalSteps) {
            const currIndicator = document.querySelector(`.step-indicator[data-step="${currentStepIndex}"]`);
            if (currIndicator) {
                currIndicator.classList.remove("active");
                currIndicator.classList.add("completed");
            }
            
            if (stepLines[currentStepIndex - 1]) {
                stepLines[currentStepIndex - 1].classList.add("completed");
            }
            
            const stepEl = document.getElementById(`step-${currentStepIndex}`);
            if (stepEl) {
                stepEl.classList.remove("active");
            }
            currentStepIndex++;
            const nextStepEl = document.getElementById(`step-${currentStepIndex}`);
            if (nextStepEl) {
                nextStepEl.classList.add("active");
            }
            
            const nextIndicator = document.querySelector(`.step-indicator[data-step="${currentStepIndex}"]`);
            if (nextIndicator) {
                nextIndicator.classList.add("active");
            }
            
            btnPrev.removeAttribute("disabled");
            
            if (currentStepIndex === totalSteps) {
                btnNext.innerHTML = `Complete <span class="material-symbols-rounded" aria-hidden="true">check</span>`;
            }
        } else {
            // Final step submit button click: Celebrate & redirect
            calculateFootprint(false);
            
            // Switch to Dashboard Tab
            const dashboardTab = document.getElementById("tab-dashboard");
            if (dashboardTab) {
                dashboardTab.click();
            }
            
            // Award calculation submit XP (once)
            if (state.unlockedBadges.length === 0) {
                addXP(100);
            } else {
                addXP(15);
            }
        }
    });

    btnPrev.addEventListener("click", () => {
        if (currentStepIndex > 1) {
            const nextIndicator = document.querySelector(`.step-indicator[data-step="${currentStepIndex}"]`);
            if (nextIndicator) {
                nextIndicator.classList.remove("active");
            }
            
            const stepEl = document.getElementById(`step-${currentStepIndex}`);
            if (stepEl) {
                stepEl.classList.remove("active");
            }
            currentStepIndex--;
            const prevStepEl = document.getElementById(`step-${currentStepIndex}`);
            if (prevStepEl) {
                prevStepEl.classList.add("active");
            }
            
            const currIndicator = document.querySelector(`.step-indicator[data-step="${currentStepIndex}"]`);
            if (currIndicator) {
                currIndicator.classList.remove("completed");
                currIndicator.classList.add("active");
            }
            
            if (stepLines[currentStepIndex - 1]) {
                stepLines[currentStepIndex - 1].classList.remove("completed");
            }
            
            btnNext.innerHTML = `Next <span class="material-symbols-rounded" aria-hidden="true">arrow_forward</span>`;
            
            if (currentStepIndex === 1) {
                btnPrev.setAttribute("disabled", "true");
            }
        }
    });
}

function calculateFootprint(isAuto = false) {
    // --- Step 1: Transport ---
    const carDist = safeGetFloat("car-distance", 0);
    const carFuel = safeGetValue("car-fuel", "petrol");
    const bikeDist = safeGetFloat("bike-distance", 0);
    const bikeFuel = safeGetValue("bike-fuel", "petrol");
    const transitHrs = safeGetFloat("transit-hours", 0);
    const flightsShort = safeGetInt("flights-short", 0);
    const flightsLong = safeGetInt("flights-long", 0);
    
    const carFuelCoeffs = { petrol: 0.18, diesel: 0.17, cng: 0.12, hybrid: 0.11, ev: 0.05 };
    const bikeFuelCoeffs = { petrol: 0.05, ev: 0.015 };
    
    const carEmissions = carDist * (carFuelCoeffs[carFuel] || 0.18);
    const bikeEmissions = bikeDist * (bikeFuelCoeffs[bikeFuel] || 0.05);
    const transitEmissions = transitHrs * 52 * 0.025; 
    const flightEmissions = (flightsShort * 100) + (flightsLong * 800); 
    const totalTransport = carEmissions + bikeEmissions + transitEmissions + flightEmissions;

    // --- Step 2: Energy & LPG ---
    const elecBill = safeGetFloat("electricity-bill", 0);
    const regionalGrid = safeGetValue("regional-grid", "west");
    const hasSolar = safeGetChecked("solar-energy", false);
    const lpgCylinders = safeGetFloat("lpg-cylinders", 0);
    const hhSize = safeGetInt("household-members", 1);
    
    const monthlyKwh = elecBill / 7.0; // ₹7 average tariff per unit
    const gridCoeffs = { south: 0.72, north: 0.82, west: 0.80, east: 0.89, northeast: 0.35 };
    const activeGridCoeff = gridCoeffs[regionalGrid] || 0.80;
    
    let annualElecEmissions = monthlyKwh * 12 * activeGridCoeff;
    if (hasSolar) {
        annualElecEmissions *= 0.15; // 85% solar offset
    }
    
    const annualLpgEmissions = lpgCylinders * 12 * 42.5; // 42.5 kg CO2 per cylinder
    const totalEnergy = (annualElecEmissions + annualLpgEmissions) / hhSize;

    // --- Step 3: Diet & Food ---
    const dietRadio = document.querySelector('input[name="diet"]:checked');
    const dietType = dietRadio ? dietRadio.value : "pure-veg";
    const foodWaste = safeGetValue("food-waste", "normal");
    const foodLocal = safeGetValue("food-local", "always");
    
    let dietEmissions = 1200;
    if (dietType === "pure-veg") dietEmissions = 800;
    else if (dietType === "eggetarian") dietEmissions = 1100;
    else if (dietType === "non-veg") dietEmissions = 1800;
    else if (dietType === "heavy-meat") dietEmissions = 2600;
    
    if (foodWaste === "none") dietEmissions -= 100;
    else if (foodWaste === "high") dietEmissions += 200;
    
    if (foodLocal === "always") dietEmissions -= 150;
    else if (foodLocal === "rarely") dietEmissions += 150;
    
    const totalFood = dietEmissions;

    // --- Step 4: Consumption & Shopping ---
    const shopFreq = safeGetValue("shopping-frequency", "average");
    const recycleRate = safeGetValue("recycling-rate", "some");
    const avoidPlastics = safeGetChecked("single-use-plastic", false);
    
    let consEmissions = 500;
    if (shopFreq === "frequent") consEmissions = 1000;
    else if (shopFreq === "minimal") consEmissions = 150;
    
    if (recycleRate === "all") consEmissions -= 150;
    else if (recycleRate === "none") consEmissions += 200;
    
    if (avoidPlastics) consEmissions -= 50;
    const totalCons = Math.max(80, consEmissions);

    // --- Totals ---
    state.calculatorResults = {
        transport: parseFloat((totalTransport / 1000).toFixed(2)),
        energy: parseFloat((totalEnergy / 1000).toFixed(2)),
        food: parseFloat((totalFood / 1000).toFixed(2)),
        consumption: parseFloat((totalCons / 1000).toFixed(2)),
        total: parseFloat(((totalTransport + totalEnergy + totalFood + totalCons) / 1000).toFixed(2))
    };
    
    if (!isAuto) {
        checkBadges();
        saveState();
    }
    
    updateLiveMetrics();
}

// --- Live Score and Offset Updates ---
function updateLiveMetrics() {
    const total = state.calculatorResults.total;
    
    // Update Sidebar & Mobile Header totals
    safeSetText("sidebar-live-score", total.toFixed(2));
    safeSetText("mobile-live-score", total.toFixed(2));
    
    // Live trend indicator details
    const trendInd = document.getElementById("sidebar-trend-indicator");
    const trendTxt = document.getElementById("trend-text");
    
    if (trendInd && trendTxt) {
        const span = trendInd.querySelector("span");
        if (total === 0) {
            trendInd.className = "widget-indicator";
            trendTxt.textContent = "Awaiting input";
            if (span) span.textContent = "help";
        } else if (total < 1.5) {
            trendInd.className = "widget-indicator success";
            trendTxt.textContent = "Sustainable level";
            if (span) span.textContent = "check_circle";
        } else if (total <= 2.5) {
            trendInd.className = "widget-indicator warning";
            trendTxt.textContent = "Close to national avg";
            if (span) span.textContent = "info";
        } else {
            trendInd.className = "widget-indicator danger";
            trendTxt.textContent = "Above national avg";
            if (span) span.textContent = "warning";
        }
    }

    // Update Dashboard numerical score gauge
    safeSetText("dashboard-total-score", total.toFixed(2));
    
    const gaugePath = document.getElementById("gauge-path");
    if (gaugePath) {
        const gaugeVal = 125.6 - (Math.min(total, 4.0) / 4.0) * 125.6;
        gaugePath.style.strokeDashoffset = gaugeVal;
    }

    // Dynamic Tree calculations
    // 1 mature tree absorbs ~22 kg CO2/year
    const treesNeeded = Math.ceil((total * 1000) / 22);
    safeSetText("display-trees-count", treesNeeded);

    // RESOLVED UI BUG: Draw ONE clean, pulsing forest icon inside the circle badge
    const treeBadgeContainer = document.getElementById("forest-tree-container");
    if (treeBadgeContainer) {
        treeBadgeContainer.innerHTML = `<span class="material-symbols-rounded tree-icon fill-icon" aria-hidden="true">forest</span>`;
        const iconSpan = treeBadgeContainer.querySelector("span");
        if (iconSpan) {
            if (total < 1.5) {
                iconSpan.style.color = "var(--color-primary)";
            } else if (total <= 2.5) {
                iconSpan.style.color = "var(--color-warning)";
            } else {
                iconSpan.style.color = "var(--color-danger)";
            }
        }
    }

    // OPTIMIZED: Re-draw mini trees inside the forest-grid ONLY if the required count changes
    const forestGrid = document.getElementById("forest-grid");
    if (forestGrid) {
        const iconCount = Math.min(40, Math.ceil(treesNeeded / 5));
        if (state.currentForestIconCount !== iconCount) {
            state.currentForestIconCount = iconCount;
            forestGrid.innerHTML = "";
            
            for (let i = 0; i < iconCount; i++) {
                const tree = document.createElement("span");
                tree.className = "material-symbols-rounded tree-mini fill-icon";
                tree.textContent = "park";
                tree.setAttribute("aria-hidden", "true");
                tree.style.animationDelay = (i * 0.015) + "s";
                
                if (total < 1.5) {
                    tree.style.color = "var(--color-primary)";
                } else if (total <= 2.5) {
                    tree.style.color = "var(--color-warning)";
                } else {
                    tree.style.color = "var(--color-danger)";
                }
                
                forestGrid.appendChild(tree);
            }
            
            if (iconCount === 0) {
                forestGrid.innerHTML = `<span style="font-size:12px; color:var(--text-muted);">Forest offset empty.</span>`;
            }
        }
    }

    // Display trees saved from Action Center logs
    const treesSaved = Math.floor(state.lifetimeSaved / 22);
    const savedBox = document.getElementById("trees-saved-box");
    const displaySavedText = document.getElementById("display-trees-saved");
    
    if (savedBox && displaySavedText) {
        if (treesSaved > 0) {
            savedBox.style.display = "flex";
            displaySavedText.textContent = treesSaved;
        } else {
            savedBox.style.display = "none";
        }
    }

    // OPTIMIZED: Removed background chart redraws while typing on the calculator tab.
    // Charts are now only updated when their respective tabs are opened.
    updateBenchmarkText(total);
}

function updateBenchmarkText(totalScore) {
    const statusText = document.getElementById("benchmark-status");
    const comparisonText = document.getElementById("benchmark-comparison");
    
    if (!statusText || !comparisonText) return;
    
    if (totalScore === 0) {
        statusText.textContent = "Awaiting Calculations";
        comparisonText.textContent = "Fill in the Calculator questions to view benchmarks.";
    } else {
        if (totalScore < 1.5) {
            statusText.innerHTML = `<span class="text-gradient-success">Eco Champion!</span>`;
            comparisonText.textContent = `Excellent! Your footprint (${totalScore.toFixed(2)} t) is below the global target of 1.5 tonnes and cleaner than the Indian average (1.9 t).`;
        } else if (totalScore <= 2.2) {
            statusText.innerHTML = `<span class="text-gradient-success">Average Indian</span>`;
            comparisonText.textContent = `Your footprint is close to the Indian average of 1.9 tonnes. Try adopting AC and transport habits to target a sustainable 1.2 tonnes.`;
        } else {
            statusText.innerHTML = `<span class="text-gradient-danger">High Impact</span>`;
            comparisonText.textContent = `Your footprint (${totalScore.toFixed(2)} t) is above the Indian national average. Adopt public transit, local Mandi food, and solar options.`;
        }
    }
}

// --- Gamified Badge/Achievements Checker ---
function checkBadges() {
    ACHIEVEMENT_BADGES.forEach(badge => {
        if (!state.unlockedBadges.includes(badge.id)) {
            if (badge.condition(state)) {
                state.unlockedBadges.push(badge.id);
                state.xp += badge.gold ? 100 : 50;
            }
        }
    });
}

// --- Daily Action Checklist Manager ---
function setupTracker() {
    const customForm = document.getElementById("custom-habit-form");
    const filters = document.querySelectorAll(".filter-btn");
    let currentFilter = "all";
    
    filters.forEach(btn => {
        btn.addEventListener("click", () => {
            filters.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.getAttribute("data-filter");
            renderHabits(currentFilter);
        });
    });

    if (customForm) {
        customForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const titleInput = document.getElementById("custom-habit-title");
            const title = titleInput ? titleInput.value.trim() : "";
            const co2Val = safeGetFloat("custom-habit-co2", 1.0);
            const category = safeGetValue("custom-habit-category", "transport");
            const id = "custom_" + Date.now();
            
            const newHabit = {
                id: id,
                title: title,
                category: category,
                co2: co2Val,
                xp: Math.round(co2Val * 5) + 5
            };
            
            state.customHabits.push(newHabit);
            saveState();
            renderHabits(currentFilter);
            customForm.reset();
            addXP(10);
        });
    }
}

function renderHabits(filter = "all") {
    const container = document.getElementById("habit-list-container");
    if (!container) return;
    container.innerHTML = "";
    
    const allHabits = [...PRESET_HABITS, ...state.customHabits];
    
    const filtered = allHabits.filter(h => {
        if (filter === "all") return true;
        return h.category === filter;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `<p class="section-sub text-center" style="padding: 20px;">No habits in this category.</p>`;
        return;
    }

    filtered.forEach(habit => {
        const isCompleted = !!state.completedHabits[habit.id];
        const habitDiv = document.createElement("div");
        habitDiv.className = `habit-item ${isCompleted ? "completed" : ""}`;
        habitDiv.setAttribute("role", "checkbox");
        habitDiv.setAttribute("aria-checked", isCompleted ? "true" : "false");
        habitDiv.setAttribute("tabindex", "0");
        
        const catIcons = { transport: "directions_car", energy: "bolt", food: "restaurant", consumption: "shopping_bag" };
        const catIcon = catIcons[habit.category] || "eco";
        
        const safeTitle = escapeHTML(habit.title);
        const safeCategory = escapeHTML(habit.category);
        
        habitDiv.innerHTML = `
            <div class="habit-left">
                <div class="habit-checkbox">
                    <span class="material-symbols-rounded">check</span>
                </div>
                <div class="habit-details">
                    <h4>${safeTitle}</h4>
                    <span class="habit-tag"><span class="material-symbols-rounded">${catIcon}</span> ${safeCategory}</span>
                </div>
            </div>
            <div class="habit-right">
                <span class="co2-offset">-${habit.co2} kg CO₂</span>
                <span class="xp-gain">+${habit.xp} XP</span>
            </div>
        `;
        
        habitDiv.addEventListener("click", () => {
            toggleHabit(habit);
        });
        
        habitDiv.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleHabit(habit);
            }
        });
        
        container.appendChild(habitDiv);
    });
}

function toggleHabit(habit) {
    const isCompleted = !state.completedHabits[habit.id];
    
    if (isCompleted) {
        state.completedHabits[habit.id] = true;
        state.lifetimeSaved = parseFloat((state.lifetimeSaved + habit.co2).toFixed(1));
        addXP(habit.xp);
    } else {
        delete state.completedHabits[habit.id];
        state.lifetimeSaved = parseFloat(Math.max(0, state.lifetimeSaved - habit.co2).toFixed(1));
        state.xp = Math.max(0, state.xp - habit.xp);
        checkLevelProgression();
        saveState();
        updateUIElements();
    }
    
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    renderHabits(activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all");
}

// --- Impact Simulator Logic ---
function setupSimulator() {
    const sliders = ["sim-car", "sim-energy", "sim-food", "sim-waste"];
    
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        if (slider) {
            const output = document.getElementById(id + "-val");
            slider.addEventListener("input", () => {
                output.textContent = slider.value + "%";
                updateSimulationPathway();
            });
        }
    });
}

function updateSimulationPathway() {
    const reduceCarSlider = document.getElementById("sim-car");
    const reduceEnergySlider = document.getElementById("sim-energy");
    const reduceFoodSlider = document.getElementById("sim-food");
    const reduceWasteSlider = document.getElementById("sim-waste");
    
    if (!reduceCarSlider) return;

    const reduceCar = parseFloat(reduceCarSlider.value) / 100;
    const reduceEnergy = parseFloat(reduceEnergySlider.value) / 100;
    const reduceFood = parseFloat(reduceFoodSlider.value) / 100;
    const reduceWaste = parseFloat(reduceWasteSlider.value) / 100;

    const baseTransport = state.calculatorResults.transport;
    const baseEnergy = state.calculatorResults.energy;
    const baseFood = state.calculatorResults.food;
    const baseConsumption = state.calculatorResults.consumption;
    const baseTotal = state.calculatorResults.total;

    const years = [1, 2, 3, 4, 5];
    const dataPoints = [baseTotal];
    
    for (let i = 1; i < years.length; i++) {
        const factor = i / 4;
        const yTransport = baseTransport * (1 - reduceCar * factor);
        const yEnergy = baseEnergy * (1 - reduceEnergy * factor);
        const yFood = baseFood * (1 - reduceFood * factor);
        const yConsumption = baseConsumption * (1 - reduceWaste * factor);
        const yTotal = parseFloat((yTransport + yEnergy + yFood + yConsumption).toFixed(2));
        dataPoints.push(yTotal);
    }

    const year5Total = dataPoints[4];
    const reductionPercent = baseTotal > 0 ? Math.round(((baseTotal - year5Total) / baseTotal) * 100) : 0;

    safeSetText("sim-current-val", baseTotal.toFixed(2) + " t");
    safeSetText("sim-target-val", year5Total.toFixed(2) + " t");
    safeSetText("sim-reduction-val", reductionPercent + "%");

    if (projectionChart) {
        projectionChart.data.datasets[0].data = dataPoints;
        projectionChart.update();
    }
}

// --- UI Binding and Render Systems ---
function updateUIElements() {
    const lvlIndex = Math.min(state.level - 1, ECO_LEVELS.length - 1);
    const currLvl = ECO_LEVELS[lvlIndex];
    
    // Sidebar level bindings
    safeSetText("user-level", currLvl.name);
    const xpPercent = currLvl.maxXp === Infinity ? 100 : Math.round(((state.xp - currLvl.minXp) / (currLvl.maxXp - currLvl.minXp)) * 100);
    const xpFill = document.getElementById("xp-fill");
    if (xpFill) {
        xpFill.style.width = xpPercent + "%";
    }
    safeSetText("xp-text", currLvl.maxXp === Infinity ? `${state.xp} XP` : `${state.xp - currLvl.minXp} / ${currLvl.maxXp - currLvl.minXp} XP`);

    // Achievements Badge Rendering
    const badgesGrid = document.getElementById("badges-grid");
    if (badgesGrid) {
        badgesGrid.innerHTML = "";
        ACHIEVEMENT_BADGES.forEach(badge => {
            const isUnlocked = state.unlockedBadges.includes(badge.id);
            const badgeItem = document.createElement("div");
            badgeItem.className = `badge-item ${badge.gold ? "gold" : ""} ${isUnlocked ? "unlocked" : ""}`;
            badgeItem.title = badge.desc;
            badgeItem.innerHTML = `
                <div class="badge-circle">
                    <span class="material-symbols-rounded" aria-hidden="true">${badge.icon}</span>
                </div>
                <span class="badge-title">${badge.title}</span>
            `;
            badgesGrid.appendChild(badgeItem);
        });
    }

    // Tracker UI stats updates
    safeSetText("stats-lifetime-saved", state.lifetimeSaved.toFixed(1));
    safeSetText("stats-total-xp", state.xp);
    
    const activeFilterBtn = document.querySelector(".filter-btn.active");
    renderHabits(activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all");
}

// --- Chart.js Integration System ---
function initCharts() {
    try {
        const breakdownCanvas = document.getElementById("breakdownChart");
        if (!breakdownCanvas) return;
        
        // Read active theme to apply correct text colors to labels
        const isLight = document.body.classList.contains("light-theme");
        const labelColor = isLight ? "#475569" : "#64748b";
        
        const breakdownCtx = breakdownCanvas.getContext("2d");
        breakdownChart = new Chart(breakdownCtx, {
            type: "doughnut",
            data: {
                labels: ["Transport", "Home Energy", "Diet & Food", "Consumption"],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        "#10b981",  // Emerald Green
                        "#0d9488",  // Teal
                        "#34d399",  // Mint
                        "#f59e0b"   // Amber
                    ],
                    borderWidth: 2,
                    borderColor: isLight ? "#ffffff" : "#06080d",
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: {
                        position: "bottom",
                        labels: {
                            color: labelColor,
                            font: { family: "Outfit", size: 11 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ` ${context.label}: ${context.raw.toFixed(2)} tonnes CO₂`;
                            }
                        }
                    }
                }
            }
        });

        const projectionCanvas = document.getElementById("projectionChart");
        if (!projectionCanvas) return;
        
        const gridColor = isLight ? "rgba(15, 23, 42, 0.05)" : "rgba(255, 255, 255, 0.03)";
        const projectionCtx = projectionCanvas.getContext("2d");
        const chartGradient = projectionCtx.createLinearGradient(0, 0, 0, 300);
        chartGradient.addColorStop(0, "rgba(16, 185, 129, 0.25)");
        chartGradient.addColorStop(1, "rgba(16, 185, 129, 0.0)");

        projectionChart = new Chart(projectionCtx, {
            type: "line",
            data: {
                labels: ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"],
                datasets: [{
                    label: "Simulated Emissions",
                    data: [0, 0, 0, 0, 0],
                    borderColor: "#10b981",
                    borderWidth: 3,
                    pointBackgroundColor: "#10b981",
                    pointBorderColor: isLight ? "#f8fafc" : "#06080d",
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    backgroundColor: chartGradient,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            color: labelColor,
                            font: { family: "Outfit", size: 10 },
                            callback: function(value) { return value + " t"; }
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: labelColor,
                            font: { family: "Outfit", size: 10 }
                        }
                    }
                }
            }
        });

        updateDashboardCharts();
        updateSimulatorCharts();
    } catch (e) {
        console.warn("Chart initialization failed", e);
    }
}

function updateDashboardCharts() {
    try {
        if (breakdownChart) {
            breakdownChart.data.datasets[0].data = [
                state.calculatorResults.transport,
                state.calculatorResults.energy,
                state.calculatorResults.food,
                state.calculatorResults.consumption
            ];
            breakdownChart.update();
        }
    } catch (e) {
        console.warn("Dashboard chart update failed", e);
    }
}

function updateSimulatorCharts() {
    try {
        updateSimulationPathway();
    } catch (e) {
        console.warn("Simulator chart update failed", e);
    }
}

// --- EcoBuddy AI Assistant Chatbot Engine ---
function setupChatbot() {
    const triggerBtn = document.getElementById("chat-trigger-btn");
    const chatWindow = document.getElementById("chat-window");
    const closeBtn = document.getElementById("chat-close-btn");
    const inputForm = document.getElementById("chat-input-form");
    const inputField = document.getElementById("chat-input-field");
    const msgContainer = document.getElementById("chat-messages-container");
    const suggestionChips = document.querySelectorAll(".suggestion-chip");
    const chatBadge = document.getElementById("chat-badge");

    if (!triggerBtn || !chatWindow) return;

    triggerBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("active");
        if (chatWindow.classList.contains("active")) {
            if (chatBadge) chatBadge.style.display = "none";
            if (msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatWindow.classList.remove("active");
        });
    }

    suggestionChips.forEach(chip => {
        chip.addEventListener("click", () => {
            const query = chip.getAttribute("data-query");
            submitUserMessage(query);
        });
    });

    if (inputForm && inputField) {
        inputForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const text = inputField.value.trim();
            if (text) {
                submitUserMessage(text);
                inputField.value = "";
            }
        });
    }

    setTimeout(() => {
        if (chatWindow && !chatWindow.classList.contains("active") && state.calculatorResults.total === 0) {
            if (chatBadge) chatBadge.style.display = "flex";
        }
    }, 5000);
}

function submitUserMessage(text) {
    appendMessage("user", text);
    showTypingIndicator();
    
    setTimeout(() => {
        removeTypingIndicator();
        const response = generateAIResponse(text);
        appendMessage("bot", response);
    }, 1200);
}

function appendMessage(sender, text) {
    const container = document.getElementById("chat-messages-container");
    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${sender}`;
    
    // Securely escape HTML characters to prevent script injection (XSS),
    // and safely parse basic markdown bold formatting and line breaks.
    let safeText = escapeHTML(text);
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safeText = safeText.replace(/\n/g, "<br>");
    
    bubble.innerHTML = safeText;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
    const container = document.getElementById("chat-messages-container");
    const indicator = document.createElement("div");
    indicator.className = "chat-bubble bot loading";
    indicator.id = "chat-typing-indicator";
    indicator.innerHTML = `
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    `;
    container.appendChild(indicator);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("chat-typing-indicator");
    if (indicator) {
        indicator.remove();
    }
}

function generateAIResponse(query) {
    const lower = query.toLowerCase();
    const results = state.calculatorResults;
    const total = results.total;

    // Greeting
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey") || lower.includes("namaste")) {
        return "Namaste! EcoBuddy is online and reading your context. I can analyze your calculator results, suggest checklist tasks, evaluate grid factors, or discuss how to gain XP. What should we look at?";
    }

    // 1. Full Analysis
    if (lower.includes("analyze") || lower.includes("footprint") || lower.includes("score") || lower.includes("report")) {
        if (total === 0) {
            return "Your current carbon score is 0.0 tonnes. Please go to the **Calculator** tab first and fill in your transport, LPG, and electricity parameters so I can analyze your lifestyle!";
        }
        
        let analysis = `Here is your contextual carbon footprint analysis:\n\n`;
        analysis += `• **Total Annual Emissions**: **${total.toFixed(2)} tonnes CO₂e**.\n`;
        analysis += `• **Comparison**: Your score is ${total < 1.9 ? "lower" : "higher"} than the Indian national per capita average (~1.9 tonnes).\n\n`;
        
        const categories = [
            { name: "Transportation", value: results.transport },
            { name: "Home Energy & LPG", value: results.energy },
            { name: "Diet & Food", value: results.food },
            { name: "Consumption & Waste", value: results.consumption }
        ];
        categories.sort((a, b) => b.value - a.value);
        
        analysis += `🔥 Your highest emission driver is **${categories[0].name}** at **${categories[0].value.toFixed(2)} tonnes** (${Math.round((categories[0].value/total)*100)}% of total).\n\n`;
        
        if (categories[0].name === "Transportation") {
            analysis += "💡 *Recommendation*: Since transit is your highest sector, try checking off Metro commuting or motorcycle ridesharing in the Action Center. In the Simulator, model how reducing driving by 30% shrinks your timeline.";
        } else if (categories[0].name === "Home Energy & LPG") {
            analysis += "💡 *Recommendation*: For energy savings, adjust your AC setting to 24°C, swap existing bulbs for LEDs, and consider rooftop solar panels. A solar panel offset reduces household electrical footprint by 85%!";
        } else if (categories[0].name === "Diet & Food") {
            analysis += "💡 *Recommendation*: Your diet footprint is high. Shifting from heavy meat towards pure veg or egg diets reduces agricultural footprint significantly. Also compost food waste to avoid methane production.";
        } else {
            analysis += "💡 *Recommendation*: Minimize packaging waste, sort dry goods for the local Kabadiwala to recycle, and use reusable cloth bags to eliminate single-use plastics.";
        }
        
        return analysis;
    }

    // 2. Energy / Solar / LPG
    if (lower.includes("energy") || lower.includes("electricity") || lower.includes("solar") || lower.includes("lpg") || lower.includes("bill")) {
        if (total === 0) {
            return "I need calculator data to analyze your energy profile. But as a general rule, electricity (coal-heavy grids) and LPG cylinders (42.5 kg CO2 each) make up the bulk of Indian home emissions.";
        }
        
        let response = `⚡ **Energy & Cooking Footprint**: **${results.energy.toFixed(2)} tonnes CO₂e/yr**.\n\n`;
        const regionalGrid = document.getElementById("regional-grid").value;
        const gridNames = { north: "Northern Grid", south: "Southern Grid", west: "Western Grid", east: "Eastern Grid", northeast: "North-Eastern Grid" };
        
        response += `• You are mapped to the **${gridNames[regionalGrid]}**.\n`;
        if (regionalGrid === "north" || regionalGrid === "east" || regionalGrid === "west") {
            response += `⚠️ Note: Your region relies heavily on coal power. Reducing electricity use or opting for rooftop solar will have a MASSIVE positive impact here!\n`;
        } else {
            response += `🌱 Note: Your grid region is comparatively cleaner, but conservation remains vital.\n`;
        }
        
        const solar = document.getElementById("solar-energy").checked;
        if (solar) {
            response += `• ☀️ Rooftop Solar is active! Excellent choice, it offsets 85% of your electricity carbon load.\n`;
        } else {
            response += `• ☀️ No Solar detected. Shifting to solar power can reduce your home footprint immediately.\n`;
        }

        const lpg = parseFloat(document.getElementById("lpg-cylinders").value) || 0;
        if (lpg > 1.5) {
            response += `• 🍳 LPG consumption is high (${lpg} cylinders/mo). Consider energy-efficient induction cooktops powered by green energy.`;
        }
        
        return response;
    }

    // 3. Transportation / Car / Bike / Metro
    if (lower.includes("transport") || lower.includes("car") || lower.includes("bike") || lower.includes("metro") || lower.includes("travel")) {
        if (total === 0) {
            return "To evaluate transport, please complete Step 1 of the calculator. Commuting via private petrol four-wheelers generates high carbon emissions in India compared to clean Metro systems.";
        }
        
        let response = `🚗 **Transportation Footprint**: **${results.transport.toFixed(2)} tonnes CO₂e/yr**.\n\n`;
        const carDist = parseFloat(document.getElementById("car-distance").value) || 0;
        const bikeDist = parseFloat(document.getElementById("bike-distance").value) || 0;
        
        if (carDist > 6000) {
            response += `• Private car travel is high (${carDist} km/yr). Swap some trips for Metro or carpool options.\n`;
        }
        if (bikeDist > 4000) {
            response += `• Motorcycle/scooter usage is high (${bikeDist} km/yr). Consider switching to an EV scooter (reduces fuel emission factor from 0.05 to 0.015 kg/km).\n`;
        }
        
        response += `💡 *Action*: Log "Metro Commute" or "Motorcycle pooling" in the Action Center to immediately record CO2 savings and earn XP!`;
        return response;
    }

    // 4. Diet / Food / Vegetarian
    if (lower.includes("diet") || lower.includes("food") || lower.includes("veg") || lower.includes("meat")) {
        if (total === 0) {
            return "Please fill out the food questions. In India, Pure Vegetarian diets are highly sustainable (~800 kg CO2/yr) compared to heavy non-veg diets (~2600 kg CO2/yr).";
        }
        
        let response = `🥗 **Diet & Food Footprint**: **${(results.food * 1000).toFixed(0)} kg CO₂e/yr**.\n\n`;
        const diet = document.querySelector('input[name="diet"]:checked').value;
        
        if (diet === "pure-veg") {
            response += `• 🌱 You maintain a **Pure Veg** diet. Excellent! This is one of the lowest agricultural footprints globally.\n`;
        } else if (diet === "eggetarian") {
            response += `• 🍳 You follow an **Eggetarian** style. This is highly sustainable, but vegan days can trim it further.\n`;
        } else {
            response += `• 🍗 Moderate to heavy non-vegetarian choices represent higher agricultural emissions. Swapping mutton or poultry for plant-based days saves up to 5.4 kg CO2 per day!\n`;
        }

        const waste = document.getElementById("food-waste").value;
        if (waste === "high") {
            response += `• ⚠️ High food waste creates landfill methane. Composting organic waste can offset this.`;
        }
        
        return response;
    }

    // 5. Level & XP
    if (lower.includes("level") || lower.includes("xp") || lower.includes("rank") || lower.includes("points")) {
        const lvlIndex = Math.min(state.level - 1, ECO_LEVELS.length - 1);
        const currLvl = ECO_LEVELS[lvlIndex];
        const nextLvl = ECO_LEVELS[lvlIndex + 1];
        
        let response = `🏆 **Eco Level Status**: **${currLvl.name} (Level ${state.level})**\n\n`;
        response += `• Your current total is **${state.xp} XP**.\n`;
        
        if (nextLvl) {
            const needed = nextLvl.minXp - state.xp;
            response += `• You need **${needed} XP** to sprout into a **${nextLvl.name}**.\n\n`;
            response += `💡 *Tip*: Complete daily tasks in the Action Center! High-impact habits like "Meatless Day" give +30 XP, and unlocking Achievements gives up to +100 XP!`;
        } else {
            response += `• You have reached the ultimate level: **Forest Warden**! Legendary. Keep tracking to save more CO2.`;
        }
        
        return response;
    }

    // 6. Checklist / Habits / Reduction / Advice
    if (lower.includes("checklist") || lower.includes("reduce") || lower.includes("habit") || lower.includes("action") || lower.includes("task")) {
        const allHabits = [...PRESET_HABITS, ...state.customHabits];
        const uncompleted = allHabits.filter(h => !state.completedHabits[h.id]);
        
        if (uncompleted.length === 0) {
            return "Incredible! You have completed every task in your Action Center. Try creating a custom action in the Action Center to set new carbon goals.";
        }
        
        let response = `📅 **Personalized Carbon reduction plan**:\n`;
        response += `Here are 3 high-impact actions you should log today:\n\n`;
        
        const count = Math.min(3, uncompleted.length);
        for (let i = 0; i < count; i++) {
            const h = uncompleted[i];
            response += `${i + 1}. **${h.title}** (Offset: -${h.co2} kg CO₂, Rewards: +${h.xp} XP)\n`;
        }
        
        response += `\n💡 Go to the **Action Center** tab and check them off once done to earn your EcoPoints!`;
        return response;
    }

    // Default response
    return `I understand you are asking about "${query}". I am programmed to analyze your local household carbon profile (CNG/Petrol travel, regional grids, LPG cooking cylinders, and diet). Try clicking one of the quick suggestions or ask me about "footprint analysis" or "daily checklist"!`;
}
