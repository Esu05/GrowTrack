import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleEmailSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
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

  async function handleGoogleSignup() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf6ee] dark:bg-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1e1b2c] border border-[#ece8f8] dark:border-[#2a2540] rounded-3xl p-8 shadow-sm">

        {/* Heading */}
        <h1 className="text-3xl font-serif font-semibold text-center text-[#2c2440] dark:text-white mb-2">
          Create Account ✨
        </h1>

        <p className="text-sm text-center text-[#6b6080] dark:text-[#b8b0d4] mb-6">
          Start tracking your habits and finances smarter.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/30 text-red-500 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#c8bfee] 
            bg-[#fdf6ee] dark:bg-[#2a2540] dark:border-[#3a3550]
            text-[#2c2440] dark:text-white outline-none 
            focus:border-[#6c5cb8]"
            required
          />

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#c8bfee] 
            bg-[#fdf6ee] dark:bg-[#2a2540] dark:border-[#3a3550]
            text-[#2c2440] dark:text-white outline-none 
            focus:border-[#6c5cb8]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c5cb8] text-white py-3 rounded-xl hover:bg-[#534ab7] transition-colors"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-5">
          <hr className="flex-1 border-[#ece8f8] dark:border-[#2a2540]" />
          <span className="mx-3 text-sm text-[#a09ab5] dark:text-[#b8b0d4]">
            or
          </span>
          <hr className="flex-1 border-[#ece8f8] dark:border-[#2a2540]" />
        </div>

        {/* Google signup */}
        <button
          onClick={handleGoogleSignup}
          className="w-full border border-[#ece8f8] dark:border-[#2a2540] 
          py-3 rounded-xl flex items-center justify-center gap-2 
          hover:bg-[#fdf6ee] dark:hover:bg-[#2a2540] transition"
        >
          <img
            src="https://www.google.com/favicon.ico"
            className="w-4 h-4"
            alt="google"
          />
          <span className="text-[#2c2440] dark:text-white">
            Continue with Google
          </span>
        </button>

        {/* Login link */}
        <p className="text-center text-sm text-[#6b6080] dark:text-[#b8b0d4] mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#6c5cb8] font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}