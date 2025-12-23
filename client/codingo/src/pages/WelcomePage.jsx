// import React, { useState } from "react";

// export default function WelcomePage() {
//   const [step, setStep] = useState(0);
// //   const [fade, setFade] = useState(false);

//   const messages = [
//     "Hi there! I'm Duo!",
//     "Let's get this party started!"
//   ];

//   // Optional: After second message, redirect or advance
//   // const navigate = useNavigate();

//   const handleContinue = () => {
//     // setFade(true);
//     setTimeout(() => {
//     //   setFade(false);
//       setStep(s => Math.min(s + 1, messages.length - 1));
//       // If you want to redirect after last message:
//       // if (step === messages.length - 1) navigate("/dashboard");
//     }, 350); // duration matches transition!!
//   };

//   return (
//     <div className="min-h-screen bg-[#151f23] flex flex-col justify-center items-center relative font-sans">
//       {/* Owl + Speech Bubble */}
//       <div className="flex flex-col items-center justify-center mt-32 mb-20">
//         <div className="mb-4">
//           <div className="relative flex flex-col items-center">
//             {/* Animated Speech bubble */}
//             <div
//               className={`mb-2 px-5 py-2 bg-[#16242B] text-white rounded-lg border border-cyan-400 shadow-lg relative text-lg font-bold transition-opacity duration-300`}
//             >
//               {messages[step]}
//               <span className="absolute left-1/2 transform -translate-x-1/2 -bottom-2 w-0 h-0 border-t-8 border-t-[#16242B] border-x-8 border-x-transparent"></span>
//             </div>
//             {/* Mascot SVG (Duo-style Owl placeholder) */}
//             <svg width="140" height="140" viewBox="0 0 90 90">
//               <ellipse cx="45" cy="55" rx="30" ry="28" fill="#a3e635" />
//               <ellipse cx="32" cy="53" rx="7" ry="9" fill="#fff" />
//               <ellipse cx="58" cy="51" rx="7" ry="9" fill="#fff" />
//               {/* Eyes (star-eyes if second message) */}
//               {step === 1 ? (
//                 <>
//                   <ellipse cx="34" cy="56" rx="4" ry="4" fill="#fff" />
//                   <ellipse cx="56" cy="54" rx="4" ry="4" fill="#fff" />
//                   {/* Star sparkle (using unicode) */}
//                   <text x="31" y="59" fontSize="13" fill="#222" fontWeight="bold">★</text>
//                   <text x="53" y="57" fontSize="13" fill="#222" fontWeight="bold">★</text>
//                 </>
//               ) : (
//                 <>
//                   <ellipse cx="34" cy="56" rx="2" ry="3" fill="#222" />
//                   <ellipse cx="56" cy="54" rx="2" ry="3" fill="#222" />
//                 </>
//               )}
//               <ellipse cx="45" cy="70" rx="7" ry="4" fill="#2dd4bf" />
//             </svg>
//           </div>
//         </div>
//       </div>
//       {/* Bottom Continue Button, fixed to bottom right */}
//       <div className="fixed right-12 bottom-12">
//         {step < messages.length - 1 && (
//           <button
//             onClick={handleContinue}
//             className="bg-lime-400 hover:bg-lime-500 text-gray-900 text-lg font-extrabold px-10 py-4 rounded-2xl shadow-lg transition"
//           >
//             CONTINUE
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HowDidYouHearStep from "../components/WelcomeFlow/HowDidYouHearStep";
import LearningReasonStep from "../components/WelcomeFlow/LearningReasonStep";
import ProficiencyStep from "../components/WelcomeFlow/ProficiencyStep";
import CourseOverviewStep from "../components/WelcomeFlow/CourseOverviewStep";
// Define all steps here (for progress & centralized logic)
const steps = [
  { key: "hdyhau",       component: HowDidYouHearStep,      progress: 0.18 },
  { key: "learningReason", component: LearningReasonStep,    progress: 0.38 },
  { key: "proficiency",  component: ProficiencyStep,         progress: 0.68 },
  { key: "courseOverview", component: CourseOverviewStep,    progress: 1.00 }
];

// Use a helper to get step index and data
function getStepInfo(param) {
  const idx = steps.findIndex(s => s.key === param) || 0;
  return { stepIndex: idx, ...steps[idx] };
}

export default function WelcomeFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  // Get step from URL or default to first
  const stepKey = params.get("welcomeStep") || steps[0].key;
  const { stepIndex, component: StepComponent, progress } = getStepInfo(stepKey);

  // Navigation logic for "continue" and back arrow
  const goToStep = (idx) => {
    navigate(`/welcome?welcomeStep=${steps[idx].key}`);
  };

  // Render progress bar, mascot, and the right step component
  return (
    <div className="min-h-screen bg-[#151f23] text-white px-4">
      {/* Progress Bar + Back */}
      <div className="flex items-center gap-4 pt-8 pb-4 max-w-4xl mx-auto">
        <button
          onClick={() => stepIndex > 0 && goToStep(stepIndex - 1)}
          disabled={stepIndex === 0}
          className="text-3xl text-cyan-300 hover:text-white font-bold px-2 disabled:opacity-30"
        >&larr;</button>
        <div className="flex-1">
          <div className="bg-gray-900 h-3 rounded-full w-full">
            <div
              className="bg-lime-400 h-3 rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto">
        <StepComponent 
          onContinue={() => stepIndex < steps.length - 1 && goToStep(stepIndex + 1)} 
        />
      </div>
    </div>
  );
}