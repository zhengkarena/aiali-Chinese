import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { CheckCircle2, RotateCcw, Search } from 'lucide-react'
import {
  CATEGORIES,
  QUADRANT_META,
  QUADRANT_STRATEGIES,
  QUADRANT_THRESHOLDS,
  tieringData as defaultTieringData,
} from '../../data/tieringData.js'
import { useData } from '../../context/DataContext.jsx'

const QUADRANT_KEYS = ['star', 'potential', 'cashcow', 'optimize']

function formatGmv(v) {
  if (v >= 10000) return `$${(v / 1000).toFixed(0)}K`
  return `$${v}`
}

function ScatterTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const m = payload[0].payload
  const meta = QUADRANT_META[m.quadrant]
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        {m.name}
      </div>
      <div className="mt-1 text-slate-500">
        {m.category} · {m.main_market}
      </div>
      <div className="mt-1 text-slate-600">
        月 GMV：<span className="text-slate-900">{formatGmv(m.monthly_gmv_usd)}</span>
        　成长率：<span className="text-slate-900">{m.growth_rate}%</span>
      </div>
      <div className="text-slate-600">
        生命周期：{m.lifecycle_stage}　DSR：{m.dsr_score}
      </div>
      <div className="mt-1 text-[11px]" style={{ color: meta.color }}>
        {meta.label} · {meta.desc}
      </div>
    </div>
  )
}

