import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

const TEMPLATE_ROWS = [
  ['Section Name', 'Page Title', 'Notes'],
  ['Title Page', 'Title Page', 'Full spread opening title'],
  ['Magisterium Section', 'Bishop John Smith & Family', 'Include family photo and bio'],
  ['Magisterium Section', 'Bishop Mary Jones & Family', ''],
  ['History of the Church', 'Founding Story', 'Written by Elder Davis'],
  ['Legends of the Seals', 'Seal of Apostles', ''],
]

function downloadTemplate() {
  const csv = TEMPLATE_ROWS.map(r => r.map(c => `"${c}"`).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'convocation-book-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// Normalize a JSON entry (from your format) into the standard row format
function normalizeJsonEntry(entry) {
  const sectionName = (entry.section_type || entry['Section Name'] || '').trim()
  const pageTitle   = (entry.title || entry['Page Title'] || '').trim()
  const noteParts   = [
    entry.description,
    entry.content_source ? `Source: ${entry.content_source}` : '',
    entry.design_type    ? `Design: ${entry.design_type}`    : '',
    entry['Notes']       || '',
  ].filter(Boolean)
  return {
    'Section Name': sectionName,
    'Page Title':   pageTitle,
    'Notes':        noteParts.join(' | '),
  }
}

export default function BulkImport({ onClose }) {
  const { userProfile } = useAuth()
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [importLog, setImportLog] = useState([])
  const fileRef = useRef()

  if (userProfile?.role !== 'admin') return null

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    setRows([])

    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'json') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result)
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          const normalized = arr.map(normalizeJsonEntry)
          const valid = normalized.filter(r => r['Section Name'] && r['Page Title'])
          if (!valid.length) {
            setError('No valid entries found. Each JSON object needs section_type and title fields.')
            return
          }
          setRows(valid)
        } catch {
          setError('Invalid JSON file. Please check the file and try again.')
        }
      }
      reader.readAsText(file)
    } else {
      // CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Check if it looks like the JSON-style CSV (has section_type column)
          const fields = results.meta.fields || []
          let normalized

          if (fields.includes('section_type') || fields.includes('title')) {
            normalized = results.data.map(normalizeJsonEntry)
          } else {
            const missing = ['Section Name', 'Page Title'].filter(f => !fields.includes(f))
            if (missing.length) {
              setError(`Missing columns: ${missing.join(', ')}. Download the template for the correct format.`)
              return
            }
            normalized = results.data
          }

          const valid = normalized.filter(r => r['Section Name']?.trim() && r['Page Title']?.trim())
          if (!valid.length) {
            setError('No valid rows found. Make sure section and page title fields are filled.')
            return
          }
          setRows(valid)
        },
        error: (err) => setError(err.message),
      })
    }
    e.target.value = ''
  }

  const handleImport = async () => {
    setImporting(true)
    const log = []

    const existingSnap = await getDocs(collection(db, 'sections'))
    const sectionMap = {}
    existingSnap.forEach(d => { sectionMap[d.data().name.trim().toLowerCase()] = d.id })

    const pagesSnap = await getDocs(collection(db, 'pages'))
    const pageCountBySectionId = {}
    pagesSnap.forEach(d => {
      const sid = d.data().sectionId
      pageCountBySectionId[sid] = (pageCountBySectionId[sid] || 0) + 1
    })

    const sectionOrderOffset = Object.keys(sectionMap).length

    for (const row of rows) {
      const sectionName = row['Section Name'].trim()
      const pageTitle   = row['Page Title'].trim()
      const notes       = (row['Notes'] || '').trim()
      const key         = sectionName.toLowerCase()

      if (!sectionMap[key]) {
        const newSection = await addDoc(collection(db, 'sections'), {
          name: sectionName,
          description: '',
          order: sectionOrderOffset + Object.keys(sectionMap).length,
          createdAt: serverTimestamp(),
        })
        sectionMap[key] = newSection.id
        log.push({ type: 'section', label: `Created section: ${sectionName}` })
      }

      const sectionId = sectionMap[key]
      const pageOrder = pageCountBySectionId[sectionId] || 0

      await addDoc(collection(db, 'pages'), {
        sectionId,
        title: pageTitle,
        status: 'Not Started',
        assignedTo: '',
        notes,
        order: pageOrder,
        createdAt: serverTimestamp(),
      })
      pageCountBySectionId[sectionId] = pageOrder + 1
      log.push({ type: 'page', label: `${pageTitle} → ${sectionName}` })
    }

    setImportLog(log)
    setImporting(false)
    setDone(true)
  }

  const grouped = rows.reduce((acc, row) => {
    const sec = row['Section Name'].trim()
    if (!acc[sec]) acc[sec] = []
    acc[sec].push(row)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="bg-church-navy rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Bulk Import — Sections & Pages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {done ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-semibold">
                  Import complete — {importLog.filter(l => l.type === 'page').length} pages added
                  across {importLog.filter(l => l.type === 'section').length} new section{importLog.filter(l => l.type === 'section').length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto bg-gray-50 rounded-xl p-3 space-y-1">
                {importLog.map((entry, i) => (
                  <div key={i} className={`text-xs flex items-center gap-2 ${entry.type === 'section' ? 'text-church-navy font-semibold' : 'text-gray-600 pl-4'}`}>
                    <span>{entry.type === 'section' ? '📁' : '📄'}</span>
                    <span>{entry.label}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="w-full bg-church-navy text-church-gold border border-church-gold rounded-xl py-2.5 text-sm font-semibold"
              >
                Done — View Sections
              </button>
            </div>
          ) : (
            <>
              {/* Template download */}
              <div className="bg-church-cream border border-church-lightgold rounded-xl p-4">
                <p className="text-sm font-semibold text-church-navy mb-1">Step 1 — Prepare your file</p>
                <p className="text-xs text-gray-500 mb-3">
                  Upload a <strong>CSV</strong> or <strong>JSON</strong> file. JSON files exported from your planning tool are supported automatically.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-xs bg-church-navy text-church-gold border border-church-gold px-4 py-2 rounded-lg font-medium hover:bg-church-darknavy transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV Template
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  JSON format: array of objects with <code className="bg-gray-100 px-1 rounded">section_type</code>, <code className="bg-gray-100 px-1 rounded">title</code>, <code className="bg-gray-100 px-1 rounded">description</code>, <code className="bg-gray-100 px-1 rounded">content_source</code>, <code className="bg-gray-100 px-1 rounded">design_type</code>
                </p>
              </div>

              {/* File upload */}
              <div>
                <p className="text-sm font-semibold text-church-navy mb-2">Step 2 — Upload your file</p>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-church-gold rounded-xl p-8 cursor-pointer transition-colors group">
                  <svg className="w-10 h-10 text-gray-300 group-hover:text-church-gold mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span className="text-sm text-gray-500 group-hover:text-church-navy font-medium">Click to select CSV or JSON file</span>
                  <span className="text-xs text-gray-400 mt-1">Supports .csv and .json</span>
                  <input ref={fileRef} type="file" accept=".csv,.json" className="hidden" onChange={handleFile} />
                </label>
                {error && (
                  <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>
                )}
              </div>

              {/* Preview */}
              {rows.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-church-navy mb-2">
                    Step 3 — Review & Import
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      {rows.length} pages across {Object.keys(grouped).length} section{Object.keys(grouped).length !== 1 ? 's' : ''}
                    </span>
                  </p>
                  <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                    {Object.entries(grouped).map(([section, pages]) => (
                      <div key={section}>
                        <div className="bg-church-navy/5 px-4 py-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-church-navy">📁 {section}</span>
                          <span className="text-xs text-gray-400">({pages.length} page{pages.length !== 1 ? 's' : ''})</span>
                        </div>
                        {pages.map((row, i) => (
                          <div key={i} className="px-4 py-2 flex items-start gap-3">
                            <span className="text-xs text-gray-400 mt-0.5">📄</span>
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-800">{row['Page Title']}</p>
                              {row['Notes'] && <p className="text-xs text-gray-400 truncate">{row['Notes']}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => { setRows([]); setError('') }}
                      className="flex-1 border border-gray-300 text-gray-600 rounded-xl py-2.5 text-sm hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="flex-1 bg-church-navy text-church-gold border border-church-gold rounded-xl py-2.5 text-sm font-bold hover:bg-church-darknavy transition-colors disabled:opacity-50"
                    >
                      {importing ? 'Importing…' : `Import ${rows.length} Pages`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
