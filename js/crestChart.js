/**

*
*  StationMap - Object constructor function
*  @param _parentElement   -- HTML element in which to draw the visualization
*  @param _data            -- Array data about date and height of river at that date
 * @param _stages           -- object that describes the river's height at a given flood stage
 * @param _toggle           -- oHTML identifier for the toggle switch as the axis changes
 */

CrestChart = function(_parentElement, _data, _stages, _toggle) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.stages = _stages;
    this.toggle = _toggle;
    this.dateFormatter = d3.time.format("%m/%d/%Y");
    this.initVis();
};


/*
 *  Initialize station map
 */

CrestChart.prototype.initVis = function() {
    var vis = this;
    $("[name="+vis.toggle+"]").bootstrapSwitch({
        onSwitchChange : function(event, state){
            vis.show_years = state;
            vis.updateVis();
        }
    });


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

    // Initialize tip component
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Height:</strong> <span style='color:red'>" + d.height + " ft</span>" +
                "<br>" +
                "<strong>Date:</strong> <span>" + dateFormatter(d.date) + "</span>";
        });
    vis.svg.call(vis.tip);

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

    if (vis.show_years){
        vis.x.range([0, vis.width]);
    } else {
        vis.x.range([0, 1]);
    }

    vis.y.domain(d3.extent(vis.displayData, function(e){return e.height;}));
    vis.x.domain(d3.extent(vis.displayData, function(e){ return e.date; }));

// join
    circle = vis.svg.selectAll("circle")
        .data(vis.displayData);

    // enter
    circle.enter().append("circle")
        .attr("class", "crest-dot")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

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

    // if showing the pole, then have no labels on the x axis.
    if (!vis.show_years){
        vis.xAxis.ticks(0);
    } else {
        vis.xAxis.ticks(5);
    }

    var result = vis.svg.select(".x-axis")
            .transition()
            .duration(1000)
            .call(vis.xAxis);


};

