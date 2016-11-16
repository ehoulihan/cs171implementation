
// Function to convert date objects to strings or reverse
var dateFormatter = d3.time.format("%m/%d/%Y");

var crestChart;

// (1) Load data asynchronously
queue()
    .defer(d3.csv,"data/crests.csv")
    .defer(d3.json, "data/stages.json")
    .await(createVis);


function createVis(error, crestData, stageData){
    if(error) { console.log(error); }

    crestData.forEach(function(e){
        e.date = dateFormatter.parse(e.date);
        e.height = +e.height;
    });

    for(var key in stageData){
        stageData[key] = +stageData[key]
    }


    crestChart = new CrestChart("flood-history-chart", crestData, stageData);

}