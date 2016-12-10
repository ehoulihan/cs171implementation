/**
 * Created by klksunnygirl on 11/25/16.
 */

/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables


var river_start = [42.820274, -73.945933];
var river_end = [42.821580, -73.947104];
var avg_gage = 213;
var min_elev = 200;

// SVG drawing area

var margin = {top: 20, right: 20, bottom: 20, left: 60};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#speed-chart").append("svg")
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

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
//var formatDate = d3.time.format("%Y");

// Initialize data
loadData();

// Initialize Line
svg.append("path")
    .attr("class", "elev-line");

// Initialize Water Level
svg.append("path")
    .attr("class","water-line");

// Initialize Tooltip

var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e');
var data;

// Load CSV file
function loadData() {
    d3.csv("../data/terrain.csv", function(error, csv) {
        var counter = 0;
        csv.forEach(function(d){
            // Convert numeric values to 'numbers'
            d.X = +d.X;
            // d.elevation = d.elevation*3.28084;
            // var latlong = d.location.replace(/[\(\)]/g,'').split(',');
            // d.lat = +latlong[0];
            // d.long = +latlong[1];
            d.Y = +d.Y;
            //d.index = counter;
            counter = counter + 1;
        });

        // Store csv data in global variable
        data = csv;

        // Draw the visualization for the first time
        updateVisualization();
    });
}



// Render visualization
function updateVisualization() {
    // Get User Values
    console.log("DATA IN VIS");
    console.log(data);
    var interpolate_value = "linear";
    var numSamples = data.length;
    var xVals = [0,numSamples];

    x.domain([xVals[0],xVals[1]]);

    console.log(x.domain());
    console.log(x.range());
    svg.select(".x-axis-group")
        .call(xAxis);

    var yExtent = d3.extent(data, function(d){
        return d.Y;
    });

    y.domain([min_elev,yExtent[1]]);

    svg.select(".y-axis-group")
        .call(yAxis);

    // Add Line Function
    var line = d3.svg.line()
        .x(function(d) { return x(d.X); })
        .y(function(d) { return y(d.Y); })
        .interpolate(interpolate_value);


    // Build Line Chart
    svg.selectAll(".elev-line")
        .transition().duration(800)
        .attr("d", line(data));

    // Get Indeces of Water Start/End
    var water = data.filter(function(d){
        console.log(d.elevation);
        return (d.elevation <= avg_gage);
    });
    console.log("WATER");
    console.log(water);

    var water_line = d3.svg.line()
        .x(function(d) { return x(d.index); })
        .y(function(d) { return y(avg_gage); })
        .interpolate(interpolate_value);


    // Build Line Chart
    svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", water_line(water));

    // Build Areas
    var water_area = d3.svg.area()
        .x(function(d) { return x(d.X); })
        .y0(height)
        .y1(function(d) { return y(avg_gage); });

    svg.append("path")
        .datum(data)
        .attr("class", "water-area")
        .attr("d", water_area);

    var land_area = d3.svg.area()
        .x(function(d) { return x(d.X); })
        .y0(height)
        .y1(function(d) { return y(d.Y); });

    svg.append("path")
        .datum(data)
        .attr("class", "land-area")
        .attr("d", land_area);


    // // Initialize DataPoints
    // //Create Circle
    // var circle = svg.selectAll("circle")
    //     .data(data);
    //
    // // Call Tip
    // tip.html(function(d){
    //     html_l1 = d.elevation;
    //     html_l2 = "Elevation" + ": " + d.elevation;
    //     return html_l2;
    //     //return (html_l1 + "<br/>" + html_l2);
    // });
    // svg.call(tip);
    //
    // circle.enter().append("circle")
    //     .attr("class", "dot")
    //     .attr("fill", "#707086");
    //
    // circle
    //     .transition()
    //     .duration(800)
    //     .attr("r", function(d) { return 1; })
    //     .attr("cx", function(d, index) { return x(index) })
    //     .attr("cy",function(d){return y(d.elevation);});
    //
    // circle
    //     .on('mouseover', tip.show)
    //     .on('mouseout', tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //
    // Exit
    // circle.exit().remove();

}


// Show details for a specific FIFA World Cup
// function showEdition(d){
//     for (elt in d){
//         if (elt != "YEAR"){
//             ($("#"+elt).html(d[elt]));
//         }
//     }
// }

