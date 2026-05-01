"use client";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().split("T")[0];
};

const CATEGORY_COLORS = {
  "☕ Food":          "#6c5cb8",
  "🚌 Travel":        "#6899d4",
  "🛍 Shopping":      "#d97a9e",
  "🎬 Entertainment": "#f59e0b",
  "💊 Health":        "#5daa88",
  "📚 Education":     "#a09ab5",
  "💡 Utilities":     "#6899d4",
  "💸 Other":         "#a09ab5",
};

const getColor = (category) =>
  CATEGORY_COLORS[category] ?? "#a09ab5";


export const WeeklyBarChart = ({ data, todayIndex }) => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Score",
        data: data,
        borderRadius: 8,
        backgroundColor: data.map((val, i) => {
          if (i === todayIndex) return "#6c5cb8";
          if (val < 30) return "#ef4444";
          if (val < 70) return "#facc15";
          return "#22c55e";
        }),
      },
    ],
  };

  const options = {
    responsive: true,
    animation: { duration: 800 },
    plugins: { legend: { display: false } },
    scales: {
  y: {
    beginAtZero: true,
    max: 100,
    ticks: {
      stepSize: 20,
      color: "#6b6080", // light gray text
      font: {
        size: 11,
      },
    },
    border: {
      display: false, // ❌ remove axis line too (cleaner)
    },
  },
},
   
  };

  return (
    <div className="bg-white dark:bg-[#1e1b2c] p-4 rounded-xl  dark:border-[#2a2540]">
      <Bar data={chartData} options={options} />
    </div>
  );
};

// ─── Pie Chart: Expense by Category ──────────────────────
export function ExpensePieChart({ refreshKey, budget }) {
  const [categoryData, setCategoryData] = useState({});
  const [loading, setLoading] = useState(true);
  const totalRef = useRef(0);
  const budgetRef = useRef(budget);

  useEffect(() => { budgetRef.current = budget }, [budget])

  const centerTextPlugin = useRef({
    id: "centerText",
    afterDraw: (chart) => {
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      const centerX = (chartArea.left + chartArea.right) / 2
      const centerY = (chartArea.top + chartArea.bottom) / 2
      const total = totalRef.current
      const budget = budgetRef.current
      const pct = budget ? Math.min(Math.round((total / budget) * 100), 100) : 0
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = total > budget ? "#d05050" : "#6c5cb8";
      ctx.fillText(`${pct}%`, centerX, centerY - 10)
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#a09ab5";
      ctx.fillText("used", centerX, centerY + 12)
      ctx.restore();
    }
  }).current

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const from = getLocalDateString(firstDay);
      const to   = getLocalDateString(now);

      const { data, error } = await supabase
        .from("expenses")
        .select("category, amount")
        .eq("user_id", user.id)
        .gte("date", from)
        .lte("date", to);

      if (error) { console.log(error.message); return; }

      // Sum by category
      const totals = {};
      data?.forEach(({ category, amount }) => {
        totals[category] = (totals[category] || 0) + Number(amount);
      });
      totalRef.current = Object.values(totals).reduce((a, b) => a + b, 0)
      setCategoryData(totals);
      setLoading(false);
    };

    fetch();
  }, [refreshKey, budget]);

  const labels   = Object.keys(categoryData);
  const values   = Object.values(categoryData);
  const colors   = labels.map(getColor);
  const total    = values.reduce((a, b) => a + b, 0);

  if (loading) return (
    <div className="bg-white dark:bg-[#1e1b2c] p-5 rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-4 h-48 animate-pulse" />
  );

  if (labels.length === 0) return (
    <div className="bg-white dark:bg-[#1e1b2c] p-5 rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-4">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-2">
        🥧 Spending by Category
      </p>
      <p className="text-sm text-[#a09ab5] text-center py-6">No expenses this month yet!</p>
    </div>
  );

  const chartData = {
    labels,
    datasets: [{
    data: values,              
    backgroundColor: colors,   
    borderWidth: 0,
    hoverOffset: 10,
    spacing: 2,
  }],
  };

  const options = {
    responsive: true,
    cutout: "68%",
  };

  return (
    <div className="bg-white dark:bg-[#1e1b2c] p-5 rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-4">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4">
        🥧 Spending by Category
      </p>
      <div className="flex items-center gap-6">
        <div className="w-40 h-44 shrink-0">
          <Pie data={chartData} options={options} plugins={[centerTextPlugin]} />
        </div>
        {/* Custom legend */}
        <div className="flex flex-col gap-2 flex-1">
          {labels.map((label, i) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[i] }}
                />
                <span className="text-[#2c2440] dark:text-white">{label}</span>
              </div>
              <span className="text-[#6b6080] dark:text-[#a09ab5] text-xs">
                ₹{values[i].toFixed(0)}
              </span>
            </div>
          ))}
          
