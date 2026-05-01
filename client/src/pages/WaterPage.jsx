import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { WeeklyBarChart } from "../components/dashboard/Charts";
import { supabase } from "../lib/supabase";
import { calculateWaterScore, getScoreLabel } from "../utils/utils";
import { saveScore } from "../utils/saveScore";


const tips = [
  "Drink a glass of water right after waking up 🌅",
  "Keep a bottle on your desk as a visual reminder 💻",
  "Drink a glass before every meal 🍽",
  "Set phone reminders every 2 hours ⏰",
];

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

export default function WaterPage() {
  const [water, setWater] = useState(0);
  const [goal, setGoal] = useState(8)
  const [goalInput, setGoalInput] = useState("")
  const [editingGoal, setEditingGoal] = useState(false)
  const [weeklyWater, setWeeklyWater] = useState(Array(7).fill(0))
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const pct = Math.round((water / goal) * 100);
  const waterScore = calculateWaterScore(water, goal) 
  const scoreLabel = getScoreLabel(waterScore) 


 const fetchWater = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getLocalDateString()

  // ✅ get goal from user_settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("hydration_goal")
    .eq("user_id", user.id)
    .single()

  const preferredGoal = settings?.hydration_goal || 8

  // ✅ get today's hydration row
  const { data, error } = await supabase
    .from("hydration")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle()

  if (error) {
    console.log(error)
    return
  }

  if (data) {
    setWater(data.glasses)
    setGoal(data.goal)
  } else {
    await supabase.from("hydration").insert({
      user_id: user.id,
      glasses: 0,
      goal: preferredGoal,
      date: today,
    })

    setWater(0)
    setGoal(preferredGoal)
  }
}

const fetchWeeklyWater = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return getLocalDateString(d)
  })

  const { data, error } = await supabase
  .from("daily_scores")
  .select("date, hydration_score")
  .eq("user_id", user.id)
  .gte("date", days[0])

if (error) { console.log(error.message); return }

const final = Array(7).fill(0)
days.forEach(day => {
  const weekdayIndex = (new Date(day).getDay() + 6) % 7
  const row = (data || []).find(r => r.date === day)
  final[weekdayIndex] = row?.hydration_score || 0
})
setWeeklyWater(final)
}

useEffect(() => {
  fetchWater();
  fetchWeeklyWater();
}, []);

const saveGoal = async () => {
  const newGoal = parseInt(goalInput)
  if (!newGoal || newGoal <= 0) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getLocalDateString()

  // Save to user_settings so it carries forward
  await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      hydration_goal: newGoal,
      updated_at: getLocalDateString()
    }, { onConflict: "user_id" })

  // Also update today's row
  await supabase
    .from("hydration")
    .upsert({
      user_id: user.id,
      glasses: water,
      goal: newGoal,
      date: today,
    }, { onConflict: "user_id,date" })

  setGoal(newGoal)
  setGoalInput("")
  setEditingGoal(false)
  await saveScore()
}

// Add this function after saveGoal
const updateWater = async (newValue) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getLocalDateString()

  const { error } = await supabase
    .from("hydration")
    .upsert({
      user_id: user.id,
      glasses: newValue,
      goal: goal,
      date: today,
    }, { onConflict: "user_id,date" })

  if (error) { console.log(error); return }

  setWater(newValue)
  await saveScore()
  await fetchWeeklyWater()
}



