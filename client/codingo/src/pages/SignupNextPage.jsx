import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // at the top


export default function SignupProfile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Validation: Only enable if email and pw not empty
  const valid = email.trim() && pw.length >= 6;

  const handleSubmit = async e => {
   e.preventDefault();
  if (!valid) return;
  setErrorMsg("");
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    await axios.post(`${apiUrl}/api/auth/register`, {
      username: name, // or use a separate username field
      email,
      password: pw,
    });
    navigate("/dashboard"); // or wherever you want to go after signup
  } catch (err) {
    setErrorMsg(
      err.response?.data?.message ||
      err.message ||
      "Signup failed. Please try again."
    );
  }
  };

  return (
    <div className="min-h-screen bg-[#151f23] flex items-center justify-center relative font-sans">
      {/* Login Button (top right) */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-8 right-8 md:right-20 bg-transparent border-2 border-cyan-300 hover:border-cyan-400 px-6 py-2 rounded-full font-bold text-cyan-200 hover:text-white transition"
      >
        LOGIN
      </button>
      {/* Back arrow (top left) */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 md:left-20 text-cyan-300 hover:text-white text-3xl font-bold transition"
        aria-label="Back"
      >
        &#8592;
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 mt-2 text-white">
          Create your profile
        </h1>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 w-full text-center text-sm font-bold text-red-400 bg-red-900/30 py-2 rounded">
            {errorMsg}
          </div>
        )}

        <form className="w-full flex flex-col gap-3" onSubmit={handleSubmit} autoComplete="off">
          <input
            className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition"
            type="text"
            placeholder="Name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="off"
          />
          <input
            className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="off"
            required
          />
          {/* Password Input + Toggle */}
          <div className="relative">
            <input
              className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition pr-12"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              autoComplete="off"
              required
              minLength={6}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-200"
              onClick={() => setShowPw(s => !s)}
              tabIndex={-1}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {/* Eye SVG */}
              {showPw ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a10 10 0 0119.542 2.783M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.875 6.876L19.125 19.126" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19c-5.523 0-10-4.477-10-10S6.477 0 12 0s10 4.477 10 10-4.477 10-10 10z" /><circle cx="12" cy="10" r="3" /></svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            className={`mt-4 w-full py-3 rounded-lg text-lg font-extrabold ${
              valid
                ? "bg-cyan-400 hover:bg-cyan-500 text-[#151f23] shadow transition"
                : "bg-[#364757] bg-opacity-70 text-gray-400 cursor-not-allowed"
            }`}
            disabled={!valid}
          >
            CREATE ACCOUNT
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
}