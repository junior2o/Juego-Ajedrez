// src/main.ts

import { showIntro } from './ui/Intro';
import { showGameModeSelector } from './ui/GameModeSelector';

async function bootstrap() {
  console.log('Launching intro...');
  await showIntro(() => {
    console.log('Intro complete, showing game mode selector...');
    showGameModeSelector();
  });
}

bootstrap().catch(console.error);
