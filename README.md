# 智选 · Temu 商家工作台

面向 Temu 商家运营岗位的招商 / 分层 / 扶持 / 洞察一体化演示工作台，覆盖 JD 的 4 条核心职责。

## 模块对应 JD 职责

| 模块 | JD 对应职责 | 关键能力 |
|---|---|---|
| 招商雷达 | 定向招商：招募有出海经验的优质商家入驻 | 30 条候选池 · 契合度 4 维加权评分 · 类目 / 市场缺口洞察 · 切入话术生成 |
| 分层运营驾驶舱 | 商家分层运营：按特征制定差异化运营策略 | 80 条在管商家 · GMV × 成长率四象限散点 · 4 套差异化运营策略 + KPI |
| 新商 90 天落地规划器 | 新商扶持：帮新入驻商家做市场定位与商品规划 | 5 类目 × 4 客单价段 × 5 市场组合的规则引擎 · 90 天三阶段动作 + KPI 看板 |
| 行业洞察与需求挖掘 | 数据分析：出行业分析报告，挖掘客户潜在需求 | 12 月类目趋势 · 平台对比雷达 · 季节性热点日历 · 评论 / 客服记录 AI 需求挖掘 |

## 全局 CSV 上传

顶部右上「📁 上传数据」打开 Modal，4 个上传区分别对应 4 个模块的数据集，每区可下载 UTF-8 BOM 中文 CSV 模板。模块 2（分层运营）已端到端打通：上传后散点图 / 策略卡 / 明细表立即切换到真实数据。

## 本地运行

```bash
npm install
npm run dev      # 默认 http://localhost:5173/
npm run build    # 生产构建到 dist/
npm run preview  # 预览 dist 构建产物
```

环境要求：Node.js ≥ 18，演示分辨率 ≥ 1280×800。

## 技术栈

React 19 + Vite · Tailwind CSS v3 · Recharts · PapaParse · lucide-react。所有数据 mock 在内存，不使用 localStorage。

## 部署到 Vercel

1. 将仓库推到 GitHub
2. 登录 [vercel.com](https://vercel.com) → New Project → Import Git Repository
3. Framework Preset 选「Vite」（自动识别），其他保持默认：
   - Build Command：`npm run build`
   - Output Directory：`dist`
4. 点 Deploy，等待约 30 秒构建完成
5. Vercel 会自动分配一个 `*.vercel.app` 域名，可绑自定义域

后续 push 到 main 分支会自动触发重新部署。

## 目录结构

```
src/
├── App.jsx                       主入口 + 布局 + 模块切换
├── context/
│   └── DataContext.jsx          全局 4 数据集 Provider
├── components/
│   ├── Sidebar.jsx              侧边栏导航
│   ├── TopBar.jsx               顶栏 + 上传入口
│   ├── KpiCards.jsx             顶部全局 KPI 卡片
│   ├── UploadModal.jsx          全局 CSV 上传 Modal（4 区 + 4 解析器）
│   └── modules/
│       ├── RecruitRadar.jsx          模块 1
│       ├── TieringDashboard.jsx      模块 2
│       ├── PlanningGenerator.jsx     模块 3
│       └── IndustryInsight.jsx       模块 4
└── data/
    ├── recruitData.js           模块 1 mock + 类目级切入话术池
    ├── tieringData.js           模块 2 mock（确定性生成）+ 象限元数据
    ├── industryData.js          模块 4 趋势 / 雷达 / 关键词 / 节庆 / 分析模板
    └── planningRules.js         模块 3 规则引擎（5 × 4 = 20 定位条目 + 5 节奏模板）
```
