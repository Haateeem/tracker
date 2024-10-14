
const map = L.map('map').setView([0, 0], 13); // Default view at coordinates (0, 0)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

const customIcon = L.icon({
    iconUrl: 'images/location.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const userMarker = L.marker([0, 0], { icon: customIcon }).addTo(map);

function updateMapLocation(latitude, longitude) {
    userMarker.setLatLng([latitude, longitude]);
    map.setView([latitude, longitude], 13);
}

const trackerBall = document.getElementById('tracker-ball');
const trackingStatus = document.getElementById('tracking-status');

function updateTrackerBall(status) {
    if (status === true) {
        trackerBall.classList.add('on');
        trackerBall.classList.remove('off');
    } else if (status === false) {
        trackerBall.classList.add('off');
        trackerBall.classList.remove('on');
    }
}

window.addEventListener('load', () => {
    const ws = new WebSocket('wss://17d3-2400-adc1-43e-2800-ed60-f35c-5ca0-23f7.ngrok-free.app/');

    ws.onopen = () => {
        console.log('WebSocket connection established!');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'update') {
            document.getElementById('tracking-status').innerText = data.isTracking ? 'On' : 'Off';
            updateTrackerBall(data.isTracking);
        } else if (data.type === 'locationUpdate') {
            const location = data.location;
            console.log('Location received on monitor:', location);
            document.getElementById('location-coordinates').innerText = `Latitude: ${location.latitude}, Longitude: ${location.longitude}`;
            updateMapLocation(location.latitude, location.longitude); // Update map with new location
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
});


