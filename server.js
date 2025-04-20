async function getBlynkReadings() {
    try {
        let voltageResponse = await axios.get(`${API_URL}&pin=V0`);
        let currentResponse = await axios.get(`${API_URL}&pin=V1`);

        // Log responses to debug
        console.log("Voltage response: ", voltageResponse.data);
        console.log("Current response: ", currentResponse.data);

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
