/**
 * Created by klksunnygirl on 11/25/16.
 */

/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables

var river_start = [42.820274, -73.945933];
var river_end = [42.821580, -73.947104];
var avg_gage = 200;
var min_elev = 200;

// SVG drawing area

var margin = {top: 20, right: 20, bottom: 20, left: 60};

var width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var predam_water = svg.append("rect")
    .attr("x", -1)
    .attr("y", 180)
    .attr("width", 720)
    .attr("height", 80)
    .style("fill", "#9fa4f9")
    .attr("id", "predam-water")
    .style("opacity", "1");

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
    d3.csv("../data/terrain3.csv", function(error, csv) {
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

    //x.domain([xVals[0],xVals[1]]);

    console.log(x.domain());
    console.log(x.range());
    svg.select(".x-axis-group")
        .call(xAxis);

    var yExtent = d3.extent(data, function(d){
        return d.Y;
    });

    //y.domain([min_elev,yExtent[1]]);

    x.domain(d3.extent(data, function(d) { return d.X; }));
    y.domain(d3.extent(data, function(d) { return d.Y; }));

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

    // var predam_line = d3.svg.line()
    //     .x(function(d) { return x(d.index); })
    //     .y(function(d) { return y(100); })
    //     .interpolate(interpolate_value);


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
        .attr("d", water_area)
        .style("opacity", "0.3")
        .attr("id", "water_area");



    var land_area = d3.svg.area()
        .x(function(d) { return x(d.X); })
        .y0(height)
        .y1(function(d) { return y(d.Y); });

    svg.append("path")
        .datum(data)
        .attr("class", "land-area")
        .attr("d", land_area);

    var lock8 = svg.append("rect")
                                .attr("x", -1)
                                .attr("y", -1)
                               .attr("width", 23)
                                .attr("height", 260)
                                .style("fill", "#5E2605")
                                .attr("id", "lock8")
                                .style("opacity", "0.3");

    var lock7 = svg.append("rect")
        .attr("x", 700)
        .attr("y", 105)
        .attr("width", 23)
        .attr("height", 155)
        .style("fill", "#5E2605")
        .attr("id", "lock7")
        .style("opacity", "0.3");






    var C_WIDTH = 300,
        C_HEIGHT = 200;
    //
    // var width = C_WIDTH;
    // var height = C_HEIGHT;
    var timer_ret_val = false;
    //
    // var mainsvg = d3.select("#chart-area")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("class", "g_mainsvg");

    var circledata = d3.map();
    circledata.set('x', 0);
    circledata.set('y', C_HEIGHT/2);

    var circleg = svg.selectAll("g.blob")
        .data([circledata])
        .enter()
        .append("svg:g")
        .attr("class", "blob")
        .attr("transform", function(d) {return "translate(" + C_WIDTH/2 + "," + C_HEIGHT/2 + ")";});

    var t_circle_object = circleg
        .append("circle")
        .attr("cx", function(d) { return 0; })
        .attr("cy", function(d) { return 0; })
        .attr("r", function(d) {return 30; })
        .attr("class", "object_circle")
        .attr("id", "slow_boat")
        .style("fill", "brown")
        .style("opacity", "0.3");

    var stopdiv=d3.select("#stopdiv");
    stopdiv.on("click", function()	{
        timer_ret_val = true;
    });

    var duration = 18000, targetX = 700,last = 0, t=0;
    d3.timer(function(elapsed) {
        t = (t + (elapsed - last) / duration) % 1;
        last = elapsed;
        update();
        return timer_ret_val;
    });

    function update(elapsed){
        var t_x = circledata.get('x');
        console.log (t);
        t_x = targetX * t;

        svg.selectAll("g.blob")
            .attr("transform", function(d) {return "translate(" + t_x + "," + d.get('y') + ")";});

        circledata.set('x', t_x);
    }





    var C1_WIDTH = 300,
        C1_HEIGHT = 200;
    //
    // var width = C_WIDTH;
    // var height = C_HEIGHT;
    //var timer_ret_val = false;
    //
    // var mainsvg = d3.select("#chart-area")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("class", "g_mainsvg");

    var circle1data = d3.map();
    circledata.set('x', 0);
    circledata.set('y', C1_HEIGHT/2);

    var circleg1 = svg.selectAll("g.blob1")
        .data([circledata])
        .enter()
        .append("svg:g")
        .attr("class", "blob1")
        .attr("transform", function(d) {return "translate(" + C1_WIDTH/2 + "," + C1_HEIGHT/2 + ")";});

    var t_circle_object1 = circleg1
        .append("circle")
        .attr("cx", function(d) { return 0; })
        .attr("cy", function(d) { return 70; })
        .attr("r", function(d) {return 30; })
        .attr("id", "fast_boat")
        .attr("class", "object_circle")
        .style("fill", "brown")
        .style("opacity", "0.3");

    // var stopdiv=d3.select("#stopdiv");
    // stopdiv.on("click", function()	{
    //     timer_ret_val = true;
    // });

    var duration1 = 2000, targetX1 = 700,last1 = 0, t1=0;
    d3.timer(function(elapsed1) {
        console.log(duration1);
        t1 = (t1 + (elapsed1 - last1) / duration1) % 1;
        last1 = elapsed1;
        update1();
        return timer_ret_val;
    });

    function update1(elapsed1){
        var t_x1 = circledata.get('x');
        console.log (t1);
        t_x1 = targetX1 * t1;

        svg.selectAll("g.blob1")
            .attr("transform", function(d) {return "translate(" + t_x1 + "," + d.get('y') + ")";});

        circledata.set('x', t_x1);
    }

    $( "#pool" ).hover(
        function() {
            var active   = slow_boat.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#slow_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("fill", "red");
            // Update whether or not the elements are active
            slow_boat.active = active;

            var active_water   = water_area.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#water_area").style("opacity", newOpacity);
            d3.select("#water_area").style("opacity", newOpacity);
            // Update whether or not the elements are active
            water_area.active = active_water;

            var active_lock8   = lock8.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#lock8").style("opacity", newOpacity);
            d3.select("#lock8").style("opacity", newOpacity);
            // Update whether or not the elements are active
            lock8.active = active_lock8;

            var active_lock7   = lock7.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#lock7").style("opacity", newOpacity);
            d3.select("#lock7").style("opacity", newOpacity);
            // Update whether or not the elements are active
            lock7.active = active_lock7;
        }
    );

    $( "#natural_flow" ).hover(
        function() {
            var active   = fast_boat.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#fast_boat").style("opacity", newOpacity);
            d3.select("#fast_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("fill", "red");
            // Update whether or not the elements are active
            fast_boat.active = active;
        }
    );



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

