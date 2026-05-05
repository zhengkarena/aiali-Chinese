// 行业洞察 mock 数据。
// 时间口径：以 2026-05-05 为今日，过去 12 个月趋势 = 2025-05 → 2026-04。

import { CATEGORIES } from './tieringData.js'

export { CATEGORIES }

// ── 类目趋势：12 个月 GMV 指数（基期 = 2025-05 平均）。
// 季节性：户外 Q2-Q3 高峰、美妆 Q4 翘尾 + 情人节、3C 黑五大幅 spike、
// 女装春秋上新双峰、家居 Q4 礼赠期。
export const TREND_MONTHS = [
  '2025-05', '2025-06', '2025-07', '2025-08', '2025-09', '2025-10',
  '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04',
]

export const TREND_LABELS = [
  '5月', '6月', '7月', '8月', '9月', '10月',
  '11月', '12月', '1月', '2月', '3月', '4月',
]

const TREND_RAW = {
  家居小家电:   [70, 72, 75, 70, 78, 88, 110, 105, 70, 72, 75, 78],
  快时尚女装:   [80, 78, 70, 75, 85, 90, 105, 100, 70, 75, 85, 88],
  '3C 配件':    [85, 82, 88, 80, 90, 95, 130, 115, 80, 78, 82, 85],
  美妆个护:     [75, 70, 72, 75, 78, 85,  95, 100, 78, 88, 80, 82],
  户外运动:     [95, 110, 120, 105, 90, 75,  85,  80, 60, 65, 75, 90],
}

export const trendData = TREND_LABELS.map((m, i) => {
  const row = { month: m, _key: TREND_MONTHS[i] }
  for (const cat of CATEGORIES) row[cat] = TREND_RAW[cat][i]
  return row
})

export const TREND_COLORS = {
  家居小家电: '#3b82f6',
  快时尚女装: '#ec4899',
  '3C 配件':  '#8b5cf6',
  美妆个护:   '#FB7701',
  户外运动:   '#10b981',
}

// ── 价格带分布：每类目内各价位 SKU 占比（合计 100%）。
export const PRICE_BANDS = ['<$10', '$10-30', '$30-50', '$50-100', '>$100']

export const PRICE_BAND_COLORS = {
  '<$10':    '#c7d2fe',
  '$10-30':  '#93c5fd',
  '$30-50':  '#fbbf24',
  '$50-100': '#fb923c',
  '>$100':   '#ef4444',
}

export const priceBandData = [
  { category: '家居小家电', '<$10':  8, '$10-30': 42, '$30-50': 30, '$50-100': 16, '>$100':  4 },
  { category: '快时尚女装', '<$10': 38, '$10-30': 45, '$30-50': 12, '$50-100':  4, '>$100':  1 },
  { category: '3C 配件',    '<$10': 25, '$10-30': 38, '$30-50': 22, '$50-100': 12, '>$100':  3 },
  { category: '美妆个护',   '<$10': 32, '$10-30': 40, '$30-50': 18, '$50-100':  8, '>$100':  2 },
  { category: '户外运动',   '<$10':  6, '$10-30': 22, '$30-50': 32, '$50-100': 28, '>$100': 12 },
]

// ── 平台对比雷达图：5 维 × 4 平台，0-100 分。
// 口径：流量规模看月活量级 / 转化效率看冲动转化率 / 客单价看类目均价倒序映射 /
//      复购率看 90 天复购 / 物流时效看末端达成率 + 平均时效。
export const PLATFORMS = ['Temu', 'SHEIN', 'Amazon', 'TikTok Shop']

export const PLATFORM_COLORS = {
  Temu:           '#FB7701',
  SHEIN:          '#1f2937',
  Amazon:         '#f59e0b',
  'TikTok Shop':  '#06b6d4',
}

export const platformRadarData = [
  // Temu 流量大、客单低、转化高（冲动消费）；Amazon 物流强、客单高；
  // SHEIN 复购最高；TikTok Shop 流量增长快、客单中等。
  { dim: '流量规模',  Temu: 95, SHEIN: 80, Amazon: 90, 'TikTok Shop': 92 },
  { dim: '转化效率',  Temu: 88, SHEIN: 78, Amazon: 80, 'TikTok Shop': 65 },
  { dim: '客单价',    Temu: 40, SHEIN: 55, Amazon: 90, 'TikTok Shop': 65 },
  { dim: '复购率',    Temu: 70, SHEIN: 92, Amazon: 75, 'TikTok Shop': 55 },
  { dim: '物流时效',  Temu: 75, SHEIN: 70, Amazon: 95, 'TikTok Shop': 65 },
]

