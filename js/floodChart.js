/**
 * Created by jackiemartinez on 12/3/16.
 */

/**

 *
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array data about date and height of river at that date
 * @param _stages           -- object that describes the river's height at a given flood stage
 * @param _toggle           -- oHTML identifier for the toggle switch as the axis changes
 */

FloodChart = function(_parentElement, _eData, _ghData) {
    this.parentElement = _parentElement;
    this.elevationData = _eData;
    this.gageHeight = _ghData;
    this.maxLineStatus = 0;
    this.initVis();
};


/*
 *  Initialize station map
 */

FloodChart.prototype.initVis = function() {
    var jFlood = this;
    jFlood.river_start = [42.820274, -73.945933];
    jFlood.river_end = [42.821580, -73.947104];
    jFlood.avg_gage = 216;
    jFlood.min_elev = 200;
    jFlood.cutoff_elev = 210;
    jFlood.floodStartIndex = 1;
    // http://www.cityofschenectady.com/DocumentCenter/Home/View/247 p.19
    // https://www.daftlogic.com/sandbox-google-maps-find-altitude.htm
    jFlood.minFloodElev = 223;
    jFlood.elevTroughIndex = 72;
    jFlood.floodEndIndex = 95;
    jFlood.stopInterval = false;
    jFlood.interpolate_value = "linear";

    // SVG drawing area

    jFlood.margin = {top: 20, right: 20, bottom: 80, left: 60};

    jFlood.width = $("#" + jFlood.parentElement).width() - jFlood.margin.left - jFlood.margin.right;
    jFlood.height = 400 - jFlood.margin.top - jFlood.margin.bottom;

    jFlood.svg = d3.select("#" + jFlood.parentElement).append("svg")
        .attr("width", jFlood.width + jFlood.margin.left + jFlood.margin.right)
        .attr("height", jFlood.height + jFlood.margin.top + jFlood.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + jFlood.margin.left + "," + jFlood.margin.top + ")");

    // Create Scales
    jFlood.x = d3.scale.linear()
        .range([2,jFlood.width]);
    jFlood.y = d3.scale.linear()
        .range([jFlood.height, 0]);

    jFlood.xAxis = d3.svg.axis()
        .scale(jFlood.x)
        .orient("bottom")
        .ticks(0);

    jFlood.yAxis = d3.svg.axis()
        .scale(jFlood.y)
        .orient("left");

    jFlood.svg.append("g")
        .attr("class", "x-axis-group")
        .attr("transform", "translate(0," + (jFlood.height) + ")");

    jFlood.svg.append("g")
        .attr("class", "y-axis-group");

    // Initialize Land Line
    // jFlood.svg.append("path")
    //     .attr("class", "elev-line");

    // // Initialize Water Level
    // jFlood.svg.append("path")
    //     .attr("class","water-line");

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

    jFlood.formatDate = d3.time.format("%Y-%m-%d %H:%M");

    jFlood.wrangleData();
};


/*
 *  Data wrangling
 */

FloodChart.prototype.wrangleData = function() {
    var jFlood = this;

    // Currently no data wrangling/filtering needed
    jFlood.elevationData.forEach(function(d){
        if (d.index >= jFlood.elevTroughIndex & d.elevation >= jFlood.minFloodElev){
            d.elevation = jFlood.minFloodElev;
        }
        d.elevation = d.elevation <= jFlood.cutoff_elev ? jFlood.cutoff_elev+.25 : d.elevation;
    });

    // Update the visualization
    jFlood.updateVis();

}


/*
 *  The drawing function
 */

