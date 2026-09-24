// Audio con la Web Audio API del navegador (sin Babylon): efectos sintetizados por código
// y música con intro + loop sin cortes (AudioBufferSourceNode con loopStart/loopEnd).

const MUSIC_LEVEL = 0.6; // música un poco por debajo de los efectos
const SFX_LEVEL = 1;

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private volume = 1;
  private music: AudioBuffer | null = null;
  private musicLoop = { start: 0, end: 0 };
  private musicStarted = false;

  /**
   * Crea o reanuda el contexto. El navegador solo permite sonar después de una interacción
   * del usuario, así que se llama al capturar el mouse (que viene de un click).
   */
  resume(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.musicBus = this.bus(MUSIC_LEVEL);
      this.sfxBus = this.bus(SFX_LEVEL);
    }
    void this.ctx.resume();
    this.startMusicIfReady();
  }

  /** Congela todo el audio (pausa). */
  suspend(): void {
    void this.ctx?.suspend();
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.ctx) this.master.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
  }

  /**
   * Carga la música. `loopStart`/`loopEnd` en segundos: la intro suena una vez y después se
   * repite el tramo entre ambos. loopEnd = 0 significa "hasta el final del archivo".
   */
  async loadMusic(url: string, loopStart = 0, loopEnd = 0): Promise<void> {
    const data = await (await fetch(url)).arrayBuffer();
    // decodeAudioData necesita un contexto; uno offline alcanza y no requiere interacción.
    this.music = await new OfflineAudioContext(2, 1, 44100).decodeAudioData(data);
    this.musicLoop = { start: loopStart, end: loopEnd || this.music.duration };
    this.startMusicIfReady();
  }

  shoot(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    // "Pew" retro: onda cuadrada que cae de agudo a grave muy rápido.
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(900 * jitter(0.08), t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.09);
    this.play(osc, envelope(ctx, t, 0.18, 0.005, 0.1), t, 0.11);
  }

  /** Impacto que no mata: un "tic" seco. */
  hit(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(260 * jitter(0.1), t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.04);
    this.play(osc, envelope(ctx, t, 0.25, 0.002, 0.05), t, 0.06);
  }

  /** Chillido al morir. Las ratas grandes chillan más grave. */
  squeak(ratSize: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime;
    const pitch = (2 / ratSize) * jitter(0.15);
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    // Sube de golpe y cae: "¡iiik!".
    osc.frequency.setValueAtTime(1500 * pitch, t);
    osc.frequency.exponentialRampToValueAtTime(2600 * pitch, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(1100 * pitch, t + 0.2);
    // Vibrato rápido para que suene a bicho y no a pitido.
    const lfo = ctx.createOscillator();
    const lfoDepth = ctx.createGain();
    lfo.frequency.value = 38;
    lfoDepth.gain.value = 180 * pitch;
    lfo.connect(lfoDepth).connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.24);
    this.play(osc, envelope(ctx, t, 0.3, 0.01, 0.22), t, 0.24);
  }

  private bus(level: number): GainNode {
    const gain = this.ctx!.createGain();
    gain.gain.value = level;
    gain.connect(this.master);
    return gain;
  }

  private play(source: OscillatorNode, env: GainNode, start: number, duration: number): void {
    source.connect(env).connect(this.sfxBus);
    source.start(start);
    source.stop(start + duration);
  }

  private startMusicIfReady(): void {
    if (!this.ctx || !this.music || this.musicStarted) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.music;
    source.loop = true;
    source.loopStart = this.musicLoop.start;
    source.loopEnd = this.musicLoop.end;
    source.connect(this.musicBus);
    source.start();
    this.musicStarted = true;
  }
}

/** Envolvente de volumen: sube en `attack` segundos y se apaga en `decay`. */
function envelope(ctx: AudioContext, t: number, peak: number, attack: number, decay: number): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  return gain;
}

/** Factor al azar alrededor de 1 (±amount) para que los sonidos repetidos no suenen idénticos. */
function jitter(amount: number): number {
  return 1 + (Math.random() * 2 - 1) * amount;
}
