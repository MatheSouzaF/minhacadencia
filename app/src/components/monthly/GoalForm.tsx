import { useState } from 'react'
import { X, CalendarCheck, TrendingUp, Trophy } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { EmojiPicker } from '@/components/EmojiPicker'
import { PALETTE_COLORS } from '@/types'
import { cn } from '@/utils/cn'
import type { MonthlyGoal } from '@/types'

type GoalType = 'habit' | 'progress' | 'milestone'

const GOAL_TYPES: {
  id: GoalType
  label: string
  desc: string
  icon: React.ElementType
  color: string
  emoji: string
  placeholder: string
}[] = [
  {
    id: 'habit',
    label: 'Hábito',
    desc: 'Repetir com frequência',
    icon: CalendarCheck,
    color: 'var(--gold)',
    emoji: '🔥',
    placeholder: 'Ex: Academia, Meditação...',
  },
  {
    id: 'progress',
    label: 'Progresso',
    desc: 'Acumular um valor',
    icon: TrendingUp,
    color: 'var(--blue)',
    emoji: '📈',
    placeholder: 'Ex: Juntar dinheiro, Correr...',
  },
  {
    id: 'milestone',
    label: 'Conquista',
    desc: 'Realizar uma vez',
    icon: Trophy,
    color: 'var(--green)',
    emoji: '🏆',
    placeholder: 'Ex: Ler um livro, Viajar...',
  },
]

const UNITS: Record<Exclude<GoalType, 'milestone'>, string[]> = {
  habit:    ['dias', 'vezes', 'semanas'],
  progress: ['R$', 'km', 'páginas', 'horas', 'kg'],
}

const DEFAULT_UNIT: Record<Exclude<GoalType, 'milestone'>, string> = {
  habit:    'dias',
  progress: 'R$',
}

function sentencePrefix(type: GoalType): string {
  return type === 'progress' ? 'Chegar em' : 'Fazer isso'
}

interface GoalFormProps {
  month: string
  initialData?: Partial<MonthlyGoal>
  onSave: (data: Omit<MonthlyGoal, 'id' | 'entries'>) => Promise<void>
  onCancel: () => void
}

export function GoalForm({ month, initialData, onSave, onCancel }: GoalFormProps) {
  const isEditing = !!initialData?.id

  const [goalType, setGoalType] = useState<GoalType>('habit')
  const [emoji, setEmoji]   = useState(initialData?.emoji ?? '🔥')
  const [title, setTitle]   = useState(initialData?.title ?? '')
  const [target, setTarget] = useState(String(initialData?.target ?? ''))
  const [unit, setUnit]     = useState(initialData?.unit ?? 'dias')
  const [color, setColor]   = useState(initialData?.color ?? 'var(--gold)')
  const [isSaving, setIsSaving] = useState(false)

  function handleTypeChange(type: GoalType) {
    const cfg = GOAL_TYPES.find((t) => t.id === type)!
    setGoalType(type)
    setEmoji(cfg.emoji)
    setColor(cfg.color)
    setTarget('')
    if (type !== 'milestone') setUnit(DEFAULT_UNIT[type])
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title.trim()) return
    const finalTarget = goalType === 'milestone' ? 1 : parseInt(target, 10) || 1
    const finalUnit   = goalType === 'milestone' ? '' : unit.trim()
    setIsSaving(true)
    try {
      await onSave({ month, title: title.trim(), emoji, unit: finalUnit, target: finalTarget, color })
    } finally {
      setIsSaving(false)
    }
  }

  const activeCfg  = GOAL_TYPES.find((t) => t.id === goalType)!
  const showFields = goalType !== 'milestone'
  const units      = goalType !== 'milestone' ? UNITS[goalType] : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Accent bar */}
        <div className="h-0.5 w-full transition-colors duration-300" style={{ backgroundColor: color }} />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text)]">
              {isEditing ? 'Editar meta' : 'Nova meta'}
            </h2>
            <button
              onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            {!isEditing && (
              <div className="grid grid-cols-3 gap-1.5">
                {GOAL_TYPES.map(({ id, label, desc, icon: Icon, color: c }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleTypeChange(id)}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-center transition-all duration-150',
                      goalType === id
                        ? 'border-transparent'
                        : 'border-[var(--border)] opacity-50 hover:opacity-80'
                    )}
                    style={goalType === id ? {
                      borderColor: c,
                      backgroundColor: `color-mix(in srgb, ${c} 10%, var(--surface))`,
                    } : {}}
                  >
                    <Icon className="w-4 h-4" style={{ color: goalType === id ? c : 'var(--text-muted)' }} />
                    <span className="text-[11px] font-semibold text-[var(--text)] leading-none">{label}</span>
                    <span className="text-[9px] text-[var(--text-muted)] leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Emoji + Título */}
            <div className="flex gap-2 items-center">
              <EmojiPicker value={emoji} onChange={setEmoji} />
              <input
                type="text"
                placeholder={activeCfg.placeholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
                className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors"
              />
            </div>

            {/* Sentence builder */}
            <AnimatePresence>
              {showFields && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden space-y-2"
                >
                  <div className="flex items-center gap-2 bg-[var(--surface)] rounded-xl px-3 py-2.5">
                    <span className="text-xs text-[var(--text-muted)] shrink-0">
                      {sentencePrefix(goalType)}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      min={1}
                      max={99999}
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      required
                      className="w-14 bg-transparent text-sm font-semibold text-[var(--text)] text-center focus:outline-none placeholder:text-zinc-600"
                    />
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
                        color,
                      }}
                    >
                      {unit}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">neste mês</span>
                  </div>

                  {/* Unit chips */}
                  <div className="flex gap-1.5 flex-wrap">
                    {units.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setUnit(u)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150',
                          unit === u
                            ? 'text-black scale-[1.04]'
                            : 'bg-gray-200 text-[var(--text-muted)] hover:text-[var(--text)]'
                        )}
                        style={unit === u ? { backgroundColor: color } : {}}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Conquista — apenas info */}
            {goalType === 'milestone' && (
              <p className="text-xs text-[var(--text-muted)] bg-[var(--surface)] rounded-xl px-3 py-2.5 leading-relaxed">
                Você vai marcar como concluída quando atingir essa conquista.
              </p>
            )}

            {/* Cor */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-[var(--text-muted)]">Cor</span>
              <div className="flex gap-2 flex-wrap">
                {PALETTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'w-6 h-6 rounded-full transition-all duration-150',
                      color === c.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--card)] scale-110'
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                    )}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim() || (showFields && !target)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: color }}
              >
                {isSaving ? 'Salvando...' : isEditing ? 'Salvar' : 'Criar meta'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