FloodChart.prototype.updateVis = function() {
    var jFlood = this;

    var numSamples = jFlood.elevationData.length;
    var xVals = [0,numSamples];
    var select_value = $("#select-area").val();

    jFlood.x.domain([xVals[0],xVals[1]]);

    // jFlood.svg.select(".x-axis-group")
    //     .call(jFlood.xAxis);

    var elevExtent = d3.extent(jFlood.elevationData, function(d){return d.elevation;});
    var gageExtent = d3.extent(jFlood.gageHeight,function(d){return d.height});

    jFlood.maxFloodLevel = gageExtent[1];

    var upperBound = d3.max([elevExtent[1],gageExtent[1]]);

    jFlood.y.domain([jFlood.cutoff_elev,upperBound + 5]);

    jFlood.svg.select(".y-axis-group")
        .call(jFlood.yAxis);


    // jFlood.elevationData = jFlood.elevationData.filter(function(elt){
    //     return elt.elevation >= jFlood.avg_gage;
    // });

    // Build LAND area
    jFlood.elevArea = d3.svg.area()
        .x(function(d) { return jFlood.x(d.index); })
        .y0(jFlood.height-1)
        .y1(function(d) { return jFlood.y(d.elevation); });

    jFlood.svg.append("path")
        .datum(jFlood.elevationData)
        .attr("class", "land-area")
        .attr("d", jFlood.elevArea(jFlood.elevationData));

    // Build LAND line
    // jFlood.line = d3.svg.line()
    //     .x(function(d) { return jFlood.x(d.index); })
    //     .y(function(d) { return jFlood.y(d.elevation); })
    //     .interpolate(jFlood.interpolate_value);
    //
    // jFlood.svg.selectAll(".elev-line")
    //     .transition().duration(800)
    //     .attr("d", jFlood.line(jFlood.elevationData));


    // Build WATER Area
    jFlood.waterArea = d3.svg.area()
        .x(function(d) { return jFlood.x(d.index); })
        .y0(jFlood.height)
        .y1(function(d) { return jFlood.y(jFlood.avg_gage); });

    jFlood.svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", jFlood.waterArea(jFlood.elevationData));


    // Build WATER Line
    // jFlood.waterLine = d3.svg.line()
    //     .x(function(d) { return jFlood.x(d.index); })
    //     .y(function(d) { return jFlood.y(jFlood.avg_gage); })
    //     .interpolate(jFlood.interpolate_value);
    //
    // jFlood.svg.selectAll(".water-line")
    //     .transition().duration(800)
    //     .attr("d", jFlood.waterLine(jFlood.elevationData));


    // Initialize DataPoints
    //Create Circle
    // var circle = jFlood.svg.selectAll("circle")
    //     .data(jFlood.elevationData);

    // Call Tip
    // jFlood.tip.html(function(d){
    //     // var html_l1 = d.elevation;
    //     // var html_l2 = "Elevation" + ": " + d.elevation + " @ " + d.index;
    //     return "Elevation" + ": " + d.elevation + " @ " + d.index;
    //     //return (html_l1 + "<br/>" + html_l2);
    // });
    // jFlood.svg.call(jFlood.tip);

    // circle.enter().append("circle")
    //     .attr("class", "dot")
    //     .attr("fill", "#707086");
    //
    // circle
    //     .transition()
    //     .duration(800)
    //     .attr("r", function(d) {
    //         var res = .5;
    //         res = d.elevation <= jFlood.avg_gage ? 0 : res;
    //         return res; })
    //     .attr("cx", function(d, index) { return jFlood.x(d.index) })
    //     .attr("cy",function(d){return jFlood.y(d.elevation);});
    //
    // circle
    //     .on('mouseover', jFlood.tip.show)
    //     .on('mouseout', jFlood.tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //

    jFlood.twoStoryHeight = Math.abs(jFlood.y(241) - jFlood.y(223));
    jFlood.sixFtTall = Math.abs(jFlood.y(228.75) - jFlood.y(223));
    var icons = jFlood.svg.append("g")
        .attr("class","icons");

    var house_index = 73;
    var person_index = 118;
    var house_width = 175;
    var person_width = 25;

    icons.append("image")
        .attr("xlink:href", "img/home2.png")
        .attr("x",jFlood.x(house_index))
        .attr("y",jFlood.y(jFlood.minFloodElev) - jFlood.twoStoryHeight)
        .attr("width",house_width)
        .attr("height",jFlood.twoStoryHeight)
        .attr("preserveAspectRatio","none");

    icons.append("image")
        .attr("xlink:href", "img/man.png")
        .attr("x",jFlood.x(person_index))
        .attr("y",jFlood.y(jFlood.minFloodElev) - jFlood.sixFtTall)
        .attr("width",person_width)
        .attr("height",jFlood.sixFtTall)
        .attr("preserveAspectRatio","none");

    jFlood.svg.append("text")
        .attr("class","icon-label-text")
        .attr("x",jFlood.x(house_index) + house_width/2)
        .attr("y",jFlood.y(jFlood.minFloodElev - 2))
        .attr("text-anchor","middle")
        .html("2-Story House: ");

    jFlood.svg.append("text")
        .attr("class","icon-label-text")
        .attr("x",jFlood.x(person_index) + person_width/2)
        .attr("y",jFlood.y(jFlood.minFloodElev - 2))
        .attr("text-anchor","middle")
        .html("Avg U.S. Man: ");
    jFlood.svg.append("text")
        .attr("class","icon-label-text")
        .attr("x",jFlood.x(house_index) + house_width/2)
        .attr("y",jFlood.y(jFlood.minFloodElev - 3.5))
        .attr("text-anchor","middle")
        .html("18ft.");
    jFlood.svg.append("text")
        .attr("class","icon-label-text")
        .attr("x",jFlood.x(person_index) + person_width/2)
        .attr("y",jFlood.y(jFlood.minFloodElev - 3.5))
        .attr("text-anchor","middle")
        .html("5ft. 10in.");






};

