// this is the part of the file where we do all the things to index.html

// Function to convert date objects to strings or reverse
var dateFormatter = d3.time.format("%m/%d/%Y");
var dischargeDateFormatter = d3.time.format("%Y-%m-%d %H:%M");

var crestChart, dischargeChart;

var myEventHandler = {};

// (1) Load data asynchronously
queue()
    .defer(d3.csv,"data/crests.csv")
    .defer(d3.json, "data/stages.json")
    .defer(d3.csv, "data/discharge15s.csv")
    .await(createVis);


function createVis(error, crestData, stageData, dischargeData){
    if(error) { console.log(error); }

    crestData.forEach(function(e){
        e.date = dateFormatter.parse(e.date);
        e.height = +e.height;
    });

    for(var key in stageData){
        stageData[key] = +stageData[key]
    }

    dischargeData.forEach(function(e){
        e.discharge = +e.discharge;
        e.timestamp = dischargeDateFormatter.parse(e.timestamp);
    })

    dischargeData = dischargeData.filter(function(e){
        return e.timestamp > dateFormatter.parse("8/1/2011") &&
               e.timestamp < dateFormatter.parse("10/20/2011") &&
               e.timestamp.getMinutes() == 0;
    });


    crestChart = new CrestChart("flood-history-chart", crestData, stageData, 'see-years');

    dischargeChart = new DischargeChart("discharge-chart", dischargeData, "change-scale");

}