// ── 热搜词 Top 20：中英对照 + 月搜索量 + 同比。
export const hotKeywords = [
  { rank:  1, en: 'summer dress',       zh: '夏季连衣裙',     volume: 1820000, growth:  +35, category: '快时尚女装' },
  { rank:  2, en: 'magsafe charger',    zh: '磁吸充电器',     volume: 1540000, growth:  +62, category: '3C 配件' },
  { rank:  3, en: 'sunscreen',          zh: '防晒霜',         volume: 1420000, growth:  +48, category: '美妆个护' },
  { rank:  4, en: 'air fryer',          zh: '空气炸锅',       volume: 1280000, growth:  +28, category: '家居小家电' },
  { rank:  5, en: 'camping tent',       zh: '户外帐篷',       volume: 1150000, growth:  +75, category: '户外运动' },
  { rank:  6, en: 'wireless earbuds',   zh: '无线耳机',       volume: 1090000, growth:  +18, category: '3C 配件' },
  { rank:  7, en: 'swimsuit',           zh: '泳衣',           volume:  980000, growth:  +95, category: '快时尚女装' },
  { rank:  8, en: 'iphone 16 case',     zh: 'iPhone 16 手机壳', volume: 920000, growth: +120, category: '3C 配件' },
  { rank:  9, en: 'yoga mat',           zh: '瑜伽垫',         volume:  860000, growth:  +22, category: '户外运动' },
  { rank: 10, en: 'lipstick',           zh: '口红',           volume:  790000, growth:  +12, category: '美妆个护' },
  { rank: 11, en: 'kitchen knife',      zh: '厨房刀具',       volume:  720000, growth:  +24, category: '家居小家电' },
  { rank: 12, en: 'graphic tee',        zh: '印花 T 恤',      volume:  680000, growth:  +33, category: '快时尚女装' },
  { rank: 13, en: 'usb-c hub',          zh: 'Type-C 拓展坞',  volume:  640000, growth:  +41, category: '3C 配件' },
  { rank: 14, en: 'perfume',            zh: '香水',           volume:  590000, growth:  +28, category: '美妆个护' },
  { rank: 15, en: 'cooler bag',         zh: '保温冰桶',       volume:  540000, growth: +110, category: '户外运动' },
  { rank: 16, en: 'sneakers',           zh: '运动鞋',         volume:  510000, growth:  +19, category: '户外运动' },
  { rank: 17, en: 'mascara',            zh: '睫毛膏',         volume:  470000, growth:  +14, category: '美妆个护' },
  { rank: 18, en: 'humidifier',         zh: '加湿器',         volume:  420000, growth:   +8, category: '家居小家电' },
  { rank: 19, en: 'mom dress',          zh: '母亲节连衣裙',   volume:  380000, growth: +185, category: '快时尚女装' },
  { rank: 20, en: 'father day gift',    zh: '父亲节礼物',     volume:  340000, growth: +145, category: '户外运动' },
]

// ── 季节性热点日历：2026-05-05 起 3 个月节点。
// status: ongoing（预热中） / upcoming（即将） / future（远期规划）
export const seasonalEvents = [
  {
    name: '美国母亲节',
    date: '2026-05-10',
    range: '5 月 10 日',
    markets: ['北美'],
    categories: ['美妆个护', '家居小家电', '快时尚女装'],
    status: 'ongoing',
    suggestion:
      '主图加母亲节标签，老客 -10% 唤醒券同步上架；建议 5/8 前完成礼盒 SKU 上架',
  },
  {
    name: '阵亡将士纪念日大促',
    date: '2026-05-25',
    range: '5 月 25 日 - 5 月 27 日',
    markets: ['北美'],
    categories: ['户外运动', '家居小家电', '3C 配件'],
    status: 'upcoming',
    suggestion:
      '报名 Temu「夏季开门红」会场；户外类备好 BBQ / 露营场景化主图',
  },
  {
    name: '开斋节（Eid al-Adha）',
    date: '2026-05-27',
    range: '5 月 27 日',
    markets: ['中东'],
    categories: ['快时尚女装', '美妆个护', '家居小家电'],
    status: 'upcoming',
    suggestion:
      '提前 14 天上架礼盒装 SKU；主图加阿拉伯文标签；客服值班覆盖中东时区',
  },
  {
    name: '美国父亲节',
    date: '2026-06-21',
    range: '6 月 21 日',
    markets: ['北美'],
    categories: ['3C 配件', '户外运动'],
    status: 'future',
    suggestion:
      '6 月初启动主题 landing page；礼物推荐位重点放剃须 / EDC / 户外装备',
  },
  {
    name: '欧洲夏季打折季',
    date: '2026-06-24',
    range: '6 月 24 日 - 7 月 15 日',
    markets: ['欧洲'],
    categories: ['快时尚女装', '3C 配件', '家居小家电', '美妆个护'],
    status: 'future',
    suggestion:
      '6 月初提交折扣价格审批；英德法意西五站点同步参与；服饰类备货比平日 +50%',
  },
  {
    name: '美国独立日',
    date: '2026-07-04',
    range: '7 月 4 日',
    markets: ['北美'],
    categories: ['户外运动', '家居小家电'],
    status: 'future',
    suggestion:
      '红蓝白主题主图；BBQ / 烟花 / 露营品类前置流量；提前 10 天投放',
  },
  {
    name: 'Amazon Prime Day（防御战）',
    date: '2026-07-15',
    range: '7 月 15 日 - 7 月 16 日',
    markets: ['北美', '欧洲'],
    categories: ['3C 配件', '家居小家电', '美妆个护', '户外运动'],
    status: 'future',
    suggestion:
      '提前 14 天囤备爆款；站外联盟同步预算；价格守恒承诺锁住老客；详情页加价格对比',
  },
  {
    name: '返校季预热',
    date: '2026-07-25',
    range: '7 月 25 日起',
    markets: ['北美', '欧洲'],
    categories: ['快时尚女装', '3C 配件', '家居小家电'],
    status: 'future',
    suggestion:
      '服饰类 7 月底上新主推 $10-30 价位带；3C 类捆绑笔电外设礼包',
  },
]

