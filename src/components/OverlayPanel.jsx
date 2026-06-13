import { useState } from 'react'
import {
  ComposedChart, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import NoteArea from './NoteArea'
import { getDisplayName } from './DiseasePanel'

const FOOD_STROKE = ['#ef4444', '#f97316']
const DISEASE_STROKE = ['#8b5cf6', '#06b6d4']

const FOOD_METRICS = [
  { key: 'kcal_per_capita_day', label: 'kcal/日' },
  { key: 'kg_per_capita_yr', label: 'kg/年' },
  { key: 'protein_g_per_capita_day', label: 'たんぱく質 g/日' },
  { key: 'fat_g_per_capita_day', label: '脂質 g/日' },
]

const DISEASE_MEASURES = [
  { key: '死亡', label: '死亡' },
  { key: '障害調整生存年数', label: 'DALY' },
]

const DISEASE_METRICS = [
  { key: '率', label: '率' },
  { key: '数', label: '数' },
  { key: '%', label: '%' },
]

const YEARS = Array.from({ length: 14 }, (_, i) => String(2010 + i))

const DISCLAIMER =
  '本グラフは食品消費量と疾病統計の経年変化を並べて表示するものであり、両者の間に統計的な相関や因果関係を示すものではありません。'

export default function OverlayPanel({ foodData, diseaseData, note, onNoteChange, onExport }) {
  const [viewMode, setViewMode] = useState('overlay')
  const [selFoods, setSelFoods] = useState(['米'])
  const [selDiseases, setSelDiseases] = useState(['全ての癌'])
  const [foodMetric, setFoodMetric] = useState('kcal_per_capita_day')
  const [diseaseMeasure, setDiseaseMeasure] = useState('死亡')
  const [diseaseMetric, setDiseaseMetric] = useState('率')

  const allFoods = Object.keys(foodData)
  const allDiseases = Object.keys(diseaseData)

  const toggleFood = item => {
    setSelFoods(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item)
      if (prev.length >= 2) return [...prev.slice(-1), item]
      return [...prev, item]
    })
  }

  const toggleDisease = item => {
    setSelDiseases(prev => {
      if (prev.includes(item)) return prev.filter(x => x !== item)
      if (prev.length >= 2) return [...prev.slice(-1), item]
      return [...prev, item]
    })
  }

  const overlayData = YEARS.map(year => {
    const p = { year }
    selFoods.forEach(f => { p[`F:${f}`] = foodData[f]?.series[foodMetric]?.[year] ?? null })
    selDiseases.forEach(d => { p[`D:${d}`] = diseaseData[d]?.[diseaseMeasure]?.[diseaseMetric]?.[year] ?? null })
    return p
  })

  const foodOnlyData = YEARS.map(year => {
    const p = { year }
    selFoods.forEach(f => { p[f] = foodData[f]?.series[foodMetric]?.[year] ?? null })
    return p
  })

  const diseaseOnlyData = YEARS.map(year => {
    const p = { year }
    selDiseases.forEach(d => { p[d] = diseaseData[d]?.[diseaseMeasure]?.[diseaseMetric]?.[year] ?? null })
    return p
  })

  const foodUnit = FOOD_METRICS.find(m => m.key === foodMetric)?.label || ''
  const diseaseUnit = `${DISEASE_MEASURES.find(m => m.key === diseaseMeasure)?.label || ''} ${DISEASE_METRICS.find(m => m.key === diseaseMetric)?.label || ''}`

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">重ね合わせビュー (2010–2023)</h2>
          <div className="flex gap-1">
            {[['overlay', '重ねて表示'], ['side', '並べて表示']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === mode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {/* Food selection */}
          <div className="border border-red-200 rounded-lg p-3 bg-red-50">
            <h3 className="text-sm font-semibold text-red-700 mb-2">食品 (最大2品目)</h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {FOOD_METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setFoodMetric(m.key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${foodMetric === m.key ? 'bg-red-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {allFoods.map(item => (
                <button
                  key={item}
                  onClick={() => toggleFood(item)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${selFoods.includes(item) ? 'bg-red-500 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Disease selection */}
          <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
            <h3 className="text-sm font-semibold text-purple-700 mb-2">疾病 (最大2種)</h3>
            <div className="flex flex-wrap gap-1 mb-1">
              {DISEASE_MEASURES.map(m => (
                <button
                  key={m.key}
                  onClick={() => setDiseaseMeasure(m.key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${diseaseMeasure === m.key ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                  {m.label}
                </button>
              ))}
              {DISEASE_METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setDiseaseMetric(m.key)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${diseaseMetric === m.key ? 'bg-indigo-500 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
              {allDiseases.map(d => (
                <button
                  key={d}
                  onClick={() => toggleDisease(d)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${selDiseases.includes(d) ? 'bg-purple-500 text-white shadow-sm' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
                >
                  {getDisplayName(d)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Overlay chart */}
        {viewMode === 'overlay' && (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={overlayData} margin={{ top: 5, right: 70, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="food"
                orientation="left"
                tick={{ fontSize: 11 }}
                label={{ value: foodUnit, angle: -90, position: 'insideLeft', fontSize: 11, dx: -5 }}
                width={70}
              />
              <YAxis
                yAxisId="disease"
                orientation="right"
                tick={{ fontSize: 11 }}
                label={{ value: diseaseUnit, angle: 90, position: 'insideRight', fontSize: 11, dx: 5 }}
                width={70}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name.startsWith('F:')) return [value?.toFixed(1), `[食品] ${name.slice(2)}`]
                  return [value?.toFixed(1), `[疾病] ${getDisplayName(name.slice(2))}`]
                }}
              />
              <Legend
                formatter={name => {
                  if (name.startsWith('F:')) return `[食品] ${name.slice(2)}`
                  return `[疾病] ${getDisplayName(name.slice(2))}`
                }}
              />
              {selFoods.map((f, i) => (
                <Line
                  key={f}
                  yAxisId="food"
                  type="monotone"
                  dataKey={`F:${f}`}
                  stroke={FOOD_STROKE[i]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
              {selDiseases.map((d, i) => (
                <Line
                  key={d}
                  yAxisId="disease"
                  type="monotone"
                  dataKey={`D:${d}`}
                  stroke={DISEASE_STROKE[i]}
                  strokeWidth={2.5}
                  strokeDasharray="6 3"
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Side-by-side charts */}
        {viewMode === 'side' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-red-600 text-center mb-1">食品消費 ({foodUnit})</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={foodOnlyData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} width={60} />
                  <Tooltip />
                  <Legend />
                  {selFoods.map((f, i) => (
                    <Line key={f} type="monotone" dataKey={f} stroke={FOOD_STROKE[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-600 text-center mb-1">疾病トレンド ({diseaseUnit})</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={diseaseOnlyData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString()} width={60} />
                  <Tooltip formatter={(v, name) => [v?.toFixed(1), getDisplayName(name)]} />
                  <Legend formatter={name => getDisplayName(name)} />
                  {selDiseases.map((d, i) => (
                    <Line key={d} type="monotone" dataKey={d} stroke={DISEASE_STROKE[i]} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">
          ⚠️ {DISCLAIMER}
        </p>
      </div>

      <NoteArea value={note} onChange={onNoteChange} onExport={onExport} />
    </div>
  )
}
