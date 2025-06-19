// src/config/MatchManager.ts

export class MatchManager {
  private static instance: MatchManager;
  private localId: string = 'esperando'; // Valor por defecto para mostrar en la UI
  private opponentId: string | null = null;
  private matchId: string | null = null;

  private constructor() {
    // Ya no generamos un ID local aquí: lo establece el servidor con 'init'
  }

  public static getInstance(): MatchManager {
    if (!MatchManager.instance) {
      MatchManager.instance = new MatchManager();
    }
    return MatchManager.instance;
  }

  public setLocalId(id: string): void {
    this.localId = id;

    // Actualizamos en tiempo real si ya se mostró la pantalla de conexión
    const display = document.getElementById('local-id-display');
    if (display) {
      display.textContent = `Tu ID: ${id}`;
    }
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