// ── AI 需求挖掘：分析模板。
// painPoints 的 score 是 0-100 负向情感强度（越大越严重）。
export const PAIN_POINTS_TEMPLATE = [
  { label: '物流时效慢', score: 68, mention: 0.31 },
  { label: '尺码不准 / 描述偏差', score: 55, mention: 0.24 },
  { label: '商品与图不符', score: 47, mention: 0.18 },
  { label: '客服响应慢', score: 38, mention: 0.14 },
  { label: '退换货流程繁琐', score: 32, mention: 0.11 },
]

export const INSIGHTS_TEMPLATE = [
  {
    tag: '尺码',
    title: '亚裔身材尺码偏小问题集中在女装下装与鞋类',
    body:
      '过去 30 天评论中，72% 的尺码相关负向评论集中在女装裤装、连衣裙腰围、鞋类（女款 35-37 码）。北美用户实际穿着尺码普遍比标注大 1-1.5 码。',
  },
  {
    tag: '物流',
    title: '欧洲偏远地区物流满意度显著低于平均',
    body:
      '物流类负向评论中 82% 来自英国苏格兰、德国巴伐利亚、法国阿尔卑斯山区，平均时效 11.4 天 vs 主城 6.2 天，转化率受影响约 -8 pp。',
  },
  {
    tag: '心智',
    title: '"品质感"成为美妆 / 家居类正向词频上升最快关键词',
    body:
      '美妆个护与家居小家电的正向评论中"品质感 / texture / sturdy"词频环比 +120%，对应客单价 $30-80 区间转化率上行 +14%。',
  },
  {
    tag: '场景',
    title: '户外类目用户更关心"轻量化"与"快速搭建"',
    body:
      '户外帐篷 / 折叠桌椅评论中"轻量化 / 一键展开 / 单人可装"出现频次 +95%，建议在详情页置顶展示重量数据与展开演示视频。',
  },
  {
    tag: '退货',
    title: '退货归因中 35% 是"颜色与图片有差异"',
    body:
      '美妆口红 / 家居布艺 / 女装染色单品退货原因 Top1 是色差，建议引入实拍光源标准（5500K 自然光）+ 显示器校色提示。',
  },
]

export const ACTIONS_TEMPLATE = [
  {
    tag: '商品',
    title: '女装类目强制添加亚裔尺码对照模块',
    detail:
      '详情页新增"建议尺码"动态推荐控件，根据用户身高体重输出推荐尺码，预计退货率下降 6-9 pp，转化率提升 3-5 pp。',
    impact: '退货 ↓6-9pp · 转化 ↑3-5pp',
  },
  {
    tag: '物流',
    title: '欧洲偏远地区开通同城仓 / 跨仓调拨',
    detail:
      '在英国格拉斯哥、德国慕尼黑增设第二仓节点，目标 90% 订单时效从 11.4 天压到 6 天内，覆盖订单 ~12% 但 NPS 影响 ~25%。',
    impact: '时效 ↓5 天 · NPS ↑8',
  },
  {
    tag: '内容',
    title: '美妆 / 家居类目联动品牌商家做品质背书内容',
    detail:
      '与契合度 ≥80 的品牌商家共建"工厂直发"溯源短视频，在详情页 + 站外联盟双投放，重点覆盖客单 $30-80 区间。',
    impact: '客单 ↑12% · 转化 ↑4pp',
  },
  {
    tag: '体验',
    title: '色差类商品引入光源标准 + 校色提示',
    detail:
      '美妆口红、家居布艺、女装染色单品强制 5500K 自然光实拍 + 详情页弹出"建议在自然光下查看"，预计色差归因退货下降 40%。',
    impact: '退货 ↓40% (色差类)',
  },
  {
    tag: '运营',
    title: '客服响应时效 KPI 拉齐到 90 秒首响',
    detail:
      '客服响应慢评论占 14%，建议把首响 SLA 从当前 4 分钟压到 90 秒，客服满意度 +18 pp，复购率 +3 pp。',
    impact: '满意度 ↑18pp · 复购 ↑3pp',
  },
]
