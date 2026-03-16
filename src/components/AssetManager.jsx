import { useState, useEffect } from 'react'
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll
} from 'firebase/storage'
import { storage } from '../firebase/config'
import { useAuth } from '../contexts/AuthContext'

function FileIcon({ type }) {
  const isImage = type?.startsWith('image/')
  const isPDF = type === 'application/pdf'
  if (isImage) return <span className="text-2xl">🖼️</span>
  if (isPDF)   return <span className="text-2xl">📄</span>
  return <span className="text-2xl">📎</span>
}

export default function AssetManager({ pageId, sectionId }) {
  const { userProfile } = useAuth()
  const [assets, setAssets] = useState([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const storagePath = `assets/${sectionId}/${pageId}`

  // Load existing assets
  const loadAssets = async () => {
    try {
      const listRef = ref(storage, storagePath)
      const result = await listAll(listRef)
      const items = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item)
          return { name: item.name, url, fullPath: item.fullPath }
        })
      )
      setAssets(items)
    } catch {
      // folder may not exist yet — that's fine
    }
  }

  useEffect(() => { loadAssets() }, [pageId])

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError('')
    const fileRef = ref(storage, `${storagePath}/${Date.now()}_${file.name}`)
    const task = uploadBytesResumable(fileRef, file)
    setUploading(true)
    task.on(
      'state_changed',
      (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => { setError(err.message); setUploading(false) },
      async () => {
        setUploading(false)
        setProgress(0)
        await loadAssets()
      }
    )
    // Reset input
    e.target.value = ''
  }

  const handleDelete = async (asset) => {
    if (!window.confirm(`Delete "${asset.name}"?`)) return
    await deleteObject(ref(storage, asset.fullPath))
    await loadAssets()
  }

  const canManage = userProfile?.role === 'admin' || userProfile?.role === 'member'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Assets & Files</h3>
        {canManage && (
          <label className="cursor-pointer text-xs bg-church-navy text-church-gold border border-church-gold px-3 py-1.5 rounded-lg hover:bg-church-darknavy transition-colors font-medium">
            + Upload
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*,.pdf,.doc,.docx,.txt" />
          </label>
        )}
      </div>

      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-church-gold rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {assets.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No assets uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {assets.map(asset => {
            const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(asset.name)
            return (
              <div key={asset.fullPath} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-2 group">
                <FileIcon type={isImage ? 'image/' : ''} />
                <div className="flex-1 min-w-0">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-church-navy hover:text-church-gold truncate block"
                  >
                    {asset.name.replace(/^\d+_/, '')}
                  </a>
                  {isImage && (
                    <a href={asset.url} target="_blank" rel="noopener noreferrer">
                      <img src={asset.url} alt="" className="mt-1 w-full h-16 object-cover rounded" />
                    </a>
                  )}
                </div>
                {canManage && (
                  <button
                    onClick={() => handleDelete(asset)}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-1"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
