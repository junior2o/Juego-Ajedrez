// src/logic/TimerManager.ts

export type TimeControl = 'no-time' | 'blitz' | 'rapid' | 'classic';

const TIME_VALUES: Record<TimeControl, { base: number; increment: number }> = {
  'no-time': { base: Infinity, increment: 0 },
  blitz: { base: 3 * 60, increment: 2 },
  rapid: { base: 10 * 60, increment: 5 },
  classic: { base: 15 * 60, increment: 0 },
};

export class TimerManager {
  private whiteTime: number;
  private blackTime: number;
  private activeColor: 'white' | 'black' = 'white';
  private intervalId: number | null = null;
  private readonly increment: number;
  private updateCallback: (() => void) | null = null;

  constructor(private control: TimeControl, private onTimeout: (color: 'white' | 'black') => void) {
    const { base, increment } = TIME_VALUES[control];
    this.whiteTime = base;
    this.blackTime = base;
    this.increment = increment;
  }
  
  setUpdateCallback(callback: () => void): void {
    this.updateCallback = callback;
  }

  startTurn(color: 'white' | 'black'): void {
    this.stop();
    this.activeColor = color;
    if (this.control === 'no-time') return;
    this.intervalId = window.setInterval(() => {
      if (this.activeColor === 'white') this.whiteTime--;
      else this.blackTime--;

      this.updateCallback?.();
      if (this.getTime(color) <= 0) {
        this.stop();
        this.onTimeout(color);
      }
    }, 1000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  addIncrement(color: 'white' | 'black'): void {
    if (this.increment > 0 && this.control !== 'no-time') {
      if (color === 'white') this.whiteTime += this.increment;
      else this.blackTime += this.increment;
    }
  }

  getTime(color: 'white' | 'black'): number {
    return color === 'white' ? this.whiteTime : this.blackTime;
  }

  formatTime(seconds: number): string {
    if (seconds === Infinity) return '∞';
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  }

  getFormattedTime(color: 'white' | 'black'): string {
    return this.formatTime(this.getTime(color));
  }

  getActiveColor(): 'white' | 'black' {
    return this.activeColor;
  }

  reset(): void {
  this.stop();
  const { base } = TIME_VALUES[this.control];
  this.whiteTime = base;
  this.blackTime = base;
  this.activeColor = 'white';
}

}

export const timerManager = new TimerManager('classic', () => {});


