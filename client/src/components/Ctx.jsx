import React from 'react'
import { useNavigate } from "react-router-dom";


const Ctx = () => {
  const navigate = useNavigate();


  return (
    <>
    {/* ── LET'S START SECTION ── */}
      <section
        className="w-full py-14 px-6
           dark:bg-black
          border-t border-[#C8C2F0]/40 dark:border-[#3d3570]/60
          transition-colors duration-300 bg-[#F1DFFF]"
      >
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">

          {/* Eyebrow */}
          <p
            className="text-sm italic
              text-[#7C6FCD] dark:text-[#a897e8]"
          >
            Your cup of tea?
          </p>

          {/* Heading */}
          <h2
            className="text-5xl md:text-6xl font-black
              text-[#1a1a2e] dark:text-white
              leading-tight flex flex-col items-center gap-4 text-center"
          >
             <p>  Start Your Personal 
              Growth Journey Today!</p> 
          </h2>

          {/* Decorative lines + button row */}
          <div className="w-full flex items-center justify-center gap-4 mt-2">
            <div
              className="flex-1 h-px
                bg-[#C8C2F0]/60 dark:bg-[#3d3570]/80"
            />
            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-3 rounded-full font-medium whitespace-nowrap
                bg-transparent
                border border-[#1a1a2e]/25 dark:border-[#e0ddf5]/20
                text-[#1a1a2e] dark:text-[#e0ddf5]
                hover:bg-[#C8C2F0]/30 dark:hover:bg-[#3d3570]/50
                hover:border-[#7C6FCD] dark:hover:border-[#a897e8]
                transition-all duration-200"
            >
              Sign Up for Free
            </button>
            <div
              className="flex-1 h-px
                bg-[#C8C2F0]/60 dark:bg-[#3d3570]/80"
            />
          </div>

        </div>
      </section>
    </>
  )
}

export default Ctx