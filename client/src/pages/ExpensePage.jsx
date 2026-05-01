"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { ExpenseLineChart, ExpensePieChart } from "../components/dashboard/Charts";
import { supabase } from "../lib/supabase";


const catOptions = ["☕ Food", "🚌 Travel", "🛍 Shopping", "🎬 Entertainment", "💊 Health", "📚 Education", "💡 Utilities", "💸 Other"];


export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [name, setName] = useState("");
  const [amt, setAmt] = useState("");
  const [cat, setCat] = useState("☕ Food");
  const [budget, setBudget] = useState(0)
  const [budgetInput, setBudgetInput] = useState("")
  const [editingBudget, setEditingBudget] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [budgetLoaded, setBudgetLoaded] = useState(false)
  const [lastMonthData, setLastMonthData] = useState(null)
  const [showLastMonth, setShowLastMonth] = useState(false)

const fetchBudget = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from("budgets")
    .select("amount")
    .eq("user_id", user.id)
    .single()

  if (data) {
    setBudget(data.amount)
    setBudgetLoaded(true)
    setRefreshKey(k => k + 1)
  } else {
    // No budget set yet, create default
    await supabase.from("budgets").insert([{
      user_id: user.id,
      amount: 650
    }])
    setBudget(650)
    setBudgetLoaded(true)
    setRefreshKey(k => k + 1)
  }
}

const saveBudget = async () => {
  const newBudget = parseInt(budgetInput)
  if (!newBudget || newBudget <= 0) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("budgets")
    .upsert({
      user_id: user.id,
      amount: newBudget,
      updated_at: new Date().toISOString()
    }, { onConflict: "user_id" })

  if (!error) {
    setBudget(newBudget)
    setBudgetInput("")
    setEditingBudget(false)
    setRefreshKey(k => k + 1)
  }
}

 const fetchExpenses = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", firstDay) // ← only this month
    .order("created_at", { ascending: false })

  if (error) { console.log(error); return }
  setExpenses(data || [])
}

  const totalSpent = expenses.reduce(
  (s, e) => s + Number(e.amount),
  0
);
  const saved = budget - totalSpent;

 const add = async () => {
  const a = parseInt(amt);

  if (!name.trim() || !a) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
  console.log("User not found");
  return;
}

  const { error } = await supabase.from("expenses").insert([
    {
      user_id: user.id,
      amount: a,
      category: cat,
      note: name.trim(),
      date: new Date().toISOString().split('T')[0],
    },
  ]);

  if (error) {
    console.log(error);
    return;
  }

  setName("");
  setAmt("");

  fetchExpenses();
  setRefreshKey(k => k + 1)
};

  const remove = async (id) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)  // add this

  if (error) {
    console.log(error)
    return
  }
  fetchExpenses()
  setRefreshKey(k => k + 1)
}

  const fetchLastMonthSummary = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()
  
  // ✅ use local date formatting instead of toISOString()
  const pad = (n) => String(n).padStart(2, '0')
  
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const from = `${firstDayLastMonth.getFullYear()}-${pad(firstDayLastMonth.getMonth() + 1)}-${pad(firstDayLastMonth.getDate())}`
  const to = `${lastDayLastMonth.getFullYear()}-${pad(lastDayLastMonth.getMonth() + 1)}-${pad(lastDayLastMonth.getDate())}`

  console.log("from:", from, "to:", to) // should be 2026-04-01 to 2026-04-30

  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('user_id', user.id)
    .gte('date', from)
    .lte('date', to)

  if (error || !data?.length) return

  const total = data.reduce((s, e) => s + Number(e.amount), 0)
  const byCategory = data.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  setLastMonthData({ 
    total, 
    byCategory, 
    month: firstDayLastMonth.toLocaleString('default', { month: 'long', year: 'numeric' }) 
  })
}

