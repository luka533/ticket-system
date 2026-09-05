"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: {
    date: string;
    label: string;
    created: number;
    closed: number;
  }[];
};

function TicketActivityChart({ data }: Props) {
  return (
    <div className="h-65 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={30}
            fontSize={12}
          />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="created"
            name="Created"
            fill="var(--chart-1)"
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="closed"
            name="Closed"
            fill="var(--chart-2)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TicketActivityChart;
