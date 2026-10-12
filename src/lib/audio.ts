'use client';

// Web Audio API harmonic melody generator for cheerful birthday tunes
// Robust audio engine with Master Gain control, instant mute, and node lifecycle management

class BirthdayAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private currentCustomUrl: string | null = null;
  private activeSources: Set<OscillatorNode | AudioBufferSourceNode> = new Set();
  private listeners: Set<() => void> = new Set();

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.ctx && !this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  // Melodic notes for Happy Birthday tune
  private notes: { [key: string]: number } = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392.0,
    A4: 440.0,
    Bb4: 466.16,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
  };

  private happyBirthdayMelody = [
    { note: 'C4', duration: 0.35, pause: 0.1 },
    { note: 'C4', duration: 0.25, pause: 0.05 },
    { note: 'D4', duration: 0.5, pause: 0.1 },
    { note: 'C4', duration: 0.5, pause: 0.1 },
    { note: 'F4', duration: 0.5, pause: 0.1 },
    { note: 'E4', duration: 0.9, pause: 0.3 },

    { note: 'C4', duration: 0.35, pause: 0.1 },
    { note: 'C4', duration: 0.25, pause: 0.05 },
    { note: 'D4', duration: 0.5, pause: 0.1 },
    { note: 'C4', duration: 0.5, pause: 0.1 },
    { note: 'G4', duration: 0.5, pause: 0.1 },
    { note: 'F4', duration: 0.9, pause: 0.3 },

    { note: 'C4', duration: 0.35, pause: 0.1 },
    { note: 'C4', duration: 0.25, pause: 0.05 },
    { note: 'C5', duration: 0.6, pause: 0.1 },
    { note: 'A4', duration: 0.5, pause: 0.1 },
    { note: 'F4', duration: 0.5, pause: 0.1 },
    { note: 'E4', duration: 0.5, pause: 0.1 },
    { note: 'D4', duration: 0.8, pause: 0.3 },

    { note: 'Bb4', duration: 0.35, pause: 0.1 },
    { note: 'Bb4', duration: 0.25, pause: 0.05 },
    { note: 'A4', duration: 0.5, pause: 0.1 },
    { note: 'F4', duration: 0.5, pause: 0.1 },
    { note: 'G4', duration: 0.6, pause: 0.1 },
    { note: 'F4', duration: 1.2, pause: 1.2 },
  ];

  private playTone(freq: number, duration: number, timeOffset: number) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + timeOffset);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime + timeOffset);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + timeOffset + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + timeOffset + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      const startTime = ctx.currentTime + timeOffset;
      const stopTime = ctx.currentTime + timeOffset + duration;

      osc.start(startTime);
      osc.stop(stopTime);

      this.activeSources.add(osc);
      osc.onended = () => {
        this.activeSources.delete(osc);
      };
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  // Play fanfare when gift is opened
  public playGiftFanfare() {
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.4, idx * 0.08);
    });
  }

  // Sound effect for candle blow out
  public playCandleBlowFx() {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    try {
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      this.activeSources.add(noise);
      noise.onended = () => {
        this.activeSources.delete(noise);
      };
    } catch (e) {
      console.warn('Candle fx error:', e);
    }
  }

  // Sound effect for make-a-wish chime
  public playWishChime() {
    const ctx = this.initContext();
    if (!ctx || this.isMuted) return;

    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      this.playTone(f, 0.6, i * 0.12);
    });
  }

  // Stop all currently sounding scheduled audio nodes immediately
  private stopAllActiveSources() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    });
    this.activeSources.clear();
  }

  // Start background loop
  public playLoop(customAudioUrl?: string) {
    if (customAudioUrl) {
      this.playCustomAudio(customAudioUrl);
      return;
    }

    const ctx = this.initContext();
    if (!ctx) return;

    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.currentCustomUrl = null;

    this.isPlaying = true;
    this.stopSynthesizer();
    this.notify();

    const schedulePhrase = () => {
      if (!this.isPlaying) return;

      let currentTimeOffset = 0;
      this.happyBirthdayMelody.forEach((item) => {
        const freq = this.notes[item.note];
        if (freq) this.playTone(freq, item.duration, currentTimeOffset);
        currentTimeOffset += item.duration + item.pause;
      });

      this.timer = setTimeout(() => {
        if (this.isPlaying) schedulePhrase();
      }, currentTimeOffset * 1000);
    };

    schedulePhrase();
  }

  public playCustomAudio(url: string) {
    this.stopSynthesizer();
    this.stopAllActiveSources();
    this.currentCustomUrl = url;

    if (!this.audioElement) {
      this.audioElement = new Audio(url);
      this.audioElement.loop = true;
    } else {
      this.audioElement.src = url;
    }

    this.audioElement.muted = this.isMuted;
    this.audioElement
      .play()
      .then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch((error: unknown) => {
        console.warn('Custom birthday audio could not be played; using the built-in melody instead.', error);
        this.playLoop();
      });
  }

  private stopSynthesizer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public pause() {
    this.isPlaying = false;
    this.stopSynthesizer();
    this.stopAllActiveSources();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notify();
  }

  public resume(customAudioUrl?: string) {
    if (customAudioUrl && customAudioUrl !== this.currentCustomUrl) {
      this.playCustomAudio(customAudioUrl);
      return;
    }

    if (this.audioElement && this.currentCustomUrl) {
      this.audioElement.muted = this.isMuted;
      this.audioElement.play().then(() => {
        this.isPlaying = true;
        this.notify();
      }).catch((error: unknown) => {
        this.isPlaying = false;
        console.warn('Custom birthday audio could not be resumed.', error);
        this.notify();
      });
    } else {
      this.playLoop(customAudioUrl);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    // Apply to master gain node immediately
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }

    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
    }

    this.notify();
    return this.isMuted;
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
    };
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const birthdayAudio = new BirthdayAudioEngine();
