import React from "react";

const steps = [
  {
    title: "Add your daily data",
    desc: "Log tasks, expenses, water, mood and more in just a few seconds.",
    icon: "✍️",
  },
  {
    title: "Get your daily score",
    desc: "See a simple score that reflects your overall daily progress.",
    icon: "📊",
  },
  {
    title: "Improve with insights",
    desc: "Receive smart suggestions to build better habits every day.",
    icon: "💡",
  },
];

const HowItWorks = () => {
  return (
    <section className="w-full py-24 px-6 md:px-12 dark:bg-black dark:text-white">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            How it works?
          </h2>
          <p className="text-base md:text-lg opacity-70 max-w-2xl mx-auto">
            A simple 3-step system to help you track, understand, and improve your life.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-10 relative">

          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-black/10 dark:bg-white/10 -translate-y-1/2"></div>

          {steps.map((step, index) => (
            <div
              key={index}
              className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl
              bg-[#F9F2FF] dark:bg-[#1e1b2c]
              border border-[#EADFFF] dark:border-white/10
              shadow-sm dark:shadow-none
              transition-all duration-300
              hover:-translate-y-1 hover:shadow-md"
            >

              {/* Step Number */}
              <div className="absolute -top-4 w-8 h-8 rounded-full bg-[#C8C2F0] text-black flex items-center justify-center text-sm font-bold shadow">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="text-3xl mb-4 mt-4">{step.icon}</div>

              {/* Title */}
              <h3 className="text-lg font-semibold mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm opacity-70 leading-relaxed">
                {step.desc}
              </p>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;