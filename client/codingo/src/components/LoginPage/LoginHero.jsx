import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginHero = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    axios.get(`${apiUrl}/api/auth/oauth/status`).then(r => {
      if (r.data?.google) setGoogleEnabled(true);
    }).catch(() => {});
  }, [apiUrl]);

  const handleExitLogin = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      // Update with your backend login API endpoint
const res = await axios.post(`${apiUrl}/api/auth/user/login`, {
  emailOrUsername,
  password,
}, {
  withCredentials: true,
});
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      window.dispatchEvent(new Event("auth:user-updated"));
      setLoading(false);
      // Redirect on success
      navigate("/dashboard", { replace: true });
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0f1419] font-sans px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#2a3a4a] rounded-2xl shadow-lg p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleExitLogin}
            className="text-cyan-300 hover:text-white text-2xl font-bold transition"
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="bg-transparent border border-cyan-400/50 hover:border-cyan-300 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold text-cyan-200 hover:text-white transition"
            onClick={() => navigate("/signup")}
            type="button"
          >
            SIGN UP
          </button>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400">
          Log in
        </h1>
        <p className="text-center text-sm text-gray-400 mb-6">Continue your learning streak</p>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 w-full text-center text-sm font-bold text-red-300 bg-red-900/30 border border-red-800/40 py-2 rounded-lg">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
            type="text"
            placeholder="Email or username"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            required
          />
          <div className="relative">
            <input
              className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition pr-28"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-300 font-bold text-xs hover:text-cyan-200 transition"
              type="button"
              tabIndex={-1}
              onClick={() => navigate('/forgot-password')}
            >
              FORGOT?
            </button>
          </div>
          <button
            className="mt-1 w-full py-3 rounded-lg text-base font-extrabold bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 shadow hover:from-emerald-400 hover:to-cyan-600 text-gray-950 hover:text-white transition"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOG IN"}
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
            onClick={() => { if (googleEnabled) window.location.href = `${apiUrl}/api/auth/google`; }}
            disabled={!googleEnabled}
            className={`flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center transition ${googleEnabled ? 'hover:bg-[#22344c]' : 'opacity-50 cursor-not-allowed'}`}
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none"><path d="M21.805 10.023H12.18v3.996h5.488c-.236 1.209-1.386 3.563-5.488 3.563-3.299 0-5.995-2.75-5.995-6.145 0-3.395 2.696-6.145 5.995-6.145 1.88 0 3.142.803 3.862 1.496l2.646-2.582C18.109 3.52 15.733 2.25 12.18 2.25c-5.378 0-9.752 4.374-9.752 9.75 0 5.376 4.374 9.75 9.752 9.75 5.632 0 9.366-3.962 9.366-9.537 0-.641-.069-1.13-.159-1.59z" fill="#fff"/></svg>
            GOOGLE
          </button>
          <button className="flex-1 flex items-center gap-2 py-3 rounded-lg bg-[#141b24] border border-[#1f2a38] text-white font-bold text-sm justify-center hover:bg-[#22344c] transition">
            <svg className="w-6 h-6 mr-2" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>microsoft [#ffffff150]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-220.000000, -7519.000000)" fill="#ffffff"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M174,7379 L184,7379 L184,7370 L174,7370 L174,7379 Z M164,7379 L173,7379 L173,7370 L164,7370 L164,7379 Z M174,7369 L184,7369 L184,7359 L174,7359 L174,7369 Z M164,7369 L173,7369 L173,7359 L164,7359 L164,7369 Z" id="microsoft-[#ffffff150]"> </path> </g> </g> </g> </g></svg>
            MICROSOFT
          </button>
        </div>
        {/* Terms and Info */}
        <p className="text-xs text-gray-500 mt-6 mb-2 text-center leading-5 font-semibold">
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