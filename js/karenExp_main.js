/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables
kExp = {};

kExp.river_start = [42.820274, -73.945933];
kExp.river_end = [42.821580, -73.947104];
kExp.avg_gage = 203;
kExp.min_elev = 200;
kExp.cutoff_elev = 180;
kExp.floodStartIndex = 1;
// http://www.cityofschenectady.com/DocumentCenter/Home/View/247 p.19
kExp.minFloodElev = 223;
kExp.elevTroughIndex = 72;
kExp.floodEndIndex = 95;
kExp.stopInterval = false;
kExp.interpolate_value = "linear";

// SVG drawing area

kExp.margin = {top: 20, right: 20, bottom: 60, left: 60};

kExp.width = 900 - kExp.margin.left - kExp.margin.right;
kExp.height = 300 - kExp.margin.top - kExp.margin.bottom;

// kExp.svg = d3.select("#exp-vis-area").append("svg")
//     .attr("width", kExp.width + kExp.margin.left + kExp.margin.right)
//     .attr("height", kExp.height + kExp.margin.top + kExp.margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + kExp.margin.left + "," + kExp.margin.top + ")");



// Create Scales
kExp.x = d3.scale.linear()
    .range([0,kExp.width]);
kExp.y = d3.scale.linear()
    .range([kExp.height, 0]);

kExp.xAxis = d3.svg.axis()
    .scale(kExp.x)
    .orient("bottom");

kExp.yAxis = d3.svg.axis()
    .scale(kExp.y)
    .orient("left");

kExp.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (kExp.height) + ")");

kExp.svg.append("g")
    .attr("class", "y-axis-group");

// Initialize data
loadData();

// Initialize Land Line
kExp.svg.append("path")
    .attr("class", "elev-line");

// Initialize Water Level
kExp.svg.append("path")
    .attr("class","water-line");

// Initialize Water Area
kExp.svg.append("path")
    .attr("class","water-area");

// Initialize Land Area
kExp.svg.append("path")
    .attr("class","elev-area");


// Initialize Tooltip

kExp.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e');

kExp.formatDate = d3.time.format("%Y-%m-%d %H:%M");


// Load CSV file
function loadData() {
    d3.csv("data/terrain3.csv", function(error, csv) {
        var counter = 0;
        csv.forEach(function(d){

            // Convert numeric values to 'numbers'
            d.X = +d.X;
            // d.Y = d.Y*3.28084;
            // var latlong = d.location.replace(/[\(\)]/g,'').split(',');
            // d.lat = +latlong[0];
            // d.long = +latlong[1];
            d.Y = +d.Y;
            d.index = counter;
            counter = counter + 1;
        });

        // Convert numeric values to 'numbers'
        //     d.Y = ((+d.Y)*3.28084);
        //     var latlong = d.location.replace(/[\(\)]/g,'').split(',');
        //     d.lat = +latlong[0];
        //     d.long = +latlong[1];
        //     d.index = counter;
        //     counter = counter + 1;
        //
        //     if (d.index >= kExp.elevTroughIndex & d.Y >= kExp.minFloodElev){
        //         d.Y = kExp.minFloodElev;
        //     }
        //     d.Y = d.Y <= kExp.cutoff_elev ? kExp.cutoff_elev+.25 : d.Y;
        // });

        // Store csv data in global variable
        kExp.data = csv;

        // Import Gage Height Data
        d3.csv("data/expheight.csv", function(error,gh){
            gh.forEach(function(d){
                d.day = +d.day;
                d.height = (+d.height)-10;
                d.hour = Math.floor((+d.minute) / 60);
                d.minute = (+d.minute) % 60;
                d.month = +d.month;
                d.year = +d.year;
                d.date = kExp.formatDate.parse(d.date + " " + d.hour + ":" + d.minute)
            });
            kExp.gageHeight = gh.filter(function(elt){
                return (elt.minute == 0);
            });

            d3.csv("data/image_link.csv", function(error,file){
                file.forEach(function(d){
                    d.index = +d.index;
                });
                kExp.imageLinks = file;
                renderVisualization();
                renderProgressBar();
            })
        })
    });
}

