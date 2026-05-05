// 新商 90 天规划器规则引擎。
// 输入：商家名 / 类目 / 客单价段 / 市场 / SKU 数 / 是否有海外仓。
// 输出：市场定位 / 商品规划 / 90 天节奏 / KPI 看板。
//
// 设计：(category × priceBand) → 定位与商品规划基线；market → 通用市场覆盖；
//      category → 90 天节奏模板；KPI 由组合参数动态计算。

import { CATEGORIES, MARKETS } from './tieringData.js'

export { CATEGORIES, MARKETS }

export const PRICE_BANDS = ['<$10', '$10-30', '$30-80', '>$80']

// ─── 类目画像（影响 KPI 基线 + SKU 结构）───
const CATEGORY_PROFILES = {
  家居小家电: {
    cat_factor: 1.0,
    conversion_base: 3.2,
    repurchase_base: 12,
    return_base: 8,
    sku_structure: { traffic: 35, profit: 45, image: 20 },
  },
  快时尚女装: {
    cat_factor: 0.95,
    conversion_base: 4.0,
    repurchase_base: 18,
    return_base: 15,
    sku_structure: { traffic: 50, profit: 35, image: 15 },
  },
  '3C 配件': {
    cat_factor: 1.1,
    conversion_base: 3.5,
    repurchase_base: 10,
    return_base: 5,
    sku_structure: { traffic: 30, profit: 50, image: 20 },
  },
  美妆个护: {
    cat_factor: 1.05,
    conversion_base: 3.8,
    repurchase_base: 22,
    return_base: 12,
    sku_structure: { traffic: 40, profit: 40, image: 20 },
  },
  户外运动: {
    cat_factor: 1.0,
    conversion_base: 2.8,
    repurchase_base: 8,
    return_base: 8,
    sku_structure: { traffic: 30, profit: 50, image: 20 },
  },
}

// ─── 市场画像（覆盖型，叠加在类目定位上）───
const MARKET_PROFILES = {
  北美: {
    market_factor: 1.3,
    persona_overlay: '北美 25-40 岁中产 / 双职工，决策周期 5-7 天，看重认证与时效',
    insights: [
      'UL / ETL / FCC 等认证主图必须置顶，否则差评率 +30%',
      '美西 / 美东海外仓首选，时效从 11 天压到 4 天',
      'BFCM 与 Prime Day 是必打节点，备货前置 60 天',
    ],
    conversion_adjust: 0.3,
    return_adjust: 0,
    repurchase_adjust: 2,
  },
  欧洲: {
    market_factor: 1.1,
    persona_overlay: '欧洲价值导向用户，对环保 / 合规敏感，决策周期 7-10 天',
    insights: [
      'CE / REACH / CPNP 一站式合规通道，五站点同步铺货',
      '欧洲偏远地区物流时效专项关注（苏格兰 / 巴伐利亚 / 阿尔卑斯）',
      '夏季打折季（6 月底 - 7 月）+ 圣诞为两大节点',
    ],
    conversion_adjust: 0.1,
    return_adjust: 1,
    repurchase_adjust: 1,
  },
  东南亚: {
    market_factor: 0.7,
    persona_overlay: '东南亚 18-30 岁年轻人群，价格高敏，移动端为主',
    insights: [
      '价格带需下沉一档：北美 $30-80 在东南亚通常对标 $10-30',
      'TikTok Shop 与 Shopee 竞争激烈，强化短视频 + 直播',
      '印尼 / 越南 / 泰国为重点市场，本地货到付款占比高',
    ],
    conversion_adjust: -0.2,
    return_adjust: -1,
    repurchase_adjust: 0,
  },
  拉美: {
    market_factor: 0.6,
    persona_overlay: '拉美 20-35 岁城市用户，巴西 / 墨西哥为最大单一市场',
    insights: [
      'PIX（巴西）/ OXXO（墨西哥）本地支付通道优先开通',
      '葡 / 西语客服与详情页本地化（不只是机翻）',
      '物流时效是最大痛点，海外仓 + 本地配送是关键',
    ],
    conversion_adjust: -0.3,
    return_adjust: 0,
    repurchase_adjust: -1,
  },
  中东: {
    market_factor: 0.8,
    persona_overlay: '中东 25-45 岁中产，礼赠文化强，节庆消费占年度 35%',
    insights: [
      '阿语本地化主图 + 详情页，非只翻译',
      'Eid 节庆窗口（开斋节 / 宰牲节）备货 +40%',
      '高端香氛 / 个护 / 服饰客单价是其他市场 1.5-2 倍',
    ],
    conversion_adjust: 0,
    return_adjust: -1,
    repurchase_adjust: 1,
  },
}

