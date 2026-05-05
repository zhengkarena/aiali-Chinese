// 招商雷达 mock：30 个候选商家。
// 类目 / 市场常量复用自 tieringData，保持模块间口径一致。

import { CATEGORIES, MARKETS } from './tieringData.js'

export { CATEGORIES, MARKETS }

export const PLATFORMS = [
  'Amazon',
  '独立站',
  'SHEIN',
  'TikTok Shop',
  '速卖通',
  'Wish',
]

// 契合度评分公式（在 UI 上展示作为方法论）
export const FIT_FORMULA = {
  expression:
    '契合度 = 类目匹配度 × 40% + 出海能力 × 25% + 平台缺口度 × 20% + 合作意愿预测 × 15%',
  parts: [
    {
      name: '类目匹配度',
      weight: 40,
      desc: '商家主营类目与平台缺口类目的重合度，缺口品类商家加权',
    },
    {
      name: '出海能力',
      weight: 25,
      desc: '已入驻平台数 × 海外仓覆盖 × 跨境运营年限的综合评分',
    },
    {
      name: '平台缺口度',
      weight: 20,
      desc: '目标市场该类目当前供给与流量需求的缺口大小',
    },
    {
      name: '合作意愿预测',
      weight: 15,
      desc: '历史 BD 接触结果 + 同行入驻情况 + 公开招聘 / 投放信号',
    },
  ],
}

// 类目级切入话术池：每条带可适用市场标签，'*' 表示通用
const PITCH_BANK = {
  家居小家电: [
    {
      markets: ['北美'],
      text: 'Temu 北美厨房小家电搜索量过去 6 个月同比 +147%，头部缺口 5 席，可优先卡位',
    },
    {
      markets: ['北美'],
      text: '全托管模式可降低海外仓 + 物流成本约 18%，对独立站获客成本上升的品牌友好',
    },
    {
      markets: ['欧洲'],
      text: 'VAT 代缴 + DAC7 合规通道一站式协助，规避独立站合规风险',
    },
    {
      markets: ['欧洲'],
      text: '欧洲家居小家电客单价比北美高 22%，毛利空间充足',
    },
    {
      markets: ['东南亚'],
      text: '东南亚厨房小家电近 12 个月 GMV +95%，越南 / 印尼为重点市场',
    },
    {
      markets: ['北美', '欧洲'],
      text: 'Temu 欧美家居类目 GMV 过去 12 个月同比 +210%，处于流量红利期',
    },
    {
      markets: ['*'],
      text: '新签商家可领取 30 天 5 万美元流量扶持包 + 专属 BD 跟进',
    },
    {
      markets: ['*'],
      text: '11.11 大促 S 级类目入场 Top 10 商家可锁定首页推荐位 3 天',
    },
    {
      markets: ['*'],
      text: '平台代仓代发：仓配一体降低 30% 履约成本，对大件家电友好',
    },
  ],
  快时尚女装: [
    {
      markets: ['北美'],
      text: 'Temu 女装 18-34 岁用户占比 68%，与品牌目标人群高度重合',
    },
    {
      markets: ['北美'],
      text: '北美女装价格带 $5-15 区间缺乏中腰部商家，可优先卡位',
    },
    {
      markets: ['北美', '欧洲'],
      text: '平台主图工厂 24 小时输出 5 套 A/B 主图，匹配快上新节奏',
    },
    {
      markets: ['欧洲'],
      text: '欧洲快时尚客单价 $8-20，比北美高 18%，毛利空间更舒服',
    },
    {
      markets: ['欧洲'],
      text: '英国站女装搜索 Top 100 词中 65% 仍无头部商家垄断，卡位窗口期',
    },
    {
      markets: ['东南亚'],
      text: '东南亚女装客单价 $3-8 区间为最大缺口，匹配快时尚定位',
    },
    {
      markets: ['*'],
      text: '站外联盟 + KOC 派样资源池 1.2 万人，铺量效果接近 SHEIN 早期',
    },
    {
      markets: ['*'],
      text: '纺织品标签 + REACH 测试合规通道平台一站式协助',
    },
    {
      markets: ['*'],
      text: '上新流量包：每 SKU 上架 7 天内分配 3 万曝光做点击率筛选',
    },
  ],
  '3C 配件': [
    {
      markets: ['北美'],
      text: 'Temu 3C 配件类目过去 12 个月 GMV +180%，但 SHEIN/Amazon 在该类目供给紧张',
    },
    {
      markets: ['北美'],
      text: 'Type-C / MagSafe 等热门词搜索量月环比 +45%，缺乏中端品牌供给',
    },
    {
      markets: ['北美', '欧洲'],
      text: 'FCC / UL / CE 等认证通道平台协助，平均节省 40% 合规时间',
    },
    {
      markets: ['欧洲'],
      text: '欧洲 3C 配件供给端集中度低，Top 50 商家占类目 GMV 不到 35%',
    },
    {
      markets: ['东南亚'],
      text: '东南亚 3C 配件年增速 28%，越南 / 印尼 / 泰国为重点市场',
    },
    {
      markets: ['东南亚'],
      text: '客单价 $5-15 区间是当前 Temu 东南亚最大缺口段',
    },
    {
      markets: ['中东'],
      text: '中东 3C 配件客单价 $20-40，毛利空间显著高于其他市场',
    },
    {
      markets: ['*'],
      text: '新品首发流量包：上架前 14 天可领定向曝光 50 万 + 详情页改版顾问',
    },
    {
      markets: ['*'],
      text: '电子类商家专属保险通道：电芯类目质量纠纷平台先行兜底',
    },
  ],
  美妆个护: [
    {
      markets: ['北美'],
      text: '平台 FDA 备案绿色通道，新品上架时间从 45 天缩短至 14 天',
    },
    {
      markets: ['北美'],
      text: '美妆个护过去 6 个月新增用户 +320 万，转化率高于平台均值 22%',
    },
    {
      markets: ['北美', '欧洲'],
      text: '站外达人池 KOC 资源 1.2 万人，垂直美妆 4500 人可联动',
    },
    {
      markets: ['欧洲'],
      text: '欧盟 CPNP 备案代理通道，规避独立站合规风险',
    },
    {
      markets: ['欧洲'],
      text: '欧洲美妆客单价 $15-30 区间品牌空缺度高，可错位竞争',
    },
    {
      markets: ['东南亚'],
      text: '东南亚护肤月销 +130%，本地肤质数据已沉淀，可定向推荐',
    },
    {
      markets: ['中东'],
      text: '中东高端香氛 / 个护客单价是其他市场 2 倍，匹配品牌商家',
    },
    {
      markets: ['*'],
      text: '平台合规 / 检测 / 包装设计 3 大新商扶持模块免费解锁前 90 天',
    },
    {
      markets: ['*'],
      text: '美妆店铺转化率诊断工具：免费输出主图 + 详情页 + 价格带 3 维报告',
    },
  ],
  户外运动: [
    {
      markets: ['北美'],
      text: 'Temu 北美户外类目缺中端价位段 ($30-80) 品牌，缺口位 8 席',
    },
    {
      markets: ['北美'],
      text: '美西海外仓配送时效从 11 天降到 4 天，户外大件友好',
    },
    {
      markets: ['北美', '欧洲'],
      text: '春夏季节性需求集中 3-7 月，流量分配周期可定制 14-90 天',
    },
    {
      markets: ['欧洲'],
      text: '欧洲户外用品客单价 $40-120，与北美形成阶梯价位组合',
    },
    {
      markets: ['拉美'],
      text: '拉美户外市场年增速 22%，巴西 / 墨西哥为最大单一市场',
    },
    {
      markets: ['拉美'],
      text: '葡语 / 西语客服 + 本地支付（PIX / OXXO）平台已铺好',
    },
    {
      markets: ['中东'],
      text: '中东沙漠 / 露营装备客单价 $50-150，处于品类红利期',
    },
    {
      markets: ['*'],
      text: '产品测评内容池：与户外类垂直 KOL 200+ 已建立长期合作',
    },
    {
      markets: ['*'],
      text: '大件物流补贴：单件 1.5kg 以上专属价格通道，年节省约 12%',
    },
  ],
}

