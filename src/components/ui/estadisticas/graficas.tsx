"use client";
import React from 'react';
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Area, AreaChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Pie, PieChart, Cell
} from 'recharts';

export interface ChartData {
  lugar: string;
  CantidadReal: number;
  cantidadEsperada: number;
  [key: string]: any;
}

interface ChartProps {
  datos: ChartData[];
  valorx?: string;
  valory?: string;
  valory2?: string;
  nombreLeyenda?: string;
  nombreLeyenda2?: string;
}

const COLORS = ['#6b48ff', '#1ee3cf', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ChartWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
    <ResponsiveContainer width="100%" height="100%">
      {children as React.ReactElement}
    </ResponsiveContainer>
  </div>
);

export const SimpleBarCharts: React.FC<ChartProps> = ({ 
  datos, valorx, valory, valory2, nombreLeyenda, nombreLeyenda2 
}) => (
  <ChartWrapper>
    <BarChart data={datos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="4 1 2" />
      <XAxis dataKey={valorx} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={valory} fill="#6b48ff" name={nombreLeyenda || valory} />
      <Bar dataKey={valory2} fill="#1ee3cf" name={nombreLeyenda2 || valory2} />
    </BarChart>
  </ChartWrapper>
);

export const StackedAreaCharts: React.FC<ChartProps> = ({ datos, valorx, valory, valory2 }) => (
  <ChartWrapper>
    <AreaChart data={datos} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={valorx} />
      <YAxis />
      <Tooltip />
      <Area type="monotone" dataKey={valory} stackId="1" stroke='#8884d8' fill="#8884d8" name="Real" />
      <Area type="monotone" dataKey={valory2} stackId="1" stroke='#82caed' fill="#fad3cf" name="Meta" />
    </AreaChart>
  </ChartWrapper>
);

export const SimpleRadarChart: React.FC<ChartProps> = ({ datos, valorx, valory, valory2 }) => (
  <ChartWrapper>
    <RadarChart outerRadius="80%" data={datos}>
      <PolarGrid /><PolarAngleAxis dataKey={valorx} /><PolarRadiusAxis /><Tooltip />
      <Radar name="Real" dataKey={valory} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      <Radar name="Meta" dataKey={valory2} stroke="#82caed" fill="#82caed" fillOpacity={0.6} />
      <Legend />
    </RadarChart>
  </ChartWrapper>
);

export const SimpleBarCharts1: React.FC<ChartProps> = ({ datos, valorx, valory, nombreLeyenda }) => (
  <ChartWrapper>
    <BarChart data={datos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="4 1 2" />
      <XAxis dataKey={valorx} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey={valory} fill="#6b48ff" name={nombreLeyenda || valory} />
    </BarChart>
  </ChartWrapper>
);

export const DoublePieChart: React.FC<ChartProps> = ({ datos, valorx, valory, valory2 }) => (
  <ChartWrapper>
    <PieChart>
      <Pie data={datos} dataKey={valory} nameKey={valorx} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
        {datos.map((_, index) => <Cell key={`c1-${index}`} fill={COLORS[index % COLORS.length]} />)}
      </Pie>
      {valory2 && <Pie data={datos} dataKey={valory2} nameKey={valorx} cx="50%" cy="50%" innerRadius={100} outerRadius={130} fill="#82ca9d" label fillOpacity={0.4} />}
      <Tooltip /><Legend />
    </PieChart>
  </ChartWrapper>
);

export const GraficaAreasPorAnio: React.FC<{ datos: any[]; valorx: string; areas: string[] }> = ({ 
  datos, 
  valorx, 
  areas 
}) => {
  const PALETA_COLORES = [
    '#6b48ff', '#1ee3cf', '#FFBB28', '#FF8042', '#ff427f', 
    '#3298dc', '#48c774', '#718096', '#a0aec0'
  ];

  return (
    <ChartWrapper>
      <BarChart data={datos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="4 1 2" />
        <XAxis dataKey={valorx} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        {areas.map((nombreArea, index) => (
          <Bar 
            key={nombreArea} 
            dataKey={nombreArea} 
            fill={PALETA_COLORES[index % PALETA_COLORES.length]} 
            name={nombreArea} 
          />
        ))}
      </BarChart>
    </ChartWrapper>
  );
};
