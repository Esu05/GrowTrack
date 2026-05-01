"use client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { WeeklyBarChart } from "../components/dashboard/Charts";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { calculateTodoScore, getScoreLabel } from "../utils/utils";
import { saveScore } from "../utils/saveScore";


const priorityColors = {
  high: "bg-[#fce8e8] text-[#a32d2d] dark:text-red-300 dark:bg-red-900/30",
  medium: "bg-[#faeeda] text-[#854f0b] dark:bg-yellow-900/30 dark:text-yellow-300",
  low: "bg-[#eaf3de] text-[#3b6d11] dark:bg-green-900/30 dark:text-green-300",
};

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().split('T')[0]
}

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [completionData, setCompletionData] = useState(Array(7).fill(0))
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const fetchWeeklyData = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Get last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return getLocalDateString(d)
  })

  const { data, error } = await supabase
    .from("daily_scores")
    .select("date, todo_score")
    .eq("user_id", user.id)
    .gte("date", days[0])

     if (error) {
    console.log(error.message)
    return
  }

    const map = {}
  data?.forEach(d => {
    map[d.date] = d.todo_score
  })

  const final = Array(7).fill(0)
  days.forEach(day => {
    const weekdayIndex = (new Date(day).getDay() + 6) % 7  // Mon=0, Sun=6
    final[weekdayIndex] = map[day] || 0
  })

  setCompletionData(final)
}

 const fetchTodos = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)  // explicit filter, safer
    .order("created_at", { ascending: false })

  if (error){
     console.log(error.message)
     return
  } 
    setTasks(data || [])

    await saveScore()
}

useEffect(() => {
  fetchTodos()
  fetchWeeklyData()
}, [])


 const toggle = async (task) => {
  const { error } = await supabase
    .from("todos")
    .update({ 
      is_completed: !task.is_completed,
      updated_at: new Date().toISOString() // add this
    })
    .eq("id", task.id)
    .eq("user_id", task.user_id)
  if (!error) {
    await fetchTodos()
    await fetchWeeklyData() 
    
  }
}

const remove = async (id) => {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", id)
    .eq("user_id", (await supabase.auth.getUser()).data.user.id) // add this
  if (!error){
     await fetchTodos()
     await fetchWeeklyData()
     
  }
}

 const add = async () => {
  if (!input.trim()) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
  alert("Please login first");
  return;
}

  const { error } = await supabase.from("todos").insert([
    {
      user_id: user.id,
      title: input.trim(),
      priority: priority,
    },
  ]);

  if (!error) {
    setInput("");
    await fetchTodos();
    await fetchWeeklyData()
   
  }
};

  const filtered = tasks.filter((t) => {
  if (filter === "done") return t.is_completed;
  if (filter === "pending") return !t.is_completed;
  return true;
});

  const doneCount = tasks.filter((t) => t.is_completed).length;
  const pendingCount = tasks.length - doneCount;

  const todoScore = calculateTodoScore(doneCount, tasks.length)
  const scoreLabel = getScoreLabel(todoScore)


  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="todo" pendingTasks={pendingCount} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-semibold text-[#2c2440] mb-1 flex justify-center dark:text-white">
              To-Do List 📋
            </h1>
            <p className="text-sm text-[#6b6080] mb-6 flex justify-center dark:text-white">
              Stay on top of your day. Completed tasks boost your daily score.✨
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: "Total", val: tasks.length, color: "text-[#2c2440]  dark:text-white" },
                { label: "Done", val: doneCount, color: "text-[#5daa88] dark:text-green-300" },
                { label: "Pending", val: pendingCount, color: "text-[#d97a9e] dark:text-pink-300" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-4 border border-[#ece8f8] text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]"
                >
                  <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1">
                    {s.label}
                  </p>
                  <p className={`font-serif text-3xl font-semibold ${s.color}`}>
                    {s.val}
                  </p>
                </div>
              ))}
              <div className="bg-white rounded-xl p-4 border border-[#ece8f8] text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1">Score</p>
              <p className={`font-serif text-3xl font-semibold ${scoreLabel.color}`}>
                  {todoScore}
              </p>
              <p className={`text-[10px] ${scoreLabel.color}`}>{scoreLabel.label}</p>
            </div>
          </div>
  

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
              {["all", "pending", "done"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all
                    ${filter === f
                      ? "bg-[#6c5cb8] text-white dark:text-white"
                      : "bg-white dark:bg-[#1e1b2c] text-[#6b6080] border border-[#ece8f8] hover:bg-[#ede9f8] dark:text-white dark:border-[#2a2540] dark:hover:bg-[#2a2540]"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Task List */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] mb-5 overflow-hidden dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              {filtered.length === 0 && (
                <p className="text-center text-[#a09ab5] text-sm py-8 dark:text-white">
                  No tasks here yet! 🌱
                </p>
              )}
              {filtered.map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-5 py-3.5 transition-all hover:bg-[#fffbf6] cursor-pointer dark:hover:bg-[#2a2540]
                    ${i !== 0 ? "border-t border-[#ece8f8]" : ""}`}
                  onClick={() => toggle(task)}
                >
                  <div
                    className={`w-5 h-5 rounded-[5px] border-2 shrink-0 flex items-center justify-center transition-all
                      ${task.is_completed ? "bg-[#6c5cb8] border-[#6c5cb8]" : "border-[#c8bfee]"}`}
                  >
                    {task.is_completed && (
                      <span className="text-white text-[10px] font-bold">✓</span>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-sm transition-all ${
                      task.is_completed ? "line-through text-[#a09ab5]" : "text-[#2c2440] dark:text-white"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize
                      ${priorityColors[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(task.id); }}
                    className="text-[#a09ab5] text-xs hover:text-[#d05050] transition-colors ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Task */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-3 dark:text-white">
                Add New Task
              </p>
              <div className="flex gap-2 flex-wrap">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="What do you need to do?"
                  className="flex-1 min-w-50 border border-[#c8bfee] rounded-lg px-3 py-2 text-sm text-[#2c2440] bg-[#fffbf6] outline-none focus:border-[#6c5cb8] focus:bg-white transition-all dark:border-[#2a2540] dark:text-white dark:bg-[#2a2540] dark:focus:bg-[#1e1b2c]"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="border border-[#c8bfee] rounded-lg px-3 py-2 text-sm text-[#6b6080] bg-[#fffbf6] dark:bg-[#2a2540] dark:text-white outline-none dark:border-[#2a2540]"
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
                <button
                  onClick={add}
                  className="bg-[#6c5cb8] text-white text-sm px-5 py-2 rounded-lg hover:bg-[#534ab7] transition-colors"
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Chart */}
            <WeeklyBarChart data={completionData} todayIndex={todayIndex} />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
