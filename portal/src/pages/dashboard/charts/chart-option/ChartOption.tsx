import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// chart option components
const ChartOption = ({ chartData }: any) => {

  const formattedChartData = chartData?.message;

  const customColors = [
    "#7B61FF", // Violet
    "#00C48C", // Green
    "#FF647C", // Red
    "#4B9CFF", // Blue
    "#FFC542", // Yellow
  ];

  // chart options
  const chartOptions = {
    // chart design
    chart: {
      type: "column",
      backgroundColor: "var(--whiteColor)",
      borderRadius: 10,
      spacing: [5, 5, 5, 5],
    },

    // colors
    colors: customColors,

    // chart title
    title: {
      text: `Top 5 Foods`,
      style: {
        color: "var(--textColor)",
        fontSize: "16px",
        fontWeight: 600,
      },
    },

    // chart x-axis
    xAxis: {
      categories: formattedChartData?.map((item: any) => item?.item_name),
      crosshair: true,
      accessibility: {
        description: "Food Sales",
      },
      labels: {
        style: {
          color: "var(--textColor)",
        },
      },
      lineColor: "var(--textColor)",
    },

    // chart y-axis
    yAxis: {
      title: {
        text: "Sales Percentage",
        style: {
          color: "var(--textColor)",
        },
      },
      labels: {
        style: {
          color: "var(--textColor)",
        },
      },
    },

    // chart tooltip
    tooltip: {
      backgroundColor: "var(--whiteColor)",
      style: {
        color: "var(--textColor)",
      },

      // tooltip format
      headerFormat: '<span style="font-size:11px">{series.name}</span><br>',

      // tooltip point format
      pointFormat:
        '<span style="color:black">৳{point.name}</span><b>{point.y:.2f}</b><br/>',
    },

    // chart legend
    legend: {
      itemStyle: {
        color: "var(--textColor)",
      },
    },

    // chart credits
    credits: {
      enabled: false,
    },

    // chart plot options
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          color: "var(--textColor)",
          style: {
            textOutline: "none",
          },
          // Explicitly type 'this' as Highcharts.Point
          formatter: function (this: Highcharts.Point): string {
            return `৳${this.y}`;
          },
        },
      },
    },

    // chart series
    series: [
      {
        name: "Sales",
        data: formattedChartData?.map((item: any , index:number) => ({ y: item?.total_sales, color: customColors[index] })),
      },
    ],
  };

  return (
    <div className="">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </div>
  );
};

export default ChartOption;