const change = (d) => {
  const newValue = Math.max(0, Math.min(goal, water + d));
  updateWater(newValue);
};        

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="water" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-semibold text-[#2c2440] mb-1 dark:text-white flex justify-center">
               Hydration Tracker 💧
            </h1>
            <div className="mb-6 text-center">
  <p className="text-sm text-[#6b6080] dark:text-white flex justify-center items-center gap-2 flex-wrap">
    Goal:

    {editingGoal ? (
      <span className="flex items-center gap-2">
        <input
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveGoal()}
          type="number"
          min="1"
          className="w-16 border border-[#c8bfee] rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-[#6899d4] dark:bg-[#2a2540] dark:text-white"
          autoFocus
        />

        <button
          onClick={saveGoal}
          className="text-[#6899d4] font-semibold text-sm hover:scale-110 transition"
        >
          ✓
        </button>

        <button
          onClick={() => {
            setEditingGoal(false);
            setGoalInput("");
          }}
          className="text-[#a09ab5] text-sm hover:text-red-500 transition"
        >
          ✕
        </button>
      </span>
    ) : (
      <span
        onClick={() => {
          setGoalInput(goal.toString());
          setEditingGoal(true);
        }}
        className="cursor-pointer text-[#6899d4] font-semibold hover:underline"
      >
        {goal} glasses/day
      </span>
    )}
  </p>

  <p className="text-sm text-[#6b6080] mt-2 dark:text-white">
    Proper hydration improves focus and energy 💙
  </p>
</div>

{/* Score Card */}
<div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
  <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1 dark:text-white">
    Today's Hydration Score
  </p>
  <p className={`font-serif text-5xl font-semibold ${scoreLabel.color}`}>
    {waterScore}
  </p>
  <p className={`text-xs mt-1 ${scoreLabel.color}`}>
    {scoreLabel.label}
  </p>
  <p className="text-[11px] text-[#a09ab5] mt-2">out of 100</p>
</div>

            {/* Main counter */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] p-8 mb-5 text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <p className="font-serif text-6xl font-semibold text-[#2c2440] mb-1 dark:text-white">
                {water}
                <span className="text-2xl font-normal text-[#6b6080] dark:text-white"> / {goal}</span>
              </p>
              <p className="text-sm text-[#6b6080] mb-5 dark:text-white">glasses today</p>

              {/* Progress bar */}
              <div className="bg-[#ede9f8] rounded-full h-3 overflow-hidden mb-5 mx-4">
                <div
                  className="h-full rounded-full bg-[#6899d4] transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Dot grid */}
              <div className="flex gap-3 justify-center flex-wrap mb-6">
                {Array.from({ length: goal }, (_, i) => (
                  <div
                    key={i}
                    onClick={() => updateWater(i + 1)}
                    className={`w-9 h-9 rounded-full border-2 cursor-pointer transition-all hover:scale-110 flex items-center justify-center text-lg
                      ${i < water
                        ? "bg-[#6899d4] border-[#6899d4] shadow-sm"
                        : "border-[#c8bfee] bg-transparent"
                      }`}
                  >
                    {i < water && <span className="text-white text-xs">💧</span>}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => change(-1)}
                  className="w-12 h-12 rounded-full border-2 border-[#c8bfee] text-[#6b6080] text-xl hover:bg-[#ede9f8] transition-all"
                >
                  −
                </button>
                <button
                  onClick={() => change(1)}
                  className="w-12 h-12 rounded-full bg-[#6899d4] text-white text-xl hover:opacity-90 transition-all shadow-sm"
                >
                  +
                </button>
              </div>

              {water >= goal && (
                <p className="text-[#5daa88] font-medium text-sm mt-4">
                  🎉 Goal reached! Amazing work today!
                </p>
              )}
              {water < goal && (
                <p className="text-[#6b6080] text-sm mt-4 dark:text-white">
                  {goal - water} more glass{goal - water !== 1 ? "es" : ""} to hit your goal!
                </p>
              )}
            </div>

            {/* Weekly chart */}
            <WeeklyBarChart data={weeklyWater} todayIndex={todayIndex} />

            {/* Tips */}
            <div className="bg-[#ede9f8] rounded-2xl p-5 dark:bg-[#1e1b2c] mt-5">
              <p className="text-xs font-semibold text-[#6c5cb8] uppercase tracking-widest mb-3 dark:text-white">
                💡 Hydration Tips
              </p>
              <div className="space-y-2.5">
                {tips.map((t, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-[#2c2440] dark:text-white">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6c5cb8] mt-1.5 shrink-0 dark:bg-[#1e1b2c]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
