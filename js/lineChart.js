class LineChart extends TwoAxisTimeChart {
    // reference: https://michaeloppermann.com/d3-example/d3-interactive-line-chart
    constructor(config, data, time) {
        super(config,data,time);
        this.config.toolTipElementId = config.toolTipElementId
        this.config.legendElementId = config.legendElementId
        this.initVis()
    }
    initVis() {
        let thisObj = this;
        super.initVis();
        thisObj.colourScale = d3.scaleOrdinal().range(d3.schemeSet1);
        thisObj.updateVis()
    }
    updateVis() {
        let thisObj = this;
        thisObj.getX = d=>d.time;
        thisObj.getY = d=>d.meanDamageValue;
        thisObj.getLocation = d=>d.location;
        thisObj.xScale.domain([thisObj.time.startTime, thisObj.time.endTime]);
        thisObj.yScale.domain(d3.extent(thisObj.data, d=>d.meanDamageValue));
        thisObj.colourScale.domain(thisObj.getLocations())

        thisObj.line = d3.line()
                .x(d => thisObj.xScale(thisObj.getX(d)))
                .y(d => thisObj.yScale(thisObj.getY(d)))
        thisObj.renderVis();
    }
    renderVis(){
        let thisObj = this;
        super.renderVis()

        // reference for multiple lines: https://d3-graph-gallery.com/graph/line_several_group.html
        thisObj.chart.selectAll("path").remove();
        let groupedData = d3.group(thisObj.data, d=>d.location);
        console.log("grouped data for the path:", groupedData);
        thisObj.chart.selectAll(".line")
            .data(groupedData)
            .join("path")
                .attr("fill", "none")
                .attr("stroke", function(d){return thisObj.colourScale(d[0])})
                .attr("stroke-width", 1.5)
                .attr("d", function(d){
                    return thisObj.line(d[1])
                })
    }
    
    getLocations() {
        let thisObj = this;
        return Array.from(new Set(thisObj.data.map(d=>d.location)))
    }
    setTime(time) {
        let thisObj = this;
        thisObj.time.startTime = time.startTime
        thisObj.time.endTime = time.endTime
    }
}