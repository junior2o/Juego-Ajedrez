// src/ui/AudioManager.ts

export class AudioManager {
  private static instance: AudioManager;
  private sounds: Record<string, HTMLAudioElement>;

  private constructor() {
    this.sounds = {
      drag: new Audio('/assets/sounds/drag.mp3'),
      capture: new Audio('/assets/sounds/capture.mp3'),
      check: new Audio('/assets/sounds/check.mp3'),
      horse: new Audio('/assets/sounds/horse.mp3'),
      move: new Audio('/assets/sounds/move.mp3'),
      error: new Audio('/assets/sounds/error.mp3'),
    };
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  play(name: keyof typeof this.sounds): void {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((e) => {
        console.warn(`[AUDIO ERROR] Fallo al reproducir '${name}':`, e);
      });
    } else {
      console.warn(`[AUDIO] Sonido no encontrado: '${name}'`);
    }
  }
}

export const audioManager = AudioManager.getInstance();
