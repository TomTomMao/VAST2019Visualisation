let lineChart;
let stactAreaChart;
let barChartContext;
let longBarChart;
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
    (callback = barChartContextCallback),
    (intervalLength = 15 * MINUTE)
  );
  barChartContext.initVis();
  barChartContext.updateVis();
  barChartContext.renderVis();

  let longBarChartConfig = (_config = {
    parentElementId: "#longBarChartSvg",
    containerWidth: 400,
    containerHeight: 1000,
    margin: { top: 20, right: 20, bottom: 30, left: 40 },
  });
  let longBarChartEncoding = {
    group: "location",
    mainValueType: new MeanAggregator(),
    secondValueType: new CountAggregator(),
  };
  longBarChart = new CompositeVerticalAggregatedBarChart(
    longBarChartConfig,
    data,
    longBarChartEncoding,
    "time",
    "damage_value"
  );
  longBarChart.initVis();
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

function barChartContextCallback(timeStart, timeEnd) {
  // console.log("start:", timeStart, "end:", timeEnd);
  lineChart.changeTime(timeStart, timeEnd, true);
}

function changeBarChartValueType(indexOfSelector) {
  if (indexOfSelector == 1) {
    let barChartContextObj = barChartContext;
    return function (value) {
      barChartContextObj.changeFilter(
        barChartContextObj.locationFilter,
        barChartContextObj.facilityFilter,
        value
      );
    };
  }
}

function changeBarChartLocationFilter(indexOfSelector) {
  if (indexOfSelector == 1) {
    let barChartContextObj = barChartContext;
    return function (value) {
      let locationFilter = [];
      if (value == "all") {
        locationFilter = "all";
      } else {
        locationFilter = [value];
      }
      barChartContextObj.changeFilter(
        locationFilter,
        barChartContextObj.facilityFilter,
        barChartContextObj.aggregationFilter
      );
    };
  }
}

function changeBarChartIntervalLength(indexOfSelector) {
  if (indexOfSelector == 1) {
    let barChartContextObj = barChartContext;
    return function (value) {
      const valueMapping = {
        "15min": 15 * MINUTE,
        "30min": 30 * MINUTE,
        "1hour": HOUR,
        "2hours": 2 * HOUR,
        "4hours": 4 * HOUR,
        "8hours": 8 * HOUR,
        "12hours": 12 * HOUR,
        "1day": DAY,
      };
      barChartContextObj.changeIntervalLength(valueMapping[value]);
    };
  }
}

function changeBarChartFacilityFilter(indexOfSelector) {
  if (indexOfSelector == 1) {
    let barChartContextObj = barChartContext;
    return function (value) {
      let facilityFilter = [];
      if (value == "all") {
        facilityFilter = "all";
      } else {
        facilityFilter = [value];
      }
      barChartContextObj.changeFilter(
        barChartContextObj.locationFilter,
        facilityFilter,
        barChartContextObj.aggregationFilter
      );
    };
  }
}
