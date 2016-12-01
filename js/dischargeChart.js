/**

 *
 *  StationMap - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Array data about date and height of river at that date
 * @param _stages           -- object that describes the river's height at a given flood stage
 * @param _toggle           -- oHTML identifier for the toggle switch as the axis changes
 */

DischargeChart = function(_parentElement, _data, _toggle) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = _data;
    this.toggle = _toggle;
    this.initVis();
};


/*
 *  Initialize station map
 */

DischargeChart.prototype.initVis = function() {
    var vis = this;
    vis.margin = { top: 60, right: 50, bottom: 60, left: 70 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;

    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0]);

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .call(vis.tip);

    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.yLinear = d3.scale.linear()
        .range([vis.height, 0]);

    vis.yLinear.domain([0, d3.max(vis.displayData, function(e){return e.discharge;})]);

    vis.yLog = d3.scale.log()
        .range([vis.height, 0]);

    vis.yLog.domain([1, d3.max(vis.displayData, function(e){return e.discharge;})]);

    vis.y = vis.yLinear;

    vis.x.domain(d3.extent(vis.displayData, function(e){return e.timestamp;}));

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("path")
        .attr("class", "line");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");


    vis.svg.append("g")
        .attr("class", "brush");

    // Initialize the zoom component
    vis.zoom = d3.behavior.zoom()
        .x(vis.x)
    // Subsequently, you can listen to all zooming events
        .on("zoom", function(){
            vis.updateVis();
        })

        // Specify the zoom scale's allowed range
        .scaleExtent([1,20]);

    vis.svg.append("rect")
        .attr("class", "pane")
        .attr("width", vis.width)
        .attr("height", vis.height)
        .call(vis.zoom);

    // Define the clipping region
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    $("[name="+vis.toggle+"]").bootstrapSwitch({
        onSwitchChange : function(event, state){
            if(state){
                vis.y = vis.yLog;
            } else{
                vis.y = vis.yLinear;
            }
            vis.updateVis();
        }
    });

    vis.wrangleData();
};


/*
 *  Data wrangling
 */

DischargeChart.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

}


/*
 *  The drawing function
 */

DischargeChart.prototype.updateVis = function() {
    var vis = this;

    var line = d3.svg.line()
        .x(function(d) { return vis.x(d.timestamp); })
        .y(function(d) { return vis.y(d.discharge); })
        .interpolate("monotone");

    vis.svg.select(".line")   // change the line
        .transition()
        .duration(100)
        .attr("d", line(vis.displayData))
        .attr("clip-path", "url(#clip)");

    vis.svg.select(".y-axis")
        .transition()
        .duration(100)
        .call(vis.yAxis);

    vis.svg.select(".x-axis")
        .transition()
        .duration(100)
        .call(vis.xAxis);


};

/*
DischargeChart.prototype.mousemove = function() {
    vis = this;
    var x0 = vis.x.invert(d3.mouse(this)[0]),              // **********
        i = vis.bisectDate(data, x0, 1),                   // **********
        d0 = data[i - 1],                              // **********
        d1 = data[i],                                  // **********
        d = x0 - d0.timestamp > d1.discharge - x0 ? d1 : d0;     // **********

    focus.select("circle.y")                           // **********
        .attr("transform",                             // **********
            "translate(" + vis.x(d.timestamp) + "," +         // **********
            vis.y(d.discharge) + ")");                  // **********

    focus.select("#poplabel")
        .text(d.discharge)
        .attr("transform",                             // **********
            "translate(" + vis.x(d.timestamp) + "," +         // **********
            (vis.y(d.discharge) -30) + ")");

    focus.select("#datelabel")
        .text(d.timestamp.toDateString())
        .attr("transform",                             // **********
            "translate(" + vis.x(d.timestamp) + "," +         // **********
            (vis.y(d.discharge) -20) + ")");

}
*/
