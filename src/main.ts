// src/main.ts

import { showIntro } from './ui/Intro';
import { showGameModeSelector } from './ui/GameModeSelector';
import { WebSocketManager } from './network/WebSocketManager';
import { initWebSocketListeners } from './network/initWebSocketListeners';

async function bootstrap() {
  console.log('Launching intro...');

  WebSocketManager.getInstance().connect('ws://localhost:3000'); 
 
  initWebSocketListeners();

    await showIntro(() => {
    console.log('Intro complete, showing game mode selector...');
    showGameModeSelector();
  });
}

bootstrap().catch(console.error);
