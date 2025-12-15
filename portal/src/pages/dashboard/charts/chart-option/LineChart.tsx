import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// chart option components
const LineChart = ({ chartData }: any) => {
  
const formattedChartData = chartData?.message

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
    categories: formattedChartData?.map((item: any) => item?.day_name),
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
      data: formattedChartData?.map((item: any) => item?.total_sales),
    },
  ],
};

  return (
    <div className="">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default LineChart;

