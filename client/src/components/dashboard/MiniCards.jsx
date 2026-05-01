"use client";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

// ─── Tasks Mini Card ─────────────────────────────────────
export function TasksMiniCard() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3)
      setTasks(data || [])
    }
    fetch()
  }, [])

  const done = tasks.filter(t => t.is_completed).length

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ece8f8] dark:bg-[#1e1b2c] dark:border-[#2a2540]">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
        📋 Tasks
      </p>
      {tasks.length === 0 && (
        <p className="text-xs text-[#a09ab5] mb-3">No tasks yet!</p>
      )}
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2.5 py-1.5">
          <div className={`w-4 h-4 rounded-sm border-2 shrink-0 flex items-center justify-center
            ${task.is_completed ? "bg-[#6c5cb8] border-[#6c5cb8]" : "border-[#c8bfee]"}`}>
            {task.is_completed && <span className="text-white text-[9px] font-bold">✓</span>}
          </div>
          <span className={`text-sm ${task.is_completed ? "line-through text-[#a09ab5]" : "text-[#2c2440] dark:text-white"}`}>
            {task.title}
          </span>
        </div>
      ))}
      <p className="text-[11px] text-[#a09ab5] mt-2">{done}/{tasks.length} completed</p>
      <Link to="/todo">
        <p className="text-xs text-[#6c5cb8] mt-2 hover:opacity-70 transition-opacity">
          + View all tasks
        </p>
      </Link>
    </div>
  )
}

// ─── Water Mini Card ─────────────────────────────────────
export function WaterMiniCard() {
  const [water, setWater] = useState(0)
  const [goal, setGoal] = useState(8)

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from("hydration")
        .select("glasses, goal")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle()
      if (data) {
        setWater(data.glasses)
        setGoal(data.goal)
      }
    }
    fetch()
  }, [])

  const pct = Math.round((water / goal) * 100)

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ece8f8] dark:bg-[#1e1b2c] dark:border-[#2a2540]">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
        💧 Water
      </p>
      <p className="font-serif text-2xl font-semibold text-[#2c2440] mb-2 dark:text-white">
        {water}{" "}
        <span className="text-sm font-normal text-[#6b6080] dark:text-white">/ {goal} glasses</span>
      </p>
      <div className="bg-[#ede9f8] rounded-full h-1.5 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-[#6899d4] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: goal }, (_, i) => (
          <div key={i} className={`w-5 h-5 rounded-full border-2
            ${i < water ? "bg-[#6899d4] border-[#6899d4]" : "border-[#c8bfee]"}`}
          />
        ))}
      </div>
      <Link to="/water">
        <p className="text-xs text-[#6c5cb8] mt-3 hover:opacity-70 transition-opacity">
          + Log water
        </p>
      </Link>
    </div>
  )
}

// ─── Expense Mini Card ───────────────────────────────────
export function ExpenseMiniCard() {
  const [spent, setSpent] = useState(0)
  const [budget, setBudget] = useState(0)
  const [topCats, setTopCats] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get budget
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("amount")
        .eq("user_id", user.id)
        .single()
      if (budgetData) setBudget(budgetData.amount)

      // Get this month's expenses
      const now = new Date()
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, category")
        .eq("user_id", user.id)
        .gte("date", from)

      if (expenses) {
        const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
        setSpent(total)

        // Top 2 categories
        const cats = {}
        expenses.forEach(e => {
          cats[e.category] = (cats[e.category] || 0) + Number(e.amount)
        })
        const sorted = Object.entries(cats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
        setTopCats(sorted)
      }
    }
    fetch()
  }, [])

  const saved = budget - spent

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ece8f8] dark:bg-[#1e1b2c] dark:border-[#2a2540]">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
        💰 Expense
      </p>
      <p className={`font-serif text-2xl font-semibold ${saved >= 0 ? "text-[#5daa88]" : "text-[#d05050]"}`}>
        ₹{Math.abs(saved)} {saved >= 0 ? "saved" : "over"}
      </p>
      <p className="text-xs text-[#6b6080] mt-1 mb-3 dark:text-white">
        Spent ₹{spent} · Budget ₹{budget}
      </p>
      <div className="space-y-1">
        {topCats.map(([cat, amt]) => (
          <div key={cat} className="flex justify-between text-xs text-[#6b6080] dark:text-white">
            <span>{cat}</span><span>₹{amt}</span>
          </div>
        ))}
      </div>
      <Link to="/expense">
        <p className="text-xs text-[#6c5cb8] mt-3 hover:opacity-70 transition-opacity">
          + View expenses
        </p>
      </Link>
    </div>
  )
}

// ─── Mood Mini Card ──────────────────────────────────────
export function MoodMiniCard() {
  const [todayMood, setTodayMood] = useState(null)
  const [weekMoods, setWeekMoods] = useState([])

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date().toISOString().split('T')[0]

      // Get today's latest mood
      const { data: todayData } = await supabase
        .from("mood")
        .select("mood_emoji, mood_label")
        .eq("user_id", user.id)
        .eq("date", today)
        .order("entry_time", { ascending: false })
        .limit(1)

      if (todayData && todayData.length > 0) {
        setTodayMood(todayData[0])
      }

      // Get last 7 days moods
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })

      const { data: weekData } = await supabase
        .from("mood")
        .select("date, mood_emoji, mood_label, score, entry_time")
        .eq("user_id", user.id)
        .gte("date", days[0])

      const week = days.map(day => {
        const entriesForDay = (weekData || []).filter(r => r.date === day)
        if (entriesForDay.length === 0) return { emoji: "—", logged: false }
        const freqMap = {}
        entriesForDay.forEach(e => {
          freqMap[e.mood_label] = (freqMap[e.mood_label] || 0) + 1
        })
        const topLabel = Object.entries(freqMap)
          .sort((a, b) => b[1] - a[1])[0][0]
        const topEntry = entriesForDay.find(e => e.mood_label === topLabel)
        return { emoji: topEntry.mood_emoji, logged: true }
      })

      setWeekMoods(week)
    }
    fetch()
  }, [])

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ece8f8] dark:bg-[#1e1b2c] dark:border-[#2a2540]">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
        😊 Mood
      </p>
      <p className="font-serif text-2xl text-[#2c2440] mb-3 dark:text-white">
        {todayMood ? `${todayMood.mood_emoji} ${todayMood.mood_label}` : "Not logged yet"}
      </p>
      <div className="flex gap-2">
        {weekMoods.map((m, i) => (
          <span key={i} className={`text-lg ${!m.logged ? "opacity-20" : ""}`}>
            {m.emoji}
          </span>
        ))}
      </div>
      <Link to="/mood">
        <p className="text-xs text-[#6c5cb8] mt-3 hover:opacity-70 transition-opacity">
          + Log mood
        </p>
      </Link>
    </div>
  )
}