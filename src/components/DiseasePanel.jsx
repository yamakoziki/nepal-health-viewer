import { useState, useRef, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceArea,
} from 'recharts'
import NoteArea from './NoteArea'

const DISEASE_DISPLAY_NAMES = {
  'Total Cancers excluding Non-melanoma skin cancer': '全ての癌(非メラノーマ皮膚癌除く)',
}
export const getDisplayName = name => DISEASE_DISPLAY_NAMES[name] || name

const COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c',
  '#0891b2', '#be185d', '#4d7c0f', '#b45309', '#1d4ed8',
  '#991b1b', '#065f46', '#6b21a8', '#c2410c', '#075985',
  '#831843', '#365314', '#92400e', '#1e3a5f', '#7f1d1d',
]

const MEASURES = [
  { key: '死亡', label: '死亡' },
  { key: '障害調整生存年数', label: 'DALY (障害調整生存年数)' },
]

const METRICS = [
  { key: '率', label: '率 (人口あたり)' },
  { key: '数', label: '数 (絶対数)' },
  { key: '%', label: '% (全死因比)' },
]

const YEARS = Array.from({ length: 44 }, (_, i) => String(1980 + i))

const DISCLAIMER =
  '本グラフは食品消費量と疾病統計の経年変化を並べて表示するものであり、両者の間に統計的な相関や因果関係を示すものではありません。'

const fmtTick = (v, metric) => {
  if (metric === '%') return `${v.toFixed(1)}%`
  if (metric === '数') return Math.round(v).toLocaleString()
  return v.toFixed(1)
}

const fmtTooltip = (v, metric) => {
  if (v === null || v === undefined) return '-'
  if (metric === '%') return `${v.toFixed(2)}%`
  if (metric === '数') return Math.round(v).toLocaleString()
  return v.toFixed(1)
}

export default function DiseasePanel({ data, note, onNoteChange, onExport }) {
  const allDiseases = Object.keys(data)
  const [selected, setSelected] = useState(['全ての癌', '虚血性心疾患', '脳血管疾患'])
  const [measure, setMeasure] = useState('死亡')
  const [metric, setMetric] = useState('率')
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = allDiseases.filter(d =>
    getDisplayName(d).toLowerCase().includes(search.toLowerCase())
  )

  const toggle = d => setSelected(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const chartData = YEARS.map(year => {
    const point = { year }
    selected.forEach(d => {
      point[d] = data[d]?.[measure]?.[metric]?.[year] ?? null
    })
    return point
  })

  const getUnit = () => {
    const m = MEASURES.find(m => m.key === measure)?.label || ''
    const k = METRICS.find(m => m.key === metric)?.label || ''
    return `${m} ${k}`
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-base font-semibold text-gray-800 mb-3">疾病トレンドパネル (1980–2023)</h2>

        {/* Measure tabs */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="text-xs text-gray-400 self-center">指標:</span>
          {MEASURES.map(m => (
            <button
              key={m.key}
              onClick={() => setMeasure(m.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${measure === m.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Metric tabs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs text-gray-400 self-center">単位:</span>
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${metric === m.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Searchable multi-select */}
        <div className="relative mb-4" ref={dropdownRef}>
          <div
            className="min-h-10 border border-gray-300 rounded-lg px-2 py-1.5 cursor-pointer flex flex-wrap gap-1 items-center hover:border-blue-400"
            onClick={() => setOpen(o => !o)}
          >
            {selected.length === 0 && <span className="text-gray-400 text-sm">疾病カテゴリを選択...</span>}
            {selected.map((d, i) => (
              <span
                key={d}
                className="flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {getDisplayName(d)}
                <button
                  onClick={e => { e.stopPropagation(); toggle(d) }}
                  className="opacity-80 hover:opacity-100 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <span className="ml-auto text-gray-400 text-xs pl-2">{open ? '▲' : '▼'}</span>
          </div>

          {open && (
            <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-72 flex flex-col">
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="疾病名を検索..."
                  className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onClick={e => e.stopPropagation()}
                  autoFocus
                />
              </div>
              <div className="overflow-y-auto flex-1">
                {filtered.map(d => (
                  <div
                    key={d}
                    className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selected.includes(d) ? 'bg-blue-50' : ''}`}
                    onClick={e => { e.stopPropagation(); toggle(d) }}
                  >
                    <input type="checkbox" checked={selected.includes(d)} readOnly className="w-4 h-4 pointer-events-none" />
                    <span>{getDisplayName(d)}</span>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">該当なし</p>
                )}
              </div>
              <div className="border-t p-2 text-xs text-gray-400 text-center">{selected.length}件選択中</div>
            </div>
          )}
        </div>

        {/* Chart */}
        {selected.length > 0 ? (
          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} interval={4} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={v => fmtTick(v, metric)}
                label={{ value: getUnit(), angle: -90, position: 'insideLeft', fontSize: 10, dx: -5 }}
                width={80}
              />
              <Tooltip
                formatter={(value, name) => [fmtTooltip(value, metric), getDisplayName(name)]}
              />
              <Legend formatter={name => getDisplayName(name)} />
              <ReferenceArea
                x1="2010"
                x2="2023"
                fill="#dbeafe"
                fillOpacity={0.4}
                label={{ value: '← 食品データ期間', position: 'insideTopLeft', fontSize: 10, fill: '#3b82f6' }}
              />
              {selected.map((d, i) => (
                <Line
                  key={d}
                  type="monotone"
                  dataKey={d}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-400">疾病を選択してください</div>
        )}

        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 mt-3">
          ⚠️ {DISCLAIMER}
        </p>
      </div>

      <NoteArea value={note} onChange={onNoteChange} onExport={onExport} />
    </div>
  )
}
