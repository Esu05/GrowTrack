import { supabase } from '../lib/supabase'
import { calculateTodoScore, calculateWaterScore, calculateDailyScore } from '../utils/utils'

export const saveScore = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split('T')[0]

  const [todosRes, hydrationRes] = await Promise.all([
    supabase.from('todos').select('is_completed').eq('user_id', user.id),
    supabase.from('hydration').select('glasses, goal')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()
  ])

  const todos = todosRes.data || []
  const todoScore = calculateTodoScore(
    todos.filter(t => t.is_completed).length,
    todos.length
  )

  const hydration = hydrationRes.data
  const waterScore = calculateWaterScore(
    hydration?.glasses || 0,
    hydration?.goal || 8
  )

  const totalScore = calculateDailyScore(todoScore, waterScore)

  const { error } = await supabase
    .from('daily_scores')
    .upsert({
      user_id: user.id,
      date: today,
      todo_score: todoScore,        // individual out of 100
      hydration_score: waterScore,  // individual out of 100
      total_score: totalScore,      // average out of 100
    }, { onConflict: 'user_id,date' })

  if (error) console.log('Score error:', error)

  return { todoScore, waterScore, totalScore }
}