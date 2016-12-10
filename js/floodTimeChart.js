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

FloodTimeChart = function(_parentElement, _data, _stages, _toggle) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.margin = {top: 20, right: 50, bottom: 80, left: 50};

    this.width = $("#" + this.parentElement).width() - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    this.playButton();


    //this.initVis();
};


/*
 *  Initialize station map
 */

FloodTimeChart.prototype.playButton = function(){
    var jProg = this;

    // Insert Play Button
    d3.xml("img/play_icon.svg",
        function(error, documentFragment) {

            if (error) {console.log(error); return;}

            // Get relevant node from xml file
            var svgNode = documentFragment.getElementById("Page-1");

            // Create SVG
            jProg.svg = d3.select("#" + jProg.parentElement).append("svg")
                .attr("width", jProg.width + jProg.margin.left + jProg.margin.right)
                .attr("height", jProg.height + jProg.margin.top + jProg.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + jProg.margin.left + "," + jProg.margin.top + ")");

            // Add path
            jProg.svg.node().appendChild(svgNode);


            var btnX = (jProg.width)/2 - 30; var btnY = jProg.height/2 - 40;

            // Modify svg icon to be a button
            jProg.svg.select("#Page-1")
                .attr("transform","translate("+btnX+","+btnY+") scale(4)")
                // .on("mouseover",function(){
                //     this.setAttribute("transform","translate("+btnX+","+btnY+") scale(2)")
                // })
                // .on("mouseout",function(){
                //     this.setAttribute("transform","translate("+btnX+","+btnY+") scale(2)")
                // })
                .on("click",function(){
                    console.log("Running Flood Simulation");
                    simulationStatus=1;
                    jFloodTime.initVis();
                    runFloodSimulation();
                });

        });

}

FloodTimeChart.prototype.initVis = function() {
    var jProg = this;

    // Reset html
    d3.select("#"+jProg.parentElement).html("");

    jProg.svg = d3.select("#" + jProg.parentElement).append("svg")
        .attr("width", jProg.width + jProg.margin.left + jProg.margin.right)
        .attr("height", jProg.height + jProg.margin.top + jProg.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + jProg.margin.left + "," + jProg.margin.top + ")");

    jProg.x = d3.time.scale().range([0,jProg.width]);
    jProg.y = d3.scale.linear().range([jProg.height, 0]);

    jProg.xAxis = d3.svg.axis()
        .scale(jProg.x)
        .orient("bottom");

    jProg.yAxis = d3.svg.axis()
        .scale(jProg.y)
        .orient("left");

    jProg.svg.append("g")
        .attr("class", "x-axis-group")
        .attr("transform", "translate(0," + (jProg.height) + ")");

    jProg.svg.append("g")
        .attr("class", "y-axis-group");

    // Initialize Water Level
    jProg.svg.append("path")
        .attr("class","water-line");


    jProg.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .direction('e');

    jProg.updateVis();

};


/*
 *  Data wrangling
 */

// CrestChart.prototype.wrangleData = function() {
//     var vis = this;
//
//     // Currently no data wrangling/filtering needed
//     vis.displayData = vis.data;
//
//     // Update the visualization
//     vis.updateVis();
//
// }


/*
 *  The drawing function
 */

