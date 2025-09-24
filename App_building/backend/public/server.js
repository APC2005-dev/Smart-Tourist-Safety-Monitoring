// // File: website-server.js
// const express = require('express');
// const cors = require('cors');
// const path = require('path');

// const app = express();
// const PORT = 3000;

// app.use(cors());
// app.use(express.json());

// // --- In-memory Database & SSE Clients ---
// let alerts = [];
// let nextAlertId = 1;
// let clients = []; // For Server-Sent Events

// // --- Main Logic ---

// // Function to broadcast updates to all connected dashboards
// function sendSseUpdate(data) {
//     clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
// }

// // Endpoint for the dashboard to connect for real-time updates
// app.get('/api/alerts/stream', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     const clientId = Date.now();
//     clients.push({ id: clientId, res: res });
//     console.log(`[Website Server] Dashboard client ${clientId} connected.`);

//     req.on('close', () => {
//         clients = clients.filter(c => c.id !== clientId);
//         console.log(`[Website Server] Dashboard client ${clientId} disconnected.`);
//     });
// });

// // Endpoint for the APP's BACKEND to send new alerts TO
// app.post('/api/alerts', (req, res) => {
//     console.log('[Website Server] Received new alert from App Backend:', req.body);
//     const { userId, emergencyType, message, location } = req.body;

//     if (!userId || !emergencyType) {
//         return res.status(400).json({ success: false, error: 'Missing required alert data' });
//     }

//     const newAlert = {
//         id: nextAlertId++,
//         userId,
//         emergencyType,
//         message: message || '',
//         location: location || {},
//         timestamp: new Date().toISOString(),
//         status: 'active'
//     };

//     alerts.push(newAlert);

//     // Broadcast the new alert to all connected dashboards
//     sendSseUpdate({ type: 'newAlert', alert: newAlert });

//     res.status(201).json({ success: true, message: 'Alert received and broadcasted.', alert: newAlert });
// });

// // --- Endpoints for the Dashboard's initial load and actions ---
// app.get('/api/alerts', (req, res) => {
//     const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//     res.json({ success: true, alerts: sortedAlerts });
// });

// app.get('/api/alerts/stats', (req, res) => {
//     const stats = {
//         total: alerts.length,
//         active: alerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length,
//         resolved: alerts.filter(a => a.status === 'resolved').length,
//         last24Hours: alerts.filter(a => new Date(a.timestamp) > new Date(Date.now() - 24*60*60*1000)).length,
//     };
//     res.json({ success: true, stats: stats });
// });

// app.patch('/api/alerts/:id/status', (req, res) => {
//     const alertId = parseInt(req.params.id, 10);
//     const { status } = req.body;
//     const alert = alerts.find(a => a.id === alertId);
//     if (alert) {
//         alert.status = status;
//         sendSseUpdate({ type: 'statusUpdate', alertId: alertId, alert: alert });
//         res.json({ success: true, alert: alert });
//     } else {
//         res.status(404).json({ success: false, error: 'Alert not found' });
//     }
// });


// // Serve the dashboard HTML file
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'dashboard.html'));
// });

// app.listen(PORT, () => {
//     console.log(`[Website Server] Backend is running on http://localhost:${PORT}`);
// });

// File: app-server.js
// File: website-server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// --- In-memory Database & SSE Clients ---
let alerts = [];
let nextAlertId = 1;
let clients = []; // For Server-Sent Events

// --- Main Logic ---

// Function to broadcast updates to all connected dashboards
function sendSseUpdate(data) {
    clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

// Endpoint for the dashboard to connect for real-time updates
app.get('/api/alerts/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    clients.push({ id: clientId, res: res });
    console.log(`[Website Server] Dashboard client ${clientId} connected.`);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
        console.log(`[Website Server] Dashboard client ${clientId} disconnected.`);
    });
});

// Endpoint for the APP's BACKEND to send new alerts TO
app.post('/api/alerts', (req, res) => {
    console.log('[Website Server] Received new alert from App Backend:', req.body);
    const { userId, emergencyType, message, location } = req.body;

    if (!userId || !emergencyType) {
        return res.status(400).json({ success: false, error: 'Missing required alert data' });
    }

    const newAlert = {
        id: nextAlertId++,
        userId,
        emergencyType,
        message: message || '',
        location: location || {},
        timestamp: new Date().toISOString(),
        status: 'active'
    };

    alerts.push(newAlert);

    // Broadcast the new alert to all connected dashboards
    sendSseUpdate({ type: 'newAlert', alert: newAlert });

    res.status(201).json({ success: true, message: 'Alert received and broadcasted.', alert: newAlert });
});

// --- Endpoints for the Dashboard's initial load and actions ---
app.get('/api/alerts', (req, res) => {
    const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, alerts: sortedAlerts });
});

app.get('/api/alerts/stats', (req, res) => {
    const stats = {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active' || a.status === 'acknowledged').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        last24Hours: alerts.filter(a => new Date(a.timestamp) > new Date(Date.now() - 24*60*60*1000)).length,
    };
    res.json({ success: true, stats: stats });
});

app.patch('/api/alerts/:id/status', (req, res) => {
    const alertId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = status;
        sendSseUpdate({ type: 'statusUpdate', alertId: alertId, alert: alert });
        res.json({ success: true, alert: alert });
    } else {
        res.status(404).json({ success: false, error: 'Alert not found' });
    }
});


// Serve the dashboard HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.listen(PORT, () => {
    console.log(`[Website Server] Backend is running on http://localhost:${PORT}`);
});