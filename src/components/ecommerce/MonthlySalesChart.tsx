import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState } from "react";

export interface TolaWisePledge {
  tola_name: string;
  total_amount: number;
}

interface MonthlySalesChartProps {
  tolWiseData: TolaWisePledge[];
}

export default function MonthlySalesChart({
  tolWiseData,
}: MonthlySalesChartProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ✅ categories = tola names
  const categories = tolWiseData.map((t) => t.tola_name);

  // ✅ data = pledge amounts
  const series = [
    {
      name: "Total Pledge",
      data: tolWiseData.map((t) => Math.max(0, Number(t.total_amount) || 0)),
    },
  ];

  // ✅ find max value for better scaling
  const maxValue = Math.max(...tolWiseData.map((t) => t.total_amount), 0);
  const roundedMax = Math.ceil(maxValue / 10000) * 10000; // round to nearest 10k

  const options: ApexOptions = {
    colors: ["#4F46E5"], // Tailwind indigo-600
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350, // ✅ more space
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%", // ✅ wider bars
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      labels: {
        rotate: -30, // ✅ angled labels for readability
        style: { fontSize: "12px" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: {
      show: false, // ✅ only one series
    },
    yaxis: {
      min: 0,
      max: roundedMax,
      tickAmount: 5,
      labels: {
        formatter: (val: number) => new Intl.NumberFormat("en-IN").format(val),
      },
    },
    grid: {
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      strokeDashArray: 4,
    },
    fill: { opacity: 0.9 },
    tooltip: {
      y: {
        formatter: (val: number) =>
          `₹${new Intl.NumberFormat("en-IN").format(val)}`,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Tol wise Target
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <Chart options={options} series={series} type="bar" height={300} />
        </div>
      </div>
    </div>
  );
}
