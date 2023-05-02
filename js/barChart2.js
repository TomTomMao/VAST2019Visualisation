class BarChart2 extends BaseChart {
    constructor(config, data, major, minor) {
        /**
         * @param {object} data something like this: {mean: [{location:str, meanDamageValue: int}], count:[{location: str, count: int}], std:[{location: str, std:int}]}
         * @param {string} major "meanDamageValue", "count", "std"
         * @param {string} minor "meanDamageValue", "count", "std"
        */
        super(config, data)
        let thisObj = this;
        thisObj.setData(data)
        thisObj.config.titleElementId = config.titleElementId;
        thisObj.config.legendElementId = config.legendElementId;
        thisObj.major = major;
        thisObj.minor = minor;
        thisObj.initVis();
        
    }
    initVis() {
        let thisObj = this;
        super.initVis();

        //reference: https://www.tutorialsteacher.com/d3js/create-bar-chart-using-d3js?utm_content=cmp-true
        // x scale Major
        thisObj.xScaleMajor = d3.scaleLinear().range([0, thisObj.width]);
        // x axis Major
        thisObj.xAxisMajor = d3.axisTop(thisObj.xScaleMajor)
        // x axis group Major
        thisObj.xAxisGMajor = thisObj.chart.append("g").attr("class", "axis x-axis-major")

        // x scale Minor
        thisObj.xScaleMinor = d3.scaleLinear().range([0, thisObj.width]);
        // x axis Minor
        thisObj.xAxisMinor = d3.axisBottom(thisObj.xScaleMinor);
        // x axis group Minor
        thisObj.xAxisGMinor = thisObj.chart.append("g").attr("class", "axis x-axis-minor")
            .attr("transform", `translate(0,${thisObj.height})`);

        // y scale
        thisObj.yScale = d3.scaleBand().range([thisObj.height, 0])
        // y axis
        thisObj.yAxis = d3.axisLeft(thisObj.yScale)
        // y axis group
        thisObj.yAxisG = thisObj.chart.append("g").attr("class", "axis y-axis")
        thisObj.sort("major", true); // set order
        thisObj.updateVis();
    }
    updateVis() {
        let thisObj = this;
        super.updateVis();
        thisObj.getMajorX = (d) => d[thisObj.major];
        thisObj.getMinorX = (d) => d[thisObj.minor];
        thisObj.getY = (d) => d.location

        // update scale domains
        thisObj.xScaleMajor.domain([0, d3.max(thisObj.getMajorData(), thisObj.getMajorX)]);
        // console.log(thisObj.xScaleMajor);
        thisObj.xScaleMinor.domain([0, d3.max(thisObj.getMinorData(), thisObj.getMinorX)]);
        // console.log(thisObj.xScaleMinor);
        if (thisObj.order == "major") {
            thisObj.yScale.domain(thisObj.getMajorData().map(thisObj.getY))
        } else if (thisObj.order == "minor") {
            thisObj.yScale.domain(thisObj.getMinorData().map(thisObj.getY))
        } else if (thisObj.order == "location") {
            if (thisObj.desc == true) {
                thisObj.yScale.domain(VALID_LOCATIONS.filter((d) => d != "all"))
            } else {
                thisObj.yScale.domain(VALID_LOCATIONS.filter((d) => d != "all").reverse())
            }
        }
        thisObj.renderVis()
    }
    renderVis() {
        let thisObj = this;
        super.renderVis();

        // this class is inherited from baseChart which don't render any axis
        thisObj.xAxisGMajor.call(thisObj.xAxisMajor);
        thisObj.xAxisGMinor.call(thisObj.xAxisMinor);
        thisObj.yAxisG.call(thisObj.yAxis);

        // render bars, partially reference: https://github.com/michael-oppermann/d3-learning-material/blob/main/d3-examples/d3-interactive-bar-chart/js/barchart.js
        // major bar
        thisObj.chart.selectAll(".major-bar")
            .data(thisObj.getMajorData())
            .join('rect')
            .attr('class', 'major-bar')
            .transition()
            .duration(1000)
            .attr('x', 0)
            .attr('y', (d) => thisObj.yScale(thisObj.getY(d)))
            .attr('height', thisObj.yScale.bandwidth())
            .attr('width', (d) => {
                return thisObj.xScaleMajor(thisObj.getMajorX(d))
            })

        // minor bar
        thisObj.chart.selectAll(".minor-bar")
            .data(thisObj.getMinorData())
            .join('rect')
            .attr('class', 'minor-bar')
            .transition()
            .duration(1000)
            .attr('x', 0)
            .attr('y', (d) => thisObj.yScale(thisObj.getY(d)) + thisObj.yScale.bandwidth() / 4)
            .attr('height', thisObj.yScale.bandwidth() / 2)
            .attr('width', (d) => {
                return thisObj.xScaleMinor(thisObj.getMinorX(d))
            })
            
    }
    setMajor(major) {
        /**
         * @param {string} major "meanDamageValue", "count", "std"
         */
        let thisObj = this;
        thisObj.major = major;
        thisObj.updateVis()
    }
    setMinor(minor) {
        /**
         * @param {string} minor "meanDamageValue", "count", "std"
         */
        let thisObj = this;
        thisObj.minor = minor;
        thisObj.updateVis()
    }
    setData(data) {
        /**
         * @param {object} data something like this: {meanDamageValue: [{location:str, meanDamageValue: int}], count:[{location: str, count: int}], std:[{location: str, std:int}]}
        if location missed, they would be set as 0 
        */
        let thisObj = this;

        if (["meanDamageValue", "count", "std"].every((d) => { return data.hasOwnProperty(d) }) == false) {
            throw new Error(`data must have all three property: "meanDamageValue", "count", "std", but the data is: ${data}`)
        }
        // set missed location
        // console.log(data)
        VALID_LOCATIONS.forEach((valid_location) => {
            if (valid_location == "all") {

            } else {

                if (data.meanDamageValue.map((d) => d.location != valid_location).length == 0) {
                    data.meanDamageValue.push({ location: valid_location, meanDamageValue: DEFAULT_MEANDAMAGEVALUE_FOR_BAR_CHART_2 })
                }
                if (data.count.map((d) => d.location != valid_location).length == 0) {
                    data.count.push({ location: valid_location, count: DEFAULT_COUNT_FOR_BAR_CHART_2 });
                }
                if (data.std.map((d) => d.location != valid_location).length == 0) {
                    data.std.push({ location: valid_location, std: DEFAULT_STD_FOR_BAR_CHART_2 })
                }
            }
        })
        thisObj.data = data;
    }
    getMajorData() {
        let thisObj = this;
        return thisObj.data[thisObj.major]
    }
    getMinorData() {
        let thisObj = this;
        return thisObj.data[thisObj.minor]
    }
    sort(attribute, desc = true) {
        /**
         * @param {str} attribute "major" or "minor" or "location"
         */
        
        let thisObj = this;
        thisObj.order = attribute;
        thisObj.desc = desc;
        if (attribute == "major") {
            thisObj.getMajorData().sort((a, b) => {
                if (desc == true) {
                    return a[thisObj.major] - b[thisObj.major]
                } else {
                    return b[thisObj.major] - a[thisObj.major]
                }
            })
        } else if (attribute == "minor") {
            thisObj.getMinorData().sort((a, b) => {
                if (desc == true) {
                    return a[thisObj.minor] - b[thisObj.minor]
                } else {
                    return b[thisObj.minor] - a[thisObj.minor]
                }
            })
        } else if(attribute=="location"){
            console.log("sort by group name")
        } else {
            throw new Error("invalid attribute for sorting barchart")
        }
        thisObj.updateVis()
    }
}