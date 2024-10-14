const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let isTracking = false;

app.use(bodyParser.json());
app.use(express.static('public'));

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.send(JSON.stringify({ type: 'update', isTracking }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'startTracking') {
            isTracking = true;
        } else if (data.type === 'stopTracking') {
            isTracking = false;
        } else if (data.type === 'locationUpdate') {
            const location = data.location;
            console.log('Location received on server:', location);

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'locationUpdate', location }));
                }
            });
        } else if (data.type === 'ping') {
            ws.send(JSON.stringify({ type: 'pong' }));
        }

        // Broadcast to all clients (if needed)
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'update',
                    isTracking,
                }));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});


server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
