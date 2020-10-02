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

// When there is an established connection
wss.on('connection', (wsClient) => {
    // When a message is received from a connected client
    wsClient.on('message', (message) => {
        // broadcast incoming message to all clients connected to the server
        wss.clients.forEach(client => {
            // Only send to the client if its not the client sending the message
            if (client !== wsClient && client.readyState === Websocket.OPEN) {
                client.send(message);
            }
        });
    });
});