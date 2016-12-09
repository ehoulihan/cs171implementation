

// Function to convert date objects to strings or reverse
var dateFormatter = d3.time.format("%m/%d/%Y");
var dischargeDateFormatter = d3.time.format("%Y-%m-%d %H:%M");
var floodDateFormatter = d3.time.format("%Y-%m-%d %H:%M");

var crestChart, dischargeChart,jFlood,jFloodTime;
var simulationStatus = 0;

var myEventHandler = {};

// (1) Load data asynchronously
queue()
    .defer(d3.csv,"data/crests.csv")
    .defer(d3.json, "data/stages.json")
    .defer(d3.csv, "data/discharge15s.csv")
    .defer(d3.csv,"data/elevation.csv")
    .defer(d3.csv,"data/flood_gage_height.csv")
    .await(createVis);


function createVis(error, crestData, stageData, dischargeData,elevationData,floodGageData){
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

    // Jackie's Data Vis
    // Wrangle Data
    elevationData = wrangleElevation(elevationData);
    floodGageData = wrangleFloodGage(floodGageData);
    // Instantiate Visualizations


    jFlood = new FloodChart("flood-chart-area", elevationData, floodGageData);
    jFloodTime = new FloodTimeChart("flood-time-area",floodGageData);

    crestChart = new CrestChart("flood-history-chart", crestData, stageData, 'see-years');

    dischargeChart = new DischargeChart("discharge-chart", dischargeData, "change-scale");

}

function wrangleElevation(data){
    var counter = 0;
    data.forEach(function(d){
        // Convert numeric values to 'numbers'
        d.elevation = ((+d.elevation)*3.28084);
        var latlong = d.location.replace(/[\(\)]/g,'').split(',');
        d.lat = +latlong[0];
        d.long = +latlong[1];
        d.index = counter;
        counter = counter + 1;
    });

    // Store csv data in global variable
    data = data.slice(0,190);
    return data;
}

function wrangleFloodGage(data){
    data.forEach(function(d){
        d.day = +d.day;
        // Data from somewhere (cite!!) maybe NWS?
        d.height = (+d.height)+3;
        d.hour = Math.floor((+d.minute) / 60);
        d.minute = (+d.minute) % 60;
        d.month = +d.month;
        d.year = +d.year;
        d.date = floodDateFormatter.parse(d.date + " " + d.hour + ":" + d.minute)
    });
    data = data.filter(function(elt){
        return (elt.minute == 0);
    });
    return data;
}
function resetFloodSimulation(){
    jFlood.resetVis();
    jFloodTime.resetVis();
}

function runFloodSimulation(){
    console.log("Running Flood Simulation")

    var timeIndex = jFlood.floodStartIndex;

    var renderUpdateWater = function(){

        //jFlood.updateFloodWater(timeIndex);

        if(jFlood.stopInterval==true || (($("#select-area").val() == "AVERAGE") & (simulationStatus==0))){
            console.log("STOPPING INTERVAL!");
            clearInterval(interval);
            resetFloodSimulation();
        }
        else{

            jFlood.updateFloodWater(timeIndex);

            timeIndex = timeIndex+1;

            if (timeIndex >= jFlood.floodEndIndex){
                simulationStatus = 0;
                resetFloodSimulation();
                clearInterval(interval)
            }

            //jFloodTime.updateFloodProgress(timeIndex);
        }

        // if(jFlood.stopInterval==true || $("#select-area").val() == "AVERAGE"){
        //     console.log("STOPPING INTERVAL!");
        //     clearInterval(interval);
        //     resetFloodSimulation();
        // }
        // else{
        //     // Update WATER Area
        //     jFlood.waterArea.y1(function(d) { return jFlood.y(200 + jFlood.gageHeight[timeIndex].height);});
        //
        //     jFlood.svg.selectAll(".water-area")
        //         .transition().duration(400)
        //         .attr("d", jFlood.waterArea(jFlood.elevationData));
        //
        //     // Update WATER Line
        //     jFlood.waterLine.y(function(d) { return jFlood.y(200+jFlood.gageHeight[timeIndex].height); });
        //
        //     jFlood.svg.selectAll(".water-line")
        //         .transition().duration(400)
        //         .attr("d", jFlood.waterLine(jFlood.elevationData));
        //
        //     timeIndex = timeIndex+1;
        //
        //     if (timeIndex >= jFlood.floodEndIndex){
        //         clearInterval(interval)
        //     }
        //     jFloodTime.svg.selectAll("circle")
        //         .attr("id","blank-dot");
        //
        //     jFloodTime.svg.selectAll("#small-dot,#inactive-dot,#last-active-dot,#blank-dot")
        //         .attr("id",function(d,index){
        //             var res = index==timeIndex ? "small-dot":"inactive-dot";
        //             res = (index>=timeIndex-6 & index <timeIndex) ? "last-active-dot": res;
        //             res = index < timeIndex - 6 ? "inactive-dot" : res;
        //             res = index > timeIndex ? "blank-dot" : res;
        //             res = (index < timeIndex & d.hour == 24) ? "last-active-dot" : res;
        //             return res;
        //         })
        //     jFloodTime.svg.selectAll("#large-dot")
        //         .attr("id",function(d,index){
        //             var res = "inactive-dot";
        //             if(index ==timeIndex){
        //                 res = "large-dot";
        //             }
        //             return res;
        //         })
        //
        // }

    };
    var intervalTimeLapse = 100;
    jFloodTime.updateFloodProgressLine((jFlood.floodEndIndex - jFlood.floodStartIndex) * intervalTimeLapse);
    var interval = setInterval(renderUpdateWater,intervalTimeLapse);
}

// $(document).ready(function() {
//     var icon = $('.play');
//     icon.click(function() {
//         icon.toggleClass('active');
//         simulationStatus = 1;
//         jFloodTime.initVis();
//         runFloodSimulation();
//         return false;
//     });
// });

$(document).ready(function () {

    $('#myCarousel').carousel({
        interval: 3000
    });

    $('#myCarousel').carousel('cycle');

});

$('#myCarousel').on('slid.bs.carousel', function() {
    currentIndex = $('div.active').index();
    $('#map-info-text').html(mapInfo[currentIndex]);
});