FloodChart.prototype.resetVis = function() {
    var jFlood = this;

    jFlood.waterArea.y1(function(d) { return jFlood.y(jFlood.avg_gage);});
    jFlood.svg.selectAll(".water-area")
        .transition().duration(800)
        .attr("d", jFlood.waterArea(jFlood.elevationData));

    if(jFlood.maxLineStatus == 1){
        $("#flood-vis-row").after("<div class=\"text-center\" style=\"padding-top:1%;\"><a class=\"btn btn-default start btn-lg\" href=\"#papaSection\">Continue</a></div>");
    }
    // jFlood.waterLine.y(function(d) { return jFlood.y(jFlood.avg_gage); });
    // jFlood.svg.selectAll(".water-line")
    //     .transition().duration(800)
    //     .attr("d", jFlood.waterLine(jFlood.elevationData));
};

FloodChart.prototype.insertMaxLine = function(waterHeight){
    var jFlood = this;

    jFlood.svg
        .append("line")
        .attr("x1",jFlood.x(0) - 1)
        .attr("x2",jFlood.x(maxFloodDataPoints))
        .attr("y1",jFlood.y(waterHeight + 200))
        .attr("y2",jFlood.y(waterHeight + 200))
        .attr("class","max-height-line");

    jFlood.svg
        .append("text")
        .attr("x",jFlood.x(maxFloodDataPoints))
        .attr("y",jFlood.y(waterHeight + 200 + 1))
        .attr("text-anchor","end")
        .attr("class","max-height-line-text")
        .text("Max. Water Height: 229ft.");

    jFlood.maxLineStatus++;
};

FloodChart.prototype.updateFloodWater = function(timeIndex){
    var jFlood = this;

    // Update WATER Area
    jFlood.waterArea.y1(function(d) { return jFlood.y(200 + jFlood.gageHeight[timeIndex].height);});

    jFlood.svg.selectAll(".water-area")
        .transition().duration(100)
        .attr("d", jFlood.waterArea(jFlood.elevationData));

    if((jFlood.maxFloodLevel == jFlood.gageHeight[timeIndex].height) & (jFlood.maxLineStatus == 0)){
        jFlood.insertMaxLine(jFlood.maxFloodLevel);
    }

    // // Update WATER Line
    // jFlood.waterLine.y(function(d) { return jFlood.y(200+jFlood.gageHeight[timeIndex].height); });
    //
    // jFlood.svg.selectAll(".water-line")
    //     .transition().duration(400)
    //     .attr("d", jFlood.waterLine(jFlood.elevationData));
}