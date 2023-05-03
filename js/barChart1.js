class BarChart1 extends BaseChart {
    constructor(config, data, callbacks) {
        super(config, data);
        let thisObj= this;
        thisObj.callbacks = {
            brushedCallback: callbacks.brushedCallback,
            brushedendCallback: callbacks.brushedendCallback
        }
        thisObj.initVis();
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

        // reference for the brusher: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/4_d3_tutorial
        thisObj.brush = d3.brushX()
            .extent([[0,0], [thisObj.width, thisObj.height]])
            .on('brush', (d) => {thisObj.brushed(d)})
            .on('end', (d) => thisObj.brushedend(d))
        thisObj.brushG = thisObj.chart.append('g')
                            .attr('class', 'brush x-brush')
                            .call(thisObj.brush)
        this.updateVis();
    }
    updateVis() {
        let thisObj = this;
        thisObj.getX1 = (d) => d.timeStart;
        thisObj.getX2 = (d) => d.timeEnd;
        thisObj.getY = (d) => d.dataValue;

        // thisObj.xScale.domain([
        //     d3.min(thisObj.data, thisObj.getX1),
        //     d3.max(thisObj.data, thisObj.getX2)
        // ])
        thisObj.xScale.domain(d3.extent(data_long, (d)=>d.time))
        thisObj.yScale.domain(d3.extent(thisObj.data, thisObj.getY))
        this.renderVis();
    }
    renderVis() {
        let thisObj = this;
        thisObj.chart.selectAll(".bar")
            .data(thisObj.data, (d)=>d.timeStartStr)
            .join("rect")
            .attr('class', "bar")
            .attr('x', (d) => (thisObj.xScale(thisObj.getX1(d))))
            .transition()
            .duration(1000)
            .attr('y', d => thisObj.yScale(thisObj.getY(d))) // reference: https://github.com/michael-oppermann/d3-learning-material/blob/main/d3-examples/d3-interactive-bar-chart/js/barchart.js
            .attr('height', d => thisObj.height - thisObj.yScale(thisObj.getY(d))) // reference: https://github.com/michael-oppermann/d3-learning-material/blob/main/d3-examples/d3-interactive-bar-chart/js/barchart.js
            .attr("width", (d) => {
                return thisObj.xScale(thisObj.getX2(d)) - thisObj.xScale(thisObj.getX1(d))
            })
        thisObj.xAxisG.call(thisObj.xAxis);
        thisObj.yAxisG.call(thisObj.yAxis);
    }
    brushed ({selection}) {
        // reference for the brusher: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/4_d3_tutorial
        let thisObj = this;
        let [x1, x2] = selection.map(thisObj.xScale.invert, thisObj.xScale);
        thisObj.callbacks.brushedCallback(x1, x2)
    }
    brushedend({selection}) {
        // reference for the brusher: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/4_d3_tutorial
        let thisObj = this;
        let [x1, x2] = selection.map(thisObj.xScale.invert, thisObj.xScale);
        thisObj.callbacks.brushedendCallback(x1, x2)
    }
}