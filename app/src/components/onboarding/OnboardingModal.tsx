import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Check, Search } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { type UserCategory, DEFAULT_CATEGORIES, PALETTE_COLORS, CATEGORY_GROUPS } from '@/types'
import { useCategories } from '@/contexts/CategoryContext'
import { useAuth } from '@/contexts/AuthContext'

export function OnboardingModal() {
  const { user } = useAuth()
  const { isOnboarded, finishOnboarding } = useCategories()

  const [selected, setSelected] = useState<UserCategory[]>([])
  const [step, setStep] = useState<'welcome' | 'categories'>('welcome')
  const [search, setSearch] = useState('')

  // Nova categoria inline
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('⭐')
  const [newColor, setNewColor] = useState(PALETTE_COLORS[0].value)

  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return DEFAULT_CATEGORIES
    return DEFAULT_CATEGORIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.group?.toLowerCase().includes(q) ||
        c.emoji.includes(q)
    )
  }, [search])

  const grouped = useMemo(() => {
    if (search.trim()) {
      return [{ group: 'Resultados', cats: filteredBySearch }]
    }
    return CATEGORY_GROUPS.map((group) => ({
      group,
      cats: DEFAULT_CATEGORIES.filter((c) => c.group === group),
    })).filter((g) => g.cats.length > 0)
  }, [filteredBySearch, search])

  const customSelected = selected.filter((c) => !DEFAULT_CATEGORIES.find((d) => d.id === c.id))

  if (isOnboarded) return null

  function toggle(cat: UserCategory) {
    setSelected((prev) =>
      prev.find((c) => c.id === cat.id)
        ? prev.filter((c) => c.id !== cat.id)
        : [...prev, cat]
    )
  }

  function addCustom() {
    if (!newName.trim()) return
    const cat: UserCategory = { id: uuidv4(), name: newName.trim(), emoji: newEmoji, color: newColor }
    setSelected((prev) => [...prev, cat])
    setNewName('')
    setNewEmoji('⭐')
    setNewColor(PALETTE_COLORS[0].value)
    setAdding(false)
  }

  function handleFinish() {
    finishOnboarding(selected.length > 0 ? selected : DEFAULT_CATEGORIES)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {step === 'welcome' ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 text-center"
            >
              <div className="text-5xl mb-4">👋</div>
              <h2 className="text-xl font-bold text-white mb-2">
                Olá, {user?.name.split(' ')[0]}!
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                Bem-vindo ao <span className="text-white font-medium">Rotina</span>. Vamos configurar suas categorias de atividade para você começar a organizar sua semana.
              </p>
              <button
                onClick={() => setStep('categories')}
                className="w-full bg-white text-zinc-900 font-medium py-2.5 rounded-xl hover:bg-zinc-100 transition-colors"
              >
                Configurar categorias →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-3 border-b border-zinc-800 space-y-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Suas categorias</h2>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Selecione as que fazem sentido pra você. Pode mudar depois.
                  </p>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Buscar categoria..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista */}
              <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
                {grouped.map(({ group, cats }) => (
                  <div key={group}>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      {group}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cats.map((cat) => {
                        const isSelected = !!selected.find((c) => c.id === cat.id)
                        return (
                          <button
                            key={cat.id}
                            onClick={() => toggle(cat)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all text-left ${
                              isSelected
                                ? 'border-zinc-600 bg-zinc-800'
                                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800/50'
                            }`}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: cat.color.startsWith('var') ? undefined : cat.color, backgroundColor: cat.color.startsWith('var') ? `hsl(var(${cat.color.slice(4,-1)}))` : undefined }}
                            />
                            <span className="text-base leading-none">{cat.emoji}</span>
                            <span className="text-xs text-white font-medium flex-1 leading-tight">{cat.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-zinc-400 shrink-0" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {filteredBySearch.length === 0 && search && (
                  <p className="text-zinc-500 text-sm text-center py-4">
                    Nenhuma categoria encontrada para "{search}"
                  </p>
                )}

                {/* Categorias customizadas adicionadas */}
                {customSelected.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Personalizadas
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {customSelected.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-zinc-600 bg-zinc-800"
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                          <span className="text-base leading-none">{cat.emoji}</span>
                          <span className="text-xs text-white font-medium flex-1 leading-tight">{cat.name}</span>
                          <button
                            onClick={() => setSelected((p) => p.filter((c) => c.id !== cat.id))}
                            className="text-zinc-500 hover:text-red-400 transition-colors shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adicionar nova */}
                <AnimatePresence>
                  {adding ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border border-zinc-700 rounded-xl p-4 space-y-3 bg-zinc-800/50">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Emoji"
                            value={newEmoji}
                            onChange={(e) => setNewEmoji(e.target.value)}
                            className="w-14 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-center text-sm text-white focus:outline-none focus:border-zinc-500"
                          />
                          <input
                            type="text"
                            placeholder="Nome da categoria"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                            autoFocus
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {PALETTE_COLORS.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => setNewColor(c.value)}
                              title={c.label}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                newColor === c.value ? 'border-white scale-110' : 'border-transparent'
                              }`}
                              style={{ background: c.value }}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAdding(false)}
                            className="flex-1 py-1.5 text-xs text-zinc-400 hover:text-white border border-zinc-700 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={addCustom}
                            disabled={!newName.trim()}
                            className="flex-1 py-1.5 text-xs text-zinc-900 bg-white rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-40"
                          >
                            Adicionar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setAdding(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar categoria personalizada
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 pb-6 pt-4 border-t border-zinc-800">
                <button
                  onClick={handleFinish}
                  className="w-full bg-white text-zinc-900 font-medium py-2.5 rounded-xl hover:bg-zinc-100 transition-colors"
                >
                  {selected.length > 0
                    ? `Começar (${selected.length} ${selected.length === 1 ? 'categoria' : 'categorias'})`
                    : 'Pular e começar'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
