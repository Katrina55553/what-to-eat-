const STORAGE_KEY = 'whatToEat';

const SCENES = ['不限', '早餐', '午餐', '晚餐', '夜宵'];

const SCENE_ICONS = {
  '不限': '',
  '早餐': '🌅',
  '午餐': '☀',
  '晚餐': '🌙',
  '夜宵': '🌃',
};

const FILTERS = [
  { key: 'excludeSpicy', label: '🌶 不吃辣' },
  { key: 'excludeNoodles', label: '🍜 不吃面' },
  { key: 'excludeRecent', label: '🕒 避开最近' },
  { key: 'excludeBlacklisted', label: '💣 避开踩雷' },
];

const DEFAULT_FILTERS = FILTERS.reduce((acc, f) => Object.assign({}, acc, { [f.key]: false }), {});
DEFAULT_FILTERS.excludeBlacklisted = true;

const WHEEL_SIZE = 250;
const WHEEL_CENTER = WHEEL_SIZE / 2;
const WHEEL_RADIUS = WHEEL_CENTER - 12;
const SPIN_DURATION = 4500;
const MIN_ROTATIONS = 5;

const FOOD_EMOJIS = ['🍜', '🍕', '🍱', '🍔', '🥟', '🍛', '🍝', '🥘', '🍲', '🍗', '🥗', '🍳', '🌮', '🍣', '🍤', '🍖', '🥩', '🍚', '🥡'];

const BG_EMOJIS = ['🍜', '🍕', '🍱', '🍔', '🥟', '🍛', '🍝', '🥘', '🍲', '🍗', '🥗', '🍳', '🌮', '🍣', '🍤', '🥢', '🍽', '🥄', '🥡', '🍶'];

const WHEEL_COLORS = [
  '#c9403d', '#f5c77e', '#d68a3c', '#5f7a6f',
  '#e0a85f', '#a8653d', '#c7b78a', '#8a5a3b',
  '#e8935f', '#b5906e', '#d89f6f', '#9c6b4a',
];

const PRESET_DISHES = [
  { name: '宫保鸡丁', tags: ['米饭类', '家常菜'], scenes: ['午餐', '晚餐'] },
  { name: '鱼香肉丝', tags: ['米饭类', '家常菜'], scenes: ['午餐', '晚餐'] },
  { name: '番茄炒蛋', tags: ['米饭类', '家常菜'], scenes: ['午餐', '晚餐'] },
  { name: '红烧肉', tags: ['米饭类', '家常菜'], scenes: ['午餐', '晚餐'] },
  { name: '麻婆豆腐', tags: ['米饭类', '川菜'], scenes: ['午餐', '晚餐'] },
  { name: '回锅肉', tags: ['米饭类', '川菜'], scenes: ['午餐', '晚餐'] },
  { name: '糖醋里脊', tags: ['米饭类', '家常菜'], scenes: ['午餐', '晚餐'] },
  { name: '炸酱面', tags: ['面条类', '主食'], scenes: ['午餐', '晚餐'] },
  { name: '牛肉面', tags: ['面条类', '主食'], scenes: ['午餐', '晚餐'] },
  { name: '担担面', tags: ['面条类', '川菜'], scenes: ['午餐', '晚餐'] },
  { name: '阳春面', tags: ['面条类', '主食'], scenes: ['早餐', '午餐'] },
  { name: '刀削面', tags: ['面条类', '主食'], scenes: ['午餐', '晚餐'] },
  { name: '麻辣火锅', tags: ['火锅类', '聚餐'], scenes: ['晚餐', '夜宵'] },
  { name: '清汤火锅', tags: ['火锅类', '聚餐'], scenes: ['晚餐', '夜宵'] },
  { name: '串串香', tags: ['火锅类', '小吃'], scenes: ['晚餐', '夜宵'] },
  { name: '煎饼果子', tags: ['小吃类', '快餐'], scenes: ['早餐', '午餐'] },
  { name: '肉夹馍', tags: ['小吃类', '快餐'], scenes: ['早餐', '午餐'] },
  { name: '烤冷面', tags: ['小吃类', '快餐'], scenes: ['午餐', '夜宵'] },
  { name: '煎饺', tags: ['小吃类', '快餐'], scenes: ['早餐', '午餐'] },
  { name: '手抓饼', tags: ['小吃类', '快餐'], scenes: ['早餐', '午餐'] },
  { name: '披萨', tags: ['西餐类', '快餐'], scenes: ['午餐', '晚餐'] },
  { name: '汉堡', tags: ['西餐类', '快餐'], scenes: ['午餐', '晚餐'] },
  { name: '意面', tags: ['西餐类', '主食'], scenes: ['午餐', '晚餐'] },
  { name: '豆浆油条', tags: ['小吃类', '早餐'], scenes: ['早餐'] },
  { name: '小笼包', tags: ['小吃类', '早餐'], scenes: ['早餐'] },
  { name: '豆腐脑', tags: ['小吃类', '早餐'], scenes: ['早餐'] },
];

