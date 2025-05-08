
// Audio Context singleton
class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private audioElement: HTMLAudioElement | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  public initialize(audioElement: HTMLAudioElement): void {
    if (!this.audioContext) {
      this.audioElement = audioElement;
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public resume(): void {
    this.audioContext?.resume();
  }

  public disconnect(): void {
    this.source?.disconnect();
    this.analyser?.disconnect();
  }

  public reconnect(): void {
    if (this.source && this.analyser && this.audioContext) {
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }
  }
}

export default AudioContextManager.getInstance();