// ─── 定位 + 商品规划基线（cat × priceBand），20 条 ───
const POSITIONING = {
  // 家居小家电
  '家居小家电|<$10': {
    subtrack: '宿舍 / 租房入门小家电赛道',
    persona: '18-30 岁租房 / 学生人群，预算敏感，单品决策时间 < 3 分钟',
    differentiators: [
      '主打"麻雀虽小五脏俱全"卖点：极简外观 + 一键操作',
      'SKU 集中 1-2 个超级单品打爆，避免铺货分流',
      '主图重点突出实物大小（标注便携 / 桌面级尺寸）',
    ],
    hero_candidates: ['迷你电热水壶', '便携 USB 风扇', '小型电煮锅', '迷你榨汁杯', '便携蒸脸器'],
    price_distribution: [
      { band: '$3-6', share: 35 },
      { band: '$6-10', share: 50 },
      { band: '其他', share: 15 },
    ],
  },
  '家居小家电|$10-30': {
    subtrack: '小家电中端实用赛道',
    persona: '25-35 岁刚需家庭，关注性价比与基础功能完整度',
    differentiators: [
      '主推单品类全功能款（如可调温电水壶 / 多功能料理棒）',
      '详情页强调耐用性 + 使用寿命数据（"使用 1000 次不漏水"）',
      'SKU 控制在 30-50 个，每周新增 2-3 款迭代',
    ],
    hero_candidates: ['多功能料理棒', '可调温电水壶', '迷你洗碗机', '电烧烤盘', '智能保温杯'],
    price_distribution: [
      { band: '$10-15', share: 25 },
      { band: '$15-25', share: 50 },
      { band: '$25-30', share: 25 },
    ],
  },
  '家居小家电|$30-80': {
    subtrack: '厨房精品小家电赛道（北美对标 Beautiful 中端品牌）',
    persona: '25-40 岁中产女性 / 双职工家庭，追求效率 + 颜值，关注设计感',
    differentiators: [
      '主打效率 + 颜值：莫兰迪色系 + 触屏面板 + 智能预约',
      'SKU 围绕"早餐场景"和"健康轻食"两条故事线',
      '价格带卡位 $39-69 主销区间，避开 <$30 红海',
      '配套配件销售（电饭煲 + 蒸笼 / 空气炸锅 + 烤盘）拉客单',
    ],
    hero_candidates: ['空气炸锅', '早餐机', '低糖电饭煲', '料理破壁机', '咖啡奶泡机'],
    price_distribution: [
      { band: '$30-49', share: 35 },
      { band: '$49-69', share: 45 },
      { band: '$69-80', share: 20 },
    ],
  },
  '家居小家电|>$80': {
    subtrack: '高端智能家电赛道（对标 Dyson / 米家中高端）',
    persona: '30-45 岁中高产家庭，追求智能 / 设计 / 静音 / 节能',
    differentiators: [
      '智能化卖点：APP 互联 / 语音控制 / 自适应模式',
      'SKU 精，30-80 个聚焦头部品类（吸尘 / 空气净化 / 烘焙）',
      '保修承诺拉到 2-3 年，保险通道兜底维修',
    ],
    hero_candidates: ['无线手持吸尘器', '空气净化器', '智能蒸烤一体机', '高端料理机', '智能洗碗机'],
    price_distribution: [
      { band: '$80-150', share: 50 },
      { band: '$150-250', share: 35 },
      { band: '>$250', share: 15 },
    ],
  },

  // 快时尚女装
  '快时尚女装|<$10': {
    subtrack: '平价潮流快时尚赛道（SHEIN 早期对标）',
    persona: '18-28 岁年轻女性，每月预算 $30-80，决策极快（< 1 分钟）',
    differentiators: [
      '主打快上新 + 场景化搭配（vacation / streetwear / dorm 风）',
      '上新节奏：每周 ≥ 30 个新 SKU，跟踪 Instagram / TikTok 趋势',
      '主图全部场景化模特图，避免单品白底图',
    ],
    hero_candidates: ['夏季吊带连衣裙', '印花 T 恤', '高腰短裤', '凉鞋', '泳衣套装'],
    price_distribution: [
      { band: '$3-6', share: 30 },
      { band: '$6-10', share: 60 },
      { band: '其他', share: 10 },
    ],
  },
  '快时尚女装|$10-30': {
    subtrack: '中端快时尚主力价位带（SHEIN 主销区间）',
    persona: '20-30 岁城市女性，注重款式更新但也看品质，月购 2-4 件',
    differentiators: [
      '上新节奏 + 颜色 / 印花延伸：单 SKU 成功后横向扩 5-8 SKU',
      '面料卡片置入详情页：成分 / 克重 / 透气性数据化展示',
      '尺码表强制亚裔尺码对照，详情页置顶模特身高 + 上身效果',
    ],
    hero_candidates: ['通勤连衣裙', '阔腿裤', '针织开衫', '半身裙', '修身上衣'],
    price_distribution: [
      { band: '$10-18', share: 40 },
      { band: '$18-25', share: 40 },
      { band: '$25-30', share: 20 },
    ],
  },
  '快时尚女装|$30-80': {
    subtrack: '中腰部品牌赛道（轻奢日常）',
    persona: '25-40 岁职业女性 / 已婚已育，追求设计感与品质，愿为面料 / 版型买单',
    differentiators: [
      '主打"上班穿得上、下班穿得出"双场景兼容',
      '面料升级：天丝 / 醋酸 / 真丝混纺，详情页放面料溯源故事',
      'SKU 精控 50-80 个，每周新增 5-8 款，颜色不超过 3 种',
    ],
    hero_candidates: ['通勤西装外套', '丝绒连衣裙', '宽松版型阔腿裤', '羊毛针织衫', '设计款衬衫'],
    price_distribution: [
      { band: '$30-45', share: 35 },
      { band: '$45-65', share: 45 },
      { band: '$65-80', share: 20 },
    ],
  },
  '快时尚女装|>$80': {
    subtrack: '设计师 / 品牌服饰赛道',
    persona: '30-45 岁高净值女性，注重独特性与品牌故事，单件投资型购买',
    differentiators: [
      '品牌故事 + 设计师档案置入详情页',
      'SKU 精 30 个以内，每季出货 3-5 个胶囊系列',
      '客服走"造型顾问"路线，1 对 1 推荐搭配',
    ],
    hero_candidates: ['设计师款连衣裙', '羊绒大衣', '真丝衬衫', '皮质单品', '限量胶囊系列'],
    price_distribution: [
      { band: '$80-150', share: 55 },
      { band: '$150-250', share: 30 },
      { band: '>$250', share: 15 },
    ],
  },

  // 3C 配件
  '3C 配件|<$10': {
    subtrack: '3C 配件耗材赛道（数据线 / 转接器 / 贴膜）',
    persona: '18-35 岁全人群，刚需消耗品复购为主',
    differentiators: [
      '兼容矩阵详情页：清晰列出每个 SKU 兼容机型',
      '套装策略：3 件 / 5 件套客单拉到 $15-25',
      '强化保修承诺：1 年免费换新，差异化对手低价裸卖',
    ],
    hero_candidates: ['Type-C 数据线', 'iPhone 数据线', '钢化膜', 'OTG 转接器', 'SIM 卡针'],
    price_distribution: [
      { band: '$3-6', share: 40 },
      { band: '$6-10', share: 45 },
      { band: '其他', share: 15 },
    ],
  },
  '3C 配件|$10-30': {
    subtrack: '主力 3C 配件赛道（充电器 / 耳机 / 手机壳）',
    persona: '20-35 岁数码人群，关注品牌 + 兼容性 + 颜值',
    differentiators: [
      '型号词关键词 + 使用场景双线投放（"iPhone 16 case for car"）',
      '套装策略：充电头 + 数据线 + 保护壳 3 件套，客单 +30%',
      '认证置顶：FCC / RoHS 标签放主图避免下架风险',
    ],
    hero_candidates: ['Type-C 快充头', 'MagSafe 无线充', '蓝牙耳机', '手机壳', '车载支架'],
    price_distribution: [
      { band: '$10-18', share: 35 },
      { band: '$18-25', share: 45 },
      { band: '$25-30', share: 20 },
    ],
  },
  '3C 配件|$30-80': {
    subtrack: '中端电子赛道（无线耳机 / 智能手表 / Type-C 拓展坞）',
    persona: '25-40 岁科技爱好者，注重功能体验与做工',
    differentiators: [
      '功能对比表：核心参数与友商横评（详情页置顶）',
      '保修升级：2 年保修 + 30 天差价补偿',
      'SKU 精，20-40 个聚焦头部品类，每个 SKU 月销目标 ≥ 500',
    ],
    hero_candidates: ['主动降噪耳机', '智能手表', 'USB-C 多口拓展坞', '无线键鼠套装', '便携显示器'],
    price_distribution: [
      { band: '$30-49', share: 40 },
      { band: '$49-69', share: 45 },
      { band: '$69-80', share: 15 },
    ],
  },
  '3C 配件|>$80': {
    subtrack: '高端 3C 赛道（蓝牙音箱 / 头戴耳机 / 平板配件）',
    persona: '30-45 岁数码玩家 / 内容创作者，预算充足，看品牌',
    differentiators: [
      '内容营销重投：YouTube / B 站测评 KOL 深度合作',
      '保修 + 保险双兜底：电芯类 SKU 启用平台质量纠纷先行赔付',
      '场景化定位：办公 / 直播 / 旅行三种用户故事线',
    ],
    hero_candidates: ['头戴降噪耳机', '便携蓝牙音箱', '高端机械键盘', '直播声卡套装', '专业麦克风'],
    price_distribution: [
      { band: '$80-150', share: 55 },
      { band: '$150-250', share: 30 },
      { band: '>$250', share: 15 },
    ],
  },

  // 美妆个护
  '美妆个护|<$10': {
    subtrack: '引流个护赛道（沐浴露 / 洗发水 / 试色装）',
    persona: '18-30 岁全女性人群，看价格 + 包装颜值，决策极快',
    differentiators: [
      '试色装 / 小样作引流款，客单 < $5 拉新',
      '包装升级：莫兰迪色系 + 极简设计，对标 Glossier 风',
      'KOC 派样 50 人 / 月，铺量短视频开箱',
    ],
    hero_candidates: ['口红试色套装', '洗发水 100ml', '沐浴露小样', '面膜单片装', '香水小样'],
    price_distribution: [
      { band: '$3-6', share: 40 },
      { band: '$6-10', share: 50 },
      { band: '其他', share: 10 },
    ],
  },
  '美妆个护|$10-30': {
    subtrack: '主力护肤美妆赛道（口红 / 面霜 / 香水小样）',
    persona: '22-35 岁主流女性，每月美妆预算 $50-150，对成分敏感',
    differentiators: [
      '成分故事置入详情页：核心成分 + 实验室数据 + 使用前后对比',
      '场景化主图：白天 / 夜晚 / 通勤 / 约会 不同场景',
      'SKU 围绕功效线（保湿 / 抗老 / 美白）做产品矩阵',
    ],
    hero_candidates: ['哑光口红', '保湿面霜', '香水正装 30ml', '精华液', '眉笔 / 睫毛膏'],
    price_distribution: [
      { band: '$10-18', share: 35 },
      { band: '$18-25', share: 45 },
      { band: '$25-30', share: 20 },
    ],
  },
  '美妆个护|$30-80': {
    subtrack: '中端美妆赛道（精华 / 高端口红 / 香水）',
    persona: '25-40 岁中产女性，看品牌故事 + 成分背书 + 用户测评',
    differentiators: [
      '成分故事化：原料溯源 + 配方研发 + 临床数据',
      '直播间联动：与平台美妆类红人合作开播 + 试用 OEM',
      '订阅制（Subscribe & Save）-15% 锁定复购',
    ],
    hero_candidates: ['抗老精华', '高端口红礼盒', '香水礼盒', '美容精华', '面霜套装'],
    price_distribution: [
      { band: '$30-49', share: 40 },
      { band: '$49-69', share: 40 },
      { band: '$69-80', share: 20 },
    ],
  },
  '美妆个护|>$80': {
    subtrack: '高端香氛 / 美容仪赛道',
    persona: '30-50 岁高净值女性，礼赠 / 自用兼有，看品牌与稀缺性',
    differentiators: [
      '品牌故事 + 调香师 / 研发档案 + 限量版',
      '礼盒装为主 SKU，配套贺卡 + 礼袋',
      '客服走"美容顾问"模式，1 对 1 肤质 / 香调推荐',
    ],
    hero_candidates: ['沙龙级香水', '射频美容仪', '高端面霜', '抗老精华礼盒', '专业护理仪'],
    price_distribution: [
      { band: '$80-150', share: 50 },
      { band: '$150-250', share: 35 },
      { band: '>$250', share: 15 },
    ],
  },

  // 户外运动
  '户外运动|<$10': {
    subtrack: '户外小件赛道（水瓶 / 头灯 / 配件）',
    persona: '18-40 岁户外入门人群，价格高敏，配件型购买',
    differentiators: [
      '套装策略：徒步配件 5 件套（头灯 + 水瓶 + 哨子 + 急救包 + 手电）',
      '主图突出场景：露营 / 徒步 / 通勤实拍',
      '关键词聚焦使用场景词（"hiking accessories" / "camping gear set"）',
    ],
    hero_candidates: ['户外水瓶', '头灯', '便携哨子', '反光手环', '迷你急救包'],
    price_distribution: [
      { band: '$3-6', share: 40 },
      { band: '$6-10', share: 50 },
      { band: '其他', share: 10 },
    ],
  },
  '户外运动|$10-30': {
    subtrack: '入门户外赛道（登山袜 / 运动 T 恤 / 装备配件）',
    persona: '20-40 岁周末户外 / 健身人群，单次客单 $30-80',
    differentiators: [
      '功能性面料卡片：吸湿排汗 / 速干 / 抗菌等数据化展示',
      '尺码 / 重量数据置顶：户外用户对克重极敏感',
      '套装组合（速干 T + 短裤 + 登山袜）',
    ],
    hero_candidates: ['速干 T 恤', '登山袜', '运动短裤', '户外手套', '抓绒帽'],
    price_distribution: [
      { band: '$10-18', share: 35 },
      { band: '$18-25', share: 45 },
      { band: '$25-30', share: 20 },
    ],
  },
  '户外运动|$30-80': {
    subtrack: '主力户外赛道（帐篷 / 睡袋 / 折叠椅）',
    persona: '25-45 岁中度户外爱好者，每年户外消费 $200-500',
    differentiators: [
      '场景化故事：4 人家庭露营 / 双人徒步 / 单人轻装三个故事线',
      '详情页置顶展示重量 / 折叠尺寸 / 承重数据 + 展开演示视频',
      'SKU 矩阵：入门 / 进阶 / 旗舰三档定价拉阶梯',
    ],
    hero_candidates: ['4 人帐篷', '睡袋（适用 0-15 度）', '折叠椅', '户外炉具', '便携冰桶'],
    price_distribution: [
      { band: '$30-49', share: 35 },
      { band: '$49-69', share: 45 },
      { band: '$69-80', share: 20 },
    ],
  },
  '户外运动|>$80': {
    subtrack: '高端户外赛道（专业帐篷 / 冲锋衣 / 自行车装备）',
    persona: '30-50 岁深度户外玩家，对参数 / 品牌 / 专业度极敏感',
    differentiators: [
      '参数化对比表：与品牌友商核心参数横评（重量 / 防水级 / 透气）',
      'KOL 深度合作：垂直户外博主 / 攀登 / 露营 KOL 200+',
      '保修升级：3 年专业保修 + 维修服务通道',
    ],
    hero_candidates: ['专业帐篷', '冲锋衣 / 软壳衣', '专业徒步鞋', '运动头盔', '自行车装备套装'],
    price_distribution: [
      { band: '$80-150', share: 50 },
      { band: '$150-300', share: 35 },
      { band: '>$300', share: 15 },
    ],
  },
}

