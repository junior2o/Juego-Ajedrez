"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3000;
// --- SERVIR FRONTEND ---
const staticPath = path_1.default.join(__dirname, '../../dist');
app.use(express_1.default.static(staticPath));
app.get(/.*/, (req, res) => {
    res.sendFile(path_1.default.join(staticPath, 'index.html'));
});
// --- FIN SERVIR FRONTEND ---
const wss = new ws_1.WebSocketServer({ server });
const players = new Map();
let waitingRandomPlayer = null;
console.log(`[Server] WebSocket server running on port ${PORT}`);
// Generador de ID tipo PlayerXXXXXX (único)
function generateUniquePlayerId() {
    let id;
    do {
        const randomNumber = Math.floor(100000 + Math.random() * 900000);
        id = `Player${randomNumber}`;
    } while (players.has(id));
    return id;
}
function sendToPlayer(playerId, message) {
    const player = players.get(playerId);
    if (player && player.socket.readyState === ws_1.WebSocket.OPEN) {
        console.log(`[Server] Enviando mensaje a ${playerId}:`, message);
        player.socket.send(JSON.stringify(message));
    }
    else {
        console.warn(`[Server] No se pudo enviar mensaje a ${playerId}, socket no está listo.`);
    }
}
wss.on('connection', (socket) => {
    let assignedId = null;
    socket.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            console.log('[Server] Mensaje recibido:', msg);
            switch (msg.type) {
                case 'init_with_id': {
                    const requestedId = msg.id;
                    const existingPlayer = players.get(requestedId);
                    if (!requestedId ||
                        (existingPlayer && existingPlayer.socket.readyState === ws_1.WebSocket.OPEN)) {
                        assignedId = generateUniquePlayerId();
                    }
                    else {
                        assignedId = requestedId;
                    }
                    if (assignedId !== null) {
                        players.set(assignedId, { id: assignedId, socket, inGame: false });
                        socket.send(JSON.stringify({ type: 'init', id: assignedId }));
                        console.log(`[Server] ID asignado: ${assignedId}`);
                    }
                    break;
                }
                case 'join_request': {
                    const target = players.get(msg.toId);
                    if (target && !target.inGame) {
                        console.log(`[Server] Reenviando join_request de ${msg.fromId} a ${msg.toId}`);
                        sendToPlayer(msg.toId, msg);
                    }
                    else {
                        const target = players.get(msg.toId);
                        if (!target) {
                            sendToPlayer(msg.fromId, {
                                type: 'join_response',
                                accepted: false,
                                fromId: msg.toId,
                                reason: 'not_found', // Nuevo: ID no encontrado o desconectado
                            });
                        }
                        else if (target.inGame) {
                            sendToPlayer(msg.fromId, {
                                type: 'join_response',
                                accepted: false,
                                fromId: msg.toId,
                                reason: 'in_game', // Nuevo: ya está en partida
                            });
                        }
                        else {
                            console.log(`[Server] Reenviando join_request de ${msg.fromId} a ${msg.toId}`);
                            sendToPlayer(msg.toId, msg);
                        }
                    }
                    break;
                }
                case 'join_response': {
                    if (msg.accepted) {
                        const playerA = players.get(msg.fromId);
                        const playerB = players.get(msg.toId);
                        if (playerA && playerB) {
                            playerA.inGame = true;
                            playerB.inGame = true;
                            playerA.opponentId = playerB.id;
                            playerB.opponentId = playerA.id;
                            const white = Math.random() < 0.5 ? playerA.id : playerB.id;
                            const black = white === playerA.id ? playerB.id : playerA.id;
                            console.log(`[Server] Starting game between ${white} (white) and ${black} (black)`);
                            sendToPlayer(white, { type: 'start_game', whiteId: white, blackId: black });
                            sendToPlayer(black, { type: 'start_game', whiteId: white, blackId: black });
                        }
                    }
                    sendToPlayer(msg.toId, msg);
                    break;
                }
                case 'move': {
                    const player = players.get(msg.playerId);
                    if (player && player.opponentId) {
                        sendToPlayer(player.opponentId, msg);
                    }
                    break;
                }
                case 'find_random_opponent': {
                    const player = players.get(msg.id);
                    if (!player) {
                        console.warn(`[Server] Jugador con ID ${msg.id} no encontrado para emparejamiento aleatorio.`);
                        break;
                    }
                    if (waitingRandomPlayer && waitingRandomPlayer.id !== msg.id && !waitingRandomPlayer.inGame) {
                        const playerA = waitingRandomPlayer;
                        const playerB = player;
                        playerA.inGame = true;
                        playerB.inGame = true;
                        playerA.opponentId = playerB.id;
                        playerB.opponentId = playerA.id;
                        const white = Math.random() < 0.5 ? playerA.id : playerB.id;
                        const black = white === playerA.id ? playerB.id : playerA.id;
                        sendToPlayer(white, { type: 'start_game', whiteId: white, blackId: black });
                        sendToPlayer(black, { type: 'start_game', whiteId: white, blackId: black });
                        console.log(`[Server] Emparejados aleatoriamente: ${white} (white) vs ${black} (black)`);
                        waitingRandomPlayer = null;
                    }
                    else {
                        waitingRandomPlayer = player;
                        console.log(`[Server] ${msg.id} está esperando emparejamiento aleatorio`);
                    }
                    break;
                }
            }
        }
        catch (err) {
            console.error('[Server] Invalid message:', data.toString());
        }
    });
    socket.on('close', () => {
        if (assignedId) {
            const player = players.get(assignedId);
            if (player && player.opponentId) {
                sendToPlayer(player.opponentId, {
                    type: 'opponent_disconnected',
                    playerId: assignedId,
                });
                const opponent = players.get(player.opponentId);
                if (opponent) {
                    opponent.inGame = false;
                    opponent.opponentId = undefined;
                }
            }
            players.delete(assignedId);
            console.log(`[Server] Disconnected: ${assignedId}`);
        }
    });
});
server.listen(PORT, () => {
    console.log(`[Server] Server listening on port ${PORT}`);
});
