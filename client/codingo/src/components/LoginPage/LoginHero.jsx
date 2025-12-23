import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios"; // npm install axios

const LoginHero = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleExitLogin = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      // Update with your backend login API endpoint
const apiUrl = import.meta.env.VITE_API_URL || "";
const res = await axios.post(`${apiUrl}/api/auth/login`, {
  emailOrUsername,
  password,
});
      // Set token (customize as needed)
      localStorage.setItem("token", res.data.token);
      setLoading(false);
      // Redirect on success
      navigate("/dashboard"); // or wherever your main app lands
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please check your credentials."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#151f23] flex items-center justify-center relative font-sans">
      {/* Sign Up Button */}
      <button
        className="absolute top-8 right-8 md:right-20 bg-transparent border-2 border-cyan-300 hover:border-cyan-400 px-6 py-2 rounded-full font-bold text-cyan-200 hover:text-white transition"
        onClick={() => navigate("/signup")}
      >
        SIGN UP
      </button>

      {/* Close Icon */}
      <button
        onClick={handleExitLogin}
        className="absolute top-7 left-7 text-cyan-300 hover:text-white text-3xl font-bold transition hidden md:block"
        aria-label="Close"
      >
        ×
      </button>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400">
          Log in
        </h1>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 w-full text-center text-sm font-bold text-red-400 bg-red-900/30 py-2 rounded">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition"
            type="text"
            placeholder="Email or username"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
          />
          <div className="relative">
            <input
              className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition pr-32"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-sm hover:text-cyan-200 transition"
              type="button"
              tabIndex={-1}
              onClick={() => alert("Implement forgot password flow!")}
            >
              FORGOT?
            </button>
          </div>
          <button
            className="mt-2 w-full py-3 rounded-lg text-lg font-extrabold bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500 shadow hover:from-emerald-400 hover:to-cyan-600 text-gray-950 hover:text-white transition"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>
        {/* Separator */}
        <div className="flex items-center w-full my-5">
          <div className="flex-1 border-t border-[#233036]" />
          <span className="text-[#364757] mx-3 font-bold">OR</span>
          <div className="flex-1 border-t border-[#233036]" />
        </div>
        {/* Social Logins */}
        <div className="flex gap-4 w-full">
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#16242B] border border-[#2e3940] text-white font-bold text-base justify-center hover:bg-[#22344c] transition">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"><path d="M21.805 10.023H12.18v3.996h5.488c-.236 1.209-1.386 3.563-5.488 3.563-3.299 0-5.995-2.75-5.995-6.145 0-3.395 2.696-6.145 5.995-6.145 1.88 0 3.142.803 3.862 1.496l2.646-2.582C18.109 3.52 15.733 2.25 12.18 2.25c-5.378 0-9.752 4.374-9.752 9.75 0 5.376 4.374 9.75 9.752 9.75 5.632 0 9.366-3.962 9.366-9.537 0-.641-.069-1.13-.159-1.59z" fill="#fff"/></svg>
            GOOGLE
          </button>
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#16242B] border border-[#2e3940] text-white font-bold text-base justify-center hover:bg-[#22344c] transition">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>microsoft [#ffffff150]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-220.000000, -7519.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M174,7379 L184,7379 L184,7370 L174,7370 L174,7379 Z M164,7379 L173,7379 L173,7370 L164,7370 L164,7379 Z M174,7369 L184,7369 L184,7359 L174,7359 L174,7369 Z M164,7369 L173,7369 L173,7359 L164,7359 L164,7369 Z" id="microsoft-[#ffffff150]"> </path> </g> </g> </g> </g></svg>
            MICROSOFT
          </button>
        </div>
        {/* Terms and Info */}
        <p className="text-xs text-gray-500 mt-8 mb-2 text-center leading-5 font-semibold">
          By signing in, you agree to our <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
        </p>
        <p className="text-xs text-gray-500 text-center leading-4">
          This site is protected by reCAPTCHA Enterprise and the Google <span className="underline">Privacy Policy</span> and <span className="underline">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
};

export default LoginHero;