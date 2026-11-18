// Procedural Web Audio API sound synthesizer
class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  private crowdOsc: AudioBufferSourceNode | null = null;
  private crowdGain: GainNode | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientCrowd();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public ensureContext() {
    this.initCtx();
  }

  // Soft stadium ambient crowd murmur
  private startAmbientCrowd() {
    if (!this.ctx || !this.masterGain) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        last = last * 0.95 + white * 0.05; // Pink noise
        data[i] = last;
      }

      this.crowdOsc = this.ctx.createBufferSource();
      this.crowdOsc.buffer = buffer;
      this.crowdOsc.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      this.crowdGain = this.ctx.createGain();
      this.crowdGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // gentle background

      this.crowdOsc.connect(filter);
      filter.connect(this.crowdGain);
      this.crowdGain.connect(this.masterGain);
      this.crowdOsc.start();
    } catch {
      // Ignored if browser blocks autoplay
    }
  }

  // Attack swing whoosh
  public playSwing(weaponType: string = 'fists') {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = weaponType === 'fists' ? 'triangle' : 'sine';
    const startFreq = weaponType === 'pala' || weaponType === 'tuberia' ? 240 : 360;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Weapon hit impact
  public playHit(weaponType: string = 'fists', isCrit: boolean = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Bass punch thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const startFreq = isCrit ? 180 : 130;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.15);

    gain.gain.setValueAtTime(isCrit ? 0.6 : 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.2);

    // Weapon timbre accent
    if (weaponType === 'bate' || weaponType === 'palo') {
      // Hollow wood knock
      const woodOsc = this.ctx.createOscillator();
      const woodGain = this.ctx.createGain();
      woodOsc.type = 'triangle';
      woodOsc.frequency.setValueAtTime(420, t);
      woodOsc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
      woodGain.gain.setValueAtTime(0.4, t);
      woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      woodOsc.connect(woodGain);
      woodGain.connect(this.masterGain);
      woodOsc.start(t);
      woodOsc.stop(t + 0.13);
    } else if (weaponType === 'pala' || weaponType === 'tuberia') {
      // Metallic clang
      const metalOsc = this.ctx.createOscillator();
      const metalGain = this.ctx.createGain();
      metalOsc.type = 'square';
      metalOsc.frequency.setValueAtTime(1100, t);
      metalOsc.frequency.exponentialRampToValueAtTime(320, t + 0.22);
      metalGain.gain.setValueAtTime(0.28, t);
      metalGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      metalOsc.connect(metalGain);
      metalGain.connect(this.masterGain);
      metalOsc.start(t);
      metalOsc.stop(t + 0.23);
    } else if (weaponType === 'cepillo') {
      // Bristle slap
      const noise = this.createNoise(0.1);
      if (noise) {
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, t);
        const ngain = this.ctx.createGain();
        ngain.gain.setValueAtTime(0.4, t);
        ngain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        noise.connect(filter);
        filter.connect(ngain);
        ngain.connect(this.masterGain);
        noise.start(t);
        noise.stop(t + 0.1);
      }
    }
  }

  // Helper for quick noise burst
  private createNoise(duration: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    return node;
  }

  // Weapon pickup chime
  public playPickup() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.045;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + delay);

      gain.gain.setValueAtTime(0.01, t + delay);
      gain.gain.linearRampToValueAtTime(0.18, t + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t + delay);
      osc.stop(t + delay + 0.18);
    });
  }

  // Shield armor hit absorb sound
  public playArmorHit() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Knockout / Defeat sound
  public playKO() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Deep gong
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.6);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.75);

    // Crowd cheer roar on KO!
    this.playCrowdRoar();
  }

  // Stadium crowd roar excitement
  public playCrowdRoar() {
    if (!this.enabled || !this.crowdGain || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.crowdGain.gain.setValueAtTime(0.04, t);
    this.crowdGain.gain.linearRampToValueAtTime(0.25, t + 0.2);
    this.crowdGain.gain.exponentialRampToValueAtTime(0.04, t + 1.8);
  }

  // Subtle health regeneration pulse
  public playRegenPulse() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(587.33, t + 0.18); // D5

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  // Jump sound
  public playJump() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.15);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }
}

export const sounds = new SoundEngine();
