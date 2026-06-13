import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import NoteArea from './NoteArea'

const FOOD_COLORS = {
  '米': '#dc2626',
  '小麦': '#ea580c',
  '乳製品(牛乳等)': '#ca8a04',
  '砂糖': '#65a30d',
  '牛肉': '#16a34a',
  '豚肉': '#0891b2',
  '鶏肉': '#2563eb',
  '羊・ヤギ肉': '#7c3aed',
  '大豆油': '#db2777',
  'パーム油': '#059669',
  'からし油等': '#d97706',
  'ひまわり油': '#0284c7',
  '植物油(合計)': '#6d28d9',
  '肉類(合計)': '#b91c1c',
}

const FOOD_GROUPS = [
  { label: '主食類', items: ['米', '小麦'] },
  { label: '乳製品', items: ['乳製品(牛乳等)'] },
  { label: '砂糖', items: ['砂糖'] },
  { label: '肉類', items: ['肉類(合計)', '牛肉', '豚肉', '鶏肉', '羊・ヤギ肉'] },
  { label: '植物油', items: ['植物油(合計)', '大豆油', 'パーム油', 'からし油等', 'ひまわり油'] },
]

const METRICS = [
  { key: 'kcal_per_capita_day', label: 'kcal/日', unit: 'kcal/人/日', fmt: v => `${Math.round(v).toLocaleString()} kcal` },
  { key: 'kg_per_capita_yr', label: 'kg/年', unit: 'kg/人/年', fmt: v => `${v.toFixed(1)} kg` },
  { key: 'protein_g_per_capita_day', label: 'たんぱく質 g/日', unit: 'g/人/日', fmt: v => `${v.toFixed(1)} g` },
  { key: 'fat_g_per_capita_day', label: '脂質 g/日', unit: 'g/人/日', fmt: v => `${v.toFixed(1)} g` },
]

const YEARS = Array.from({ length: 14 }, (_, i) => String(2010 + i))

const DISCLAIMER =
  '本グラフは食品消費量と疾病統計の経年変化を並べて表示するものであり、両者の間に統計的な相関や因果関係を示すものではありません。'

export default function FoodPanel({ data, note, onNoteChange, onExport }) {
  const [selected, setSelected] = useState(['米', '小麦', '肉類(合計)', '砂糖'])
  const [metric, setMetric] = useState('kcal_per_capita_day')

  const toggleItem = item => {
    setSelected(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item])
  }

  const currentMetric = METRICS.find(m => m.key === metric)

  const chartData = YEARS.map(year => {
    const point = { year }
    selected.forEach(item => {
      point[item] = data[item]?.series[metric]?.[year] ?? null
    })
    return point
  })

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">食品消費パネル (2010–2023)</h2>

        {/* Metric tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                metric === m.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Food item checkboxes grouped */}
        <div className="space-y-2 mb-4">
          {FOOD_GROUPS.map(group => (
            <div key={group.label}>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{group.label}</span>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                {group.items.map(item => (
                  <label key={item} className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selected.includes(item)}
                      onChange={() => toggleItem(item)}
                      style={{ accentColor: FOOD_COLORS[item] }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: selected.includes(item) ? FOOD_COLORS[item] : '#6b7280', fontWeight: selected.includes(item) ? 600 : 400 }}
                    >
                      {item}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        {selected.length > 0 ? (
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={v => v.toLocaleString()}
                label={{ value: currentMetric.unit, angle: -90, position: 'insideLeft', fontSize: 11, dx: -5 }}
                width={72}
              />
              <Tooltip
                formatter={(value, name) => [value !== null ? currentMetric.fmt(value) : '-', name]}
              />
              <Legend />
              {selected.map(item => (
                <Line
                  key={item}
                  type="monotone"
                  dataKey={item}
                  stroke={FOOD_COLORS[item]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">品目を選択してください</div>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">
          ⚠️ {DISCLAIMER}
        </p>
      </div>

      <NoteArea value={note} onChange={onNoteChange} onExport={onExport} />
    </div>
  )
}
