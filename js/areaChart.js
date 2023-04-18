class StackedAreaChart {
  // reference: https://michaeloppermann.com/d3-example/d3-stacked-area-chart
  constructor(_config, _data) {
    this.config = { parentElementId: _config.parentElementId, 
      containerWidth: _config.containerWidth, 
      containerHeight: _config.containerHeight, 
      margin: _config.margin};
    this.data = _data;
  }

  initVis(){
    // calculate size
    let thisObj = this
    thisObj.width = thisObj.config.containerWidth - thisObj.config.margin.left - thisObj.config.margin.right;
    thisObj.height = thisObj.config.containerHeight - thisObj.config.margin.top - thisObj.config.margin.bottom;

    // init the svg variable
    thisObj.svg = d3.select(thisObj.config.parentElementId).attr('width', thisObj.config.containerWidth, thisObj.config.containerHeight)
    thisObj.chart = thisObj.svg.append("g").attr('transform', translate(`${thisObj.config.margin.left}, $${thisObj.config.margin.top}`))
    // 

    // initialize the scale
    thisObj.xScale = d3.scaleLinear().range([0,thisObj.width]);
    thisObj.yScale = d3.scaleLinear().range([thisObj.height,0]);
    thisObj.colourScale = d3.scaleOrdinal().range(STACKED_AREA_COLOURS)
    
  }
  updateVis(){}
  renderVis(){}
  changeTimeAndLocation(timeStart, timeEnd, location){}
}
