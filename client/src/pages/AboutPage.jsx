import React from 'react'
import Navbar from '../components/Navbar'

const sections = [
  {
    num: '01',
    heading: 'Why GrowTrack exists',
    body: (
      <>
        Most people struggle not because they lack motivation — but because they lack
        clarity. GrowTrack turns your daily actions into meaningful insights so you can
        see what's actually working and what's holding you back.
        <br /><br />
        Instead of juggling multiple tools for tasks, mood, expenses, and habits,
        GrowTrack brings everything together in one place.
      </>
    ),
  },
  {
    num: '02',
    heading: 'What you can track',
    body: null,
    features: [
      { label: 'Tasks & Productivity', color: 'bg-[#12e294]' },
      { label: 'Mood Patterns',        color: 'bg-[#D4537E]' },
      { label: 'Expenses & Budget',    color: 'bg-[#F7A456]' },
      { label: 'Water Intake',         color: 'bg-[#3facff]' },
      { label: 'Streaks & Consistency',color: 'bg-[#7F77DD]' },
    ],
  },
  {
    num: '03',
    heading: 'Built for simplicity',
    body: 'No clutter. No unnecessary complexity. GrowTrack is designed to be fast, minimal, and easy to use every day — so the tool never gets in the way of the habit.',
  },
  {
    num: '04',
    heading: 'Your data, your control',
    body: 'Your data belongs to you. GrowTrack focuses on privacy and transparency, ensuring your information stays secure and accessible only to you — always.',
  },
]

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFE0] dark:bg-black text-black dark:text-white">
      <Navbar />
      <br />

      <main className="max-w-3xl mx-auto w-full px-6 py-12 pb-20">

        <div className="mb-14 pb-10 border-b border-black/10 dark:border-white/10 ">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-black/60 dark:text-white/60 mb-3 ">
            About GrowTrack
          </p>
          <h1
            className="font-serif text-5xl md:text-6xl font-normal leading-[1.1] tracking-tight mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            Growth is a<br />
            <em className="text-[#6c5cb8] dark:text-white/50 not-italic">daily practice.</em>
          </h1>
          <p className="text-base font-light leading-relaxed text-black/70 dark:text-white/70 max-w-lg">
            GrowTrack is a personal growth and daily tracking platform designed to help
            you understand your habits, improve consistency, and make better decisions
            every day.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {sections.map((s) => (
            <div
              key={s.num}
              className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 md:gap-8 py-9 items-start"
            >
              {/* Label */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-black/50 dark:text-white/50 tracking-wide">
                  {s.num}
                </span>
                <h2
                  className="text-xl font-normal leading-snug"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {s.heading}
                </h2>
              </div>

              {/* Body */}
              <div className="text-[0.92rem] font-light leading-[1.85] text-black/70 dark:text-white/70">
                {s.body && <p>{s.body}</p>}
                {s.features && (
                  <>
                    <p className="mb-4">Everything that matters, in one focused place.</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {s.features.map((f) => (
                        <div
                          key={f.label}
                          className="flex items-center gap-2.5 rounded-lg border border-black/5 dark:border-white/10 bg-[#F9F2FF] dark:bg-[#1e1b2c] px-3.5 py-2.5 text-[0.8rem] text-black dark:text-white"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${f.color}`} />
                          {f.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Closing callout */}
       <div className="mt-12 rounded-2xl border border-black/5 dark:border-white/10 bg-[#F9F2FF] dark:bg-[#1e1b2c] px-8 py-7 shadow-sm">
  
  <p
    className="text-2xl md:text-3xl font-normal italic leading-snug text-black dark:text-white mb-3"
    style={{ fontFamily: "'DM Serif Display', serif" }}
  >
    “Growth isn't about perfection — it's about consistency over time.”
  </p>

  <p className="text-sm font-light text-black/70 dark:text-white/60">
    GrowTrack helps you stay consistent, one small step at a time.
  </p>

</div>

      </main>
    </div>
  )
}

export default AboutPage