// src/main.ts
console.log('Starting Chess Game Client...');
import { showGameModeSelector } from './ui/GameModeSelector';
import { WebSocketManager } from './network/WebSocketManager';
import { initWebSocketListeners } from './network/initWebSocketListeners';

initWebSocketListeners();

WebSocketManager.getInstance().connect('ws://localhost:3000');

// El menú principal se mostrará automáticamente desde el listener 'init'