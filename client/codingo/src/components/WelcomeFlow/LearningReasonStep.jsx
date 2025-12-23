import React from "react";

function LearningReasonStep({ onContinue }) {
  const [selected, setSelected] = React.useState(null);
  const options = [
    ["Just for fun", "🎉"],
    ["Prepare for travel", "🛫"],
    ["Connect with people", "🧑‍🤝‍🧑"],
    ["Spend time productively", "🧠"],
    ["Boost my career", "💼"],
    ["Support my education", "📚"]
  ];

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
          Yay! Fun is my specialty!
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {options.map(([text, icon]) => (
          <button
            key={text}
            onClick={() => setSelected(text)}
            className={`flex items-center gap-4 border-2 rounded-xl px-4 py-3 w-full font-bold text-lg transition ${
              selected === text
                ? "border-lime-400 bg-gray-800 text-lime-300"
                : "border-gray-700 bg-transparent text-white hover:border-lime-400"
            }`}
          >
            <span className="text-2xl">{icon}</span>
            <span>{text}</span>
          </button>
        ))}
      </div>
      {/* Continue Button */}
      <div className="flex justify-end w-full max-w-2xl mt-8">
        <button
          className={`text-lg font-extrabold px-10 py-3 rounded-2xl transition ${
            selected
              ? "bg-lime-400 hover:bg-lime-500 text-gray-900"
              : "bg-gray-600 text-gray-300 opacity-70 cursor-not-allowed"
          }`}
          disabled={!selected}
          onClick={onContinue}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
export default LearningReasonStep;