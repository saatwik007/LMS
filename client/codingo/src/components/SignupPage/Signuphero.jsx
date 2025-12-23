import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AgePrompt() {
  const [age, setAge] = useState("");
  const navigate = useNavigate();

  // Simple validation, enable button only with valid age
  const validAge = /^\d{1,3}$/.test(age) && Number(age) > 0 && Number(age) < 130;

  return (
    <div className="min-h-screen bg-[#151f23] flex items-center justify-center relative font-sans">
      {/* Login Button - Top Right */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-8 right-8 md:right-20 bg-transparent border-2 border-cyan-300 hover:border-cyan-400 px-6 py-2 rounded-full font-bold text-cyan-200 hover:text-white transition"
      >
        LOGIN
      </button>
      {/* Close Icon - Top Left */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-7 left-7 text-cyan-300 hover:text-white text-3xl font-bold transition hidden md:block"
        aria-label="Close"
      >
        ×
      </button>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-8 mt-2 text-white">
          How old are you?
        </h1>

        {/* Age Input */}
        <form className="w-full flex flex-col gap-2"
          onSubmit={e => { e.preventDefault(); if(validAge) navigate("/next-step"); }}>
          <input
            className="w-full bg-[#16242B] border-2 border-cyan-400 text-white text-lg p-4 rounded-lg font-semibold placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400 transition"
            type="number"
            placeholder="Age"
            value={age}
            onChange={e => setAge(e.target.value.replace(/[^0-9]/g, ''))}
            min={1}
            max={120}
            required
          />
          <div className="text-gray-300 text-base px-1 mt-1 mb-2 text-left">
            Providing your age ensures you get the right Codyssey experience. For more details, please visit our&nbsp;
            <a href="/privacy" className="text-cyan-400 font-bold hover:underline">Privacy Policy</a>.
          </div>
          <button
            type="submit"
            disabled={!validAge}
            className={`w-full mt-2 py-3 rounded-lg text-lg font-extrabold ${
              validAge
                ? "bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:text-white shadow transition"
                : "bg-[#364757] bg-opacity-60 text-gray-400 cursor-not-allowed"
            }`}
          >
            NEXT
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