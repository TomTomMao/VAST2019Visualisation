function updateLineChartLegends(chart = lineChart) {
    let container = document.querySelector(chart.config.legendElementId);
    container.innerHTML = "";
    let selectedLocations = chart.getLocations()
    VALID_LOCATIONS.forEach((location) => {
        let div = document.createElement("div");
        if (selectedLocations.includes(location)) {
            var locationColour = chart.colourScale(location);
        } else {
            var locationColour = "";
        }
        div.innerHTML = `
        <div class="line-chart-legend" id="line-chart-legend-${location}">
            <div class="rectangle" style="background-color: ${locationColour}" onclick="toggleLineChartLocations('${location}', lineChart)"></div>
            <div class="legend-button-1" id="legend-button-1-${location}">high light</div>
            <div class="legend-text">${location}</div>
        </div>
        `;
        container.appendChild(div)
        console.log(document.getElementById(`legend-button-1-${location}`));
        document.getElementById(`legend-button-1-${location}`).addEventListener("click", function() {
            if (chart.highLightedLocation == EMPTY_COLOUR_DOMAIN_VALUE) {
                chart.highLightLocation(location);
            } else{
                chart.disHighLightLocation();
            }
        })
    })
}
function toggleLineChartLocations(newLocation, chart) {
    if (chart.getLocations().includes(newLocation)) {
        // remove the location
        let newLocations = chart.getLocations().filter((d) => d != newLocation)
        changeLineChart(chart.time.startTime, chart.time.endTime, newLocations, chart = chart);
    } else if (chart.getLocations().length < MAX_LINE_CHART_LOCATION) {
        // add the location
        let newLocations = chart.getLocations().filter(d => true)
        newLocations.push(newLocation)
        changeLineChart(chart.time.startTime, chart.time.endTime, newLocations, chart = chart);
    }
    else {
        // console.log(chart.getLocations())
        // console.log(newLocation)
        // console.log(chart.getLocations().includes(newLocation))
        alert(`you can't choose more than ${MAX_LINE_CHART_LOCATION} locations`);
    }
}

