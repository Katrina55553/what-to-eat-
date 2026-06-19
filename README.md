# 今天吃什么 🍜

[![GitHub Pages](https://img.shields.io/badge/在线体验-GitHub%20Pages-ef4444?logo=github)](https://katrina55553.github.io/what-to-eat-/)

让转盘为你决定今天吃什么 —— 一个简洁、温暖的转盘决策应用。

> 🌐 **在线地址**：[https://katrina55553.github.io/what-to-eat-/](https://katrina55553.github.io/what-to-eat-/)

---

## ✨ 功能特点

| 功能 | 说明 |
|------|------|
| 🎯 **转盘抽选** | Canvas 动画转盘，点击即抽 |
| 🏷️ **分类管理** | 预置家常菜、面条、火锅、小吃、西餐等品类 |
| ⏰ **场景切换** | 早餐 / 午餐 / 晚餐 / 夜宵 各有专属菜品池 |
| 🔥 **快速过滤** | 不吃辣 / 不吃面 / 避开最近 / 避开踩雷 |
| ⚖️ **权重系统** | 智能权重计算：热度、频率、踩雷标记联合加权 |
| 🔊 **音效反馈** | 转盘节拍 + 结果提示音，可关闭 |
| 📤 **分享功能** | 一键分享抽选结果 |
| 💾 **本地存储** | localStorage 自动保存，刷新不丢失 |

---

## 🎨 设计风格

**暖色编辑风格（Warm Editorial）**：
- 牛皮纸背景 + 陶土红 / 琥珀金 / 鼠尾草绿 配色
- 宽字距排版 + "TODAY" 斜角标签
- 慢速旋转虚线圆环、暖光光晕
- 响应式设计，手机、平板、电脑均适配

---

## 🚀 快速开始

| 平台 | 方式 |
|------|------|
| 🌐 网页版 | [直接在线体验](https://katrina55553.github.io/what-to-eat-/) 或本地打开 `index.html` |
| 📱 微信小程序 | 用 **微信开发者工具** 导入项目根目录 |

### 网页版

1. **打开应用**：访问 [在线地址](https://katrina55553.github.io/what-to-eat-/) 或直接用浏览器打开 `index.html`
2. **选择场景**：早餐 / 午餐 / 晚餐 / 夜宵 / 不限
3. **开始抽选**：点击「开始抽选」按钮，等待转盘旋转
4. **查看结果**：结果卡显示抽中的菜品
5. **再次决策**：选择「再抽一次」或「就选这个」

### 微信小程序版

1. 打开 **微信开发者工具**
2. 导入项目，选择仓库根目录
3. `appid` 默认使用测试号 `touristappid`，如需上线请替换为你的真实 AppID
4. 点击「编译」预览

---

## 🍽️ 菜品管理

1. 点击底部「菜品管理」进入管理页（网页版为弹窗，小程序为独立页面）
2. **添加**：输入菜品名称 → 回车或点击「添加」
3. **编辑**：点击菜品右侧「✎」按钮（网页版与小程序均支持）
4. **删除**：点击菜品右侧「×」按钮
5. **标记踩雷**：点击菜品右侧「💣」按钮
6. **搜索筛选**：顶部搜索框快速查找；「自定义 / 踩雷 / 全部」过滤
7. **重置**：点击右上角「↻ 重置」恢复默认预置菜品

---

## ⚙️ 技术实现

### 网页版

- **纯前端**：单文件 HTML5 + CSS3 + JavaScript (ES6+)，零依赖
- **转盘动画**：Canvas API + `requestAnimationFrame`
- **持久化**：`localStorage`
- **CSS 规范**：BEM 命名（`.wheel__button--active`）
- **响应式**：Flexbox + 媒体查询（≤480px / ≤360px 两档适配）

### 微信小程序版

- **原生小程序**：`pages/index` + `pages/manage` 双页面
- **Canvas**：小程序 `type="2d"` 接口绘制转盘
- **持久化**：`wx.getStorageSync` / `wx.setStorageSync`
- **分享**：原生 `onShareAppMessage`
- **反馈**：轻震动 `wx.vibrateShort` 替代 Web Audio

---

## 💾 数据说明

- **网页版**：数据存储在浏览器 `localStorage`，键名为 `whatToEat`
- **小程序版**：数据存储在小程序本地缓存，键名同为 `whatToEat`
- 清除浏览器/小程序缓存会丢失自定义菜品
- 不同端之间数据不互通
- 可通过「↻ 重置」一键恢复默认预置菜品

---

## 📁 项目结构

```
what-to-eat/
├── index.html              # 网页版主页面（HTML / CSS / JS 一体）
├── project.config.json     # 微信开发者工具项目配置
├── README-miniprogram.md   # 微信小程序版说明
├── miniprogram/            # 微信小程序源码
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── sitemap.json
│   ├── pages/
│   │   ├── index/          # 首页：转盘 / 场景 / 筛选
│   │   └── manage/         # 菜品管理页
│   └── utils/
│       └── data.js         # 常量、本地存储、筛选与随机算法
├── CLAUDE.md               # 项目开发说明
└── README.md               # 用户文档（本文件）
```

---

## 🔗 相关链接

- 🌐 在线体验：[https://katrina55553.github.io/what-to-eat-/](https://katrina55553.github.io/what-to-eat-/)
- 💻 项目仓库：[https://github.com/Katrina55553/what-to-eat-](https://github.com/Katrina55553/what-to-eat-)

---

## 📝 许可证

MIT License