// Render visualization
function renderVisualization() {
    // Get User Values
    var numSamples = kExp.data.length;
    var xVals = [0,numSamples];
    var select_value = $("#exp-select-area").val();

    kExp.x.domain([xVals[0],xVals[1]]);

    kExp.svg.select(".x-axis-group")
        .call(kExp.xAxis);

    var elevExtent = d3.extent(kExp.data, function(d){return d.Y;});
    var gageExtent = d3.extent(kExp.gageHeight,function(d){return d.height});

    var upperBound = d3.max([elevExtent[1],gageExtent[1]]);

    kExp.y.domain([kExp.cutoff_elev,upperBound]);

    kExp.svg.select(".y-axis-group")
        .call(kExp.yAxis);

    // kExp.data = kExp.data.filter(function(elt){
    //     return elt.elevation >= kExp.avg_gage;
    // });

    // Build LAND area
    // kExp.elevArea = d3.svg.area()
    //     .x(function(d) { return kExp.x(d.index); })
    //     .y0(kExp.height-2)
    //     .y1(function(d) { return kExp.y(d.Y); });
    //
    // kExp.svg.append("path")
    //     .datum(kExp.data)
    //     .attr("class", "land-area")
    //     .attr("d", kExp.elevArea(kExp.data));
    //
    // // Build LAND line
    // kExp.line = d3.svg.line()
    //     .x(function(d) { return kExp.x(d.index); })
    //     .y(function(d) { return kExp.y(d.Y); })
    //     .interpolate(kExp.interpolate_value);
    //
    // // Build Line Chart
    // kExp.svg.selectAll(".elev-line")
    //     .transition().duration(800)
    //     .attr("d", kExp.line(kExp.data));
    //
    //
    // // Build WATER Area
    // kExp.waterArea = d3.svg.area()
    //     .x(function(d) { return kExp.x(d.index); })
    //     .y0(kExp.height-2)
    //     .y1(function(d) { return kExp.y(kExp.avg_gage); });
    //
    // kExp.svg.selectAll(".water-area")
    //     .transition().duration(800)
    //     .attr("d", kExp.waterArea(kExp.data));
    //
    // // Build WATER Line
    // kExp.waterLine = d3.svg.line()
    //     .x(function(d) { return kExp.x(d.index); })
    //     .y(function(d) { return kExp.y(kExp.avg_gage); })
    //     .interpolate(kExp.interpolate_value);
    //
    // kExp.svg.selectAll(".water-line")
    //     .transition().duration(800)
    //     .attr("d", kExp.waterLine(kExp.data));


    // Initialize DataPoints
    //Create Circle
    var circle = kExp.svg.selectAll("circle")
        .data(kExp.data);

    // Call Tip
    kExp.tip.html(function(d){
        // var html_l1 = d.Y;
        // var html_l2 = "Elevation" + ": " + d.Y + " @ " + d.index;
        return "Elevation" + ": " + d.Y + " @ " + d.index;
        //return (html_l1 + "<br/>" + html_l2);
    });
    kExp.svg.call(kExp.tip);

    circle.enter().append("circle")
        .attr("class", "dot")
        .attr("fill", "#707086");

    circle
        .transition()
        .duration(800)
        .attr("r", function(d) {
            var res = .5;
            res = d.Y <= kExp.avg_gage ? 0 : res;
            return res; })
        .attr("cx", function(d, index) { return kExp.x(d.index) })
        .attr("cy",function(d){return kExp.y(d.Y);});

    circle
        .on('mouseover', kExp.tip.show)
        .on('mouseout', kExp.tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //

    var icons = kExp.svg.selectAll(".icons")
        .data(kExp.imageLinks);

    icons.enter().append("image")
        .attr("xlink:href",function(d){
            return d.title;
        })
        .attr("x",function(d){return kExp.x(d.index-5)})
        .attr("y",kExp.y(kExp.minFloodElev + 10))
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

    var timeIndex = kExp.floodStartIndex;

    var renderUpdateWater = function(){
        if(kExp.stopInterval==true || $("#exp-select-area").val() == "AVERAGE"){
            console.log("STOPPING INTERVAL!");
            clearInterval(interval);
            resetWater();
            resetProgress();
        }
        else{
            // Update WATER Area
            kExp.waterArea.y1(function(d) { return kExp.y(200 + kExp.gageHeight[timeIndex].height);});
            kExp.svg.selectAll(".water-area")
                .transition().duration(400)
                .attr("d", kExp.waterArea(kExp.data));
            // Update WATER Line
            kExp.waterLine.y(function(d) { return kExp.y(200+kExp.gageHeight[timeIndex].height); });
            kExp.svg.selectAll(".water-line")
                .transition().duration(400)
                .attr("d", kExp.waterLine(kExp.data));

            timeIndex = timeIndex+1;
            if (timeIndex >= kExp.floodEndIndex){
                clearInterval(interval)
            }
            kProg.svg.selectAll("circle")
                .attr("id","blank-dot");

            kProg.svg.selectAll("#small-dot,#inactive-dot,#last-active-dot,#blank-dot")
                .attr("id",function(d,index){
                    var res = index==timeIndex ? "small-dot":"inactive-dot";
                    res = (index>=timeIndex-6 & index <timeIndex) ? "last-active-dot": res;
                    res = index < timeIndex - 6 ? "inactive-dot" : res;
                    res = index > timeIndex ? "blank-dot" : res;
                    res = (index < timeIndex & d.hour == 24) ? "last-active-dot" : res;
                    return res;
                })
            kProg.svg.selectAll("#large-dot")
                .attr("id",function(d,index){
                    var res = "inactive-dot";
                    if(index ==timeIndex){
                        res = "large-dot";
                    }
                    return res;
                })

        }

    };
    var interval = setInterval(renderUpdateWater,100);


}

function resetWater(){
    kExp.waterArea.y1(function(d) { return kExp.y(kExp.avg_gage);});
    kExp.svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", kExp.waterArea(kExp.data));
    kExp.waterLine.y(function(d) { return kExp.y(kExp.avg_gage); });
    kExp.svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", kExp.waterLine(kExp.data));
}
function resetProgress(){
    kProg.svg.selectAll("#inactive-dot")
        .attr("id","small-dot")
}


// Progress Bar

kProg = {};

kProg.margin = {top: 20, right: 50, bottom: 60, left: 50};

kProg.width = 300 - kProg.margin.left - kProg.margin.right;
kProg.height = 300 - kProg.margin.top - kProg.margin.bottom;

kProg.svg = d3.select("#exp-time-area").append("svg")
    .attr("width", kProg.width + kProg.margin.left + kProg.margin.right)
    .attr("height", kProg.height + kProg.margin.top + kProg.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + kProg.margin.left + "," + kProg.margin.top + ")");

kProg.x = d3.time.scale().range([0,kProg.width]);
kProg.y = d3.scale.linear().range([kProg.height, 0]);

kProg.xAxis = d3.svg.axis()
    .scale(kProg.x)
    .orient("bottom");

kProg.yAxis = d3.svg.axis()
    .scale(kProg.y)
    .orient("left");

kProg.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (kProg.height) + ")");

