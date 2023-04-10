class TimeBrusher {
    constructor(timeChangerFuncs, parentElementId, data) {
        // timeChangerFuncs is an array of functions that change the time, they are called when the brush is moved
        this.timeChangerFuncs = timeChangerFuncs;
        this.parentElementId = parentElementId;
        this.data = data;
        this.filteredData = data.filter((d) => d); 
        this.intervalData;
        this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        this.CONTAINER_WIDTH = 1000;
        this.CONTAINER_HEIGHT = 100;
        this.valueType = "meanDamage";
        this.candidateValueTypes = ["meanDamage", "maxDamage", "minDamage", "stdDamage", "numberOfReports"];
        this.location = "All";
        this.candidateLocations = ["All"]
        for(let i = 1; i <= NUMBER_OF_LOCATION; i++) {
            this.candidateLocations.push(i);
        }
    }
    initVis() {

    }
    updataVis() {

    }
    renderVis() {
        // render the this.valueType value of the data, grouped by time, as an area chart.
        console.log(this.filteredData)
    }
    changeLocation(location) {
        // change the location of the data to be displayed
        // location should be int or "All"
        let thisObj = this;
        if (location === "All") {
            thisObj.filteredData = thisObj.data.filter((d) => d);
            return true;
        } else if (typeof location === "number" && location >= 1 && location <= NUMBER_OF_LOCATION) {
            thisObj.filteredData = thisObj.data.filter((d) => d.location === location);
            return true;
        } else {
            return false;
        }
    }
}