function QuadrantTab({ qkey, count, active, onClick }) {
  const meta = QUADRANT_META[qkey]
  const isActive = active === qkey
  return (
    <button
      type="button"
      onClick={() => onClick(qkey)}
      className={`flex flex-1 flex-col items-start gap-1 rounded-md border px-3 py-2 text-left transition-colors ${
        isActive
          ? 'border-slate-300 bg-white shadow-sm'
          : 'border-transparent bg-slate-50 hover:bg-white'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <span className="text-sm font-medium text-slate-900">{meta.label}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        {meta.desc} · {count} 家
      </div>
    </button>
  )
}

function StrategyCard({ qkey }) {
  const meta = QUADRANT_META[qkey]
  const s = QUADRANT_STRATEGIES[qkey]
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: meta.color }}
        />
        <h4 className="text-sm font-semibold text-slate-900">
          {meta.label} · 运营策略
        </h4>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.summary}</p>
      <div className="mt-3 text-xs font-medium text-slate-500">核心动作</div>
      <ul className="mt-1.5 space-y-1.5">
        {s.actions.map((a, i) => (
          <li
            key={i}
            className="flex gap-2 text-xs leading-relaxed text-slate-700"
          >
            <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            {a}
          </li>
        ))}
      </ul>
      <div className="mt-3 text-xs font-medium text-slate-500">KPI 目标</div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {s.kpis.map((k) => (
          <span
            key={k}
            className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
          >
            {k}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function TieringDashboard() {
  const { datasets, clearDataset } = useData()
  const tieringData = datasets.tiering || defaultTieringData
  const isReal = !!datasets.tiering

  const [activeQuadrant, setActiveQuadrant] = useState('star')
  const [filterQuadrants, setFilterQuadrants] = useState(new Set(QUADRANT_KEYS))
  const [filterCategory, setFilterCategory] = useState('全部')
  const [search, setSearch] = useState('')

  const counts = useMemo(() => {
    const c = { star: 0, potential: 0, cashcow: 0, optimize: 0 }
    tieringData.forEach((m) => (c[m.quadrant] = (c[m.quadrant] || 0) + 1))
    return c
  }, [tieringData])

  const dataByQuadrant = useMemo(() => {
    const g = { star: [], potential: [], cashcow: [], optimize: [] }
    tieringData.forEach((m) => {
      if (g[m.quadrant]) g[m.quadrant].push(m)
    })
    return g
  }, [tieringData])

  const tableRows = useMemo(() => {
    const kw = search.trim()
    return tieringData.filter((m) => {
      if (!filterQuadrants.has(m.quadrant)) return false
      if (filterCategory !== '全部' && m.category !== filterCategory) return false
      if (kw && !m.name.includes(kw)) return false
      return true
    })
  }, [tieringData, filterQuadrants, filterCategory, search])

  const toggleQuadrantFilter = (k) => {
    setFilterQuadrants((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      if (next.size === 0) return new Set(QUADRANT_KEYS) // 不允许全空
      return next
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                分层运营驾驶舱
              </h2>
              {isReal && (
                <>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={11} />
                    使用真实数据 · {tieringData.length} 条
                  </span>
                  <button
                    type="button"
                    onClick={() => clearDataset('tiering')}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw size={10} />
                    恢复默认 Mock 数据
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              按 GMV × 成长率四象限管理在管商家，每象限对应差异化运营策略
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>
              象限阈值：GMV ≥{' '}
              <span className="text-slate-700">
                ${QUADRANT_THRESHOLDS.gmv.toLocaleString()}
              </span>
              　成长率 ≥{' '}
              <span className="text-slate-700">{QUADRANT_THRESHOLDS.growth}%</span>
            </div>
            <div className="mt-0.5">在管商家：{tieringData.length} 家</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-12 gap-5">
          {/* 散点图 */}
          <div className="col-span-7 rounded-md border border-slate-200 bg-slate-50/40 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700">
                四象限商家分布
              </div>
              <div className="flex gap-3 text-[11px] text-slate-500">
                {QUADRANT_KEYS.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: QUADRANT_META[k].color }}
                    />
                    {QUADRANT_META[k].label}
                  </span>
                ))}
              </div>
            </div>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 24 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    dataKey="monthly_gmv_usd"
                    name="月 GMV"
                    domain={[0, 320000]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => formatGmv(v)}
                    label={{
                      value: '月 GMV（美元）',
                      position: 'insideBottom',
                      offset: -20,
                      fill: '#64748b',
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="growth_rate"
                    name="成长率"
                    domain={[-40, 220]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    label={{
                      value: '环比成长率',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#64748b',
                      fontSize: 12,
                    }}
                  />
                  <ZAxis range={[60, 60]} />
                  <ReferenceLine
                    x={QUADRANT_THRESHOLDS.gmv}
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                  />
                  <ReferenceLine
                    y={QUADRANT_THRESHOLDS.growth}
                    stroke="#cbd5e1"
                    strokeDasharray="4 4"
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                    content={<ScatterTooltip />}
                  />
                  {QUADRANT_KEYS.map((k) => (
                    <Scatter
                      key={k}
                      name={QUADRANT_META[k].label}
                      data={dataByQuadrant[k]}
                      fill={QUADRANT_META[k].color}
                      fillOpacity={0.85}
                      onClick={() => setActiveQuadrant(k)}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 策略卡片 */}
          <div className="col-span-5 flex flex-col">
            <div className="mb-3 flex gap-2">
              {QUADRANT_KEYS.map((k) => (
                <QuadrantTab
                  key={k}
                  qkey={k}
                  count={counts[k]}
                  active={activeQuadrant}
                  onClick={setActiveQuadrant}
                />
              ))}
            </div>
            <StrategyCard qkey={activeQuadrant} />
          </div>
        </div>
      </section>

      {/* 商家明细表 */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">商家明细</h3>
          <div className="text-xs text-slate-500">
            筛选结果：{tableRows.length} / {tieringData.length} 家
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            {QUADRANT_KEYS.map((k) => {
              const on = filterQuadrants.has(k)
              const meta = QUADRANT_META[k]
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleQuadrantFilter(k)}
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                    on
                      ? 'border-slate-300 bg-white text-slate-700'
                      : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: on ? meta.color : '#cbd5e1',
                    }}
                  />
                  {meta.label}
                </button>
              )
            })}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-temu focus:outline-none"
          >
            <option value="全部">全部类目</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative ml-auto">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索商家名称"
              className="w-56 rounded-md border border-slate-300 bg-white py-1 pl-7 pr-2 text-xs text-slate-700 focus:border-temu focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 max-h-[440px] overflow-y-auto rounded-md border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">商家名称</th>
                <th className="px-3 py-2 font-medium">类目</th>
                <th className="px-3 py-2 font-medium">主营市场</th>
                <th className="px-3 py-2 text-right font-medium">月 GMV</th>
                <th className="px-3 py-2 text-right font-medium">环比成长率</th>
                <th className="px-3 py-2 font-medium">象限</th>
                <th className="px-3 py-2 font-medium">生命周期</th>
                <th className="px-3 py-2 text-right font-medium">DSR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tableRows.map((m) => {
                const meta = QUADRANT_META[m.quadrant]
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-medium text-slate-900">
                      {m.name}
                    </td>
                    <td className="px-3 py-2 text-slate-600">{m.category}</td>
                    <td className="px-3 py-2 text-slate-600">{m.main_market}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      ${m.monthly_gmv_usd.toLocaleString()}
                    </td>
                    <td
                      className={`px-3 py-2 text-right tabular-nums ${
                        m.growth_rate >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.growth_rate >= 0 ? '+' : ''}
                      {m.growth_rate}%
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px]"
                        style={{
                          backgroundColor: `${meta.color}1A`,
                          color: meta.color,
                        }}
                      >
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {m.lifecycle_stage}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {m.dsr_score.toFixed(1)}
                    </td>
                  </tr>
                )
              })}
              {tableRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-10 text-center text-slate-400"
                  >
                    没有符合筛选条件的商家
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
