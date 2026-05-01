"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { supabase } from "../lib/supabase";

const moods = [
  { emoji: "😄", label: "Happy", color: "bg-[#faeeda] text-[#854f0b]" },
  { emoji: "😌", label: "Calm", color: "bg-[#eaf3de] text-[#3b6d11]" },
  { emoji: "😰", label: "Anxious", color: "bg-[#fce8e8] text-[#a32d2d]" },
  { emoji: "😢", label: "Sad", color: "bg-[#e6f1fb] text-[#185fa5]" },
  { emoji: "🤩", label: "Energetic", color: "bg-[#fbeaf0] text-[#993556]" },
  { emoji: "😴", label: "Tired", color: "bg-[#f1efe8] text-[#5f5e5a]" },
  { emoji: "😤", label: "Frustrated", color: "bg-[#fcebeb] text-[#a32d2d]" },
  { emoji: "🥰", label: "Grateful", color: "bg-[#fbeaf0] text-[#993556]" },
];

// Add this after the moods array
const moodScores = {
  Happy: 5, Energetic: 5, Grateful: 4, Calm: 4,
  Tired: 2, Anxious: 2, Sad: 1, Frustrated: 1
}

export default function MoodPage() {
  // Replace the 3 existing states with these
const [selected, setSelected] = useState("Happy")
const [note, setNote] = useState("")
const [saved, setSaved] = useState(false)
const [todayMood, setTodayMood] = useState([])
const [weekMoods, setWeekMoods] = useState([])
const [loading, setLoading] = useState(false)

const fetchTodayMood = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("mood")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .order("entry_time", { ascending: false })

  if (error) { console.log(error); return }

 if (data) {
  setTodayMood(data)
}
}

const fetchWeekMoods = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })

  const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

  const { data } = await supabase
    .from("mood")
    .select("date, mood_label, mood_emoji, score, entry_time") 
    .eq("user_id", user.id)
    .gte("date", days[0])

  const week = days.map(day => {
  const entriesForDay = (data || []).filter(r => r.date === day)
  const d = new Date(day)

  if (entriesForDay.length === 0) {
    return {
      day: dayLabels[d.getDay()],
      emoji: "—",
      label: "None",
      logged: false
    }
  }

  /// Count frequency of each mood
const frequencyMap = {}
entriesForDay.forEach(e => {
  frequencyMap[e.mood_label] = (frequencyMap[e.mood_label] || 0) + 1
})

// Sort by frequency, tie-break by latest entry_time
const topLabel = Object.entries(frequencyMap)
  .sort((a, b) => {
    // First sort by frequency descending
    if (b[1] !== a[1]) return b[1] - a[1]
    
    // If tie, find latest entry_time for each mood
    const latestA = entriesForDay
      .filter(e => e.mood_label === a[0])
      .sort((x, y) => new Date(y.entry_time) - new Date(x.entry_time))[0].entry_time
    
    const latestB = entriesForDay
      .filter(e => e.mood_label === b[0])
      .sort((x, y) => new Date(y.entry_time) - new Date(x.entry_time))[0].entry_time

    return new Date(latestB) - new Date(latestA) // latest wins
  })[0][0]

const topEntry = entriesForDay.find(e => e.mood_label === topLabel)

  return {
    day: dayLabels[d.getDay()],
    emoji: topEntry.mood_emoji,
    label: topLabel,
    logged: true
  }
})

  setWeekMoods(week)
}

useEffect(() => {
  fetchTodayMood()
  fetchWeekMoods()
}, [])

  const save = async () => {
  setLoading(true)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { setLoading(false); return }

  const today = new Date().toISOString().split("T")[0]
  const selectedMood = moods.find(m => m.label === selected)

  const { error } = await supabase
    .from("mood")
    .insert({
      user_id: user.id,
      mood_label: selected,
      mood_emoji: selectedMood.emoji,
      score: moodScores[selected],
      note: note.trim() || null,
      date: today,
      entry_time: new Date().toISOString(),
      
    })

  if (error) { console.log(error); setLoading(false); return }

  setSaved(true)
  setNote("")
  fetchTodayMood()
  fetchWeekMoods()
  
  setTimeout(() => {
  setSaved(false)
}, 2000)

  setLoading(false)
}

const deleteMood = async (id) => {
  const { error } = await supabase
    .from("mood")
    .delete()
    .eq("id", id)

  if (error) {
    console.log(error)
    return
  }

  fetchTodayMood()
  fetchWeekMoods()
}

const loggedMoods = weekMoods.filter(m => m.logged)

const moodCounts = {}

