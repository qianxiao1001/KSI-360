import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { AggregatedData } from '../types';
import { POSITIVE_QUESTIONS, NEGATIVE_QUESTIONS } from '../constants';

interface RadarViewProps {
  data: AggregatedData;
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

const SimpleRadar = ({ 
  title, 
  data, 
  color, 
  maxDomain,
  disableAnimation
}: { 
  title: string, 
  data: any[], 
  color: string,
  maxDomain: number,
  disableAnimation?: boolean
}) => {
  return (
    <div className="flex flex-col h-full">
      <h4 className="text-center font-bold text-slate-700 mb-2">{title}</h4>
      <div className="flex-1 w-full min-h-[280px] md:min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="55%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#475569', fontSize: 7, fontWeight: 600 }}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, maxDomain]} 
              tick={{ fill: '#94a3b8', fontSize: 8 }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={color}
              fillOpacity={0.25}
              isAnimationActive={!disableAnimation}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const RadarView: React.FC<RadarViewProps> = ({ data, disableAnimation }) => {
  const posChartData = POSITIVE_QUESTIONS.map((q, i) => ({
    subject: q,
    value: data.avgPos[q],
    fullMark: 10,
  }));

  const negChartData = NEGATIVE_QUESTIONS.map((q, i) => ({
    subject: q,
    value: data.avgNeg[q],
    fullMark: 10,
  }));

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-emerald-50/70 rounded-xl p-3 md:p-4 border-2 border-emerald-200">
          <SimpleRadar 
            title="🟢 正向价值雷达" 
            data={posChartData} 
            color="#10b981"
            maxDomain={10}
            disableAnimation={disableAnimation}
          />
        </div>
        <div className="bg-rose-50/70 rounded-xl p-3 md:p-4 border-2 border-rose-200">
          <SimpleRadar 
            title="🔴 负向行为警示" 
            data={negChartData} 
            color="#f43f5e"
            maxDomain={10}
            disableAnimation={disableAnimation}
          />
        </div>
      </div>
    </div>
  );
};
