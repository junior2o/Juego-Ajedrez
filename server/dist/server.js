"use strict";
// server/src/server.ts
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const wss = new ws_1.WebSocketServer({ port: 3000 });
const players = new Map();
console.log('[Server] WebSocket server running on ws://localhost:3000');
function sendToPlayer(playerId, message) {
    const player = players.get(playerId);
    if (player && player.socket.readyState === ws_1.WebSocket.OPEN) {
        player.socket.send(JSON.stringify(message));
    }
}
wss.on('connection', (socket) => {
    const id = (0, uuid_1.v4)();
    players.set(id, { id, socket, inGame: false });
    console.log(`[Server] New connection: ${id}`);
    socket.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            switch (msg.type) {
                case 'join_request': {
                    const target = players.get(msg.toId);
                    if (target && !target.inGame) {
                        sendToPlayer(msg.toId, msg); // forward the request
                    }
                    else {
                        sendToPlayer(msg.fromId, {
                            type: 'join_response',
                            accepted: false,
                            fromId: msg.toId,
                        });
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
                            sendToPlayer(white, {
                                type: 'start_game',
                                whiteId: white,
                                blackId: black,
                            });
                            sendToPlayer(black, {
                                type: 'start_game',
                                whiteId: white,
                                blackId: black,
                            });
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
            }
        }
        catch (err) {
            console.error('[Server] Invalid message:', data.toString());
        }
    });
    socket.on('close', () => {
        const player = players.get(id);
        if (player && player.opponentId) {
            // Notifica al oponente que este jugador se ha desconectado
            sendToPlayer(player.opponentId, {
                type: 'opponent_disconnected',
                playerId: id,
            });
            // Libera al oponente para que pueda jugar otra partida
            const opponent = players.get(player.opponentId);
            if (opponent) {
                opponent.inGame = false;
                opponent.opponentId = undefined;
            }
        }
        players.delete(id);
        console.log(`[Server] Disconnected: ${id}`);
    });
});
