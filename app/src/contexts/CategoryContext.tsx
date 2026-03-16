import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { type UserCategory, DEFAULT_CATEGORIES } from '@/types'
import { useAuth } from './AuthContext'

interface CategoryContextValue {
  categories: UserCategory[]
  isOnboarded: boolean
  finishOnboarding: (selected: UserCategory[]) => void
  addCategory: (cat: Omit<UserCategory, 'id'>) => UserCategory
  updateCategory: (id: string, changes: Partial<Omit<UserCategory, 'id'>>) => void
  deleteCategory: (id: string) => void
  getCategoryById: (id: string) => UserCategory | undefined
}

const CategoryContext = createContext<CategoryContextValue | null>(null)

function lsKey(userId: string) {
  return `rotina:categories:${userId}`
}
function lsOnboardedKey(userId: string) {
  return `rotina:onboarded:${userId}`
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<UserCategory[]>([])
  const [isOnboarded, setIsOnboarded] = useState(true) // true evita flash antes de carregar

  useEffect(() => {
    if (!user) return
    const stored = localStorage.getItem(lsKey(user.id))
    const onboarded = localStorage.getItem(lsOnboardedKey(user.id))

    setCategories(stored ? JSON.parse(stored) : [])
    setIsOnboarded(onboarded === 'true')
  }, [user])

  function persist(cats: UserCategory[]) {
    if (!user) return
    setCategories(cats)
    localStorage.setItem(lsKey(user.id), JSON.stringify(cats))
  }

  function finishOnboarding(selected: UserCategory[]) {
    if (!user) return
    persist(selected)
    setIsOnboarded(true)
    localStorage.setItem(lsOnboardedKey(user.id), 'true')
  }

  function addCategory(cat: Omit<UserCategory, 'id'>): UserCategory {
    const newCat: UserCategory = { ...cat, id: uuidv4() }
    persist([...categories, newCat])
    return newCat
  }

  function updateCategory(id: string, changes: Partial<Omit<UserCategory, 'id'>>) {
    persist(categories.map((c) => (c.id === id ? { ...c, ...changes } : c)))
  }

  function deleteCategory(id: string) {
    persist(categories.filter((c) => c.id !== id))
  }

  function getCategoryById(id: string) {
    return categories.find((c) => c.id === id)
  }

  return (
    <CategoryContext.Provider
      value={{ categories, isOnboarded, finishOnboarding, addCategory, updateCategory, deleteCategory, getCategoryById }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const ctx = useContext(CategoryContext)
  if (!ctx) throw new Error('useCategories deve ser usado dentro de CategoryProvider')
  return ctx
}

export { DEFAULT_CATEGORIES }
