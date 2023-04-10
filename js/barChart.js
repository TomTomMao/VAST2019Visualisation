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
      .attr("height", (d) => thisObj.height - thisObj.yScale(thisObj.getY(d)));
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
    this.locationFilter = 'all';
    this.facilityFilter = 'all';
    this.aggregationFilter = 'mean';
  }
  _getDataToDisplay(locations, facilities, aggregation) {
    // return a list of data: [{timeStart: timeStart, timeEnd: timeEnd, value: value}, ...}]
    // locations: 'all' or a subset of VALID_LOCATION, an array of strings of numbers.
    // facilities: 'all' or a subset of VALID_FACILITIES, an array of strings of facility names
    // aggregation: 'mean' or 'count'
    // validation for location, facility and aggregation
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
    thisObj.locationFilter = locations;
    thisObj.facilityFilter = facilities;
    thisObj.aggregationFilter = aggregation;
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
  _initScales() {
    super._initScales();
    let thisObj = this;
    thisObj.xScale2 = d3.scaleTime().range([0, thisObj.width]);
  }
  _updateScales() {
    super._updateScales();
    let thisObj = this;
    thisObj.xScale2.domain(d3.extent(thisObj.dataToDisplay, thisObj.getX));
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
  changeFilter(locations, facilities, aggregation) {
    let thisObj = this;
    thisObj.dataToDisplay = thisObj._getDataToDisplay(
      locations,
      facilities,
      aggregation
    );
    if (aggregation == "mean") {
        thisObj.yAxis.tickFormat  ((d) => d);
    } else {
        thisObj.yAxis.tickFormat ((d) => d/1000 + "k");
    }
    thisObj.updateVis();
    thisObj.renderVis()
  }
  changeIntervalLength(intervalLength) {
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
