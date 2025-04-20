const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Default route to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const BLYNK_TOKEN = "QhEUhcLUlVp09aXeQ37SDAkP5yHJQbSS";
const API_URL = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}`;

let totalEnergy = 0;
let lastTimestamp = Date.now();

async function getBlynkReadings() {
    try {
        let voltageResponse = await axios.get(`${API_URL}&pin=V0`);
        let currentResponse = await axios.get(`${API_URL}&pin=V1`);

        let voltage = parseFloat(voltageResponse.data) || 0;
        let current = parseFloat(currentResponse.data) || 0;
        let power = voltage * current;

        let currentTimestamp = Date.now();
        let timeDiffHours = (currentTimestamp - lastTimestamp) / (1000 * 3600);
        lastTimestamp = currentTimestamp;

        let energyConsumed = (power * timeDiffHours) / 1000;
        totalEnergy += energyConsumed;

        return {
            voltage: voltage.toFixed(5),
            current: current.toFixed(5),
            power: power.toFixed(5),
            energyConsumed: totalEnergy.toFixed(5),
            totalBill: (totalEnergy * 5).toFixed(2)
        };
    } catch (error) {
        console.error("Error fetching Blynk data:", error);
        return null;
    }
}

app.get("/get_readings", async (req, res) => {
    let readings = await getBlynkReadings();
    if (readings) {
        res.json(readings);
    } else {
        res.status(500).json({ error: "Failed to retrieve data" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