// ─── 90 天节奏模板（按类目）───
const RHYTHM_BY_CAT = {
  家居小家电: {
    cold_start: [
      '首批上架 30% 核心 SKU；主图突出尺寸 / 一键操作 / 安全认证（UL / ETL / CE）',
      '报名 Temu 新商专享流量包（30 天定向品类曝光 50 万）',
      '投放 50 个冷启关键词（air fryer / mini blender / kitchen gadget）+ 主图 A/B 测试',
      '站外 KOC 派样 30 人，重点小户型 / 单人厨房 / 早餐场景博主',
    ],
    growth: [
      '二批上架另 30%，引入对比图 + 使用场景视频',
      '聚焦 Top 3 爆款做主图 A/B + 详情页 5 版迭代，转化率每 2 周复盘',
      '关键词从 50 扩展到 200，引入长尾词（"small kitchen for college dorm"）',
      '配套销售：成功 SKU + 配件捆绑（空气炸锅 + 烤盘 / 锅 + 蒸笼）',
    ],
    sediment: [
      '全 SKU 上完，启动新品类延伸（爆款相邻品类横向扩 SKU）',
      '复购召回：老客 -10% 券 + 配件 / 耗材复购包推送',
      '客服 SLA 拉到首响 90 秒；售后 NPS 周度监控',
      'BFCM / 11.11 大促备选池入池；提前 60 天完成头程入仓',
    ],
  },
  快时尚女装: {
    cold_start: [
      '首批 50% SKU 集中上架（女装铺量是常态），主图全部场景化模特图',
      '主图工厂 A/B 测试：每个 SKU 至少 3 套主图（街拍 / 通勤 / 度假）',
      '关键词聚焦类目热词 + 季节词（summer dress / vacation outfit / streetwear）',
      'KOC 派样 50 人，TikTok / Instagram 时尚博主优先',
    ],
    growth: [
      '上新节奏拉到周更：每周新增 SKU ≥ 30 个，紧跟 TikTok 趋势',
      '爆款颜色 / 印花横向延伸（成功 SKU 扩 5-8 个变体）',
      '退货分析：高退货率 SKU 立即下架或修改详情页（重点尺码与色差）',
      'TikTok / Instagram Reels 联动：穿搭挑战赛 + 用户晒单返现',
    ],
    sediment: [
      'AW 系列预热：秋冬款先 lookbook 后开售，老客锁定优先购权',
      '老客唤醒：基于历史穿搭推送相似款 + 满减券',
      'DSR 提升：差评定向赔付 + 改进点公示，色差 / 尺码类直接退款',
      '私域沉淀：站内短视频 lookbook + 加关注礼 + 会员尺码档案',
    ],
  },
  '3C 配件': {
    cold_start: [
      '首批上架 40% 核心 SKU，重点是当下手机型号配件（iPhone 16 / Galaxy S25）',
      '认证置顶：FCC / CE / RoHS 标签放主图，避免下架风险',
      '兼容矩阵详情页：清晰列出每个 SKU 兼容机型',
      'KOC 派样：科技测评 / 数码博主 20 人，重点 YouTube / B 站',
    ],
    growth: [
      '套装策略：充电头 + 数据线 + 保护壳 3 件套，客单 +30%',
      '价格保护承诺：30 天差价补偿，提升下单决策速度',
      '差评 48 小时内官方回复，电芯类 SKU 启用平台质量纠纷兜底',
      '关键词扩展：型号词 + 场景词组合（"iPhone 16 case for car"）',
    ],
    sediment: [
      '新机型上市同步上架对应配件 SKU，缩短新机配件上架到 7 天',
      '会员体系：充电器 / 数据线 1 年免费换新承诺，锁定复购',
      'BFCM 备货：11 月大促前 60 天完成头程入仓',
      '复用配件包：覆盖二手机用户，扩大长尾市场',
    ],
  },
  美妆个护: {
    cold_start: [
      '首批上架 30% 核心 SKU；FDA / CPNP 备案文件齐全后再开售',
      '主图色卡 + 实拍光源标准（5500K 自然光），降低色差退货',
      '冷启关键词：成分词（"hyaluronic acid serum"）+ 痛点词（"dark circle cream"）',
      '站外达人池 KOC 派样 50 人，垂直美妆博主优先；试色装作引流款',
    ],
    growth: [
      '主推 SKU 上联名 / 礼盒装：母亲节 / 宰牲节 / 父亲节场景化包装',
      'AB 测试详情页：成分故事 vs 使用前后对比 vs 用户证言',
      '爆款做容量延伸（30ml 成功后做 50ml / 100ml 大容量）',
      '直播间联动：与平台美妆类红人合作开播，配合直播专享价',
    ],
    sediment: [
      '订阅制（Subscribe & Save）：消耗品 -15% 锁定复购',
      '老客唤醒：基于成分偏好 / 肤质档案推送同系列新品',
      '会员体系：等级 + 生日礼包 + 1 对 1 美容顾问',
      '差评定向赔付：色差 / 过敏类直接退款 + 公开改进，DSR 拉到 4.7',
    ],
  },
  户外运动: {
    cold_start: [
      '首批上架 25% 核心 SKU，重点是当季品类（Q2 露营 / 徒步 / 骑行）',
      '详情页置顶展示重量 / 折叠尺寸 / 承重数据 + 展开演示视频',
      '冷启关键词：场景词（"camping tent for 4"）+ 卖点词（"ultralight"）',
      '美西 / 美东海外仓优先，户外大件物流时效从 11 天压到 4 天',
    ],
    growth: [
      '场景延伸：成功的露营帐篷 SKU → 加睡袋 / 折叠椅 / 燃气炉套装',
      '内容营销：与垂直 KOL 200+ 合作，发布场景化测评 / VLOG 视频',
      '退货监控：户外类目最大退货归因是"实物比图小"，重点改详情页比例图',
      '价格阶梯：入门 + 进阶 + 旗舰三档定价同时上架',
    ],
    sediment: [
      'Q3 末同步上架冬季户外 SKU（雪具 / 保暖装备）做季节衔接',
      '老客复购：基于已购品推荐配套装备（有帐篷 → 推睡袋 + 营地灯）',
      'BFCM 准备：10 月底前完成所有头程入仓',
      'DSR 专项：差评定向赔付，时效慢类目优先；客服 SLA 90 秒首响',
    ],
  },
}

