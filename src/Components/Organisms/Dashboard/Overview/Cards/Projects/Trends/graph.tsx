import { ProCard } from "@ant-design/pro-components";
import { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Typography } from "../../../../../../Atoms";

const data = [
  {
    name: "Project A",
    uv: 4000,
    project: 2400,
    amt: 2400
  },
  {
    name: "Project B",
    uv: 3000,
    project: 1398,
    amt: 2210
  },
  {
    name: "Project C",
    uv: 2000,
    project: 9800,
    amt: 2290
  },
  {
    name: "Project D",
    uv: 2780,
    project: 3908,
    amt: 2000
  },
  {
    name: "Project E",
    uv: 1890,
    project: 4800,
    amt: 2181
  },
  {
    name: "Project F",
    uv: 2390,
    project: 3800,
    amt: 2500
  },
  {
    name: "Project G",
    uv: 3490,
    project: 4300,
    amt: 2100
  }
];


const ProjectTrendsGraph: FC = () => {
  const width = window.innerWidth;
  return (
    <ProCard
      title={(
        <Typography
          weight="bold"
          color="dark-main"
          size="normal">
          Project Trends
        </Typography>
      )}
      style={{ width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          width={width > 768 ? 600 : 300}
          height={200}
          data={data}
          margin={{
            top: 5,
            right: 30,
            // left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="project"
            stroke="#82ca9d"
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ProCard>
  );
}

export default ProjectTrendsGraph;