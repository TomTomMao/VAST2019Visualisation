class BarChart {
  constructor(_config, _data) {
    this.config = {
      parentElementId: _config.parentElementId,
      containerWidth: _config.containerWidth,
      containerHeight: _config.containerHeight,
    };
    this.margin = _config.margin;
    this.data = _data;
    this.dataToDisplay = data;
  }
  initVis() {
    let thisObj = this;
    thisObj._initSize();
    thisObj._initScales();
    thisObj._initSvg();
    thisObj._initChart();
    thisObj._initAxes();
    // thisObj._initLegend();
    // thisObj._initTooltip();
  }
  updateVis() {
    let thisObj = this;
    thisObj._updateGetter();
    thisObj._updateScales();
    thisObj._updateTitle();
  }
  renderVis() {
    let thisObj = this;
    thisObj._renderChart();
    thisObj._renderAxes();
    thisObj._renderTitle();
  }
  _initSize() {
    let thisObj = this;
    thisObj.width =
      thisObj.config.containerWidth -
      thisObj.margin.left -
      thisObj.margin.right;
    thisObj.height =
      thisObj.config.containerHeight -
      thisObj.margin.top -
      thisObj.margin.bottom;
  }
  _initScales() {
    let thisObj = this;
    thisObj.xScale = d3.scaleBand().range([0, thisObj.width]).padding(0.1);
    thisObj.yScale = d3.scaleLinear().range([thisObj.height, 0]);
  }
  _initSvg() {
    let thisObj = this;
    thisObj.svg = d3
      .select(thisObj.config.parentElementId)
      .attr("width", thisObj.config.containerWidth)
      .attr("height", thisObj.config.containerHeight);
  }
  _initChart() {
    let thisObj = this;
    thisObj.chart = thisObj.svg
      .append("g")
      .attr(
        "transform",
        `translate(${thisObj.margin.left}, ${thisObj.margin.top})`
      );
  }
  _initAxes() {
    let thisObj = this;
    thisObj.xAxis = d3
      .axisBottom(thisObj.xScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10);
    thisObj.yAxis = d3
      .axisLeft(thisObj.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10);
    thisObj.XAxisG = thisObj.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${thisObj.height})`);
    thisObj.YAxisG = thisObj.chart.append("g").attr("class", "axis y-axis");
  }
  _initLegend() {}
  _initTooltip() {}
  _updateGetter() {
    let thisObj = this;
    thisObj.getX = (d) => d[thisObj.xAttrName];
    thisObj.getY = (d) => d[thisObj.yAttrName];
  }
  _updateScales() {
    let thisObj = this;
    thisObj.xScale.domain(thisObj.dataToDisplay.map(thisObj.getX));
    thisObj.yScale.domain([0, d3.max(thisObj.dataToDisplay, thisObj.getY)]);
  }
  _updateTitle() {}
  _renderChart() {
    let thisObj = this;
    thisObj.chart
      .selectAll(".bar")
      .data(thisObj.dataToDisplay)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => thisObj.xScale(thisObj.getX(d)))
      .attr("y", (d) => thisObj.yScale(thisObj.getY(d)))
      .attr("width", thisObj.xScale.bandwidth())
      .attr("height", (d) => {
        let height = thisObj.height - thisObj.yScale(thisObj.getY(d));
        if (typeof height === "number") {
          // console.log("height is a number: ", height);
          return height;
        } else {
          // console.log("height is not a number: ", height);
          return 0;
        }
      });
  }
  _renderAxes() {
    let thisObj = this;
    thisObj.XAxisG.call(thisObj.xAxis);
    thisObj.YAxisG.call(thisObj.yAxis);
  }
  _renderTitle() {}
}
class BrushableTimeIntervalBarChart extends BarChart {
  // a bar chart, where each bar represents a time interval, and the user can select a time interval by dragging a brush
  // the time interval is defined by the start and end time of the brush, then it would call a callback function to tell the event handler to update the other charts
  constructor(
    _config,
    _data,
    timeAttrName,
    valueAttrName,
    callback,
    intervalLength
  ) {
    super(_config, _data);
    this.timeAttrName = timeAttrName;
    this.valueAttrName = valueAttrName;
    this.xAttrName = "timeEnd";
    this.yAttrName = "value";
    this.callback = callback;
    this.intervalLength = intervalLength; // in seconds
    this.dataToDisplay = this._getDataToDisplay("all", "all", "mean");
    this.locationFilter = "all";
    this.facilityFilter = "all";
    this.aggregationFilter = "mean";
  }
  _getDataToDisplay(locations, facilities, aggregation) {
    // return a list of data: [{timeStart: timeStart, timeEnd: timeEnd, value: value}, ...}]
    // locations: 'all' or a subset of VALID_LOCATION, an array of strings of numbers.
    // facilities: 'all' or a subset of VALID_FACILITIES, an array of strings of facility names
    // aggregation: 'mean' or 'count'
    // validation for location, facility and aggregation
    console.log(locations);
    if (
      locations == "all" ||
      locations.every((l) => VALID_LOCATION.includes(l))
    ) {
      // do nothing
    } else {
      throw "location should be 'all' or a subset of VALID_LOCATION";
    }
    if (
      facilities == "all" ||
      facilities.every((f) => VALID_FACILITIES.includes(f))
    ) {
      // do nothing
    } else {
      throw "facility should be 'all' or a subset of VALID_FACILITIES";
    }
    if (aggregation == "mean" || aggregation == "count") {
      // do nothing
    } else {
      throw "aggregation should be 'mean' or 'count'";
    }

    let thisObj = this;
    const aggregators = {
      mean: new MeanAggregator(),
      count: new CountAggregator(),
    };
    if (locations === "all") {
      if (facilities === "all") {
        return new TimeSeriesData(
          thisObj.data,
          thisObj.timeAttrName,
          thisObj.valueAttrName
        ).getDataAggregatedByInterval(
          thisObj.intervalLength,
          aggregators[aggregation]
        );
      } else {
        return new TimeSeriesData(
          thisObj.data.filter((d) => facilities.includes(d.facility)),
          thisObj.timeAttrName,
          thisObj.valueAttrName
        ).getDataAggregatedByInterval(
          thisObj.intervalLength,
          aggregators[aggregation]
        );
      }
    } else {
      if (facilities === "all") {
        return new TimeSeriesData(
          thisObj.data.filter((d) => locations.includes(d.location)),
          thisObj.timeAttrName,
          thisObj.valueAttrName
        ).getDataAggregatedByInterval(
          thisObj.intervalLength,
          aggregators[aggregation]
        );
      } else {
        return new TimeSeriesData(
          thisObj.data.filter(
            (d) =>
              locations.includes(d.location) && facilities.includes(d.facility)
          ),
          thisObj.timeAttrName,
          thisObj.valueAttrName
        ).getDataAggregatedByInterval(
          thisObj.intervalLength,
          aggregators[aggregation]
        );
      }
    }
  }
  initVis() {
    super.initVis();
    let thisObj = this;
    thisObj._initBrush();
  }
  _initScales() {
    super._initScales();
    let thisObj = this;
    thisObj.xScale2 = d3.scaleTime().range([0, thisObj.width]); // scale2 is for axis
  }
  _updateScales() {
    super._updateScales();
    let thisObj = this;
    thisObj.xScale2.domain(d3.extent(thisObj.dataToDisplay, thisObj.getX)); // scale2 is for axis
  }
  _initAxes() {
    let thisObj = this;
    // use time scale for x axis
    thisObj.xAxis = d3
      .axisBottom(thisObj.xScale2)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d3.timeFormat("%m-%d %H:%M")); // REF: https://github.com/d3/d3-time-format
    thisObj.yAxis = d3
      .axisLeft(thisObj.yScale)
      .ticks(5)
      .tickSizeOuter(0)
      .tickPadding(10);
    thisObj.XAxisG = thisObj.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${thisObj.height})`);
    thisObj.YAxisG = thisObj.chart.append("g").attr("class", "axis y-axis");
  }
  _initBrush() {
    // reference : https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/4_d3_tutorial#brushing-linking
    let thisObj = this;
    thisObj.brush = d3
      .brushX()
      .extent([
        [0, 0],
        [thisObj.width, thisObj.height],
      ])
      .on("brush", (event) => {
        let timeStart = thisObj.xScale2.invert(event.selection[0]);
        let timeEnd = thisObj.xScale2.invert(event.selection[1]);
        thisObj.callback(timeStart, timeEnd);
      })
      .on("end", (event) => {
        let timeStart = thisObj.xScale2.invert(event.selection[0]);
        let timeEnd = thisObj.xScale2.invert(event.selection[1]);
        thisObj.callback(timeStart, timeEnd);
      });
    thisObj.brushG = thisObj.svg
      .append("g")
      .attr("class", "brush x-brush")
      .attr(
        "transform",
        `translate(${thisObj.margin.left}, ${thisObj.margin.top})`
      )
      .call(thisObj.brush);
  }
  changeFilter(locations, facilities, aggregation) {
    // locations should be 'all' or a subset of VALID_LOCATION, an array of strings of numbers.
    // facilities should be 'all' or a subset of VALID_FACILITIES, an array of strings of facility names
    // aggregation should be 'mean' or 'count'
    let thisObj = this;
    thisObj.dataToDisplay = thisObj._getDataToDisplay(
      locations,
      facilities,
      aggregation
    );
    if (aggregation == "mean") {
      thisObj.yAxis.tickFormat((d) => d);
    } else {
      thisObj.yAxis.tickFormat((d) => d / 1000 + "k");
    }

    thisObj.locationFilter = locations;
    thisObj.facilityFilter = facilities;
    thisObj.aggregationFilter = aggregation;
    thisObj.updateVis();
    thisObj.renderVis();
  }
  changeIntervalLength(intervalLength) {
    // intervalLength: in seconds
    let thisObj = this;
    thisObj.intervalLength = intervalLength;
    thisObj.dataToDisplay = thisObj._getDataToDisplay(
      thisObj.locationFilter,
      thisObj.facilityFilter,
      thisObj.aggregationFilter
    );
    thisObj.updateVis();
    thisObj.renderVis();
  }
}
class CompositeVerticalAggregatedBarChart extends BarChart {
  constructor(
    _config,
    _data,
    encoding,
    timeAttrName,
    valueAttrName,
    startTime = null,
    endTime = null
  ) {
    // encoding {group: string, mainValueType: Aggregator, secondValueType: Aggregator}
    super(_config, _data);
    console.log(encoding);
    this.encoding = {
      group: "",
      mainValueType: new Aggregator(),
      secondValueType: new Aggregator(),
    };
    this.setGroupAttribute(encoding.group, false);
    this.setMainValueType(encoding.mainValueType, false);
    this.setSecondValueType(encoding.secondValueType, false);

    this.startTime = startTime ? startTime : d3.min(_data, (d) => d.time);
    this.endTime = endTime ? endTime : d3.max(_data, (d) => d.time);
    this.timeAttrName = timeAttrName;
    this.valueAttrName = valueAttrName;
    this.dataToDisplay = this._getDataToDisplay();
  }
  initVis() {}
  updateVis() {}
  renderVis() {}
  setGroupAttribute(attr, update = true) {
    // attr: string in LONG_BAR_CHART_GROUP_ATTRS
    // validation
    if (!LONG_BAR_CHART_GROUP_ATTRS.includes(attr)) {
      console.error("Invalid group attribute");
      return;
    }
    let thisObj = this;
    thisObj.encoding.group = attr;
    if (update) {
      thisObj.dataToDisplay = thisObj._getDataToDisplay();
      thisObj.updateVis();
    }
  }
  setMainValueType(aggregator, update = true) {
    // aggregator: aggregator object whose type in LONG_BAR_CHART_AGGREGATORS
    // validation
    if (!LONG_BAR_CHART_AGGREGATORS.includes(aggregator.aggregatorType)) {
      console.error(
        "Invalid aggregator type. Allowed types: " +
          LONG_BAR_CHART_AGGREGATORS.join(", ") +
          ". " +
          aggregator.aggregatorType +
          " is not allowed."
      );
      return;
    }
    let thisObj = this;
    thisObj.encoding.mainValueType = aggregator;
    
    if (update) {
      thisObj.dataToDisplay = thisObj._getDataToDisplay();
      thisObj.updateVis();
    }
  }
  setSecondValueType(aggregator, update = true) {
    // aggregator: aggregator object whose type in LONG_BAR_CHART_AGGREGATORS
    // validation
    if (!LONG_BAR_CHART_AGGREGATORS.includes(aggregator.aggregatorType)) {
      console.error(
        "Invalid aggregator type. Allowed types: " +
          LONG_BAR_CHART_AGGREGATORS.join(", ") +
          ". " +
          aggregator.aggregatorType +
          " is not allowed."
      );
      return;
    }
    let thisObj = this;
    thisObj.encoding.secondValueType = aggregator;
    if (update) {
      thisObj.dataToDisplay = thisObj._getDataToDisplay();
      thisObj.updateVis();
    }
  }
  setTimeRange(startTime, endTime, update = true) {
    // startTime: Date object
    // endTime: Date object
    // startTime should be smaller than endTime
    // set the startTime and endTime of the chart
    let thisObj = this;
    thisObj.startTime = startTime;
    thisObj.endTime = endTime;
    thisObj.dataToDisplay = thisObj._getDataToDisplay();
    update && thisObj.updateVis();
  }
  getGroupAttribute() {
    // return string in LONG_BAR_CHART_GROUP_ATTRS
    return this.encoding.group;
  }
  getMainValueType() {
    // return Aggregator object
    return this.encoding.mainValueType;
  }
  getSecondValueType() {
    // return Aggregator object
    return this.encoding.secondValueType;
  }
  _getDataToDisplay() {
    // return [{group: "group1", mainValue: 1, secondValue: 2}, {group: "group2", mainValue: 3, secondValue: 4}...]
    // return value depends on the this.encoding
    let thisObj = this;
    let timeSeriesData = new TimeSeriesData(
      thisObj.data,
      thisObj.timeAttrName,
      thisObj.valueAttrName
    );
    let mainData = timeSeriesData.getGroupedData(
      thisObj.encoding.mainValueType,
      thisObj.startTime,
      thisObj.endTime,
      thisObj.encoding.group
    );
    let secondData = timeSeriesData.getGroupedData(
      thisObj.encoding.secondValueType,
      thisObj.startTime,
      thisObj.endTime,
      thisObj.encoding.group
    );
    let mainGroupedData = mainData.groupedData; // a map object
    let secondGroupedData = secondData.groupedData; // a map object
    console.log(mainGroupedData);
    console.log(secondGroupedData);
    let groupNames = Array.from(mainGroupedData.keys());
    // {timeStart: time, timeEnd: time, aggregatorType: aggregator.aggregatorType, groupByAtrribute: groupBy,groupedData: a map from location to aggregated value}
    // console.log(groupsName)
    let dataToDisplay = [];
    for (let groupName of groupNames) {
      let mainValue = mainGroupedData.get(groupName);
      let secondValue = secondGroupedData.get(groupName);
      dataToDisplay.push({
        group: groupName,
        mainValue: mainValue,
        secondValue: secondValue,
      });
    }
    return dataToDisplay;
  }
  sortByGroup() {}
  sortByMain() {}
  sortBySecond() {}
}
