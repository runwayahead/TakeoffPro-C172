/*
========================================================

TakeoffPro V2.3 Stable

performance.js

AFM Performance Engine

========================================================
*/

"use strict";

/*
========================================================
Limits
========================================================
*/

const PERFORMANCE_LIMITS={

    maxTakeoffWeight:1111,

    minimumDensityAltitude:0

};

/*
========================================================
Helpers
========================================================
*/

function roundMeter(value){

    return Math.round(value);

}

function applyCorrection(

    distance,

    percent

){

    return distance*

        (

            1+

            percent/100

        );

}

function calculateRemaining(

    runway,

    required

){

    return runway-required;

}

/*
========================================================
Validation
========================================================
*/

function validateWeight(

    weight

){

    if(

        weight>

        PERFORMANCE_LIMITS.maxTakeoffWeight

    ){

        return{

            valid:false,

            message:

            "Maximum Takeoff Weight exceeded (1111 kg)"

        };

    }

    return{

        valid:true,

        message:""

    };

}

/*
========================================================
Density Altitude

never below zero

========================================================
*/

function normalizeDensityAltitude(

    densityAltitude

){

    return Math.max(

        PERFORMANCE_LIMITS.minimumDensityAltitude,

        densityAltitude

    );

}

/*
========================================================
AFM Calculation

========================================================
*/

function calculateAFM(

    weight,

    densityAltitude,

    temperature

){

    densityAltitude=

        normalizeDensityAltitude(

            densityAltitude

        );

    return{

        groundRoll:

            interpolateWeight(

                AFM.groundRoll,

                weight,

                densityAltitude,

                temperature

            ),

        obstacle15m:

            interpolateWeight(

                AFM.obstacle15m,

                weight,

                densityAltitude,

                temperature

            )

    };

}
/*
========================================================

Corrections

========================================================
*/

function getSurfaceCorrection(surface){

    switch(surface){

        case "grass":

            return 15;

        case "grasswet":

            return 30;

        case "contaminated":

            return 60;

        default:

            return 0;

    }

}


function getProcedureCorrection(procedure){

    switch(procedure){

        case "short":

            return 0;

        default:

            return 15;

    }

}


function getSlopeCorrection(slope){

    /*
    uphill increases distance

    downhill reduces distance

    10 % per 1 % slope

    */

    return slope*10;

}


function getWindCorrection(

    headwind,

    tailwind

){

    if(headwind>0){

        return -(headwind*3);

    }

    if(tailwind>0){

        return tailwind*5;

    }

    return 0;

}



/*
========================================================

Final Required Distance

========================================================
*/

function calculateFinalPerformance(

    afm,

    configuration

){

    let required=

        afm.obstacle15m;

    required=

        applyCorrection(

            required,

            getSurfaceCorrection(

                configuration.surface

            )

        );

    required=

        applyCorrection(

            required,

            getProcedureCorrection(

                configuration.procedure

            )

        );

    required=

        applyCorrection(

            required,

            getSlopeCorrection(

                configuration.slope

            )

        );

    required=

        applyCorrection(

            required,

            getWindCorrection(

                configuration.headwind,

                configuration.tailwind

            )

        );

    return{

        groundRoll:

            roundMeter(

                afm.groundRoll

            ),

        obstacle15m:

            roundMeter(

                afm.obstacle15m

            ),

        finalRequired:

            roundMeter(

                required

            )

    };

}



/*
========================================================

Remaining Runway

========================================================
*/

function calculateSafety(

    runwayLength,

    finalRequired

){

    const remaining=

        calculateRemaining(

            runwayLength,

            finalRequired

        );

    let status="SAFE";

    if(

        remaining<150

    ){

        status="NOT RECOMMENDED";

    }

    else if(

        remaining<300

    ){

        status="CAUTION";

    }

    return{

        remaining,

        status

    };

}
/*
========================================================

Output

========================================================
*/

function updatePerformanceOutput(

    performance,

    safety

){

    const groundRoll=document.getElementById(

        "groundRoll"

    );

    const takeoffDistance=document.getElementById(

        "takeoffDistance"

    );

    const finalDistance=document.getElementById(

        "finalDistance"

    );

    const remainingDistance=document.getElementById(

        "remainingDistance"

    );

    const finalRequiredDisplay=document.getElementById(

        "finalRequiredDisplay"

    );

    const runwayAvailableDisplay=document.getElementById(

        "runwayAvailableDisplay"

    );

    const statusDisplay=document.getElementById(

        "statusDisplay"

    );

    const headerStatusBadge=document.getElementById(

        "headerStatusBadge"

    );

    if(groundRoll){

        groundRoll.innerHTML=

            performance.groundRoll+" m";

    }

    if(takeoffDistance){

        takeoffDistance.innerHTML=

            performance.obstacle15m+" m";

    }

    if(finalDistance){

        finalDistance.innerHTML=

            performance.finalRequired+" m";

    }

    if(finalRequiredDisplay){

        finalRequiredDisplay.innerHTML=

            performance.finalRequired;

    }

    if(remainingDistance){

        remainingDistance.innerHTML=

            safety.remaining;

    }

    if(runwayAvailableDisplay){

        runwayAvailableDisplay.innerHTML=

            document.getElementById(

                "runwayLength"

            ).value;

    }

    if(statusDisplay){

        statusDisplay.innerHTML=

            safety.status;

    }

    if(headerStatusBadge){

        headerStatusBadge.innerHTML=

            safety.status;

    }

}



