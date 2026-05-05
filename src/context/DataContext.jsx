import { createContext, useContext, useState } from 'react'

const DataContext = createContext(null)

// 4 个数据集对应 4 个模块。null = 使用默认 Mock，否则使用上传数据。
const INITIAL = {
  recruit: null,
  tiering: null,
  planning: null,
  insight: null,
}

export function DataProvider({ children }) {
  const [datasets, setDatasets] = useState(INITIAL)

  const setDataset = (key, data) =>
    setDatasets((s) => ({ ...s, [key]: data }))

  const clearDataset = (key) =>
    setDatasets((s) => ({ ...s, [key]: null }))

  return (
    <DataContext.Provider value={{ datasets, setDataset, clearDataset }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
