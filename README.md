# EcoTrace India - Carbon Footprint Tracker & AI Advisor

**EcoTrace India** is an interactive, premium web application built for the **Hack2Skill PromptWars Challenge 3** under the **Carbon Footprint Awareness Platform** vertical. It helps individuals understand, track, and reduce their carbon footprint through localized Indian calculations, real-time analytics, and a context-aware AI Carbon Assistant.

---

## 🏆 Hackathon Persona & Submission Information

- **Chosen Vertical**: Carbon Footprint Awareness Platform
- **Codebase Size**: $< 1 \text{ MB}$ (Strictly complies with the $<10\text{ MB}$ hackathon limit)
- **Repository Branch**: Single Branch (`main`)
- **Deployment Status**: Configured with Docker & Express, ready for continuous deployment to Google Cloud Run via Git integration.

---

## 💡 Approach & Architecture Logic

### 1. Smart Context-Aware AI Assistant ("EcoBuddy")
Instead of generic answers, **EcoBuddy** is a client-side NLP-based assistant that reads the application state in real-time. It analyzes:
* Your total score and highest emission category.
* Your specific grid location and appliance details.
* Daily habits you have or haven't checked off in the Action Center.
* Your current XP and the exact number of points needed to level up.
It uses this data to deliver hyper-specific, logical recommendations (e.g. telling you exactly which 3 tasks from your checklist to complete today to lower your highest emission category).

### 2. Localized Indian Carbon Coefficients
Calculations are tailored specifically to Indian standards using EPA, DEFRA, and Central Electricity Authority (CEA) factors:
* **Two-Wheelers**: Motorbikes/scooters represent a huge commuter share in India. We calculate Petrol scooter emissions at $0.05 \text{ kg } CO_2/\text{km}$ and EV scooters at $0.015 \text{ kg } CO_2/\text{km}$.
* **Regional Grids**: Electricity carbon intensity differs. The Western Grid (coal/solar mix) is set to $0.80 \text{ kg } CO_2/\text{kWh}$, Southern Grid is $0.72 \text{ kg } CO_2/\text{kWh}$, and Northern Grid is $0.82 \text{ kg } CO_2/\text{kWh}$.
* **LPG cooking cylinders**: Core to Indian kitchens. We calculate $42.5 \text{ kg } CO_2$ per 14.2 kg LPG cylinder.
* **Indian Diets**: Adjusted for *Pure Veg* ($800 \text{ kg } CO_2/\text{yr}$ baseline), *Eggetarian* ($1100 \text{ kg}$), and *Non-Veg* ($1800 \text{ kg}$).

---

## 🛠️ How the Solution Works

1. **Carbon Calculator (Indian Standards)**:
   * A multi-step form detailing transportation (four-wheelers, two-wheelers, metro), home energy (monthly bill in ₹, region, rooftop solar, LPG cylinders), dietary habits, and recycling.
2. **Interactive Analytics Dashboard**:
   * Displays your total score. The gauge is scaled to **4.0 tonnes** (twice the Indian national average of 1.9 tonnes/yr) to render fine-grained differences for Indian lifestyles.
   * Visualizes category splits using Chart.js.
   * Tracks XP points, Eco-Levels (Seedling to Forest Warden), and unlocks 6 distinct badges.
3. **Action Center (Habit Tracker)**:
   * A checklist of daily actions (e.g. metro commute, AC at 24°C, composting). Check them off to record actual CO₂ saved and gain XP.
   * Allows adding custom actions with personalized weights.
4. **Impact Simulator**:
   * Slide controls to simulate lifestyle modifications.
   * Renders a 5-year line chart displaying your projected pathway to Net Zero.

---

## 📋 Assumptions Made

* **Electricity tariff**: Electricity bills are converted to units (kWh) using an average tariff of **₹7.0 per kWh**.
* **Household division**: Electricity and LPG carbon emissions are divided by the number of household members to calculate personal footprint impact.
* **Public transport**: Bus/Metro is calculated at an average efficiency factor of $0.025 \text{ kg } CO_2/\text{passenger-hour}$.
* **Local Mandi offset**: Sourcing produce locally from a local Mandi reduces transport emissions by $150 \text{ kg } CO_2/\text{year}$.

---

## 🔗 Live Deployed Link

* **Deployed Cloud Run URL**: `[Insert your live Cloud Run HTTPS URL here]`
* **GitHub Repository**: Public Submission

---

## 🛡️ Hackathon Submission Highlights

* **Code Security**: Fully sanitized against Cross-Site Scripting (XSS) script injections on both custom checklists and chatbot inputs using a secure sanitization layer.
* **Accessibility (a11y)**: Built with native HTML5 semantic landmarks and custom `aria-hidden` attributes configured on all dynamic elements and decorative icons.
* **Automated Unit Testing**: Pre-configured with a validation test runner (`test.js`) that verifies calculation ratios and page tags. Can be executed by the AI evaluator using `npm test`.
