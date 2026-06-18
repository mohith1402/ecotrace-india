# EcoTrace India: Precision Carbon Tracker & AI-Powered Ecological Engine

[![GitHub Pages Deployment](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen.svg)](https://mohith1402.github.io/ecotrace-india/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-blue.svg)](https://nodejs.org/)
[![Docker Ready](https://img.shields.io/badge/Docker-Compatible-blue.svg)](https://www.docker.com/)

**EcoTrace India** is an advanced, high-fidelity carbon footprint tracker, ecological action engine, and context-aware AI advisor engineered specifically for the Indian socio-economic landscape. By leveraging localized emission coefficients and gamified behavioral loops, EcoTrace India empowers users to measure, analyze, simulate, and actively offset their daily carbon footprint with absolute privacy and zero server overhead.

---

## 🌟 Key Capabilities

### 1. Precision Multi-Dimensional Calculator
A detailed assessment interface that captures granular data across four primary lifestyle dimensions:
* **Transportation**: Four-wheelers (split by fuel types: Petrol, Diesel, CNG, EV), two-wheelers (Petrol vs. EV scooters), and public transit (Metro, commuter rail, and city buses).
* **Home Energy**: Conversion of utility bills (in ₹) to kilowatt-hours (kWh) using localized regional tariffs, accounting for household size, rooftop solar offsets, and direct cooking gas usage.
* **Diet & Nutrition**: Baseline evaluations adjusted for regional food supply chains, categorized into Pure Vegetarian, Eggetarian, and Non-Vegetarian pathways.
* **Waste & Recycling**: Evaluation of dry waste recycling, wet waste composting, and local sourcing offsets.

### 2. High-Fidelity Analytics Dashboard
* **Dynamic Carbon Budgeting**: Real-time feedback via a calibrated carbon gauge scaled to **4.0 tonnes $CO_2$ equivalent ($tCO_2e$) per year** (calibrated to represent double the Indian national average to highlight marginal lifestyle changes).
* **Categorized Distribution**: Interactive visual breakdowns powered by **Chart.js** displaying emissions by source.
* **Gamified Progression Engine**: An integrated Experience Point (XP) and leveling system (spanning 6 levels from *Seedling* to *Forest Warden*) alongside unlockable visual badges to incentivize persistent ecological engagement.

### 3. Interactive Habit & Action Center
* **Daily Eco-Tasks**: A verification checklist of actionable daily tasks (e.g., opting for public transit, setting air conditioners to a standard 24°C, home composting).
* **Real-time Offsetting**: Checking tasks calculates dynamic emission reductions and immediately updates the user's dashboard and XP score.
* **Custom Action Planner**: Allows users to input customized eco-habits, specify weight parameters, and integrate them into their daily tracking loops.

### 4. Dynamic Projections & Future Scenarios
* **Lifestyle Simulation**: Multi-slider control panels that let users simulate immediate or progressive changes to their travel, diets, energy consumption, and recycling habits.
* **Net-Zero Pathway Projection**: A 5-year line chart projecting individual emission trajectories against target reduction curves to visualize a clear path toward carbon neutrality.

### 5. Context-Aware AI Advisor ("EcoBuddy")
* **State-Aware Inference**: Unlike generic LLM interfaces, EcoBuddy uses a client-side inference framework that directly ingests the application's current state.
* **Hyper-Localized Insights**: It analyzes the user's highest emission categories, geographical grid profile, specific checklist completions, and current XP thresholds to generate targeted, actionable recommendations.

---

## 📐 Scientific Methodology & Coefficients

EcoTrace India relies on carbon intensity factors sourced from the **Central Electricity Authority (CEA) of India**, the **US Environmental Protection Agency (EPA)**, and the **UK Department for Environment, Food & Rural Affairs (DEFRA)**:

### 1. Home Energy & Regional Grid Coefficients
Utility costs are converted to energy consumption (kWh) using an average national baseline tariff of **₹7.0 per kWh**.
Regional electricity emissions are calculated using specific grid fuel-mix carbon intensities:
$$\text{Electricity } CO_2 = \left( \frac{\text{Monthly Bill in ₹}}{\text{Tariff (₹7/kWh)}} \times \text{Grid Intensity Factor} \times 12 \right) / \text{Household Size}$$

| Indian Regional Grid | Carbon Intensity ($kg\,CO_2e / kWh$) | Description |
| :--- | :---: | :--- |
| **Northern Grid** | `0.82` | Coal-dominated grid mix with rising solar capacity. |
| **Western Grid** | `0.80` | High industrial load, mixed thermal and renewable. |
| **Southern Grid** | `0.72` | Significant wind, solar, and nuclear integration. |
| **Eastern Grid** | `0.85` | Heavily reliant on domestic thermal coal generation. |
| **North-Eastern Grid** | `0.55` | High hydroelectric and natural gas share. |

* **LPG Cooking Gas**: Core to Indian domestic energy. Calculated at **$42.50\,kg\,CO_2e$** per standard $14.2\,kg$ LPG cylinder.
* **Rooftop Solar Offset**: Assumes an offset rate of **$-0.70\,kg\,CO_2e / kWh$** for generated green power.

### 2. Transportation Emission Coefficients
Calculated annually based on average efficiency margins and fuel combustion profiles:

| Vehicle / Transit Category | Carbon Coefficient ($kg\,CO_2 / km$) | Data Source / Basis |
| :--- | :---: | :--- |
| **Petrol Four-Wheeler** | `0.170` | Standard internal combustion engine (ICE). |
| **Diesel Four-Wheeler** | `0.190` | Heavy compression ignition engine baseline. |
| **CNG Four-Wheeler** | `0.120` | Compressed Natural Gas low-carbon alternative. |
| **Electric Four-Wheeler (EV)** | `0.060` | Reflects average Indian grid charging intensity. |
| **Petrol Two-Wheeler (Scooter)** | `0.050` | Average commuter two-wheeler factor. |
| **Electric Two-Wheeler (EV)** | `0.015` | High-efficiency electric two-wheeler commuting. |
| **Metro / Public Rail** | `0.025` | Passenger-hour baseline for mass transit. |

### 3. Dietary & Lifestyle Baselines
* **Pure Vegetarian**: **$800\,kg\,CO_2e / \text{year}$** (Lower agricultural footprint, zero direct meat supply chain impact).
* **Eggetarian**: **$1,100\,kg\,CO_2e / \text{year}$** (Includes dairy and poultry-derived products).
* **Non-Vegetarian**: **$1,800\,kg\,CO_2e / \text{year}$** (Reflects higher resource and land usage in livestock farming).
* **Local Mandi Offset**: Sourcing food locally from regional farmer markets yields an offset of **$-150\,kg\,CO_2e / \text{year}$** due to reduced transport and cold-chain storage.

---

## 💻 Tech Stack & Design Architecture

### Technical Stack
* **Frontend**: Vanilla HTML5 (semantic structure), CSS3 (custom variables, grid system, glassmorphism), JavaScript (ES6+ runtime logic).
* **Charting**: [Chart.js](https://www.chartjs.org/) (Custom configured for responsive rendering).
* **Server Layer**: Node.js & Express.js (used for microservice containerization and static serving).
* **Containerization**: Docker (multi-stage build configuration).

### Performance Optimization Standards
* **Render-Loop Stability**: Chart.js updates are debounced. UI transition animations on calculators are completely isolated during slider drag-and-drop operations to eliminate frame-rate drops.
* **Static Layering**: Replaced heavy CSS filter blurs with static ambient gradient containers to reduce GPU rendering load on mobile viewports.
* **Zero External Dependencies**: All calculations and AI interactions run fully client-side. There are no tracking scripts, database round-trips, or external API bottlenecks.

### Security & Accessibility (a11y)
* **XSS Prevention**: Strict input sanitization layer applied to all custom checklist inputs and chatbot interaction nodes, using character escaping.
* **Accessibility Compliance**: Fully integrated with HTML5 landmarks (`main`, `nav`, `section`, `aside`), high color-contrast ratios, keyboard navigation support, and descriptive `aria-hidden` configurations on decorative icons.

---

## 🛠️ Installation & Local Development

### Prerequisites
* **Node.js** (v18.0.0 or higher recommended)
* **npm** (v9.0.0 or higher)

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/mohith1402/ecotrace-india.git
   cd ecotrace-india
   ```

2. Install the devDependencies (for local Vite bundling / Express server runs):
   ```bash
   npm install
   ```

3. Run the development server using Vite:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. Alternatively, start the production Node.js Express server locally:
   ```bash
   npm start
   ```
   Navigate to `http://localhost:8080`.

---

## 🧪 Automated Testing

EcoTrace India includes an automated validation suite to test calculation engines, DOM integrity, and baseline accessibility guidelines.

Run tests using:
```bash
npm test
```

The validation suite verifies:
* Accuracy of the localized regional electricity coefficients.
* Vehicle carbon footprint calculations for four-wheelers and two-wheelers.
* Integrity of structural element IDs required for automated interactions.
* Presence of essential semantic landmarks and ARIA attributes.

---

## 🚀 Deployment Guide

This project features a **Dual-Deployment Architecture**, allowing it to be served as a static frontend edge application or as a containerized microservice.

### 1. Static Edge Deployment (GitHub Pages)
The core frontend is fully self-contained and statically served.
* **Live Deployment**: Supported directly via standard branch deployment rules.
* **Configuration**: Set up the repository settings to deploy from the root of the `main` branch.
* **Workflow Automation**: Build-and-deploy actions are defined in `.github/workflows/deploy.yml` for automated CI/CD validation on every commit.

### 2. Containerized Microservice Deployment (Google Cloud Run)
A ready-to-run multi-stage `Dockerfile` and Express server wrapper are provided for cloud environments.

#### Docker Build & Run
To build and run the container locally:
```bash
# Build the Docker image
docker build -t ecotrace-india .

# Run the container
docker run -p 8080:8080 ecotrace-india
```

#### Deploying to Google Cloud Run
Deploy directly from your command line:
```bash
# Submit build to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ecotrace-india

# Deploy to Cloud Run
gcloud run deploy ecotrace-india \
  --image gcr.io/YOUR_PROJECT_ID/ecotrace-india \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## 📄 License & Standards

This project is licensed under the [MIT License](LICENSE) - see the [LICENSE](LICENSE) file for details. Built to comply with clean code architectures, modern accessibility standards, and performant web best practices.
