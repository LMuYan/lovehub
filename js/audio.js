/**
 * 浪漫和弦与音乐发生器 (Web Audio API 纯代码合成八音盒和弦 + 外部音频双模式)
 */

class RomanticAudio {
  constructor() {
    this.isPlaying = false;
    this.audioCtx = null;
    this.timer = null;
    this.externalAudio = null;
    this.musicBtn = document.getElementById("music-toggle-btn");

    // 浪漫八音盒和弦音阶 (Canon in D / Pentatonic / C-G-Am-Em-F-C-F-G 经典和弦音符频率)
    this.notes = [
      // 根音与高音旋律频率 (Hz)
      523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50
    ];
    this.melodyPattern = [
      0, 2, 4, 7, 4, 2,
      1, 3, 5, 7, 5, 3,
      2, 4, 6, 7, 6, 4,
      0, 2, 4, 5, 4, 2
    ];
    this.currentStep = 0;

    this.init();
  }

  init() {
    if (this.musicBtn) {
      this.musicBtn.addEventListener("click", () => this.toggleMusic());
    }

    // 首次与页面产生交互时，准备 AudioContext 解锁
    const unlockAudio = () => {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.audioCtx = new AudioContext();
        }
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
  }

  toggleMusic() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }

    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    this.isPlaying = true;
    if (this.musicBtn) {
      this.musicBtn.classList.add("playing");
      this.musicBtn.title = "点击暂停音乐";
    }

    // 启动柔和八音盒和弦循环
    this.playNextNote();
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.musicBtn) {
      this.musicBtn.classList.remove("playing");
      this.musicBtn.title = "点击播放浪漫音乐";
    }
  }

  playNextNote() {
    if (!this.isPlaying || !this.audioCtx) return;

    try {
      const noteIdx = this.melodyPattern[this.currentStep % this.melodyPattern.length];
      const freq = this.notes[noteIdx % this.notes.length];

      // 创建正弦波振荡器 (清脆柔和的八音盒/铃音质感)
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      // 柔和淡入与延音衰减包络
      const now = this.audioCtx.currentTime;
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.95);

      this.currentStep++;
      // 每 380ms 播放一个音符
      this.timer = setTimeout(() => this.playNextNote(), 380);
    } catch (e) {
      console.warn("Audio playback error:", e);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.romanticAudio = new RomanticAudio();
});
