import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface StatCardProps {
  title: string;
  value: string;
  trend?: number;
  trendDesc?: string;
  trendDirection?: string;
  desc?: string;
  className?: string;
  currency?: string;
  icon?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionTooltip?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  trend, 
  trendDesc,
  trendDirection,
  desc,
  className,
  currency,
  icon,
  actionIcon,
  onAction,
  actionTooltip
}) => {
  const isTrendPositive = trendDirection !== "down" && trend && trend > 0;
  
  return (
    <div className={cn("stat-card", className)}>
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="flex items-center gap-2">
          {actionIcon && onAction && (
            actionTooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" onClick={onAction}>
                      {actionIcon}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{actionTooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0.5" onClick={onAction}>
                {actionIcon}
              </Button>
            )
          )}
          {icon && <div>{icon}</div>}
        </div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      
      {trend ? (
        <div className="flex items-center gap-1 mt-1">
          {isTrendPositive ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={cn(
            "text-xs",
            isTrendPositive ? "text-green-500" : "text-red-500"
          )}>
            {Math.abs(trend)}% {trendDesc || "from last month"}
          </span>
        </div>
      ) : desc ? (
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      ) : null}
    </div>
  );
};

export default StatCard;
