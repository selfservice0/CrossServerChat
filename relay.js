const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 31337 });

console.log("GlobalChat Relay started on port 31337");

wss.on("connection", ws => {
    ws.on("message", data => {
        // rebroadcast to all other servers
        for (const client of wss.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        }
    });
});