/*
========================================================

Calculation Tree

========================================================
*/

function updateCalculationTree(

    afm,

    performance,

    safety

){

    const tree=document.getElementById(

        "calculationTree"

    );

    if(!tree){

        return;

    }

    tree.innerHTML=

        ""

        +"AFM Ground Roll: "

        +performance.groundRoll

        +" m<br>"

        +"AFM 15 m: "

        +performance.obstacle15m

        +" m<br>"

        +"Final Required: "

        +performance.finalRequired

        +" m<br>"

        +"Remaining: "

        +safety.remaining

        +" m<br>"

        +"Status: "

        +safety.status;

}



/*
========================================================

AFM LIMIT

========================================================
*/

function showAFMLimit(

    message

){

    document.getElementById(

        "groundRoll"

    ).innerHTML="---";

    document.getElementById(

        "takeoffDistance"

    ).innerHTML="---";

    document.getElementById(

        "finalDistance"

    ).innerHTML="AFM LIMIT";

    document.getElementById(

        "remainingDistance"

    ).innerHTML="---";

    document.getElementById(

        "statusDisplay"

    ).innerHTML="AFM LIMIT";

    document.getElementById(

        "headerStatusBadge"

    ).innerHTML="AFM LIMIT";

    document.getElementById(

        "calculationTree"

    ).innerHTML=message;

}
/*
========================================================

Main Update

========================================================
*/

function updatePerformance(){

    /*
    ----------------------------------------------------
    Input
    ----------------------------------------------------
    */

    const weight=Number(

        document.getElementById(

            "weight"

        ).value

    );

    const temperature=Number(

        document.getElementById(

            "temperature"

        ).value

    );

    const runwayLength=Number(

        document.getElementById(

            "runwayLength"

        ).value

    );

    /*
    ----------------------------------------------------
    Density Altitude

    atmosphere.js returns:

    {
        pressureAltitude,
        densityAltitude
    }

    ----------------------------------------------------
    */

    const atmosphere=

        updateAtmosphere();

    const densityAltitude=

        normalizeDensityAltitude(

            atmosphere.densityAltitude

        );

    /*
    ----------------------------------------------------
    Validation

    ----------------------------------------------------
    */

    const validation=

        validateWeight(

            weight

        );

    if(

        !validation.valid

    ){

        showAFMLimit(

            validation.message

        );

        return;

    }

    /*
    ----------------------------------------------------
    AFM

    ----------------------------------------------------
    */

    const afm=

        calculateAFM(

            weight,

            densityAltitude,

            temperature

        );

    /*
    ----------------------------------------------------
    Configuration

    ----------------------------------------------------
    */

    const configuration={

        surface:

            document.getElementById(

                "surface"

            ).value,

        procedure:

            document.getElementById(

                "procedure"

            ).value,

        slope:Number(

            document.getElementById(

                "slope"

            ).value

        ),

        headwind:Number(

            document.getElementById(

                "headwind"

            ).innerText.replace(

                " kt",

                ""

            )

        )||0,

        tailwind:Number(

            document.getElementById(

                "tailwind"

            )?.innerText.replace(

                " kt",

                ""

            )

        )||0

    };

    /*
    ----------------------------------------------------
    Final Performance

    ----------------------------------------------------
    */

    const performance=

        calculateFinalPerformance(

            afm,

            configuration

        );

    /*
    ----------------------------------------------------
    Safety

    ----------------------------------------------------
    */

    const safety=

        calculateSafety(

            runwayLength,

            performance.finalRequired

        );

    /*
    ----------------------------------------------------
    Output

    ----------------------------------------------------
    */

    updatePerformanceOutput(

        performance,

        safety

    );

    updateCalculationTree(

        afm,

        performance,

        safety

    );

}



/*
========================================================

Public API

========================================================
*/

window.updatePerformance=

    updatePerformance;

window.calculateAFM=

    calculateAFM;

window.calculateFinalPerformance=

    calculateFinalPerformance;

window.calculateSafety=

    calculateSafety;
