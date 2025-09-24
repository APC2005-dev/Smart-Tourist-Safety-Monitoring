// // backend/server.js - COPY THIS ENTIRE CODE INTO YOUR server.js FILE
// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// const { body, validationResult } = require('express-validator');
// require('dotenv').config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors({
//     origin: ['http://localhost:3001', 'http://localhost:19006', 'http://localhost:8081'], // React Native and web dev servers
//     credentials: true
// }));
// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // In-memory storage for emergency alerts
// let emergencyAlerts = [];
// let alertIdCounter = 1;

// // Store connected WebSocket clients for real-time updates
// const connectedClients = new Set();

// // SSE (Server-Sent Events) for real-time updates to web dashboard
// app.get('/api/alerts/stream', (req, res) => {
//     res.writeHead(200, {
//         'Content-Type': 'text/event-stream',
//         'Cache-Control': 'no-cache',
//         'Connection': 'keep-alive',
//         'Access-Control-Allow-Origin': '*',
//         'Access-Control-Allow-Headers': 'Cache-Control'
//     });

//     // Add client to connected clients
//     connectedClients.add(res);

//     // Send initial data
//     res.write(`data: ${JSON.stringify({ type: 'connected', alertsCount: emergencyAlerts.length })}\n\n`);

//     // Handle client disconnect
//     req.on('close', () => {
//         connectedClients.delete(res);
//     });
// });

// // Function to broadcast to all connected clients
// const broadcastToClients = (data) => {
//     const message = `data: ${JSON.stringify(data)}\n\n`;
//     connectedClients.forEach(client => {
//         try {
//             client.write(message);
//         } catch (error) {
//             console.error('Error broadcasting to client:', error);
//             connectedClients.delete(client);
//         }
//     });
// };

// // Validation middleware for emergency alerts
// const validateEmergencyAlert = [
//     body('userId').notEmpty().withMessage('User ID is required'),
//     body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
//     body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
//     body('emergencyType').optional().isIn(['medical', 'accident', 'breakdown', 'security', 'other']).withMessage('Valid emergency type required'),
//     body('message').optional().isLength({ max: 500 }).withMessage('Message too long'),
// ];

// // Routes

// // Health check
// app.get('/api/health', (req, res) => {
//     res.json({ 
//         status: 'OK', 
//         timestamp: new Date().toISOString(),
//         service: 'Emergency Alert System',
//         alertsCount: emergencyAlerts.length
//     });
// });

// // Get all emergency alerts for dashboard
// app.get('/api/alerts', (req, res) => {
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const status = req.query.status;
    
//     let filteredAlerts = emergencyAlerts;
    
//     // Filter by status if provided
//     if (status) {
//         filteredAlerts = emergencyAlerts.filter(alert => alert.status === status);
//     }
    
//     // Sort by timestamp (newest first)
//     filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
//     // Pagination
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
//     res.json({
//         success: true,
//         alerts: paginatedAlerts,
//         pagination: {
//             current: page,
//             total: Math.ceil(filteredAlerts.length / limit),
//             count: paginatedAlerts.length,
//             totalAlerts: filteredAlerts.length
//         },
//         stats: {
//             active: emergencyAlerts.filter(a => a.status === 'active').length,
//             resolved: emergencyAlerts.filter(a => a.status === 'resolved').length,
//             total: emergencyAlerts.length
//         }
//     });
// });

// // Create new emergency alert - THIS IS THE MAIN ENDPOINT YOUR REACT NATIVE APP CALLS
// app.post('/api/emergency/alert', validateEmergencyAlert, (req, res) => {
//     try {
//         // Check for validation errors
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 error: 'Validation failed',
//                 details: errors.array()
//             });
//         }

//         const { userId, location, emergencyType, message, userInfo } = req.body;
        
//         // Create emergency alert object
//         const alert = {
//             id: alertIdCounter++,
//             userId,
//             location: location || { latitude: null, longitude: null, address: 'Location unavailable' },
//             emergencyType: emergencyType || 'other',
//             message: message || 'Emergency assistance needed',
//             userInfo: userInfo || {},
//             timestamp: new Date().toISOString(),
//             status: 'active',
//             priority: 'high',
//             respondedBy: null,
//             responseTime: null
//         };

//         // Store the alert
//         emergencyAlerts.unshift(alert); // Add to beginning of array
        
//         // Keep only last 100 alerts to prevent memory overflow
//         if (emergencyAlerts.length > 100) {
//             emergencyAlerts = emergencyAlerts.slice(0, 100);
//         }

//         // Log to console - YOU'LL SEE THIS IN YOUR TERMINAL
//         console.log('🚨 NEW EMERGENCY ALERT 🚨');
//         console.log('==========================');
//         console.log(`Alert ID: ${alert.id}`);
//         console.log(`User ID: ${alert.userId}`);
//         console.log(`Type: ${alert.emergencyType.toUpperCase()}`);
//         console.log(`Message: ${alert.message}`);
//         console.log(`Time: ${alert.timestamp}`);
//         console.log(`Location: ${alert.location.latitude ? `${alert.location.latitude}, ${alert.location.longitude}` : 'Not provided'}`);
//         console.log('==========================');

