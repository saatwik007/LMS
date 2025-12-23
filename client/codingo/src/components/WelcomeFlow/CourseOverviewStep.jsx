import React from "react";

function CourseOverviewStep({ onContinue }) {
  return (
    <div className="flex flex-col items-center gap-6 pb-10">
      {/* Mascot + speech bubble */}
      <div className="flex items-center gap-4 mt-2">
        <svg width="140" height="140" viewBox="0 0 90 90">
          <ellipse cx="45" cy="55" rx="30" ry="28" fill="#a3e635" />
          <ellipse cx="32" cy="53" rx="7" ry="9" fill="#fff" />
          <ellipse cx="58" cy="51" rx="7" ry="9" fill="#fff" />
          <ellipse cx="45" cy="70" rx="7" ry="4" fill="#2dd4bf" />
        </svg>
        <div className="bg-[#16242B] px-5 py-2 rounded-lg border border-cyan-400 text-white text-base font-semibold">
          Here’s what you can achieve!
        </div>
      </div>
      <div className="flex flex-col gap-8 w-full max-w-2xl mt-8">
        <div className="flex items-start gap-5">
          <span className="text-3xl">💬</span>
          <div>
            <div className="font-bold text-lg text-white">
              Converse with confidence
            </div>
            <div className="text-gray-400 text-base">
              Stress-free speaking and listening exercises
            </div>
          </div>
        </div>
        <hr className="my-2 border-t border-gray-700" />
        <div className="flex items-start gap-5">
          <span className="text-3xl">🅰️</span>
          <div>
            <div className="font-bold text-lg text-white">
              Build a large vocabulary
            </div>
            <div className="text-gray-400 text-base">
              Common words and practical phrases
            </div>
          </div>
        </div>
      </div>
      {/* Continue Button */}
      <div className="flex justify-end w-full max-w-2xl mt-8">
        <button
          className="text-lg font-extrabold px-10 py-3 rounded-2xl transition bg-lime-400 hover:bg-lime-500 text-gray-900"
          onClick={onContinue}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
export default CourseOverviewStep;