<div className="border-t border-[#ece8f8] dark:border-[#2a2540] mt-1 pt-1 space-y-1">
  <div className="flex justify-between text-xs font-semibold">
    <span className="text-[#2c2440] dark:text-white">Total Spent</span>
    <span className="text-[#d05050]">₹{total.toFixed(0)}</span>
  </div>
  <div className="flex justify-between text-xs font-semibold">
    <span className="text-[#2c2440] dark:text-white">Budget</span>
    <span className="text-[#6c5cb8]">₹{budget || 0}</span>
  </div>
  <div className="flex justify-between text-xs font-semibold">
    <span className="text-[#2c2440] dark:text-white">
      {total > budget ? "Over by" : "Remaining"}
    </span>
    <span className={total > budget ? "text-[#d05050]" : "text-[#5daa88]"}>
      ₹{Math.abs(budget - total).toFixed(0)}
    </span>
  </div>
</div>
        </div>
      </div>
    </div>
  );
}

export function ExpenseLineChart({ refreshKey, budget }) {
  const [dailyData, setDailyData] = useState(Array(7).fill(0));
  const [labels, setLabels] = useState(Array(7).fill(""));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Last 7 days in order
      const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
});

      // Day labels like Mon, Tue etc
     const dayLabels = days.map(day => {
  const [year, month, d] = day.split('-').map(Number)
  const date = new Date(year, month - 1, d) // local date, no UTC shift
  return date.toLocaleDateString('en-IN', { weekday: 'short' })
})

      const { data, error } = await supabase
        .from("expenses")
        .select("date, amount")
        .eq("user_id", user.id)
        .gte("date", days[0])
        .lte("date", days[6]);

      if (error) { console.log(error.message); return; }

      // Sum amounts per day in correct sequential order
      const map = {};
      data?.forEach(({ date, amount }) => {
        map[date] = (map[date] || 0) + Number(amount);
      });

      // Map sequentially — index 0 = 6 days ago, index 6 = today
      const final = days.map(day => map[day] || 0);

      setDailyData(final);
      setLabels(dayLabels);
      setLoading(false);
    };

    fetchData();
  }, [refreshKey, budget]);

  if (loading) return (
    <div className="bg-white dark:bg-[#1e1b2c] p-5 rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-4 h-48 animate-pulse" />
  );

  const chartData = {
    labels: labels, // ✅ dynamic labels matching actual days
    datasets: [{
      label: "₹ Spent",
      data: dailyData,
      fill: true,
      tension: 0.3,
      borderColor: "#9b8fd4",
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(108,92,184,0.35)");
        gradient.addColorStop(1, "rgba(108,92,184,0.02)");
        return gradient;
      },
      pointRadius: (ctx) => {
        const max = Math.max(...ctx.dataset.data);
        return ctx.raw === max ? 5 : 3;
      },
      pointHoverRadius: 6,
      pointBorderWidth: 2,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#6c5cb8",
    }],
  };

  const options = {
    responsive: true,
    animation: { duration: 800 },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toFixed(0)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: budget || 100, // ✅ budget is the max
        ticks: {
          stepSize: Math.ceil((budget || 100) / 5),
          callback: (v) => `₹${v}`,
          color: "#6b6080",
        },
        grid: { color: "rgba(0,0,0,0.05)" },
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#6b6080" }
      }
    },
  };

  return (
    <div className="bg-white dark:bg-[#1e1b2c] p-5 rounded-2xl border border-[#ece8f8] dark:border-[#2a2540] mb-4">
      <p className="text-xs font-semibold text-[#6b6080] uppercase tracking-widest mb-4">
        📈 Daily Expenses (Last 7 Days)
      </p>
      <Line data={chartData} options={options} />
    </div>
  );
}