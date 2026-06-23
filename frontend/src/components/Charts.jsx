import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * Charts.jsx (Reusable)
 *
 * Props:
 * - type: "bar" | "line" | "pie"
 * - data: array
 * - xKey: string (clé axe X)
 * - dataKey: string (clé valeur)
 * - colors: array (optional)
 */

const DEFAULT_COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-800 p-3 rounded-xl shadow-xl text-xxs font-semibold">
        {label && <p className="mb-1 text-slate-400 font-bold">{label}</p>}
        <p className="flex items-center gap-1.5">
          <span 
            className="w-2 h-2 rounded-full inline-block" 
            style={{ backgroundColor: payload[0].color || payload[0].payload.fill || "#4f46e5" }} 
          />
          <span>{payload[0].name || "Valeur"}: </span>
          <span className="font-bold text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Charts({
  type = "bar",
  data = [],
  xKey = "name",
  dataKey = "value",
  colors = DEFAULT_COLORS,
  height = 300,
}) {
  // PIE CHART
  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie 
            data={data} 
            dataKey={dataKey} 
            nameKey={xKey} 
            outerRadius={100}
            innerRadius={60}
            paddingAngle={3}
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell
                key={index}
                fill={colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // LINE CHART
  if (type === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#4f46e5", strokeWidth: 2, fill: "#fff" }}
            activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2, fill: "#4f46e5" }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // DEFAULT = BAR CHART
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={11} 
          tickLine={false} 
          axisLine={false} 
          dx={-10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey={dataKey}
          fill="#4f46e5"
          radius={[6, 6, 0, 0]}
          maxBarSize={45}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.fill || colors[index % colors.length]} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}