const NAMES_BY_CATEGORY = {
  家居小家电: ['临川家电', '木舍小电', '栖梧家居', '合屋家电', '稚生小家', '星澜家电'],
  快时尚女装: ['浣月女装', '琴书时装', '蘅芜服饰', '青鸾女装', '若枝时装', '浮云衣舍'],
  '3C 配件': ['璇玑数码', '磁原 3C', '北斗配件', '猎鹰电子', '合界数码', '深空配件'],
  美妆个护: ['蕊光美妆', '知茉本草', '研山美妆', '沁玉个护', '青壤美妆', '临颜本草'],
  户外运动: ['巘谷户外', '踏歌运动', '瀚海装备', '长岭户外', '风信运动', '原野装备'],
}

function makeRand(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function shuffle(arr, rand) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildData() {
  const rand = makeRand(202)
  const data = []
  let id = 1
  for (const cat of CATEGORIES) {
    for (const name of NAMES_BY_CATEGORY[cat]) {
      const numMarkets = 1 + Math.floor(rand() * 3) // 1-3
      const main_markets = shuffle(MARKETS, rand).slice(0, numMarkets)

      const numPlatforms = 2 + Math.floor(rand() * 3) // 2-4
      const existing_platforms = shuffle(PLATFORMS, rand).slice(0, numPlatforms)

      const overseas_experience_score = Math.round(40 + rand() * 55) // 40-95
      const fit_score = Math.round(55 + rand() * 43) // 55-98
      const estimated_gmv_usd = Math.round(500 + rand() * 29500) * 1000 // 0.5M-30M

      const bank = PITCH_BANK[cat]
      let candidates = bank.filter(
        (p) =>
          p.markets.includes('*') ||
          p.markets.some((mk) => main_markets.includes(mk)),
      )
      if (candidates.length < 3) candidates = bank
      const numPitches = 3 + Math.floor(rand() * 3) // 3-5
      const pitch_points = shuffle(candidates, rand)
        .slice(0, Math.min(numPitches, candidates.length))
        .map((p) => p.text)

      data.push({
        id: id++,
        name,
        category: cat,
        existing_platforms,
        overseas_experience_score,
        fit_score,
        estimated_gmv_usd,
        main_markets,
        pitch_points,
      })
    }
  }
  return data
}

export const recruitData = buildData()
