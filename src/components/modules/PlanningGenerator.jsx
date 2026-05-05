import { useState } from 'react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  CalendarRange,
  CheckCircle2,
  Compass,
  Package,
  Rocket,
  RotateCcw,
  Target,
} from 'lucide-react'
import {
  CATEGORIES,
  MARKETS,
  PRICE_BANDS,
  generatePlan,
} from '../../data/planningRules.js'
import { useData } from '../../context/DataContext.jsx'

const SKU_LABELS = {
  traffic: '引流款',
  profit: '利润款',
  image: '形象款',
}
const SKU_COLORS = {
  traffic: '#3b82f6',
  profit: '#FB7701',
  image: '#8b5cf6',
}

const PIE_COLORS = ['#FB7701', '#fbbf24', '#94a3b8']

const PHASE_ICON_BG = ['bg-blue-50 text-blue-600', 'bg-amber-50 text-amber-700', 'bg-emerald-50 text-emerald-700']
const PHASE_DOT_COLOR = ['#3b82f6', '#f59e0b', '#10b981']

function formatGmv(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function Reveal({ when, delay = 0, children }) {
  return (
    <div
      style={{ transitionDelay: when ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-500 ${
        when
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      {children}
    </div>
  )
}

function PartHeader({ Icon, label, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-temu-50 text-temu">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xs font-medium text-temu">{label}</div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-slate-500">{desc}</p>}
      </div>
    </div>
  )
}

// ─── Part 1：市场定位 ───
function PositioningCard({ positioning, meta }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <PartHeader
        Icon={Compass}
        label="Part 1"
        title="市场定位建议"
        desc={`${meta.merchantName || '新商'} · ${meta.category} · ${meta.priceBand} · ${meta.market}`}
      />

      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/40 p-4">
        <div className="text-xs font-medium text-slate-500">推荐细分赛道</div>
        <div className="mt-1 text-base font-semibold text-slate-900">
          {positioning.subtrack}
        </div>
        <div className="mt-3 text-xs font-medium text-slate-500">
          目标人群画像
        </div>
        <div className="mt-1 text-sm leading-relaxed text-slate-700">
          {positioning.persona}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs font-medium text-slate-500">差异化定位建议</div>
        <ul className="mt-2 space-y-2">
          {positioning.differentiators.map((d, i) => (
            <li
              key={i}
              className="flex gap-2 text-sm leading-relaxed text-slate-700"
            >
              <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-temu" />
              {d}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── Part 2：商品规划 ───
function ProductPlanCard({ productPlan }) {
  const skuEntries = Object.entries(productPlan.sku_structure)
  const pieData = productPlan.price_distribution.map((p) => ({
    name: p.band,
    value: p.share,
  }))
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <PartHeader
        Icon={Package}
        label="Part 2"
        title="商品规划"
        desc="SKU 结构 · 价格带分布 · 首批爆款候选"
      />

      <div className="mt-4 grid grid-cols-12 gap-5">
        <div className="col-span-5">
          <div className="text-xs font-medium text-slate-500">
            推荐 SKU 结构
          </div>
          <div className="mt-3 space-y-3">
            {skuEntries.map(([k, v]) => (
              <div key={k}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">{SKU_LABELS[k]}</span>
                  <span className="tabular-nums font-medium text-slate-900">
                    {v}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${v}%`,
                      backgroundColor: SKU_COLORS[k],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
            引流款拉流量、利润款赚毛利、形象款立心智，三者比例决定店铺资源分配。
          </div>
        </div>

        <div className="col-span-3">
          <div className="text-xs font-medium text-slate-500">
            价格带分布建议
          </div>
          {pieData.length ? (
            <div className="mt-1 h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${v}%`}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="mt-3 text-xs text-slate-400">
              当前组合暂无价格带建议
            </div>
          )}
          <div className="mt-2 space-y-1">
            {pieData.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-[11px] text-slate-600"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {p.name}
                </span>
                <span className="tabular-nums">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-4">
          <div className="text-xs font-medium text-slate-500">
            首批爆款候选品类
          </div>
          <ol className="mt-2 space-y-1.5">
            {productPlan.hero_candidates.map((h, i) => (
              <li
                key={h}
                className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50/40 px-2.5 py-1.5 text-xs"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-800">{h}</span>
              </li>
            ))}
            {productPlan.hero_candidates.length === 0 && (
              <li className="text-xs text-slate-400">暂无候选</li>
            )}
          </ol>
        </div>
      </div>
    </section>
  )
}

// ─── Part 3：90 天节奏 ───
function RhythmCard({ rhythm }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <PartHeader
        Icon={CalendarRange}
        label="Part 3"
        title="90 天营销节奏"
        desc="冷启动 → 放量 → 沉淀，三阶段动作 + KPI"
      />

      <div className="mt-4 grid grid-cols-3 gap-4">
        {rhythm.phases.map((phase, i) => (
          <div
            key={phase.name}
            className="relative flex flex-col rounded-md border border-slate-200 bg-white"
          >
            <span
              className="absolute -top-2 left-4 rounded px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: PHASE_DOT_COLOR[i] }}
            >
              {phase.range}
            </span>
            <div className={`flex items-center gap-2 rounded-t-md px-4 py-3 ${PHASE_ICON_BG[i]}`}>
              <Rocket size={14} />
              <span className="text-sm font-semibold">{phase.name}</span>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  核心动作
                </div>
                <ul className="mt-1.5 space-y-1.5">
                  {phase.actions.map((a, j) => (
                    <li
                      key={j}
                      className="flex gap-2 text-[11px] leading-relaxed text-slate-700"
                    >
                      <span
                        className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full"
                        style={{ backgroundColor: PHASE_DOT_COLOR[i] }}
                      />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[11px] font-medium text-slate-500">
                  KPI 目标
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {phase.kpis.map((k) => (
                    <span
                      key={k}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Part 4：KPI 看板 ───
function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div
        className="mt-1.5 text-2xl font-semibold tabular-nums"
        style={{ color: accent || '#0f172a' }}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] text-slate-500">{sub}</div>
    </div>
  )
}

function KpiDashboardCard({ kpis }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <PartHeader
        Icon={Target}
        label="Part 4"
        title="90 天 KPI 看板"
        desc="基于商家组合参数动态计算的目标值"
      />

      <div className="mt-4 grid grid-cols-5 gap-3">
        <KpiCard
          label="GMV 目标"
          value={formatGmv(kpis.gmv_target_usd)}
          sub="90 天累计"
          accent="#FB7701"
        />
        <KpiCard
          label="DSR 目标"
          value={`≥ ${kpis.dsr_target}`}
          sub="店铺综合评分"
          accent="#10b981"
        />
        <KpiCard
          label="转化率目标"
          value={`${kpis.conversion_target}%`}
          sub="冷启 - 放量"
          accent="#3b82f6"
        />
        <KpiCard
          label="复购率目标"
          value={`${kpis.repurchase_target}%`}
          sub="90 天回访"
          accent="#8b5cf6"
        />
        <KpiCard
          label="退货率上限"
          value={`≤ ${kpis.return_limit}%`}
          sub="超阈值预警"
          accent="#f43f5e"
        />
      </div>
    </section>
  )
}

// ─── 主组件 ───
const FORM_DEFAULTS = {
  name: '',
  category: '家居小家电',
  priceBand: '$30-80',
  market: '北美',
  skuCount: 200,
  hasWarehouse: '无',
}

export default function PlanningGenerator() {
  const { datasets, clearDataset } = useData()
  const planningData = datasets.planning
  const isReal = !!planningData

  const [form, setForm] = useState(FORM_DEFAULTS)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [revealStep, setRevealStep] = useState(0)

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleGenerate = () => {
    if (!form.name.trim()) {
      setError('请填写商家名称')
      return
    }
    if (Number(form.skuCount) < 1) {
      setError('SKU 数量至少为 1')
      return
    }
    setError('')
    const p = generatePlan(form)
    setPlan(p)
    setRevealStep(0)
    const delays = [120, 480, 880, 1280]
    delays.forEach((d, i) => {
      setTimeout(() => setRevealStep(i + 1), d)
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                新商 90 天落地规划器
              </h2>
              {isReal && (
                <>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={11} />
                    使用真实数据 · {planningData.length} 条新商档案
                  </span>
                  <button
                    type="button"
                    onClick={() => clearDataset('planning')}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw size={10} />
                    恢复默认 Mock 数据
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              输入新商基础信息，自动生成市场定位 + 商品规划 + 90 天节奏 + KPI 目标
            </p>
          </div>
          {plan && (
            <button
              type="button"
              onClick={() => {
                setPlan(null)
                setRevealStep(0)
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              重新规划
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-4 rounded-md border border-slate-200 bg-slate-50/50 p-4">
          <FormField label="商家名称" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="如：星澜家电"
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            />
          </FormField>
          <FormField label="主营类目">
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="客单价区间">
            <select
              value={form.priceBand}
              onChange={(e) => update('priceBand', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            >
              {PRICE_BANDS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="目标市场">
            <select
              value={form.market}
              onChange={(e) => update('market', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            >
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="SKU 数量">
            <input
              type="number"
              min={1}
              value={form.skuCount}
              onChange={(e) => update('skuCount', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            />
          </FormField>
          <FormField label="是否有海外仓">
            <div className="flex gap-3 py-1">
              {['有', '无'].map((opt) => (
                <label
                  key={opt}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name="hasWarehouse"
                    value={opt}
                    checked={form.hasWarehouse === opt}
                    onChange={(e) => update('hasWarehouse', e.target.value)}
                    className="accent-temu"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </FormField>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 rounded-md bg-temu px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-temu-600"
          >
            <Rocket size={14} />
            生成 90 天规划
          </button>
          {error && <span className="text-xs text-rose-600">{error}</span>}
          {plan && !error && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 size={12} />
              已生成 {plan.meta.merchantName} 的 90 天规划
            </span>
          )}
        </div>
      </section>

      {plan && (
        <div className="space-y-5">
          <Reveal when={revealStep >= 1}>
            <PositioningCard
              positioning={plan.positioning}
              meta={plan.meta}
            />
          </Reveal>
          <Reveal when={revealStep >= 2}>
            <ProductPlanCard productPlan={plan.productPlan} />
          </Reveal>
          <Reveal when={revealStep >= 3}>
            <RhythmCard rhythm={plan.rhythm} />
          </Reveal>
          <Reveal when={revealStep >= 4}>
            <KpiDashboardCard kpis={plan.kpis} />
          </Reveal>
        </div>
      )}
    </div>
  )
}

function FormField({ label, required, children }) {
  return (
    <div>
      <div className="mb-1 text-xs text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </div>
      {children}
    </div>
  )
}
