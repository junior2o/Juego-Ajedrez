// src/ui/AudioManager.ts

export class AudioManager {
  private sounds: Record<string, HTMLAudioElement>;

  constructor() {
    this.sounds = {
      drag: new Audio('/assets/sounds/drag.mp3'),
      capture: new Audio('/assets/sounds/capture.mp3'),
      check: new Audio('/assets/sounds/check.mp3'),
      horse: new Audio('/assets/sounds/horse.mp3'),
    };
  }

  play(name: keyof typeof this.sounds): void {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(console.error);
    }
  }
}
