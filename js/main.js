let lineChart;
let stactAreaChart;
let data;
const parseTime = d3.timeParse("%Y/%m/%d %H:%M");
const parseTimeReverse = function (time) {
  return (
    time.getUTCFullYear() +
    "/" +
    (time.getUTCMonth() + 1) +
    "/" +
    time.getUTCDate() +
    " " +
    (time.getUTCHours() + 1) +
    ":" +
    time.getUTCMinutes()
  );
};
const NUMBER_OF_LOCATION = 19;
const MAX_NUMBER_OF_LOCATION = 5;
const HIGHLIGHT_COLOUR = "purple";
const LINE_CHART_LOCATION_COLOURS = [
  "red",
  "green",
  "blue",
  "yellow",
  "orange",
];
const LINE_CHART_DEFAULT_LEGEND_COLOUR = "white";
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
  meanData.sort((a, b) => a.time - b.time);

  lineChart = new LineChart(
    (parentElement = "#lineChartSvg"),
    (tooltipElement = "#lineChartToolTip"),
    (data = data),
    (meanData = meanData),
    (legendElement = "#lineChartLegendList"),
    (colours = LINE_CHART_LOCATION_COLOURS),
    (changeStackedAreaChart = function (location, timeStart, timeEnd) {
      document.getElementById(
        "stackedAreaChartTitle"
      ).innerHTML = `Stacked Area Chart for ${location} from ${parseTimeReverse(
        timeStart
      )} to ${parseTimeReverse(timeEnd)}`;
    })
  );
  lineChart.initVis();
  lineChart.updateVis();
  lineChart.renderVis();
}
main();
