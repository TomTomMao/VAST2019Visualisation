class AreaChart {
  // this class would render a stacked area chart in parentElement
  // data should not be modified in this class, it should be modified in the main.js
  // put data into this.selectedData, and render the chart based on this.selectedData
  // methods start with "_" are private methods, they should not be called outside the class
  // reference for general d3 https://michaeloppermann.com/work/d3
  // reference for stacked area chart https://michaeloppermann.com/d3-example/d3-stacked-area-chart
  // reference for ploting long data https://d3-graph-gallery.com/graph/line_several_group.html
  // code were constructed with the help of the reference and gitHub copilot as guidance
  constructor(
    parentElement,
    tooltipElement,
    legendElement,
    titleElement,
    data,
    colours
  ) {
    // initialize the class, save the parameters as properties
    // parentElement the svg's id like "#areaChart"
    // tooltipElement the div's id like "#areaChartToolTip"
    // legendElement the div's id like "#areaChartLegend"
    // titleElement the div's id like "#areaChartTitle"
    // data is an array, columns: time,shake_intensity,location,facility,damage_value
    // assume data is long format, each row is a damage value of a facility in a location at a time
    let isParameterValid = this._constructorParametersChecker(
      parentElement,
      tooltipElement,
      legendElement,
      titleElement,
      data,
      colours
    );
    if (isParameterValid) {
      this.parentElement = parentElement;
      this.tooltipElement = tooltipElement;
      this.legendElement = legendElement;
      this.titleElement = titleElement;
      this.data = data;
      this.selectedData = data;
      this.colours = colours;
      this.initVis();
    } else {
      console.error("constructor parameters are not valid");
      return false;
    }
  }
  _constructorParametersChecker(
    parentElement,
    tooltipElement,
    legendElement,
    titleElement,
    data,
    colours
  ) {
    if (parentElement.slice(0, 1) !== "#") {
      console.error("parentElement should be an id like '#areaChart'");
      return false;
    }
    if (tooltipElement.slice(0, 1) !== "#") {
      console.error("tooltipElement should be an id like '#areaChartToolTip'");
      return false;
    }
    if (legendElement.slice(0, 1) !== "#") {
      console.error("legendElement should be an id like '#areaChartLegend'");
    }
    if (titleElement.slice(0, 1) !== "#") {
      console.error("titleElement should be an id like '#areaChartTitle'");
      return false;
    }
    if (!Array.isArray(data)) {
      console.error("data should be an array");
      return false;
    }
    if (!Array.isArray(colours)) {
      console.error("colours should be an array");
      return false;
    } else {
      for (let i = 0; i < colours.length; i++) {
        if (typeof colours[i] !== "string") {
          console.error("colours should be an array of string");
          return false;
        }
      }
    }
    return true;
  }
  initVis() {
    // initialize the axes, scales, svg, chart group, axes groups
  }
  updateVis() {
    // update the valueGetter, create the area generator
  }
  renderVis() {
    // render the axes and the areas, add event listeners on the areas for the tooltip
  }
  changeTime(start, end) {
    // this method would be called by the time brusher
    // after called this method, the area chart should be updated
  }
  selectLocation(location) {
    // this method would be called by the location checkboxes
    // or the line in the location get clicked
    // after called this method, the area chart should be updated
  }
}
