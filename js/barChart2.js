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
        thisObj.order = "major";
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
        thisObj.updateVis();
    }
    updateVis() {
        let thisObj = this;
        super.updateVis();
        thisObj.getMajorX = (d) => d[thisObj.major];
        thisObj.getMinorX = (d) => d[thisObj.minor];
        thisObj.getY = (d) => d.location

        // update scale domains
        thisObj.xScaleMajor.domain(d3.extent(thisObj.data[thisObj.major], thisObj.getMajorX));
        console.log(thisObj.xScaleMajor);
        thisObj.xScaleMinor.domain(d3.extent(thisObj.data[thisObj.minor], thisObj.getMinorX));
        console.log(thisObj.xScaleMinor);
        if (thisObj.order=="major") {
            thisObj.yScale.domain(thisObj.data[thisObj.major].map(thisObj.getY))
        } else if (thisObj.order=="minor") {
            thisObj.yScale.domain(thisObj.data[thisObj.minor].map(thisObj.getY))
        } else if (thisObj.order=="location") {
            thisObj.yScale.domain(VALID_LOCATIONS.filter((d)=>d!="all"))
        }
        thisObj.renderVis()
    }
    renderVis() {
        let thisObj = this;
        super.renderVis();
        thisObj.xAxisGMajor.call(thisObj.xAxisMajor);
        thisObj.xAxisGMinor.call(thisObj.xAxisMinor);
        thisObj.yAxisG.call(thisObj.yAxis);
    }
    setMajor(major) {
        /**
         * @param {string} major "meanDamageValue", "count", "std"
         */
        let thisObj = this;
        thisObj.major = major;
    }
    setMinor(minor) {
        /**
         * @param {string} minor "meanDamageValue", "count", "std"
         */
        let thisObj = this;
        thisObj.minor = minor;
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
        console.log(data)
        VALID_LOCATIONS.forEach((valid_location) => {
            if (valid_location == "all") {

            } else {

                if (data.meanDamageValue.hasOwnProperty(valid_location) == false) {
                    data.meanDamageValue.push({ location: valid_location, meanDamageValue: DEFAULT_MEANDAMAGEVALUE_FOR_BAR_CHART_2 })
                }
                if (data.count.hasOwnProperty(valid_location) == false) {
                    data.count.push({ location: valid_location, count: DEFAULT_COUNT_FOR_BAR_CHART_2 });
                }
                if (data.std.hasOwnProperty(valid_location) == false) {
                    data.std.push({ location: valid_location, std: DEFAULT_STD_FOR_BAR_CHART_2 })
                }
            }
        })
        thisObj.data = data;
    }
    sort(attribute) {
        let thisObj = this;
        thisObj.order = attribute;
        if (attribute=="major") {
            thisObj.data[thisObj.major].sort((a,b)=>{
                return a[thisObj.major] - b[thisObj.major]
            })
        } else if (attribute=="minor") {
            thisObj.data[thisObj.minor].sort((a,b)=>{
                return a[thisObj.minor] - b[thisObj.minor]
            })
        }
        thisObj.updateVis()
    }
}