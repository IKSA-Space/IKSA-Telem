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
        },
        ELEC: [0,1]
    },
    VALVES: {
        LPLFB: false,
        LFBS1: false,
        S1S2: false
    },
    VENTS: {
        LFB: false,
        S1: false,
        S2: false,
        GFLFB: false,
        GFCORE: false
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

//CUSTOM MEASURMENTS
let elecPrevStore = 0;

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
            lfbs1: document.getElementById("PROP_BUTTON_VALVE_FLBS1"),
            s1s2: document.getElementById("PROP_BUTTON_VALVE_S1S2"),
        },
        vents:{
            LFB: document.getElementById("PROP_BUTTON_VENT_LFB"),
            S1: document.getElementById("PROP_BUTTON_VENT_S1"),
            S2: document.getElementById("PROP_BUTTON_VENT_S2"),
            GFLFB: document.getElementById("PROP_BUTTON_VENT_GFLFB"),
            GFCORE: document.getElementById("PROP_BUTTON_VENT_GFCT"),
        }
    },
    elec:{
        battLevel: document.getElementById("ELEC_PROGRESS_BATTLEVEL"),
        draw: document.getElementById("ELEC_STAT_DRAW")
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
         * @param {string|boolean|number} state 
         * @param {string} msg 
         */
        setState: function(object, state, msg){
            switch(state){
                case true:
                    object.className = 'btn btn-success';
                    object.innerHTML = msg;
                    break;
                case false:
                    object.className = 'btn btn-danger';
                    object.innerHTML = msg;
                    break;
                default:
                    if(state == -1){
                        object.className = 'btn btn-warning';
                        object.innerHTML = "NO CONTACT"    
                    }else{
                        object.className = 'btn btn-info';
                        object.innerHTML = "ERROR||" + state
                    }
                    
                    break;
            }      
        }
    },
    chart:{
        store: new Map(),
        addData: async function(chartEl, data){
            if(readOutFunctions.chart.store.has(chartEl.id) == false){
                const labels = [
                    'T-0'
                  ];
                  const dataSetting = {
                    labels: labels,
                    datasets: [{
                      label: 'Electrical Levels',
                      backgroundColor: 'rgb(50, 50, 50)',
                      borderColor: 'rgb(255, 255, 255)',
                      data: [0],
                    }]
                  };
                readOutFunctions.chart.store.set(chartEl.id, {
                    values: [],
                    id: chartEl.id,
                    ctx: chartEl.getContext('2d'),
                    // @ts-ignore
                    chart: new Chart(chartEl.getContext('2d'), {
                        type: 'line',
                        data: dataSetting,
                        options: {
                            animation:{
                                duration: 0
                            },
                            responsive: true,
                            plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Vehicle Elec Levels'
                            }
                            }
                        },
                    })
                })
            }


            let mapObj = readOutFunctions.chart.store.get(chartEl.id);
            console.log(mapObj)
            mapObj.values.push(data);
            if(mapObj.values.length > 21){
                mapObj.values.shift();
            }
            mapObj.chart.data.datasets[0].data = mapObj.values;
            mapObj.chart.data.labels.push(telemObj.met.toFixed(1));
            mapObj.chart.update();
            readOutFunctions.chart.store.set(chartEl.id, mapObj);
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
            readOutFunctions.button.setState(readOuts.fuel.valves.gflfb, telemObj.VALVES.LPLFB, telemObj.VALVES.LPLFB == true ? "Open" : "Closed");
            //LFB => S1
            readOutFunctions.button.setState(readOuts.fuel.valves.lfbs1, telemObj.VALVES.LFBS1, telemObj.VALVES.LFBS1 == true ? "Open" : "Closed");
            //S1 => S2
            readOutFunctions.button.setState(readOuts.fuel.valves.s1s2, telemObj.VALVES.S1S2, telemObj.VALVES.S1S2 == true ? "Open" : "Closed");
        //Vents
            //LFB
            readOutFunctions.button.setState(readOuts.fuel.vents.LFB, telemObj.VENTS.LFB, telemObj.VENTS.LFB == true ? "Open" : "Closed")
            //S1
            readOutFunctions.button.setState(readOuts.fuel.vents.S1, telemObj.VENTS.S1, telemObj.VENTS.S1 == true ? "Open" : "Closed")
            //S2
            readOutFunctions.button.setState(readOuts.fuel.vents.S2, telemObj.VENTS.S2, telemObj.VENTS.S2 == true ? "Open" : "Closed")
            //GFLFB
            readOutFunctions.button.setState(readOuts.fuel.vents.GFLFB, telemObj.VENTS.GFLFB, telemObj.VENTS.GFLFB == true ? "Open" : "Closed")
            //GFCORE
            readOutFunctions.button.setState(readOuts.fuel.vents.GFCORE, telemObj.VENTS.GFCORE, telemObj.VENTS.GFCORE == true ? "Open" : "Closed")
    //Electrical
        //Total Levels Chart
        readOutFunctions.progressBar.setPercent(readOuts.elec.battLevel, telemObj.fuel.ELEC);
        //Draw
        readOuts.elec.draw.innerHTML = `${(elecPrevStore - telemObj.fuel.ELEC[0]).toFixed(2)}/&#xBD;s`;
        elecPrevStore = telemObj.fuel.ELEC[0];
}, 500)
