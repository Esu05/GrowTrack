import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getStreaks } from "../utils/streakUtils";
import { useMemo } from "react";


const navItems = [
  { label: "Dashboard", icon: "🏠", href: "/dashboard" },
  { label: "Insights", icon: "✨", href: "/insights" },
];

const trackerItems = [
  { label: "To-Do", icon: "📋", href: "/todo", badge: true },
  { label: "Expense", icon: "💰", href: "/expense" },
  { label: "Water", icon: "💧", href: "/water" },
  { label: "Mood", icon: "😊", href: "/mood" },
];

export default function Sidebar({ pendingCounts, score }) {
  const location = useLocation();
  const pathname = location.pathname;

  const [streak, setStreak] = useState({
  current: 0,
  longest: 0,
  last_logged: null
});

const getLocalDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

  const isActive = (href) => pathname === href;

const { days, doneDays } = useMemo(() => {
  const today = new Date();
  const daysArr = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    daysArr.push(d);
  }

  const lastLogged = streak.last_logged
    ? new Date(streak.last_logged)
    : null;

  const normalize = (d) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  };

  const doneArr = daysArr.map((date) => {
    if (!lastLogged) return false;

    const diff = Math.floor(
      (normalize(lastLogged) - normalize(date)) /
      (1000 * 60 * 60 * 24)
    );

    return diff >= 0 && diff < streak.current;
  });

  return { days: daysArr, doneDays: doneArr };
}, [streak]);

const isActiveToday = streak.last_logged === getLocalDate();

const fetchStreak = async () => {
  const data = await getStreaks();
  if (data.dashboard) setStreak(data.dashboard);
};

useEffect(() => {
  fetchStreak(); // initial load
}, []);

useEffect(() => {
  if (score >= 70 && !isActiveToday) {
    fetchStreak(); // update when score crosses threshold
  }
}, [score]);

  return (
    <aside className="w-57.5 bg-[#fdf6ee] border-r border-[#baa4f7] flex flex-col shrink-0 overflow-y-auto dark:bg-black dark:text-white  dark:border-[#2a2540]">
      {/* Overview */}
      <div className="p-2 pt-3">
        <p className="text-[10px] font-semibold tracking-widest text-[#a09ab5] uppercase px-2.5 mb-1 dark:text-white">
          Overview
        </p>
        {navItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <div
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-all
                ${isActive(item.href)
                  ? "bg-[#ede9f8] text-[#6c5cb8] font-medium dark:bg-[#2a2540] dark:text-[#b9a8ff]"
                  : "text-[#6b6080] hover:bg-[#fdf6ee] hover:text-[#2c2440] dark:text-white dark:hover:bg-[#2a2540] dark:hover:text-white"
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="h-px bg-[#baa4f7] mx-3 my-1" />

      {/* Trackers */}
      <div className="p-2">
        <p className="text-[10px] font-semibold tracking-widest text-[#a09ab5] uppercase px-2.5 mb-1 dark:text-white">
          Trackers
        </p>
        {trackerItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <div
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-all
                ${isActive(item.href)
                  ? "bg-[#ede9f8] text-[#6c5cb8] font-medium dark:bg-[#2a2540] dark:text-[#b9a8ff]"
                  : "text-[#6b6080] hover:bg-[#fdf6ee] hover:text-[#2c2440] dark:hover:bg-[#2a2540] dark:hover:text-white dark:text-white"
                }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1 dark:text-white">{item.label}</span>
              {item.badge && pendingCounts > 0 && (
                <span className="ml-auto bg-[#c8bfee] text-[#6c5cb8] text-[10px] font-semibold px-1.5 py-0.5 rounded-full dark:bg-[#3a3550] dark:text-[#d6ccff]">
                  {pendingCounts}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="h-px bg-[#baa4f7] mx-3 my-1" />

      {/* Streak */}
      <div className="p-2 px-4 pb-5">
        <p className="text-[10px] font-semibold tracking-widest text-[#a09ab5] uppercase mb-2 dark:text-[#b9a8ff]">
          Streak
        </p>
        <p className="text-sm font-medium text-[#6c5cb8] mb-2">
             {streak.current === 0 ? (
  "🔥 Start your streak today!"
) : (
  <>
    🔥 {streak.current}-day streak
    {streak.current >= 3 && " — On fire!"}
  </>
)}
        </p>
        <div className="flex gap-1.5">
           {days.map((date, i) => {
            const isDone = doneDays[i];
            const isToday = date.toDateString() === new Date().toDateString();

            const label = date.toLocaleDateString("en-US", { weekday: "short",})[0];

    return (
      <div
        key={i}
        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-medium transition-all
          ${isDone
            ? "bg-[#6c5cb8] text-white"
            : "bg-[#ede9f8] text-[#a09ab5] dark:bg-[#2a2540] dark:text-gray-300"
          }
          ${isToday ? "ring-2 ring-[#6c5cb8] ring-offset-1 dark:ring-offset-black" : ""}
        `}
      >
        {label}
      </div>
    );
  })}
</div>

  <p className={`mt-2 text-xs ${isActiveToday ? "text-green-500" : "text-gray-400"}`}>
  {isActiveToday ? "Completed today ✅" : "Not completed"}
</p>
      </div>
    </aside>
  );
}