useEffect(() => {
  fetchExpenses()
  fetchBudget()
  fetchLastMonthSummary()
}, [])

 const catTotals = expenses.reduce((acc, e) => {
  acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
  return acc;
}, {});

  return (
    <div className="flex flex-col min-h-screen bg-[#fdf6ee] dark:bg-black dark:text-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="expense" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-serif text-3xl font-semibold text-[#2c2440] mb-1 dark:text-white flex justify-center">
               Expense Tracker 💰
            </h1>
<div className="mb-6 text-center">
  <p className="text-sm text-[#6b6080] dark:text-white">
    Track your spending and save smarter 💸
  </p>

  <p className="text-sm text-[#6b6080] mt-2 dark:text-white flex justify-center items-center gap-2 flex-wrap">
    Monthly Budget:

    {editingBudget ? (
      <span className="flex items-center gap-2">
        <input
          value={budgetInput}
          onChange={(e) => setBudgetInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveBudget()}
          type="number"
          min="1"
          className="w-24 border border-[#c8bfee] rounded-lg px-2 py-1 text-sm text-center outline-none focus:border-[#6c5cb8] dark:bg-[#2a2540] dark:text-white"
          autoFocus
        />

        <button
          onClick={saveBudget}
          className="text-[#6c5cb8] font-semibold text-sm hover:scale-110 transition"
        >
          ✓
        </button>

        <button
          onClick={() => {
            setEditingBudget(false)
            setBudgetInput("")
          }}
          className="text-[#a09ab5] text-sm hover:text-red-500 transition"
        >
          ✕
        </button>
      </span>
    ) : (
      <span
        onClick={() => {
          setBudgetInput(budget.toString())
          setEditingBudget(true)
        }}
        className="cursor-pointer text-[#6c5cb8] font-semibold hover:underline"
      >
        ₹{budget}
      </span>
    )}
  </p>
</div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-xl p-4 border border-[#ece8f8] text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1">Spent</p>
                <p className="font-serif text-2xl font-semibold text-[#d05050]">₹{totalSpent}</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#ece8f8] text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1">Saved</p>
                <p className={`font-serif text-2xl font-semibold ${saved >= 0 ? "text-[#5daa88]" : "text-[#d05050]"}`}>
                  ₹{saved}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#ece8f8] text-center dark:bg-[#1e1b2c] dark:border-[#2a2540]">
  <p className="text-[11px] text-[#a09ab5] uppercase tracking-widest mb-1">
    Budget
  </p>

  <p className="font-serif text-2xl font-semibold text-[#b0a2d2]">
    ₹{budget}
  </p>
</div>
            </div>

            {/* Budget bar */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <div className="flex justify-between text-xs text-[#6b6080] mb-2 dark:text-white">
                <span>Budget used</span>
                <span>{Math.min(100, Math.round((totalSpent / budget) * 100))}%</span>
              </div>
              <div className="bg-[#ede9f8] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalSpent > budget ? "bg-[#d05050]" : "bg-[#6c5cb8]"
                  }`}
                  style={{ width: `${Math.min(100, (totalSpent / budget) * 100)}%` }}
                />
              </div>
            </div>

            {/* Today's Expenses */}
            <div className="bg-white rounded-2xl border border-[#ece8f8] mb-5 overflow-hidden dark:bg-[#1e1b2c] dark:border-[#2a2540]">
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest dark:text-white">
                  🗂 Recent Expenses
                </p>
              </div>
              {expenses.map((e, i) => (
                <div
                  key={e.id}
                  className={`flex items-center justify-between px-5 py-3 hover:bg-[#fdf6ee] transition-all dark:hover:bg-[#2a2540]
                    ${i !== 0 ? "border-t border-[#ece8f8] dark:border-[#2a2540]" : ""}`}
                >
                  <div>
                    <p className="text-sm text-[#2c2440] font-medium dark:text-white">{e.note}</p>
                    <p className="text-xs text-[#a09ab5] dark:text-white">{e.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-[#2c2440] dark:text-white">₹{e.amount}</span>
                    <button
                      onClick={() => remove(e.id)}
                      className="text-[#a09ab5] text-xs hover:text-[#d05050] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* Add form */}
              <div className="px-5 py-4 border-t border-[#ece8f8] bg-white dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                <div className="flex gap-2 flex-wrap">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && add()}
                    placeholder="Item name"
                    className="flex-1 min-w-30 border border-[#c8bfee] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#6c5cb8] text-[#2c2440] dark:bg-[#1e1b2c] dark:border-[#2a2540] dark:text-white"
                  />
                  <select
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
                    className="border border-[#c8bfee] rounded-lg px-2 py-2 text-sm bg-white outline-none text-[#6b6080] dark:text-white dark:bg-[#1e1b2c] dark:border-[#2a2540]"
                  >
                    {catOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    value={amt}
                    onChange={(e) => setAmt(e.target.value)}
                    type="number"
                    placeholder="₹ Amount "
                    className="w-24 border border-[#c8bfee] rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#6c5cb8] text-[#2c2440] dark:text-white dark:bg-[#1e1b2c] dark:border-[#2a2540]"
                  />
                  <button
                    onClick={add}
                    className="bg-[#6c5cb8] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#534ab7] transition-colors"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {Object.keys(catTotals).length > 0 && (
              <div className="bg-white rounded-2xl border border-[#ece8f8] p-5 mb-5 dark:bg-[#1e1b2c] dark:border-[#2a2540]">
                <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4 dark:text-white">
                  🗃 Category Breakdown
                </p>
                <div className="space-y-2.5">
                  {Object.entries(catTotals).map(([c, total]) => (
                    <div key={c}>
                      <div className="flex justify-between text-xs text-[#6b6080] mb-1 dark:text-white">
                        <span>{c}</span><span>₹{total}</span>
                      </div>
                      <div className="bg-[#ede9f8] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#9b8fd4] transition-all duration-500"
                          style={{ width: `${Math.round((total / totalSpent) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {budgetLoaded && (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <ExpensePieChart key={budget} refreshKey={refreshKey} budget={budget} />
                  <ExpenseLineChart refreshKey={refreshKey} budget={budget} />
                </div>
              )}

              {lastMonthData && (
  <div className="bg-white dark:bg-[#1e1b2c] rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-5 overflow-hidden">
    <button
      onClick={() => setShowLastMonth(p => !p)}
      className="w-full flex items-center justify-between px-5 py-4 text-left"
    >
      <div>
        <p className="text-xs font-semibold text-[#a09ab5] uppercase tracking-widest">
          📅 {lastMonthData.month} Summary
        </p>
        <p className="text-sm font-semibold text-[#2c2440] dark:text-white mt-0.5">
          Total spent: <span className="text-[#d05050]">₹{lastMonthData.total.toFixed(0)}</span>
        </p>
      </div>
      <span className="text-[#a09ab5] text-lg">{showLastMonth ? '▲' : '▼'}</span>
    </button>

    {showLastMonth && (
      <div className="px-5 pb-4 border-t border-[#ece8f8] dark:border-[#2a2540] pt-3 space-y-2">
        {Object.entries(lastMonthData.byCategory)
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => (
            <div key={cat}>
              <div className="flex justify-between text-xs text-[#6b6080] dark:text-white mb-1">
                <span>{cat}</span>
                <span>₹{amt.toFixed(0)} · {Math.round((amt / lastMonthData.total) * 100)}%</span>
              </div>
              <div className="bg-[#ede9f8] dark:bg-[#2a2540] rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9b8fd4] transition-all duration-500"
                  style={{ width: `${Math.round((amt / lastMonthData.total) * 100)}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
)}

          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
