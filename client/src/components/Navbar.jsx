import { gsap } from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { applyTheme } from "../App";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Features", path: "/features" },
];

const Navbar = () => {
  const navContainerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system")
 
  const handleThemeChange = (mode) => {
  setTheme(mode)
  applyTheme(mode)
  localStorage.setItem("theme", mode)
 
}


  // Scroll behavior
  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }

    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? 0 : -100,
      opacity: isNavVisible ? 1 : 0,
      duration: 0.2,
    });
  }, [isNavVisible]);

  // Auth handler
  async function handleAuthAction() {
    if (user) {
      await supabase.auth.signOut();
      navigate("/");
    } else {
      navigate("/signup");
    }
  }

  return (
    <div
      ref={navContainerRef}
      className="inset-x-0 top-4 z-50 h-16 transition-all duration-700 sm:inset-x-6 bg-[#ede9f8]"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2 dark:bg-black">
        <nav className="relative flex items-center p-4">

          <div className="flex items-center cursor-pointer relative font-family: var(--font-family-general)" onClick={() => navigate(user ? "/dashboard" : "/")}>
            <img src="/src/assets/logogrowtrack.PNG" alt="logo" className="w-12 h-12 rounded-full" />
            <span className="mr-10">GrowTrack</span>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-10 dark:text-white">
            {navItems.map((item, index) => (
               <button
      key={index}
      onClick={() => navigate(item.path)}
      className="nav-hover-btn"
    >
      {item.name}
    </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">

            <div className="flex items-center gap-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-full">
              {["light", "dark", "system"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => handleThemeChange(mode)}
                  className={`px-3 py-1 text-sm rounded-full transition-all
                  ${
                    theme === mode
                      ? "bg-white dark:bg-black shadow"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {mode === "light" && "☀️"}
                  {mode === "dark" && "🌙"}
                  {mode === "system" && "💻"}
                </button>
              ))}
            </div>

            <button
              onClick={handleAuthAction}
              className="bg-[#6c5cb8] text-white px-4 py-2 rounded-lg hover:bg-[#534ab7] transition-colors mr-3"
            >
              {user ? "Logout" : "Sign Up / Login"}
            </button>

          </div>
        </nav>
      </header>
    </div>
  );
};

export default Navbar;