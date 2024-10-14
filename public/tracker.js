const statusDiv = document.getElementById('status');
const toggleBtn = document.getElementById('tracker-switch');

let isTracking = false;
let watchId = null; // Declare watchId variable

function connectWebSocket() {
    const ws = new WebSocket('wss://17d3-2400-adc1-43e-2800-ed60-f35c-5ca0-23f7.ngrok-free.app/');

    ws.onopen = () => {
        console.log('WS Connected');
    };

    ws.onclose = () => {
        console.log('Connection closed, retrying in 3 seconds...');
        setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

connectWebSocket();
const ws = new WebSocket('wss://17d3-2400-adc1-43e-2800-ed60-f35c-5ca0-23f7.ngrok-free.app/');

let pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' })); // Sending a ping
    }
}, 30000);

// Function to handle location updates
function handleLocationUpdate(position) {
    const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };

    // Send location data to the monitor
    ws.send(JSON.stringify({ type: 'locationUpdate', location: locationData }));
}

// Function to start location tracking
function startTrackingLocation() {
    if (watchId === null) { // Check if tracking is already active
        watchId = navigator.geolocation.watchPosition(handleLocationUpdate, (error) => {
            console.error('Error watching location:', error);
        }, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        });
    }
}

// Function to stop location tracking
function stopTrackingLocation() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null; // Reset watchId
    }
}

// WebSocket event listeners
ws.onopen = () => {
    console.log('WebSocket connection established');
    ws.send(JSON.stringify({ type: 'getState' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'update') {
        isTracking = data.isTracking;
        statusDiv.innerText = isTracking ? 'On' : 'Off';

        // Start or stop location tracking based on isTracking state
        if (isTracking) {
            toggleBtn.classList.remove('off')
            startTrackingLocation(); // Start location tracking
        } else if (data.type === 'pong') {
            console.log('Received pong, connection is alive');
        }
        else {
            toggleBtn.classList.add('off')
            stopTrackingLocation(); // Stop location tracking
        }
    }
};

toggleBtn.addEventListener('click', () => {
    isTracking = !isTracking;
    const action = isTracking ? 'startTracking' : 'stopTracking';
    ws.send(JSON.stringify({ type: action }));
});

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

