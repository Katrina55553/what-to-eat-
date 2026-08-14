const {
  SCENES,
  SCENE_ICONS,
  FILTERS,
  SPIN_DURATION,
  MIN_ROTATIONS,
  FOOD_EMOJIS,
  WHEEL_COLORS,
  getInitialState,
  saveData,
  filterDishes,
  weightedRandom,
  createBgItems,
} = require('../../utils/data.js');

Page({
  data: {
    scenes: SCENES,
    sceneIcons: SCENE_ICONS,
    filtersList: FILTERS,
    bgItems: createBgItems(),
    dishes: [],
    currentScene: '不限',
    filters: {},
    soundEnabled: true,
    badgeIcon: '🍽️',
    wheelDisabled: false,
    isSpinning: false,
    wheelSegments: [],
    showResultCard: false,
    showResultActions: false,
    resultText: '',
    resultEmoji: '',
    currentResult: null,
    wheelRotation: 0,
    wheelTransition: '',
  },

  onLoad() {
    const initial = getInitialState();
    this.setData({
      dishes: initial.dishes,
      currentScene: initial.currentScene,
      filters: initial.filters,
      soundEnabled: initial.soundEnabled,
      badgeIcon: this.getBadgeIcon(initial.currentScene),
    });
    this.computeWheelSegments();
    this.initAudio();
  },

  onShow() {
    const initial = getInitialState();
    this.setData({
      dishes: initial.dishes,
      currentScene: initial.currentScene,
      filters: initial.filters,
      soundEnabled: initial.soundEnabled,
      badgeIcon: this.getBadgeIcon(initial.currentScene),
    });
    this.computeWheelSegments();
  },

  onShareAppMessage() {
    if (!this.data.currentResult) {
      return {
        title: '今天吃什么？让转盘帮你决定 🎯',
        path: '/pages/index/index',
      };
    }
    return {
      title: `我今天吃 ${this.data.currentResult.name}！你吃什么？`,
      path: '/pages/index/index',
    };
  },

  // 初始化音效播放器
  initAudio() {
    this.tickAudio = wx.createInnerAudioContext();
    this.tickAudio.src = '/audio/tick.wav';
    this.resultAudio = wx.createInnerAudioContext();
    this.resultAudio.src = '/audio/result.wav';
  },

  onUnload() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
    if (this.tickAudio) this.tickAudio.destroy();
    if (this.resultAudio) this.resultAudio.destroy();
  },

  getBadgeIcon(scene) {
    return scene === '不限' ? '🍽️' : (SCENE_ICONS[scene] || '🍽️');
  },

  // 将菜品数据转换为 CSS 转盘色块数组
  computeWheelSegments() {
    const dishes = filterDishes(this.data.dishes, this.data.currentScene, this.data.filters);
    this.setData({ wheelDisabled: dishes.length === 0 });

    if (dishes.length === 0) {
      this.setData({ wheelSegments: [] });
      return;
    }

    const sliceAngle = (Math.PI * 2) / dishes.length;
    // 文本位置：半径的 65% 处，换算为容器百分比
    const textRadius = 32.5;

    const segments = dishes.map((dish, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const midAngle = startAngle + sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      // 沿弧线采样多个点，让 clip-path 外缘逼近真实圆弧而非弦
      const cx = 50, cy = 50, r = 50;
      const ARC_STEPS = 8;
      const arcPoints = [];
      for (let s = 0; s <= ARC_STEPS; s++) {
        const a = startAngle + (sliceAngle * s) / ARC_STEPS;
        arcPoints.push(`${(cx + r * Math.cos(a)).toFixed(3)}% ${(cy + r * Math.sin(a)).toFixed(3)}%`);
      }
      const clipPath = `${cx}% ${cy}%, ` + arcPoints.join(', ');

      // 文本位置
      const textX = 50 + textRadius * Math.cos(midAngle);
      const textY = 50 + textRadius * Math.sin(midAngle);
      const textAngle = (midAngle * 180) / Math.PI;

      const maxLen = Math.max(3, Math.round(7 - (dishes.length - 6) * 0.4));
      const fontSize = Math.max(16, Math.min(26, Math.round(208 / dishes.length)));
      const displayName = dish.name.length > maxLen ? dish.name.slice(0, maxLen) + '…' : dish.name;

      return {
        color: WHEEL_COLORS[i % WHEEL_COLORS.length],
        clipPath,
        name: displayName,
        textX,
        textY,
        textAngle,
        fontSize,
      };
    });

    this.setData({ wheelSegments: segments });
  },

  onSceneTap(e) {
    const scene = e.currentTarget.dataset.scene;
    this.setData({
      currentScene: scene,
      badgeIcon: this.getBadgeIcon(scene),
    });
    this.persistState();
    this.computeWheelSegments();
    this.hideResult();
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.filter;
    const filters = Object.assign({}, this.data.filters, { [key]: !this.data.filters[key] });
    this.setData({ filters });
    this.persistState();
    this.computeWheelSegments();
    this.hideResult();
  },

  spinWheel() {
    if (this.data.isSpinning) return;
    const dishes = filterDishes(this.data.dishes, this.data.currentScene, this.data.filters);
    if (dishes.length === 0) {
      wx.showToast({ title: '还没有菜品，先去添加一些吧', icon: 'none' });
      return;
    }

    this.setData({ isSpinning: true });
    this.hideResult();

    const selected = weightedRandom(dishes);
    const selectedIndex = dishes.indexOf(selected);
    const sliceAngle = 360 / dishes.length;
    const targetSliceCenter = selectedIndex * sliceAngle + sliceAngle / 2;
    const extraRotations = MIN_ROTATIONS * 360;
    // 归一化起始角度，避免数值无限增长
    const normalizedStart = this.data.wheelRotation % 360;
    const targetAngle = extraRotations + (360 - targetSliceCenter);
    const finalRotation = normalizedStart + targetAngle;

    // 先开启 transition，回调中再设置目标角度，确保过渡生效；
    // 用 CSS transition 代替逐帧 setData，避免跨桥通信卡顿
    this.setData({ wheelTransition: `transform ${SPIN_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)` }, () => {
      this.setData({ wheelRotation: finalRotation });
    });

    const startTime = Date.now();
    let lastTickIndex = -1;

    // 仅用定时器驱动音效，不再逐帧更新转盘角度
    this.tickTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRotation = normalizedStart + eased * targetAngle;
      const tickIndex = Math.floor((currentRotation % 360) / sliceAngle);
      if (tickIndex !== lastTickIndex) {
        lastTickIndex = tickIndex;
        this.playTickSound();
      }
      if (progress >= 1) {
        clearInterval(this.tickTimer);
        this.tickTimer = null;
        this.setData({
          isSpinning: false,
          wheelTransition: '',
          wheelRotation: finalRotation % 360,
        });
        this.showResult(selected);
        this.playResultSound();
      }
    }, 33);
  },

  playTickSound() {
    if (!this.data.soundEnabled) return;
    wx.vibrateShort({ type: 'light' });
    if (this.tickAudio) {
      this.tickAudio.stop();
      this.tickAudio.play();
    }
  },

  playResultSound() {
    if (!this.data.soundEnabled) return;
    wx.vibrateShort({ type: 'medium' });
    if (this.resultAudio) {
      this.resultAudio.play();
    }
  },

  showResult(dish, emoji) {
    const randomEmoji = emoji || FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    this.setData({
      showResultCard: true,
      showResultActions: true,
      resultText: `今天吃 ${dish.name}！`,
      resultEmoji: randomEmoji,
      // 保留完整菜品对象，避免重名菜品时更新错条目
      currentResult: dish,
    });
  },

  hideResult() {
    this.setData({
      showResultCard: false,
      showResultActions: false,
      resultText: '',
      resultEmoji: '',
      currentResult: null,
    });
  },

  confirmChoice() {
    if (!this.data.currentResult) return;
    const result = this.data.currentResult;
    // 构造新数组并走 setData，避免直接 mutate this.data
    const dishes = this.data.dishes.map(d => {
      if (d.id === result.id) {
        return Object.assign({}, d, {
          lastEaten: Date.now(),
          weight: Math.min(d.weight + 1, 10),
        });
      }
      // 同标签菜品降权
      if (d.tags.some(t => result.tags.includes(t))) {
        return Object.assign({}, d, { weight: Math.max(d.weight - 1, 1) });
      }
      return d;
    });
    this.setData({ dishes });
    this.persistState();
    this.hideResult();
    this.computeWheelSegments();
  },

  toggleSound() {
    const soundEnabled = !this.data.soundEnabled;
    this.setData({ soundEnabled });
    this.persistState();
  },

  goToManage() {
    wx.navigateTo({ url: '/pages/manage/manage' });
  },

  shareResult() {
    if (!this.data.currentResult) {
      wx.showToast({ title: '还没有抽选结果哦', icon: 'none' });
    }
  },

  persistState() {
    saveData({
      dishes: this.data.dishes,
      currentScene: this.data.currentScene,
      filters: this.data.filters,
      soundEnabled: this.data.soundEnabled,
    });
  },
});