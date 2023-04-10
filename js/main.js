let lineChart;
let stactAreaChart;
let barChartContext;
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
const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
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
const LINECHART_TOOLTIP_MARIGIN_LEFT_AT_RIGHT = 670;
const LINECHART_TOOLTIP_MARIGIN_LEFT_AT_LEFT = 100;
const VALID_LOCATION = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
];
const VALID_FACILITIES = [
  "sewer_and_water",
  "power",
  "roads_and_bridges",
  "medical,buildings",
];
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
    (parentElementId = "#lineChartSvg"),
    (tooltipElementId = "#lineChartToolTip"),
    (data = data),
    (meanData = meanData),
    (legendElementId = "#lineChartLegendList"),
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

  barChartContext = new BrushableTimeIntervalBarChart(
    {
      parentElementId: "#barChartContextSvg",
      containerWidth: 1000,
      containerHeight: 100,
      margin: { top: 20, right: 20, bottom: 30, left: 40 },
    },
    (data = data),
    (timeAttrName = "time"),
    (valueAttrName = "damage_value"),
    (callback = console.log),
    (intervalLength = 15 * MINUTE)
  );
  barChartContext.initVis();
  barChartContext.updateVis();
  barChartContext.renderVis();
}
main();
// testToolTip();
function testToolTip() {
  let tooltip = new LineChartToolTipRender("#lineChartToolTip");
  let data = {
    time: "2020/1/1 0:0",
    mean: 100,
    locations: [
      { name: "location1", MeanDamage: 10, colour: "red" },
      { name: "location2", MeanDamage: 20, colour: "green" },
      { name: "location3", MeanDamage: 30, colour: "blue" },
      { name: "location4", MeanDamage: 40, colour: "yellow" },
      { name: "location5", MeanDamage: 50, colour: "orange" },
    ],
  };
  console.log(tooltip.renderTooltip(data));
}
