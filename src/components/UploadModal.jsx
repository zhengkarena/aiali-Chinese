import { useRef, useState } from 'react'
import Papa from 'papaparse'
import {
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Layers,
  Radar,
  RotateCcw,
  Rocket,
  Upload,
  X,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { QUADRANT_THRESHOLDS } from '../data/tieringData.js'

// ── 工具：下载带 BOM 的 CSV 模板（兼容 Excel 中文）
function downloadCsvTemplate(filename, headers, sampleRows) {
  const all = [headers, ...sampleRows]
    .map((row) =>
      row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')
  const blob = new Blob(['﻿' + all], {
    type: 'text/csv;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── 通用：检查必需列是否齐全
function checkRequiredColumns(headers, required) {
  const missing = required.filter((c) => !headers.includes(c))
  if (missing.length) {
    throw new Error(`CSV 缺少必需列：${missing.join('、')}`)
  }
}

// ── 通用：把字符串按 ; 拆成数组
function splitList(v) {
  if (!v) return []
  return String(v)
    .split(/[;；]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

// ── 解析器：在管商家（Module 2 端到端关键）
function parseTiering(rows, headers) {
  const required = [
    '商家名称',
    '主营类目',
    '月GMV美元',
    '环比成长率',
    '主营市场',
    '生命周期',
    'DSR',
  ]
  checkRequiredColumns(headers, required)
  const data = []
  let id = 1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const lineNo = i + 2 // CSV 第 1 行是表头
    const gmv = Number(r['月GMV美元'])
    const growth = Number(r['环比成长率'])
    const dsr = Number(r['DSR'])
    if (!r['商家名称']?.trim())
      throw new Error(`第 ${lineNo} 行「商家名称」为空`)
    if (Number.isNaN(gmv))
      throw new Error(`第 ${lineNo} 行「月GMV美元」格式错误（应为数字）`)
    if (Number.isNaN(growth))
      throw new Error(`第 ${lineNo} 行「环比成长率」格式错误（应为数字，单位 %）`)
    if (Number.isNaN(dsr) || dsr < 1 || dsr > 5)
      throw new Error(`第 ${lineNo} 行「DSR」应为 1-5 的数字`)

    const highGmv = gmv >= QUADRANT_THRESHOLDS.gmv
    const highGrowth = growth >= QUADRANT_THRESHOLDS.growth
    const quadrant =
      highGmv && highGrowth
        ? 'star'
        : !highGmv && highGrowth
          ? 'potential'
          : highGmv && !highGrowth
            ? 'cashcow'
            : 'optimize'

    data.push({
      id: id++,
      name: r['商家名称'].trim(),
      category: r['主营类目'].trim(),
      monthly_gmv_usd: Math.round(gmv),
      growth_rate: Math.round(growth * 10) / 10,
      main_market: r['主营市场'].trim(),
      lifecycle_stage: r['生命周期'].trim(),
      dsr_score: Math.round(dsr * 10) / 10,
      quadrant,
    })
  }
  if (data.length === 0) throw new Error('CSV 不包含任何数据行')
  return data
}

// ── 解析器：招商候选商家池
function parseRecruit(rows, headers) {
  const required = [
    '商家名称',
    '主营类目',
    '已入驻平台',
    '出海经验评分',
    '契合度评分',
    '预估年GMV美元',
    '主营市场',
    '切入话术',
  ]
  checkRequiredColumns(headers, required)
  const data = []
  let id = 1
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const lineNo = i + 2
    const oversea = Number(r['出海经验评分'])
    const fit = Number(r['契合度评分'])
    const gmv = Number(r['预估年GMV美元'])
    if (!r['商家名称']?.trim())
      throw new Error(`第 ${lineNo} 行「商家名称」为空`)
    if (Number.isNaN(oversea) || oversea < 0 || oversea > 100)
      throw new Error(`第 ${lineNo} 行「出海经验评分」应为 0-100 数字`)
    if (Number.isNaN(fit) || fit < 0 || fit > 100)
      throw new Error(`第 ${lineNo} 行「契合度评分」应为 0-100 数字`)
    if (Number.isNaN(gmv))
      throw new Error(`第 ${lineNo} 行「预估年GMV美元」格式错误（应为数字）`)

    data.push({
      id: id++,
      name: r['商家名称'].trim(),
      category: r['主营类目'].trim(),
      existing_platforms: splitList(r['已入驻平台']),
      overseas_experience_score: Math.round(oversea),
      fit_score: Math.round(fit),
      estimated_gmv_usd: Math.round(gmv),
      main_markets: splitList(r['主营市场']),
      pitch_points: splitList(r['切入话术']),
    })
  }
  if (data.length === 0) throw new Error('CSV 不包含任何数据行')
  return data
}

// ── 解析器：新商基础档案（骨架）
function parsePlanning(rows, headers) {
  const required = [
    '商家名称',
    '主营类目',
    '客单价区间',
    '目标市场',
    'SKU数量',
    '是否有海外仓',
  ]
  checkRequiredColumns(headers, required)
  const data = []
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const lineNo = i + 2
    if (!r['商家名称']?.trim())
      throw new Error(`第 ${lineNo} 行「商家名称」为空`)
    const sku = Number(r['SKU数量'])
    if (Number.isNaN(sku) || sku < 1)
      throw new Error(`第 ${lineNo} 行「SKU数量」应为正整数`)
    const wh = String(r['是否有海外仓']).trim()
    if (wh !== '有' && wh !== '无')
      throw new Error(`第 ${lineNo} 行「是否有海外仓」只能填「有」或「无」`)
    data.push({
      name: r['商家名称'].trim(),
      category: r['主营类目'].trim(),
      priceBand: r['客单价区间'].trim(),
      market: r['目标市场'].trim(),
      skuCount: Math.round(sku),
      hasWarehouse: wh,
    })
  }
  if (data.length === 0) throw new Error('CSV 不包含任何数据行')
  return data
}

// ── 解析器：商家评论 / 客服记录（骨架，与 Module 4 Part B 共享）
function parseInsight(rows, headers) {
  const required = ['记录ID', '商家ID', '类目', '订单时间', '评分', '内容']
  checkRequiredColumns(headers, required)
  if (rows.length === 0) throw new Error('CSV 不包含任何数据行')
  return { rowCount: rows.length, rows }
}

// ── 4 个上传区配置
const SECTIONS = [
  {
    key: 'recruit',
    title: '招商候选商家池',
    icon: Radar,
    description: '用于「招商雷达」候选商家表格，覆盖 Mock 30 条候选',
    columnsHelp:
      '必需列：商家名称 / 主营类目 / 已入驻平台 / 出海经验评分 / 契合度评分 / 预估年GMV美元 / 主营市场 / 切入话术（多值用「;」分隔）',
    fileName: '招商候选商家池-模板.csv',
    template: {
      headers: [
        '商家名称',
        '主营类目',
        '已入驻平台',
        '出海经验评分',
        '契合度评分',
        '预估年GMV美元',
        '主营市场',
        '切入话术',
      ],
      rows: [
        [
          '华灯小家电',
          '家居小家电',
          'Amazon;独立站;SHEIN',
          '82',
          '90',
          '12000000',
          '北美;欧洲',
          'Temu 北美厨房小家电搜索量同比 +147%;全托管模式可降低成本约 18%',
        ],
        [
          '素白女装',
          '快时尚女装',
          'SHEIN;独立站',
          '75',
          '85',
          '8000000',
          '欧洲',
          '欧洲快时尚客单价比北美高 18%;英国站女装搜索 Top 100 词中 65% 仍无头部商家垄断',
        ],
      ],
    },
    parse: parseRecruit,
  },
  {
    key: 'tiering',
    title: '在管商家数据',
    icon: Layers,
    description: '用于「分层运营驾驶舱」散点 + 表格，覆盖 Mock 80 条商家',
    columnsHelp:
      '必需列：商家名称 / 主营类目 / 月GMV美元 / 环比成长率（%）/ 主营市场 / 生命周期（新商/成长/成熟/衰退）/ DSR（1-5）',
    fileName: '在管商家数据-模板.csv',
    template: {
      headers: [
        '商家名称',
        '主营类目',
        '月GMV美元',
        '环比成长率',
        '主营市场',
        '生命周期',
        'DSR',
      ],
      rows: [
        ['华灯小家电', '家居小家电', '120000', '45', '北美', '成长', '4.6'],
        ['极速3C', '3C 配件', '30000', '80', '东南亚', '新商', '4.5'],
        ['拙朴家电', '家居小家电', '15000', '-10', '拉美', '衰退', '4.2'],
        ['沐光美妆', '美妆个护', '180000', '12', '欧洲', '成熟', '4.7'],
      ],
    },
    parse: parseTiering,
  },
  {
    key: 'planning',
    title: '新商基础档案',
    icon: Rocket,
    description: '用于「新商扶持」骨架数据接收（暂不参与表单计算）',
    columnsHelp:
      '必需列：商家名称 / 主营类目 / 客单价区间（<$10 / $10-30 / $30-80 / >$80）/ 目标市场 / SKU数量 / 是否有海外仓（有/无）',
    fileName: '新商基础档案-模板.csv',
    template: {
      headers: [
        '商家名称',
        '主营类目',
        '客单价区间',
        '目标市场',
        'SKU数量',
        '是否有海外仓',
      ],
      rows: [
        ['星澜家电', '家居小家电', '$30-80', '北美', '200', '有'],
        ['浣月女装', '快时尚女装', '<$10', '欧洲', '500', '无'],
      ],
    },
    parse: parsePlanning,
  },
  {
    key: 'insight',
    title: '商家评论 / 客服记录',
    icon: Database,
    description: '用于「行业洞察」AI 需求挖掘，自动生成痛点 + 洞察 + 行动',
    columnsHelp:
      '必需列：记录ID / 商家ID / 类目 / 订单时间 / 评分（1-5）/ 内容（评论或客服会话）',
    fileName: '商家评论_客服记录-模板.csv',
    template: {
      headers: ['记录ID', '商家ID', '类目', '订单时间', '评分', '内容'],
      rows: [
        [
          'CR-0001',
          'M-1024',
          '美妆个护',
          '2026-04-21',
          '2',
          '物流太慢，等了 11 天才到，包装也变形',
        ],
        [
          'CR-0002',
          'M-1138',
          '快时尚女装',
          '2026-04-22',
          '3',
          '尺码偏小，平时穿 M 这次只能塞下 L',
        ],
        [
          'CR-0003',
          'M-1206',
          '3C 配件',
          '2026-04-23',
          '5',
          '充电速度很满意，磁吸很稳',
        ],
      ],
    },
    parse: parseInsight,
  },
]

// ── 单个上传区
function UploadSection({ section }) {
  const { datasets, setDataset, clearDataset } = useData()
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const current = datasets[section.key]
  const Icon = section.icon

  const isLoaded = !!current
  // count 兼容数组与对象（insight 是 {rowCount}）
  const count = isLoaded
    ? Array.isArray(current)
      ? current.length
      : current.rowCount || 0
    : 0
  const fileName = isLoaded ? current.__fileName : null

  const handleFile = (file) => {
    if (!file) return
    setError('')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        try {
          const headers = result.meta.fields || []
          const data = section.parse(result.data, headers)
          // 标记文件名（数组上不便挂属性，用 Object.defineProperty 隐藏；
          // 对象直接合并）
          if (Array.isArray(data)) {
            Object.defineProperty(data, '__fileName', {
              value: file.name,
              enumerable: false,
            })
          } else {
            data.__fileName = file.name
          }
          setDataset(section.key, data)
        } catch (e) {
          setError(e.message || '解析失败')
        }
      },
      error: (err) => setError(`解析失败：${err.message}`),
    })
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-temu-50 text-temu">
            <Icon size={16} />
          </span>
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {section.title}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {section.description}
            </div>
          </div>
        </div>
        {isLoaded ? (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 size={12} />
            已上传 {count} 条数据
          </span>
        ) : (
          <span className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-500">
            使用默认 Mock 数据
          </span>
        )}
      </div>

      <div className="mt-2.5 rounded-md bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
        {section.columnsHelp}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() =>
            downloadCsvTemplate(
              section.fileName,
              section.template.headers,
              section.template.rows,
            )
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:border-slate-400"
        >
          <Download size={12} />
          下载 CSV 模板
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md bg-temu px-2.5 py-1.5 text-xs font-medium text-white hover:bg-temu-600"
        >
          <Upload size={12} />
          {isLoaded ? '重新上传' : '选择 CSV 文件'}
        </button>
        {isLoaded && (
          <button
            type="button"
            onClick={() => {
              clearDataset(section.key)
              setError('')
            }}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700"
          >
            <RotateCcw size={11} />
            恢复默认 Mock 数据
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">
          ❌ {error}
        </div>
      )}
      {isLoaded && fileName && !error && (
        <div className="mt-3 text-[11px] text-slate-500">
          ✅ 当前数据来自上传文件：
          <span className="text-slate-700">{fileName}</span>
          ，模块已切换至真实数据
        </div>
      )}
    </div>
  )
}

// ── Modal 主体
export default function UploadModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-10"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[820px] max-w-full rounded-lg bg-white shadow-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-temu-50 text-temu">
                <FileSpreadsheet size={15} />
              </span>
              <h2 className="text-base font-semibold text-slate-900">
                上传内部数据 · 让工具适配你的业务
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              默认数据为公开来源 + 模拟数据。上传你的内部 CSV
              数据后，对应模块将立即基于真实数据运行。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          {SECTIONS.map((s) => (
            <UploadSection key={s.key} section={s} />
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3">
          <div className="text-[11px] text-slate-500">
            字段必须为 UTF-8 编码 · 模板已带 BOM 兼容 Excel 中文显示
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
