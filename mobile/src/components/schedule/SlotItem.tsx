import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/utils/cn'
import { Checkbox } from '@/components/ui/checkbox'
import type { Slot, Category } from '@/types'

// ─── Mapa de cores por categoria ─────────────────────────────────────────────

const CATEGORY_COLORS: Record<Category, string> = {
  work:   'var(--work)',
  jiu:    'var(--blue)',
  pray:   'var(--gold)',
  read:   'var(--orange)',
  study:  'var(--purple)',
  video:  'var(--rose)',
  free:   'var(--green)',
  missa:  'var(--gold-light)',
  travel: 'var(--text-muted)',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlotItemProps {
  slot: Slot
  checked: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 60 // px

export function SlotItem({ slot, checked, onToggle, onEdit, onDelete }: SlotItemProps) {
  const color = CATEGORY_COLORS[slot.category]

  // Swipe-to-reveal-delete
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const startXRef = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    setSwiping(true)
    setRevealed(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current === null) return
    const dx = e.touches[0].clientX - startXRef.current
    // Only allow left swipe (negative dx)
    if (dx > 0) { setOffsetX(0); return }
    setOffsetX(Math.max(dx, -80))
  }

  const handleTouchEnd = () => {
    setSwiping(false)
    startXRef.current = null
    if (offsetX < -SWIPE_THRESHOLD) {
      setOffsetX(-72)
      setRevealed(true)
    } else {
      setOffsetX(0)
      setRevealed(false)
    }
  }

  const handleDeleteConfirm = () => {
    setOffsetX(0)
    setRevealed(false)
    onDelete()
  }

  const handleBackdropPress = () => {
    if (revealed) {
      setOffsetX(0)
      setRevealed(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete button revealed underneath */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={handleDeleteConfirm}
          className="w-14 h-full flex items-center justify-center text-[var(--rose)] active:opacity-70"
          aria-label="Remover slot"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop to close swipe */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="fixed inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropPress}
          />
        )}
      </AnimatePresence>

      {/* Slot row */}
      <motion.div
        animate={{ x: offsetX }}
        transition={swiping ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 35 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ borderLeftColor: color }}
        className={cn(
          'relative z-20 flex items-center gap-3 px-3 py-3 rounded-lg',
          'border-l-2 bg-[var(--card)] transition-opacity duration-200',
          'min-h-[56px]',
          checked && 'opacity-55'
        )}
      >
        {/* Checkbox — 24×24 touch target */}
        <div className="shrink-0 flex items-center justify-center w-7 h-7">
          <Checkbox
            checked={checked}
            onCheckedChange={onToggle}
            className="h-5 w-5"
          />
        </div>

        {/* Conteúdo — toque para editar */}
        <button
          onClick={onEdit}
          className="flex-1 text-left min-w-0 focus:outline-none"
        >
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[var(--text-muted)] text-xs font-mono shrink-0">
              {slot.time}
            </span>
            <span
              className={cn(
                'text-sm font-medium',
                checked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'
              )}
            >
              {slot.icon && <span className="mr-1">{slot.icon}</span>}
              {slot.name}
            </span>
          </div>
          {slot.note && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{slot.note}</p>
          )}
        </button>
      </motion.div>
    </div>
  )
}
