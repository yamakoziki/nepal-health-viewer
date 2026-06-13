import { useState, useEffect } from 'react'
import FoodPanel from './components/FoodPanel'
import DiseasePanel from './components/DiseasePanel'
import OverlayPanel from './components/OverlayPanel'

const DISCLAIMER =
  '本グラフは食品消費量と疾病統計の経年変化を並べて表示するものであり、両者の間に統計的な相関や因果関係を示すものではありません。'

export default function App() {
  const [foodData, setFoodData] = useState(null)
  const [diseaseData, setDiseaseData] = useState(null)
  const [activeTab, setActiveTab] = useState('food')
  const [notes, setNotes] = useState({ food: '', disease: '', overlay: '' })

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.BASE_URL}data/food_data.json`).then(r => r.json()),
      fetch(`${import.meta.env.BASE_URL}data/disease_data.json`).then(r => r.json()),
    ]).then(([food, disease]) => {
      setFoodData(food)
      setDiseaseData(disease)
    })
  }, [])

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), notes }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nepal_health_notes.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!foodData || !diseaseData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">データを読み込んでいます...</p>
      </div>
    )
  }

  const tabs = [
    { key: 'food', label: '食品消費' },
    { key: 'disease', label: '疾病トレンド' },
    { key: 'overlay', label: '重ね合わせ' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white px-4 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl md:text-2xl font-bold">ネパール 食品消費と健康トレンド</h1>
          <p className="text-blue-200 text-xs mt-1">
            データ出典: FAOSTAT Food Balance Sheets (2010–2023) ／ IHME Global Burden of Disease Study 2023 (1980–2023)
          </p>
        </div>
      </header>

      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-600 text-blue-700 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1">
        {activeTab === 'food' && (
          <FoodPanel
            data={foodData}
            note={notes.food}
            onNoteChange={v => setNotes(n => ({ ...n, food: v }))}
            onExport={handleExport}
          />
        )}
        {activeTab === 'disease' && (
          <DiseasePanel
            data={diseaseData}
            note={notes.disease}
            onNoteChange={v => setNotes(n => ({ ...n, disease: v }))}
            onExport={handleExport}
          />
        )}
        {activeTab === 'overlay' && (
          <OverlayPanel
            foodData={foodData}
            diseaseData={diseaseData}
            note={notes.overlay}
            onNoteChange={v => setNotes(n => ({ ...n, overlay: v }))}
            onExport={handleExport}
          />
        )}
      </main>

      <footer className="bg-amber-50 border-t border-amber-200 px-4 py-3 mt-4">
        <p className="text-center text-xs text-amber-800 max-w-4xl mx-auto">
          ⚠️ {DISCLAIMER}
        </p>
      </footer>
    </div>
  )
}
