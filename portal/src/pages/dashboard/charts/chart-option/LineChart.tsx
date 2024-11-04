import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// chart option components
const LineChart = ({ chartData }: any) => {
  console.log({ chartData });
  return (
    <div className="">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default LineChart;

// Chart configuration for last week's sales
const chartOptions = {
  chart: {
    type: "line",
  },
  title: {
    text: "Last Week Sales",
    style: {
      color: "var(--textColor)",
      fontSize: "16px",
      fontWeight: 600,
    },
  },
  xAxis: {
    // categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    categories: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  yAxis: {
    title: {
      text: "Sales Price",
      // text: "Sales Price (৳)",
    },
  },
  // chart tooltip
  tooltip: {
    backgroundColor: "var(--whiteColor)",
    style: {
      color: "var(--textColor)",
    },

    // tooltip format
    // headerFormat: '<span style="font-size:11px">{series.name}</span><br>',

    // // tooltip point format
    pointFormat:
      '<span style="color:{point.color}"></span>Sales : <b>৳{point.y}</b><br/>',
  },
  series: [
    {
      name: "Sales",
      data: [120, 440, 780, 330, 790, 800, 980],
    },
  ],
};
