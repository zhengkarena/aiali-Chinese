import { useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import {
  Calendar,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Upload,
} from 'lucide-react'
import {
  ACTIONS_TEMPLATE,
  CATEGORIES,
  INSIGHTS_TEMPLATE,
  PAIN_POINTS_TEMPLATE,
  PLATFORM_COLORS,
  PLATFORMS,
  PRICE_BANDS,
  PRICE_BAND_COLORS,
  TREND_COLORS,
  hotKeywords,
  platformRadarData,
  priceBandData,
  seasonalEvents,
  trendData,
} from '../../data/industryData.js'

function formatVolume(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return `${v}`
}

const STATUS_META = {
  ongoing: { label: '预热中', dot: '#10b981', tagBg: 'bg-emerald-50', tagText: 'text-emerald-700' },
  upcoming: { label: '即将开启', dot: '#f59e0b', tagBg: 'bg-amber-50', tagText: 'text-amber-700' },
  future: { label: '远期规划', dot: '#94a3b8', tagBg: 'bg-slate-100', tagText: 'text-slate-600' },
}

// ─── Part A 子组件 ───

function TrendChart() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-temu" />
            <h3 className="text-sm font-semibold text-slate-900">
              类目 GMV 趋势
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            过去 12 个月（2025-05 → 2026-04）· GMV 指数（基期 = 2025-05）
          </p>
        </div>
      </div>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 500 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
            {CATEGORIES.map((cat) => (
              <Line
                key={cat}
                type="monotone"
                dataKey={cat}
                stroke={TREND_COLORS[cat]}
                strokeWidth={2}
                dot={{ r: 2.5, fill: TREND_COLORS[cat] }}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function HotKeywordsList() {
  return (
    <div className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-temu" />
        <h3 className="text-sm font-semibold text-slate-900">热搜词 Top 20</h3>
      </div>
      <p className="mt-0.5 text-xs text-slate-500">
        过去 30 天 · 月搜索量 + 同比变化
      </p>
      <div className="mt-3 flex-1 overflow-y-auto rounded-md border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-2 py-1.5 font-medium">#</th>
              <th className="px-2 py-1.5 font-medium">关键词</th>
              <th className="px-2 py-1.5 text-right font-medium">月搜索量</th>
              <th className="px-2 py-1.5 text-right font-medium">同比</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {hotKeywords.map((k) => (
              <tr key={k.rank} className="hover:bg-slate-50">
                <td className="px-2 py-1.5 tabular-nums text-slate-400">
                  {k.rank.toString().padStart(2, '0')}
                </td>
                <td className="px-2 py-1.5">
                  <div className="font-medium text-slate-800">{k.zh}</div>
                  <div className="text-[10px] text-slate-400">{k.en}</div>
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-slate-600">
                  {formatVolume(k.volume)}
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  <span
                    className={
                      k.growth >= 50
                        ? 'text-rose-600'
                        : k.growth >= 0
                          ? 'text-emerald-600'
                          : 'text-slate-500'
                    }
                  >
                    +{k.growth}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PriceBandChart() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">类目价格带分布</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        各类目内 SKU 价位占比（合计 100%）
      </p>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={priceBandData}
            margin={{ top: 8, right: 16, bottom: 0, left: -8 }}
          >
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
              formatter={(v) => `${v}%`}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
            {PRICE_BANDS.map((b) => (
              <Bar
                key={b}
                dataKey={b}
                stackId="price"
                fill={PRICE_BAND_COLORS[b]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function PlatformRadar() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">平台多维对比</h3>
      <p className="mt-0.5 text-xs text-slate-500">
        Temu / SHEIN / Amazon / TikTok Shop · 5 维度（0-100 分）
      </p>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={platformRadarData} outerRadius="72%">
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="dim"
              tick={{ fill: '#475569', fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
            />
            {PLATFORMS.map((p) => (
              <Radar
                key={p}
                name={p}
                dataKey={p}
                stroke={PLATFORM_COLORS[p]}
                fill={PLATFORM_COLORS[p]}
                fillOpacity={0.18}
                strokeWidth={1.5}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SeasonalCalendar() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Calendar size={14} className="text-temu" />
        <h3 className="text-sm font-semibold text-slate-900">
          季节性热点日历
        </h3>
        <span className="ml-2 text-xs text-slate-500">
          未来 3 个月（2026-05 → 2026-07）
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {seasonalEvents.map((ev) => {
          const meta = STATUS_META[ev.status]
          return (
            <div
              key={ev.name}
              className="flex flex-col rounded-md border border-slate-200 bg-slate-50/40 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: meta.dot }}
                    />
                    <span className="text-sm font-medium text-slate-900">
                      {ev.name}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {ev.range} · {ev.markets.join(' / ')}
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] ${meta.tagBg} ${meta.tagText}`}
                >
                  {meta.label}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {ev.categories.map((c) => (
                  <span
                    key={c}
                    className="rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-xs leading-relaxed text-slate-600">
                {ev.suggestion}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Part B 子组件 ───

function PainPointsChart({ data }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 32, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `-${v}`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#475569', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={140}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 6,
              border: '1px solid #e2e8f0',
            }}
            formatter={(v, _n, p) => [`-${v} 分 · ${p.payload.mentionCount} 条`, '负向情感']}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.score >= 60
                    ? '#ef4444'
                    : d.score >= 40
                      ? '#f97316'
                      : '#fbbf24'
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const TEMPLATE_HEADERS = [
  '记录ID', '商家ID', '类目', '订单时间', '评分', '内容',
]

function downloadTemplate() {
  const sample = [
    ['CR-0001', 'M-1024', '美妆个护', '2026-04-21', '2', '物流太慢，等了 11 天才到，包装也变形'],
    ['CR-0002', 'M-1138', '快时尚女装', '2026-04-22', '3', '尺码偏小，平时穿 M 这次只能塞下 L'],
    ['CR-0003', 'M-1206', '3C 配件', '2026-04-23', '5', '充电速度很满意，磁吸很稳'],
  ]
  const rows = [TEMPLATE_HEADERS, ...sample]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + rows], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '商家评论_模板.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function EmptyUploadState({ onUpload }) {
  const inputRef = useRef(null)
  return (
    <div className="rounded-md border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-temu-50 text-temu">
        <FileSpreadsheet size={20} />
      </div>
      <div className="mt-3 text-sm font-medium text-slate-900">
        上传商家评论或客服记录数据，AI 将自动挖掘潜在需求
      </div>
      <div className="mt-1 text-xs text-slate-500">
        支持 CSV 文件 · 单文件 ≤ 5MB · 字段建议：记录ID / 类目 / 评分 / 内容
      </div>
      <div className="mt-4 flex items-center justify-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onUpload(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-temu px-3.5 py-2 text-sm font-medium text-white hover:bg-temu-600"
        >
          <Upload size={14} />
          选择 CSV 文件
        </button>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-700 hover:border-slate-400"
        >
          <Download size={14} />
          下载 CSV 模板
        </button>
      </div>
    </div>
  )
}

function AnalysisReport({ analysis, onReset }) {
  const painPoints = useMemo(() => {
    return PAIN_POINTS_TEMPLATE.map((p) => ({
      ...p,
      mentionCount: Math.max(1, Math.round(analysis.rowCount * p.mention)),
    }))
  }, [analysis.rowCount])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-md bg-emerald-50 px-4 py-3 text-sm">
        <div className="flex items-center gap-2 text-emerald-700">
          <Sparkles size={14} />
          <span>
            已分析 <span className="font-semibold">{analysis.rowCount.toLocaleString()}</span> 条记录
            　文件：<span className="font-medium">{analysis.fileName}</span>
          </span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-white px-2.5 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
        >
          <RotateCcw size={12} />
          重新上传
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 rounded-md border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-900">
            高频痛点 Top 5
          </h4>
          <p className="mt-0.5 text-xs text-slate-500">
            按负向情感强度排序 · 数字越大越严重
          </p>
          <div className="mt-3">
            <PainPointsChart data={painPoints} />
          </div>
        </div>

        <div className="col-span-5 rounded-md border border-slate-200 p-4">
          <h4 className="text-sm font-semibold text-slate-900">潜在需求洞察</h4>
          <p className="mt-0.5 text-xs text-slate-500">
            从评论 + 客服记录中聚类提炼
          </p>
          <ul className="mt-3 space-y-3">
            {INSIGHTS_TEMPLATE.map((it) => (
              <li
                key={it.title}
                className="rounded-md border border-slate-100 bg-slate-50/40 p-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-temu-50 px-1.5 py-0.5 text-[10px] font-medium text-temu">
                    {it.tag}
                  </span>
                  <span className="text-xs font-medium text-slate-900">
                    {it.title}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  {it.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-slate-900">
          运营方案调整建议
        </h4>
        <p className="mt-0.5 text-xs text-slate-500">
          可执行动作 · 优先按预期影响排序
        </p>
        <ol className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
          {ACTIONS_TEMPLATE.map((a, i) => (
            <li
              key={a.title}
              className="flex gap-3 rounded-md border border-slate-100 p-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                    {a.tag}
                  </span>
                  <span className="text-sm font-medium text-slate-900">
                    {a.title}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {a.detail}
                </p>
                <div className="mt-1.5 inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                  预期影响：{a.impact}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

// ─── 主组件 ───

export default function IndustryInsight() {
  const [analysis, setAnalysis] = useState(null)

  const handleUpload = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = String(e.target?.result || '')
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
      const rowCount = Math.max(1, lines.length - 1) // 减去表头
      setAnalysis({ rowCount, fileName: file.name })
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              行业洞察与需求挖掘
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              类目大盘趋势 + 商家评论 / 客服记录的 AI 需求挖掘
            </p>
          </div>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
            数据口径：2025-05 → 2026-04
          </span>
        </div>
      </section>

      {/* Part A 行业大盘 */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="inline-block h-4 w-1 rounded bg-temu" />
          Part A · 行业大盘
        </div>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <TrendChart />
          </div>
          <div className="col-span-4">
            <HotKeywordsList />
          </div>
          <div className="col-span-7">
            <PriceBandChart />
          </div>
          <div className="col-span-5">
            <PlatformRadar />
          </div>
          <div className="col-span-12">
            <SeasonalCalendar />
          </div>
        </div>
      </div>

      {/* Part B AI 需求挖掘 */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="inline-block h-4 w-1 rounded bg-temu" />
          Part B · AI 需求挖掘
        </div>
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {analysis ? (
            <AnalysisReport
              analysis={analysis}
              onReset={() => setAnalysis(null)}
            />
          ) : (
            <EmptyUploadState onUpload={handleUpload} />
          )}
        </section>
      </div>
    </div>
  )
}
