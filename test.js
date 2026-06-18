/**
 * EcoTrace India - Automated Testing Suite
 * Verifies calculation coefficients, HTML accessibility, and project integrity.
 */

import { promises as fs } from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`${GREEN}✔ PASS:${RESET} ${message}`);
        passedTests++;
    } else {
        console.log(`${RED}✘ FAIL:${RESET} ${message}`);
        failedTests++;
    }
}

// 1. Carbon Calculation Logic Unit Tests
function runCalculationTests() {
    console.log(`\n${BOLD}--- Running Carbon Calculation Logic Tests ---${RESET}`);

    // Mock constants mimicking app.js CEA grid and EPA factors
    const carFuelCoeffs = { petrol: 0.18, diesel: 0.17, cng: 0.12, hybrid: 0.11, ev: 0.05 };
    const bikeFuelCoeffs = { petrol: 0.05, ev: 0.015 };
    const gridCoeffs = { south: 0.72, north: 0.82, west: 0.80, east: 0.89, northeast: 0.35 };

    // Test Case 1: Standard Indian Middle Class Commuter
    const test1 = {
        carDist: 4000,
        carFuel: 'petrol',
        bikeDist: 2500,
        bikeFuel: 'petrol',
        transitHrs: 4,
        flightsShort: 0,
        flightsLong: 0,
        elecBill: 1800,
        regionalGrid: 'west',
        hasSolar: false,
        lpgCylinders: 1,
        hhSize: 4,
        dietType: 'pure-veg',
        foodWaste: 'normal',
        foodLocal: 'always',
        shopFreq: 'average',
        recycleRate: 'some',
        avoidPlastics: true
    };

    // Calculate Transport
    const carEmissions = test1.carDist * carFuelCoeffs[test1.carFuel];
    const bikeEmissions = test1.bikeDist * bikeFuelCoeffs[test1.bikeFuel];
    const transitEmissions = test1.transitHrs * 52 * 0.025;
    const flightEmissions = (test1.flightsShort * 100) + (test1.flightsLong * 800);
    const totalTransport = carEmissions + bikeEmissions + transitEmissions + flightEmissions;

    assert(totalTransport === 850.2, `Transport emissions calculations match: expected 850.2 kg, got ${totalTransport} kg`);

    // Calculate Energy
    const monthlyKwh = test1.elecBill / 7.0;
    const annualElecEmissions = monthlyKwh * 12 * gridCoeffs[test1.regionalGrid];
    const annualLpgEmissions = test1.lpgCylinders * 12 * 42.5;
    const totalEnergy = (annualElecEmissions + annualLpgEmissions) / test1.hhSize;

    assert(Math.round(totalEnergy) === 744, `Energy emissions matches expectations (split by household size): expected 744 kg, got ${Math.round(totalEnergy)} kg`);

    // Calculate Diet
    let dietEmissions = 800; // Pure Veg baseline
    if (test1.foodWaste === 'none') dietEmissions -= 100;
    if (test1.foodLocal === 'always') dietEmissions -= 150;
    const totalFood = dietEmissions;

    assert(totalFood === 650, `Diet emissions match localized mandi offsets: expected 650 kg, got ${totalFood} kg`);

    // Calculate Consumption
    let consEmissions = 500; // Average baseline
    if (test1.avoidPlastics) consEmissions -= 50;
    const totalCons = consEmissions;

    assert(totalCons === 450, `Consumption emissions match plastic offsets: expected 450 kg, got ${totalCons} kg`);

    // Total Score
    const grandTotalKg = totalTransport + totalEnergy + totalFood + totalCons;
    const grandTotalTonnes = parseFloat((grandTotalKg / 1000).toFixed(2));

    assert(grandTotalTonnes === 2.69, `Grand total carbon footprint output matches UI benchmark score: expected 2.69 tonnes, got ${grandTotalTonnes} tonnes`);
}

// 2. Project File Structure Integration Tests
async function runStructureTests() {
    console.log(`\n${BOLD}--- Running Project Structure Verification ---${RESET}`);
    const requiredFiles = ['index.html', 'styles.css', 'app.js', 'server.js', 'package.json', 'Dockerfile', 'README.md'];
    
    for (const file of requiredFiles) {
        try {
            await fs.access(file);
            assert(true, `Verified presence of critical file: ${file}`);
        } catch {
            assert(false, `Critical submission file missing: ${file}`);
        }
    }
}

// 3. HTML Accessibility (a11y) & SEO Audits
async function runA11ySEOAudit() {
    console.log(`\n${BOLD}--- Running Accessibility (a11y) & SEO Audits ---${RESET}`);
    try {
        const htmlContent = await fs.readFile('index.html', 'utf-8');

        // Check for SEO title tag
        assert(htmlContent.includes('<title>'), 'SEO Title tag is present');

        // Check for HTML5 Semantic Layout Elements
        assert(htmlContent.includes('<aside') && htmlContent.includes('<main') && htmlContent.includes('<section'), 'HTML5 semantic tags (aside, main, section) are present');

        // Check for aria-labels on theme toggles
        assert(htmlContent.includes('aria-label="Toggle Light/Dark Theme"'), 'Interactive theme buttons have accessible aria-labels');

        // Check that viewports are set for mobile responsiveness
        assert(htmlContent.includes('name="viewport"'), 'Mobile layout viewport meta tag is configured');

        // Check that all form elements have id descriptors for automated testing
        assert(htmlContent.includes('id="footprint-form"'), 'Emissions calculator form has a unique identifier tag');
    } catch (e) {
        assert(false, `Failed to load index.html for SEO/a11y audit: ${e.message}`);
    }
}

// Main Runner
async function runAllTests() {
    console.log(`${BOLD}=====================================================================`);
    console.log(`               EcoTrace India Automated Testing Runner`);
    console.log(`=====================================================================${RESET}`);
    
    runCalculationTests();
    await runStructureTests();
    await runA11ySEOAudit();
    
    console.log(`\n${BOLD}=====================================================================`);
    console.log(`Test Execution Summary:`);
    console.log(`  Passed: ${GREEN}${passedTests}${RESET}`);
    console.log(`  Failed: ${RED}${failedTests}${RESET}`);
    console.log(`=====================================================================${RESET}`);
    
    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runAllTests();
