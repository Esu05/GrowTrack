import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full min-h-screen flex items-center justify-center px-6 md:px-12 mt-20 dark:bg-black dark:text-white">
      <div className="max-w-7xl w-full grid md:grid-cols-2 gap-10 items-center">

        {/* ── LEFT CONTENT ── */}
        <div className="flex flex-col gap-6">

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 w-fit px-4 py-1.5 rounded-full
            text-xs font-medium text-[#534AB7]
            bg-[#C8C2F0]/20 border border-[#C8C2F0]/40">
            🌱 All-in-One Personal Growth Tracker
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Track your life. <br />
            <span className="text-[#7C6FCD]">Improve</span> every day.🌱
          </h1>

          <p className="text-base md:text-lg opacity-80 max-w-md">
            Manage tasks, money, health, and habits — all in one simple dashboard.
          </p>

          <div className="flex gap-4 mt-4">
            {/* ✅ soft shadow added — nothing else changed */}
            <Button
              title="Get Started for Free"
              containerClass="px-6 py-3 rounded-full bg-[#C8C2F0] text-black font-medium
                hover:scale-105 transition-all shadow-[0_4px_18px_rgba(124,111,205,0.35)]"
                onClick={() => navigate("/signup")}
            />

            {/* ✅ explicit border added */}
            <button className="px-6 py-3 rounded-full
              border-2 border-black/25 dark:border-white/25
              hover:scale-105 transition-all" onClick={() => navigate("/about")}> 
              Learn More
            </button>
          </div>

          {/* Feature tags — cycle tracker added */}
          <div className="flex flex-wrap gap-3 mt-6 text-sm opacity-80">
            {[
              { label: "Tasks",     icon: "✅" },
              { label: "Expenses",  icon: "💸" },
              { label: "Hydration", icon: "💧" },
              { label: "Mood",      icon: "😊" },
            ].map(({ label, icon }) => (
              <span
                key={label}
                className="px-3 py-1 rounded-full border
                  border-black/10 dark:border-white/10"
              >
                {icon} {label}
              </span>
            ))}
          </div>

          {/* Trust row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex">
              {["A","P","R","S"].map((l, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-white
                  -ml-2 first:ml-0 flex items-center justify-center
                  text-white text-[10px] font-semibold"
                  style={{ background: ["#7C6FCD","#F7A456","#5DCAA5","#D4537E"][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="text-xs opacity-70">
               people growing daily
            </p>
          </div>

        </div>

        {/* ── RIGHT CONTENT (DASHBOARD PREVIEW) ── */}
        <div className="relative flex justify-center items-center ml-15 mr-15">
          <div className="w-full max-w-md p-6 rounded-2xl shadow-xl border border-black/10 dark:border-white/10 bg-#F6ECFF dark:bg-black/40 backdrop-blur-md bg-[#F1DFFF]/80 ">

            {/* Header */}
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">Today's Overview</h3>
              <span className="text-xs opacity-50 bg-black/5 dark:bg-white/10
                px-3 py-1 rounded-full">
                Thu, Apr 16
              </span>
            </div>

            {/* Score row */}
            <div className="flex items-center gap-4 p-4 rounded-2xl mb-4
              bg-[#C8C2F0]/30 border border-[#C8C2F0]/40">
              {/* SVG ring */}
              <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
                <circle cx="32" cy="32" r="26"
                  fill="none" stroke="rgba(124,111,205,0.2)" strokeWidth="6"/>
                <circle cx="32" cy="32" r="26"
                  fill="none" stroke="#7C6FCD" strokeWidth="6"
                  strokeDasharray="163.4" strokeDashoffset="29"
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"/>
                <text x="32" y="37"
                  textAnchor="middle"
                  className="text-sm font-bold fill-current"
                  style={{ fontSize: 14, fontWeight: 800 }}>
                  82
                </text>
              </svg>
              <div>
                <p className="text-xs font-semibold text-[#7C6FCD] uppercase
                  tracking-wide mb-0.5">Daily Score</p>
                <p className="text-3xl font-extrabold leading-none">
                  82<span className="text-sm font-normal opacity-50">/100</span>
                </p>
                <p className="text-xs opacity-60 mt-1">
                  Great progress! <span className="text-green-600 font-medium">
                    ↑ +6 vs yesterday
                  </span>
                </p>
              </div>
            </div>

            {/* Tracker cards grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:"Tasks",     val:"5/8",    icon:"✅", pct:62, color:"#12e294" },
                { label:"Water",     val:"6 🥛",   icon:"💧", pct:75, color:"#3facff" },
                { label:"Expense",     val:"500",  icon:"💰", pct:72, color:"#F7A456" },
                { label:"Mood",      val:"😊",     icon:"",  pct:85, color:"#D4537E"  },
              ].map(({ label, val, icon, pct, color }) => (
                <div key={label}
                  className="p-3 rounded-xl bg-black/5 dark:bg-white/10
                    border border-black/5 dark:border-white/5
                    hover:-translate-y-0.5 transition-transform">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs opacity-60">{label}</p>
                    <span className="text-sm">{icon}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{val}</h4>
                  <div className="h-1 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                    <div className="h-1 rounded-full"
                      style={{ width: `${pct}%`, background: color }}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Insight chip */}
            <div className="flex items-start gap-2 p-3 rounded-xl
              bg-green-50 dark:bg-green-900/20
              border border-green-200/60 dark:border-green-700/30">
              <span className="text-sm mt-0.5">💡</span>
              <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">
                <strong>Insight:</strong> You complete most tasks before noon —
                try scheduling harder ones in the morning!
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;