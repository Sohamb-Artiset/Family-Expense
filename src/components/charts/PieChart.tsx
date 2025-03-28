
import React, { useState } from "react";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from "recharts";
import { CategoryInsight } from "@/types";
import { cn } from "@/lib/utils";

interface PieChartProps {
  data?: CategoryInsight[];
  title?: string;
  subtitle?: string;
  width?: number;
  height?: number;
  containerClassName?: string;
}

const COLORS = ["#4DD4C4", "#F87171", "#60A5FA", "#F59E0B", "#A78BFA"];

const PieChart: React.FC<PieChartProps> = ({ 
  data = [], 
  title, 
  subtitle, 
  width, 
  height, 
  containerClassName 
}) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full animate-fade-in">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <div className="bg-card/50 rounded-lg p-4 h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart width={width} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              innerRadius={60}
              outerRadius={80}
              dataKey="amount"
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1e1e1e', 
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
              }}
              formatter={(value, name, props) => {
                const { payload } = props;
                return [`$${value}`, payload.category];
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
        
        <div className={cn("absolute bottom-4 left-4 right-4", containerClassName)}>
          <div className="flex flex-wrap justify-center gap-4">
            {data.map((category, index) => (
              <div 
                key={category.category} 
                className="flex items-center gap-2"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-xs text-muted-foreground">
                  {category.category}: {category.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
