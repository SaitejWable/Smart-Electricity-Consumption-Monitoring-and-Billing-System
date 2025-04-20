let devices = [];
const ratePerUnit = 5; // ₹5 per kWh

// Function to fetch electricity data from backend
async function fetchReadings() {
    try {
        let response = await fetch("http://localhost:5000/get_readings");
        let data = await response.json();

        return {
            voltage: parseFloat(data.voltage),
            current: parseFloat(data.current),
            power: parseFloat(data.power),
            energy: parseFloat(data.energyConsumed),
            cost: parseFloat(data.totalBill)
        };
    } catch (error) {
        console.error("Error fetching readings:", error);
        return null;
    }
}

// Function to add a new device
async function addDevice() {
    let deviceName = document.getElementById("deviceName").value.trim();
    if (!deviceName) {
        alert("Please enter a device name!");
        return;
    }

    let readings = await fetchReadings();
    if (!readings) {
        alert("Failed to retrieve electricity readings!");
        return;
    }

    devices.push({ name: deviceName, ...readings });
    updateTable();
}

// Function to update the devices table and total bill
function updateTable() {
    let table = document.getElementById("deviceTable");
    table.innerHTML = `
        <tr>
            <th>Device Name</th>
            <th>Voltage (V)</th>
            <th>Current (A)</th>
            <th>Power (W)</th>
            <th>Units (kWh)</th>
            <th>Cost (₹)</th>
        </tr>
    `;

    let totalBill = 0;
    devices.forEach(device => {
        let row = table.insertRow();
        row.insertCell(0).innerText = device.name;
        row.insertCell(1).innerText = device.voltage.toFixed(5);
        row.insertCell(2).innerText = device.current.toFixed(5);
        row.insertCell(3).innerText = device.power.toFixed(5);
        row.insertCell(4).innerText = device.energy.toFixed(5);
        row.insertCell(5).innerText = `₹${device.cost.toFixed(2)}`;
        totalBill += device.cost;
    });

    document.getElementById("totalBill").innerText = `Total Bill: ₹${totalBill.toFixed(2)}`;
}

// Function to download the final bill as a PDF
function downloadBill() {
    let billContent = `
        <h2>Electricity Bill</h2>
        <p><strong>Consumer Name:</strong> ${document.getElementById("consumerName").value}</p>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; text-align:center;">
            <tr><th>Device Name</th><th>Voltage (V)</th><th>Current (A)</th><th>Power (W)</th><th>Units (kWh)</th><th>Cost (₹)</th></tr>
            ${devices.map(device => `<tr>
                <td>${device.name}</td>
                <td>${device.voltage.toFixed(5)}</td>
                <td>${device.current.toFixed(5)}</td>
                <td>${device.power.toFixed(5)}</td>
                <td>${device.energy.toFixed(5)}</td>
                <td>₹${device.cost.toFixed(2)}</td>
            </tr>`).join('')}
        </table>
        <h3>Total Bill: ₹${document.getElementById("totalBill").innerText.split("₹")[1]}</h3>
    `;

    let billElement = document.createElement("div");
    billElement.innerHTML = billContent;
    html2pdf().from(billElement).save("Electricity_Bill.pdf");
}
