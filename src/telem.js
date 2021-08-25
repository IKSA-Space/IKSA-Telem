//@ts-check
//Getting Telem
let telemObj = {
    fuel:{
        S1:{
            Fuel: [0, 1],
            Ox: [0, 1]
        },
        S2:{
            Fuel: [0, 1],
            Ox: [0, 1],
        },
        MONO: [0, 1],
        LFB:{
            LFB1:{
                Fuel: [0, 1],
                Ox: [0, 1]
            },
            LFB2:{
                Fuel: [0, 1],
                Ox: [0, 1]
            },
            LFB3:{
                Fuel: [0, 1],
                Ox: [0, 1]
            },
            LFB4:{
                Fuel: [0, 1],
                Ox: [0, 1]
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

setInterval(refreshTelem, 500);

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
        setPercent: function(object, value, nonFuelFlag){
            if(nonFuelFlag){

            }else{
                if(value != -1){
                    const percent = (value[0] / value[1])*100;
                    object.innerHTML = percent.toFixed(2).toString() + "%";
                    object.style.height = percent.toString() + "%";
                }else{
                    object.innerHTML = "UNABLE TO CONTACT";
                    object.style.height = "100%";
                    object.classList.add("bg-danger")
                }
            }
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
    console.log(telemObj)
//Show Telem
    //Propulsion
        //S1
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s1.fuel, telemObj.fuel.S1.Fuel);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s1.ox, telemObj.fuel.S1.Ox);
        //S2
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.fuel, telemObj.fuel.S2.Fuel);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.ox, telemObj.fuel.S2.Ox);
        readOutFunctions.progressBar.setPercent(readOuts.fuel.s2.mono, telemObj.fuel.MONO);
        //LFB
            //LFB1        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb1.fuel, telemObj.fuel.LFB.LFB1.Fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb1.ox, telemObj.fuel.LFB.LFB1.Ox);
            //LFB2        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb2.fuel, telemObj.fuel.LFB.LFB2.Fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb2.ox, telemObj.fuel.LFB.LFB2.Ox);
            //LFB3        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb3.fuel, telemObj.fuel.LFB.LFB3.Fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb3.ox, telemObj.fuel.LFB.LFB3.Ox);
            //LFB4        
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb4.fuel, telemObj.fuel.LFB.LFB4.Fuel);
            readOutFunctions.progressBar.setPercent(readOuts.fuel.lfb.lfb4.ox, telemObj.fuel.LFB.LFB4.Ox);
        //Valves
            //GF => LFB
            //LFB => S1
            //S1 => S2
}, 500)
