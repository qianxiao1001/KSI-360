import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { POSITIVE_METRICS, NEGATIVE_METRICS } from '../constants';

interface SingleRadarProps {
  posScores: Record<string, number>;
  negScores: Record<string, number>;
  disableAnimation?: boolean;
}

const SingleRadar = ({ 
  posScores, 
  negScores, 
  disableAnimation
}: SingleRadarProps) => {
  const posChartData = POSITIVE_METRICS.map((m, i) => ({
    subject: `P${i+1}`,
    fullLabel: m.title,
    value: posScores[m.title] || 0,
    fullMark: 10,
  }));

  const negChartData = NEGATIVE_METRICS.map((m, i) => ({
    subject: `N${i+1}`,
    fullLabel: m.title,
    value: negScores[m.title] || 0,
    fullMark: 10,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-100">
        <div className="text-sm font-bold text-emerald-800 mb-2 text-center">正向价值</div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={posChartData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={2}
                fill="#2563eb"
                fillOpacity={0.4}
                isAnimationActive={!disableAnimation}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
        <div className="text-sm font-bold text-rose-800 mb-2 text-center">负向行为</div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={negChartData}>
              <PolarGrid />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#e11d48', fontSize: 10, fontWeight: 600 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 10]} />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#e11d48"
                strokeWidth={2}
                fill="#e11d48"
                fillOpacity={0.4}
                isAnimationActive={!disableAnimation}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SingleRadar;
