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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-200">
        <p className="text-sm font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-lg font-extrabold" style={{ color: payload[0].color }}>
          分数: {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

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
      <div className="bg-emerald-50/70 rounded-xl p-3 border-2 border-emerald-200">
        <div className="text-sm font-bold text-emerald-700 mb-2 text-center">正向价值</div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={posChartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 10]} 
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fill="#10b981"
                fillOpacity={0.25}
                isAnimationActive={!disableAnimation}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-rose-50/70 rounded-xl p-3 border-2 border-rose-200">
        <div className="text-sm font-bold text-rose-700 mb-2 text-center">负向行为</div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={negChartData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 10]} 
                tick={{ fill: '#94a3b8', fontSize: 9 }}
              />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="#f43f5e"
                fillOpacity={0.25}
                isAnimationActive={!disableAnimation}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SingleRadar;
