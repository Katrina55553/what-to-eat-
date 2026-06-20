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

  onReady() {
    this.computeWheelSegments();
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

      // clip-path polygon 坐标：中心 + 两个端点
      const cx = 50, cy = 50, r = 50;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);

      const clipPath = `${cx}% ${cy}%, ${x1}% ${y1}%, ${x2}% ${y2}%`;

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
    const startRotation = this.data.wheelRotation;
    const targetAngle = extraRotations + (360 - targetSliceCenter);
    const finalRotation = startRotation + targetAngle;

    const startTime = Date.now();
    let lastTickIndex = -1;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRotation = startRotation + eased * targetAngle;

      this.setData({ wheelRotation: currentRotation });

      const tickIndex = Math.floor((currentRotation % 360) / sliceAngle);
      if (tickIndex !== lastTickIndex) {
        lastTickIndex = tickIndex;
        this.playTickSound();
      }

      if (progress < 1) {
        setTimeout(animate, 16);
      } else {
        this.setData({
          isSpinning: false,
          wheelRotation: finalRotation % 360,
        });
        this.showResult(`今天吃 ${selected.name}！`);
        this.playResultSound();
      }
    };

    animate();
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

  showResult(text, emoji) {
    const randomEmoji = emoji || FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    this.setData({
      showResultCard: true,
      showResultActions: true,
      resultText: text,
      resultEmoji: randomEmoji,
      currentResult: { name: text.replace(/今天吃 |！/g, '') },
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
    const name = this.data.currentResult.name;
    const dish = this.data.dishes.find(d => d.name === name);
    if (dish) {
      dish.lastEaten = Date.now();
      dish.weight = Math.min(dish.weight + 1, 10);
      this.data.dishes.forEach(d => {
        if (d.id !== dish.id && d.tags.some(t => dish.tags.includes(t))) {
          d.weight = Math.max(d.weight - 1, 1);
        }
      });
      this.persistState();
    }
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