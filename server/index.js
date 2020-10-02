import Websocket from 'ws';
import express from 'express';

const PORT_NUMBER = 8080

const server = express()
.use(express.static(__dirname + '/../build'))
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