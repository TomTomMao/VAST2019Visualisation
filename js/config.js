const DEVMODE = false;
const VALID_LOCATIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "all"];
const VALID_FACILITIES = ['sewer_and_water', 'power', 'roads_and_bridges', 'medical', 'buildings'];
const VALID_FACILITIES_INDEX = [];
const VALID_BAR_CHART_X = ["meanDamageValue", "count", "std"];
const MAX_LINE_CHART_LOCATION = 6;
const EMPTY_COLOUR_DOMAIN_VALUE = "0"
const NON_HIGHLIGHTED_COLOUR = '#cfcfcf'
for (let i = 1; i <= VALID_FACILITIES.length; i++) {
    VALID_FACILITIES_INDEX.push(i)
}
const LINECHART_CONFIG = {
    parentElementId: "#line-chart-svg",
    containerWidth: 1000,
    containerHeight: 400,
    margin: { left: 40, top: 20, right: 30, bottom: 20 },
    toolTipElementId: "#line-chart-tooltip",
    legendElementId: "#line-chart-legends"
};
const AREACHART_CONFIG = {
    parentElementId: "#area-chart-svg",
    containerWidth: 1000,
    containerHeight: 220,
    margin: { left: 40, top: 20, right: 30, bottom: 20 },
    legendElementId: "#area-chart-legends",
    titleElementId: "#area-chart-title"
};

const BARCHART1_CONFIG = {
    parentElementId: "#bar-chart-1-svg",
    containerWidth: 1000,
    containerHeight: 150,
    margin: { left: 40, top: 30, right: 30, bottom: 30 }
}

const BARCHART2_CONFIG = {
    parentElementId: "#bar-chart-2-svg",
    containerWidth: 500,
    containerHeight: 700,
    margin: { left: 40, top: 30, right: 30, bottom: 30 },
    legendElementId: "#bar-chart-2-legends",
    titleElementId: "#bar-chart-2-title"
}
DEFAULT_BAR_CHART_1_INTERVAL_LENGTH = 15 // minutes
DEFAULT_MEANDAMAGEVALUE_FOR_BAR_CHART_2 = 0
DEFAULT_COUNT_FOR_BAR_CHART_2 = 0
DEFAULT_STD_FOR_BAR_CHART_2 = 0
