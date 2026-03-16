import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { type UserCategory, PALETTE_COLORS } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'
import { EmojiPicker } from '@/components/EmojiPicker'

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PALETTE_COLORS.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          title={c.label}
          className={`w-6 h-6 rounded-full border-2 transition-all ${
            value === c.value ? 'border-white scale-110' : 'border-transparent hover:border-zinc-500'
          }`}
          style={{ background: c.value }}
        />
      ))}
    </div>
  )
}

function CategoryRow({ cat }: { cat: UserCategory }) {
  const { updateCategory, deleteCategory } = useCategories()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const [emoji, setEmoji] = useState(cat.emoji)
  const [color, setColor] = useState(cat.color)

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {editing ? (
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <EmojiPicker value={emoji} onChange={setEmoji} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              autoFocus
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-zinc-500"
            />
          </div>
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2">
            <button onClick={cancel} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded-lg transition-colors">
              <X className="w-3 h-3" /> Cancelar
            </button>
            <button onClick={save} disabled={!name.trim()} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40">
              <Check className="w-3 h-3" /> Salvar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
          <span className="text-lg">{cat.emoji}</span>
          <span className="text-sm text-white font-medium flex-1">{cat.name}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
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
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 space-y-3">
        <p className="text-xs font-medium text-zinc-400">Nova categoria</p>
        <div className="flex gap-2">
          <EmojiPicker value={emoji} onChange={setEmoji} />
          <input
            type="text"
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') onClose() }}
            autoFocus
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
          />
        </div>
        <ColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button onClick={handleAdd} disabled={!name.trim()} className="flex-1 py-1.5 text-xs text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40">
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

  return (
    <div className="p-4 md:p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-white">Categorias</h1>
        <p className="text-zinc-500 text-sm mt-0.5">
          Organize suas atividades com categorias personalizadas.
        </p>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} cat={cat} />
          ))}

          {categories.length === 0 && !adding && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-600 text-sm py-8 text-center"
            >
              Nenhuma categoria ainda.
            </motion.p>
          )}

          {adding && (
            <AddCategoryForm key="add-form" onClose={() => setAdding(false)} />
          )}
        </AnimatePresence>

        {!adding && (
          <motion.button
            layout
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all text-sm mt-2"
          >
            <Plus className="w-4 h-4" />
            Nova categoria
          </motion.button>
        )}
      </div>
    </div>
  )
}
