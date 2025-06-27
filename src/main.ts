// src/main.ts
console.log('Starting Chess Game Client...');
import { showGameModeSelector } from './ui/GameModeSelector';
import { WebSocketManager } from './network/WebSocketManager';
import { initWebSocketListeners } from './network/initWebSocketListeners';

initWebSocketListeners();
const host = location.hostname === 'localhost'
  ? 'ws://localhost:3000'
  : 'wss://cheess-game.onrender.com';

WebSocketManager.getInstance().connect(host);

// El menú principal se mostrará automáticamente desde el listener 'init'