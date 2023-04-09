class LineChartToolTipRender {
  constructor(tooltipElementId) {
    this.tooltipElementId = tooltipElementId;
    this.tooltipDom = d3.select(this.tooltipElementId);
    console.log(this.tooltipDom);
    this.FORMAT = d3.format(".2f");
  }
  renderTooltip(data) {
    // render a table inside the tooltipDom
    // table has 3 columns: location, mean damage, colour
    // table has at least 2 rows: time, mean damage
    // table has 1 row for each location
    // data e.g.: {time: timeobj, mean: 100, locations: [{name: "location1", meanDamage: 10, colour: "red", time: timeObj}]}
    // data.time: string
    // data.mean: number
    // data.locations: an array(can be empty) of objects
    // data.locations[i].name: string
    // data.locations[i].MeanDamage: number
    // data.locations[i].colour: string

    // check if data is valid
    if (!data) {
      return false;
    }
    if (!data.time) {
      return false;
    }
    if (!data.mean) {
      return false;
    }

    let timeDomTr = this._renderTimeTr(data);
    let MeanDomTr = this._renderMeanTr(data);
    if (data.hasOwnProperty("locations")) {
      var LocationDomTr = this._renderLocationsTr(data);
    } else {
      var LocationDomTr = "";
    }
    let tableDom = `<table><tbody>${timeDomTr}${MeanDomTr}${LocationDomTr}</tbody></table>`;
    this.tooltipDom.html(tableDom);
    return true;
  }
  _renderTimeTr(data) {
    let time = parseTimeReverse(data.time);
    if (time.split(":")[1].length == 1) {
      time = time.split(":")[0] + ":0" + time.split(":")[1];
    }
    return `<tr><td>Time</td><td>${time}</td><td></td></tr>`;
  }
  _renderMeanTr(data) {
    let thisObj = this;
    let mean = thisObj.FORMAT(data.mean);
    return `<tr><td>Mean Damage Over 19 location</td><td>${mean}</td><td></td></tr>`;
  }
  _renderLocationsTr(data, sort = true) {
    let thisObj = this;
    let locations = data.locations;
    let locationsDomTrs = "";
    // sort locations by location.name
    if (sort) {
      locations = locations.sort(
        (a, b) =>
          Number(a.name.slice("location".length)) -
          Number(b.name.slice("location".length))
      );
    }
    for (let location of locations) {
      let locationName = location.name;
      let locationMeanDamage = thisObj.FORMAT(location.meanDamage);
      let locationColour = location.colour;
      locationsDomTrs += `<tr><td>${locationName}</td><td>${locationMeanDamage}</td><td style="background-color:${locationColour}">${locationColour}</td></tr>`;
    }
    return locationsDomTrs;
  }
}
