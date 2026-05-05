import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Loader2,
  MessageSquare,
  RotateCcw,
  Search,
  X,
  Zap,
} from 'lucide-react'
import {
  CATEGORIES,
  FIT_FORMULA,
  MARKETS,
  recruitData as defaultRecruitData,
} from '../../data/recruitData.js'
import { useData } from '../../context/DataContext.jsx'

function formatGmv(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

function scoreColor(v) {
  if (v >= 80) return { bar: '#10b981', text: 'text-emerald-600' }
  if (v >= 60) return { bar: '#f59e0b', text: 'text-amber-600' }
  return { bar: '#f43f5e', text: 'text-rose-600' }
}

function ScoreBar({ value }) {
  const c = scoreColor(value)
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: c.bar }}
        />
      </div>
      <span className={`tabular-nums text-xs font-medium ${c.text}`}>{value}</span>
    </div>
  )
}

function PitchModal({ merchant, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[560px] max-w-full rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-temu-50 text-temu">
                <Zap size={14} />
              </span>
              <h3 className="text-base font-semibold text-slate-900">
                {merchant.name} · 切入话术
              </h3>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {merchant.category} · 主营市场：{merchant.main_markets.join(' / ')}
              　契合度 {merchant.fit_score}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4">
          <ol className="space-y-3">
            {merchant.pitch_points.map((p, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-temu-50 text-[11px] font-semibold text-temu">
                  {i + 1}
                </span>
                <span className="text-slate-700">{p}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            收起
          </button>
        </div>
      </div>
    </div>
  )
}

function FormulaCard() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-temu-50 text-temu">
          <Zap size={13} />
        </span>
        <h4 className="text-sm font-semibold text-slate-900">契合度评分逻辑</h4>
      </div>
      <div className="mt-3 rounded-md bg-slate-900 px-3 py-2.5 font-mono text-[11px] leading-relaxed text-slate-100">
        {FIT_FORMULA.expression}
      </div>
      <ul className="mt-3 space-y-2.5">
        {FIT_FORMULA.parts.map((p) => (
          <li key={p.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-800">{p.name}</span>
              <span className="tabular-nums text-temu">{p.weight}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-temu"
                style={{ width: `${p.weight * 2}%` }}
              />
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-slate-500">
              {p.desc}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-500">
        分数 ≥ 80 优先 BD 跟进；60-79 进入 nurture 池；&lt; 60 暂缓接触。
      </div>
    </div>
  )
}

export default function RecruitRadar() {
  const { datasets, clearDataset } = useData()
  const recruitData = datasets.recruit || defaultRecruitData
  const isReal = !!datasets.recruit

  const [category, setCategory] = useState('全部')
  const [market, setMarket] = useState('全部')
  const [applied, setApplied] = useState({ category: '全部', market: '全部' })
  const [search, setSearch] = useState('')
  const [sortDir, setSortDir] = useState('desc')
  const [pitchOf, setPitchOf] = useState(null)
  const [generating, setGenerating] = useState(false)
  const generateTimerRef = useRef(null)

  useEffect(
    () => () => {
      if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
    },
    [],
  )

  const handleGenerate = () => {
    if (generateTimerRef.current) clearTimeout(generateTimerRef.current)
    setGenerating(true)
    generateTimerRef.current = setTimeout(() => {
      setApplied({ category, market })
      setGenerating(false)
    }, 200)
  }

  const rows = useMemo(() => {
    const kw = search.trim()
    const filtered = recruitData.filter((m) => {
      if (applied.category !== '全部' && m.category !== applied.category) return false
      if (applied.market !== '全部' && !m.main_markets.includes(applied.market)) return false
      if (kw && !m.name.includes(kw)) return false
      return true
    })
    filtered.sort((a, b) =>
      sortDir === 'desc' ? b.fit_score - a.fit_score : a.fit_score - b.fit_score,
    )
    return filtered
  }, [recruitData, applied, search, sortDir])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">招商雷达</h2>
              {isReal && (
                <>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 size={11} />
                    使用真实数据 · {recruitData.length} 条
                  </span>
                  <button
                    type="button"
                    onClick={() => clearDataset('recruit')}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700"
                  >
                    <RotateCcw size={10} />
                    恢复默认 Mock 数据
                  </button>
                </>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              输入目标品类与市场，输出按契合度排序的候选品牌招募名单
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            候选商家池：{recruitData.length} 家
          </div>
        </div>

        {/* 筛选区 */}
        <div className="mt-5 flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-slate-50/50 p-4">
          <div>
            <div className="mb-1 text-xs text-slate-500">目标品类</div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-44 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            >
              <option value="全部">全部品类</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-500">目标市场</div>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              className="w-36 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-temu focus:outline-none"
            >
              <option value="全部">全部市场</option>
              {MARKETS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="inline-flex items-center gap-1.5 rounded-md bg-temu px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-opacity hover:bg-temu-600 disabled:opacity-70"
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                生成中...
              </>
            ) : (
              '生成招商名单'
            )}
          </button>
          {(applied.category !== '全部' || applied.market !== '全部') && (
            <button
              type="button"
              onClick={() => {
                setCategory('全部')
                setMarket('全部')
                setApplied({ category: '全部', market: '全部' })
              }}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              重置筛选
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索商家名称"
                className="w-48 rounded-md border border-slate-300 bg-white py-1.5 pl-7 pr-2 text-xs text-slate-700 focus:border-temu focus:outline-none"
              />
            </div>
            <div className="text-xs text-slate-500">
              名单：<span className="text-slate-800">{rows.length}</span> 家
            </div>
          </div>
        </div>

        {/* 主体：表格 + 公式卡片 */}
        <div className="mt-5 grid grid-cols-12 gap-5">
          <div className="col-span-9">
            <div className="overflow-hidden rounded-md border border-slate-200">
              <div className="max-h-[520px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">商家</th>
                      <th className="px-3 py-2.5 font-medium">已入驻平台</th>
                      <th className="px-3 py-2.5 font-medium">出海经验</th>
                      <th
                        className="cursor-pointer px-3 py-2.5 font-medium hover:text-slate-700"
                        onClick={() =>
                          setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
                        }
                      >
                        <span className="inline-flex items-center gap-1">
                          契合度
                          {sortDir === 'desc' ? (
                            <ArrowDown size={11} className="text-temu" />
                          ) : (
                            <ArrowUp size={11} className="text-temu" />
                          )}
                        </span>
                      </th>
                      <th className="px-3 py-2.5 text-right font-medium">
                        预估年 GMV
                      </th>
                      <th className="px-3 py-2.5 font-medium">切入话术</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rows.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-900">
                            {m.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            {m.category} · {m.main_markets.join(' / ')}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {m.existing_platforms.map((p) => (
                              <span
                                key={p}
                                className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <ScoreBar value={m.overseas_experience_score} />
                        </td>
                        <td className="px-3 py-2.5">
                          <ScoreBar value={m.fit_score} />
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatGmv(m.estimated_gmv_usd)}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setPitchOf(m)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:border-temu hover:text-temu"
                          >
                            <MessageSquare size={11} />
                            {m.pitch_points.length} 条
                          </button>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-12 text-center text-slate-400"
                        >
                          没有符合筛选条件的候选商家，调整品类或市场后再生成
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <FormulaCard />
          </div>
        </div>
      </section>

      {pitchOf && (
        <PitchModal merchant={pitchOf} onClose={() => setPitchOf(null)} />
      )}
    </div>
  )
}
