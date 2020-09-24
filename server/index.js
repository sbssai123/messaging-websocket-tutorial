import Websocket from 'ws'

const PORT_NUMBER = 8080

const websocketServer = new Websocket.Server({port: PORT_NUMBER})

// When there is an established connection
websocketServer.on('connection', (wsClient) => {

    // When a message is received from a connected client
    wsClient.on('message', (message) => {

        // broadcast incoming message to all clients connected to the server
        websocketServer.clients.forEach(client => {
            // Only send to the client if its not the client sending the message
            if (client !== wsClient && client.readyState === Websocket.OPEN) {
                client.send(message);
            }
        });
    });
});