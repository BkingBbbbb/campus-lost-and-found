# 校园失物招领平台 (Campus Lost & Found)

郑州工商学院《低代码开发技术》课程考核作品。

## 技术栈

- **前端框架**: Next.js 14 (App Router) + TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **存储**: Supabase Storage (图片上传)
- **部署**: Vercel

## 功能特性

- ✅ 失物发布（拾到物品登记）
- ✅ 寻物发布（丢失物品登记）
- ✅ 物品分类检索
- ✅ 图片上传
- ✅ 用户注册/登录
- ✅ 认领申请流程
- ✅ 个人中心管理
- ✅ 管理员审核后台
- ✅ 搜索功能
- ✅ 响应式设计

## 快速开始

### 1. 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建一个新项目
2. 进入 SQL Editor，运行 `supabase-schema.sql` 创建数据库表
3. 在 Storage 中创建 `item-images` 存储桶（公开读、认证用户写）
4. 在 Authentication - Settings 中配置站点 URL

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 Supabase 项目配置：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 导入该仓库
3. 在 Vercel 项目设置中添加环境变量 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 部署

## 项目结构

```
src/
├── app/
│   ├── page.tsx          # 首页
│   ├── layout.tsx        # 全局布局
│   ├── globals.css       # 全局样式
│   ├── lost/             # 寻物列表
│   ├── found/            # 招领列表
│   ├── post/             # 发布信息
│   ├── item/[id]/        # 物品详情
│   ├── dashboard/        # 用户中心
│   ├── admin/            # 管理后台
│   └── auth/             # 登录/注册
├── components/
│   ├── Navbar.tsx        # 导航栏
│   ├── Footer.tsx        # 页脚
│   ├── ItemCard.tsx      # 物品卡片
│   ├── SearchBar.tsx     # 搜索栏
│   └── CategoryFilter.tsx # 分类筛选
├── lib/
│   ├── supabase.ts       # 客户端 SDK
│   ├── supabase-server.ts # 服务端 SDK
│   └── supabase-middleware.ts # 中间件
├── types/
│   └── index.ts          # TypeScript 类型
└── middleware.ts          # Auth 中间件
```

## 评分标准对应

| 评分项 | 实现内容 | 分值 |
|--------|----------|------|
| 报告选题与结构 | 完整文档 + 项目结构清晰 | 20 |
| 系统设计流程 | 需求分析→设计→实现→部署 | 30 |
| 编码能力 | Next.js + TypeScript + Tailwind | 30 |
| 实践反思 | 完整开发流程记录 | 10 |
| 内容完整性 | 前后端完整功能 | 10 |
