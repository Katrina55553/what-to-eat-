# 今天吃什么 · 微信小程序

原生微信小程序版本，与原 `index.html` 网页版共享核心逻辑与预置菜品。

## 目录结构

```
miniprogram/
  app.js
  app.json
  app.wxss
  sitemap.json
  pages/
    index/          # 首页：转盘、场景、筛选、结果
    manage/         # 菜品管理页：添加、编辑、删除、黑名单
  utils/
    data.js         # 数据常量、本地缓存读写、筛选/随机算法
```

## 运行方式

1. 打开微信开发者工具。
2. 导入项目，选择本仓库根目录。
3. `appid` 暂时使用 `touristappid`（测试号）。如需上线，请替换为自己的小程序 AppID。
4. 点击「编译」即可预览。

## 与网页版的差异

- 页面拆分为 `pages/index` + `pages/manage`。
- 本地存储从 `localStorage` 改为 `wx.getStorageSync` / `wx.setStorageSync`。
- 转盘 Canvas 使用小程序 `type="2d"` 接口。
- 音效按钮目前以轻震动反馈替代 Web Audio，避免小程序音频需要用户手势解锁的问题。
- 分享使用原生 `onShareAppMessage`。
- 菜品管理从弹窗改为独立页面。
