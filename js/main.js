let lineChart;
let stactAreaChart;
let data;
const parseTime = d3.timeParse("%Y/%m/%d %H:%M");
const NUMBER_OF_LOCATION = 19;
async function main() {
  data = await d3.csv("../data/data_long.csv");
  meanData = await d3.csv("../data/data_mean.csv");
  // convert data to numbers, convert timestring to date object
  data.forEach((d) => {
    d.damage_value = +d.damage_value;
    d.time = parseTime(d.time);
  });
  meanData.forEach((d) => {
    d.damage_value = +d.damage_value;
    d.time = parseTime(d.time);
  });

  lineChart = new LineChart(
    (parentElement = "#lineChartSvg"),
    (tooltipElement = "#lineChartToolTip"),
    (data = data),
    (meanData = meanData),
    (legendElement = "#lineChartLegend"),
    (colours = ["#ff0000", "#0000ff"])
  );
  lineChart.initVis();
  lineChart.updateVis();
  lineChart.renderVis();
}
main();