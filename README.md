# 🍜 今天吃什么

<div align="center">

![GitHub Pages](https://img.shields.io/badge/在线体验-GitHub%20Pages-ef4444?logo=github&style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&style=for-the-badge)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black&style=for-the-badge)
![WeChat Mini Program](https://img.shields.io/badge/微信小程序-07C160?logo=wechat&logoColor=white&style=for-the-badge)

**让转盘为你决定今天吃什么 —— 一个简洁、温暖的转盘决策应用**

🌐 **在线体验**：[https://katrina55553.github.io/what-to-eat-/](https://katrina55553.github.io/what-to-eat-/)

</div>

---

## ✨ 功能特点

<table>
<tr>
<td width="50%">

### 🎯 核心功能
- **转盘抽选**：Canvas 动画转盘，点击即抽
- **场景切换**：早餐 / 午餐 / 晚餐 / 夜宵
- **快速过滤**：不吃辣 / 不吃面 / 避开踩雷
- **权重系统**：智能加权随机算法

</td>
<td width="50%">

### 💡 贴心设计
- **音效反馈**：转盘节拍 + 结果提示音
- **分享功能**：一键分享抽选结果
- **本地存储**：刷新不丢失数据
- **响应式**：手机 / 平板 / 电脑均适配

</td>
</tr>
</table>

---

## 🚀 快速开始

### 🌐 网页版

```bash
# 方式一：直接在线体验
# 访问 https://katrina55553.github.io/what-to-eat-/

# 方式二：本地运行
# 直接用浏览器打开 index.html 即可
```

### 📱 微信小程序版

```bash
# 1. 打开微信开发者工具
# 2. 导入项目根目录
# 3. appid 默认使用测试号 touristappid
# 4. 点击「编译」预览
```

---

## 🎮 使用指南

```
┌─────────────────────────────────────────────────────────┐
│  1️⃣  选择场景  →  2️⃣  设置过滤  →  3️⃣  开始抽选  │
│                                                         │
│  早餐│午餐│晚餐│夜宵    不吃辣│不吃面│避开踩雷    🎯     │
└─────────────────────────────────────────────────────────┘
```

| 步骤 | 操作 | 说明 |
|:----:|------|------|
| 1️⃣ | 选择场景 | 早餐 / 午餐 / 晚餐 / 夜宵 / 不限 |
| 2️⃣ | 设置过滤 | 可选：不吃辣、不吃面、避开最近吃过的、避开踩雷 |
| 3️⃣ | 开始抽选 | 点击「开始抽选」按钮，等待转盘旋转 |
| 4️⃣ | 查看结果 | 结果卡显示抽中的菜品 |
| 5️⃣ | 再次决策 | 选择「再抽一次」或「就选这个」 |

---

## 🍽️ 菜品管理

| 功能 | 操作 | 说明 |
|------|------|------|
| ➕ 添加 | 输入名称 → 回车 | 支持自定义菜品 |
| ✏️ 编辑 | 点击「✎」按钮 | 修改菜品名称 |
| 🗑️ 删除 | 点击「×」按钮 | 删除不需要的菜品 |
| 💣 踩雷 | 点击「💣」按钮 | 标记踩雷菜品 |
| 🔍 搜索 | 顶部搜索框 | 快速查找菜品 |
| 🔄 重置 | 右上角「↻」 | 恢复默认预置菜品 |

---

## ⚙️ 技术栈

<table>
<tr>
<td width="50%">

### 🌐 网页版
- **前端**：HTML5 + CSS3 + JavaScript ES6+
- **动画**：Canvas API + requestAnimationFrame
- **存储**：localStorage
- **规范**：BEM 命名 + 响应式设计
- **特点**：单文件，零依赖

</td>
<td width="50%">

### 📱 小程序版
- **框架**：原生微信小程序
- **动画**：小程序 Canvas 2D
- **存储**：wx.getStorageSync
- **分享**：原生 onShareAppMessage
- **反馈**：wx.vibrateShort 轻震动

</td>
</tr>
</table>

---

## 📁 项目结构

```
what-to-eat/
├── 📄 index.html              # 网页版（HTML/CSS/JS 一体）
├── ⚙️ project.config.json     # 微信开发者工具配置
├── 📱 miniprogram/            # 微信小程序源码
│   ├── 📂 pages/
│   │   ├── 🏠 index/          # 首页：转盘 / 场景 / 筛选
│   │   └── ⚙️ manage/         # 菜品管理页
│   └── 🔧 utils/
│       └── 📊 data.js         # 常量、存储、筛选算法
├── 📝 CLAUDE.md               # 开发说明
└── 📖 README.md               # 项目文档
```

---

## 💾 数据说明

| 平台 | 存储方式 | 键名 |
|------|----------|------|
| 🌐 网页版 | 浏览器 localStorage | `whatToEat` |
| 📱 小程序 | wx.getStorageSync | `whatToEat` |

> ⚠️ **注意**：清除缓存会丢失自定义菜品，不同端数据不互通

---

## 🔗 相关链接

<div align="center">

| 链接 | 地址 |
|------|------|
| 🌐 在线体验 | [https://katrina55553.github.io/what-to-eat-/](https://katrina55553.github.io/what-to-eat-/) |
| 💻 项目仓库 | [https://github.com/Katrina55553/what-to-eat-](https://github.com/Katrina55553/what-to-eat-) |

</div>

---

## 📝 许可证

<div align="center">

MIT License © 2026

![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-ff69b4?style=for-the-badge)

</div>
