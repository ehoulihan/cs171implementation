/**
 * Created by emily on 12/11/2016.
 *

/*
 * VolumeChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _dischargeData						-- the actual data: perDayData
 * @param _flowrateData     -- info about flow rate
 */

VolumeChart = function(_parentElement, _dischargeData, _flowrateData){
    this.parentElement = _parentElement;
    this.dischargeData = _dischargeData;
    this.flowrateData = _flowrateData;
    this.filteredData = _dischargeData;
    this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

VolumeChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 0, bottom: 200, left: 140 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Scales and axes
    console.log("here is the width " + vis.width);
    vis.x = d3.scale.ordinal();

    vis.y = d3.scale.linear()
        .range([vis.height,0]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    vis.yAxisGroup.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(vis.margin.left/1.2) +","+(vis.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Volume (cubic ft)");

    // (Filter, aggregate, modify data)
    vis.wrangleData();
}


/*
 * Data wrangling
 */

VolumeChart.prototype.wrangleData = function(){
    var vis = this;


    // get the data in the format we need
    // we need to know how many 15 minute intervals there were.


    var start = vis.filteredData[0];
    var end = vis.filteredData[vis.filteredData.length - 1];

        // converts to 15 minute intervals
    var min_intervals = (end.timestamp - start.timestamp) / 1000 / 60;
    console.log(min_intervals);
    console.log(end.volume);
    console.log(start.volume);
    console.log(end.volume - start.volume);

    var sum = 0;
    vis.filteredData.forEach(function(e){
        sum += e.discharge * 60;
    })

    console.log(sum);

    // console.log(min_intervals);
    // console.log(start);
    // console.log(end);

    vis.displayData = [];
    vis.flowrateData.forEach(function(e, i){
        vis.displayData.push({
            'id' : i,
            'label' : e.name,
            'value': e.amount * min_intervals
        })
    });
    vis.displayData.push({
        'id' : vis.displayData.length,
        'label' : 'Actual Volume',
        'value' : sum
    });

    // Update the visualization
    vis.updateVis();
}


/*
 * The drawing function
 */

VolumeChart.prototype.updateVis = function(){
    var vis = this;

    // Update domains
    vis.y.domain([0, d3.max(vis.displayData, function(e){ return e.value;})]);
    vis.x.domain(vis.displayData.map(function(e){return e.label;}))
        .rangeRoundBands([0, vis.width], .05);

    // Draw actual bars
    var bars = vis.svg.selectAll(".bar")
        .data(this.displayData);

    bars.enter().append("rect")
        .attr("class", "bar");

    bars
        .transition()
        .attr("width", vis.x.rangeBand())
        .attr("height", function(d){
            return vis.height - vis.y(d.value);
        })
        .attr("x", function(d, index){
            return vis.x(d.label);
        })
        .attr("y", function(d){
            return vis.y(d.value);
        });

    bars.exit().remove();


    // Call axis function with the new domain
    vis.svg.select(".y-axis").call(vis.yAxis);

    vis.svg.select(".x-axis").call(vis.xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function(d) {
            return "rotate(-45)"
        })
        .text(function(d){
            return d.toString();
        });
}


VolumeChart.prototype.onSelectionChange = function(selectionStart, selectionEnd){
    var vis = this;

    console.log(selectionStart);
    console.log(selectionEnd);

    // Filter data depending on selected time period (brush)
    // *** TO-DO ***
    vis.filteredData = vis.dischargeData.filter(function(d){
        return d.timestamp >= selectionStart && d.timestamp <= selectionEnd;
    })
    console.log(vis.filteredData);

    vis.wrangleData();
}
