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
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, maxDomain]} />
            <Radar
              name="Score"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              fill={color}
              fillOpacity={0.4}
              isAnimationActive={!disableAnimation}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const RadarView: React.FC<RadarViewProps> = ({ data, disableAnimation }) => {
  const posChartData = POSITIVE_QUESTIONS.map((q, i) => ({
    subject: `P${i+1} ${q.split('】')[1].split('(')[0]}`, // Shorten label
    fullLabel: q,
    value: data.avgPos[q],
    fullMark: 10,
  }));

  const negChartData = NEGATIVE_QUESTIONS.map((q, i) => ({
    subject: `N${i+1} ${q.split('】')[1].split('(')[0]}`, // Shorten label
    fullLabel: q,
    value: data.avgNeg[q],
    fullMark: 10,
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
        <SimpleRadar 
          title="🔵 正向价值雷达 (Avg Score)" 
          data={posChartData} 
          color="#2563eb"
          maxDomain={10}
          disableAnimation={disableAnimation}
        />
      </div>
      <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
        <SimpleRadar 
          title="🔴 负向行为警示 (Frequency)" 
          data={negChartData} 
          color="#e11d48"
          maxDomain={10}
          disableAnimation={disableAnimation}
        />
      </div>
    </div>
  );
};