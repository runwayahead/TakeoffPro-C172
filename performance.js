/*
========================================================

TakeoffPro V2.2 Stable

performance.js

C172 TAE125-02-114

AFM based

AFM tables

1111 kg
1134 kg
1157 kg

Pilot MTOW

1111 kg

Weight <1111 kg

linear extrapolation

Density Altitude

minimum 0 ft

========================================================
*/


/*
========================================================
Limits
========================================================
*/

const PERFORMANCE_LIMITS={

    /*
    Pilot limitation
    */

    maxTakeoffWeight:1111,

    /*
    AFM tables

    used internally
    */

    afmMinWeight:1111,

    afmMaxWeight:1157,

    minPressureAltitude:0,

    maxPressureAltitude:10000,

    minTemperature:-20,

    maxTemperature:50

};



/*
========================================================
Helpers
========================================================
*/

function roundMeter(value){

    return Math.round(value);

}


function applyPercent(value,percent){

    return value*(1+(percent/100));

}


function reservePercent(runway,required){

    if(runway<=0){

        return 0;

    }

    return ((runway-required)/runway)*100;

}



/*
========================================================
Weight

returns entered weight

Interpolation is handled later

========================================================
*/

function getAFMWeight(weight){

    return Number(weight);

}



/*
========================================================
Validation

Maximum Takeoff Weight

1111 kg

========================================================
*/

function validateAFM(

    weight,

    pressureAltitude,

    temperature

){

    let message=[];

    if(

        weight>

        PERFORMANCE_LIMITS.maxTakeoffWeight

    ){

        message.push(

            "Maximum Takeoff Weight exceeded (1111 kg)"

        );

    }

    if(

        pressureAltitude<

        PERFORMANCE_LIMITS.minPressureAltitude

    ){

        message.push(

            "Pressure Altitude below AFM range"

        );

    }

    if(

        pressureAltitude>

        PERFORMANCE_LIMITS.maxPressureAltitude

    ){

        message.push(

            "Pressure Altitude above AFM range"

        );

    }

    if(

        temperature<

        PERFORMANCE_LIMITS.minTemperature

    ){

        message.push(

            "Temperature below AFM range"

        );

    }

    if(

        temperature>

        PERFORMANCE_LIMITS.maxTemperature

    ){

        message.push(

            "Temperature above AFM range"

        );

    }

    return{

        valid:

            message.length===0,

        message:

            message.join("<br>")

    };

}
/*
========================================================
AFM Performance

Weight interpolation

1111 kg
1134 kg
1157 kg

Weight <1111 kg

=> linear extrapolation

Density Altitude <0 ft

=> 0 ft

========================================================
*/

function calculateAFMPerformance(

    inputWeight,
    pressureAltitude,
    temperature

){

    /*
    ----------------------------------------------------
    AFM minimum

    Density Altitude

    ----------------------------------------------------
    */

    pressureAltitude=Math.max(

        0,

        pressureAltitude

    );

    /*
    ----------------------------------------------------
    Validation

    ----------------------------------------------------
    */

    const validation=

        validateAFM(

            inputWeight,

            pressureAltitude,

            temperature

        );

    if(!validation.valid){

        return{

            valid:false,

            message:validation.message,

            groundRoll:0,

            obstacle15m:0,

            afmWeight:inputWeight

        };

    }

    /*
    ----------------------------------------------------
    Ground Roll

    ----------------------------------------------------
    */

    const groundRoll=

        interpolateWeight(

            AFM.groundRoll,

            inputWeight,

            pressureAltitude,

            temperature

        );

    /*
    ----------------------------------------------------
    Takeoff Distance 15 m

    ----------------------------------------------------
    */

    const obstacle15m=

        interpolateWeight(

            AFM.obstacle15m,

            inputWeight,

            pressureAltitude,

            temperature

        );

    /*
    ----------------------------------------------------
    Result

    ----------------------------------------------------
    */

    return{

        valid:true,

        groundRoll:groundRoll,

        obstacle15m:obstacle15m,

        afmWeight:inputWeight

    };

}



/*
========================================================
Update AFM Output

========================================================
*/

function updateAFMOutput(result){

    if(!result.valid){

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

            "calculationTree"

        ).innerHTML=result.message;

        return;

    }

    document.getElementById(

        "groundRoll"

    ).innerHTML=

        roundMeter(

            result.groundRoll

        )+" m";

    document.getElementById(

        "takeoffDistance"

    ).innerHTML=

        roundMeter(

            result.obstacle15m

        )+" m";

}
/*
========================================================
Weight Validation

Pilot MTOW

1111 kg

========================================================
*/

function validateWeightInput(){

    const field=document.getElementById("weight");

    if(!field){

        return;

    }

    const weight=Number(field.value);

    if(weight>PERFORMANCE_LIMITS.maxTakeoffWeight){

        field.style.border="2px solid red";

        field.style.background="#ffe6e6";

        setStatus(

            "AFM LIMIT<br>MTOW 1111 kg",

            "danger"

        );

    }

    else{

        field.style.border="";

        field.style.background="";

    }

}
/*
========================================================
Weight Validation

MTOW = 1111 kg

========================================================
*/

function validateWeightInput(){

    const input=document.getElementById("weight");

    if(!input){

        return;

    }

    const weight=Number(input.value);

    input.classList.remove("warning");

    input.classList.remove("error");

    if(weight>1111){

        input.classList.add("error");

        setStatus(

            "AFM LIMIT<br>MTOW 1111 kg",

            "danger"

        );

        return;

    }

    if(weight<1111){

        input.classList.add("warning");

    }

}
