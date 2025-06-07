// src/config/MatchManager.ts
export class MatchManager {
  private static instance: MatchManager;
  private localId: string = '';
  private opponentId: string | null = null;
  private matchId: string | null = null;

  private constructor() {
    this.localId = this.generateId();
  }

  public static getInstance(): MatchManager {
    if (!MatchManager.instance) {
      MatchManager.instance = new MatchManager();
    }
    return MatchManager.instance;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  public getLocalId(): string {
    return this.localId;
  }

  public setOpponentId(id: string): void {
    this.opponentId = id;
  }

  public getOpponentId(): string | null {
    return this.opponentId;
  }

  public setMatchId(id: string): void {
    this.matchId = id;
  }

  public getMatchId(): string | null {
    return this.matchId;
  }

  public reset(): void {
    this.opponentId = null;
    this.matchId = null;
  }
}
