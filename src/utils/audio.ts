// Web Audio API Procedural Sound Engine
// Provides zero-latency UI tap sound effects, ball-drawn chime, victory fanfares, and multi-track music jukebox

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private currentTrackIndex: number = 0;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;

  // Track definitions
  public readonly tracks = [
    {
      id: "gaitas-lago",
      title: "Gaita Zuliana Tradicional",
      genre: "Gaitas 🇻🇪",
      description: "Furro, charrasca y cuatro al son alegre marabino",
      tempo: 140,
      scale: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 523.25], // C Major alegre
      bassLine: [130.81, 146.83, 164.81, 174.61, 196.0],
      rhythm: [1, 0, 1, 1, 0, 1, 1, 0],
    },
    {
      id: "salsa-caracas",
      title: "Salsa de Barrio & Clásica",
      genre: "Salsa Brava 🎺",
      description: "Campana, clave 3-2 y montuno de piano caraqueño",
      tempo: 160,
      scale: [293.66, 349.23, 392.0, 440.0, 523.25, 587.33], // D Minor sabor
      bassLine: [146.83, 174.61, 220.0, 196.0],
      rhythm: [1, 1, 0, 1, 0, 1, 1, 0],
    },
    {
      id: "arpa-llanera",
      title: "Pasaje Llanero & Arpa de Oro",
      genre: "Música Llanera 🌾",
      description: "Bordón de arpa criolla, cuatro y maracas de llano adentro",
      tempo: 120,
      scale: [329.63, 392.0, 440.0, 493.88, 587.33, 659.25], // E Minor llanero
      bassLine: [164.81, 196.0, 220.0, 146.83],
      rhythm: [1, 0, 1, 0, 1, 0, 1, 1],
    },
    {
      id: "bingo-casino-lounge",
      title: "Casino Royale & Bingo Lounge",
      genre: "Lounge VIP 🎰",
      description: "Ambiente sofisticado de salón de apuestas y elegancia",
      tempo: 110,
      scale: [261.63, 311.13, 349.23, 392.0, 466.16, 523.25], // Minor Pentatonic jazz
      bassLine: [130.81, 155.56, 174.61, 196.0],
      rhythm: [1, 0, 0, 1, 0, 1, 0, 0],
    },
    {
      id: "tambores-costa",
      title: "Tambores de la Costa Caribe",
      genre: "Ritmo Costero 🥁",
      description: "Energía pura de fiesta con percusión afrocaribeña y alegría",
      tempo: 155,
      scale: [349.23, 392.0, 440.0, 523.25, 587.33, 698.46], // F Major fiesta
      bassLine: [174.61, 220.0, 261.63, 196.0],
      rhythm: [1, 1, 1, 0, 1, 1, 0, 1],
    },
  ];

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();

        this.musicGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.sfxGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        this.musicGain.connect(this.ctx.destination);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // EFFECT 1: Tactile Tap / Touch sound when user clicks any interactive element
  public playTap() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Pleasant wooden/bubble click
      osc.type = "sine";
      const startFreq = 420 + Math.random() * 80;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {}
  }

  // EFFECT 2: Ball Drawn Sound when tombola releases a new ball
  public playBallDrawn(ballNumber?: number) {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const now = ctx.currentTime;

      // 1. Mechanical clack / rolling pop
      const clack = ctx.createOscillator();
      const clackGain = ctx.createGain();
      clack.type = "triangle";
      clack.frequency.setValueAtTime(180, now);
      clack.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      clackGain.gain.setValueAtTime(0.3, now);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      clack.connect(clackGain);
      clackGain.connect(this.sfxGain);
      clack.start(now);
      clack.stop(now + 0.08);

      // 2. Resonant high chime / chime bell
      const chimeFreq = ballNumber ? 400 + (ballNumber % 30) * 18 : 659.25; // E5
      const chime1 = ctx.createOscillator();
      const chimeGain1 = ctx.createGain();
      chime1.type = "sine";
      chime1.frequency.setValueAtTime(chimeFreq, now + 0.03);
      chime1.frequency.exponentialRampToValueAtTime(chimeFreq * 1.5, now + 0.28);
      chimeGain1.gain.setValueAtTime(0.28, now + 0.03);
      chimeGain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      chime1.connect(chimeGain1);
      chimeGain1.connect(this.sfxGain);
      chime1.start(now + 0.03);
      chime1.stop(now + 0.35);

      // 3. Harmonic shimmer
      const chime2 = ctx.createOscillator();
      const chimeGain2 = ctx.createGain();
      chime2.type = "sine";
      chime2.frequency.setValueAtTime(chimeFreq * 2, now + 0.06);
      chimeGain2.gain.setValueAtTime(0.15, now + 0.06);
      chimeGain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      chime2.connect(chimeGain2);
      chimeGain2.connect(this.sfxGain);
      chime2.start(now + 0.06);
      chime2.stop(now + 0.4);
    } catch {}
  }

  // EFFECT 3: Bingo Win Fanfare
  public playBingoWin() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.12;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {}
  }

  // EFFECT 4: Coin / Purchase / Cash register sound
  public playCoin() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      gain1.gain.setValueAtTime(0.2, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.12);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(ctx.currentTime + 0.08);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // EFFECT 4B: Special Winning Ball 3D Confetti Fanfare
  public playSpecialBallFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const now = ctx.currentTime;
      // Golden celebratory arpeggio: G4 - C5 - E5 - G5 - C6 with shimmering sustain
      const arpeggio = [392.0, 523.25, 659.25, 783.99, 1046.5];
      arpeggio.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {}
  }

  // EFFECT 5: Subtle notification chime for Toast notifications
  public playToast() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.1); // D6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }

  // EFFECT 6: Warning beep when user misses opportunity or invalid claim
  public playAlert() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.setValueAtTime(260, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  // EFFECT 7: Celebratory start fanfare when countdown ends and game starts automatically
  public playGameStart() {
    if (this.isMuted) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.sfxGain) return;

      const notes = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        const startTime = ctx.currentTime + idx * 0.08;
        const dur = idx === notes.length - 1 ? 0.5 : 0.2;
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch {}
  }

  // MUSIC ENGINE: Procedural multi-track audio playback
  public playTrack(index?: number) {
    if (index !== undefined) {
      this.currentTrackIndex = (index + this.tracks.length) % this.tracks.length;
    }
    this.stopMusic();
    this.isMusicPlaying = true;

    const track = this.tracks[this.currentTrackIndex];
    const stepDurationMs = Math.round((60 / track.tempo / 2) * 1000); // 16th note timing

    this.musicStep = 0;
    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted) return;
      this.playMusicStep(track);
      this.musicStep = (this.musicStep + 1) % 32;
    }, stepDurationMs);
  }

  private playMusicStep(track: (typeof this.tracks)[0]) {
    try {
      const ctx = this.getAudioContext();
      if (!ctx || !this.musicGain) return;

      const now = ctx.currentTime;
      const stepInMeasure = this.musicStep % track.rhythm.length;

      // 1. Percussion / Beat
      if (track.rhythm[stepInMeasure] === 1) {
        const perc = ctx.createOscillator();
        const percGain = ctx.createGain();
        perc.type = "sine";
        perc.frequency.setValueAtTime(stepInMeasure % 4 === 0 ? 120 : 220, now);
        perc.frequency.exponentialRampToValueAtTime(40, now + 0.04);
        percGain.gain.setValueAtTime(0.12, now);
        percGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        perc.connect(percGain);
        percGain.connect(this.musicGain);
        perc.start(now);
        perc.stop(now + 0.04);
      }

      // 2. Bass Note on downbeats
      if (this.musicStep % 4 === 0) {
        const bassNoteIdx = Math.floor(this.musicStep / 8) % track.bassLine.length;
        const bassFreq = track.bassLine[bassNoteIdx];
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = "triangle";
        bass.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.14, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start(now);
        bass.stop(now + 0.22);
      }

      // 3. Melodic Note arpeggiated
      if (this.musicStep % 2 === 0) {
        const melodyIdx = (this.musicStep + Math.floor(this.musicStep / 6)) % track.scale.length;
        const melFreq = track.scale[melodyIdx];
        const mel = ctx.createOscillator();
        const melGain = ctx.createGain();
        mel.type = "sine";
        mel.frequency.setValueAtTime(melFreq, now);
        melGain.gain.setValueAtTime(0.08, now);
        melGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        mel.connect(melGain);
        melGain.connect(this.musicGain);
        mel.start(now);
        mel.stop(now + 0.16);
      }
    } catch {}
  }

  public pauseMusic() {
    this.stopMusic();
    this.isMusicPlaying = false;
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.pauseMusic();
      return false;
    } else {
      this.playTrack(this.currentTrackIndex);
      return true;
    }
  }

  public nextTrack(): number {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    if (this.isMusicPlaying) {
      this.playTrack(this.currentTrackIndex);
    }
    return this.currentTrackIndex;
  }

  public prevTrack(): number {
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    if (this.isMusicPlaying) {
      this.playTrack(this.currentTrackIndex);
    }
    return this.currentTrackIndex;
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  public getTrackIndex() {
    return this.currentTrackIndex;
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public setVolume(vol: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const audioEngine = new AudioManager();
