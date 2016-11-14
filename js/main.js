L.Icon.Default.imagePath = 'images/';

var allData = [];

// Variable for the visualization instance
var stationMap;

var mbta;

// Start application by loading the data
loadData();


function loadData() {

	// Proxy url
	var proxy = 'http://michaeloppermann.com/proxy.php?format=xml&url=';

  // Hubway XML station feed
    var url = 'https://www.thehubway.com/data/stations/bikeStations.xml';

  // TO-DO: LOAD DATA
    d3.json(proxy + url, function(error, data){
        allData = data.station;
        allData.forEach(function(d){
            d.id = +d.id;
            d.nbEmptyDocks = +d.nbEmptyDocks;
            d.nbBikes = +d.nbBikes;
            d.lat = +d.lat;
            d.long = +d.long;
        });

        $("#station-count").html(allData.length);

        d3.json("mbta.json", function(data) {
            console.log(data);
            mbta = data;

            createVis();
        });


    });
}


function createVis() {
   // TO-DO: INSTANTIATE VISUALIZATION
   stationMap = new StationMap("station-map", allData, [42.360082, -71.058880], mbta);

}