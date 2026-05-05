import { Radar, Layers, Rocket, LineChart } from 'lucide-react'

const ITEMS = [
  {
    key: 'recruit',
    label: '招商雷达',
    sub: '定向招募 · 出海品牌',
    Icon: Radar,
  },
  {
    key: 'tiering',
    label: '分层运营',
    sub: '商家分类 · 策略匹配',
    Icon: Layers,
  },
  {
    key: 'planning',
    label: '新商扶持',
    sub: '90 天落地 · 规划生成',
    Icon: Rocket,
  },
  {
    key: 'insight',
    label: '行业洞察',
    sub: '数据分析 · 需求挖掘',
    Icon: LineChart,
  },
]

export default function Sidebar({ active, onChange }) {
  return (
    <aside className="flex w-[220px] shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-temu text-sm font-semibold text-white">
          智
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">智选工作台</div>
          <div className="text-[11px] text-slate-400">Temu Merchant Console</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4">
        {ITEMS.map(({ key, label, sub, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`relative mb-1 flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r bg-temu" />
              )}
              <Icon
                size={18}
                className={`mt-0.5 ${isActive ? 'text-temu' : 'text-slate-400'}`}
              />
              <div className="leading-tight">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-slate-400">{sub}</div>
              </div>
            </button>
          )
        })}
      </nav>
      <div className="border-t border-slate-800 px-5 py-3 text-[11px] text-slate-500">
        v0.1.0 · 内部演示版本
      </div>
    </aside>
  )
}