function generateId() {
  // 小程序环境中没有 crypto.randomUUID，统一使用时间戳+随机数
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadData() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('读取本地数据失败:', e);
  }
  return null;
}

function saveData(data) {
  try {
    wx.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('保存本地数据失败:', e);
  }
}

function createDefaultState() {
  return {
    dishes: PRESET_DISHES.map(d => ({
      id: generateId(),
      name: d.name,
      tags: d.tags,
      scenes: d.scenes,
      weight: 5,
      lastEaten: null,
      isBlacklisted: false,
      isCustom: false,
    })),
    currentScene: '不限',
    filters: Object.assign({}, DEFAULT_FILTERS),
    soundEnabled: true,
  };
}

function getInitialState() {
  const saved = loadData();
  if (saved && saved.dishes && saved.dishes.length > 0) {
    saved.filters = Object.assign({}, DEFAULT_FILTERS, saved.filters);
    return saved;
  }
  const initial = createDefaultState();
  saveData(initial);
  return initial;
}

function hasTagLike(tags, keyword) {
  return tags.some(t => t.toLowerCase().includes(keyword.toLowerCase()));
}

function filterDishes(dishes, scene, filters) {
  return dishes.filter(dish => {
    if (scene !== '不限' && !dish.scenes.includes(scene)) return false;
    if (filters.excludeBlacklisted && dish.isBlacklisted) return false;
    if (filters.excludeRecent && dish.lastEaten) {
      const daysSince = (Date.now() - dish.lastEaten) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return false;
    }
    if (filters.excludeSpicy) {
      if (hasTagLike(dish.tags, '辣') || hasTagLike(dish.tags, '川') || hasTagLike(dish.tags, '火锅')) return false;
    }
    if (filters.excludeNoodles && hasTagLike(dish.tags, '面')) return false;
    return true;
  });
}

function weightedRandom(dishes) {
  if (dishes.length === 0) return null;
  const totalWeight = dishes.reduce((sum, d) => sum + d.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const dish of dishes) {
    rand -= dish.weight;
    if (rand <= 0) return dish;
  }
  return dishes[dishes.length - 1];
}

function formatLastEaten(timestamp) {
  if (!timestamp) return '';
  const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
  if (days === 0) return '今天吃过';
  if (days === 1) return '昨天吃过';
  if (days < 7) return `${days} 天前吃过`;
  if (days < 30) return `${Math.floor(days / 7)} 周前吃过`;
  return '很久以前吃过';
}

function createBgItems() {
  return Array.from({ length: 18 }, () => ({
    emoji: BG_EMOJIS[Math.floor(Math.random() * BG_EMOJIS.length)],
    left: Math.random() * 100,
    fontSize: Math.random() * 20 + 20,
    duration: Math.random() * 15 + 18,
    delay: Math.random() * 15,
  }));
}

module.exports = {
  SCENES,
  SCENE_ICONS,
  FILTERS,
  DEFAULT_FILTERS,
  WHEEL_SIZE,
  WHEEL_CENTER,
  WHEEL_RADIUS,
  SPIN_DURATION,
  MIN_ROTATIONS,
  FOOD_EMOJIS,
  WHEEL_COLORS,
  PRESET_DISHES,
  generateId,
  loadData,
  saveData,
  getInitialState,
  createDefaultState,
  filterDishes,
  weightedRandom,
  formatLastEaten,
  createBgItems,
};
