import { showIntro } from './ui/Intro';
import { showGameModeSelector } from './ui/GameModeSelector';
import { showDifficultySelector } from './ui/DifficultySelector';
import { showIdInput } from './ui/IdInput';

async function bootstrap() {
  await showIntro(() => {
    showGameModeSelector((mode) => {
      if (mode === 'ai') {
        showDifficultySelector((level) => {
          console.log('Selected difficulty:', level);
          // TODO: Load the board with AI at selected difficulty
        });
      }

      if (mode === 'id') {
        showIdInput((playerId) => {
          console.log('Player ID entered:', playerId);
          // TODO: Load the board with multiplayer ID mode
        });
      }

      if (mode === 'random') {
        console.log('Connecting to random player...');
        // TODO: Load the board with random opponent
      }
    });
  });
}
import { showBoard } from './ui/Board';
showBoard();

bootstrap().catch(console.error);
