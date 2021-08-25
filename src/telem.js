//@ts-check
//Getting Telem
let telemObj = {
    fuel:{
        s1:{
            fuel: 0.0,
            ox: 0.0
        },
        s2:{
            fuel: 0.0,
            ox: 0.0,
            mono: 0.0
        },
        lfb:{
            lfb1:{
                fuel: 0.0,
                ox: 0.0
            },
            lfb2:{
                fuel: 0.0,
                ox: 0.0
            },
            lfb3:{
                fuel: 0.0,
                ox: 0.0
            },
            lfb4:{
                fuel: 0.0,
                ox: 0.0
            },
        }
    }
}

function refreshTelem(){
    const data = null;

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            telemObj = JSON.parse(this.responseText);
        }
    });

    xhr.open("GET", "http://localhost:3001/telem?auth=IKSA_AUTH_rg7euhgahiuo");
    xhr.send(data);
}

setInterval(refreshTelem, 5000);

//Readouts
const readOuts ={
    fuel:{
        s1:{
            fuel: document.getElementById("PROP_PROGRESS_S1_FUEL"),
            ox: document.getElementById("PROP_PROGRESS_S1_OX")
        },
        s2:{
            fuel: document.getElementById("PROP_PROGRESS_S2_FUEL"),
            ox: document.getElementById("PROP_PROGRESS_S2_OX"),
            mono: document.getElementById("PROP_PROGRESS_S2_MONO"),
        },
        lfb:{
            lfb1:{
                fuel: document.getElementById("PROP_PROGRESS_LFB_LFB1_FUEL"),
                ox: document.getElementById("PROP_PROGRESS_LFB_LFB1_OX")
            },
            lfb2:{
                fuel: document.getElementById("PROP_PROGRESS_LFB_LFB2_FUEL"),
                ox: document.getElementById("PROP_PROGRESS_LFB_LFB2_OX")
            },
            lfb3:{
                fuel: document.getElementById("PROP_PROGRESS_LFB_LFB3_FUEL"),
                ox: document.getElementById("PROP_PROGRESS_LFB_LFB3_OX")
            },
            lfb4:{
                fuel: document.getElementById("PROP_PROGRESS_LFB_LFB4_FUEL"),
                ox: document.getElementById("PROP_PROGRESS_LFB_LFB4_OX")
            }
        },
        valves: {
            gflfb: document.getElementById("PROP_BUTTON_VALVE_GFLFB"),
            lfbs1: document.getElementById("PROP_BUTTON_VALVE_LFBS1"),
            s1s2: document.getElementById("PROP_BUTTON_VALVE_S1S2"),
        }
    }
}
const readOutFunctions = {
    progressBar:{
        /**
         * Sets progress for a bar
         * @param {HTMLElement} object 
         * @param {number} percent 
         */
        setPercent: function(object, percent){

        }
    },
    button:{
        /**
         * Sets a colour,msg for the button
         * @param {HTMLElement} object 
         * @param {string} state 
         * @param {string} msg 
         */
        setState: function(object, state, msg){
            
        }
    }
}

setInterval(()=>{
//Show Telem
    //Propulsion
        //S1
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s1.fuel, telemObj.fuel.s1.fuel);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s1.ox, telemObj.fuel.s1.ox);
        //S2
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.fuel, telemObj.fuel.s2.fuel);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.ox, telemObj.fuel.s2.ox);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.mono, telemObj.fuel.s2.mono);
        //LFB
            //LFB1        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb1.fuel, telemObj.fuel.lfb.lfb1.fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb1.ox, telemObj.fuel.lfb.lfb1.ox);
            //LFB2        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb2.fuel, telemObj.fuel.lfb.lfb2.fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb2.ox, telemObj.fuel.lfb.lfb2.ox);
            //LFB3        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb3.fuel, telemObj.fuel.lfb.lfb3.fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb3.ox, telemObj.fuel.lfb.lfb3.ox);
            //LFB4        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb4.fuel, telemObj.fuel.lfb.lfb4.fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb4.ox, telemObj.fuel.lfb.lfb4.ox);
        //Valves
            //GF => LFB
            //LFB => S1
            //S1 => S2
}, 500)