// ─── 计算辅助函数 ───
function round1(v) {
  return Math.round(v * 10) / 10
}

function priceBaseGmv(priceBand) {
  return (
    {
      '<$10': 40000,
      '$10-30': 80000,
      '$30-80': 150000,
      '>$80': 250000,
    }[priceBand] || 80000
  )
}

function skuFactor(skuCount) {
  const safe = Math.max(10, Number(skuCount) || 10)
  return Math.min(1.5, 0.7 + Math.log10(safe) * 0.3)
}

function buildKpis(input, profile, market) {
  const warehouseFactor = input.hasWarehouse === '有' ? 1.2 : 1.0
  const gmv = Math.round(
    priceBaseGmv(input.priceBand) *
      profile.cat_factor *
      market.market_factor *
      skuFactor(input.skuCount) *
      warehouseFactor,
  )

  return {
    gmv_target_usd: gmv,
    dsr_target: 4.6,
    conversion_target: round1(
      profile.conversion_base +
        market.conversion_adjust +
        (warehouseFactor - 1) * 2,
    ),
    repurchase_target: profile.repurchase_base + market.repurchase_adjust,
    return_limit: profile.return_base + market.return_adjust,
  }
}

function buildPhaseKpis(input, profile, market, kpis) {
  const isMature = ['北美', '欧洲'].includes(input.market)
  const exposure = isMature ? '100 万' : '50 万'
  const ctr = isMature ? '5.0%' : '4.0%'
  const reviewBase = Math.max(30, Math.round(skuFactor(input.skuCount) * 50))

  return {
    cold_start: [
      `30 天累计曝光 ≥ ${exposure}`,
      `主图 CTR ≥ ${ctr}`,
      `初始评价数 ≥ ${reviewBase}（4.5+ 评分占比 ≥ 80%）`,
    ],
    growth: [
      '月 GMV 增速 ≥ 50%',
      `转化率 ≥ ${kpis.conversion_target}%`,
      '爆款数 ≥ 1（单 SKU 月销 > $5K）',
    ],
    sediment: [
      `复购率 ≥ ${kpis.repurchase_target}%`,
      `DSR ≥ ${kpis.dsr_target}`,
      `退货率 ≤ ${kpis.return_limit}%`,
    ],
  }
}

