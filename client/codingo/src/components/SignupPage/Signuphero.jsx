import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SignupHero() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const isValid =
    username.trim().length >= 3 &&
    email.includes("@") &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await axios.post(
        `${apiUrl}/api/auth/user/register`,
        { username: username.trim(), email: email.trim().toLowerCase(), password },
        { withCredentials: true }
      );
      if (res.data?.token) localStorage.setItem("token", res.data.token);
      if (res.data?.user) localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("auth:user-updated"));
      navigate("/welcome");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0f1419] font-sans px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#2a3a4a] rounded-2xl shadow-lg p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-cyan-300 hover:text-white text-2xl font-bold transition"
            aria-label="Close"
          >
            ×
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-transparent border border-cyan-400/50 hover:border-cyan-300 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-cyan-200 hover:text-white transition"
            type="button"
          >
            LOGIN
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400">
          Create Account
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">Start your learning journey today</p>

        {errorMsg && (
          <div className="mb-4 w-full text-center text-sm font-bold text-red-300 bg-red-900/30 border border-red-800/40 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="text"
            placeholder="Username (min 3 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
          />
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-red-400 font-semibold px-1">Passwords do not match.</p>
          )}
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`w-full mt-2 py-3 rounded-lg text-base font-extrabold ${
              isValid && !loading
                ? "bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:text-white shadow transition"
                : "bg-[#364757] bg-opacity-60 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating account..." : "SIGN UP"}
          </button>
        </form>

        {/* Separator */}
        <div className="flex items-center w-full my-5">
          <div className="flex-1 border-t border-[#2a3a4a]" />
          <span className="text-[#4a5d6f] mx-3 text-xs font-bold">OR</span>
          <div className="flex-1 border-t border-[#2a3a4a]" />
        </div>
        {/* Social Logins */}
        <div className="flex gap-4 w-full">
          <button
            type="button"
            onClick={() => { window.location.href = `${apiUrl}/api/auth/google`; }}
            className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center hover:bg-[#22344c] transition"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"><path d="M21.805 10.023H12.18v3.996h5.488c-.236 1.209-1.386 3.563-5.488 3.563-3.299 0-5.995-2.75-5.995-6.145 0-3.395 2.696-6.145 5.995-6.145 1.88 0 3.142.803 3.862 1.496l2.646-2.582C18.109 3.52 15.733 2.25 12.18 2.25c-5.378 0-9.752 4.374-9.752 9.75 0 5.376 4.374 9.75 9.752 9.75 5.632 0 9.366-3.962 9.366-9.537 0-.641-.069-1.13-.159-1.59z" fill="#fff"/></svg>
            GOOGLE
          </button>
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center hover:bg-[#22344c] transition opacity-50 cursor-not-allowed" disabled>
            <svg className="w-6 h-6 mr-2" viewBox="0 0 20 20" fill="#ffffff"><path d="M10.5,16 L16,16 L16,10.5 L10.5,10.5 L10.5,16 Z M4,16 L9.5,16 L9.5,10.5 L4,10.5 L4,16 Z M10.5,9.5 L16,9.5 L16,4 L10.5,4 L10.5,9.5 Z M4,9.5 L9.5,9.5 L9.5,4 L4,4 L4,9.5 Z"/></svg>
            MICROSOFT
          </button>
        </div>
        {/* Terms */}
        <p className="text-xs text-gray-500 mt-8 mb-2 text-center leading-5 font-semibold">
          By signing up, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}