/**
 * Created by jackiemartinez on 11/27/16.
 */
kProg = {};

kProg.data = kExp.data;

kProg.margin = {top: 20, right: 20, bottom: 20, left: 60};

kProg.width = 800 - kProg.margin.left - kProg.margin.right;
kProg.height = 200 - kProg.margin.top - kProg.margin.bottom;

kProg.svg = d3.select("#exp-vis-area").append("svg")
    .attr("width", kProg.width + kProg.margin.left + kProg.margin.right)
    .attr("height", kProg.height + kProg.margin.top + kProg.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + kProg.margin.left + "," + kProg.margin.top + ")");

// Create Scales
kExp.x = d3.scale.linear()
    .range([0,kExp.width]);
kExp.y = d3.scale.linear()
    .range([kExp.height, 0]);

kExp.xAxis = d3.svg.axis()
    .scale(kExp.x)
    .orient("bottom");

kExp.yAxis = d3.svg.axis()
    .scale(kExp.y)
    .orient("left");

kExp.svg.append("g")
    .attr("class", "x-axis-group")
    .attr("transform", "translate(0," + (kExp.height) + ")");

kExp.svg.append("g")
    .attr("class", "y-axis-group");