loggedMoods.forEach((m) => {
  moodCounts[m.label] = (moodCounts[m.label] || 0) + 1
})

const topMoodLabel =
  Object.keys(moodCounts).length > 0
    ? Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null

const topMoodEmoji =
  moods.find((m) => m.label === topMoodLabel)?.emoji || ""

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="mood" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-semibold text-[#2c2440] mb-1 dark:text-white flex justify-center">
              Mood Tracker 😊
            </h1>
            <p className="text-sm text-[#6b6080] mb-6 dark:text-white flex justify-center">
              Log how you feel each day. Patterns reveal what supports your wellbeing.
            </p>

            {/* Mood Picker */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] p-6 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
                How are you feeling right now?
              </p>
              <div className="grid grid-cols-4 gap-3 mb-5">
                {moods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setSelected(m.label)}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 transition-all hover:scale-105
                      ${selected === m.label
                        ? "border-[#6c5cb8] bg-[#ede9f8] dark:text-white"
                        : "border-[#ece8f8] bg-white hover:border-[#c8bfee] dark:bg-[#1e1b2c] dark:border-[#2a2540] dark:hover:border-[#5a5a5a] dark:text-white"
                      }`}
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs text-[#6b6080] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>

              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4
                  ${moods.find((m) => m.label === selected)?.color}`}
              >
                {moods.find((m) => m.label === selected)?.emoji} {selected}
              </div>

              {/* Note */}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about your mood (optional)..."
                rows={3}
                className="w-full border border-[#c8bfee] rounded-xl px-4 py-3 text-sm text-[#2c2440] bg-[#fdf6ee] outline-none focus:border-[#6c5cb8] focus:bg-white transition-all resize-none dark:bg-[#1e1b2c] dark:border-[#2a2540] dark:text-white dark:focus:bg-[#1a1a1a]"
              />
              <button
  onClick={save}
  disabled={loading}
  className={`mt-3 px-6 py-2 rounded-lg text-sm font-medium transition-all
    ${saved
      ? "bg-[#5daa88] text-white"
      : "bg-[#6c5cb8] text-white hover:bg-[#534ab7]"
    }`}
>
  {loading ? "Saving..." : saved ? "✓ Logged!" : "Log Mood"}
</button>
            </div>

           {todayMood.length > 0 && (
  <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
    <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
      🕒 Today's Mood Timeline
    </p>
    <div className="space-y-3">
      {todayMood.map((mood) => (
        <div
          key={mood.id}
          className="flex justify-between items-start border-b border-[#ece8f8] pb-3 dark:border-[#2a2540]"
        >
          <div>
            <p className="text-sm font-medium text-[#2c2440] dark:text-white">
              {mood.mood_emoji} {mood.mood_label}
            </p>
            {mood.note && (
              <p className="text-xs text-[#6b6080] mt-1 dark:text-white">
                {mood.note}
              </p>
            )}
            <span className="text-xs text-[#a09ab5] block mt-1">
             {(() => {
  const d = new Date(mood.entry_time)
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${ampm}`
})()}
            </span>
          </div>
          <button
            onClick={() => {
                deleteMood(mood.id)
            }}
            className="text-xs text-red-500 hover:text-red-700 transition"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}
            {/* Weekly Mood */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
                📅 Mood This Week
              </p>
              <div className="flex justify-between">
  {weekMoods.map((m, i) => (
  <div key={i} className="flex flex-col items-center gap-2">
    <span className={`text-2xl ${!m.logged ? "opacity-30" : ""}`}>
      {m.emoji}
    </span>
    <span className="text-[10px] text-[#a09ab5] font-medium dark:text-white">{m.day}</span>
    <span className="text-[9px] text-[#c8bfee] dark:text-white">
      {m.logged ? m.label : "—"}
    </span>
  </div>
))}
</div>
            </div>

            {/* Insight */}
            <div className="bg-[#ede9f8] rounded-2xl p-5 dark:bg-[#1e1b2c]">
  <p className="text-xs font-semibold text-[#6c5cb8] uppercase tracking-widest mb-3 dark:text-white">
    ✨ Mood Insight
  </p>
  <p className="text-sm text-[#2c2440] leading-relaxed dark:text-white">
  {loggedMoods.length === 0 ? (
    "No moods logged this week yet. Start by logging today's mood! 🌱"
  ) : (
    <>
      You've logged your mood{" "}
      <strong>{loggedMoods.length}</strong> out of 7 days this week.
      Most frequent mood: <strong>{topMoodLabel}</strong> {topMoodEmoji}
    </>
  )}
</p>
</div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
