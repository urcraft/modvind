/** Original, locally synthesized soundtrack. No downloads or autoplay before interaction. */
export class GameAudio {
  muted = false;
  private context?: AudioContext;
  private master?: GainNode;
  private music?: GainNode;
  private nextBeat = 0;
  private beat = 0;
  private playing = false;
  constructor() {
    try { this.muted = localStorage.getItem('modvind-muted') === 'true'; } catch {}
  }
  unlock() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : .32;
        this.master.connect(this.context.destination);
        this.music = this.context.createGain();
        this.music.gain.value = 0;
        this.music.connect(this.master);
      }
      void this.context.resume().catch(() => {});
    } catch { /* Audio is optional; unavailable devices must not interrupt play. */ }
  }
  toggle() {
    this.muted = !this.muted;
    this.unlock();
    if (this.context && this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : .32, this.context.currentTime, .02);
    try { localStorage.setItem('modvind-muted', String(this.muted)); } catch {}
  }
  private tone(frequency: number, at: number, duration: number, volume: number, type: OscillatorType = 'triangle', music = false, endFrequency = frequency) {
    const ctx = this.context;
    const target = music ? this.music : this.master;
    if (!ctx || !target) return;
    const oscillator = ctx.createOscillator(), envelope = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(volume, at + .008);
    envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(envelope); envelope.connect(target);
    oscillator.start(at); oscillator.stop(at + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  setPlaying(playing: boolean) {
    if (playing === this.playing) return;
    this.playing = playing;
    if (!this.context || !this.music) return;
    const now = this.context.currentTime;
    this.music.gain.cancelScheduledValues(now);
    this.music.gain.setTargetAtTime(playing ? 1 : 0, now, .025);
    this.nextBeat = now + .04;
    if (playing) this.beat = 0;
  }
  update(boosted: boolean) {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running' || !this.playing || this.muted) return;
    if (this.nextBeat < ctx.currentTime) this.nextBeat = ctx.currentTime;
    // A light, cycling eighth-note melody over a four-chord bass loop (112 BPM).
    const melody = [0, 7, 12, 7, 4, 7, 14, 12, 0, 7, 12, 16, 14, 7, 4, 7];
    const roots = [48, 45, 53, 55];
    while (this.nextBeat < ctx.currentTime + .1) {
      const root = roots[Math.floor(this.beat / 16) % roots.length];
      const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
      this.tone(hz(root + 12 + melody[this.beat % 16]), this.nextBeat, .19, .12, boosted ? 'square' : 'triangle', true);
      if (this.beat % 4 === 0) this.tone(hz(root - 12), this.nextBeat, .45, .22, 'sine', true);
      if (this.beat % 2 === 0) this.tone(110, this.nextBeat, .09, .16, 'sine', true, 40);
      this.beat++; this.nextBeat += 60 / 112 / 2;
    }
  }
  effect(kind: 'lane' | 'hit' | 'pickup' | 'win' | 'lose') {
    if (!this.context || this.muted) return;
    const now = this.context.currentTime;
    if (kind === 'lane') this.tone(330, now, .08, .12, 'sine', false, 520);
    if (kind === 'hit') this.tone(150, now, .25, .5, 'sawtooth', false, 35);
    const notes = kind === 'pickup' ? [659, 880, 1319] : kind === 'win' ? [523, 659, 784, 1047] : kind === 'lose' ? [392, 330, 262, 196] : [];
    notes.forEach((note, i) => this.tone(note, now + i * .12, .3, .3));
  }
}
