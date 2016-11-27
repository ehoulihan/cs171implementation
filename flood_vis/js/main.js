/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables
jFlood = {};

jFlood.river_start = [42.820274, -73.945933];
jFlood.river_end = [42.821580, -73.947104];
jFlood.avg_gage = 213;
jFlood.min_elev = 200;
jFlood.cutoff_elev = 210;
jFlood.floodStartIndex = 34;
// http://www.cityofschenectady.com/DocumentCenter/Home/View/247 p.19
jFlood.minFloodElev = 223;
jFlood.elevTroughIndex = 72;
jFlood.floodEndIndex = 160;
jFlood.normalIndex = 33;
jFlood.stopInterval = false;
jFlood.interpolate_value = "linear";

// SVG drawing area

jFlood.margin = {top: 20, right: 20, bottom: 20, left: 60};

jFlood.width = 800 - jFlood.margin.left - jFlood.margin.right;
jFlood.height = 300 - jFlood.margin.top - jFlood.margin.bottom;

jFlood.svg = d3.select("#chart-area").append("svg")
    .attr("width", jFlood.width + jFlood.margin.left + jFlood.margin.right)
    .attr("height", jFlood.height + jFlood.margin.top + jFlood.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + jFlood.margin.left + "," + jFlood.margin.top + ")");

// Create Scales
jFlood.x = d3.scale.linear()
    .range([0,jFlood.width]);
jFlood.y = d3.scale.linear()
    .range([jFlood.height, 0]);

jFlood.xAxis = d3.svg.axis()
    .scale(jFlood.x)
    .orient("bottom");

jFlood.yAxis = d3.svg.axis()
    .scale(jFlood.y)
    .orient("left");

jFlood.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (jFlood.height) + ")");

jFlood.svg.append("g")
    .attr("class", "y-axis-group");

// Initialize data
loadData();

// Initialize Land Line
jFlood.svg.append("path")
    .attr("class", "elev-line");

// Initialize Water Level
jFlood.svg.append("path")
    .attr("class","water-line");

// Initialize Water Area
jFlood.svg.append("path")
    .attr("class","water-area");

// Initialize Land Area
jFlood.svg.append("path")
    .attr("class","elev-area");


// Initialize Tooltip

jFlood.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e');

jFlood.formatDate = d3.time.format("%Y-%m-%d");


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

            if (d.index >= jFlood.elevTroughIndex & d.elevation >= jFlood.minFloodElev){
                d.elevation = jFlood.minFloodElev;
            }
            d.elevation = d.elevation <= jFlood.cutoff_elev ? jFlood.cutoff_elev : d.elevation;
        });

        // Store csv data in global variable
        jFlood.data = csv;

        // Import Gage Height Data
        d3.csv("data/flood_gage_height.csv", function(error,gh){
            gh.forEach(function(d){
                d.day = +d.day;
                d.height = +d.height;
                d.minute = +d.minute;
                d.month = +d.month;
                d.year = +d.year;
                d.date = jFlood.formatDate.parse(d.date)
            });
            jFlood.gageHeight = gh;

            d3.csv("data/image_link.csv", function(error,file){
                file.forEach(function(d){
                    d.index = +d.index;
                });
                jFlood.imageLinks = file;
                renderVisualization();
            })
        })
    });
}

