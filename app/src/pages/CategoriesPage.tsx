import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X, Search, Tag } from 'lucide-react'
import { type UserCategory, PALETTE_COLORS } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'
import { EmojiPicker } from '@/components/EmojiPicker'

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {PALETTE_COLORS.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          title={c.label}
          className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
            value === c.value ? 'ring-2 ring-offset-2 ring-offset-white ring-[var(--gold)] scale-110' : 'hover:scale-110'
          }`}
          style={{ background: `var(${c.value.slice(4, -1)})` || c.value }}
        />
      ))}
    </div>
  )
}

function CategoryRow({ cat, index }: { cat: UserCategory; index: number }) {
  const { updateCategory, deleteCategory } = useCategories()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [emoji, setEmoji] = useState(cat.emoji)
  const [color, setColor] = useState(cat.color)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function save() {
    if (!name.trim()) return
    updateCategory(cat.id, { name: name.trim(), emoji, color })
    setEditing(false)
  }

  function cancel() {
    setName(cat.name)
    setEmoji(cat.emoji)
    setColor(cat.color)
    setEditing(false)
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    deleteCategory(cat.id)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      {editing ? (
        <div className="bg-white border border-[var(--gold)]/30 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex gap-2 items-center">
            <EmojiPicker value={emoji} onChange={setEmoji} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              autoFocus
              className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2 pt-1">
            <button onClick={cancel} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg)] rounded-lg transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" /> Cancelar
            </button>
            <button onClick={save} disabled={!name.trim()} className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-white bg-[var(--gold)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer">
              <Check className="w-3.5 h-3.5" /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-transparent hover:border-[var(--border)] hover:shadow-sm transition-all cursor-default"
        >
          {/* Color dot + emoji */}
          <div className="relative">
            <span className="text-2xl leading-none">{cat.emoji}</span>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
              style={{ background: cat.color }}
            />
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className="text-sm text-[var(--text)] font-medium">{cat.name}</span>
            {cat.group && (
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{cat.group}</p>
            )}
          </div>

          {/* Actions — appear on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded-lg transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                confirmDelete
                  ? 'text-white bg-[var(--rose)] hover:bg-[var(--rose)]/80'
                  : 'text-[var(--text-muted)] hover:text-[var(--rose)] hover:bg-red-50'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function AddCategoryForm({ onClose }: { onClose: () => void }) {
  const { addCategory } = useCategories()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const [color, setColor] = useState(PALETTE_COLORS[0].value)

  function handleAdd() {
    if (!name.trim()) return
    addCategory({ name: name.trim(), emoji, color })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-white border border-[var(--gold)]/30 rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider">Nova categoria</p>
        <div className="flex gap-2 items-center">
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <input
            type="text"
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onClose() }}
            autoFocus
            className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors"
          />
        </div>
        <ColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] bg-[var(--bg)] rounded-lg transition-colors cursor-pointer">
            Cancelar
          </button>
          <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-2 text-xs font-medium text-white bg-[var(--gold)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40 cursor-pointer">
            Adicionar
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export function CategoriesPage() {
  const { categories } = useCategories()
  const [adding, setAdding] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group?.toLowerCase().includes(q)
    )
  }, [categories, search])

  // Group by group field
  const grouped = useMemo(() => {
    const groups: { label: string; items: UserCategory[] }[] = []
    const ungrouped: UserCategory[] = []
    filtered.forEach((cat) => {
      if (cat.group) {
        const existing = groups.find((g) => g.label === cat.group)
        if (existing) existing.items.push(cat)
        else groups.push({ label: cat.group, items: [cat] })
      } else {
        ungrouped.push(cat)
      }
    })
    if (ungrouped.length > 0) groups.push({ label: 'Personalizadas', items: ungrouped })
    return groups
  }, [filtered])

  let itemIndex = 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--gold)]/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-[var(--gold)]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">Categorias</h1>
            <p className="text-[var(--text-muted)] text-xs">
              {categories.length} {categories.length === 1 ? 'categoria configurada' : 'categorias configuradas'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search inline */}
          {categories.length > 4 && (
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 bg-white border border-[var(--border)] rounded-lg pl-9 pr-8 py-1.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {!adding && (
            <motion.button
              layout
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--gold)] text-white text-xs font-medium hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Search mobile */}
      {categories.length > 4 && (
        <div className="relative md:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <div className="max-w-md">
            <AddCategoryForm key="add-form" onClose={() => setAdding(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Grid list */}
      <AnimatePresence mode="popLayout">
        {grouped.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-[var(--surface)] flex items-center justify-center">
              <Search className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] text-sm">
              {search ? `Nenhum resultado para "${search}"` : 'Nenhuma categoria ainda.'}
            </p>
          </motion.div>
        )}

        {grouped.map(({ label, items }) => (
          <motion.div key={label} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1">
              {label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <AnimatePresence mode="popLayout">
                {items.map((cat) => {
                  const i = itemIndex++
                  return <CategoryRow key={cat.id} cat={cat} index={i} />
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
