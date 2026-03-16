import { Router } from 'express'
import { requireAuth } from '../middlewares/auth'
import { getGoals, createGoal, updateGoal, deleteGoal, toggleEntry } from '../controllers/monthly.controller'

const router = Router()

router.use(requireAuth)

router.get('/monthly/goals', getGoals)
router.post('/monthly/goals', createGoal)
router.put('/monthly/goals/:id', updateGoal)
router.delete('/monthly/goals/:id', deleteGoal)
router.post('/monthly/goals/toggle-entry', toggleEntry)

export default router
