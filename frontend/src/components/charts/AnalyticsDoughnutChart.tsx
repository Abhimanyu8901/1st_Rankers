import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export const AnalyticsDoughnutChart = ({
  labels,
  data
}: {
  labels: string[];
  data: number[];
}) => (
  <Doughnut
    data={{
      labels,
      datasets: [
        {
          data,
          backgroundColor: ["#1e8f6d", "#f59e0b", "#ef4444"]
        }
      ]
    }}
  />
);
