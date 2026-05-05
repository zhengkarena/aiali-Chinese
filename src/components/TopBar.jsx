import { Upload } from 'lucide-react'

export default function TopBar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <div className="text-base font-semibold text-slate-900">
          商家招运营一体化工作台
        </div>
        <div className="text-xs text-slate-500">
          覆盖招商 · 分层 · 扶持 · 洞察的端到端运营平台
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          Demo · 演示版本
        </span>
        <button
          type="button"
          onClick={() => console.log('上传数据 modal 待实现')}
          className="inline-flex items-center gap-2 rounded-md bg-temu px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-temu-600"
        >
          <Upload size={16} />
          上传数据
        </button>
      </div>
    </header>
  )
}
