import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import KpiCards from './components/KpiCards.jsx'
import RecruitRadar from './components/modules/RecruitRadar.jsx'
import TieringDashboard from './components/modules/TieringDashboard.jsx'
import PlanningGenerator from './components/modules/PlanningGenerator.jsx'
import IndustryInsight from './components/modules/IndustryInsight.jsx'

const MODULES = {
  recruit: RecruitRadar,
  tiering: TieringDashboard,
  planning: PlanningGenerator,
  insight: IndustryInsight,
}

function App() {
  const [activeModule, setActiveModule] = useState('recruit')
  const ActiveModule = MODULES[activeModule]

  return (
    <div className="flex h-full min-h-screen min-w-[1280px] bg-slate-50 text-slate-900">
      <Sidebar active={activeModule} onChange={setActiveModule} />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <KpiCards />
          <div className="mt-6">
            <ActiveModule />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