// Render visualization
function renderVisualization() {
    // Get User Values
    var numSamples = jFlood.data.length;
    var xVals = [0,numSamples];
    var select_value = $("#select-area").val();


    jFlood.x.domain([xVals[0],xVals[1]]);

    jFlood.svg.select(".x-axis-group")
        .call(jFlood.xAxis);

    var elevExtent = d3.extent(jFlood.data, function(d){return d.elevation;});
    console.log(elevExtent);
    var gageExtent = d3.extent(jFlood.gageHeight,function(d){return d.height});

    var upperBound = d3.max([elevExtent[1],gageExtent[1]]);

    jFlood.y.domain([jFlood.cutoff_elev,upperBound]);

    jFlood.svg.select(".y-axis-group")
        .call(jFlood.yAxis);

    // Build LAND area
    jFlood.elevArea = d3.svg.area()
        .x(function(d) { return jFlood.x(d.index); })
        .y0(jFlood.height)
        .y1(function(d) { return jFlood.y(d.elevation); });

    jFlood.svg.append("path")
        .datum(jFlood.data)
        .attr("class", "land-area")
        .attr("d", jFlood.elevArea(jFlood.data));

    // Build LAND line
    jFlood.line = d3.svg.line()
        .x(function(d) { return jFlood.x(d.index); })
        .y(function(d) { return jFlood.y(d.elevation); })
        .interpolate(jFlood.interpolate_value);

    // Build Line Chart
    jFlood.svg.selectAll(".elev-line")
        .transition().duration(800)
        .attr("d", jFlood.line(jFlood.data));


    // Build WATER Area
    jFlood.waterArea = d3.svg.area()
        .x(function(d) { return jFlood.x(d.index); })
        .y0(jFlood.height)
        .y1(function(d) { return jFlood.y(jFlood.avg_gage); });

    jFlood.svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", jFlood.waterArea(jFlood.data));

    // Build WATER Line
    jFlood.waterLine = d3.svg.line()
        .x(function(d) { return jFlood.x(d.index); })
        .y(function(d) { return jFlood.y(jFlood.avg_gage); })
        .interpolate(jFlood.interpolate_value);

    jFlood.svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", jFlood.waterLine(jFlood.data));


    // Initialize DataPoints
    //Create Circle
    var circle = jFlood.svg.selectAll("circle")
        .data(jFlood.data);

    // Call Tip
    jFlood.tip.html(function(d){
        // var html_l1 = d.elevation;
        // var html_l2 = "Elevation" + ": " + d.elevation + " @ " + d.index;
        return "Elevation" + ": " + d.elevation + " @ " + d.index;
        //return (html_l1 + "<br/>" + html_l2);
    });
    jFlood.svg.call(jFlood.tip);

    circle.enter().append("circle")
        .attr("class", "dot")
        .attr("fill", "#707086");

    circle
        .transition()
        .duration(800)
        .attr("r", function(d) { return 2; })
        .attr("cx", function(d, index) { return jFlood.x(index) })
        .attr("cy",function(d){return jFlood.y(d.elevation);});

    circle
        .on('mouseover', jFlood.tip.show)
        .on('mouseout', jFlood.tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //

    var icons = jFlood.svg.selectAll(".icons")
        .data(jFlood.imageLinks);

    icons.enter().append("image")
        .attr("xlink:href",function(d){
            return d.title;
        })
        .attr("x",function(d){return jFlood.x(d.index-5)})
        .attr("y",jFlood.y(jFlood.minFloodElev + 10))
        .attr("width",100)
        .attr("height",100);
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

    var timeIndex = jFlood.floodStartIndex;

    var renderUpdateWater = function(){
        if(jFlood.stopInterval==true || $("#select-area").val() == "AVERAGE"){
            console.log("STOPPING INTERVAL!");
            clearInterval(interval);
            resetWater();
        }
        else{
            // Update WATER Area
            jFlood.waterArea.y1(function(d) { return jFlood.y(200 + jFlood.gageHeight[timeIndex].height);});
            jFlood.svg.selectAll(".water-area")
                .transition().duration(400)
                .attr("d", jFlood.waterArea(jFlood.data));
            // Update WATER Line
            jFlood.waterLine.y(function(d) { return jFlood.y(200+jFlood.gageHeight[timeIndex].height); });
            jFlood.svg.selectAll(".water-line")
                .transition().duration(400)
                .attr("d", jFlood.waterLine(jFlood.data));

            timeIndex = timeIndex+4;
            if (timeIndex >= jFlood.floodEndIndex){
                timeIndex = jFlood.floodStartIndex;
                clearInterval(interval)
            }
        }

    };
    var interval = setInterval(renderUpdateWater,500);


}

function resetWater(){
    jFlood.waterArea.y1(function(d) { return jFlood.y(200 + jFlood.gageHeight[jFlood.normalIndex].height);});
    jFlood.svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", jFlood.waterArea(jFlood.data));
    jFlood.waterLine.y(function(d) { return jFlood.y(200+jFlood.gageHeight[jFlood.normalIndex].height); });
    jFlood.svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", jFlood.waterLine(jFlood.data));
}

