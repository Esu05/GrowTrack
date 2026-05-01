"use client";

export default function ScoreCard({ score = 72 }) {
  const getMessage = (s) => {
    if (s >= 90) return "Outstanding day! Keep it up! 🌟";
    if (s >= 70) return "Great progress today! ✨";
    if (s >= 50) return "You're on your way. Keep going! 💪";
    return "Let's get started — small steps count! 🌱";
  };

  return (
    <div className="bg-[#ede9f8] rounded-2xl px-7 py-6 text-center mb-6 dark:bg-[#1e1b2c]">
      <p className="text-sm font-medium text-[#6c5cb8] mb-2 dark:text-white">🔥 Daily Score</p>
      <p className="font-serif text-5xl font-semibold text-[#2c2440] leading-none dark:text-white">
        {score}{" "}
        <span className="text-xl font-normal text-[#6b6080] dark:text-white">/ 100</span>
      </p>

      {/* Progress bar */}
      <div className="bg-[#c8bfee] rounded-full h-1.5 mt-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#6c5cb8] transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm text-[#6b6080] mt-3 dark:text-white">{getMessage(score)}</p>
    </div>
  );
}
