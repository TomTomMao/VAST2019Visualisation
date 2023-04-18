class StackedAreaChart {
  constructor(_config, _data, location = "1", groups = VALID_FACILITIES) {
    this.config = {
      parentElementId: _config.parentElementId,
      legends: _config.legends,
      title: _config.title,
      containerWidth: _config.containerWidth || 800,
      containerHeight: _config.containerHeight || 400,
      margin: _config.margin || { top: 25, right: 12, bottom: 30, left: 100 },
      displayType: "absolute",
    };

    this.data = _data.sort((a, b) => a.time - b.time);
    this.timeStart = parseTime("2020/4/10 0:00");
    this.timeEnd = parseTime("2020/4/11 0:00");

    this.location = location;

    this.groups = groups;
    this.groupKey = this.groups.map((d, i) => i);

    this.dataToDisplay = [];
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let thisObj = this;

    // size
    thisObj.width =
      thisObj.config.containerWidth -
      thisObj.config.margin.left -
      thisObj.config.margin.right;
    thisObj.height =
      thisObj.config.containerHeight -
      thisObj.config.margin.top -
      thisObj.config.margin.bottom;

    // svg
    thisObj.svg = d3
      .select(thisObj.config.parentElementId)
      .attr("width", thisObj.config.containerWidth)
      .attr("height", thisObj.config.containerHeight);

    thisObj.chart = thisObj.svg
      .append("g")
      .attr(
        "transform",
        `translate(${thisObj.config.margin.left}, ${thisObj.config.margin.top})`
      );

    thisObj.xScale = d3.scaleTime().range([0, thisObj.width]);
    thisObj.yScale = d3.scaleLinear().range([thisObj.height, 0]);
    thisObj.colour = d3.scaleOrdinal().range(STACKED_AREA_COLOURS);

    // init axis
    thisObj.xAxis = d3
      .axisBottom(thisObj.xScale)
      .tickFormat(d3.timeFormat("%m-%d %H:%M")); // REF: https://github.com/d3/d3-time-format
    thisObj.yAxis = d3.axisLeft(thisObj.yScale);

    // Append empty x-axis group and move it to the bottom of the chart
    thisObj.xAxisG = thisObj.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${thisObj.height})`);

    // Append y-axis group
    thisObj.yAxisG = thisObj.chart.append("g").attr("class", "axis y-axis");
    thisObj.updateVis();
  }

  updateVis() {
    // prepare the stacked data
    let thisObj = this;
    thisObj.getX = (d) => d.time;
    thisObj.getY = (d) => d.mean_damage_value;

    // filter the data by time
    console.log(thisObj.timeStart);
    console.log(thisObj.timeEnd);
    thisObj.filteredData = thisObj.data.filter((d) => {
      return d.time >= thisObj.timeStart && d.time <= thisObj.timeEnd;
    });
    console.log(thisObj.filteredData);
    // group the data by location and time
    thisObj.groupedAggregatedData = d3.group(
      thisObj.filteredData,
      (d) => d.location,
      (d) => parseTimeReverse(d.time)
    );

    // chose the location's data
    thisObj.dataToDisplay = Array.from(
      thisObj.groupedAggregatedData.get(thisObj.location)
    ).map(function (d) {
      return { key: d[0], values: d[1] };
    });

    // generate stackedData for the location
    thisObj.stackedData = d3 // generating stacked data // reference: https://d3-graph-gallery.com/graph/stackedarea_basic.html
      .stack()
      .keys(thisObj.groupKey)
      .value(function (d, key) {
        return d.values[key].mean_damage_value;
      })(thisObj.dataToDisplay);

    thisObj.xScale.domain(d3.extent(thisObj.filteredData, thisObj.getX));
    thisObj.yScale.domain([0, 50]);
    thisObj.colour.domain(thisObj.groups);
    thisObj.renderVis();
  }
  renderVis() {
    // renference: https://d3-graph-gallery.com/graph/stackedarea_basic.html
    let thisObj = this;

    thisObj.chart
      .selectAll(".area-path")
      .data(thisObj.stackedData)
      .join("path")
      .attr("class", "area-path")
      .style("fill", (d) => thisObj.colour(thisObj.groups[d.key]))
      .attr(
        "d",
        d3
          .area()
          .x(function (d, i) {
            // console.log("d:", d);
            // console.log("d.data.key:", d.data.key);
            // console.log(thisObj.xScale(parseTime(d.data.key)));
            return thisObj.xScale(parseTime(d.data.key));
          })
          .y0(function (d) {
            console.log("d:", d);
            console.log("d[0]", d[0]);
            console.log("thisObj.yScale(d[0]):", thisObj.yScale(d[0]));
            return thisObj.yScale(d[0]);
          })
          .y1(function (d) {
            return thisObj.yScale(d[1]);
          })
      );

    thisObj.xAxisG.call(thisObj.xAxis);
    thisObj.yAxisG.call(thisObj.yAxis);
    thisObj.renderLegend();
  }
  renderLegend() {
    let thisObj = this;
    let legendParent = document.querySelector(thisObj.config.legends);
    legendParent.innerHTML = "<ul></ul>";
    thisObj.groupKey.forEach(function (key) {
      let li = document.createElement("li");
      let facility = thisObj.groups[key];
      let colour = thisObj.colour(facility)
      li.innerHTML = `<span style="color: ${colour}">${facility}</span>`;
      legendParent.appendChild(li);
    });
  }
  setTimeRange(timeStart, timeEnd) {
    let thisObj = this;
    thisObj.timeStart = timeStart;
    thisObj.timeEnd = timeEnd;
    thisObj.updateVis();
  }
}
