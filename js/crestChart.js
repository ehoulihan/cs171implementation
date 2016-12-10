/**

*
*  StationMap - Object constructor function
*  @param _parentElement   -- HTML element in which to draw the visualization
*  @param _data            -- Array data about date and height of river at that date
 * @param _stages           -- object that describes the river's height at a given flood stage
 * @param _toggle           -- oHTML identifier for the toggle switch as the axis changes
 * @param _photoElement    -- photoElement that chooses the initial size
 */

CrestChart = function(_parentElement, _data, _stages, _toggle, _photoElement) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.stages = _stages;
    this.toggle = _toggle;
    this.dateFormatter = d3.time.format("%m/%d/%Y");
    this.photoElement = _photoElement;
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
    vis.margin = { top: 60, right: 200, bottom: 80, left: 200 };

    vis.width = $("#" + vis.photoElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 700 - vis.margin.top - vis.margin.bottom;

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

    vis.xAxisGroup.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ (vis.width / 2) +","+ ( vis.margin.bottom / 2)+")")  // text is drawn off the screen top left, move down and out and rotate
        .attr("visibility", "hidden")
        .text("Year");

    vis.yAxisGroup = vis.svg.append("g")
        .attr("class", "y-axis axis");

    // now add titles to the axes
    vis.yAxisGroup.append("text")
        .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
        .attr("transform", "translate("+ -(vis.margin.left/2) +","+(vis.height/2)+")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
        .text("Flood Peak (ft)");

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

    var stick_x = 300;

    var circle_diameter = 10;

    var stick_height = $("#stick").height() * 13.2/17.5;

    var stick_width = $("#stick").width() * 1.4/11.6;
    // get the width of the photo to ensure its accuracy

    d3.extent(vis.displayData, function(e){return e.height;})

    vis.y.domain([d3.min(vis.displayData, function(e) {return e.height}),
                  d3.max(vis.displayData, function(e) {return e.height}) + 1]);
    vis.x.domain(d3.extent(vis.displayData, function(e){ return e.date; }));

    var stick = vis.svg.selectAll("#stick")
        .data(["random"]);

    stick.enter().append("rect")
        .attr("class", vis.show_years ? "wide-stick" : "stick")
        .attr("id", "stick");

    stick.transition()
        .duration(1000)
        .attr("class", vis.show_years ? "wide-stick" : "stick")
        .attr("x", vis.show_years ? 0 : stick_x)
        .attr("y", 0)
        .attr("width", vis.show_years ? vis.x.range()[1] : stick_width)
        .attr("height", vis.y.range()[0]);

    stick.exit().remove();



// join
    var marks = vis.svg.selectAll("rect.crest-rect")
        .data(vis.displayData);

    // enter
    marks.enter().append("rect")
        .attr("class", "crest-rect")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

    // update
    marks.transition()
        .duration(1000)
        .attr("x", function(d) { return vis.x(d.date) - ( vis.show_years ? circle_diameter / 2 : 0); })
        .attr("y", function(d, index) { return vis.y(d.height) - ( vis.show_years ? circle_diameter / 2 : 0); })
        .attr("rx", function(e){
            return vis.show_years ? circle_diameter : 0;
        })
        .attr("ry", function(e){
                return vis.show_years ? circle_diameter : 0;
        })
        .attr("width", function(e){
            return vis.show_years ? circle_diameter : stick_width;
        })
        .attr("height", function(){
            return vis.show_years ? circle_diameter : 3;
        })
        .attr("fill", function(e){
            for(var key in vis.stages){
                if(e.height >= vis.stages[key]){
                    return vis.classify(vis.stages[key]);
                }
            }
            return "rgba(0,0,0,0.0)";
        });


    // Exit
    marks.exit().remove();


    // get stages in correct format
    var stages_array = [];
    for (x in vis.stages){
        stages_array.push({
            "type" : x,
            "height" : vis.stages[x]
        })
    }
    var stage_lines = vis.svg.selectAll("line.stage-line")
        .data(stages_array);

    stage_lines.enter().append("line")
        .attr("class", "stage-line");


    stage_lines.transition()
        .duration(1000)
        .attr("x1", vis.x.range()[0])
        .attr("x2", vis.show_years ? vis.x.range()[1] : stick_width)
        .attr("y1", function(e){
            return vis.y(e.height);
        })
        .attr("y2", function(e){
            return vis.y(e.height);
        })
        .attr("stroke-dasharray", "5, 5")
        .attr("stroke", function(e){
            for(var key in vis.stages){
                if(e.height >= vis.stages[key]){
                    return vis.classify(vis.stages[key]);
                }
            }
            return "black";
        });

    var line_labels = vis.svg.selectAll(".stage-line-label")
        .data(stages_array);

    line_labels.enter().append("text")
        .attr("class", "stage-line-label");

    line_labels.transition()
        .duration(1000)
        .attr("text-anchor", "start")
        .attr("x", (vis.show_years ? vis.x.range()[1] : stick_width) + 5)
        .attr("y",function(e){
            return vis.y(e.height);
        })
        .text(function(e){
            console.log(e);
            return e.type;
        });

    vis.svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(vis.yAxis);

    vis.xAxisGroup.select("text.label")
        .attr("visibility", vis.show_years ? "visible" : "hidden");

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

