/**
 * 核心交互逻辑驱动器
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.LOVE_CONFIG;
  if (!config) {
    console.error("Config not found!");
    return;
  }

  // 1. 动态渲染文本与标题
  initDynamicTexts(config);

  // 2. 主题切换 (日间甜蜜 / 夜间星空)
  initThemeToggle();

  // 3. 恋爱纪念日计时器
  initLoveTimer(config.startDate);

  // 4. 第一幕：心情打卡站与急救包
  initMoodStation(config.moodPresets);

  // 5. 第一幕：彩虹屁扭蛋机
  initRainbowFart(config.rainbowCompliments);

  // 6. 第二幕：求生欲小测试与逃跑按钮
  initQuiz(config.quizList);

  // 7. 第二幕：特权兑换券
  initCoupons(config.coupons, config.boyName);

  // 8. 第三幕：拍立得回忆长廊
  initPolaroids(config.memories);

  // 9. 第三幕：打字机手写情书
  initLoveLetter(config.loveLetter);

  // 10. 弹窗控制绑定
  initModal();
});

// 动态文字填充
function initDynamicTexts(config) {
  document.title = `${config.girlName}专属 · 心动快乐补给站 ❤️`;
  
  const heroTitle = document.getElementById("hero-title");
  if (heroTitle) heroTitle.innerText = `${config.girlName}的专属心动空间`;

  const heroSubtitle = document.getElementById("hero-subtitle");
  if (heroSubtitle) heroSubtitle.innerText = `${config.boyName}为最爱的${config.girlNickname}特别定制`;

  const footerText = document.getElementById("footer-text");
  if (footerText) {
    footerText.innerHTML = `Created with all love by <strong>${config.boyName}</strong> for <strong>${config.girlName}</strong> (老婆/宝宝)`;
  }
}

// 主题模式切换
function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (!themeBtn) return;

  const currentTheme = localStorage.getItem("love_theme") || "day";
  document.body.setAttribute("data-theme", currentTheme);
  themeBtn.innerText = currentTheme === "night" ? "☀️" : "🌙";

  themeBtn.addEventListener("click", () => {
    const isNight = document.body.getAttribute("data-theme") === "night";
    const nextTheme = isNight ? "day" : "night";
    document.body.setAttribute("data-theme", nextTheme);
    themeBtn.innerText = nextTheme === "night" ? "☀️" : "🌙";
    localStorage.setItem("love_theme", nextTheme);

    // 触发心形粒子
    if (window.romanticVisuals) {
      const rect = themeBtn.getBoundingClientRect();
      window.romanticVisuals.createHeartBurst(rect.x + 22, rect.y + 22, 24);
    }
  });
}

// 纪念日计时器
function initLoveTimer(startDateStr) {
  const start = new Date(startDateStr.replace(/-/g, "/")).getTime();
  const dEl = document.getElementById("time-days");
  const hEl = document.getElementById("time-hours");
  const mEl = document.getElementById("time-minutes");
  const sEl = document.getElementById("time-seconds");

  function update() {
    const now = new Date().getTime();
    let diff = Math.max(0, now - start);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    if (dEl) dEl.innerText = days;
    if (hEl) hEl.innerText = String(hours).padStart(2, "0");
    if (mEl) mEl.innerText = String(minutes).padStart(2, "0");
    if (sEl) sEl.innerText = String(seconds).padStart(2, "0");
  }

  update();
  setInterval(update, 1000);
}

// 心情打卡机
function initMoodStation(presets) {
  const container = document.getElementById("mood-grid");
  if (!container || !presets) return;

  container.innerHTML = "";
  presets.forEach(p => {
    const btn = document.createElement("div");
    btn.className = "mood-btn";
    btn.innerHTML = `
      <div class="mood-emoji">${p.emoji}</div>
      <div class="mood-text">${p.label}</div>
    `;
    btn.addEventListener("click", (e) => {
      if (window.romanticVisuals) {
        window.romanticVisuals.createHeartBurst(e.clientX, e.clientY, 20);
      }
      showModal(p.title, p.text, p.actionText);
    });
    container.appendChild(btn);
  });
}

// 彩虹屁扭蛋机
function initRainbowFart(compliments) {
  const fartBtn = document.getElementById("fart-btn");
  const fartResult = document.getElementById("fart-result");
  if (!fartBtn || !compliments) return;

  let lastIndex = -1;

  fartBtn.addEventListener("click", (e) => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * compliments.length);
    } while (newIndex === lastIndex && compliments.length > 1);
    lastIndex = newIndex;

    const text = compliments[newIndex];
    if (fartResult) {
      fartResult.style.opacity = "0";
      setTimeout(() => {
        fartResult.innerText = `✨ “${text}” ✨`;
        fartResult.style.opacity = "1";
      }, 150);
    }

    if (window.romanticVisuals) {
      window.romanticVisuals.createHeartBurst(e.clientX, e.clientY, 25);
    }
  });
}

// 求生欲小测试（逃跑按钮）
function initQuiz(quizList) {
  let currentIndex = 0;
  const questionEl = document.getElementById("quiz-question");
  const btnA = document.getElementById("quiz-btn-a");
  const btnB = document.getElementById("quiz-btn-b");
  const actionArea = document.getElementById("quiz-action-area");

  if (!questionEl || !btnA || !btnB || !quizList || quizList.length === 0) return;

  let runawayCount = 0;
  const runawayPhrases = ["抓不到我吧~", "快选史晓维！", "按钮逃跑啦！", "只能选A啦！", "别挣扎啦！"];

  function renderCurrentQuiz() {
    runawayCount = 0;
    btnB.style.position = "static";
    btnB.style.transform = "none";
    
    const cur = quizList[currentIndex];
    questionEl.innerText = cur.question;
    btnA.innerText = cur.optionA;
    btnB.innerText = cur.optionB;
  }

  // 逃跑机制：当鼠标悬停或手指触碰 B 按钮时，B 瞬间随机位移
  function moveRunawayBtn() {
    if (!actionArea) return;
    const areaRect = actionArea.getBoundingClientRect();
    const btnRect = btnB.getBoundingClientRect();

    btnB.style.position = "absolute";

    const maxX = Math.max(20, areaRect.width - btnRect.width - 20);
    const maxY = Math.max(20, areaRect.height - btnRect.height - 20);

    const randX = Math.floor(Math.random() * maxX);
    const randY = Math.floor(Math.random() * maxY);

    btnB.style.left = `${randX}px`;
    btnB.style.top = `${randY}px`;

    // 变幻提示文案
    runawayCount++;
    btnB.innerText = runawayPhrases[runawayCount % runawayPhrases.length];

    if (window.romanticVisuals) {
      const center = btnB.getBoundingClientRect();
      window.romanticVisuals.createHeartBurst(center.x + center.width / 2, center.y + center.height / 2, 8);
    }
  }

  btnB.addEventListener("mouseenter", moveRunawayBtn);
  btnB.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveRunawayBtn();
  });

  // 如果顽强点到了 B
  btnB.addEventListener("click", () => {
    moveRunawayBtn();
  });

  // 点选 A (正确答案)
  btnA.addEventListener("click", (e) => {
    const cur = quizList[currentIndex];
    if (window.romanticVisuals) {
      window.romanticVisuals.createHeartBurst(e.clientX, e.clientY, 35);
    }

    showModal("🎉 满分回答！", cur.correctFeedback, "下一题 / 继续探索", () => {
      currentIndex = (currentIndex + 1) % quizList.length;
      renderCurrentQuiz();
    });
  });

  renderCurrentQuiz();
}

// 心愿特权兑换券
function initCoupons(coupons, boyName) {
  const container = document.getElementById("coupons-grid");
  if (!container || !coupons) return;

  container.innerHTML = "";
  coupons.forEach(c => {
    const card = document.createElement("div");
    card.className = "coupon-card";
    card.id = `coupon-${c.id}`;
    card.innerHTML = `
      <div>
        <div class="coupon-header">
          <span class="coupon-icon">${c.icon}</span>
          <div>
            <div class="coupon-title">${c.title}</div>
            <span class="coupon-badge">${c.badge}</span>
          </div>
        </div>
        <div class="coupon-desc" style="margin-top: 10px;">${c.desc}</div>
      </div>
      <button class="claim-btn">立即核销特权</button>
    `;

    const claimBtn = card.querySelector(".claim-btn");
    claimBtn.addEventListener("click", (e) => {
      if (card.classList.contains("claimed")) {
        showModal("提示", "这张特权券已经核销过啦，但只要史晓维开口，小张依然无条件照办！", "收到 ❤️");
        return;
      }

      card.classList.add("claimed");
      claimBtn.innerText = "已核销";
      claimBtn.disabled = true;

      if (window.romanticVisuals) {
        window.romanticVisuals.createHeartBurst(e.clientX, e.clientY, 35);
      }

      showModal(
        "🎉 特权兑换成功！",
        `叮！【${c.title}】核销凭证已传送！${boyName}的心跳感应器已收到指令，无论何时何地，即刻生效执行！`,
        "好的，坐等小张服务~"
      );
    });

    container.appendChild(card);
  });
}

// 拍立得画廊卡片
function initPolaroids(memories) {
  const container = document.getElementById("polaroid-grid");
  if (!container || !memories) return;

  container.innerHTML = "";
  memories.forEach(m => {
    const card = document.createElement("div");
    card.className = "polaroid-card";
    card.innerHTML = `
      <div class="polaroid-inner">
        <div class="polaroid-front">
          <img class="polaroid-img" src="${m.image}" alt="${m.caption}" loading="lazy" />
          <div class="polaroid-caption">${m.caption}</div>
        </div>
        <div class="polaroid-back">
          <div class="polaroid-note">“${m.note}”</div>
        </div>
      </div>
    `;

    // 移动端点击翻转
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });

    container.appendChild(card);
  });
}

// 打字机手写情书
function initLoveLetter(fullText) {
  const letterEl = document.getElementById("letter-content");
  const replayBtn = document.getElementById("replay-letter-btn");
  if (!letterEl) return;

  let timer = null;

  function typeText() {
    if (timer) clearInterval(timer);
    letterEl.innerHTML = '<span class="cursor-blink"></span>';
    let index = 0;

    timer = setInterval(() => {
      if (index < fullText.length) {
        const textSoFar = fullText.slice(0, index + 1);
        letterEl.innerHTML = escapeHtml(textSoFar) + '<span class="cursor-blink"></span>';
        index++;
      } else {
        clearInterval(timer);
        timer = null;
        // 打印完毕后心形烟花庆祝
        if (window.romanticVisuals) {
          const rect = letterEl.getBoundingClientRect();
          window.romanticVisuals.createHeartBurst(rect.x + rect.width / 2, rect.y + rect.height / 2, 30);
        }
      }
    }, 45);
  }

  if (replayBtn) {
    replayBtn.addEventListener("click", () => typeText());
  }

  // 滚动进入视野后自动开始打字
  let started = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true;
      typeText();
    }
  }, { threshold: 0.2 });

  observer.observe(letterEl);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 弹窗管理
let modalCallback = null;
function initModal() {
  const overlay = document.getElementById("modal-overlay");
  const closeBtn = document.getElementById("modal-close-btn");
  if (!overlay || !closeBtn) return;

  function hideModal() {
    overlay.classList.remove("active");
    if (modalCallback) {
      const cb = modalCallback;
      modalCallback = null;
      cb();
    }
  }

  closeBtn.addEventListener("click", hideModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideModal();
  });
}

function showModal(title, body, btnText = "开心收下", onConfirm = null) {
  const overlay = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const bodyEl = document.getElementById("modal-body");
  const closeBtn = document.getElementById("modal-close-btn");

  if (!overlay || !titleEl || !bodyEl || !closeBtn) return;

  titleEl.innerText = title;
  bodyEl.innerText = body;
  closeBtn.innerText = btnText;
  modalCallback = onConfirm;

  overlay.classList.add("active");
}
