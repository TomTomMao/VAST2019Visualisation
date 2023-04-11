class TimeSeriesData {
  // reference: we used github copilot as guildance to write this class
  constructor(data, timeAttrName, valueAttrName) {
    // data is an array of objects, length should be > 0, timeAttrName and valueAttrName should be the name of the attributes in the objects
    // data[i][timeAttrName] should be a time object
    // data[i][valueAttrName] should be a number
    this.data = data;
    this.timeAttrName = timeAttrName;
    this.valueAttrName = valueAttrName;
    // validation, check if data is an non-empty array of objects
    if (
      !Array.isArray(data) ||
      data.length === 0 ||
      typeof data[0] !== "object"
    ) {
      throw "data should be an non-emptyarray of objects";
    }
    // validation, check if timeAttrName and valueAttrName are the name of the attributes in the objects
    if (
      !data[0].hasOwnProperty(timeAttrName) ||
      !data[0].hasOwnProperty(valueAttrName)
    ) {
      throw "timeAttrName and valueAttrName should be the name of the attributes in the objects";
    }
  }
  getDataAggregatedByInterval(
    intervalLength,
    aggregator,
    startTime = false,
    endTime = false
  ) {
    // return an array of objects: {timeStart: time, timeEnd: time, value: number}
    // intervalLength is the length of the interval, in seconds; it should be smaller than the time difference between the first and last data point
    // by default, the time won't be filtered unless startTime and endTime are provided
    // aggregator is an object of class Aggregator
    // if the intervalLength is greater than the time difference, the intervalLength will be set to the time difference

    // validation, check if intervalLength is a number
    let thisObj = this;
    if (typeof intervalLength !== "number") {
      throw "intervalLength should be a number";
    }
    if (intervalLength <= 0) {
      throw "intervalLength should be positive";
    }
    // validation, check if aggregator is an object of class Aggregator
    if (!(aggregator instanceof Aggregator)) {
      throw "aggregator should be an object of class Aggregator";
    }
    // validation, check if startTime and endTime are time objects
    if (startTime && !(startTime instanceof Date)) {
      throw "startTime should be a time object";
    }
    if (endTime && !(endTime instanceof Date)) {
      throw "endTime should be a time object";
    }
    // validation, check if startTime is smaller than endTime
    if (startTime && endTime && startTime >= endTime) {
      throw "startTime should be smaller than endTime";
    }
    // validation, check if startTime and endTime are within the range of the data
    if (startTime && startTime < thisObj.data[0][thisObj.timeAttrName]) {
      throw "startTime should be within the range of the data";
    }
    if (
      endTime &&
      endTime > thisObj.data[thisObj.data.length - 1][thisObj.timeAttrName]
    ) {
      throw "endTime should be within the range of the data";
    }

    // filter the data by time
    let filteredData;
    if (startTime && endTime) {
      filteredData = thisObj.data.filter(
        (d) =>
          d[thisObj.timeAttrName] >= startTime &&
          d[thisObj.timeAttrName] <= endTime
      );
    } else if (startTime) {
      filteredData = thisObj.data.filter(
        (d) => d[thisObj.timeAttrName] >= startTime
      );
    } else if (endTime) {
      filteredData = thisObj.data.filter(
        (d) => d[thisObj.timeAttrName] <= endTime
      );
    } else {
      filteredData = thisObj.data;
    }

    // sort the filtered data by time
    filteredData.sort(
      (a, b) => a[thisObj.timeAttrName] - b[thisObj.timeAttrName]
    );

    // reset the intervalLength if it is greater than the time difference
    if (
      intervalLength >
      (filteredData[filteredData.length - 1][thisObj.timeAttrName] -
        filteredData[0][thisObj.timeAttrName]) /
        1000
    ) {
      intervalLength =
        (filteredData[filteredData.length - 1][thisObj.timeAttrName] -
          filteredData[0][thisObj.timeAttrName]) /
        1000;
    }

    // calculate the start time and end time of each interval
    let intervalTimes = []; // an array of objects: {timeStart: time, timeEnd: time}
    let intervalStartTime = filteredData[0][thisObj.timeAttrName];

    let intervalEndTime = new Date(
      intervalStartTime.getTime() + intervalLength * 1000
    );
    let endTimeOfFilteredData =
      filteredData[filteredData.length - 1][thisObj.timeAttrName];
    while (
      intervalStartTime < endTimeOfFilteredData &&
      intervalEndTime <= endTimeOfFilteredData
    ) {
      intervalTimes.push({
        timeStart: intervalStartTime,
        timeEnd: intervalEndTime,
      });
      intervalStartTime = intervalEndTime;
      intervalEndTime = new Date(
        intervalStartTime.getTime() + intervalLength * 1000
      );
    }
    if (intervalStartTime < endTimeOfFilteredData) {
      intervalTimes.push({
        timeStart: intervalStartTime,
        timeEnd: endTimeOfFilteredData,
      });
    }
    // console.log(intervalTimes)

    // aggregate the data, left closed and right open
    // assume the filteredData is sorted by time
    // check assumption
    for (let i = 0; i < filteredData.length - 1; i++) {
      if (
        filteredData[i][thisObj.timeAttrName] >
        filteredData[i + 1][thisObj.timeAttrName]
      ) {
        throw "filteredData should be sorted by time";
      }
    }
    let aggregatedData = [];
    let left = 0;
    let right = 0;
    // for each the i to n-1th interval
    for (let i = 0; i < intervalTimes.length - 1; i++) {
      // move the left pointer to the first data point that is greater than or equal to the start time of the first interval
      while (
        left < filteredData.length &&
        filteredData[left][thisObj.timeAttrName] < intervalTimes[i].timeStart
      ) {
        left++;
      }
      // move the right pointer to the last data point that is smaller than the endtime of the first interval
      while (
        right < filteredData.length &&
        filteredData[right][thisObj.timeAttrName] < intervalTimes[i].timeEnd
      ) {
        right++;
      }
      // aggregate the data points between left(included) and right(not included)
      let dataInInterval = filteredData
        .slice(left, right)
        .map((d) => d[thisObj.valueAttrName]);
      let aggregatedValue = aggregator.aggregate(dataInInterval);
      aggregatedData.push({
        timeStart: intervalTimes[i].timeStart,
        timeEnd: intervalTimes[i].timeEnd,
        value: aggregatedValue,
      });
    }
    // for the nth interval
    // move the left pointer to the first data point that is greater than or equal to the start time of the nth interval
    while (
      left < filteredData.length &&
      filteredData[left][thisObj.timeAttrName] <
        intervalTimes[intervalTimes.length - 1].timeStart
    ) {
      left++;
    }
    // move the right pointer to the last data point that is smaller than the endtime of the nth interval
    while (
      right < filteredData.length &&
      filteredData[right][thisObj.timeAttrName] <=
        intervalTimes[intervalTimes.length - 1].timeEnd
    ) {
      right++;
    }
    // aggregate the data points between left(included) and right(included)
    let dataInInterval = filteredData
      .slice(left, right)
      .map((d) => d[thisObj.valueAttrName]);
    let aggregatedValue = aggregator.aggregate(dataInInterval);
    aggregatedData.push({
      timeStart: intervalTimes[intervalTimes.length - 1].timeStart,
      timeEnd: intervalTimes[intervalTimes.length - 1].timeEnd,
      value: aggregatedValue,
    });

    return aggregatedData;
  }
  getGroupedData(aggregator, startTime, endTime, groupBy = "location") {
    // return {timeStart: time, timeEnd: time, aggregatorType: aggregator.aggregatorType, groupByAtrribute: groupBy,groupedData: a map from location to aggregated value}
    // startTime and endTime should be Date objects, startTime should be smaller than endTime;
    // aggregator is an object of Aggregator class (mean or count)
    // groupBy is a string, the name of the attribute that the data is grouped by; they would apply on the data[valueAttrName]]
    // All the group would be in groupedData, if a gorup does not have any data point, the aggregated value would be null
    // the aggregated value would be the aggregated value of the data points that are in the time interval [startTime, endTime)
    // reference: https://observablehq.com/@d3/d3-group

    let thisObj = this;
    if (groupBy == "location") {
      var GROUPKEYS = VALID_LOCATION;
    } else if (groupBy == "facility") {
      var GROUPKEYS = VALID_FACILITIES;
    }
    if (thisObj.sortedDataByTime === undefined) {
      thisObj.sortedDataByTime = thisObj.data.sort(
        (a, b) => a[thisObj.timeAttrName] - b[thisObj.timeAttrName]
      );
    }
    let startTimePoint = thisObj.sortedDataByTime.findIndex(
      (d) => d[thisObj.timeAttrName] >= startTime
    );
    let endTimePoint = thisObj.sortedDataByTime.findIndex(
      (d) => d[thisObj.timeAttrName] >= endTime
    );
    if (aggregator.aggregatorType === "mean") {
      var groupedData = d3.rollup(
        thisObj.sortedDataByTime.slice(startTimePoint, endTimePoint),
        (v) => d3.mean(v, (d) => d.damage_value),
        (d) => d[groupBy]
      );
    } else if (aggregator.aggregatorType === "std") {
      var groupedData = d3.rollup(
        thisObj.sortedDataByTime.slice(startTimePoint, endTimePoint),
        (v) => d3.deviation(v, (d) => d.damage_value),
        (d) => d[groupBy]
      );
    } else if (aggregator.aggregatorType === "count") {
      var groupedData = d3.rollup(
        thisObj.sortedDataByTime.slice(startTimePoint, endTimePoint),
        (v) => v.length,
        (d) => d[groupBy]
      );
    } else {
      throw "aggregator type not supported";
    }
    // add null to the group that does not have any data point
    for (let i = 0; i < GROUPKEYS.length; i++) {
      if (groupedData.get(GROUPKEYS[i]) === undefined) {
        groupedData.set(GROUPKEYS[i], null);
      }
    }

    return {
      timeStart: startTime,
      timeEnd: endTime,
      aggregatorType: aggregator.aggregatorType,
      groupByAtrribute: groupBy,
      groupedData: groupedData
    };
  }
}
// mean and count is tested. the others are not tested
class Aggregator {
  constructor() {}
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

class StdAggregator extends Aggregator {
  constructor() {
    super();
    this.aggregatorType = "std";
  }
  aggregate(data) {
    // data is an array of value, return the standard deviation of the array
    return d3.deviation(data);
  }
}
