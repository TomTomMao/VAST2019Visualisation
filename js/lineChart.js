class LineChart extends TwoAxisTimeChart {
    // reference: https://michaeloppermann.com/d3-example/d3-interactive-line-chart
    constructor(config, data, time) {
        super(config, data, time);
        this.config.toolTipElementId = config.toolTipElementId
        this.config.legendElementId = config.legendElementId
        this.highLightedLocation = EMPTY_COLOUR_DOMAIN_VALUE
        this.initVis()
    }
    initVis() {
        let thisObj = this;
        super.initVis();
        thisObj.colours = d3.schemeSet1;
        thisObj.coloursDomain = thisObj.colours.map(d => EMPTY_COLOUR_DOMAIN_VALUE);

        // add tooltip tracking area, reference: https://github.com/michael-oppermann/d3-learning-material/tree/main/d3-tutorials/3_d3_tutorial#tooltips
        thisObj.bisect = d3.bisector(d => d.time).left
        thisObj.trackingArea = thisObj.chart.append('rect')
            .attr('width', thisObj.width)
            .attr('height', thisObj.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all')

        // add tooltip marker. reference: https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart?file=/js/linechart.js:4023-4030
        thisObj.tooltip = thisObj.chart.append('g')
            .attr('class', 'tooltip')
            .attr('display', 'none')

        // thisObj.colourScale = d3.scaleOrdinal().range(d3.schemeSet1); // replaced by my own colour domain function
        thisObj.updateVis()
    }
    updateVis() {
        let thisObj = this;
        thisObj.getX = d => d.time;
        thisObj.getY = d => d.meanDamageValue;
        thisObj.getLocation = d => d.location;
        thisObj.xScale.domain([thisObj.time.startTime, thisObj.time.endTime]);
        thisObj.yScale.domain(d3.extent(thisObj.data, d => d.meanDamageValue));
        // thisObj.colourScale.domain(thisObj.getLocations())

        // update domain
        let locations = thisObj.getLocations()
        // remove the Domain's location if not exists
        thisObj.coloursDomain = thisObj.coloursDomain.map((domainValue) => {
            if (locations.includes(domainValue) == false) {
                return EMPTY_COLOUR_DOMAIN_VALUE
            } else {
                return domainValue
            }
        })
        locations.forEach((location) => {
            // if location not in coloursDomain, replace the first EMPTY_COLOUR_DOMAIN_VALUE
            if (thisObj.coloursDomain.includes(location) == false) {
                let firstEmptyIndexOfColourDomain = thisObj.coloursDomain.indexOf(EMPTY_COLOUR_DOMAIN_VALUE);
                thisObj.coloursDomain[firstEmptyIndexOfColourDomain] = location
            }
        })
        thisObj.line = d3.line()
            .x(d => thisObj.xScale(thisObj.getX(d)))
            .y(d => thisObj.yScale(thisObj.getY(d)))
        thisObj.renderVis();
    }
    renderVis() {
        let thisObj = this;
        super.renderVis()

        // reference for multiple lines: https://d3-graph-gallery.com/graph/line_several_group.html
        thisObj.chart.selectAll("path").remove();
        let groupedData = d3.group(thisObj.data, d => d.location);
        // console.log("grouped data for the path:", groupedData);
        thisObj.trackingArea
            .on("mouseenter", () => {
                console.log(d3.selectAll(thisObj.config.toolTipElementId));
                d3.selectAll(thisObj.config.toolTipElementId).style('display', 'block')
                thisObj.tooltip.style("display", "block")
            })
            .on("mouseleave", () => {
                console.log(d3.selectAll(thisObj.config.toolTipElementId));
                thisObj.tooltip.style("display", "none")
                d3.selectAll(thisObj.config.toolTipElementId).style('display', 'none')
            })
            .on("mousemove", function (event) {
                let tooltipData = []
                let xPos = d3.pointer(event, this)[0];
                let time = thisObj.xScale.invert(xPos)
                console.log(xPos, time)
                let groupedData = d3.group(thisObj.data, d => d.location)
                // for each location, get the closest data
                for (let location of groupedData.keys()) {
                    // console.log(location)
                    let locationData = groupedData.get(location);
                    console.log(location, locationData)
                    let index = thisObj.bisect(locationData, time, 1);
                    let a = locationData[index - 1];
                    let b = locationData[index];
                    let d = b && (time - a.time > b.time - time) ? b : a
                    console.log("a,b:", a, b)
                    console.log("d:", d)
                    tooltipData.push({ location: location, value: d.meanDamageValue, time: d.time })
                }
                console.log("tooltipData", tooltipData)
                thisObj.renderToopTip(tooltipData)
                thisObj.renderMaker(tooltipData);
            })
        thisObj.chart.selectAll(".line")
            .data(groupedData)
            .join("path")
            .attr("fill", "none")
            // .transition()
            // .duration(500)
            .attr("stroke", function (d) {
                if (thisObj.highLightedLocation == EMPTY_COLOUR_DOMAIN_VALUE) {
                    return thisObj.colourScale(d[0])
                } else {
                    // console.log(d[0])
                    if (d[0] != thisObj.highLightedLocation) {
                        return NON_HIGHLIGHTED_COLOUR;
                    } else {
                        return thisObj.colourScale(d[0])
                    }
                }
            })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return thisObj.line(d[1])
            })
        updateLineChartLegends(thisObj)
    }

    colourScale(location) {
        let thisObj = this;
        return thisObj.colours[thisObj.coloursDomain.indexOf(location)]
    }
    getLocations() {
        let thisObj = this;
        return Array.from(new Set(thisObj.data.map(d => d.location)))
    }
    highLightLocation(location) {
        let thisObj = this;
        thisObj.highLightedLocation = location;
        thisObj.updateVis();
    }
    disHighLightLocation() {
        let thisObj = this;
        console.log("dishightlight")
        thisObj.highLightedLocation = EMPTY_COLOUR_DOMAIN_VALUE;
        thisObj.updateVis();
    }
    renderToopTip(data) {
        /**
         * render data on the document.querySelector(this.config.tooltipElementId)
         * @param {list} data a list of {location: "1", value: "5.43", time: parseTime("2020/04/10 10:00")}
         * length of data must <= document.querySelector(thisObj.config.toolTipElementId+" tbody").children.length
         */
        let thisObj = this;
        let tbody = document.querySelector(thisObj.config.toolTipElementId + " tbody");
        // console.log("tbody:", tbody)
        // console.log("data.length:", data.length)
        // console.log("tbody.children.length:", tbody.children.length)
        if (data.length <= tbody.children.length) {
            console.log("good to render line chart tool tip")
            for (let i = 0; i < data.length; i++) {
                // console.log(`#line-chart-tooltip-row-${i+1} .line-chart-tooltip-location-name`)
                // console.log(document.querySelector(`#line-chart-tooltip-row-${i+1} .line-chart-tooltip-location-name`))
                document.querySelector(`#line-chart-tooltip-row-${i + 1} .line-chart-tooltip-location-name`).innerText = "location: " + data[i].location
                document.querySelector(`#line-chart-tooltip-row-${i + 1} .line-chart-tooltip-location-value`).innerText = "mean Damage: " + d3.format(".2")(data[i].value)
                document.querySelector(`#line-chart-tooltip-row-${i + 1} .line-chart-tooltip-location-time`).innerText = "time:" + d3.timeFormat("%m-%d %H:%M")(data[i].time)
                document.querySelector(`#line-chart-tooltip-row-${i + 1} .line-chart-tooltip-color-rect`).style.backgroundColor = thisObj.colourScale(data[i].location)
            }
        }
    }
    renderMaker(data) {
        // reference: https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart
        let thisObj = this;
        thisObj.tooltip.
            selectAll('.point')
            .data(data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 8)
            .attr('cx', d => {
                console.log((d.time))
                console.log(thisObj.xScale(d.time))
                return thisObj.xScale(d.time)
            })
            .attr('cy', d => {
                console.log(d.value)
                console.log(thisObj.yScale(d.value))
                return thisObj.yScale(d.value)
            })
            .attr('fill', d => thisObj.colourScale(d.location))
            .attr('stroke', "black")
    }
}

let testTooltipData = [
    { location: "1", value: "5.43", time: parseTime("2020/04/10 10:00") },
    { location: "2", value: "6.6", time: parseTime("2020/04/10 10:00") },
    { location: "3", value: "3.3", time: parseTime("2020/04/10 10:00") }
]