import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { CATEGORY_LABELS, type Slot, type Category } from '@/types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlotEditorProps {
  slot: Slot | null          // null = novo slot
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Slot, 'id' | 'order'>) => void
}

const CATEGORY_EMOJIS: Record<Category, string> = {
  work:   '💼', jiu: '🥋', pray: '🙏', read: '📚',
  study:  '⛪', video: '🎥', free: '💚', missa: '✝️', travel: '🚌',
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [Category, string][]

// ─── Componente — Bottom Sheet ────────────────────────────────────────────────

export function SlotEditor({ slot, open, onClose, onSave }: SlotEditorProps) {
  const isNew = slot === null

  const [time, setTime] = useState(slot?.time ?? '')
  const [name, setName] = useState(slot?.name ?? '')
  const [note, setNote] = useState(slot?.note ?? '')
  const [category, setCategory] = useState<Category>(slot?.category ?? 'work')

  // Sync state when slot prop changes
  useEffect(() => {
    if (open) {
      setTime(slot?.time ?? '')
      setName(slot?.name ?? '')
      setNote(slot?.note ?? '')
      setCategory(slot?.category ?? 'work')
    }
  }, [open, slot])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      time: time.trim(),
      name: name.trim(),
      note: note.trim() || undefined,
      category,
      icon: CATEGORY_EMOJIS[category],
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-50 bg-[var(--card)] border-t border-[var(--border)] rounded-t-2xl pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 40 }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
              <h2 className="font-serif text-lg font-semibold text-[var(--text)]">
                {isNew ? 'Novo slot' : 'Editar slot'}
              </h2>
              <button
                onClick={onClose}
                className="text-[var(--text-muted)] hover:text-[var(--text)] transition-colors w-8 h-8 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Horário */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Horário</label>
                <Input
                  placeholder="ex: 06h00 ou 06h00–08h00"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="text-base h-12"
                />
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">
                  Nome <span className="text-[var(--rose)]">*</span>
                </label>
                <Input
                  placeholder="ex: Jiu-Jitsu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-base h-12"
                />
              </div>

              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Categoria</label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {CATEGORY_EMOJIS[value]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nota */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text-muted)]">Nota (opcional)</label>
                <Textarea
                  placeholder="ex: Presencial, Academia, etc."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="text-base"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 pb-2">
                <Button variant="ghost" onClick={onClose} className="flex-1 h-12">
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!name.trim()} className="flex-1 h-12">
                  {isNew ? 'Adicionar' : 'Salvar'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
