// src/routes/LevelsRoute.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const LEVEL_COUNT = 15;
const STORAGE_KEY = 'lms_levels_unlocked_v1_vertical';

// Format course ID to display name
const formatCourseName = (courseId) => {
  if (!courseId) return 'Course Map';
  return courseId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Level challenges data
const getLevelData = (levelId, courseId) => {
  const challenges = {
    'javascript-fundamentals': [
      {
        id: 1,
        title: 'Variables & Data Types',
        description: 'Create a function that returns the sum of two numbers',
        starterCode: '// Write a function called add that takes two parameters\nfunction add(a, b) {\n  // Your code here\n  \n}\n\n// Test your function\nconsole.log(add(5, 3)); // Should return 8',
        tests: [
          { input: [5, 3], expected: 8 },
          { input: [10, 20], expected: 30 },
          { input: [-5, 5], expected: 0 }
        ],
        language: 'javascript'
      },
      {
        id: 2,
        title: 'Conditionals',
        description: 'Write a function to check if a number is even or odd',
        starterCode: 'function isEven(num) {\n  // Return true if even, false if odd\n  \n}',
        tests: [
          { input: [4], expected: true },
          { input: [7], expected: false },
          { input: [0], expected: true }
        ],
        language: 'javascript'
      }
    ],
    'python-essentials': [
      {
        id: 1,
        title: 'Python Basics',
        description: 'Create a function that returns the square of a number',
        starterCode: 'def square(num):\n    # Your code here\n    pass\n\n# Test your function\nprint(square(5))  # Should return 25',
        tests: [
          { input: [5], expected: 25 },
          { input: [3], expected: 9 },
          { input: [0], expected: 0 }
        ],
        language: 'python'
      }
    ],
    default: [
      {
        id: levelId,
        title: `Level ${levelId} Challenge`,
        description: 'Complete this coding challenge',
        starterCode: '// Write your solution here\nfunction solution() {\n  \n}',
        tests: [],
        language: 'javascript'
      }
    ]
  };

  const courseChallenges = challenges[courseId] || challenges.default;
  return courseChallenges[levelId - 1] || courseChallenges[0] || challenges.default[0];
};

function LockIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 10V8a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * LevelsRoute
 * - Use as the element for your /levels route.
 * - Renders a premium vertical level map with left/right side panels.
 * - Level 1 appears at the bottom. On load it scrolls to the last unlocked level.
 */
export default function LevelsRoute({ courseId, onBack }) {
  const courseName = formatCourseName(courseId);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [unlocked, setUnlocked] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [1];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
      return [1];
    } catch {
      return [1];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
  }, [unlocked]);

  const levels = useMemo(
    () => Array.from({ length: LEVEL_COUNT }, (_, i) => ({ id: i + 1, title: `Level ${i + 1}` })),
    []
  );

  const isUnlocked = (id) => unlocked.includes(id);

  function handleEnterLevel(id) {
    if (!isUnlocked(id)) return;
    const levelData = getLevelData(id, courseId);
    setSelectedLevel({ ...levelData, id });
    setCode(levelData.starterCode);
    setOutput('');
    setTestResults([]);
  }

  function closeModal() {
    setSelectedLevel(null);
    setCode('');
    setOutput('');
    setTestResults([]);
  }

  function runCode() {
    try {
      setOutput('Running tests...');
      const results = [];
      
      // Simple test runner for JavaScript
      if (selectedLevel.language === 'javascript') {
        // Extract function from code and execute safely
        const funcMatch = code.match(/function\s+(\w+)/);
        if (!funcMatch) {
          setOutput('❌ Error: No function found in code');
          return;
        }
        
        const funcName = funcMatch[1];
        
        // Use Function constructor (safer than eval for educational purposes)
        const executeCode = new Function(
          'testInput',
          `${code}\nreturn ${funcName}(...testInput);`
        );
        
        selectedLevel.tests.forEach((test, idx) => {
          try {
            const result = executeCode(test.input);
            const passed = result === test.expected;
            results.push({
              test: idx + 1,
              passed,
              input: test.input,
              expected: test.expected,
              actual: result
            });
          } catch (err) {
            results.push({
              test: idx + 1,
              passed: false,
              error: err.message
            });
          }
        });
      }
      
      setTestResults(results);
      const allPassed = results.every(r => r.passed);
      setOutput(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
      
      if (allPassed) {
        markComplete(selectedLevel.id);
      }
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
      setTestResults([]);
    }
  }

  function markComplete(id) {
    const next = id + 1;
    setUnlocked((prev) => {
      const set = new Set(prev);
      if (!set.has(next) && next <= LEVEL_COUNT) set.add(next);
      return Array.from(set).sort((a, b) => a - b);
    });
  }

  // Layout constants for SVG
  const startY = 40;
  const step = 100;
  const totalHeight = startY + (LEVEL_COUNT - 1) * step;

  // Refs for scrolling
  const scrollContainerRef = useRef(null);

  // compute last unlocked (highest unlocked id)
  const lastUnlocked = useMemo(() => Math.max(...unlocked), [unlocked]);

  // Scroll to the last unlocked node on mount and when unlocked changes
  useEffect(() => {
    // small delay to ensure SVG nodes are rendered
    const id = `node-${lastUnlocked}`;
    const t = setTimeout(() => {
      const el = document.getElementById(id);
      if (el && scrollContainerRef.current) {
        // scroll so the node is centered in the visible area
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        // also nudge the container scrollTop for better centering in some browsers
        const container = scrollContainerRef.current;
        const rect = el.getBoundingClientRect();
        const cRect = container.getBoundingClientRect();
        const offset = rect.top - cRect.top - cRect.height / 2 + rect.height / 2;
        container.scrollTop += offset;
      }
    }, 120);
    return () => clearTimeout(t);
  }, [lastUnlocked]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              {courseId && onBack && (
                <button
                  onClick={onBack}
                  className="text-gray-400 hover:text-white transition"
                  title="Back to Dashboard"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 12H5M5 12l7 7m-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <h1 className="text-3xl font-semibold tracking-tight">{courseName}</h1>
            </div>
            <p className="text-gray-400 mt-1">
              {courseId 
                ? `Complete all levels to master ${courseName}` 
                : "Vertical progression — first level starts at the bottom"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-300">Progress</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </header>

        {/* Main layout: left panel, center map, right panel */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left panel */}
          <aside className="col-span-3">
            <div
              className="sticky top-6 bg-gray-800/70 rounded-2xl p-4 border border-gray-700 shadow-[0_10px_30px_rgba(2,6,23,0.6)] transform-gpu"
              style={{ transform: 'perspective(800px) translateZ(0)', backfaceVisibility: 'hidden' }}
            >
              <div className="mb-4">
                <div className="text-sm text-gray-400">Profile</div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center text-gray-900 font-bold">CS</div>
                  <div>
                    <div className="text-sm font-medium">Codify</div>
                    <div className="text-xs text-gray-400">Level player</div>
                  </div>
                </div>
              </div>

              <nav className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/40 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-indigo-500/80" /> <span className="text-sm">Learn</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" /> <span className="text-sm">Practice</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" /> <span className="text-sm">Leaderboards</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-400/80" /> <span className="text-sm">Quests</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-sky-400/80" /> <span className="text-sm">Shop</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-violet-400/80" /> <span className="text-sm">Profile</span>
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md bg-gray-700/30 hover:bg-gray-700 transition flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-gray-400/80" /> <span className="text-sm">More</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Center map */}
          <main className="col-span-6">
            <div className="relative bg-gradient-to-b from-gray-800/40 to-transparent rounded-2xl p-6 shadow-2xl overflow-hidden">
              <div className="absolute -left-28 -top-28 w-72 h-72 bg-gradient-to-tr from-indigo-700/20 via-teal-400/10 to-transparent rounded-full pointer-events-none blur-3xl" />

              <div
                ref={scrollContainerRef}
                className="w-full overflow-y-auto py-6"
                style={{ maxHeight: '72vh', scrollBehavior: 'smooth' }}
              >
                <div className="mx-auto" style={{ minWidth: 220 }}>
                  <svg
                    className="w-56 mx-auto"  
                    viewBox={`0 0 220 ${totalHeight + 80}`}
                    preserveAspectRatio="xMidYMin meet"
                    aria-hidden
                  >
                    <defs>
                      <linearGradient id="verticalPathGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.6" />
                      </linearGradient>
                    </defs>

                    {/* Bold visible path line (vertical) */}
                    <line
                      x1="110"
                      y1={startY}
                      x2="110"
                      y2={totalHeight}
                      stroke="url(#verticalPathGrad)"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />

                    {/* Subtle dashed guide */}
                    <line
                      x1="110"
                      y1={startY}
                      x2="110"
                      y2={totalHeight}
                      stroke="#374151"
                      strokeWidth="2"
                      strokeDasharray="6 10"
                      strokeLinecap="round"
                      opacity="0.28"
                    />

                    {/* Nodes rendered so the first level appears at the bottom */}
                    {levels.map((lvl, idx) => {
                      // place levels from bottom to top: idx 0 -> bottom
                      const cy = startY + (LEVEL_COUNT - 1 - idx) * step;
                      const unlockedFlag = isUnlocked(lvl.id);

                      return (
                        <g id={`node-${lvl.id}`} key={lvl.id} transform={`translate(110, ${cy})`}>
                          {/* Outer ring */}
                          <circle
                            r="36"
                            fill="transparent"
                            stroke={unlockedFlag ? '#0ea5a4' : '#374151'}
                            strokeWidth="2.5"
                            opacity={unlockedFlag ? 0.95 : 0.7}
                          />

                          {/* Node background */}
                          <defs>
                            <radialGradient id={`nodeGradV${lvl.id}`} cx="30%" cy="30%">
                              <stop offset="0%" stopColor={unlockedFlag ? '#ecfeff' : '#f3f4f6'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                              <stop offset="50%" stopColor={unlockedFlag ? '#06b6d4' : '#9ca3af'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                              <stop offset="100%" stopColor={unlockedFlag ? '#0ea5a4' : '#6b7280'} stopOpacity={unlockedFlag ? 0.95 : 0.9} />
                            </radialGradient>
                          </defs>

                          <circle r="28" fill={unlockedFlag ? `url(#nodeGradV${lvl.id})` : '#6b7280'} opacity={unlockedFlag ? 1 : 0.95} />

                          {/* Clickable button */}
                          <foreignObject x="-28" y="-28" width="56" height="56">
                            <div className="w-full h-full flex items-center justify-center">
                              <button
                                onClick={() => handleEnterLevel(lvl.id)}
                                title={unlockedFlag ? `Play ${lvl.title}` : `Locked`}
                                className={`w-14 h-14 rounded-full absolute flex items-center justify-center transition-transform transform ${unlockedFlag ? 'hover:scale-105' : 'opacity-85'}`}
                                style={{
                                  background: unlockedFlag ? 'linear-gradient(135deg,#0ea5a4 0%,#06b6d4 100%)' : '#4b5563',
                                  border: unlockedFlag ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.02)',
                                  boxShadow: unlockedFlag ? '0 6px 18px rgba(6,182,212,0.12)' : 'none',
                                }}
                              >

                                {/* {Lock icon} */}
                                  {!unlockedFlag && (
                            <foreignObject x="-16" y="-64" width="32" height="32" style={{ pointerEvents: 'none' }}>
                              <div
                                className="w-8 h-8 rounded-full relative z-10 bg-gray-700/70 flex items-center justify-center border border-gray-600/60"
                                style={{ opacity: 0.6 }}
                              >
                                <LockIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            </foreignObject>
                          )}

                                <span className={`text-sm font-semibold ${unlockedFlag ? 'text-white' : 'text-gray-200'}`}>{lvl.id}</span>
                              </button>
                            </div>
                          </foreignObject>

                          {/* Lock badge above the number (pointer-events none so it doesn't block clicks) */}

                          {/* {!unlockedFlag && (
                            <foreignObject x="-16" y="-64" width="32" height="32" style={{ pointerEvents: 'none' }}>
                              <div
                                className="w-8 h-8 rounded-full bg-gray-700/70 flex items-center justify-center border border-gray-600/60"
                                style={{ opacity: 0.6 }}
                              >
                                <LockIcon className="w-4 h-4 text-gray-300" />
                              </div>
                            </foreignObject>
                          )} */}

                          {/* Level label below */}
                            
                          {/* <text
                            x="0"
                            y="64"
                            textAnchor="middle"
                            className={`text-xs fill-current ${unlockedFlag ? 'text-gray-100' : 'text-gray-400'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                          >
                            {lvl.title}
                          </text> */}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </main>

          {/* Right panel */}
          <aside className="col-span-3">
            <div
              className="sticky top-6 bg-gray-800/70 rounded-2xl p-4 border border-gray-700 shadow-[0_10px_30px_rgba(2,6,23,0.6)] transform-gpu"
              style={{ transform: 'perspective(800px) translateZ(0)', backfaceVisibility: 'hidden' }}
            >
              <div className="mb-4">
                <div className="text-sm text-gray-400">Semifinals</div>
                <div className="mt-3 p-3 rounded-md bg-gray-800/40 border border-gray-700">
                  <div className="text-sm font-medium">You're ranked #4</div>
                  <div className="text-xs text-gray-400 mt-1">You're almost at the top 3!</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Daily Quests</div>
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-gray-800/40 border border-gray-700">
                    <div className="text-xs text-gray-300">Earn 50 XP</div>
                    <div className="text-sm font-medium text-gray-100">50 / 50</div>
                    <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                      <div className="h-2 bg-emerald-400" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-gray-800/40 border border-gray-700">
                    <div className="text-xs text-gray-300">Score 90% or higher in 3 lessons</div>
                    <div className="text-sm font-medium text-gray-100">3 / 3</div>
                    <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                      <div className="h-2 bg-amber-400" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-md bg-gray-800/40 border border-gray-700">
                    <div className="text-xs text-gray-300">Get 10 in a row correct in 4 lessons</div>
                    <div className="text-sm font-medium text-gray-100">4 / 4</div>
                    <div className="w-full h-2 bg-gray-700 rounded mt-2 overflow-hidden">
                      <div className="h-2 bg-rose-400" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    setUnlocked([1]);
                  }}
                  className="w-full px-3 py-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-sm text-gray-200"
                >
                  Reset Progress
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Code Editor Modal */}
        {selectedLevel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0f1419] rounded-2xl shadow-2xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">Level {selectedLevel.id}: {selectedLevel.title}</h2>
                  <p className="text-gray-400 mt-1">{selectedLevel.description}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white transition"
                  title="Close"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {/* Code Editor */}
                <div className="bg-[#1a2332] rounded-lg overflow-hidden border border-gray-700">
                  <div className="bg-[#141b24] px-4 py-2 flex items-center justify-between border-b border-gray-700">
                    <span className="text-sm text-gray-300 font-medium">
                      {selectedLevel.language === 'javascript' ? 'JavaScript' : 'Python'}
                    </span>
                    <button
                      onClick={runCode}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
                      </svg>
                      Run Code
                    </button>
                  </div>
                  <CodeMirror
                    value={code}
                    height="400px"
                    theme={oneDark}
                    extensions={selectedLevel.language === 'javascript' ? [javascript()] : [python()]}
                    onChange={(value) => setCode(value)}
                    className="text-base"
                  />
                </div>

                {/* Output Section */}
                {output && (
                  <div className="bg-[#1a2332] rounded-lg border border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Output</h3>
                    <div className="bg-[#141b24] rounded p-3 font-mono text-sm text-gray-200">
                      {output}
                    </div>
                  </div>
                )}

                {/* Test Results */}
                {testResults.length > 0 && (
                  <div className="bg-[#1a2332] rounded-lg border border-gray-700 p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Test Results</h3>
                    <div className="space-y-2">
                      {testResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-md border ${
                            result.passed
                              ? 'bg-emerald-900/20 border-emerald-700/50'
                              : 'bg-rose-900/20 border-rose-700/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-200">
                              Test {result.test}
                            </span>
                            <span
                              className={`text-sm font-semibold ${
                                result.passed ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {result.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="mt-2 text-xs font-mono text-gray-400">
                              {result.error ? (
                                <div>Error: {result.error}</div>
                              ) : (
                                <>
                                  <div>Input: {JSON.stringify(result.input)}</div>
                                  <div>Expected: {JSON.stringify(result.expected)}</div>
                                  <div>Got: {JSON.stringify(result.actual)}</div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hints Section */}
                <div className="bg-[#1a2332] rounded-lg border border-gray-700 p-4">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">💡 Hints</h3>
                  <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                    <li>Read the problem description carefully</li>
                    <li>Test your code with the provided examples</li>
                    <li>Make sure your function returns the correct value</li>
                  </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-[#141b24]">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                >
                  Close
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                    Previous Level
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      if (selectedLevel.id < LEVEL_COUNT) {
                        setTimeout(() => handleEnterLevel(selectedLevel.id + 1), 100);
                      }
                    }}
                    className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    Next Level
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}