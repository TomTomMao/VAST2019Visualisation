class BaseChart {
    //REFERENCE: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/2_d3_tutorial
    constructor(config, data) {
        this.config = {
            parentElementId: config.parentElementId,
            containerWidth: config.containerWidth,
            containerHeight: config.containerHeight,
            margin: {
                left: config.margin.left,
                top: config.margin.top,
                right: config.margin.right,
                bottom: config.margin.bottom
            }
        }
        this.data = data;
    }
    initVis() {
        let thisObj = this;

        // init width for the drawing area
        thisObj.width = thisObj.config.containerWidth - thisObj.config.margin.left - thisObj.config.margin.right;
        thisObj.height = thisObj.config.containerHeight - thisObj.config.margin.top - thisObj.config.margin.bottom;

        // select the svg, setting width and height
        thisObj.svg = d3.select(thisObj.config.parentElementId).attr("width", thisObj.config.containerWidth).attr("height", thisObj.config.containerHeight);

        // drawing area
        thisObj.chart = thisObj.svg.append("g").attr("transform", `translate(${thisObj.config.margin.left}, ${thisObj.config.margin.top})`);
    }
    updateVis() {
    }

    renderVis() {
    }
}

class TwoAxisTimeChart extends BaseChart {
    //REFERENCE: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/2_d3_tutorial
    // x at bottom - scaleTime
    // y at left - scaleLinear
    constructor(config, data, time) {
        super(config, data);
        this.time = {
            startTime: time.startTime,
            endTime: time.endTime
        }
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
    }
    renderVis() {
        let thisObj = this;
        thisObj.xAxisG.call(thisObj.xAxis);
        thisObj.yAxisG.call(thisObj.yAxis);
    }
    setTime(time) {
        let thisObj = this;
        thisObj.time.startTime = time.startTime
        thisObj.time.endTime = time.endTime
    }
}