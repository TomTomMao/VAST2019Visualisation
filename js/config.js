const DEVMODE = true;
const VALID_LOCATIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "all"];
const VALID_FACILITIES = ['sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings'];
const VALID_FACILITIES_INDEX = []
for(let i = 1; i <= VALID_FACILITIES.length; i++) {
    VALID_FACILITIES_INDEX.push(i)
}
const LINECHART_CONFIG = {
    parentElementId: "#line-chart-svg",
    containerWidth: 1200,
    containerHeight: 400,
    margin: { left: 40, top: 20, right: 30, bottom: 20 },
    toolTipElementId: "#line-chart-tooltip",
    legendElementId: "#line-chart-legend"
};
const AREACHART_CONFIG = {
    parentElementId: "#area-chart-svg",
    containerWidth: 1200,
    containerHeight: 220,
    margin: { left: 40, top: 20, right: 30, bottom: 20 },
    legendElementId: "#area-chart-legend",
    titleElementId: "#area-chart-title"
};