// server/server.ts

import { WebSocketServer, WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';

interface Player {
  id: string;
  socket: WebSocket;
  inGame: boolean;
}

const wss = new WebSocketServer({ port: 3000 });
const players: Map<string, Player> = new Map();

console.log('[Server] WebSocket server running on ws://localhost:3000');

function sendToPlayer(playerId: string, message: any) {
  const player = players.get(playerId);
  if (player && player.socket.readyState === WebSocket.OPEN) {
    player.socket.send(JSON.stringify(message));
  }
}

wss.on('connection', (socket) => {
  const id = uuidv4();
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
          } else {
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
          const opponent = [...players.values()].find(p => p.id !== msg.playerId && p.inGame);
          if (opponent) sendToPlayer(opponent.id, msg);
          break;
        }
      }
    } catch (err) {
      console.error('[Server] Invalid message:', data.toString());
    }
  });

  socket.on('close', () => {
    players.delete(id);
    console.log(`[Server] Disconnected: ${id}`);
  });
});
