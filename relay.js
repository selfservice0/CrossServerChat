const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 31337 });

console.log("Relay started on port 31337");

wss.on("connection", (ws, req) => {
    const realIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    ws.on("message", raw => {
        let packet;
        try {
            packet = JSON.parse(raw.toString());
        } catch (e) {
            console.log("Invalid JSON:", raw.toString());
            return;
        }

        // Add true sender IP
        packet.serverIp = realIp;

        // Log
        console.log(
            `[${packet.serverName || "unknown"} @ ${packet.serverIp}] (${packet.channel}) ` +
            `${packet.playerName}: ${packet.message}`
        );

        const enriched = JSON.stringify(packet);

        // Broadcast
        for (const client of wss.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(enriched);
            }
        }
    });
});