kProg.svg.append("g")
    .attr("class", "y-axis-group");

// Initialize Water Level
kProg.svg.append("path")
    .attr("class","water-line");




kProg.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-5, 0])
    .direction('e');



function renderProgressBar(){
    kProg.data = kExp.gageHeight;

    var dateExtent = d3.extent(kProg.data, function(d){return d.date;});
    var heightExtent = d3.extent(kProg.data,function(d){return d.height});

    kProg.x.domain([dateExtent[0],dateExtent[1]]);

    kProg.svg.select(".x-axis-group")
        .call(kProg.xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(60)")
        .style("text-anchor", "start")
        .text(function(d,index){
            var res = "";
            res = d.getHours() == 0 ? d.toLocaleDateString() : res;
            return res;
        });


    kProg.y.domain(kExp.y.domain());

    kProg.svg.select(".y-axis-group")
        .call(kProg.yAxis);

    var circle = kProg.svg.selectAll("circle")
        .data(kProg.data);

    circle.enter().append("circle")
        .attr("class", "water-dot")
        .attr("fill", "#707086");

    circle
        .transition()
        .duration(800)
        .attr("r", function(d,index) {
            var res = 3;
            res = d.hour == 24 ? 5 : res;
            res = index == 0 ? 3 : res;
            return res;
        })
        .attr("cx", function(d, index) {return kProg.x(d.date) })
        .attr("cy",function(d){
            return kProg.y(d.height + 200);
        })
        .attr("id",function(d,index){
            var res = "small-dot"
            res = d.hour == 24 ? "large-dot" : res;
            res = index == 0 ? "small-dot" : res;
            return res;
        });

    kProg.tip.html(function(d){
        return "Elevation" + ": " + (d.height+200) + " @ " + d.date.toLocaleTimeString();
    });
    kProg.svg.call(kProg.tip);


    circle
        .on('mouseover', kProg.tip.show)
        .on('mouseout', kProg.tip.hide);

    // var lock8 = kExp.svg.append("rect")
    //     .attr("x", -1)
    //     .attr("y", -20)
    //     .attr("width", 23)
    //     .attr("height", 240)
    //     .style("fill", "#5E2605")
    //     .attr("id", "lock8")
    //     .style("opacity", "1");

}

//
// var lock8 = kExp.svg.append("rect")
//     .attr("x", -1)
//     .attr("y", -20)
//     .attr("width", 23)
//     .attr("height", 200)
//     .style("fill", "#5E2605")
//     .attr("id", "lock8")
//     .style("opacity", "1");
//
// var lock7 = kExp.svg.append("rect")
//     .attr("x", 707)
//     .attr("y", 65)
//     .attr("width", 23)
//     .attr("height", 155)
//     .style("fill", "#5E2605")
//     .attr("id", "lock7")
//     .style("opacity", "1");

