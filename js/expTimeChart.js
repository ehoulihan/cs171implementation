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

ExpTimeChart = function(_parentElement, _dataL8, _dataF, _dataV, _chartType, _toggle) {
    this.parentElement = _parentElement;
    this.dataL8 = _dataL8;
    this.dataF = _dataF;
    this.dataV = _dataV;
    this.chartType = _chartType;
    this.margin = {top: 20, right: 60, bottom: 80, left: 80};

    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 400 - this.margin.top - this.margin.bottom;

    console.log("here!");
    this.playButton();

    //this.initVis();
};


/*
 *  Initialize station map
 */

d3.legend = function(g) {
    g.each(function() {
        var g= d3.select(this),
            items = {},
            svg = d3.select(g.property("nearestViewportElement")),
            legendPadding = g.attr("data-style-padding") || 5,
            lb = g.selectAll(".legend-box").data([true]),
            li = g.selectAll(".legend-items").data([true])

        lb.enter().append("rect").classed("legend-box",true)
        li.enter().append("g").classed("legend-items",true)

        svg.selectAll("[data-legend]").each(function() {
            var self = d3.select(this)
            items[self.attr("data-legend")] = {
                pos : self.attr("data-legend-pos") || this.getBBox().y,
                color : self.attr("data-legend-color") != undefined ? self.attr("data-legend-color") : self.style("fill") != 'none' ? self.style("fill") : self.style("stroke")
            }
        })

        items = d3.entries(items).sort(function(a,b) { return a.value.pos-b.value.pos})


        li.selectAll("text")
            .data(items,function(d) { return d.key})
            .call(function(d) { d.enter().append("text")})
            .call(function(d) { d.exit().remove()})
            .attr("y",function(d,i) { return i+"em"})
            .attr("x","1em")
            .text(function(d) { ;return d.key})

        li.selectAll("circle")
            .data(items,function(d) { return d.key})
            .call(function(d) { d.enter().append("circle")})
            .call(function(d) { d.exit().remove()})
            .attr("cy",function(d,i) { return i-0.25+"em"})
            .attr("cx",0)
            .attr("r","0.4em")
            .style("fill",function(d) { console.log(d.value.color);return d.value.color})

        // Reposition and resize the box
        var lbbox = li[0][0].getBBox()
        lb.attr("x",(lbbox.x-legendPadding))
            .attr("y",(lbbox.y-legendPadding))
            .attr("height",(lbbox.height+2*legendPadding))
            .attr("width",(lbbox.width+2*legendPadding))
    })
    return g
};




ExpTimeChart.prototype.playButton = function(){
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
                    console.log("**Running Simulation of type: " + jProg.chartType + "**");
                    simulationStatus=1;
                    jProg.initVis();
                    runSimulation(jProg.chartType);
                });

        });

}

