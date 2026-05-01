import React from "react";

const features = [
  {
    title: "Tasks & Productivity",
    desc: "Organize your daily tasks and stay focused on what truly matters.",
    icon: "✅",
  },
  {
    title: "Expense Tracking",
    desc: "Track your spending and manage your finances effortlessly.",
    icon: "💰",
  },
  {
    title: "Health & Hydration",
    desc: "Monitor your water intake and steps to stay healthy.",
    icon: "💧",
  },
  {
    title: "Mood Tracking",
    desc: "Understand your emotions and improve mental well-being.",
    icon: "😊",
  },
  {
    title: "Smart Insights",
    desc: "Get personalized insights to improve your daily habits.",
    icon: "💡",
  },
  {
    title: "All-in-One Dashboard",
    desc: "Everything you need in one clean and simple interface.",
    icon: "📊",
  },
];

const Features = () => {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-[#F1DFFF] dark:bg-black dark:text-white">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">
            Everything you need in one place
          </h2>
          <p className="text-base md:text-lg opacity-70 max-w-2xl mx-auto">
            Simplify your life by tracking productivity, health, and finances — all in a single dashboard.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl
                bg-[#F9F2FF] dark:bg-[#1e1b2c] 
                border border-black/5 dark:border-white/10
                shadow-sm dark:shadow-none
                transition-all duration-300
                hover:shadow-md hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>

              <h3 className="text-lg font-semibold mb-2">
                {feature.title}
              </h3>

              <p className="text-sm opacity-70 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
