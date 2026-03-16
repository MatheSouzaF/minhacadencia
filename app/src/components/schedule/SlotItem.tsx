import { Trash2, GripVertical } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/utils/cn'
import { Checkbox } from '@/components/ui/checkbox'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Slot } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SlotItemProps {
  slot: Slot
  checked: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SlotItem({ slot, checked, onToggle, onEdit, onDelete }: SlotItemProps) {
  const { getCategoryById } = useCategories()
  const color = getCategoryById(slot.category)?.color ?? 'var(--text-muted)'

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slot.id })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto' as const,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={{ ...dndStyle, borderLeftColor: color }}
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isDragging ? 0.5 : 1, x: 0 }}
      exit={{ opacity: 0, x: -8, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative flex items-start gap-3 px-3 py-2.5 rounded-lg',
        'border-l-2 transition-colors duration-200',
        'hover:bg-[var(--surface)]',
        checked && 'opacity-55',
        isDragging && 'shadow-2xl bg-[var(--card)]'
      )}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-[var(--border)] hover:text-[var(--text-muted)] transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
        tabIndex={-1}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {/* Checkbox */}
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        className="mt-0.5 shrink-0"
      />

      {/* Conteúdo */}
      <button
        onClick={onEdit}
        className="flex-1 text-left min-w-0 focus:outline-none cursor-pointer group/edit"
      >
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[var(--text-muted)] text-xs font-mono shrink-0">
            {slot.time}
          </span>
          <motion.span
            animate={{ opacity: checked ? 0.55 : 1 }}
            className={cn(
              'text-sm font-medium transition-colors duration-150',
              checked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)] group-hover/edit:text-[var(--gold)]'
            )}
          >
            {slot.icon && <span className="mr-1">{slot.icon}</span>}
            {slot.name}
          </motion.span>
        </div>
        {slot.note && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {slot.note}
          </p>
        )}
      </button>

      {/* Botão deletar */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[var(--text-muted)] hover:text-[var(--rose)] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Remover slot</TooltipContent>
      </Tooltip>
    </motion.div>
  )
}
