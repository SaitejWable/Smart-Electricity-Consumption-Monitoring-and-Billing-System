const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const BLYNK_TOKEN = "QhEUhcLUlVp09aXeQ37SDAkP5yHJQbSS"; // Replace with actual Blynk token
const API_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}`;

let totalEnergy = 0; // Store total energy consumption (kWh)
let lastTimestamp = Date.now(); // Store last data fetch time

// Function to fetch sensor readings from Blynk
async function getBlynkReadings() {
    try {
        let voltageResponse = await axios.get(`${API_URL}&pin=V0`);
        let currentResponse = await axios.get(`${API_URL}&pin=V1`);

        let voltage = parseFloat(voltageResponse.data) || 0;
        let current = parseFloat(currentResponse.data) || 0;
        let power = voltage * current; // Power in Watts (W)

        let currentTimestamp = Date.now();
        let timeDiffHours = (currentTimestamp - lastTimestamp) / (1000 * 3600); // Convert ms to hours
        lastTimestamp = currentTimestamp;

        let energyConsumed = (power * timeDiffHours) / 1000; // Convert W to kWh
        totalEnergy += energyConsumed; // Accumulate energy over time

        return {
            voltage: voltage.toFixed(5),
            current: current.toFixed(5),
            power: power.toFixed(5),
            energyConsumed: totalEnergy.toFixed(5), // Total energy consumption
            totalBill: (totalEnergy * 5).toFixed(2) // ₹5 per kWh
        };
    } catch (error) {
        console.error("Error fetching Blynk data:", error);
        return null;
    }
}

// API Endpoint to fetch electricity readings
app.get("/get_readings", async (req, res) => {
    let readings = await getBlynkReadings();
    if (readings) {
        res.json(readings);
    } else {
        res.status(500).json({ error: "Failed to retrieve data" });
    }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
