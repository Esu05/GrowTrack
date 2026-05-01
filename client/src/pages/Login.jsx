import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleEmailLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#fdf6ee] dark:bg-black transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1b2c] border border-[#ece8f8] dark:border-[#2a2540] rounded-3xl p-8 shadow-sm">
        
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-semibold text-[#2c2440] dark:text-white">
            Welcome Back 🌱
          </h1>
          <p className="text-sm text-[#6b6080] mt-2 dark:text-gray-300">
            Log in to continue Tracking Your Growth
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[#c8bfee] dark:border-[#2a2540] bg-[#fdf6ee] dark:bg-[#2a2540] text-[#2c2440] dark:text-white rounded-xl px-4 py-3 outline-none focus:border-[#6c5cb8]"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-[#c8bfee] dark:border-[#2a2540] bg-[#fdf6ee] dark:bg-[#2a2540] text-[#2c2440] dark:text-white rounded-xl px-4 py-3 outline-none focus:border-[#6c5cb8]"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c5cb8] text-white py-3 rounded-xl hover:bg-[#534ab7] transition-colors font-medium"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <hr className="flex-1 border-[#ece8f8] dark:border-[#2a2540]" />
          <span className="mx-3 text-xs text-[#a09ab5] dark:text-gray-400 uppercase tracking-widest">
            OR
          </span>
          <hr className="flex-1 border-[#ece8f8] dark:border-[#2a2540]" />
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full border border-[#ece8f8] dark:border-[#2a2540] py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#fdf6ee] dark:hover:bg-[#2a2540] transition-colors text-[#2c2440] dark:text-white"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-4 h-4"
          />
          Continue with Google
        </button>

        {/* Signup link */}
        <p className="text-center text-sm text-[#6b6080] dark:text-gray-300 mt-5">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-[#6c5cb8] font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}