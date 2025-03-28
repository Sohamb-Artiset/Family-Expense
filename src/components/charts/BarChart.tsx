
import React from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChartData } from "@/types";

interface BarChartProps {
  data: ChartData[];
  title?: string;
  subtitle?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, subtitle }) => {
  return (
    <div className="w-full h-full animate-fade-in">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <div className="bg-card/50 rounded-lg p-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#999", fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#999", fontSize: 12 }}
              tickFormatter={(value) => {
                if (value === 0) return "0";
                if (value <= 650) return "650";
                if (value <= 1300) return "1300";
                if (value <= 1950) return "1950";
                if (value <= 2600) return "2600";
                return value.toString();
              }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e1e1e', 
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
              labelStyle={{ color: '#fff' }}
              itemStyle={{ color: '#3B82F6' }}
              formatter={(value) => [`$${value}`, "amount"]}
            />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]} 
              fill="url(#barGradient)" 
              animationDuration={1500}
              barSize={50}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChart;
