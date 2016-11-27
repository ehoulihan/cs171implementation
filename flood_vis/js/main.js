/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables

var river_start = [42.820274, -73.945933];
var river_end = [42.821580, -73.947104];
var avg_gage = 213;
var min_elev = 200;
var floodStartIndex = 128;
var normalIndex = 110;
var stopInterval = false;
var interpolate_value = "linear";

// SVG drawing area

var margin = {top: 20, right: 20, bottom: 20, left: 60};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create Scales
var x = d3.scale.linear()
    .range([0,width]);
var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (height) + ")");

svg.append("g")
    .attr("class", "y-axis-group");

// Initialize data
loadData();

// Initialize Line
svg.append("path")
    .attr("class", "elev-line");

// Initialize Water Level
svg.append("path")
    .attr("class","water-line");

svg.append("path")
    .attr("class","water-area");

// Initialize Tooltip

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e');
var data;
var gageHeight;
var formatDate = d3.time.format("%Y-%m-%d");
var waterArea, waterLine;

// Load CSV file
function loadData() {
    d3.csv("data/elevation.csv", function(error, csv) {
        var counter = 0;
        csv.forEach(function(d){
            // Convert numeric values to 'numbers'
            d.elevation = +d.elevation;
            d.elevation = d.elevation*3.28084;
            var latlong = d.location.replace(/[\(\)]/g,'').split(',');
            d.lat = +latlong[0];
            d.long = +latlong[1];
            d.index = counter;
            counter = counter + 1;
        });

        // Store csv data in global variable
        data = csv;

        // Import Gage Height Data
        d3.csv("data/flood_gage_height.csv", function(error,gh){
            gh.forEach(function(d){
                d.day = +d.day;
                d.height = +d.height;
                d.minute = +d.minute;
                d.month = +d.month;
                d.year = +d.year;
                d.date = formatDate.parse(d.date)
            })
            gageHeight = gh;
            renderVisualization();
        })

        // Draw the visualization for the first time
    });
}

// Render visualization
function renderVisualization() {
    // Get User Values
    var numSamples = data.length;
    var xVals = [0,numSamples];
    var select_value = $("#select-area").val();


    x.domain([xVals[0],xVals[1]]);

    svg.select(".x-axis-group")
        .call(xAxis);

    var elevExtent = d3.extent(data, function(d){return d.elevation;});
    var gageExtent = d3.extent(gageHeight,function(d){return d.height});

    var upperBound = d3.max([elevExtent[1],gageExtent[1]]);

    y.domain([min_elev,upperBound]);

    svg.select(".y-axis-group")
        .call(yAxis);

    // Build LAND area
    var land_area = d3.svg.area()
        .x(function(d) { return x(d.index); })
        .y0(height)
        .y1(function(d) { return y(d.elevation); });

    svg.append("path")
        .datum(data)
        .attr("class", "land-area")
        .attr("d", land_area);

    // Build LAND line
    var line = d3.svg.line()
        .x(function(d) { return x(d.index); })
        .y(function(d) { return y(d.elevation); })
        .interpolate(interpolate_value);

    // Build Line Chart
    svg.selectAll(".elev-line")
        .transition().duration(800)
        .attr("d", line(data));


    // Build WATER Area
    waterArea = d3.svg.area()
        .x(function(d) { return x(d.index); })
        .y0(height)
        .y1(function(d) { return y(200+gageHeight[normalIndex].height); });

    svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", waterArea(data));

    // Build WATER Line
    waterLine = d3.svg.line()
        .x(function(d) { return x(d.index); })
        .y(function(d) { return y(200+gageHeight[normalIndex].height); })
        .interpolate(interpolate_value);

    svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", waterLine(data));


    // Initialize DataPoints
    //Create Circle
    var circle = svg.selectAll("circle")
        .data(data);

    // Call Tip
    tip.html(function(d){
        var html_l1 = d.elevation;
        var html_l2 = "Elevation" + ": " + d.elevation;
        return html_l2;
        //return (html_l1 + "<br/>" + html_l2);
    });
    svg.call(tip);

    circle.enter().append("circle")
        .attr("class", "dot")
        .attr("fill", "#707086");

    circle
        .transition()
        .duration(800)
        .attr("r", function(d) { return 2; })
        .attr("cx", function(d, index) { return x(index) })
        .attr("cy",function(d){return y(d.elevation);});

    circle
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //
    // Exit
    circle.exit().remove();

}

//
// function waterValue(index,condition,hIndex){
//     // var wave = index % 2 == 0 ? 1:-1;
//     // wave = index % 4 == 0 ? 0:wave;
//     var wave = 0;
//     var res = condition == "FLOOD" ? 200+gageHeight[hIndex].height : avg_gage;
//     res = res + wave;
//     return res;
// }

function updateWater(){

    var timeIndex = floodStartIndex;
    var renderUpdateWater = function(){

        if(stopInterval==true){
            console.log("STOPPING INTERVAL!");
            clearInterval(interval);
        }
        console.log("TIME INDEX, HEIGHT:");
        console.log(timeIndex,gageHeight[timeIndex].height);
        waterArea.y1(function(d) { return y(200 + gageHeight[timeIndex].height);});
        svg.selectAll(".water-area")
            .transition().duration(800)
            .attr("d", waterArea(data));
        // Build WATER Line
        waterLine = d3.svg.line()
            .x(function(d) { return x(d.index); })
            .y(function(d) { return y(200+gageHeight[timeIndex].height); })
            .interpolate(interpolate_value);

        svg.selectAll(".water-line")
            .transition().duration(800)
            .attr("d", waterLine(data));

        timeIndex++;
        if (timeIndex >= 160){
            timeIndex = floodStartIndex;
            clearInterval(interval)
        }
    };
    var interval = setInterval(renderUpdateWater,1000);

}



