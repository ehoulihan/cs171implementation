/**
 * Created by klksunnygirl on 11/25/16.
 */

/**
 * Created by jackiemartinez on 11/13/16.
 */
// Global Variables

kSpeed = {};

kSpeed.river_start = [42.820274, -73.945933];
kSpeed.river_end = [42.821580, -73.947104];
kSpeed.avg_gage = 200;
kSpeed.min_elev = 200;

// SVG drawing area

kSpeed.margin = {top: 20, right: 20, bottom: 20, left: 60};

kSpeed.width = 800 - kSpeed.margin.left - kSpeed.margin.right,
    kSpeed.height = 300 - kSpeed.margin.top - kSpeed.margin.bottom;

kSpeed.svg = d3.select("#speed-chart").append("svg")
    .attr("width", kSpeed.width + kSpeed.margin.left + kSpeed.margin.right)
    .attr("height", kSpeed.height + kSpeed.margin.top + kSpeed.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + kSpeed.margin.left + "," + kSpeed.margin.top + ")");

kSpeed.predam_water = kSpeed.svg.append("rect")
    .attr("x", -1)
    .attr("y", 180)
    .attr("width", 720)
    .attr("height", 80)
    .style("fill", "#9fa4f9")
    .attr("id", "predam-water")
    .style("opacity", "1");

// Create Scales
kSpeed.x = d3.scale.linear()
    .range([0,kSpeed.width]);
kSpeed.y = d3.scale.linear()
    .range([kSpeed.height, 0]);

kSpeed.xAxis = d3.svg.axis()
    .scale(kSpeed.x)
    .orient("bottom");

kSpeed.yAxis = d3.svg.axis()
    .scale(kSpeed.y)
    .orient("left");

kSpeed.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (kSpeed.height) + ")");

kSpeed.svg.append("g")
    .attr("class", "y-axis-group");

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
//kSpeed.formatDate = d3.time.format("%Y");

// Initialize data
loadData();

// Initialize Line
kSpeed.svg.append("path")
    .attr("class", "elev-line");

// Initialize Water Level
kSpeed.svg.append("path")
    .attr("class","water-line");

// Initialize Tooltip

kSpeed.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .direction('e');
kSpeed.data;

// Load CSV file
function loadData() {
    d3.csv("../data/terrain3.csv", function(error, csv) {
        kSpeed.counter = 0;
        csv.forEach(function(d){
            // Convert numeric values to 'numbers'
            d.X = +d.X;
            // d.elevation = d.elevation*3.28084;
            // kSpeed.latlong = d.location.replace(/[\(\)]/g,'').split(',');
            // d.lat = +latlong[0];
            // d.long = +latlong[1];
            d.Y = +d.Y;
            //d.index = counter;
            kSpeed.counter = kSpeed.counter + 1;
        });

        // Store csv data in global variable
        kSpeed.data = csv;

        // Draw the visualization for the first time
        kSpeed_updateVisualization();
    });
}

