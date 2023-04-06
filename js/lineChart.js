class LineChart {
  // this class would render a line chart
  // the line chart has one line for the mean damage value of the entire dataset
  // the line chart has one line for each selected location
  // when the user collected the line of a location, the AreaChart would render the area chart of the location
  // methods start with "_" are private methods, they should not be called outside the class
  // reference for general d3 https://michaeloppermann.com/work/d3
  // reference for line chart https://michaeloppermann.com/d3-example/d3-line-chart
  // reference for ploting long data https://d3-graph-gallery.com/graph/line_several_group.html
  // code were constructed with the help of the reference and gitHub copilot as guidance

  constructor(
    parentElement,
    tooltipElement,
    data,
    meanData,
    legendElement,
    colours
  ) {
    // initialize the class, save the parameters as properties
    this.parentElement = parentElement;
    this.tooltipElement = tooltipElement;
    this.data = data;
    this.filteredData = data; // data filtered by time range
    this.meanData = meanData; // mean data of the entire dataset
    this.filteredMeanData = meanData; // mean data filtered by time range
    this.locations = [];
    this.locationsData = [];
    this.legendElement = legendElement;
    this.colours = colours;
    this.CONTAINER_WIDTH = 1500;
    this.CONTAINER_HEIGHT = 400;
    this.MARGIN = { top: 20, right: 20, bottom: 20, left: 20 };
  }
  initVis() {
    // initialize the axes, scales, svg, chart group, axes groups
    let thisObj = this;

    // calculate the width and height of the chart
    thisObj.width =
      thisObj.CONTAINER_WIDTH - thisObj.MARGIN.left - thisObj.MARGIN.right;
    thisObj.height =
      thisObj.CONTAINER_HEIGHT - thisObj.MARGIN.top - thisObj.MARGIN.bottom;

    // initialize axes' range
    thisObj.xScale = d3.scaleTime().range([0, thisObj.width]);
    thisObj.yScale = d3.scaleLinear().range([thisObj.height, 0]);

    thisObj.xAxis = d3
      .axisBottom(thisObj.xScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickPadding(10);
    thisObj.yAxis = d3
      .axisLeft(thisObj.yScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickPadding(10);

    // set svg's width and height
    thisObj.svg = d3
      .select(thisObj.parentElement)
      .attr("width", thisObj.CONTAINER_WIDTH)
      .attr("height", thisObj.CONTAINER_HEIGHT);

    // drawing area for lines
    thisObj.chart = thisObj.svg
      .append("g")
      .attr(
        "transform",
        `translate(${thisObj.MARGIN.left}, ${thisObj.MARGIN.top})`
      );

    // drawing area for x axis and y axis
    thisObj.xAxisG = thisObj.svg
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${thisObj.height})`);
    thisObj.yAxisG = thisObj.svg.append("g").attr("class", "axis y-axis");

    //
  }
  updateVis() {
    // update the getter, line generator, scale, legend
    let thisObj = this;
    console.log(thisObj._updateGetter());
    thisObj._updateLineGenerator();
    thisObj._updateScales();
    // thisObj._updateLegend();
    return true;
  }
  _updateGetter(getX = (d) => d.time, getY = (d) => d.damage_value) {
    // update the getter, getX and getY are functions, they map data from the obj to int or float
    let areFunctions = typeof getX === "function" && typeof getY === "function";

    if (areFunctions) {
      let thisObj = this;
      thisObj.getX = getX;
      thisObj.getY = getY;
      return true;
    } else {
      return false;
    }
  }
  _updateScales() {
    // update the scales: x scale, y scale, colour scale
    let thisObj = this;
    thisObj.xScale.domain(d3.extent(thisObj.filteredData, thisObj.getX));
    thisObj.yScale.domain(d3.extent(thisObj.filteredData, thisObj.getY));
  }
  _updateLineGenerator() {
    // update the line generator
    let thisObj = this;
    thisObj.lineGenerator = d3
      .line()
      .x((d) => thisObj.xScale(thisObj.getX(d)))
      .y((d) => thisObj.yScale(thisObj.getY(d)));
  }
  _updateLegend() {
    // update the legend
  }
  renderVis() {
    // render the axes, render the lines
    // if there are no locations, render the mean line
    // if there are locations, render the location lines and the mean line
    let thisObj = this;
    thisObj._renderAxes();
    if (thisObj.locations.length === 0) {
      thisObj._renderMeanLine();
    } else {
      thisObj._renderLocationLines();
      thisObj._renderMeanLine();
    }
    thisObj._renderAxes();
  }
  _renderAxes() {
    // render the axes
  }
  _renderMeanLine() {
    // render the mean line
    let thisObj = this;

    // line for the mean line
    console.log(thisObj.lineGenerator);
    thisObj.chart
      .selectAll(".mean-line")
      .data([thisObj.filteredMeanData])
      .join("path")
      .attr("class", "mean-line")
      .attr("d", thisObj.lineGenerator);
  }
  _renderLocationLines() {
    // render the location lines, use the colours in this.colours; if there are not locations, render nothing
    if (thisObj.locations.length === 0) {
      return false;
    } else {
      // render each lines
      return true;
    }
  }
  _renderAxes() {
    let thisObj = this;
    thisObj.xAxisG.call(thisObj.xAxis);
    thisObj.yAxisG.call(thisObj.yAxis);
  }
  changeTime(start, end) {
    // update the time range, change the filteredData and filteredMeanData
    let thisObj = this;
    thisObj.filteredData = thisObj.data.filter(
      (d) => d.time >= start && d.time <= end
    );
    thisObj.filteredMeanData = thisObj.meanData.filter(
      (d) => d.time >= start && d.time <= end
    );
  }
  filterLocations(locations) {
    // update the locations
    let thisObj = this;
    thisObj.locations = locations;
    thisObj.locationsData = thisObj.locations.map((location) => {
      return thisObj.filteredData.filter((d) => d.location === location);
    });
  }
}
