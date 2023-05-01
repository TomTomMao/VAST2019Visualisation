let data_long;
let parseTime = d3.timeParse("%Y/%m/%d %H:%M");
let t1;
let t2;
let tMin;
let tMax;
let lineChart;
let barChart1;
let barChart2;
let areaChart;
async function main() {
    console.log("[test main.js]helo")
    data_long = await d3.csv("data/data_long.csv")
    console.log("[test data loading]", data_long)
    console.log("[test parseTime]", parseTime(data_long[0].time))
    data_long.forEach((d) => {
        try {
            d.timeStr = d.time;
            d.time = parseTime(d.time);
            d.damageValue = parseInt(d.damage_value)
        } catch {
            console.log("ERROR", d)
        }
    })
    data_long = data_long.sort((a, b) => {
        return a.time - b.time;
    })

    // for testing in console
    t1 = data_long[30000].time;
    t2 = data_long[40000].time;
    tMin = data_long[0].time;
    tMax = data_long[data_long.length - 1].time
    // some assertion
    if (DEVMODE && tMin - d3.min(data_long, d => d.time) != 0) {
        throw new Error("data_long[0].time != d3.min(data_long, d=>d.time), sorted data is not correct")
    }
    if (DEVMODE && tMax - d3.max(data_long, d => d.time) != 0) {
        throw new Error("data_long[data_long.length - 1].time != d3.max(data_long, d=>d.time), sorted data is not correct")
    }

    lineChart = new LineChart(config = LINECHART_CONFIG,
        data = getLineChartData(data_long, tMin, tMax, ["all", "1"]), { startTime: tMin, endTime: tMax })
    areaChart = new AreaChart(config = AREACHART_CONFIG,
        data = getAreaChartData(data_long, tMin, tMax, "1"), { startTime: tMin, endTime: tMax })
    barChart2 = new BarChart2(config = BARCHART2_CONFIG,
        data = getBarChart2Data(data_long, tMin, tMax, "all"), major = "meanDamageValue", minor = "std")
    document.querySelector(barChart2.config.titleElementId).innerHTML = `Aggregated Damage & Uncertainty<br>Between ${d3.timeFormat("%m-%d %H:%M")(tMin)} to ${d3.timeFormat("%m-%d %H:%M")(tMax)}`
}

// LINE chart functions
function changeLineChart(startTime, endTime, locations, chart = lineChart) {
    chart.setTime({ startTime: startTime, endTime: endTime });
    chart.data = getLineChartData(data_long, startTime, endTime, locations)
    chart.updateVis();

}
function getLineChartData(sortedLongData, startTime, endTime, locations) {
    /**
     * 
     * return a lng data from longData for multi-lines line chart, filtered by time. both side included
     * The return data have columns: location, timeStr, meanDamageValue;
     * The data are aggregated by averaging all facities of a time together
     * @param {Array} sortedLongData Long data include location, time, damageValue, facility; Assume already sorted by time
     * @param {object} startTime 
     * @param {object} endTime Long data include location, time, damageValue, facility; Assume already sorted by time
     * @param {object} locations Long data include location, time, damageValue, facility; Assume already sorted by time 
    */
    if (DEVMODE && sortedLongData.length == 0) {
        throw new Error("sortedLongData.length must be >= 1")
    }
    if (DEVMODE && isSortedByTime(sortedLongData) == false) {
        throw new Error("sortedLongData is not sorted")
    }
    let filteredData = filterSortedDataByTime(sortedLongData, startTime, endTime);
    // console.log(filteredData)
    let totalMeanData = Array.from(d3.rollup(filteredData, v => d3.mean(v, d => d.damageValue), d => d.timeStr)).map((d) => { return { location: "all", time: parseTime(d[0]), meanDamageValue: d[1] } })
    // totalMeandata: [{location:"all", time: timeobj, meanDamageValue: int}]
    let locationMeanData = Array.from(d3.rollup(filteredData, v => d3.mean(v, d => d.damageValue), d => d.location, d => d.timeStr))
        .map((d) => {
            return Array.from(d[1])
                .map((e) => { return { location: d[0], time: parseTime(e[0]), meanDamageValue: e[1] } })
        }).flat()
    // console.log(locationMeanData)
    // locationMeanData: [{location:String(int), time: timeObj, meanDamageValue: int}]

    return [totalMeanData, locationMeanData].flat().filter((d) => locations.includes(d.location))
}

// AREA chart functions
function changeAreaChart(startTime, endTime, location, chart = areaChart) {
    chart.setTime({ startTime: startTime, endTime: endTime });
    chart.data = getAreaChartData(data_long, startTime, endTime, location);
    chart.updateVis()
}