//         // Broadcast to connected dashboard clients in real-time
//         broadcastToClients({
//             type: 'newAlert',
//             alert: alert,
//             totalAlerts: emergencyAlerts.length
//         });

//         // Return success response to React Native app
//         res.status(201).json({
//             success: true,
//             message: 'Emergency alert created successfully',
//             alertId: alert.id,
//             timestamp: alert.timestamp
//         });

//     } catch (error) {
//         console.error('Emergency alert error:', error);
//         res.status(500).json({
//             success: false,
//             error: 'Failed to create emergency alert',
//             message: 'Internal server error'
//         });
//     }
// });

// // Get specific alert by ID
// app.get('/api/alerts/:id', (req, res) => {
//     const alertId = parseInt(req.params.id);
//     const alert = emergencyAlerts.find(a => a.id === alertId);
    
//     if (!alert) {
//         return res.status(404).json({
//             success: false,
//             error: 'Alert not found'
//         });
//     }
    
//     res.json({
//         success: true,
//         alert
//     });
// });

// // Update alert status (acknowledge/resolve)
// app.patch('/api/alerts/:id/status', [
//     body('status').isIn(['active', 'acknowledged', 'resolved', 'cancelled']).withMessage('Valid status required'),
//     body('respondedBy').optional().notEmpty().withMessage('Responder info required')
// ], (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             success: false,
//             error: 'Validation failed',
//             details: errors.array()
//         });
//     }
    
//     const alertId = parseInt(req.params.id);
//     const alert = emergencyAlerts.find(a => a.id === alertId);
    
//     if (!alert) {
//         return res.status(404).json({
//             success: false,
//             error: 'Alert not found'
//         });
//     }
    
//     const { status, respondedBy, notes } = req.body;
//     const previousStatus = alert.status;
    
//     alert.status = status;
//     alert.respondedBy = respondedBy || alert.respondedBy;
//     alert.responseTime = alert.responseTime || new Date().toISOString();
//     alert.updatedAt = new Date().toISOString();
//     alert.notes = notes || alert.notes;
    
//     console.log(`🔄 Alert ${alertId} status updated: ${previousStatus} → ${status.toUpperCase()}`);
    
//     // Broadcast status update to connected clients
//     broadcastToClients({
//         type: 'statusUpdate',
//         alertId: alertId,
//         previousStatus,
//         newStatus: status,
//         alert: alert
//     });
    
//     res.json({
//         success: true,
//         message: 'Alert status updated',
//         alert
//     });
// });

// // Get emergency statistics
// app.get('/api/alerts/stats', (req, res) => {
//     const now = new Date();
//     const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
//     const stats = {
//         total: emergencyAlerts.length,
//         active: emergencyAlerts.filter(a => a.status === 'active').length,
//         acknowledged: emergencyAlerts.filter(a => a.status === 'acknowledged').length,
//         resolved: emergencyAlerts.filter(a => a.status === 'resolved').length,
//         last24Hours: emergencyAlerts.filter(a => new Date(a.timestamp) > last24Hours).length,
//         byType: emergencyAlerts.reduce((acc, alert) => {
//             acc[alert.emergencyType] = (acc[alert.emergencyType] || 0) + 1;
//             return acc;
//         }, {})
//     };
    
//     res.json({
//         success: true,
//         stats,
//         timestamp: new Date().toISOString()
//     });
// });

// // Serve the dashboard HTML
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error('Unhandled error:', err);
//     res.status(500).json({
//         success: false,
//         error: 'Internal server error',
//         message: 'Something went wrong'
//     });
// });

// // 404 handler
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         error: 'Route not found'
//     });
// });

// // Start server
// app.listen(PORT, () => {
//     console.log('🚨 Emergency Alert System Started 🚨');
//     console.log(`Server running on port ${PORT}`);
//     console.log(`Dashboard: http://localhost:${PORT}`);
//     console.log(`API Health: http://localhost:${PORT}/api/health`);
//     console.log('=====================================');
// });

// module.exports = app;


// File: app-server.js
const express = require('express');
const fetch = require('node-fetch'); // You need to install node-fetch

const app = express();
const PORT = 4000;
const WEBSITE_BACKEND_URL = 'http://localhost:3001/api/alerts'; // The URL of our website backend

app.use(express.json());

// This is the endpoint your mobile app will send the emergency signal to
app.post('/trigger-alert', async (req, res) => {
    const alertData = req.body;
    console.log("[App Server] Received alert from mobile app:", alertData);

    try {
        // Forward the alert data to the website's backend
        console.log(`[App Server] Forwarding alert to ${WEBSITE_BACKEND_URL}`);
        const response = await fetch(WEBSITE_BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify(alertData),
            headers: { 'Content-Type': 'application/json' }
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to forward alert');
        }

        console.log('[App Server] Successfully forwarded alert. Website backend responded:', responseData);
        // Respond to the mobile app that everything was successful
        res.status(200).json({ success: true, message: 'Alert successfully sent to dashboard system.' });

    } catch (error) {
        console.error('[App Server] Error forwarding alert:', error.message);
        // Respond to the mobile app that something went wrong
        res.status(500).json({ success: false, error: 'Could not process the alert.' });
    }
});

app.listen(PORT, () => {
    console.log(`[App Server] Middleman is running on http://localhost:${PORT}`);
});