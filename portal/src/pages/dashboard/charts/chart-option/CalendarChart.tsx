import Highcharts from "highcharts";
import HighchartsHeatmap from "highcharts/modules/heatmap";
import { useEffect } from "react";

// Initialize the heatmap module
HighchartsHeatmap(Highcharts);

// Sample sales data for July 2023
const salesData = [
  { date: "2023-07-01", sales: 1200 },
  { date: "2023-07-02", sales: 2200 },
  { date: "2023-07-03", sales: 2250 },
  { date: "2023-07-04", sales: 850 },
  { date: "2023-07-05", sales: 2000 },
  { date: "2023-07-06", sales: 2100 },
  { date: "2023-07-07", sales: 1150 },
  { date: "2023-07-08", sales: 1250 },
  { date: "2023-07-09", sales: 2200 },
  { date: "2023-07-10", sales: 1000 },
  { date: "2023-07-11", sales: 1100 },
  { date: "2023-07-12", sales: 2050 },
  { date: "2023-07-13", sales: 1200 },
  { date: "2023-07-14", sales: 1300 },
  { date: "2023-07-15", sales: 950 },
  { date: "2023-07-16", sales: 1000 },
  { date: "2023-07-17", sales: 1100 },
  { date: "2023-07-18", sales: 1150 },
  { date: "2023-07-19", sales: 1250 },
  { date: "2023-07-20", sales: 1300 },
  { date: "2023-07-21", sales: 2050 },
  { date: "2023-07-22", sales: 2100 },
  { date: "2023-07-23", sales: 1200 },
  { date: "2023-07-24", sales: 1150 },
  { date: "2023-07-25", sales: 2000 },
  { date: "2023-07-26", sales: 1050 },
  { date: "2023-07-27", sales: 1150 },
  { date: "2023-07-28", sales: 2200 },
  { date: "2023-07-29", sales: 2250 },
  { date: "2023-07-30", sales: 2300 },
  { date: "2023-07-31", sales: 2150 },
];

// Weekday names for the x-axis
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Function to generate sales chart data for the heatmap
const generateSalesChartData = (data: any) => {
  const firstWeekday = new Date(data[0].date).getDay();
  const monthLength = data.length;
  const lastElement = data[monthLength - 1].date;
  const lastWeekday = new Date(lastElement).getDay();
  const lengthOfWeek = 6;
  const emptyTilesFirst = firstWeekday;
  const chartData = [];

  // Empty tiles before the first day
  for (let emptyDay = 0; emptyDay < emptyTilesFirst; emptyDay++) {
    chartData.push({
      x: emptyDay,
      y: 5,
      value: null,
      date: null,
      custom: { empty: true },
    });
  }

  // Populate with sales data
  for (let day = 1; day <= monthLength; day++) {
    const date = data[day - 1].date;
    const xCoordinate = (emptyTilesFirst + day - 1) % 7;
    const yCoordinate = Math.floor((firstWeekday + day - 1) / 7);
    const id = day;
    const sales = data[day - 1].sales;

    chartData.push({
      x: xCoordinate,
      y: 5 - yCoordinate,
      value: sales,
      date: new Date(date).getTime(),
      custom: { monthDay: id },
    });
  }

  const emptyTilesLast = lengthOfWeek - lastWeekday;
  for (let emptyDay = 1; emptyDay <= emptyTilesLast; emptyDay++) {
    chartData.push({
      x: (lastWeekday + emptyDay) % 7,
      y: 0,
      value: null,
      date: null,
      custom: { empty: true },
    });
  }
  return chartData;
};

// Main component
const CalendarChart = () => {
  useEffect(() => {
    const salesChartData = generateSalesChartData(salesData);

    //@ts-ignore
    Highcharts.chart("container", {
      chart: { type: "heatmap" },
      title: { text: "Restaurant Sales for July 2023", align: "left" },
      subtitle: {
        text: "Daily sales amount throughout the month",
        align: "left",
      },
      accessibility: { landmarkVerbosity: "one" },
      tooltip: {
        enabled: true,
        outside: true,
        zIndex: 20,
        headerFormat: "",
        pointFormat:
          "{#unless point.custom.empty}{point.date:%A, %b %e, %Y}: <b>৳{point.value}</b>{/unless}",
        nullFormat: "No data",
      },
      xAxis: {
        categories: weekdays,
        opposite: true,
        lineWidth: 26,
        offset: 13,
        lineColor: "rgba(27, 26, 37, 0.2)",
        labels: {
          rotation: 0,
          y: 20,
          style: { textTransform: "uppercase", fontWeight: "bold" },
        },
        accessibility: {
          description: "weekdays",
          rangeDescription:
            "X Axis shows all 7 days of the week, starting with Sunday.",
        },
      },
      yAxis: {
        min: 0,
        max: 5,
        visible: false,
        accessibility: { description: "weeks" },
      },
      legend: { align: "right", layout: "vertical", verticalAlign: "middle" },
      colorAxis: {
        min: 0,
        stops: [
          [0.0, "#FF0000"], // Red for lowest sales
          [0.2, "#9a3412"], // Orange for low sales
          [0.4, "#d97706"], // Yellow for moderate sales
          [0.6, "#00C48C"], // Light Teal for above average sales
          [1.0, "#009168"], // Teal for highest sales
        ],
        labels: { format: "৳{value}" },
      },
      series: [
        {
          keys: ["x", "y", "value", "date", "id"],
          data: salesChartData,
          nullColor: "rgba(196, 196, 196, 0.2)",
          borderWidth: 2,
          borderColor: "rgba(196, 196, 196, 0.2)",
          dataLabels: [
            {
              enabled: true,
              format: "{#unless point.custom.empty}৳{point.value:.0f}{/unless}",
              style: {
                textOutline: "none",
                fontWeight: "normal",
                fontSize: "13px",
              },
              y: 4,
            },
            {
              enabled: true,
              align: "left",
              verticalAlign: "top",
              format:
                "{#unless point.custom.empty}{point.custom.monthDay}{/unless}",
              backgroundColor: "whitesmoke",
              padding: 2,
              style: {
                textOutline: "none",
                color: "rgba(70, 70, 92, 1)",
                fontSize: "0.8rem",
                fontWeight: "bold",
                opacity: 0.5,
              },
              x: 1,
              y: 1,
            },
          ],
        },
      ],
    });
  }, []);

  return <div id="container" style={{ height: "500px", width: "100%" }}></div>;
};

export default CalendarChart;
