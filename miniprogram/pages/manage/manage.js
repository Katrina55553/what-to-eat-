const {
  SCENES,
  PRESET_DISHES,
  getInitialState,
  saveData,
  generateId,
  formatLastEaten,
} = require('../../utils/data.js');

const SEARCH_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'custom', label: '自定义' },
  { key: 'blacklist', label: '踩雷' },
];

// 给菜品加上展示用的预计算字段，避免在 wxml 中调用函数
function decorateDish(dish) {
  return {
    ...dish,
    scenesText: dish.scenes.join(' · '),
    lastEatenText: dish.lastEaten ? formatLastEaten(dish.lastEaten) : '',
  };
}

Page({
  data: {
    dishes: [],
    filteredDishes: [],
    searchFilters: SEARCH_FILTERS,
    searchFilter: 'all',
    inputValue: '',
    searchValue: '',
    countText: '',
    editingId: null,
    editForm: null,
    editableScenes: SCENES.filter(s => s !== '不限'),
    highlightId: null,
  },

  onLoad(options) {
    this.loadState();
    if (options.highlightId) {
      this.setData({ highlightId: options.highlightId });
    }
  },

  onShow() {
    this.loadState();
  },

  loadState() {
    const state = getInitialState();
    const dishes = state.dishes.map(decorateDish);
    this.setData({ dishes }, () => {
      this.applyFilters();
    });
  },

  applyFilters() {
    const query = this.data.searchValue.toLowerCase();
    let filtered = this.data.dishes;
    if (query) filtered = filtered.filter(d => d.name.toLowerCase().includes(query));
    if (this.data.searchFilter === 'custom') filtered = filtered.filter(d => d.isCustom);
    if (this.data.searchFilter === 'blacklist') filtered = filtered.filter(d => d.isBlacklisted);

    const countText = `共 ${filtered.length} 道菜${filtered.length !== this.data.dishes.length ? '（已筛选）' : ''}`;
    this.setData({ filteredDishes: filtered, countText });
  },

  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  addDish() {
    const name = this.data.inputValue.trim();
    if (!name) return;
    if (this.data.dishes.some(d => d.name === name)) {
      this.setData({ inputValue: '' });
      wx.showToast({ title: '菜品已存在', icon: 'none' });
      return;
    }

    const newDish = decorateDish({
      id: generateId(),
      name,
      tags: ['自定义'],
      scenes: ['午餐', '晚餐'],
      weight: 5,
      lastEaten: null,
      isBlacklisted: false,
      isCustom: true,
    });

    const dishes = [...this.data.dishes, newDish];
    this.persistAndReload(dishes, newDish.id);
    this.setData({ inputValue: '' });
  },

  onSearchInput(e) {
    this.setData({ searchValue: e.detail.value.trim() }, () => {
      this.applyFilters();
    });
  },

  onSearchFilterTap(e) {
    this.setData({ searchFilter: e.currentTarget.dataset.filter }, () => {
      this.applyFilters();
    });
  },

  toggleBlacklist(e) {
    const id = e.currentTarget.dataset.id;
    const dishes = this.data.dishes.map(d => {
      if (d.id !== id) return d;
      return decorateDish({ ...d, isBlacklisted: !d.isBlacklisted, weight: d.isBlacklisted ? 5 : 1 });
    });
    this.persistAndReload(dishes);
  },

  deleteDish(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这道菜吗？',
      success: (res) => {
        if (res.confirm) {
          const dishes = this.data.dishes.filter(d => d.id !== id);
          this.persistAndReload(dishes);
        }
      },
    });
  },

  startEdit(e) {
    const id = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(d => d.id === id);
    if (!dish) return;

    this.setData({
      editingId: id,
      editForm: {
        name: dish.name,
        tags: dish.tags.join('、'),
        scenes: [...dish.scenes],
        weight: String(dish.weight),
      },
    });
  },

  // 编辑表单输入同步
  onEditInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`editForm.${field}`]: e.detail.value });
  },

  toggleEditScene(e) {
    const scene = e.currentTarget.dataset.scene;
    const scenes = this.data.editForm.scenes.includes(scene)
      ? this.data.editForm.scenes.filter(s => s !== scene)
      : [...this.data.editForm.scenes, scene];
    this.setData({ 'editForm.scenes': scenes });
  },

  cancelEdit() {
    this.setData({ editingId: null, editForm: null });
  },

  saveEdit(e) {
    const id = e.currentTarget.dataset.id;
    const form = this.data.editForm;
    const name = (form.name || '').trim();
    if (!name) {
      wx.showToast({ title: '名称不能为空', icon: 'none' });
      return;
    }
    if (this.data.dishes.some(d => d.name === name && d.id !== id)) {
      wx.showToast({ title: '菜品已存在', icon: 'none' });
      return;
    }

    const tags = (form.tags || '').split(/[,，、]/).map(t => t.trim()).filter(Boolean);
    const weight = Math.max(1, Math.min(10, parseInt(form.weight) || 5));
    const scenes = form.scenes.length > 0 ? form.scenes : ['午餐', '晚餐'];

    const dishes = this.data.dishes.map(d => {
      if (d.id !== id) return d;
      return decorateDish({ ...d, name, tags: tags.length > 0 ? tags : ['自定义'], scenes, weight });
    });

    this.persistAndReload(dishes, id);
    this.setData({ editingId: null, editForm: null });
  },

  resetDishes() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有菜品吗？自定义菜品将被清除，恢复预置菜品。',
      success: (res) => {
        if (res.confirm) {
          const dishes = PRESET_DISHES.map(d => decorateDish({
            id: generateId(),
            name: d.name,
            tags: d.tags,
            scenes: d.scenes,
            weight: 5,
            lastEaten: null,
            isBlacklisted: false,
            isCustom: false,
          }));
          this.persistAndReload(dishes);
          wx.showToast({ title: '已恢复预置菜品', icon: 'none' });
        }
      },
    });
  },

  persistAndReload(dishes, highlightId) {
    const state = getInitialState();
    state.dishes = dishes.map(d => {
      // 存储时去掉展示用的预计算字段
      const { scenesText, lastEatenText, ...rest } = d;
      return rest;
    });
    saveData(state);
    this.setData({ dishes, highlightId: highlightId || null }, () => {
      this.applyFilters();
    });
  },
});
