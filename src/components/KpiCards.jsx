import { Users, UserPlus, Target, Sparkles } from 'lucide-react'

const CARDS = [
  {
    label: '在管商家数',
    value: '1,247',
    sub: '较上月 +52',
    Icon: Users,
  },
  {
    label: '本月新签商家',
    value: '38',
    sub: '目标 50（76%）',
    Icon: UserPlus,
  },
  {
    label: '招商目标完成率',
    value: '76%',
    sub: '距月底 8 天',
    Icon: Target,
  },
  {
    label: '高潜商家数',
    value: '92',
    sub: '待跟进 23',
    Icon: Sparkles,
  },
]

export default function KpiCards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {CARDS.map(({ label, value, sub, Icon }) => (
        <div
          key={label}
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-temu-50 text-temu">
              <Icon size={16} />
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </div>
          <div className="mt-1 text-xs text-slate-500">{sub}</div>
        </div>
      ))}
    </div>
  )
}
