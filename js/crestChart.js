/**

*
*  StationMap - Object constructor function
*  @param _parentElement   -- HTML element in which to draw the visualization
*  @param _data            -- Array data about date and height of river at that date
 * @param _stages           -- object that describes the river's height at a given flood stage
*/

CrestChart = function(_parentElement, _data, _stages) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.stages = _stages;
    this.initVis();
}


/*
 *  Initialize station map
 */

CrestChart.prototype.initVis = function() {
    var vis = this;

    // * TO-DO *
    vis.margin = { top: 60, right: 40, bottom: 60, left: 40 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // originally x is a time scale, we may change this
    vis.x = d3.time.scale()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.classify = d3.scale.category10()
        .domain(Object.keys(this.stages));

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(5);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.xAxisGroup = vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");
    // Initialize brush component

    vis.wrangleData();
};


/*
 *  Data wrangling
 */

CrestChart.prototype.wrangleData = function() {
    var vis = this;

    // Currently no data wrangling/filtering needed
    vis.displayData = vis.data;

    // Update the visualization
    vis.updateVis();

}


/*
 *  The drawing function
 */

CrestChart.prototype.updateVis = function() {
    var vis = this;

    vis.y.domain(d3.extent(vis.displayData, function(e){return e.height;}));
    vis.x.domain(d3.extent(vis.displayData, function(e){ return e.date; }));

// join
    circle = vis.svg.selectAll("circle")
        .data(vis.displayData);

    // enter
    circle.enter().append("circle")
        .attr("class", "dot");

    // update
    circle.transition()
        .duration(1000)
        .attr("cx", function(d) { return vis.x(d.date); })
        .attr("cy", function(d, index) { return vis.y(d.height); })
        .attr("r", 4)
        .attr("fill", function(e){
            for(var key in vis.stages){
                if(e.height >= vis.stages[key]){
                    return vis.classify(vis.stages[key]);
                }
            }
            return "black";
        });

    // Exit
    circle.exit().remove();


    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

    vis.svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(vis.xAxis);
};

