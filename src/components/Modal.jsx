import { motion, AnimatePresence } from 'framer-motion'

export default function Modal({ open, onClose, title, children, width = 'max-w-xl' }) {
  if (!open) return null
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full ${width} bg-church-surface border border-church-border max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-church-border sticky top-0 bg-church-surface z-10">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-church-gold">{title}</h2>
              <button
                onClick={onClose}
                className="text-church-textMuted hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center border border-transparent hover:border-church-border transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Shared form field components for consistent styling
export function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-church-textMuted mb-1.5">
        {label}{required && <span className="text-church-gold ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

export const inputCls = [
  'w-full bg-church-background border border-church-border text-church-textMain text-sm px-3 py-2',
  'placeholder:text-church-textMuted focus:outline-none focus:border-church-gold transition-colors',
].join(' ')

export const selectCls = inputCls

export function FormActions({ onCancel, submitLabel = 'Save', loading }) {
  return (
    <div className="flex gap-3 pt-2 justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="text-xs uppercase tracking-widest text-church-textMuted border border-church-border px-4 py-2 hover:border-white hover:text-white transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="text-xs uppercase tracking-widest font-bold bg-church-gold text-church-background px-5 py-2 hover:bg-church-darkgold disabled:opacity-50 transition-colors"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </div>
  )
}
