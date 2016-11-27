// Load the Visualization API and the columnchart package.

var allData;
var numSamples = 300;
google.load('visualization', '1', {packages: ['columnchart']});

function initMap() {
    // N Ferry St
    // var coord0 = [42.818364, -73.945887];
    // var coord1 = [42.819622, -73.947064];
    // var coord2 = [42.821213, -73.948245];

    // Ingersoll St
    var coord0 = [42.819438, -73.943042];
    var coord1 = [42.820695, -73.944622];
    var coord2 = [42.822506, -73.946651];

  var path = [
      {lat: coord0[0], lng: coord0[1]},  // S of River
      {lat: coord1[0], lng: coord1[1]},  // S-edge of River 
      {lat: coord2[0], lng: coord2[1]}]; // N-edge of River

    var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: path[0],
    mapTypeId: 'terrain'
  });

  // Create an ElevationService.
  var elevator = new google.maps.ElevationService;

  // Draw the path, using the Visualization API and the Elevation service.
  displayPathElevation(path, elevator, map);
}

function displayPathElevation(path, elevator, map) {
  // Display a polyline of the elevation path.
  var pline = new google.maps.Polyline({
    path: path,
    strokeColor: '#0000CC',
    strokeOpacity: 0.4,
    map: map
  });

  // Create a PathElevationRequest object using this array.
  // Ask for 256 samples along that path.
  // Initiate the path request.
  elevator.getElevationAlongPath({
    'path': path,
    'samples': numSamples
  }, plotElevation);
}

// Takes an array of ElevationResult objects, draws the path on the map
// and plots the elevation profile on a Visualization API ColumnChart.
function plotElevation(elevations, status) {
  var chartDiv = document.getElementById('elevation_chart');
  if (status !== 'OK') {
    // Show the error code inside the chartDiv.
    chartDiv.innerHTML = 'Cannot show elevation: request failed because ' +
        status;
    return;
  }
  // Create a new chart in the elevation_chart DIV.
  var chart = new google.visualization.ColumnChart(chartDiv);

  // Extract the data from which to populate the chart.
  // Because the samples are equidistant, the 'Sample'
  // column here does double duty as distance along the
  // X axis.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Sample');
  data.addColumn('number', 'Elevation');
  for (var i = 0; i < elevations.length; i++) {
    data.addRow(['', elevations[i].elevation]);
  }
  console.log("ELEVATIONS");
  console.log(elevations);
  allData = elevations;

  // Draw the chart using the data within its DIV.
  chart.draw(data, {
    height: 150,
    legend: 'none',
    titleY: 'Elevation (m)'
  });
}

function CSV(array) {
    // Use first element to choose the keys and the order
    var keys = Object.keys(array[0]);

    // Build header
    var result = keys.join("\t") + "\n";

    // Add the rows
    array.forEach(function(obj){
        keys.forEach(function(k, ix){
            if (ix) result += "\t";
            result += obj[k];
        });
        result += "\n";
    });

    return result;
}