class TimeSeriesData {
    // reference: we used github copilot as guildance to write this class
    constructor(data, timeAttrName, valueAttrName){
        // data is an array of objects, length should be > 0, timeAttrName and valueAttrName should be the name of the attributes in the objects
        // data[i][timeAttrName] should be a time object
        // data[i][valueAttrName] should be a number
        this.data = data;
        this.timeAttrName = timeAttrName;
        this.valueAttrName = valueAttrName;
        // validation, check if data is an non-empty array of objects
        if(!Array.isArray(data) || data.length === 0 || typeof data[0] !== "object") {
            throw "data should be an non-emptyarray of objects";
        }
        // validation, check if timeAttrName and valueAttrName are the name of the attributes in the objects
        if(!data[0].hasOwnProperty(timeAttrName) || !data[0].hasOwnProperty(valueAttrName)) {
            throw "timeAttrName and valueAttrName should be the name of the attributes in the objects";
        }
    }
    getDataAggregatedByInterval(intervalLength, aggregator, startTime=false, endTime=false) {
        // return an array of objects: {timeStart: time, timeEnd: time, value: number}
        // intervalLength is the length of the interval, in seconds; it should be smaller than the time difference between the first and last data point
        // by default, the time won't be filtered unless startTime and endTime are provided
        // aggregator is an object of class Aggregator
        // if the intervalLength is greater than the time difference, the intervalLength will be set to the time difference

        // validation, check if intervalLength is a number
        let thisObj = this;
        if(typeof intervalLength !== "number") {
            throw "intervalLength should be a number";
        }
        if (intervalLength <= 0) {
            throw "intervalLength should be positive";
        }
        // validation, check if aggregator is an object of class Aggregator
        if(!(aggregator instanceof Aggregator)) {
            throw "aggregator should be an object of class Aggregator";
        }
        // validation, check if startTime and endTime are time objects
        if(startTime && !(startTime instanceof Date)) {
            throw "startTime should be a time object";
        }
        if(endTime && !(endTime instanceof Date)) {
            throw "endTime should be a time object";
        }
        // validation, check if startTime is smaller than endTime
        if(startTime && endTime && startTime >= endTime) {
            throw "startTime should be smaller than endTime";
        }
        // validation, check if startTime and endTime are within the range of the data
        if(startTime && startTime < thisObj.data[0][thisObj.timeAttrName]) {
            throw "startTime should be within the range of the data";
        }
        if(endTime && endTime > thisObj.data[thisObj.data.length - 1][thisObj.timeAttrName]) {
            throw "endTime should be within the range of the data";
        }

        // filter the data by time
        let filteredData;
        if(startTime && endTime) {
            filteredData = thisObj.data.filter((d) => d[thisObj.timeAttrName] >= startTime && d[thisObj.timeAttrName] <= endTime);
        } else if(startTime) {
            filteredData = thisObj.data.filter((d) => d[thisObj.timeAttrName] >= startTime);
        } else if(endTime) {
            filteredData = thisObj.data.filter((d) => d[thisObj.timeAttrName] <= endTime);
        } else {
            filteredData = thisObj.data;
        }
        
        // sort the filtered data by time
        filteredData.sort((a, b) => a[thisObj.timeAttrName] - b[thisObj.timeAttrName]);

        // reset the intervalLength if it is greater than the time difference
        if (intervalLength > (filteredData[filteredData.length - 1][thisObj.timeAttrName] - filteredData[0][thisObj.timeAttrName]) / 1000) {
            intervalLength = (filteredData[filteredData.length - 1][thisObj.timeAttrName] - filteredData[0][thisObj.timeAttrName]) / 1000;
        }

        // calculate the start time and end time of each interval
        let intervalTimes = []; // an array of objects: {timeStart: time, timeEnd: time}
        let intervalStartTime = filteredData[0][thisObj.timeAttrName];
        console.log(intervalStartTime)
        let intervalEndTime = new Date(intervalStartTime.getTime() + intervalLength * 1000);
        let endTimeOfFilteredData = filteredData[filteredData.length - 1][thisObj.timeAttrName];
        while(intervalStartTime < endTimeOfFilteredData && intervalEndTime <= endTimeOfFilteredData) {
            intervalTimes.push({timeStart: intervalStartTime, timeEnd: intervalEndTime});
            intervalStartTime = intervalEndTime;
            intervalEndTime = new Date(intervalStartTime.getTime() + intervalLength * 1000);
        }
        if(intervalStartTime < endTimeOfFilteredData) {
            intervalTimes.push({timeStart: intervalStartTime, timeEnd: endTimeOfFilteredData});
        }
        console.log(intervalTimes)
        return intervalTimes.map((intervalTime) => {
            // for each interval, aggregate the data
            let dataInInterval = filteredData.filter((d) => d[thisObj.timeAttrName] >= intervalTime.timeStart && d[thisObj.timeAttrName] < intervalTime.timeEnd);
            console.log(dataInInterval);
            console.log(dataInInterval.map((d) => d[thisObj.valueAttrName]));
            return {timeStart: intervalTime.timeStart, timeEnd: intervalTime.timeEnd, value: aggregator.aggregate(dataInInterval.map((d) => d[thisObj.valueAttrName]))};
        });


    }
}

class Aggregator {
    constructor() {

    }
    aggregate(data) {
        // data is an array of value, aggregate by the method of this aggregator
    }
}

class MeanAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "mean";
    }
    aggregate(data) {
        // data is an array of value, return the mean of the array
        return d3.mean(data);
    }
}

class MaxAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "max";
    }
    aggregate(data) {
        // data is an array of value, return the max of the array
        return d3.max(data);
    }
}

class MinAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "min";
    }
    aggregate(data) {
        // data is an array of value, return the min of the array
        return d3.min(data);
    }
}

class SumAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "sum";
    }
    aggregate(data) {
        // data is an array of value, return the sum of the array
        return d3.sum(data);
    }
}

class CountAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "count";
    }
    aggregate(data) {
        // data is an array of value, return the count of the array
        return data.length;
    }
}

class stdAggregator extends Aggregator {
    constructor() {
        super();
        this.aggregatorType = "std";
    }
    aggregate(data) {
        // data is an array of value, return the standard deviation of the array
        return d3.deviation(data);
    }
}