ExpTimeChart.prototype.initVis = function() {
    var jProg = this;

    // Reset html
    d3.select("#"+jProg.parentElement).html("");

    jProg.svg = d3.select("#" + jProg.parentElement).append("svg")
        .attr("width", jProg.width + jProg.margin.left + jProg.margin.right)
        .attr("height", jProg.height + jProg.margin.top + jProg.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + jProg.margin.left + "," + jProg.margin.top + ")");

    jProg.x = d3.time.scale().range([0,jProg.width]);
    console.log(jProg.x);
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

ExpTimeChart.prototype.updateVis = function() {
    var jProg = this;

    var dateExtent = d3.extent(jProg.dataL8, function(d){return d.date;});
    var heightExtent = d3.extent(jProg.dataL8,function(d){return d.height});

    jProg.x.domain([dateExtent[0],dateExtent[1]]);
    jProg.y.domain([212, 216]);

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


    //jProg.y.domain(jFlood.y.domain());

    jProg.svg.select(".y-axis-group")
        .call(jProg.yAxis);

    jProg.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - jProg.margin.left + 10)
        .attr("x",0 - (jProg.height / 2) + 10)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Elevation (feet above sea level)");


    var circleL8 = jProg.svg.selectAll("circle")
        .data(jProg.dataL8);

    var circleF = jProg.svg.selectAll("circle")
        .data(jProg.dataF);

    var circleV = jProg.svg.selectAll("circle")
        .data(jProg.dataV);

    circleL8.enter().append("circle")
        .attr("class", "water-dot")
        .attr("fill", "#707086")
        .attr("cx", function(d, index) {return jProg.x(d.date) })
        .attr("cy",function(d){
            return jProg.y(d.height + 200);
        });

    circleF.enter().append("circle")
        .attr("class", "water-dot")
        .attr("fill", "red")
        .attr("cx", function(d, index) {return jProg.x(d.date) })
        .attr("cy",function(d){
            return jProg.y(d.height + 200);
        });

    circleV.enter().append("circle")
        .attr("class", "water-dot")
        .attr("fill", "yellow")
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
ExpTimeChart.prototype.updateFloodProgressLine = function(totalTime){
    var jProg = this;

    console.log(jProg);
    // var progressLineL8 = d3.svg.line()
    //     .x(function (d) { return jProg.x(d.date);})
    //     .y(function (d) { return jProg.y(d.height+200)});



    var progressLineL8 = d3.svg.line()
        .x(function (d) { return jProg.x(d.date);})
        .y(function (d) { return jProg.y(d.height+200)});

    var progressLineF = d3.svg.line()
        .x(function (d) { return jProg.x(d.date);})
        .y(function (d) { return jProg.y(d.height+200)});

    var progressLineV = d3.svg.line()
        .x(function (d) { return jProg.x(d.date);})
        .y(function (d) { return jProg.y(d.height+200)});


    // var progressLineV = d3.svg.line()
    //     .x(function (d) { return jProg.x(d.date);})
    //     .y(function (d) { return jProg.y(d.height+200)});

    jProg.pathL8 = jProg.svg.append("path")
        .data([jProg.dataL8])

        .attr({
            d: progressLineL8,
            fill: "none",
            stroke: "red",
            "stroke-width": 2

        })
        .attr("data-legend", "Lock 8")
    ;

    // .attr("data-legend",function(d) { return d.name})

    jProg.pathF = jProg.svg.append("path")
        .data([jProg.dataF])
        .attr({
            d: progressLineF,
            fill: "none",
            stroke: "blue",
            "stroke-width": 2
        })
        .attr("data-legend", "Freemans Bridge")
    ;

    jProg.pathV = jProg.svg.append("path")
        .data([jProg.dataV])
        .attr({
            d: progressLineV,
            fill: "none",
            stroke: "yellow",
            "stroke-width": 2
        })
        .attr("data-legend", "Vischer Ferry")
    ;
    // animate path
    var totalLengthL8 = jProg.pathL8[0][0].getTotalLength();
    var totalLengthF = jProg.pathF[0][0].getTotalLength();
    var totalLengthV = jProg.pathV[0][0].getTotalLength();

    console.log(totalLengthL8);
    console.log(totalLengthF);
    console.log(totalLengthV);

    // var totalLength = path.node().getTotalLength();

    var duration = totalTime;
    var interval = Math.round(duration/jProg.dataL8.length);

    var segments = [0];
    for(var i = 1; i < jProg.dataL8.length; i++) {
        var tmp = jProg.svg.append("path")
            .datum([jProg.dataL8[i-1], jProg.dataL8[i]])
            .attr("d", progressLineL8);
        segments.push(segments[i-1] + tmp[0][0].getTotalLength());
        tmp.remove();
    }

    var segments = [0];
    for(var i = 1; i < jProg.dataF.length; i++) {
        var tmp = jProg.svg.append("path")
            .datum([jProg.dataF[i-1], jProg.dataF[i]])
            .attr("d", progressLineF);
        segments.push(segments[i-1] + tmp[0][0].getTotalLength());
        tmp.remove();
    }

    var segments = [0];
    for(var i = 1; i < jProg.dataV.length; i++) {
        var tmp = jProg.svg.append("path")
            .datum([jProg.dataV[i-1], jProg.dataV[i]])
            .attr("d", progressLineV);
        segments.push(segments[i-1] + tmp[0][0].getTotalLength());
        tmp.remove();
    }


    jProg.pathL8
        .attr("stroke-dasharray", totalLengthL8 + " " + totalLengthL8)
        .attr("stroke-dashoffset", totalLengthL8)
        .transition()
        .duration(duration)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("id","L8-line");

    jProg.pathF
        .attr("stroke-dasharray", totalLengthF + " " + totalLengthF)
        .attr("stroke-dashoffset", totalLengthF)
        .transition()
        .duration(duration)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("id","F-line");

    jProg.pathV
        .attr("stroke-dasharray", totalLengthV + " " + totalLengthV)
        .attr("stroke-dashoffset", totalLengthV)
        .transition()
        .duration(duration)
        .ease("linear")
        .attr("stroke-dashoffset", 0)
        .attr("id","V-line");

    jProg.circlesL8 = jProg.svg.selectAll("circle")
        .data(jProg.dataL8)
        .enter()
        .append("circle")
        .attr("fill", "red");

    jProg.circlesL8
        .transition()
        .delay(function (d, i) { return segments[i]*duration/totalLengthL8;})
        .ease("linear")
        .attr({
            cx: function (d) { return jProg.x(d.date); },
            cy: function (d) { return jProg.y(d.height + 200)},
            r: 4,
            fill: "red",
            // /stroke: "#78B446",
            "stroke-width": 4
        });

    jProg.circlesF = jProg.svg.selectAll("circle")
        .data(jProg.dataF)
        .enter()
        .append("circle")
        .attr("fill", "blue");

    jProg.circlesF
        .transition()
        .delay(function (d, i) { return segments[i]*duration/totalLengthF;})
        .ease("linear")
        .attr({
            cx: function (d) { return jProg.x(d.date); },
            cy: function (d) { return jProg.y(d.height + 200)},
            r: 4,
            fill: "blue",
            // /stroke: "#78B446",
            "stroke-width": 4
        });


    jProg.circlesV = jProg.svg.selectAll("circle")
        .data(jProg.dataV)
        .enter()
        .append("circle")
        .attr("fill", "green");

    jProg.circlesV
        .transition()
        .delay(function (d, i) { return segments[i]*duration/totalLengthV;})
        .ease("linear")
        .attr({
            cx: function (d) { return jProg.x(d.date); },
            cy: function (d) { return jProg.y(d.height + 200)},
            r: 4,
            fill: "green",
            // /stroke: "#78B446",
            "stroke-width": 4
        });

    // var legendColor = ['red', 'blue', 'yellow'];
    //
    // var legend = d3.select("#exp-legend").
    // append("svg:svg").
    // attr("width", 250).
    // attr("height", 20)
    // for (var i = 0; i <= 2; i++) {
    //     legend.append("svg:rect").
    //     attr("x", i*50).
    //     attr("height", 20).
    //     attr("width", 50).
    //     attr("fill", legendColor[i]);//color
    // };
    var xTrans = jProg.width-200; var yTrans = jProg.height - 100;
    jProg.legend = jProg.svg.append("g")
        .attr("class","legend")
        .attr("transform","translate("+xTrans+","+yTrans+")")
        .style("font-size","12px")
        .call(d3.legend);







    jProg.tip.html(function(d){
        return "Elevation" + ": " + (d.height+200) + " @ " + d.date.toLocaleTimeString();
    });
    jProg.svg.call(jProg.tip);


    jProg.circlesL8
        .on('mouseover', jProg.tip.show)
        .on('mouseout', jProg.tip.hide);

    jProg.circlesF
        .on('mouseover', jProg.tip.show)
        .on('mouseout', jProg.tip.hide);

    jProg.circlesV
        .on('mouseover', jProg.tip.show)
        .on('mouseout', jProg.tip.hide);


}

ExpTimeChart.prototype.resetVis = function() {
    var jProg = this;

    //jProg.path.exit().remove();
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
                    console.log("**Running Simulation of type: " + jProg.chartType + "**");
                    simulationStatus=1;
                    kExpTime.initVis();
                    runSimulation(jProg.chartType);
                });

        });

};

