import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const AnalyticsBarChart = ({
  labels,
  data,
  label
}: {
  labels: string[];
  data: number[];
  label: string;
}) => (
  <Bar
    data={{
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: ["#1e8f6d", "#f59e0b", "#0f766e", "#0f172a"]
        }
      ]
    }}
    options={{
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      }
    }}
  />
);
