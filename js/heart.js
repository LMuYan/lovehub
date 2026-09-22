/**
 * 视觉特效引擎：粒子爱心、点击心形烟花、鼠标拖尾光芒、星空流星雨
 */

class RomanticVisuals {
  constructor() {
    this.canvasHeart = document.getElementById("canvas-heart");
    this.ctxHeart = this.canvasHeart ? this.canvasHeart.getContext("2d") : null;
    this.canvasStars = document.getElementById("canvas-stars");
    this.ctxStars = this.canvasStars ? this.canvasStars.getContext("2d") : null;

    this.particles = [];
    this.sparkles = [];
    this.stars = [];
    this.meteors = [];

    this.init();
  }

  init() {
    if (!this.ctxHeart) return;
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // 鼠标与触屏跟随光芒
    window.addEventListener("mousemove", (e) => this.addSparkle(e.clientX, e.clientY));
    window.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) {
        this.addSparkle(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // 点击产生心形烟花特效
    window.addEventListener("click", (e) => {
      // 避免某些特定按钮事件冲突，直接全屏粒子响应
      this.createHeartBurst(e.clientX, e.clientY);
    });

    // 初始化星空
    this.initStars();

    // 启动动画主循环
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvasHeart.width = this.width;
    this.canvasHeart.height = this.height;
    if (this.canvasStars) {
      this.canvasStars.width = this.width;
      this.canvasStars.height = this.height;
      this.initStars();
    }
  }

  initStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 8000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.005
      });
    }
  }

  addSparkle(x, y) {
    // 鼠标拖尾微光
    if (Math.random() < 0.6) {
      this.sparkles.push({
        x,
        y,
        size: Math.random() * 5 + 3,
        alpha: 1,
        color: Math.random() > 0.5 ? "#ff6584" : "#ffb703",
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5 - 0.8
      });
    }
  }

  createHeartBurst(x, y, count = 18) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      const speed = Math.random() * 4 + 2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 8 + 6,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.015,
        color: ["#ff3366", "#ff6584", "#ff8fa3", "#ffb703", "#c084fc"][Math.floor(Math.random() * 5)]
      });
    }
  }

  drawHeart(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.beginPath();
    const d = size / 2;
    ctx.moveTo(0, d / 4);
    ctx.quadraticCurveTo(0, 0, d / 2, 0);
    ctx.quadraticCurveTo(d, 0, d, d / 2);
    ctx.quadraticCurveTo(d, d, 0, d * 1.5);
    ctx.quadraticCurveTo(-d, d, -d, d / 2);
    ctx.quadraticCurveTo(-d, 0, -d / 2, 0);
    ctx.quadraticCurveTo(0, 0, 0, d / 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 绘制心脏/粒子层
    this.ctxHeart.clearRect(0, 0, this.width, this.height);

    // 1. 拖尾光斑
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.025;
      if (s.alpha <= 0) {
        this.sparkles.splice(i, 1);
        continue;
      }
      this.ctxHeart.save();
      this.ctxHeart.globalAlpha = s.alpha;
      this.ctxHeart.fillStyle = s.color;
      this.ctxHeart.beginPath();
      this.ctxHeart.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctxHeart.fill();
      this.ctxHeart.restore();
    }

    // 2. 爱心爆炸粒子
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // 微弱重力
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.drawHeart(this.ctxHeart, p.x, p.y, p.size, p.color, p.alpha);
    }

    // 3. 星空与流星绘制
    if (this.ctxStars && document.body.getAttribute("data-theme") === "night") {
      this.ctxStars.clearRect(0, 0, this.width, this.height);

      // 绘制星星闪烁
      for (let star of this.stars) {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0.2) star.speed = -star.speed;
        this.ctxStars.save();
        this.ctxStars.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
        this.ctxStars.beginPath();
        this.ctxStars.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctxStars.fill();
        this.ctxStars.restore();
      }

      // 偶尔生成流星
      if (Math.random() < 0.015 && this.meteors.length < 3) {
        this.meteors.push({
          x: Math.random() * this.width,
          y: Math.random() * (this.height * 0.4),
          length: Math.random() * 80 + 50,
          speed: Math.random() * 8 + 6,
          alpha: 1
        });
      }

      // 绘制流星
      for (let i = this.meteors.length - 1; i >= 0; i--) {
        const m = this.meteors[i];
        m.x += m.speed;
        m.y += m.speed * 0.6;
        m.alpha -= 0.02;
        if (m.alpha <= 0) {
          this.meteors.splice(i, 1);
          continue;
        }
        this.ctxStars.save();
        this.ctxStars.strokeStyle = `rgba(255, 255, 255, ${m.alpha})`;
        this.ctxStars.lineWidth = 2;
        this.ctxStars.beginPath();
        this.ctxStars.moveTo(m.x, m.y);
        this.ctxStars.lineTo(m.x - m.length, m.y - m.length * 0.6);
        this.ctxStars.stroke();
        this.ctxStars.restore();
      }
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.romanticVisuals = new RomanticVisuals();
});
