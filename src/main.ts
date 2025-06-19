// src/main.ts
console.log('Starting Chess Game Client...');
import { showIntro } from './ui/Intro';
import { showGameModeSelector } from './ui/GameModeSelector';
import { WebSocketManager } from './network/WebSocketManager';
import { initWebSocketListeners } from './network/initWebSocketListeners';

 initWebSocketListeners();

async function bootstrap() {
  console.log('Launching intro...');

  WebSocketManager.getInstance().connect('ws://localhost:3000'); 
    await showIntro(() => {
    console.log('Intro complete, showing game mode selector...');
    showGameModeSelector();
  });
}

bootstrap().catch(console.error);
