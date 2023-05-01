class AreaChart extends TwoAxisTimeChart {
    // reference: https://d3-graph-gallery.com/graph/stackedarea_basic.html
    constructor(config, data, time, location) {
        super(config, data, time);
        this.config.legendElementId = config.legendElementId
        this.config.titleElementId = config.titleElementId
        this.location = location
        this.initVis()
    }
    initVis() {
        let thisObj = this;
        super.initVis();
        thisObj.colourScale = d3.scaleOrdinal().range(d3.schemeSet1);
        thisObj.titleElement = document.querySelector(thisObj.config.titleElementId);
        thisObj.updateVis();
    }
    updateVis() {
        let thisObj = this;
        thisObj.xScale.domain(d3.extent(thisObj.data, function (d) { return d.time }));
        thisObj.yScale.domain([0, 50]);
        thisObj.colourScale = d3.scaleOrdinal().range(d3.schemeSet1);
        thisObj.renderVis();
    }
    renderVis() {
        let thisObj = this;
        super.renderVis()
        let groupedData = d3.group(thisObj.data, d => d.timeStr)
        let stackedData = d3.stack().keys(VALID_FACILITIES_INDEX).value(function (d, key) { if (d[1][key - 1] != undefined) { return d[1][key - 1].meanDamageValue } else { return 0 } })(groupedData)
        console.log("data", data)
        console.log("groupedData", groupedData)
        console.log("stackedData", stackedData)
        thisObj.chart.selectAll("path").remove();
        thisObj.chart.selectAll("area")
            .data(stackedData)
            .join("path")
            .style("fill", function (d) { let facility = VALID_FACILITIES[d.key - 1]; return thisObj.colourScale(facility); })
            .attr("d", d3.area()
            .x(function (d, i) { return thisObj.xScale(parseTime(d.data[0])); })
            .y0(function (d) { return thisObj.yScale(d[0]); })
            .y1(function (d) { return thisObj.yScale(d[1]); }))
        thisObj.titleElement.innerHTML = `Damage: location ${thisObj.getLocation()}`
        updateAreaChartLegends(thisObj)
    }
    setLocation(location) {
        let thisObj = this;
        thisObj.location = location
    }
    getLocation() {
        let thisObj = this;
        return thisObj.location
    }
}