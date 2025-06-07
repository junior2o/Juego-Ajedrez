// src/logic/GameConfigManager.ts

export type GameMode = 'ai' | 'private' | 'random' | 'online';
export type PlayerColor = 'white' | 'black';

export interface GameConfig {
  mode: GameMode;
  playerColor: PlayerColor;
  aiLevel?: 'easy' | 'medium' | 'hard';
  opponentId?: string;
}

class GameConfigManager {
  private config: GameConfig | null = null;

  setConfig(config: GameConfig) {
    this.config = config;
    window.playerColor = config.playerColor; // para compatibilidad global
  }

  getConfig(): GameConfig {
    if (!this.config) {
      throw new Error('Game configuration not set.');
    }
    return this.config;
  }

  getPlayerColor(): PlayerColor {
    if (!this.config) throw new Error('Game configuration not set.');
    return this.config.playerColor;
  }

  isAgainstAI(): boolean {
    return this.config?.mode === 'ai';
  }

  reset(): void {
    this.config = null;
    delete (window as any).playerColor;
  }
}

export const gameConfigManager = new GameConfigManager();

