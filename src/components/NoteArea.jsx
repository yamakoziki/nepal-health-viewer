export default function NoteArea({ value, onChange, onExport }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">メモ・考察</h3>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="観察コメントや考察を自由に入力できます..."
        className="w-full h-24 px-3 py-2 text-sm border border-gray-200 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={onExport}
          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 transition-colors"
        >
          メモをエクスポート (JSON)
        </button>
        {value && (
          <button
            onClick={() => {
              const blob = new Blob([value], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'nepal_health_note.txt'
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded border hover:bg-gray-200 transition-colors"
          >
            テキストでエクスポート
          </button>
        )}
      </div>
    </div>
  )
}
