let data_long;
let parseTime = d3.timeParse("%Y/%m/%d %H:%M");
let t1;
let t2;
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
    if (sortedLongData.length == 0) {
        throw new Error("sortedLongData.length must be >= 1")
    }
    if (isSortedByTime(sortedLongData) == false) {
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
    console.log(locationMeanData)
    // locationMeanData: [{location:String(int), time: timeObj, meanDamageValue: int}]

    return [totalMeanData,locationMeanData].flat().filter((d)=>locations.includes(d.location))
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