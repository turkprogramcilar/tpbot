const PORT = process.env.PORT || 3000;
const INDEX = 'www/index.html';

// https server
const express = require('express');
const server = express()
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));

// websockets server
const { Server } = require('ws');

const wss = new Server({ server });
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
});

const xss = require("xss");
module.exports.send_all = (msg) => {
    wss.clients.forEach((client) => {
        client.send(xss(msg));
    });
};