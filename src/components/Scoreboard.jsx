import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function formatPercent(num) {
  return `${Math.round(num * 100)}%`;
}

/**
 * Estimate leaderboard position based on accuracy.
 * This is a mock function.
 * @param {number} accuracy - 0..1
 * @returns {string}
 */
function estimateLeaderboardPosition(accuracy) {
  if (accuracy >= 0.95) return 'Top 1%';
  if (accuracy >= 0.9) return 'Top 5%';
  if (accuracy >= 0.8) return 'Top 15%';
  if (accuracy >= 0.7) return 'Top 30%';
  if (accuracy >= 0.5) return 'Top 60%';
  return 'Below Average';
}

export default function Scoreboard({ correct, total, streak, history }) {
  const accuracy = total > 0 ? correct / total : 0;
  const [animateScore, setAnimateScore] = useState(false);

  useEffect(() => {
    setAnimateScore(true);
    const timer = setTimeout(() => setAnimateScore(false), 300);
    return () => clearTimeout(timer);
  }, [correct]);

  return (
    <div
      aria-label="Scoreboard"
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-card rounded-lg select-none"
    >
      <div className="flex items-baseline space-x-2 text-textPrimary font-semibold text-lg sm:text-xl">
        <span>🎯 BAPE LC TRAINER</span>
        <span className={`ml-4 ${animateScore ? 'animate-bounce-scale' : ''}`}>
          Score: {correct} / {total}
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-textMuted text-sm">
        <span>
          Accuracy: <span className="text-textPrimary">{formatPercent(accuracy)}</span>
        </span>
        <span>
          Streak: <span className="text-textPrimary">{streak}</span>
        </span>
        <span>
          Leaderboard: <span className="text-camoGreen font-semibold">{estimateLeaderboardPosition(accuracy)}</span>
        </span>
      </div>
      {history && history.length > 1 && (
        <div className="w-full sm:w-64 h-16 mt-3 sm:mt-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <XAxis dataKey="index" hide />
              <YAxis domain={[0, 1]} hide />
              <Tooltip
                formatter={(value) => `${Math.round(value * 100)}%`}
                labelFormatter={(label) => `Attempt #${label + 1}`}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#4a6741"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
