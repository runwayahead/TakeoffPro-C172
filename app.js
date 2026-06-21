/*
========================================================

TakeoffPro V2.2 Stable

app.js

Application Controller

========================================================
*/

"use strict";

/*
========================================================
Version
========================================================
*/

const APP_VERSION={

    app:"TakeoffPro",

    version:"2.2 Stable",

    aircraft:"C172 TAE125-02-114"

};


/*
========================================================
DOM
========================================================
*/

const APP={

    weight:null,

    temperature:null,

    qnh:null,

    elevation:null,

    runwayHeading:null,

    runwayLength:null,

    windDirection:null,

    windSpeed:null,

    slope:null,

    surface:null,

    procedure:null

};



/*
========================================================
Cache DOM
========================================================
*/

function cacheDOM(){

    APP.weight=document.getElementById("weight");

    APP.temperature=document.getElementById("temperature");

    APP.qnh=document.getElementById("qnh");

    APP.elevation=document.getElementById("elevation");

    APP.runwayHeading=document.getElementById("runwayHeading");

    APP.runwayLength=document.getElementById("runwayLength");

    APP.windDirection=document.getElementById("windDirection");

    APP.windSpeed=document.getElementById("windSpeed");

    APP.slope=document.getElementById("slope");

    APP.surface=document.getElementById("surface");

    APP.procedure=document.getElementById("procedure");

}



/*
========================================================
Read Input
========================================================
*/

function getInput(){

    return{

        weight:Number(APP.weight.value),

        temperature:Number(APP.temperature.value),

        qnh:Number(APP.qnh.value),

        elevation:Number(APP.elevation.value),

        runwayHeading:Number(APP.runwayHeading.value),

        runwayLength:Number(APP.runwayLength.value),

        windDirection:Number(APP.windDirection.value),

        windSpeed:Number(APP.windSpeed.value),

        slope:Number(APP.slope.value),

        surface:APP.surface.value,

        procedure:APP.procedure.value

    };

}



/*
========================================================
Validation
========================================================
*/

function validateInput(){

    const input=getInput();

    if(input.weight>1111){

        APP.weight.classList.add("error");

        return false;

    }

    APP.weight.classList.remove("error");

    return true;

}



/*
========================================================
Refresh
========================================================
*/

function refreshApp(){

    if(!validateInput()){

        return;

    }

    updateAtmosphere();

    updateWind();

    updatePerformance();

}
/*
========================================================
Event Registration
========================================================
*/

function registerEvents(){

    const elements=[

        APP.weight,
        APP.temperature,
        APP.qnh,
        APP.elevation,

        APP.windDirection,
        APP.windSpeed,

        APP.runwayHeading,
        APP.runwayLength,

        APP.slope,

        APP.surface,
        APP.procedure

    ];

    elements.forEach(function(element){

        if(!element){

            return;

        }

        element.addEventListener(

            "input",

            refreshApp

        );

        element.addEventListener(

            "change",

            refreshApp

        );

    });

}



/*
========================================================
Display Mirror

Safety Card

========================================================
*/

function updateDisplayValues(){

    const finalValue=document.getElementById(

        "finalDistance"

    );

    const runwayLength=document.getElementById(

        "runwayLength"

    );

    const finalDisplay=document.getElementById(

        "finalRequiredDisplay"

    );

    const runwayDisplay=document.getElementById(

        "runwayAvailableDisplay"

    );

    if(

        finalValue&&

        finalDisplay

    ){

        finalDisplay.innerHTML=

            finalValue.innerHTML.replace(

                " m",

                ""

            );

    }

    if(

        runwayLength&&

        runwayDisplay

    ){

        runwayDisplay.innerHTML=

            runwayLength.value;

    }

}



/*
========================================================
Status

========================================================
*/

function updateStatus(){

    const finalDistance=

        Number(

            document.getElementById(

                "finalDistance"

            ).innerHTML.replace(

                " m",

                ""

            )

        );

    const runwayLength=

        Number(

            APP.runwayLength.value

        );

    const badge=document.querySelector(

        ".statusBadge"

    );

    if(!badge){

        return;

    }

    const reserve=

        runwayLength-finalDistance;

    badge.classList.remove(

        "safe",

        "caution",

        "danger"

    );

    if(reserve>=300){

        badge.classList.add(

            "safe"

        );

        badge.innerHTML="SAFE";

        return;

    }

    if(reserve>=150){

        badge.classList.add(

            "caution"

        );

        badge.innerHTML="CAUTION";

        return;

    }

    badge.classList.add(

        "danger"

    );

    badge.innerHTML=

        "NOT<br>RECOMMENDED";

}



/*
========================================================
Complete Refresh

========================================================
*/

function updateApplication(){

    refreshApp();

    updateDisplayValues();

    updateStatus();

}
/*
========================================================
Reset

========================================================
*/

function resetApplication(){

    APP.weight.value=1111;

    APP.temperature.value=15;

    APP.qnh.value=1013;

    APP.elevation.value=0;

    APP.windDirection.value=0;

    APP.windSpeed.value=0;

    APP.runwayHeading.value=0;

    APP.runwayLength.value=800;

    APP.slope.value=0;

    APP.surface.value="asphalt";

    APP.procedure.value="normal";

    updateApplication();

}



/*
========================================================
Live Update

========================================================
*/

function updateLiveValues(){

    updateDisplayValues();

    updateStatus();

}



/*
========================================================
Calculation Trigger

========================================================
*/

function calculateTakeoff(){

    if(!validateInput()){

        setStatus(

            "AFM LIMIT<br>MTOW 1111 kg",

            "danger"

        );

        return;

    }

    /*
    performance.js übernimmt:

    updateAtmosphere()

    updateWind()

    updatePerformance()

    */

    updatePerformance();

    updateLiveValues();

}



/*
========================================================
Initialisation

========================================================
*/

function initialiseApplication(){

    cacheDOM();

    registerEvents();

    calculateTakeoff();

}



/*
========================================================
Public API

========================================================
*/

window.TakeoffPro={

    refresh:function(){

        calculateTakeoff();

    },

    reset:function(){

        resetApplication();

    },

    version:function(){

        return APP_VERSION;

    }

};
