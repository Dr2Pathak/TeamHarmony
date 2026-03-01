'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts'

interface StabilityData {
  name: string
  score: number
}

interface StabilityChartProps {
  data: StabilityData[]
  title?: string
}

function getBarColor(score: number): string {
  if (score >= 65) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#ef4444'
}

export function StabilityChart({ data, title }: StabilityChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 60)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}
          />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.score)} />
            ))}
            <LabelList
              dataKey="score"
              position="right"
              formatter={(value: number) => `${value}%`}
              style={{ fill: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
