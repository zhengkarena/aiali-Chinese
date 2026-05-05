// 80 条在管商家 mock 数据。
// 字段：id, name, category, monthly_gmv_usd, growth_rate, quadrant,
//       lifecycle_stage, main_market, dsr_score
// 象限阈值：GMV 50,000 美元 / 环比成长率 20%
// 数据用确定性随机数生成，保证演示可复现。

export const CATEGORIES = ['家居小家电', '快时尚女装', '3C 配件', '美妆个护', '户外运动']
export const MARKETS = ['北美', '欧洲', '东南亚', '拉美', '中东']

export const QUADRANT_META = {
  star: { label: '明星商家', color: '#EF4444', desc: '高 GMV · 高成长' },
  potential: { label: '潜力商家', color: '#3B82F6', desc: '低 GMV · 高成长' },
  cashcow: { label: '现金牛商家', color: '#10B981', desc: '高 GMV · 低成长' },
  optimize: { label: '待优化商家', color: '#94A3B8', desc: '低 GMV · 低成长' },
}

export const QUADRANT_THRESHOLDS = { gmv: 50000, growth: 20 }

const NAMES_BY_CATEGORY = {
  家居小家电: [
    '华灯小家电', '沐风家电', '暖居生活', '简舍家居', '时雨厨电',
    '知微小电', '璞实家电', '巢光家居', '拙朴家电', '月白小家',
    '安屿家居', '清明小电', '燃光厨电', '静晨家电', '日和小家', '木屿家居',
  ],
  快时尚女装: [
    '素白女装', '蝶语时装', '初樱衣舍', '绾月服饰', '浮光女装',
    '简夏时装', '蘩花服饰', '半棠衣舍', '凝霜女装', '七间女装',
    '寻雨时装', '鹿绒女装', '银汉时装', '暮辞衣舍', '山茶女装', '余白服饰',
  ],
  '3C 配件': [
    '极速 3C', '拓界数码', '星轨配件', '竞速电子', '启明数码',
    '引力配件', '临界数码', '飞渡 3C', '元域数码', '纵横配件',
    '辰光数码', '极昼电子', '越界 3C', '量子配件', '银翼数码', '超弦电子',
  ],
  美妆个护: [
    '沐光美妆', '雪颜本草', '羽颜个护', '晨露美妆', '月颜美妆',
    '棠染美妆', '茉初个护', '玉颜本草', '春茂美妆', '乘月美妆',
    '鹿茸本草', '朝颜美妆', '樱漾美妆', '漪然个护', '安生美妆', '微澜美妆',
  ],
  户外运动: [
    '翼行户外', '野径运动', '登程户外', '远行装备', '山阙户外',
    '冲岭运动', '荒径户外', '拓野装备', '巅行户外', '长风运动',
    '荒夷户外', '砾途装备', '攀云户外', '极境运动', '行客户外', '北麓装备',
  ],
}

const LIFECYCLE_BY_QUADRANT = {
  star: ['成熟', '成长', '成长', '成熟'],
  potential: ['成长', '新商', '成长', '新商'],
  cashcow: ['成熟', '成熟', '衰退', '成熟'],
  optimize: ['新商', '衰退', '衰退', '新商'],
}

// 22 + 22 + 20 + 16 = 80
const QUADRANT_PLAN = [
  { key: 'star',      count: 22, gmv: [50000, 320000], growth: [20, 200] },
  { key: 'potential', count: 22, gmv: [8000, 49000],   growth: [21, 180] },
  { key: 'cashcow',   count: 20, gmv: [55000, 240000], growth: [-15, 19] },
  { key: 'optimize',  count: 16, gmv: [5000, 49000],   growth: [-30, 19] },
]

// 简单线性同余生成器，确定性
function makeRand(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function buildData() {
  const rand = makeRand(42)
  const pick = (arr) => arr[Math.floor(rand() * arr.length)]
  const range = (lo, hi) => lo + rand() * (hi - lo)

  // 80 个 (name, category) 对
  const pool = []
  for (const cat of CATEGORIES) {
    for (const name of NAMES_BY_CATEGORY[cat]) {
      pool.push({ name, category: cat })
    }
  }
  // Fisher–Yates 打散，让每个象限里类目分布均匀
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const data = []
  let idx = 0
  let id = 1
  for (const plan of QUADRANT_PLAN) {
    for (let k = 0; k < plan.count; k++) {
      const m = pool[idx++]
      data.push({
        id: id++,
        name: m.name,
        category: m.category,
        monthly_gmv_usd: Math.round(range(plan.gmv[0], plan.gmv[1])),
        growth_rate: Math.round(range(plan.growth[0], plan.growth[1]) * 10) / 10,
        quadrant: plan.key,
        lifecycle_stage: pick(LIFECYCLE_BY_QUADRANT[plan.key]),
        main_market: pick(MARKETS),
        dsr_score: Math.round((3.6 + rand() * 1.3) * 10) / 10,
      })
    }
  }
  return data
}

export const tieringData = buildData()

export const QUADRANT_STRATEGIES = {
  star: {
    summary: '锁定头部、极致放大。把平台最优资源压在能跑通的商家身上。',
    actions: [
      'S 级资源位倾斜：首页推荐、品类导航、搜索置顶位优先分配',
      '专属 BD 跟进：1 对 1 行业经理 + 周度对齐节奏',
      '大促活动优先报名：黑五、网一、双 11 通道直通',
      '新品首发权益：上新流量包 + 站外联合推广',
    ],
    kpis: ['月 GMV 同比 ≥ 50%', 'DSR ≥ 4.7', '爆款数 ≥ 3'],
  },
  potential: {
    summary: '加速成长、卡位赛道。用扶持包推他们尽快越过明星线。',
    actions: [
      '流量扶持包：30 天定向曝光预算 + 新品试发流量',
      '爆款打造辅导：选品诊断 + 详情页改版 + A/B 主图测试',
      '定向培训课程：广告投放、关键词、内容种草系列课',
      '营销工具试用：站外联盟、KOC 派样、海报模板免费用',
    ],
    kpis: ['90 天内 GMV 突破 5 万美元', '转化率提升 30%', '爆款 ≥ 1'],
  },
  cashcow: {
    summary: '稳住盘子、激活复购。同时帮他们孵化新品类避免老化。',
    actions: [
      '稳定运营节奏：库存预测 + 价格保护 + 物流优先级',
      '复购召回活动：老客优惠券、订阅制、私域唤醒',
      '新品类孵化：基于现有人群推荐邻近品类做横向扩品',
      '会员体系搭建：等级权益 + 生日礼包 + 专属客服通道',
    ],
    kpis: ['复购率 ≥ 25%', 'GMV 环比不下滑', '新品类 SKU ≥ 10'],
  },
  optimize: {
    summary: '诊断 + 兜底。能救则救，救不动的有序退出，腾出资源位。',
    actions: [
      '诊断报告输出：流量、转化、客单、复购四维体检',
      '基础运营辅导：标题、主图、价格带、关键词的最低门槛改造',
      '清退预警机制：连续 60 天 DSR < 4.0 或 GMV < 5 千美元触发预警',
      '退出 / 转型建议：合并到供应商联营、转批发、或主动清退',
    ],
    kpis: ['90 天 DSR 回升至 ≥ 4.3', '转化率回到品类均值', '违规归零'],
  },
}
