'use client';

import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Instrument } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';


const COLORS: Record<string, string> = {
  'Preventative Maintenance': 'hsl(215 65% 48%)',
  'PM': 'hsl(215 65% 48%)',
  'AMC': 'hsl(28 65% 50%)',
  'Calibration': 'hsl(155 50% 45%)',
  'Validation': 'hsl(265 55% 52%)',
  'Daily': 'hsl(195 55% 50%)',
  'Weekly': 'hsl(335 55% 52%)',
  'Monthly': 'hsl(40 60% 48%)',
  '3 Months': 'hsl(255 50% 48%)',
  '6 Months': 'hsl(10 55% 50%)',
  '1 Year': 'hsl(135 50% 42%)',
};

const Chart = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstruments = async () => {
      const [{ data: instrumentsData }, { data: configsData }] = await Promise.all([
        supabase.from('instruments').select('*'),
        supabase.from('maintenance_configurations').select('maintenance_type'),
      ]);
      if (instrumentsData) setInstruments(instrumentsData);
      if (configsData) setConfigs(configsData);
      setIsLoading(false);
    };

    fetchInstruments();
  }, []);

  const data = useMemo(() => {
    // Prefer schedule configurations for distribution; fallback to instrument maintenanceType
    if (configs && configs.length > 0) {
      const typeCounts = configs.reduce((acc, c) => {
        const type = (c as any).maintenance_type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
    }

    if (!instruments) return [];
    const typeCounts = instruments.reduce((acc, instrument) => {
      const type = instrument.maintenanceType || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [instruments, configs]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-full" />;
  }

  return (
    <div className="w-full h-[300px]">
      <PieChart width={400} height={300} style={{ margin: 'auto' }}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${entry.name}`}
              fill={COLORS[entry.name] || `hsl(${(idx * 53) % 360} 45% 48%)`}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: 'var(--radius)',
          }}
        />
        <Legend />
      </PieChart>
    </div>
  );
};

export function InstrumentStatusChart() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-3 transition-all hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-headline">Instrument Status</CardTitle>
        <CardDescription>Distribution of instrument operational status.</CardDescription>
      </CardHeader>
      <CardContent>
        {isClient ? <Chart /> : <Skeleton className="w-full h-[300px] rounded-full" />}
      </CardContent>
    </Card>
  );
}
