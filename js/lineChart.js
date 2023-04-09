class LineChart {
  // this class would render a line chart
  // the line chart has one line for the mean damage value of the entire dataset
  // the line chart has one line for each selected location
  // when the user collected the line of a location, the AreaChart would render the area chart of the location
  // methods start with "_" are private methods, they should not be called outside the class
  // ACKNOWLEDGEMENT
  // reference for general d3 https://michaeloppermann.com/work/d3
  // reference for line chart https://michaeloppermann.com/d3-example/d3-interactive-line-chart
  // reference for ploting long data https://d3-graph-gallery.com/graph/line_several_group.html
  // code were constructed with the help of the reference and gitHub copilot as guidance

  constructor(
    parentElementId,
    tooltipElementId,
    data,
    meanData,
    legendElementId,
    colours,
    changeStackedAreaChart
  ) {
    // initialize the class, save the parameters as properties
    this.parentElementId = parentElementId; // id
    this.tooltipElementId = tooltipElementId; // id
    this.data = data;
    this.filteredData = data; // data filtered by time range
    this.meanData = meanData; // mean data of the entire dataset
    this.filteredMeanData = meanData; // mean data filtered by time range
    this.locations = [];
    this.locationsData = {};
    this.legendDomElement = document.querySelector(legendElementId); // dom element
    this.legendElementId = legendElementId; // id
    this.colours = colours.map((colour) => colour);
    this.usedColours = [];
    this.availableColours = colours.map((colour) => colour);
    this.locationColour = {
      1: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      2: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      3: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      4: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      5: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      6: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      7: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      8: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      9: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      10: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      11: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      12: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      13: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      14: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      15: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      16: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      17: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      18: LINE_CHART_DEFAULT_LEGEND_COLOUR,
      19: LINE_CHART_DEFAULT_LEGEND_COLOUR,
    };
    this.CONTAINER_WIDTH = 1000;
    this.CONTAINER_HEIGHT = 400;
    this.MARGIN = { top: 20, right: 20, bottom: 30, left: 40 };
    this.timeStart = d3.min(this.data, (d) => d.time);
    this.timeEnd = d3.max(this.data, (d) => d.time);
    this.changeStackedAreaChart = changeStackedAreaChart;
    this.points = [];
  }
  _getTooltipData(x, y) {
    let thisObj = this;
    let data = {};
    let time = thisObj.xScale.invert(x);
    let bisect = d3.bisector((d) => d.time).left; // reference: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/3_d3_tutorial

    // find the data of filteredMeanData
    let index = bisect(thisObj.filteredMeanData, time, 1);
    let leftIndex = thisObj.filteredMeanData[index - 1];
    let rightIndex = thisObj.filteredMeanData[index];
    let closerData =
      time - leftIndex.time > rightIndex.time - time ? rightIndex : leftIndex;
    data.time = closerData.time;
    data.mean = closerData.damage_value;

    // find the data of each selected location
    if (thisObj.locations.length > 0) {
      data.locations = [];
    }
    thisObj.locations.forEach((location) => {
      let index = bisect(thisObj.locationsData[location], time, 1);
      let leftIndex = thisObj.locationsData[location][index - 1];
      let rightIndex = thisObj.locationsData[location][index];
      let closerData =
        time - leftIndex.time > rightIndex.time - time ? rightIndex : leftIndex;
      data.locations.push({
        name: `location${location}`,
        meanDamage: closerData.damage_value,
        colour: thisObj.locationColour[location],
        time: closerData.time,
      });
    });
    return data;
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
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(d3.timeFormat("%m-%d %H:%M")); // REF: https://github.com/d3/d3-time-format
    thisObj.yAxis = d3
      .axisLeft(thisObj.yScale)
      .ticks(10)
      .tickSizeOuter(0)
      .tickPadding(10);

    // set svg's width and height
    thisObj.svg = d3
      .select(thisObj.parentElementId)
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
    thisObj.xAxisG = thisObj.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${thisObj.height})`);
    thisObj.yAxisG = thisObj.chart.append("g").attr("class", "axis y-axis");

    // init legend
    thisObj._initLegend();

    // init tooltip
    thisObj._initTooltip();
  }
  _initLegend() {
    // add event listeners to the linechart legend buttons
    let thisObj = this;
    for (let i = 0; i < thisObj.legendDomElement.children.length; i++) {
      let legendItem = thisObj.legendDomElement.children[i];
      // event listener for the showing and hiding of the line
      legendItem.addEventListener("click", function () {
        thisObj._toggleLocation(String(i + 1), true);
      });
      // event listener for highlighting the line when the mouse is over the legend
      legendItem.addEventListener("mouseover", function () {
        if (thisObj.locations.includes(String(i + 1))) {
          thisObj.highLightLine(String(i + 1), true);
        }
      });
      // event listenr for removing the highlight when the mouse is out of the legend
      legendItem.addEventListener("mouseout", function () {
        if (thisObj.locations.includes(String(i + 1))) {
          thisObj.updateVis();
          thisObj.renderVis();
        }
      });
    }
  }
  _initTooltip() {
    // initialize the tooltip
    // reference for this method: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/3_d3_tutorial
    let thisObj = this;
    let tooltipDomElement = d3.select(thisObj.tooltipElementId);
    thisObj.tooltipRender = new LineChartToolTipRender(
      thisObj.tooltipElementId
    );
    thisObj.trackingArea = thisObj.chart
      .append("rect")
      .attr("width", thisObj.width)
      .attr("height", thisObj.height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", () => {
        tooltipDomElement.style("display", "block");
      })
      .on("mouseout", () => {
        tooltipDomElement.style("display", "none");
        // clear tooltippoints
        thisObj.points = [];
      })
      .on("mousemove", function (event) {
        // get tooltip data
        let x = d3.pointer(event)[0];
        let y = d3.pointer(event)[1];
        let data = thisObj._getTooltipData(x, y);
        if (data !== false) {
          // console.log(thisObj.tooltipRender);
          thisObj.tooltipRender.renderTooltip(data);
          // if x < 0.5 * width, tooltip is on the RIGHT side of the svg
          console.log(x, thisObj.width);
          if (x < 0.5 * thisObj.width) {
            console.log("left");
            tooltipDomElement.style(
              "left",
              `${LINECHART_TOOLTIP_MARIGIN_LEFT_AT_RIGHT}px`
            );
          }
          // if x > 0.5 * width, tooltip is on the LEFT side of the svg
          else {
            console.log("right");
            tooltipDomElement.style(
              "left",
              `${LINECHART_TOOLTIP_MARIGIN_LEFT_AT_LEFT}px`
            );
          }
          // update tooltippoints
          thisObj.points = [];
          thisObj.points.push({
            time: data.time,
            damage_value: data.mean,
            colour: "black",
          });
          if (data.hasOwnProperty("locations")) {
            data.locations.forEach((location) => {
              let lengthOfLocationNumber =
                location.name.length - "location".length;
              let locationNumber = location.name.slice(-lengthOfLocationNumber);
              thisObj.points.push({
                time: location.time,
                damage_value: location.meanDamage,
                colour: thisObj.locationColour[locationNumber],
              });
            });
          }
          thisObj.renderVis();
          return true;
        } else {
          return false;
        }
      });
  }

  updateVis() {
    // update the getter, line generator, scale, legend
    let thisObj = this;
    thisObj._updateGetter();
    thisObj._updateLineGenerator();
    thisObj._updateScales();
    thisObj._updateLegend();
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
    // thisObj.xScale.domain(d3.extent(thisObj.filteredMeanData, thisObj.getX));
    // thisObj.yScale.domain(d3.extent(thisObj.filteredMeanData, thisObj.getY));
    thisObj.xScale.domain(d3.extent(thisObj.filteredData, thisObj.getX));
    thisObj.yScale.domain([
      0,
      d3.max(thisObj.filteredData, (d) => d.damage_value),
    ]);
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
    let thisObj = this;
    // set colours for the selected locations
    // thisObj.locations.forEach((location) => {
    //   let q = `${thisObj.legendElementId} #locationButton${location} .lineChartColourLegend`;
    //   document.querySelector(q).style.backgroundColor =
    //     thisObj.locationColour[Number(location)];
    // });
    // set colour for the locations
    for (let i = 1; i <= NUMBER_OF_LOCATION; i++) {
      let q = `${thisObj.legendElementId} #locationButton${i} .lineChartColourLegend`;
      // console.log(q);
      document.querySelector(q).style.backgroundColor =
        thisObj.locationColour[i];
    }
  }
  renderVis() {
    // render the axes, render the lines
    // if there are no locations, render the mean line
    // if there are locations, render the location lines and the mean line
    let thisObj = this;
    thisObj._renderAxes();
    thisObj._renderLocationLines();
    thisObj._renderMeanLine();
    thisObj._renderAxes();
    thisObj._renderTooltipPoints();
  }
  _renderAxes() {
    // render the axes
  }
  _renderMeanLine() {
    // render the mean line
    let thisObj = this;

    // line for the mean line
    // console.log(thisObj.lineGenerator);
    thisObj.chart
      .selectAll(".mean-line")
      .data([thisObj.filteredMeanData])
      .join("path")
      .attr("class", "mean-line")
      .attr("style", "stroke: black;")
      .attr("d", thisObj.lineGenerator)
      .style("stroke-width", 1);
  }
  _renderLocationLines() {
    // render the location lines, use this.locationColous, if the colour is green, only render the legend,
    // else, render the line and the legend
    let thisObj = this;
    // remove the location lines that not in this.location
    for (let i = 1; i <= NUMBER_OF_LOCATION; i++) {
      if (!thisObj.locations.includes(toString(i))) {
        // console.log(`#line-${i} removed`);
        d3.select(`#line-${i}`).remove();
      }
    }
    if (thisObj.locations.length === 0) {
      return false;
    } else {
      // render each lines
      for (let location of thisObj.locations) {
        thisObj.chart
          .selectAll(`.location-line-${location}`)
          .data([thisObj.locationsData[location]])
          .join("path")
          .attr("class", `location-line`)
          .attr("id", `line-${location}`)
          .attr("d", thisObj.lineGenerator)
          .style("stroke", thisObj.locationColour[Number(location)])
          .style("stroke-width", 1) // convert to int
          .on("click", function (event) {
            // console.log(event);
            // console.log(this.id);
            let location = this.id.split("-")[1];
            thisObj.changeStackedAreaChart(
              location,
              thisObj.timeStart,
              thisObj.timeEnd
            );
          });
        // console.log(thisObj.locationColour[Number(location)]);
      }
      return true;
    }
  }
  _renderTooltipPoints() {
    // render the tooltip points
    let thisObj = this;
    let data = thisObj.points;
    console.log(data);
    thisObj.chart
      .selectAll(".tooltip-point")
      .data(data)
      .join("circle")
      .attr("class", "tooltip-point")
      .attr("cx", (d) => thisObj.xScale(d.time))
      .attr("cy", (d) => thisObj.yScale(d.damage_value))
      .attr("r", 6)
      .attr("fill", (d) => d.colour)
      .attr("stroke", "black");
  }
  highLightLine(location, useHighlightColour = true) {
    // set all the other line gray
    // if the location is select, use it's assigned colour
    // else, use the HIGHLIGHT_COLOUR and render a path for this location
    // set the width of the line to be 2
    // if useHighlightColour is true, call highLightLine2(location)
    if (useHighlightColour) {
      return this._highLightLine2(location);
    }
    let thisObj = this;
    // set the meanLine to be gray
    d3.select(".mean-line").style("stroke", "gray");
    // set the selected location lines to be gray
    thisObj.locations.forEach((location) => {
      d3.select(`#line-${location}`).style("stroke", "gray");
    });
    // set the chosen location line to be the assigned colour if it is in thisObj.locations
    // else, set it to be the HIGHLIGHT_COLOUR
    if (thisObj.locations.includes(location)) {
      d3.select(`#line-${location}`)
        .style("stroke", thisObj.locationColour[Number(location)])
        .style("stroke-width", 2);
    } else {
      d3.select(`#line-${location}`).style("stroke", HIGHLIGHT_COLOUR);
    }
  }
  _highLightLine2(location) {
    // set all the other line gray and at lower level
    // if the location is select, use HIGHLIGHT_COLOUR

    let thisObj = this;
    // set the meanLine to be gray
    d3.select(".mean-line").style("stroke", "gray").style("opacity", 0.5);
    // set the selected location lines to be gray
    thisObj.locations.forEach((location) => {
      d3.select(`#line-${location}`)
        .style("stroke", "gray")
        .style("opacity", 0.5);
    });
    // set the chosen location line to be the assigned colour if it is in thisObj.locations
    // else, set it to be the HIGHLIGHT_COLOUR
    if (thisObj.locations.includes(location)) {
      d3.select(`#line-${location}`)
        .style("stroke", HIGHLIGHT_COLOUR)
        .style("stroke-width", 2);
      return true;
    } else {
      return false;
    }
  }
  _renderAxes() {
    let thisObj = this;
    thisObj.xAxisG.call(thisObj.xAxis);
    thisObj.yAxisG.call(thisObj.yAxis);
  }
  changeTime(start, end, update = false) {
    // update the time range, change the filteredData and filteredMeanData
    let thisObj = this;
    thisObj.filteredData = thisObj.data.filter(
      (d) => d.time >= start && d.time <= end
    );
    thisObj.filteredMeanData = thisObj.meanData.filter(
      (d) => d.time >= start && d.time <= end
    );
    // update the location data
    thisObj.locationsData = {};
    thisObj.filterLocations(thisObj.locations, false);
    if (update) {
      thisObj.updateVis();
      thisObj.renderVis();
    }
    // update the time
    thisObj.timeStart = start;
    thisObj.timeEnd = end;
  }
  _toggleLocation(location, update = false) {
    // location: String(1to19)
    let thisObj = this;
    if (thisObj.locations.includes(location)) {
      // remove the location from the locations, add colour back to the available colours, remove the colour from the used colours
      let newLocations = thisObj.locations.filter((d) => d !== location);
      let thisLocationColour = thisObj.locationColour[Number(location)];
      thisObj.locationColour[Number(location)] =
        LINE_CHART_DEFAULT_LEGEND_COLOUR;
      thisObj.usedColours = thisObj.usedColours.filter(
        (colour) => colour != thisLocationColour
      );
      thisObj.availableColours.push(thisLocationColour);
      return thisObj.filterLocations(newLocations, update);
    } else {
      if (thisObj.locations.length < MAX_NUMBER_OF_LOCATION) {
        // add the location to the locations, remove the colour from the available colours, add the colour to the used colours
        // assign the colour to the location
        let newLocations = thisObj.locations;
        let thisLocationColour = thisObj.availableColours.pop();
        thisObj.locationColour[Number(location)] = thisLocationColour;
        thisObj.usedColours.push(thisLocationColour);
        newLocations.push(location);
        return thisObj.filterLocations(newLocations, update);
      } else {
        // alert the user that the max number of location is 5
        alert(
          `The max number of location is ${MAX_NUMBER_OF_LOCATION}, please remove one location first`
        );
      }
    }
  }
  _getDamageDataOfLocationByTime(location) {
    // get the damage data of the location, group by time, using mean value
    let thisObj = this;
    let locationData = thisObj.filteredData.filter(
      (d) => d.location === location
    );
    // console.log(locationData);
    // aggregate the damage data group by each time point, using mean value
    let damageDataOfLocationByTime = {};
    locationData.forEach((d) => {
      if (damageDataOfLocationByTime.hasOwnProperty(parseTimeReverse(d.time))) {
        try {
          damageDataOfLocationByTime[parseTimeReverse(d.time)].totalDamage +=
            d.damage_value;
          damageDataOfLocationByTime[parseTimeReverse(d.time)].count += 1;
        } catch (error) {
          // console.log("error", error);
        }
      } else {
        damageDataOfLocationByTime[parseTimeReverse(d.time)] = {
          totalDamage: d.damage_value,
          count: 1,
        };
      }
    });
    // console.log("damageDataOfLocationByTime", damageDataOfLocationByTime);
    let damageDataOfLocationByTimeArray = [];
    for (let time in damageDataOfLocationByTime) {
      damageDataOfLocationByTimeArray.push({
        time: parseTime(time),
        // mean value
        damage_value:
          damageDataOfLocationByTime[time].totalDamage /
          damageDataOfLocationByTime[time].count,
      });
    }
    // sort the array by time
    damageDataOfLocationByTimeArray.sort((a, b) => a.time - b.time);
    return damageDataOfLocationByTimeArray;
  }
  filterLocations(locations, update = false) {
    // update the locations, max number of locations is MAX_NUMBER_OF_LOCATION
    let thisObj = this;
    thisObj.locations = locations;
    for (let location of locations) {
      //   let locationData = thisObj.filteredData.filter(
      //     (d) => d.location === location
      //   );
      //   console.log(locationData);
      //   // aggregate the damage data group by each time point, using mean value
      //   let damageDataOfLocationByTime = {};
      //   locationData.forEach((d) => {
      //     if (
      //       damageDataOfLocationByTime.hasOwnProperty(parseTimeReverse(d.time))
      //     ) {
      //       try {
      //         damageDataOfLocationByTime[parseTimeReverse(d.time)].totalDamage +=
      //           d.damage_value;
      //         damageDataOfLocationByTime[parseTimeReverse(d.time)].count += 1;
      //       } catch (error) {
      //         console.log("error", error);
      //       }
      //     } else {
      //       damageDataOfLocationByTime[parseTimeReverse(d.time)] = {
      //         totalDamage: d.damage_value,
      //         count: 1,
      //       };
      //     }
      //   });
      //   console.log("damageDataOfLocationByTime", damageDataOfLocationByTime);
      //   let damageDataOfLocationByTimeArray = [];
      //   for (let time in damageDataOfLocationByTime) {
      //     damageDataOfLocationByTimeArray.push({
      //       time: parseTime(time),
      //       // mean value
      //       damage_value:
      //         damageDataOfLocationByTime[time].totalDamage /
      //         damageDataOfLocationByTime[time].count,
      //     });
      //   }
      //  // sort the array by time
      //   damageDataOfLocationByTimeArray.sort((a, b) => a.time - b.time);
      //  // update the locationsData
      //   thisObj.locationsData[String(location)] = damageDataOfLocationByTimeArray;
      thisObj.locationsData[String(location)] =
        thisObj._getDamageDataOfLocationByTime(location);
    }
    if (update) {
      thisObj.updateVis();
      thisObj.renderVis();
    }
  }
}