// Render visualization
function kSpeed_updateVisualization() {
    // Get User Values
    console.log("DATA IN VIS");
    console.log(kSpeed.data);
    kSpeed.interpolate_value = "linear";
    kSpeed.numSamples = kSpeed.data.length;
    kSpeed.xVals = [0,kSpeed.numSamples];

    //x.domain([xVals[0],xVals[1]]);

    console.log(kSpeed.x.domain());
    console.log(kSpeed.x.range());
    kSpeed.svg.select(".x-axis-group")
        .call(kSpeed.xAxis);

    kSpeed.yExtent = d3.extent(kSpeed.data, function(d){
        return d.Y;
    });

    //y.domain([min_elev,yExtent[1]]);

    kSpeed.x.domain(d3.extent(kSpeed.data, function(d) { return d.X; }));
    kSpeed.y.domain(d3.extent(kSpeed.data, function(d) { return d.Y; }));

    kSpeed.svg.select(".y-axis-group")
        .call(kSpeed.yAxis);

    // Add Line Function
    kSpeed.line = d3.svg.line()
        .x(function(d) { return kSpeed.x(d.X); })
        .y(function(d) { return kSpeed.y(d.Y); })
        .interpolate(kSpeed.interpolate_value);




    // Build Line Chart
    kSpeed.svg.selectAll(".elev-line")
        .transition().duration(800)
        .attr("d", kSpeed.line(kSpeed.data));

    // Get Indeces of Water Start/End
    kSpeed.water = kSpeed.data.filter(function(d){
        console.log(d.elevation);
        return (d.elevation <= kSpeed.avg_gage);
    });
    console.log("WATER");
    console.log(kSpeed.water);

    kSpeed.water_line = d3.svg.line()
        .x(function(d) { return x(d.index); })
        .y(function(d) { return y(kSpeed.avg_gage); })
        .interpolate(kSpeed.interpolate_value);

    // kSpeed.predam_line = d3.svg.line()
    //     .x(function(d) { return x(d.index); })
    //     .y(function(d) { return y(100); })
    //     .interpolate(interpolate_value);


    // Build Line Chart
    kSpeed.svg.selectAll(".water-line")
        .transition().duration(800)
        .attr("d", kSpeed.water_line(kSpeed.water));

    // Build Areas
    kSpeed.water_area = d3.svg.area()
        .x(function(d) { return kSpeed.x(d.X); })
        .y0(kSpeed.height)
        .y1(function(d) { return kSpeed.y(kSpeed.avg_gage); });


    kSpeed.svg.append("path")
        .datum(kSpeed.data)
        .attr("class", "water-area")
        .attr("d", kSpeed.water_area)
        .style("opacity", "0.3")
        .attr("id", "water_area");



    kSpeed.land_area = d3.svg.area()
        .x(function(d) { return kSpeed.x(d.X); })
        .y0(kSpeed.height)
        .y1(function(d) { return kSpeed.y(d.Y); });

    kSpeed.svg.append("path")
        .datum(kSpeed.data)
        .attr("class", "land-area")
        .attr("d", kSpeed.land_area);

    kSpeed.lock8 = kSpeed.svg.append("rect")
                                .attr("x", -1)
                                .attr("y", -1)
                               .attr("width", 23)
                                .attr("height", 260)
                                .style("fill", "#5E2605")
                                .attr("id", "lock8")
                                .style("opacity", "0.3");

    kSpeed.lock7 = kSpeed.svg.append("rect")
        .attr("x", 700)
        .attr("y", 105)
        .attr("width", 23)
        .attr("height", 155)
        .style("fill", "#5E2605")
        .attr("id", "lock7")
        .style("opacity", "0.3");






    kSpeed.C_WIDTH = 300,
        kSpeed.C_HEIGHT = 200;
    //
    // kSpeed.width = C_WIDTH;
    // kSpeed.height = C_HEIGHT;
    kSpeed.timer_ret_val = false;
    //
    // kSpeed.mainsvg = d3.select("#speed-chart")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("class", "g_mainsvg");

    kSpeed.circledata = d3.map();
    kSpeed.circledata.set('x', 0);
    kSpeed.circledata.set('y', kSpeed.C_HEIGHT/2);

    kSpeed.circleg = kSpeed.svg.selectAll("g.blob")
        .data([kSpeed.circledata])
        .enter()
        .append("svg:g")
        .attr("class", "blob")
        .attr("transform", function(d) {return "translate(" + kSpeed.C_WIDTH/2 + "," + kSpeed.C_HEIGHT/2 + ")";});

    kSpeed.t_circle_object = kSpeed.circleg
        .append("circle")
        .attr("cx", function(d) { return 0; })
        .attr("cy", function(d) { return 0; })
        .attr("r", function(d) {return 30; })
        .attr("class", "object_circle")
        .attr("id", "slow_boat")
        .style("fill", "brown")
        .style("opacity", "0.3");

    kSpeed.stopdiv=d3.select("#stopdiv");
    kSpeed.stopdiv.on("click", function()	{
        kSpeed.timer_ret_val = true;
    });

    kSpeed.duration = 18000, kSpeed.targetX = 700,kSpeed.last = 0, kSpeed.t=0;
    d3.timer(function(elapsed) {
        kSpeed.t = (kSpeed.t + (elapsed - kSpeed.last) / kSpeed.duration) % 1;
        kSpeed.last = elapsed;
        kSpeed_update();
        return kSpeed.timer_ret_val;
    });

    function kSpeed_update(elapsed){
        kSpeed.t_x = kSpeed.circledata.get('x');
        console.log (kSpeed.t);
        kSpeed.t_x = kSpeed.targetX * kSpeed.t;

        kSpeed.svg.selectAll("g.blob")
            .attr("transform", function(d) {return "translate(" + kSpeed.t_x + "," + d.get('y') + ")";});

        kSpeed.circledata.set('x', kSpeed.t_x);
    }





    kSpeed.C1_WIDTH = 300,
        kSpeed.C1_HEIGHT = 200;
    //
    // kSpeed.width = C_WIDTH;
    // kSpeed.height = C_HEIGHT;
    //kSpeed.timer_ret_val = false;
    //
    // kSpeed.mainsvg = d3.select("#speed-chart")
    //     .append("svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("class", "g_mainsvg");

    kSpeed.circle1data = d3.map();
    kSpeed.circledata.set('x', 0);
    kSpeed.circledata.set('y', kSpeed.C1_HEIGHT/2);

    kSpeed.circleg1 = kSpeed.svg.selectAll("g.blob1")
        .data([kSpeed.circledata])
        .enter()
        .append("svg:g")
        .attr("class", "blob1")
        .attr("transform", function(d) {return "translate(" + kSpeed.C1_WIDTH/2 + "," + kSpeed.C1_HEIGHT/2 + ")";});

    kSpeed.t_circle_object1 = kSpeed.circleg1
        .append("circle")
        .attr("cx", function(d) { return 0; })
        .attr("cy", function(d) { return 70; })
        .attr("r", function(d) {return 30; })
        .attr("id", "fast_boat")
        .attr("class", "object_circle")
        .style("fill", "brown")
        .style("opacity", "0.3");

    // kSpeed.stopdiv=d3.select("#stopdiv");
    // stopdiv.on("click", function()	{
    //     timer_ret_val = true;
    // });

    kSpeed.duration1 = 2000, targetX1 = 700,last1 = 0, t1=0;
    d3.timer(function(elapsed1) {
        console.log(kSpeed.duration1);
        t1 = (t1 + (elapsed1 - last1) / kSpeed.duration1) % 1;
        last1 = elapsed1;
        update1();
        return kSpeed.timer_ret_val;
    });

    function update1(elapsed1){
        kSpeed.t_x1 = kSpeed.circledata.get('x');
        console.log (t1);
        t_x1 = targetX1 * t1;

        kSpeed.svg.selectAll("g.blob1")
            .attr("transform", function(d) {return "translate(" + t_x1 + "," + d.get('y') + ")";});

        kSpeed.circledata.set('x', t_x1);
    }

    $( "#pool" ).hover(
        function() {
            var active   = slow_boat.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#slow_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("fill", "red");
            // Update whether or not the elements are active
            slow_boat.active = active;

            var active_water   = water_area.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#water_area").style("opacity", newOpacity);
            d3.select("#water_area").style("opacity", newOpacity);
            // Update whether or not the elements are active
            water_area.active = active_water;

            var active_lock8   = lock8.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#lock8").style("opacity", newOpacity);
            d3.select("#lock8").style("opacity", newOpacity);
            // Update whether or not the elements are active
            lock8.active = active_lock8;

            var active_lock7   = lock7.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#lock7").style("opacity", newOpacity);
            d3.select("#lock7").style("opacity", newOpacity);
            // Update whether or not the elements are active
            lock7.active = active_lock7;
        }
    );

    $( "#natural_flow" ).hover(
        function() {
            var active   = fast_boat.active ? false : true,
                newOpacity = active ? 1 : 0.3;
            // Hide or show the elements
            d3.select("#fast_boat").style("opacity", newOpacity);
            d3.select("#fast_boat").style("opacity", newOpacity);
            d3.select("#slow_boat").style("fill", "red");
            // Update whether or not the elements are active
            fast_boat.active = active;
        }
    );



    // // Initialize DataPoints
    // //Create Circle
    // kSpeed.circle = svg.selectAll("circle")
    //     .data(data);
    //
    // // Call Tip
    // tip.html(function(d){
    //     html_l1 = d.elevation;
    //     html_l2 = "Elevation" + ": " + d.elevation;
    //     return html_l2;
    //     //return (html_l1 + "<br/>" + html_l2);
    // });
    // svg.call(tip);
    //
    // circle.enter().append("circle")
    //     .attr("class", "dot")
    //     .attr("fill", "#707086");
    //
    // circle
    //     .transition()
    //     .duration(800)
    //     .attr("r", function(d) { return 1; })
    //     .attr("cx", function(d, index) { return x(index) })
    //     .attr("cy",function(d){return y(d.elevation);});
    //
    // circle
    //     .on('mouseover', tip.show)
    //     .on('mouseout', tip.hide);
    //     .on('click',function(d){
    //         d3.selectAll(".dot")
    //             .attr("r",5);
    //         d3.select(this)
    //             .attr('r',10);
    //         showEdition(d);
    //     });
    //
    // Exit
    // circle.exit().remove();

}


// Show details for a specific FIFA World Cup
// function showEdition(d){
//     for (elt in d){
//         if (elt != "YEAR"){
//             ($("#"+elt).html(d[elt]));
//         }
//     }
// }

