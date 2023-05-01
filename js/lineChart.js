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
        // thisObj.colourScale = d3.scaleOrdinal().range(d3.schemeSet1);
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
            if(locations.includes(domainValue) == false) {
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
                    if (d[0]!= thisObj.highLightedLocation) {
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
    // colourScale(location) {
    //     let thisObj = this;
    //     let sortedLocations = thisObj.getLocations().sort((a,b)=>{
    //         if (a === "all") {
    //             return true
    //         } else {
    //             return parseInt(a) - parseInt(b)
    //         }
    //     })
    //     let index = sortedLocations.indexOf(location)
    //     return thisObj.colours[index]
    // }
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

}