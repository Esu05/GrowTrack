"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import ScoreCard from "../components/dashboard/ScoreCard";
import { TasksMiniCard, WaterMiniCard, ExpenseMiniCard, MoodMiniCard } from "../components/dashboard/MiniCards";
import { WeeklyBarChart, ExpenseLineChart, ExpensePieChart } from "../components/dashboard/Charts";
import { supabase } from "../lib/supabase";
import { saveScore } from "../utils/saveScore"
import { handleStreak } from "../utils/streakUtils";

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [score, setScore] = useState(0)
  const [weeklyScores, setWeeklyScores] = useState(Array(7).fill(0))
  const [budget, setBudget] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingCount, setPendingCount] = useState(0)

 useEffect(() => {
  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUser(user)

    // ✅ Save score and handle streak together
    const result = await saveScore()
    if (result) {
      setScore(result.totalScore)
      await handleStreak("dashboard", result.totalScore)
    }

    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })

    const { data: scoresData } = await supabase
      .from("daily_scores")
      .select("date, total_score")
      .eq("user_id", user.id)
      .gte("date", days[0])

    const scores = days.map(day =>
      (scoresData || []).find(r => r.date === day)?.total_score || 0
    )
    setWeeklyScores(scores)

    const { data: budgetData } = await supabase
      .from("budgets")
      .select("amount")
      .eq("user_id", user.id)
      .single()
    if (budgetData) {
      setBudget(budgetData.amount)
      setRefreshKey(k => k + 1)
    }

    const { data: todos } = await supabase
      .from("todos")
      .select("is_completed")
      .eq("user_id", user.id)
      .eq("is_completed", false)
    setPendingCount(todos?.length || 0)
  }

  init()
}, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  // Get first name from email
  const firstName = user?.email?.split('@')[0] || "there"

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar pendingTasks={pendingCount} score={score}/>
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">

            {/* Greeting */}
            <div className="text-center mb-6">
              <h1 className="font-serif text-3xl font-semibold text-[#2c2440] dark:text-white">
                {greeting}, {firstName} 🌱
              </h1>
              <p className="text-sm text-[#6b6080] mt-1 dark:text-white">
                Stay consistent. Small steps daily.
              </p>
            </div>

            {/* Score Card */}
            <ScoreCard score={score} />

            {/* Mini Cards */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <TasksMiniCard />
              <WaterMiniCard />
              <ExpenseMiniCard />
              <MoodMiniCard />
            </div>

            {/* Weekly Score Chart */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
                📊 Weekly Score Trend
              </p>
              <WeeklyBarChart data={weeklyScores} todayIndex={6} />
            </div>

            {/* Expense Charts */}
            <ExpensePieChart refreshKey={refreshKey} budget={budget} />
            <ExpenseLineChart refreshKey={refreshKey} budget={budget} />

          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}