// ─── fallback 定位（万一组合不在 POSITIONING 表里）───
const POSITIONING_FALLBACK = {
  家居小家电: '家居小家电通用赛道',
  快时尚女装: '快时尚女装通用赛道',
  '3C 配件': '3C 配件通用赛道',
  美妆个护: '美妆个护通用赛道',
  户外运动: '户外运动通用赛道',
}

export function generatePlan(input) {
  const profile = CATEGORY_PROFILES[input.category]
  const market = MARKET_PROFILES[input.market]
  const positionKey = `${input.category}|${input.priceBand}`
  const base = POSITIONING[positionKey] || {
    subtrack: POSITIONING_FALLBACK[input.category],
    persona: '通用人群（建议补充客单价段）',
    differentiators: ['暂无该组合的差异化建议，请联系运营经理补充'],
    hero_candidates: [],
    price_distribution: [],
  }
  const rhythm = RHYTHM_BY_CAT[input.category]
  const kpis = buildKpis(input, profile, market)
  const phaseKpis = buildPhaseKpis(input, profile, market, kpis)

  return {
    positioning: {
      subtrack: base.subtrack,
      persona: market.persona_overlay
        ? `${base.persona}　|　${market.persona_overlay}`
        : base.persona,
      differentiators: [...base.differentiators, ...market.insights],
    },
    productPlan: {
      sku_structure: profile.sku_structure,
      price_distribution: base.price_distribution,
      hero_candidates: base.hero_candidates,
    },
    rhythm: {
      phases: [
        {
          name: '冷启动期',
          range: 'Day 1-30',
          actions: rhythm.cold_start,
          kpis: phaseKpis.cold_start,
        },
        {
          name: '放量期',
          range: 'Day 31-60',
          actions: rhythm.growth,
          kpis: phaseKpis.growth,
        },
        {
          name: '沉淀期',
          range: 'Day 61-90',
          actions: rhythm.sediment,
          kpis: phaseKpis.sediment,
        },
      ],
    },
    kpis,
    meta: {
      merchantName: input.name,
      category: input.category,
      priceBand: input.priceBand,
      market: input.market,
      skuCount: Number(input.skuCount) || 0,
      hasWarehouse: input.hasWarehouse,
    },
  }
}
