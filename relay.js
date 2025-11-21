const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 31337 });

console.log("GlobalChat Relay started on port 31337");

wss.on("connection", ws => {
    ws.on("message", data => {
        let packet;

        try {
            packet = JSON.parse(data.toString());
        } catch (e) {
            console.log("Invalid JSON received:", data.toString());
            return;
        }

        // Extract values with fallbacks
        const ip     = packet.server_ip   || "unknown-ip";
        const name   = packet.server_name || "unknown-server";
        const player = packet.player_name || "unknown-player";
        const uuid   = packet.player_uuid || "unknown-uuid";
        const chan   = packet.channel     || "unknown-channel";
        const msg    = packet.message     || "";

        // Log to relay console
        console.log(
            `[${name} @ ${ip}] (${chan}) ${player} [${uuid}] → ${msg}`
        );

        // Broadcast packet unchanged
        const outgoing = JSON.stringify(packet);

        for (const client of wss.clients) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(outgoing);
            }
        }
    });

    ws.on("close", () => {
        console.log("A server disconnected.");
    });
});
