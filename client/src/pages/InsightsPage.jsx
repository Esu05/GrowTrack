"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

// ─── Rule-based insight generator ────────────────────────
function generateInsights({ weekScores, weekMoods, waterAvg, waterGoal, todoCompletion, expenses, budget, streaks }) {
  const insights = []

  // Water insights
  if (waterAvg < waterGoal * 0.5) {
    insights.push({
      icon: "💧",
      title: "Low Hydration Alert",
      body: `You're averaging only ${waterAvg.toFixed(1)} glasses a day — less than half your goal of ${waterGoal}. Try keeping a bottle at your desk as a reminder.`,
      tag: "Water",
      tagColor: "bg-[#e6f1fb] text-[#185fa5]",
    })
  } else if (waterAvg >= waterGoal) {
    insights.push({
      icon: "💧",
      title: "Hydration Goal Crushed!",
      body: `You're hitting your water goal of ${waterGoal} glasses on average. Keep it up — hydration directly impacts your energy and focus.`,
      tag: "Water",
      tagColor: "bg-[#e6f1fb] text-[#185fa5]",
    })
  } else {
    insights.push({
      icon: "💧",
      title: "Almost There on Hydration",
      body: `You're averaging ${waterAvg.toFixed(1)} of ${waterGoal} glasses daily. Just a couple more glasses each day to hit your goal consistently.`,
      tag: "Water",
      tagColor: "bg-[#e6f1fb] text-[#185fa5]",
    })
  }

  // Todo insights
  if (todoCompletion >= 80) {
    insights.push({
      icon: "📋",
      title: "Task Completion on Fire",
      body: `You're completing ${todoCompletion.toFixed(0)}% of your tasks. That's an excellent completion rate — your productivity is in great shape.`,
      tag: "Tasks",
      tagColor: "bg-[#ede9f8] text-[#6c5cb8]",
    })
  } else if (todoCompletion >= 50) {
    insights.push({
      icon: "📋",
      title: "Task Completion Could Improve",
      body: `You're completing about ${todoCompletion.toFixed(0)}% of your tasks. Try breaking larger tasks into smaller steps to boost your completion rate.`,
      tag: "Tasks",
      tagColor: "bg-[#ede9f8] text-[#6c5cb8]",
    })
  } else {
    insights.push({
      icon: "📋",
      title: "Tasks Piling Up",
      body: `Only ${todoCompletion.toFixed(0)}% of tasks are getting done. Consider reducing your daily task count so each one gets proper attention.`,
      tag: "Tasks",
      tagColor: "bg-[#ede9f8] text-[#6c5cb8]",
    })
  }

  // Expense insights
  if (budget > 0) {
    const spendingPct = (expenses / budget) * 100
    if (spendingPct > 90) {
      insights.push({
        icon: "💰",
        title: "Budget Almost Exhausted",
        body: `You've used ${spendingPct.toFixed(0)}% of your monthly budget. Be cautious with remaining spending for the rest of the month.`,
        tag: "Expense",
        tagColor: "bg-[#eaf3de] text-[#3b6d11]",
      })
    } else if (spendingPct > 100) {
      insights.push({
        icon: "💰",
        title: "Over Budget This Month",
        body: `You've exceeded your monthly budget by ₹${(expenses - budget).toFixed(0)}. Consider reviewing your spending categories to find where to cut back.`,
        tag: "Expense",
        tagColor: "bg-[#eaf3de] text-[#3b6d11]",
      })
    } else {
      insights.push({
        icon: "💰",
        title: "Spending on Track",
        body: `You've used ${spendingPct.toFixed(0)}% of your ₹${budget} budget this month. You're on track to finish within budget — great discipline!`,
        tag: "Expense",
        tagColor: "bg-[#eaf3de] text-[#3b6d11]",
      })
    }
  }

  // Mood insights
  const moodCounts = weekMoods.reduce((acc, m) => { acc[m] = (acc[m] || 0) + 1; return acc }, {})
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  if (topMood) {
    const moodLabels = { happy: "😊 Happy", sad: "😢 Sad", neutral: "😐 Neutral", angry: "😠 Angry", anxious: "😰 Anxious", excited: "🤩 Excited", tired: "😴 Tired" }
    const label = moodLabels[topMood[0]] || topMood[0]
    if (["happy", "excited"].includes(topMood[0])) {
      insights.push({
        icon: "😊",
        title: "Great Mood Week",
        body: `Your most common mood this week was ${label}. High scores and positive moods tend to go hand in hand — keep building those daily habits.`,
        tag: "Mood",
        tagColor: "bg-[#fbeaf0] text-[#993556]",
      })
    } else if (["sad", "angry", "anxious"].includes(topMood[0])) {
      insights.push({
        icon: "😊",
        title: "Tough Week Emotionally",
        body: `You've been feeling ${label} most this week. Remember that small wins — drinking water, completing one task — can shift your mood over time.`,
        tag: "Mood",
        tagColor: "bg-[#fbeaf0] text-[#993556]",
      })
    } else {
      insights.push({
        icon: "😊",
        title: "Mood Check",
        body: `Your dominant mood this week was ${label}. Logging your mood consistently helps spot patterns over time.`,
        tag: "Mood",
        tagColor: "bg-[#fbeaf0] text-[#993556]",
      })
    }
  }

  // Score trend insight
  if (weekScores.length >= 3) {
    const recent = weekScores.slice(-3)
    const older = weekScores.slice(0, weekScores.length - 3)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg
    if (recentAvg > olderAvg + 5) {
      insights.push({
        icon: "📈",
        title: "Score Trending Up",
        body: `Your scores have improved significantly in the last 3 days. Whatever you're doing — keep it going!`,
        tag: "Score",
        tagColor: "bg-[#ede9f8] text-[#6c5cb8]",
      })
    } else if (recentAvg < olderAvg - 5) {
      insights.push({
        icon: "📉",
        title: "Score Dipping Recently",
        body: `Your scores have dropped compared to earlier this week. Check if any one habit — water, tasks, or mood — is pulling your score down.`,
        tag: "Score",
        tagColor: "bg-[#ede9f8] text-[#6c5cb8]",
      })
    }
  }

  return insights
}

const weekDayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const MOOD_EMOJI = {
  happy: "😊", sad: "😢", neutral: "😐",
  angry: "😠", anxious: "😰", excited: "🤩", tired: "😴"
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState([])
  const [weekScores, setWeekScores] = useState(Array(7).fill(0))
  const [weekMoods, setWeekMoods] = useState(Array(7).fill(null))
  const [streaks, setStreaks] = useState([])
  const [weekAvg, setWeekAvg] = useState(0)
  const [bestDay, setBestDay] = useState("")

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const now = new Date()
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(now.getDate() - (6 - i))
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      })

      const today = days[6]
      const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

      const [scoresRes, moodRes, waterRes, todosRes, expensesRes, budgetRes, streaksRes] = await Promise.all([
        supabase.from("daily_scores").select("date, total_score").eq("user_id", user.id).gte("date", days[0]),
        supabase.from("mood").select("date, mood").eq("user_id", user.id).gte("date", days[0]),
        supabase.from("hydration").select("glasses, goal").eq("user_id", user.id).eq("date", today).maybeSingle(),
        supabase.from("todos").select("is_completed").eq("user_id", user.id),
        supabase.from("expenses").select("amount").eq("user_id", user.id).gte("date", firstOfMonth),
        supabase.from("budgets").select("amount").eq("user_id", user.id).single(),
        supabase.from("streaks").select("*").eq("user_id", user.id),
      ])

      // Week scores
      const scoreMap = {}
      scoresRes.data?.forEach(r => { scoreMap[r.date] = r.total_score })
      const scores = days.map(d => scoreMap[d] || 0)
      setWeekScores(scores)

      // Week moods
      const moodMap = {}
      moodRes.data?.forEach(r => { moodMap[r.date] = r.mood })
      setWeekMoods(days.map(d => moodMap[d] || null))

      // Best day
      const maxScore = Math.max(...scores)
      const maxIdx = scores.indexOf(maxScore)
      setBestDay(maxScore > 0 ? weekDayLabels[maxIdx] : "")
      setWeekAvg(scores.filter(s => s > 0).length ? scores.reduce((a, b) => a + b, 0) / scores.filter(s => s > 0).length : 0)

      // Water avg this week
      const waterGoal = waterRes.data?.goal || 8
      const waterAvg = waterRes.data?.glasses || 0

      // Todo completion
      const todos = todosRes.data || []
      const todoCompletion = todos.length ? (todos.filter(t => t.is_completed).length / todos.length) * 100 : 0

      // Expenses this month
      const totalExpenses = (expensesRes.data || []).reduce((s, e) => s + Number(e.amount), 0)
      const budget = budgetRes.data?.amount || 0

      // Streaks
      const streakData = (streaksRes.data || []).map(s => ({
        name: s.tracker.charAt(0).toUpperCase() + s.tracker.slice(1),
        streak: s.current_streak,
        longest: s.longest_streak,
        emoji: { dashboard: "🌱", todo: "📋", water: "💧", mood: "😊", expense: "💰" }[s.tracker] || "⭐"
      }))
      setStreaks(streakData)

      // Generate insights
      const generated = generateInsights({
        weekScores: scores,
        weekMoods: days.map(d => moodMap[d] || null).filter(Boolean),
        waterAvg,
        waterGoal,
        todoCompletion,
        expenses: totalExpenses,
        budget,
        streaks: streakData,
      })
      setInsights(generated)
      setLoading(false)
    }

    fetchAll()
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="insights" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-semibold text-[#2c2440] mb-1 dark:text-white">
              ✨ Insights
            </h1>
            <p className="text-sm text-[#6b6080] mb-6 flex items-center gap-1.5 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-[#5daa88] animate-pulse inline-block" />
              Personalized insights from your daily patterns.
            </p>

            {loading ? (
              <div className="space-y-3 mb-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-[#ede9f8] dark:bg-[#1e1b2c] animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Insight Cards */}
                <div className="space-y-3 mb-6">
                  {insights.length === 0 ? (
                    <div className="bg-white dark:bg-[#1e1b2c] rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] p-6 text-center">
                      <p className="text-sm text-[#a09ab5]">Start logging your habits to see personalized insights!</p>
                    </div>
                  ) : insights.map((ins, i) => (
                    <div
                      key={i}
                      className="bg-linear-to-br from-[#ede9f8] to-[#f5f0ff] rounded-2xl border border-[#c8bfee] p-5 dark:from-[#1e1b2c] dark:to-[#2a2540] dark:border-[#3a3550]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{ins.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="text-sm font-semibold text-[#2c2440] dark:text-white">{ins.title}</p>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ins.tagColor}`}>
                              {ins.tag}
                            </span>
                          </div>
                          <p className="text-sm text-[#6b6080] leading-relaxed dark:text-white">{ins.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score vs Mood */}
                <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                  <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
                    📊 Score — This Week
                  </p>
                  <div className="space-y-2.5">
                    {weekDayLabels.map((d, i) => (
                      <div key={d} className="flex items-center gap-3">
                        <span className="text-lg w-6 text-center">
                          {weekMoods[i] ? MOOD_EMOJI[weekMoods[i]] || "😐" : "—"}
                        </span>
                        <span className="text-xs text-[#6b6080] w-8 dark:text-white">{d}</span>
                        <div className="flex-1 bg-[#ede9f8] dark:bg-[#2a2540] rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#6c5cb8] transition-all duration-700"
                            style={{ width: `${weekScores[i]}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#a09ab5] w-10 text-right dark:text-white">
                          {weekScores[i] > 0 ? `${weekScores[i]}%` : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Habit Streaks */}
                {streaks.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                    <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
                      🔥 Habit Streaks
                    </p>
                    <div className="space-y-4">
                      {streaks.map((h) => (
                        <div key={h.name} className="bg-[#ede9f8] rounded-lg p-3 dark:bg-[#2a2540]">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{h.emoji}</span>
                              <span className="text-sm text-[#2c2440] dark:text-white">{h.name}</span>
                            </div>
                            <span className="text-xs font-semibold text-[#6c5cb8] dark:text-[#b9a8ff]">
                              🔥 {h.streak} day streak
                            </span>
                          </div>
                          <div className="bg-white dark:bg-[#1e1b2c] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#9b8fd4] transition-all duration-500"
                              style={{ width: h.longest > 0 ? `${Math.round((h.streak / h.longest) * 100)}%` : "0%" }}
                            />
                          </div>
                          <p className="text-[10px] text-[#a09ab5] mt-1 dark:text-white">
                            Best: {h.longest} days
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weekly Summary */}
                <div className="bg-[#ede9f8] rounded-2xl p-5 dark:bg-[#1e1b2c]">
                  <p className="text-xs font-semibold text-[#6c5cb8] uppercase tracking-widest mb-2 dark:text-white">
                    🌱 This Week's Summary
                  </p>
                  <p className="text-sm text-[#2c2440] leading-relaxed dark:text-white">
                    {weekAvg > 0 ? (
                      <>
                        Your average daily score this week is{" "}
                        <strong className="font-semibold text-[#6c5cb8] dark:text-[#b9a8ff]">
                          {weekAvg.toFixed(0)}%
                        </strong>
                        {bestDay && <>. <strong className="text-[#6c5cb8] dark:text-[#b9a8ff]">{bestDay}</strong> was your best day</>}.
                        {weekAvg >= 70
                          ? " You're having a strong week — keep the momentum going! 🌟"
                          : weekAvg >= 40
                          ? " There's room to grow — focus on one habit at a time. 💪"
                          : " A tough week, but logging in is already the first step. Keep going! 🌱"}
                      </>
                    ) : (
                      "No score data yet this week. Start logging your habits to see your weekly summary!"
                    )}
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}