function getAreaChartData(sortedLongData, startTime, endTime, location) {
    // return long data: facility, location, time, meanDamageValue
    if (VALID_LOCATIONS.includes(location) == false) {
        throw new Error("invalid locations, they must be in VALID_LOCATIONS")
    }
    if (sortedLongData.length == 0) {
        throw new Error("sortedLongData.length must be >= 1")
    }
    if (isSortedByTime(sortedLongData) == false) {
        throw new Error("sortedLongData is not sorted")
    }
    let filteredData = filterSortedDataByTime(sortedLongData, startTime, endTime)

    let rolledData = d3.rollup(filteredData, v => d3.mean(v, d => d.damageValue), d => d.location, d => d.facility, d => d.timeStr)
    let locationData = rolledData.get(location)
    // convert 
    if (locationData == undefined) {
        return []
    } else {
        let longData = Array.from(locationData).
            map(d => {
                return Array.from(d[1])
                    .map(e => { return { location: location, facility: d[0], timeStr: e[0], time: parseTime(e[0]), meanDamageValue: e[1] } })
            }).flat()
        return longData;
    }
}


// bar chart 2 functions
function changeBarChart2(startTime, endTime, major, minor, order, desc, chart = barChart2) {
    // update bar chart, and update the bar chart title
    chart.setData(getBarChart2Data(data_long, startTime, endTime, type = "all"))
    chart.setMajor(major);
    chart.setMinor(minor);
    chart.sort(order, desc)

}

function getBarChart2Data(sortedLongData, startTime, endTime, type = "all") {
    /**
     * @param {str} type it should be either "meanDamageValue", "count", or "std" or "all"
     */


    let filteredData = filterSortedDataByTime(sortedLongData, startTime, endTime);

    let rolledDataMean = d3.rollup(filteredData, v => d3.mean(v, d => d.damageValue), d => d.location)
    let flatMean = Array.from(rolledDataMean).map(d => { return { location: d[0], meanDamageValue: d[1] } })
    let rolledDataCount = d3.rollup(filteredData, v => d3.count(v, d => d.damageValue), d => d.location)
    let flatCount = Array.from(rolledDataCount).map(d => { return { location: d[0], count: d[1] } })
    let rolledDataStd = d3.rollup(filteredData, v => d3.deviation(v, d => d.damageValue), d => d.location)
    let flatStd = Array.from(rolledDataStd).map(d => { return { location: d[0], std: d[1] } })
    if (type == "all") {
        return { meanDamageValue: flatMean, count: flatCount, std: flatStd }
    } else {
        return { meanDamageValue: flatMean, count: flatCount, std: flatStd }[type]
    }
    // return value looks like: [{location: str, type: int}]
}

// bar chart 1 functions

function getBarChart1Data(sortedLongData, startTime, endTime, timeLengthInMinutes, dataType, location) {
    /**
     * return the data between the time startTime and endTime. Time is like: [startTime, startTime+timeLengthInMinutes) , [ startTime+timeLengthInMinutes, startTime+2*timeLengthInMinutes)... + [startTime+(n-1)*timeLengthInMinutes, endTime]
     * if location == "all", the data only be filtered by the time,
     * if location is an actual location, it would be filtered by both the location and time
     * The filtered data would include the startTime and endTime.
     * @param {Array} location must be one of the value in VALID_LOCATIONS, 
     * @param {object} startTime a time object
     * @param {object} endTime a time object
     * @param {int} timeLengthInMinutes a int for time in minutes
     * @param {str} dataType either be meanDamageValue, count, or std
     * return: [{timeStartStr: "2020/04/07 11:10", 
     *              timeEndStr:"2020/04/07 11:25", 
     *              timeStart: parseTime("2020/04/07 11:10"), 
     *              timeEnd: parseTime("2020/04/07 11:25"), 
     *              location: location
     *              dataType: meanDamageValue or count or std,
     *              dataValue: int}]
     */

    // filter data step by step, first filter the location, then filtere the time.
    let filteredData = sortedLongData; // The filteredData should always be sorted
    console.log("copyed from sortedLongData:", filteredData)
    if (DEVMODE == true && isSortedByTime(filteredData) == false) {
        throw new Error("the data must be sorted by time")
    }
    if (DEVMODE == true && VALID_LOCATIONS.includes(location) == false) {
        throw new Error
    }
    if (location != "all") {
        // filter the data only with that location
        filteredData = filteredData.filter((d) => d.location == location)
    }
    console.log("filtered location:", filteredData)

    // check if filteredData is still sorted to avoid silent error.
    if (DEVMODE == true && isSortedByTime(filteredData) == false) {
        throw new Error("the data must be sorted by time")
    }

    // filter the time
    filteredData = filteredData.filter((d) => {
        return startTime <= d.time && d.time <= endTime
    })
    console.log("filtered by time, filteredData:", filteredData)

    let intervals = createTimeInterval(startTime, endTime, timeLengthInMinutes);
    console.log("intervals:", intervals);

    let intervalPointer = 0;
    filteredData.forEach((d) => {
        // keep increment intervalPointer until the time in the intervals[intervalPointer] 
        while (intervals[intervalPointer].isInside(d.time) == false) {
            intervalPointer += 1;
        }
        d.interval = intervals[intervalPointer]
        d.timeIntervalStr = d.interval.toString()
    })
    // each entry of filteredData has a time Interval object and a timeIntervalStr
    let getReducer = (dataType) => {
        if (dataType == "meanDamageValue") {
            return d3.mean
        } else if (dataType == "count") {
            return d3.count
        } else if (dataType == "std") {
            return d3.deviation
        }
    }
    let rolledMap = d3.rollup(filteredData, v => getReducer(dataType)(v, d => d.damageValue), d => d.timeIntervalStr)
    console.log("rolled", rolledMap)
    let rolledArray = Array.from(rolledMap).map((d) => {
        timeStartStr = d[0].split(", ")[0].slice(1)
        timeEndStr = d[0].split(", ")[1].slice(0,-1)
        return {
            timeStartStr: timeStartStr,
            timeEndStr: timeEndStr,
            timeStart: parseTime(timeStartStr),
            timeEnd: parseTime(timeEndStr),
            dataType: dataType,
            location: location,
            dataValue: d[1]
        }
    })
    console.log("rolled", rolledMap)
    return rolledArray
}