FloodTimeChart.prototype.updateVis = function() {
    var jProg = this;

    var dateExtent = d3.extent(jProg.data, function(d){return d.date;});
    var heightExtent = d3.extent(jProg.data,function(d){return d.height});

    jProg.x.domain([dateExtent[0],dateExtent[1]]);

    jProg.svg.select(".x-axis-group")
        .call(jProg.xAxis)
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


    jProg.y.domain(jFlood.y.domain());

    jProg.svg.select(".y-axis-group")
        .call(jProg.yAxis);

    jProg.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - jProg.margin.left)
        .attr("x",0 - (jProg.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Elevation (feet above sea level)");

    //
    var circle = jProg.svg.selectAll("circle")
        .data(jProg.data);

    circle.enter().append("circle")
        .attr("class", "water-dot")
        .attr("fill", "#707086")
        .attr("cx", function(d, index) {return jProg.x(d.date) })
        .attr("cy",function(d){
            return jProg.y(d.height + 200);
        });

    //
    // circle
    //     .transition()
    //     .duration(800)
    //     .attr("r", function(d,index) {
    //         var res = 3;
    //         res = d.hour == 24 ? 5 : res;
    //         res = index == 0 ? 3 : res;
    //         return res;
    //     })
    //     .attr("cx", function(d, index) {return jProg.x(d.date) })
    //     .attr("cy",function(d){
    //         return jProg.y(d.height + 200);
    //     })
    //     .attr("id",function(d,index){
    //         var res = "small-dot";
    //         res = d.hour == 24 ? "large-dot" : res;
    //         res = index == 0 ? "small-dot" : res;
    //         return res;
    //     });
    //

};
FloodTimeChart.prototype.updateFloodProgressLine = function(totalTime){
    var jProg = this;

    var progressLine = d3.svg.line()
        .x(function (d) { return jProg.x(d.date);})
        .y(function (d) { return jProg.y(d.height+200)});

    jProg.path = jProg.svg.append("path")
        .data([jProg.data])
        .attr({
            d: progressLine,
            fill: "none",
            stroke: "#337ab7",
            "stroke-width": 2
        });
    // animate path
    var totalLength = jProg.path[0][0].getTotalLength();
    // var totalLength = path.node().getTotalLength();

    var duration = totalTime;
    var interval = Math.round(duration/jProg.data.length);

    var segments = [0];
    for(var i = 1; i < jProg.data.length; i++) {
        var tmp = jProg.svg.append("path")
            .datum([jProg.data[i-1], jProg.data[i]])
            .attr("d", progressLine);
        segments.push(segments[i-1] + tmp[0][0].getTotalLength());
        tmp.remove();
    }


    jProg.path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(duration)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("id","water-progress-line");

    jProg.circles = jProg.svg.selectAll("circle")
        .data(jProg.data)
        .enter()
        .append("circle")
        .attr("fill", "blue");

    jProg.circles
        .transition()
        .delay(function (d, i) { return segments[i]*duration/totalLength;})
        .ease("linear")
        .attr({
            cx: function (d) { return jProg.x(d.date); },
            cy: function (d) { return jProg.y(d.height + 200)},
            r: 4,
            fill: "blue",
            // /stroke: "#78B446",
            "stroke-width": 4
        });

    jProg.tip.html(function(d){
        return "Elevation" + ": " + (d.height+200) + " @ " + d.date.toLocaleTimeString();
    });
    jProg.svg.call(jProg.tip);


    jProg.circles
        .on('mouseover', jProg.tip.show)
        .on('mouseout', jProg.tip.hide);


}

FloodTimeChart.prototype.resetVis = function() {
    var jProg = this;

    jProg.path.exit().remove();
    // Replay Icon Overlay
    d3.xml("img/replay_icon.svg",
        function(error, documentFragment) {

            if (error) {console.log(error); return;}

            var svgNode = documentFragment
                .getElementById("Page-1");
            //use plain Javascript to extract the node

            jProg.svg.node().appendChild(svgNode);

            var btnX = (jProg.width)/2;
            var btnY = 30;

            jProg.svg.select("#Page-1")
                .attr("transform","translate("+btnX+","+btnY+") scale(2)")
                // .on("mouseover",function(){
                //     this.setAttribute("transform","translate("+btnX+","+btnY+") scale(3)")
                // })
                // .on("mouseout",function(){
                //     this.setAttribute("transform","translate("+btnX+","+btnY+") scale(2)")
                // })
                .on("click",function(){
                    console.log("Running Flood Simulation");
                    simulationStatus=1;
                    jFloodTime.initVis();
                    runFloodSimulation();
                });

        });

};
