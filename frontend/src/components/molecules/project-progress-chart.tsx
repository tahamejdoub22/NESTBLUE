"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { cn } from "@/lib/utils";
import { fadeInUp, transitions } from "@/lib/motion";
import { Target, TrendingUp } from "lucide-react";

export interface ProjectProgressData {
  name: string;
  progress: number;
  color?: string;
}

export interface ProjectProgressChartProps {
  data: ProjectProgressData[];
  className?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 z-50">
        <p className="text-xs font-semibold text-foreground mb-1">
          {data.name}
        </p>
        <p className="text-sm font-bold text-primary">
          {data.progress}% Complete
        </p>
      </div>
    );
  }
  return null;
};

export function ProjectProgressChart({ data, className }: ProjectProgressChartProps) {
  const chartData = useMemo(() => {
    const opacities = [1, 0.8, 0.6, 0.4, 0.3];
    return data.map((item, index) => ({
      ...item,
      fill: item.color || `hsl(var(--primary) / ${opacities[index % opacities.length]})`,
      innerRadius: 20 + index * 15,
      outerRadius: 30 + index * 15,
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <Card className={className}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.default}
    >
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="w-full h-80 min-w-0 min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={320}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="80%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  dataKey="progress"
                  cornerRadius={10}
                  fill={(entry: any) => entry.fill}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => (
                    <span className="text-xs text-muted-foreground">
                      {value} ({entry.payload.progress}%)
                    </span>
                  )}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


