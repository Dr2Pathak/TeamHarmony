'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';

interface SpiderChartData {
  category: string;
  value: number;
}

interface SpiderChartProps {
  data?: SpiderChartData[];
}

export function SpiderChart({ data }: SpiderChartProps) {
  const chartData = data && data.length > 0 ? data : [
    { category: 'Communication', value: 0 },
    { category: 'Collaboration', value: 0 },
    { category: 'Adaptability', value: 0 },
    { category: 'Reliability', value: 0 },
    { category: 'Innovation', value: 0 },
  ];

  return (
    <div className="w-full h-96 flex items-center justify-center" id="spider-chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
          <PolarGrid
            stroke="#e5e7eb"
            style={{ stroke: 'var(--color-border)' }}
          />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: 'var(--color-text)', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'var(--color-text)', fontSize: 11 }}
          />
          <Radar
            name="Team Score"
            dataKey="value"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.5}
            isAnimationActive={true}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.5rem',
              color: 'var(--color-text)',
            }}
            formatter={(value) => `${value}%`}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
