import { supabase } from "../lib/supabase"

const STREAK_THRESHOLD = 70

const getToday = () => new Date().toISOString().split("T")[0]

const getYesterday = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split("T")[0]
}

export const handleStreak = async (tracker, score) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getToday()
  const yesterday = getYesterday()

  const { data: streak, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)
    .eq("tracker", tracker)
    .maybeSingle()

  if (error) {
    console.error("Error fetching streak:", error)
    return
  }

  // First time user
  if (!streak) {
    if (score >= STREAK_THRESHOLD) {
      await supabase.from("streaks").insert({
        user_id: user.id,
        tracker,
        current_streak: 1,
        longest_streak: 1,
        last_logged: today,  // ← fixed: removed duplicate/broken last_logged: s.last_logged
      })
    }
    return
  }

  if (streak.last_logged === today) return

  if (streak.last_logged !== yesterday) {
    await supabase
      .from("streaks")
      .update({ current_streak: 0 })
      .eq("user_id", user.id)
      .eq("tracker", tracker)
  }

  if (score >= STREAK_THRESHOLD) {
    const newStreak = streak.last_logged === yesterday
      ? streak.current_streak + 1
      : 1

    const newLongest = Math.max(newStreak, streak.longest_streak)

    await supabase
      .from("streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_logged: today,
      })
      .eq("user_id", user.id)
      .eq("tracker", tracker)
  }
}

export const getStreaks = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data, error } = await supabase
    .from("streaks")
    .select("*")
    .eq("user_id", user.id)

  if (error) {
    console.error("Error fetching streaks:", error)
    return {}
  }

  const result = {}

  data?.forEach((s) => {
    result[s.tracker] = {
      current: s.current_streak,
      longest: s.longest_streak,
      last_logged: s.last_logged, // ← added so Sidebar can compare dates
    }
  })

  return result
}