// helpers
class TimeInterval {
    constructor(start, end, leftInclude, rightInclude) {
        this.startTime = start;
        this.endTime = end;
        this.leftInclude = leftInclude;
        this.rightInclude = rightInclude;
    }
    isInside(time) {
        let matchLeft;
        let matchRight;
        if (this.leftInclude == true) {
            matchLeft = time >= this.startTime;
        } else {
            matchleft = time > this.startTime;
        }
        if (this.rightInclude == true) {
            matchRight = time <= this.endTime;
        } else {
            matchRight = time < this.endTime;
        }
        return matchLeft && matchRight
    }
    getStartTime() {
        return this.startTime
    }
    getEndTime() {
        return this.endTime
    }
    toString() {
        let timeToString = d3.timeFormat("%Y/%m/%d %H:%M");
        let leftTime = timeToString(this.getStartTime());
        let rightTime = timeToString(this.getEndTime());
        if (this.leftInclude == true) {
            var leftBracket = "[";
        } else {
            var leftBracket = "(";
        }
        if (this.rightInclude == true) {
            var rightBracket = "]";
        } else {
            var rightBracket = ")";
        }
        return `${leftBracket}${leftTime}, ${rightTime}${rightBracket}`
    }

}
function createTimeInterval(startTime, endTime, timeLengthInMinutes) {
    /**
     * @param {object} startTime a time object
     * @param {object} endTime a time object
     * @param {int} timeLengthInMinutes a int for time in minutes
     * create an array of time span
     * two cases
     * If startTime > endTime: return an empty list
     * CASE1 startTime + timeLengthInMinutes >= endTime: 
     * [{startTime: startTime, endTime: endTime, leftInclude: true, rightInclude: true}]
     * CASE2 startTime + timeLengthInMinutes < endTime:
     * [
     *    {startTime: startTime, endTime: startTime+timeLengthInMinutes, leftInclude: true, rightInclude: false}, 
     *    {startTime: startTime+timeLengthInMinutes, endTime: startTime+2*timeLengthInMinutes, leftInclude: true, rightInclude: false}, 
     *     ..., 
     *    {startTime: startTime+(n-1)*timeLengthInMinutes, endTime: endTime, leftInclude: true, rightInclude: true}
     * ]
     * 
     * return empty list
    */

    let intervals = []
    if (startTime >= endTime) {
        return []
    }
    if (d3.timeMinute.offset(startTime, timeLengthInMinutes) >= endTime) {
        intervals.push(new TimeInterval(startTime, endTime, true, true))
        console.log("flag1")
    } else if (d3.timeMinute.offset(startTime, timeLengthInMinutes) < endTime) {
        console.log("flag2")
        let leftTime = startTime;
        let rightTime = d3.timeMinute.offset(leftTime, timeLengthInMinutes);
        while (rightTime < endTime) {
            intervals.push(new TimeInterval(leftTime, rightTime, true, false))
            leftTime = rightTime;
            rightTime = d3.timeMinute.offset(rightTime, timeLengthInMinutes)
        }
        if (rightTime >= endTime) {
            intervals.push(new TimeInterval(leftTime, endTime, true, true))
        }
    }
    return intervals
}

function filterSortedDataByTime(sortedLongData, startTime, endTime) {
    /**
     * filter the data by time, time complexity is O(n)
     * @param {Array} sortedLongData a long data which is sorted by time. every element has a time attribute, it should be sorted
     */
    return sortedLongData.filter((d) => {
        return startTime <= d.time && d.time <= endTime
    })
}

function isSortedByTime(data) {
    // reference: https://codehandbook.org/check-if-an-array-sorted-javascript/
    let right;
    for (let left = 0; left < data.length - 1; left++) {
        right = left + 1
        try {
            if (data[right].time - data[left].time < 0) return false;
        } catch (error) {
            console.log(left, data[left])
            console.log(right, data[right])
        }
    }
    return true;
}
main()