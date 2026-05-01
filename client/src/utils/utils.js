// Todo: out of 100
export const calculateTodoScore = (completed, total) => {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

// Hydration: out of 100
export const calculateWaterScore = (current, goal) => {
  if (goal === 0) return 0
  return Math.round(Math.min(current / goal, 1) * 100)
}

// Dashboard: average of both
export const calculateDailyScore = (todoScore, waterScore) => {
  return Math.round((todoScore + waterScore) / 2)
}

// Score label for UI - used on all pages
export const getScoreLabel = (score) => {
  if (score >= 80) return { label: "Excellent 🌟", color: "text-[#5daa88]" }
  if (score >= 60) return { label: "Good 👍", color: "text-[#6c5cb8]" }
  if (score >= 40) return { label: "Fair 😐", color: "text-[#f59e0b]" }
  return { label: "Needs Work 💪", color: "text-[#d05050]" }
}