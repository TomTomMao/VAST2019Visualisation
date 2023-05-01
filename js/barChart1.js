class BarChart1 extends BaseChart {
    constructor(config, data) {
        super(config, data);
        this.initVis();
    }
    initVis() {
        let thisObj = this;
        super.initVis()

        // x scale
        thisObj.xScale = d3.scaleTime().range([0, thisObj.width]);
        // x axis bottom
        thisObj.xAxis = d3
            .axisBottom(thisObj.xScale).tickFormat(d3.timeFormat("%m-%d %H:%M"))
        // x group
        thisObj.xAxisG = thisObj.chart.append("g").attr("class", "axis x-axis").attr("transform", `translate(0,${thisObj.height})`);

        // y scale
        thisObj.yScale = d3.scaleLinear().range([thisObj.height, 0]);
        // y axis left
        thisObj.yAxis = d3
            .axisLeft(thisObj.yScale)
        // y group
        thisObj.yAxisG = thisObj.chart.append("g").attr("class", "axis y-axis");
        this.updateVis();
    }
    updateVis() {
        let thisObj = this;
        thisObj.getX1 = (d) => d.timeStart;
        thisObj.getX2 = (d) => d.timeEnd;
        thisObj.getY = (d) => d.dataValue;

        thisObj.xScale.domain([
            d3.min(thisObj.data, thisObj.getX1),
            d3.max(thisObj.data, thisObj.getX2)
        ])
        thisObj.yScale.domain(d3.extent(thisObj.data, thisObj.getY))
        this.renderVis();
    }
    renderVis() {
        let thisObj = this;
        thisObj.chart.selectAll(".bar")
            .data(thisObj.data)
            .join("rect")
            .attr('class', "bar")
            .attr("width", (d) => {
                return thisObj.xScale(thisObj.getX2(d)) - thisObj.xScale(thisObj.getX1(d))
            })
            .attr('x', (d) => (thisObj.xScale(thisObj.getX1(d))))
            .attr('height', d => thisObj.height - thisObj.yScale(thisObj.getY(d))) // reference: https://github.com/michael-oppermann/d3-learning-material/blob/main/d3-examples/d3-interactive-bar-chart/js/barchart.js
            .attr('y', d => thisObj.yScale(thisObj.getY(d))) // reference: https://github.com/michael-oppermann/d3-learning-material/blob/main/d3-examples/d3-interactive-bar-chart/js/barchart.js
        thisObj.xAxisG.call(thisObj.xAxis);
        thisObj.yAxisG.call(thisObj.yAxis);
    }
}