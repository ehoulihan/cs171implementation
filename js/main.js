

// Function to convert date objects to strings or reverse
var dateFormatter = d3.time.format("%m/%d/%Y");
var dischargeDateFormatter = d3.time.format("%Y-%m-%d %H:%M:%S");
var floodDateFormatter = d3.time.format("%Y-%m-%d %H:%M");

var crestChart, dischargeChart,jFlood,jFloodTime,kExpTime, volumeChart;
var simulationStatus = 0;
var maxFloodDataPoints = 190;

var myEventHandler = {};

// (1) Load data asynchronously
queue()
    .defer(d3.csv,"data/crests.csv")
    .defer(d3.json, "data/stages.json")
    .defer(d3.csv, "data/discharge_with_volume.csv")
    .defer(d3.csv,"data/elevation.csv")
    .defer(d3.csv,"data/flood_gage_height.csv")
    .defer(d3.csv,"data/lock8_experiment_clean.csv")
    .defer(d3.csv,"data/expheight.csv")
    .defer(d3.csv,"data/vischer_experiment_clean.csv")
    .defer(d3.csv, "data/terrain_real.csv")
    .await(createVis);


function createVis(error, crestData, stageData, dischargeData,elevationData,floodGageData, lock8Data, freemansData, vischerData, speedElevationData){
    if(error) { console.log(error); }

    dischargeLevels = [
        {"name": "Flow Rate During Experiment",
         "amount": 10000},
        {"name": "Current Max Flow Rate",
            "amount": 45000}
    ];

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
        e.volume = +e.volume;
    })

    dischargeData = dischargeData.filter(function(e){
        return e.timestamp > dateFormatter.parse("8/1/2011") &&
               e.timestamp < dateFormatter.parse("10/20/2011") &&
               e.timestamp.getMinutes() == 0;
    });

    //////////////////////
    // Jackie's Data Vis//
    //////////////////////

    // Wrangle Data
    elevationData = wrangleElevation(elevationData);
    floodGageData = wrangleFloodGage(floodGageData);



    // Instantiate Visualizations
    jFlood = new FloodChart("flood-chart-area", elevationData, floodGageData);
    jFloodTime = new FloodTimeChart("flood-time-area",floodGageData, "flood");
    kExpTime = new FloodTimeChart("exp-time-area2",floodGageData,"experiment");

    crestChart = new CrestChart("flood-history-chart", crestData, stageData, 'see-years', 'stick');


    dischargeChart = new DischargeChart("discharge-chart", dischargeData, "change-scale", dischargeLevels, myEventHandler);
    volumeChart = new VolumeChart("volume-chart", dischargeData, dischargeLevels);

    // (5) Bind event handler
    $(myEventHandler).bind("viewChanged", function(event, rangeStart, rangeEnd){
        volumeChart.onSelectionChange(rangeStart, rangeEnd);
    });

    //////////////////////
    // Karen's Data Vis//
    //////////////////////

    // lock8Data = wrangleHeight(lock8Data);
    // freemansData = wrangleHeight(freemansData);
    // vischerData = wrangleHeight(vischerData);
    speedElevationData = wrangleSpeedElevation(speedElevationData);

    lock8Data = wrangleFloodGage(lock8Data);
    freemansData = wrangleFloodGage(freemansData);
    vischerData = wrangleFloodGage(vischerData);
    console.log(lock8Data);
    console.log(freemansData);
    console.log(vischerData);

    kExpTime = new ExpTimeChart("exp-time-area", lock8Data, freemansData, vischerData, "experiment");
    //kExpTimeBig = new FloodTimeChart("exp-time-area2",floodGageData,"experiment");
    speedChart = new SpeedChart("speed-chart", speedElevationData, "speed");

}
// Data Wrangling Functions
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
    data = data.slice(0,maxFloodDataPoints);
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

// Karen Speed Vis Data Wrangling
function wrangleSpeedElevation(data){
    var counter = 0;
    data.forEach(function(d){
        d.X = +d.X;
        d.Y = +d.Y;
        counter = counter + 1;
    });

    // Store csv data in global variable
    return data;

}



// Jackie's Interaction Functions
function resetFloodSimulation(){
    jFlood.resetVis();
    jFloodTime.resetVis();
}

function resetExpSimulation(){
    console.log("RESETTING KAREN!")
    kExpTime.resetVis();
}

function runSimulation(type){
    console.log("Running Flood Simulation");
    if(type == "flood"){
        // Set a starting point for the flood data
        var timeIndex = jFlood.floodStartIndex;

        // Function to call flood simulation
        var renderUpdateWater = function(){

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

            }


        };

        // INTERVAL
        var intervalTimeLapse = 100;

        // Run simulation via transitions for the line and via time interval for water area
        jFloodTime.updateFloodProgressLine((jFlood.floodEndIndex - jFlood.floodStartIndex) * intervalTimeLapse);
        var interval = setInterval(renderUpdateWater,intervalTimeLapse);
    }
    else{

        console.log("IN EXPERIMENT PATH")

        kExpTime.updateFloodProgressLine(5000);
        setTimeout(resetExpSimulation, 5000);
        //kExpTimeBig.updateFloodProgressLine(5000);
    }
}


// function mapInfoButtonClick(){
//     console.log("Clicked!");
//     $("#map-info-button").css('color', 'red');
//
// }

// $("#map-info-button").click(function(){
//     var currentIndex = +($("#flood-map-pic").attr("src").slice(-5)[0]);
//     currentIndex = currentIndex == 5 ? 1 : currentIndex + 1;
//     $("#flood-map-pic")
//         .fadeOut(function(){
//             $(this).attr("src","img/Flood" + currentIndex + ".png")
//                 .bind('onreadystatechange load', function(){
//                     if (this.complete) $(this).fadeIn(500);
//                 });
//         });
//     $("#map-info-text")
//         .fadeOut(function(){
//             $(this).html(mapInfo[currentIndex - 1]).fadeIn();
//             $(this).attr("display","block");
//         })
// });

function jumpToNext(){

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

// $(document).ready(function () {
//
//     $('#myCarousel').carousel({
//         interval: 3000
//     });
//
//     $('#myCarousel').carousel('cycle');
//
// });
//
// $('#myCarousel').on('slid.bs.carousel', function() {
//     currentIndex = $('div.active').index();
//     $('#map-info-text').html(mapInfo[currentIndex]);
// });