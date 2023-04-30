class BaseChart {
    constructor(config, data, time) {
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
        this.time = {
            startTime: time.startTime,
            endTime: time.endTime
        }
    }
    initVis() {
        let thisObj = this;

        // init width for the drawing area
        thisObj.width = thisObj.config.containerWidth - thisObj.margin.left - thisObj.margin.right;
        thisObj.height = thisObj.config.containerHeight - thisObj.margin.top - thisObj.margin.bottom;

        // select the svg, setting width and height
        thisObj.svg = d3.select(thisObj.config.parentElementId).attr("width", thisObj.containerWidth).attr("height", thisObj.containerHeight);

        // drawing area
        thisObj.chart = thisObj.svg.append("g").attr("transform", `translate(${thisObj.config.margin.left}, ${thisObj.config.margin.top})`);
    }
}

class TwoAxisTimeChart extends BaseChart {
    // x at bottom - scaleTime
    // y at left - scaleLinear
    initVis() {
        let thisObj = this;
        super().initVis()

        // x scale
        thisObj.xScale = d3.scaleTime().range([0, thisObj.width]);
        // x axis bottom
        thisObj.xAxis = d3
        .axisBottm(xScale)

        thisObj.yScale = d3.scaleTime().range([thisObj.height, 0]);
    }
}