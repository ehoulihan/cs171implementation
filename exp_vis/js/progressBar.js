/**
 * Created by jackiemartinez on 11/27/16.
 */
jProg = {};

jProg.data = jFlood.data;

jProg.margin = {top: 20, right: 20, bottom: 20, left: 60};

jProg.width = 800 - jProg.margin.left - jProg.margin.right;
jProg.height = 200 - jProg.margin.top - jProg.margin.bottom;

jProg.svg = d3.select("#chart-area").append("svg")
    .attr("width", jProg.width + jProg.margin.left + jProg.margin.right)
    .attr("height", jProg.height + jProg.margin.top + jProg.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + jProg.margin.left + "," + jProg.margin.top + ")");

// Create Scales
jFlood.x = d3.scale.linear()
    .range([0,jFlood.width]);
jFlood.y = d3.scale.linear()
    .range([jFlood.height, 0]);

jFlood.xAxis = d3.svg.axis()
    .scale(jFlood.x)
    .orient("bottom");

jFlood.yAxis = d3.svg.axis()
    .scale(jFlood.y)
    .orient("left");

jFlood.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (jFlood.height) + ")");

jFlood.svg.append("g")
    .attr("class", "y-axis-group");



