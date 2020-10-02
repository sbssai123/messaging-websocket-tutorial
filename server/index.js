const Websocket = require('ws');
const express = require('express');
var path = require('path');

const PORT_NUMBER = process.env.PORT || 8080

const server = express()
.use(express.static(path.join(__dirname, 'build')))
.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})
.listen(PORT_NUMBER, () => console.log(`Listening on ${PORT_NUMBER}`));

const wss = new Websocket.Server({server});

const heartbeatIntervals = (wsClient) => setInterval(() => heartbeat(wsClient), 10000);

// To ensure client-server connection is still alive
function heartbeat(wsClient) {
    if (wsClient.readyState !== Websocket.OPEN) return;
    wsClient.send('ping');
}

// When there is an established connection
wss.on('connection', (wsClient) => {
    // Start heartbeats
    heartbeatIntervals(wsClient);
    // When a message is received from a connected client
    wsClient.on('message', (message) => {
        if (message === "pong") {
            // pong received
            return;
        }
        // broadcast incoming message to all clients connected to the server
        wss.clients.forEach(client => {
            // Only send to the client if its not the client sending the message
            if (client !== wsClient && client.readyState === Websocket.OPEN) {
                client.send(message);
            }
        });
    });
    wsClient.on('close', () => {
        clearInterval(interval);
    });
});
