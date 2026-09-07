# 项目重要说明 (READ BEFORE CODING)

> [!IMPORTANT]
> **历史微信小程序构建版本，已停止维护。** 本仓库是在 UniApp 编译产物上手工拆分资源后的版本，无法安全地从原始工程重复生成。当前原生微信小程序版本请查看 [cyber-hiking](https://github.com/YouRen1320/cyber-hiking)。本仓库只保留用于追溯旧版本和资源分包方案。

> ⚠️ **CRITICAL WARNING**:
> 本目录 (`mp-weixin`) 已脱离 uni-app 构建系统，转为**原生微信小程序**开发。
> **严禁运行 uni-app 编译命令**（如 `npm run dev:mp-weixin` 或 HBuilderX 运行），否则会覆盖此处的手动修改并导致资源丢失！

## 项目背景
本项目原基于 uni-app 开发，因微信小程序严格的分包体积限制（主包/分包 < 2MB），在构建产物的基础上进行了**手动深度改造**。目前已完全转为原生小程序项目。

## 资源结构（特殊）
为解决体积问题，静态资源被手动拆分到了多个分包中，且代码中包含了硬编码的路径映射。

### 1. 静态图片分包
图片资源分散在根目录下的 `staticPkg1` 至 `staticPkg9` 文件夹中。
- **主包资源**：`/static/` (仅包含首页 `back_ground.png` 和角色页 `loc_nav_stand.png`，以避开主包限制)
- **分包资源**：`staticPkg1` ~ `staticPkg9` (包含游戏内场景图、事件图等)

### 2. 代码逻辑修改
以下文件包含了单纯编译无法生成的**手动逻辑**，修改时需格外小心：

- **`pages/components/BackgroundLayer.js`**:
  - 核心逻辑：注入了一个巨大的 `pkgMap` 映射表。
  - 作用：根据图片文件名动态计算其所在的 `staticPkgX` 路径。
  - **注意**：如果添加新图片，必须手动更新此文件中的映射表，否则动态背景无法加载。

- **`common/assets.js`**:
  - 手动修改了 `_imports_0` 和 `_imports_0$1` 常量。
  - 指向：强制指向 `/static/` 目录下的图片，而非 uni-app 生成的 `assets` 哈希路径。

- **`pages/home_page.wxml`**:
  - 首页背景图路径已**硬编码**为 `/static/back_ground.png`。

## 开发指南

### 如何添加新图片？
1. 查看各个 `staticPkg` 的大小，将图片放入未满 2MB 的分包中（或新建分包并在 `app.json` 注册）。
2. 如果图片需要在 **首页** 或 **主包页面** 直接显示（非动态加载），请放入 `/static/`（注意主包体积限制）。
3. 如果是动态加载的背景图，需要在 `pages/components/BackgroundLayer.js` 的 `m` 对象中添加映射：`'image_name': 'staticPkgX'`。

### 如何修改代码？
直接编辑 `.wxml`, `.wxss`, `.js`, `.json` 文件。
不要去修改 `src` 目录下的 `.vue` 文件，它们已经失效。

### 常用路径参考
- 首页: `pages/home_page`
- 游戏页: `pagesGame/game_page`
- 音频: `pagesGame/static_audio/`

---
*Created by AI Assistant, 2026-01-15*
