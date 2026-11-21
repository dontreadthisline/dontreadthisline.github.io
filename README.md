# workbench — 个人博客

一个程序员的作品架与流水账。Astro 手搭，无主题、无前端框架、默认零 JS。

## 结构

```
src/
├── styles/
│   ├── tokens.css        # 全站唯一色板与字体（想换气质只改这里）
│   └── hand.css          # 手绘元素：下划线、便签、状态徽章
├── layouts/
│   ├── base.astro        # 导航 / 页脚 / 字体
│   └── note.astro        # 笔记正文排版（衬线 + KaTeX + 代码高亮）
├── components/           # StatusBadge / Underline，只放真复用的
├── data/
│   └── works.ts          # 作品索引元信息
├── pages/
│   ├── index.astro       # 首页：最新作品 + 最近笔记
│   ├── about.astro       # 自介 + now 页
│   ├── works/            # 作品索引（卡片可外链，如 tinyautograd 的项目页）
│   │   └── <slug>/       # 需要站内作品页时，每个作品手写一个目录
│   └── notes/            # 笔记索引 + [slug] 详情
└── content/
    └── notes/            # 笔记 Markdown
```

## 两类内容，别混

- **作品**：`src/pages/works/<slug>/index.astro` 手写页面，不走模板。同时在
  `src/data/works.ts` 登记索引信息。
- **笔记**：往 `src/content/notes/` 丢 Markdown，frontmatter：

```yaml
---
title: 标题
date: 2026-11-21
status: 写着呢        # 写着呢 | 读完了 | 弃坑
layout: math         # math = 数学推导型（疏朗、公式优先）；code = 代码讲解型（紧凑、代码优先）
tags: [tag1, tag2]
summary: 一句话摘要
marginalia: 回头看时给自己的批注，会以手写便签出现在文末（可选）
---
```

数学公式用 `$...$` / `$$...$$`（KaTeX），代码块自动 shiki 高亮。

### aha / stuck：文中手写便签

顿悟时刻和卡点记录，markdown 正文里直接写 HTML：

```html
<div class="aha">新状态永远只通过 ε 边参与游戏。</div>
<div class="stuck">布局组件起名 base，和 HTML 标签撞名，骨架整个消失。</div>
```

aha 渲染成米黄手写便签，stuck 渲染成暖赭色卡点标注 —— 这两类内容是 LLM
给不了的增量：只写下你真实的顿悟和真实的卡点。

## 常用命令

```bash
npm run dev       # 本地开发 http://localhost:4321
npm run build     # 构建到 dist/
npm run preview   # 本地预览构建产物
```

## 部署

推送到 `main` 分支，GitHub Actions 自动构建并发布到
<https://dontreadthisline.github.io>（workflow 在 `.github/workflows/deploy.yml`）。

## 还没换的占位
- `src/layouts/base.astro` 的 `SITE_NAME`（导航手写体 logo）
- `src/pages/about.astro` 的占位文字与邮箱
- `src/data/works.ts` 与示例笔记（换成你自己的）

## 待办

- [ ] RSS（@astrojs/rss）
- [ ] sitemap
- [ ] `/mocks/`：三个首页形态候选，选型后实装并删除
