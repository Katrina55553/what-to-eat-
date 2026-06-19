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

// Canvas 逻辑尺寸
const CANVAS_SIZE = 250;
const CANVAS_CENTER = CANVAS_SIZE / 2;
const CANVAS_RADIUS = CANVAS_CENTER - 8;

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
  },

  onReady() {
    // 旧版 Canvas API，无需 createSelectorQuery，不会超时
    this.ctx = wx.createCanvasContext('wheelCanvas', this);
    this.renderWheel();
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
    if (this.ctx) this.renderWheel();
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

  getBadgeIcon(scene) {
    return scene === '不限' ? '🍽️' : (SCENE_ICONS[scene] || '🍽️');
  },

  renderWheel() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dishes = filterDishes(this.data.dishes, this.data.currentScene, this.data.filters);

    this.setData({ wheelDisabled: dishes.length === 0 });

    // 旧版 Canvas 用 clearRect 前需要先清空路径队列
    ctx.clearActions();

    if (dishes.length === 0) {
      ctx.beginPath();
      ctx.arc(CANVAS_CENTER, CANVAS_CENTER, CANVAS_RADIUS, 0, Math.PI * 2);
      ctx.setFillStyle('rgba(253, 248, 236, 0.6)');
      ctx.fill();
      ctx.setStrokeStyle('rgba(201, 64, 61, 0.2)');
      ctx.setLineWidth(2);
      ctx.setLineDash([6, 6], 0);
      ctx.stroke();
      ctx.setLineDash([], 0);

      ctx.setFillStyle('rgba(44, 24, 16, 0.78)');
      ctx.setFontSize(14);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.fillText('暂无可选菜品', CANVAS_CENTER, CANVAS_CENTER - 12);
      ctx.setFontSize(12);
      ctx.setFillStyle('rgba(44, 24, 16, 0.52)');
      ctx.fillText('点击下方菜品管理添加', CANVAS_CENTER, CANVAS_CENTER + 14);
      ctx.draw();
      return;
    }

    const sliceAngle = (Math.PI * 2) / dishes.length;
    dishes.forEach((dish, i) => {
      const startAngle = i * sliceAngle - Math.PI / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(CANVAS_CENTER, CANVAS_CENTER);
      ctx.arc(CANVAS_CENTER, CANVAS_CENTER, CANVAS_RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.setFillStyle(WHEEL_COLORS[i % WHEEL_COLORS.length]);
      ctx.fill();
      ctx.setStrokeStyle('rgba(255,255,255,0.8)');
      ctx.setLineWidth(2);
      ctx.stroke();

      ctx.save();
      ctx.translate(CANVAS_CENTER, CANVAS_CENTER);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.setTextAlign('center');
      ctx.setTextBaseline('middle');
      ctx.setFillStyle('#fff');
      ctx.setShadow(0, 0, 4, 'rgba(0,0,0,0.3)');
      const textRadius = CANVAS_RADIUS * 0.65;
      const fontSize = Math.max(8, Math.min(13, Math.round(104 / dishes.length)));
      ctx.setFontSize(fontSize);
      const maxLen = Math.max(3, Math.round(7 - (dishes.length - 6) * 0.4));
      const displayName = dish.name.length > maxLen ? dish.name.slice(0, maxLen) + '…' : dish.name;
      ctx.fillText(displayName, textRadius, 0);
      ctx.restore();
    });

    ctx.draw();
  },

  onSceneTap(e) {
    const scene = e.currentTarget.dataset.scene;
    this.setData({
      currentScene: scene,
      badgeIcon: this.getBadgeIcon(scene),
    });
    this.persistState();
    this.renderWheel();
    this.hideResult();
  },

  onFilterTap(e) {
    const key = e.currentTarget.dataset.filter;
    const filters = { ...this.data.filters, [key]: !this.data.filters[key] };
    this.setData({ filters });
    this.persistState();
    this.renderWheel();
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
  },

  playResultSound() {
    if (!this.data.soundEnabled) return;
    wx.vibrateShort({ type: 'medium' });
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
    this.renderWheel();
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