/* Main Ground Facilities script */
// @ts-check
console.log("IKSA Telem Hub")
//const request = require('request');
import KRPC from './node_modules/krpc.js/lib/KRPC.js';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

//KRPC

const vehicleStore = {
    objects: {
        refFlights: {

        },
        refFrames: {
        },

    },
    telem: {
        alt: 0,
        VSPD: 0,
        SSPD: 0,
        OSPD: 0,
        THRO: 1,
        APO: 0,
        TTA: 0,
        PER: 0,
        TTP: 0,
        INC: 0,
        CONT: {
            RCS: false,
            SAS: false
        },
        fuel: {
            LFB: {
                LFB1: {
                    Fuel: 0,
                    Ox: 0
                },
                LFB2: {
                    Fuel: 0,
                    Ox: 0
                },
                LFB3: {
                    Fuel: 0,
                    Ox: 0
                },
                LFB4: {
                    Fuel: 0,
                    Ox: 0
                }
            },
            S1: {
                Fuel: 0,
                Ox: 0
            },
            S2: {
                Fuel: 0,
                Ox: 0
            },
            MONO: 0,
            ELEC: 0
        },
        THRUST:{
            REM3T: 0,
            REI2: 0,
            T301:0,
            T302:0,
            T303:0,
            T304:0
        },
        VALVES:{
            LPLFB: false,
            LFBS1: false,
            S1S2: false
        },
        VENTS:{
            LFB: false,
            S1: false,
            S2: false,
            GFLFB: false,
            GFCORE: false
        },
        attitude: {
            PIT: 0,
            ROL: 0,
            YAW: 0
        },
        LOC: {
            LAT: 0,
            LON: 0,
        },
        COMM: {
            name: "",
            delay: ""
        }
    }
}

const KRPCInit = async () =>{ 
    const options = {
      name: 'IKSA-Telem-Hub',
      host: "144.138.103.239",
      rpcPort: 49990,
      streamPort: 49991
    };
    vehicleStore.objects.client = new KRPC(options)
    let timeout = true
    try{
        vehicleStore.objects.client.load().then(async ()=>{
        timeout = false
        })
    }catch(err){
        console.error("ERROR!")
        console.debug("A record of this error has been saved at " + __dirname + "/errorLog.log")
        fs.writeFileSync(__dirname + "/errorLog.log", err)
    }
    setTimeout(async function(){
      if(timeout) {
        console.error("Unable to connect")
      }else{
        vehicleStore.objects.sc = await vehicleStore.objects.client.services.spaceCenter;
        vehicleStore.objects.vessel = await vehicleStore.objects.sc.activeVessel;
        vehicleStore.objects.control = await vehicleStore.objects.vessel.control
        vehicleStore.objects.refFrames.orbit = await vehicleStore.objects.vessel.orbit
        vehicleStore.objects.refFrames.surface = await vehicleStore.objects.vessel.surfaceReferenceFrame
        vehicleStore.objects.refFlights.surface = await vehicleStore.objects.vessel.flight(vehicleStore.objects.refFrames.surface)
        //vehicleStore.objects.comms = await (await vehicleStore.objects.client.services.remoteTech).comms(vehicleStore.objects.vessel);
        setInterval(telemGetter, 500);
        //getModuleList("VENT-S1-1")
        console.log("STARTED TELEM")
      }
    }, 10000);
}

const getPartThrust = async function (tag) {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.parts.then(parts => {
            parts.withTag(tag).then(part => {
                if (part.length == 1) {
                    part[0].engine.then(async (engineMod) => {
                        resolve(await engineMod.thrust);
                    })
                } else {
                    resolve(-1)
                }
            })
        })
    })
}

const getModuleList = async function (tag){
    return new Promise(resolve =>{
        vehicleStore.objects.vessel.parts.then(parts => {
            parts.withTag(tag).then(part => {
                if (part.length == 1) {
                    part[0].modules.then(async modules => {
                        modules.forEach(async module =>{
                            console.log(await module.name)
                        })
                        resolve()
                    })
                }
            })
        })
    })
}

const getValveState = async function (tag, target, openState, closedState){
    return new Promise(resolve =>{
        if(tag && target && openState && closedState){
            vehicleStore.objects.vessel.parts.then(parts => {
                parts.withTag(tag).then(part => {
                    if (part.length == 1) {
                        part[0].modules.then(async modules => {
                            let test = {};
                            modules.forEach(async module =>{
                                if(target == await module.name && await module.name != "ModuleGenerator"){
                                    if (await module.hasEvent(openState)){
                                        resolve(false)
                                    }else if(await module.hasEvent(closedState)){
                                        resolve(true)
                                    }else{
                                        resolve(null);
                                    }
                                }else if(await module.name == "ModuleGenerator"){
                                    if(test != null){
                                        if (await module.hasEvent(openState)){
                                            resolve(false);
                                        }else if(await module.hasEvent(closedState)){
                                            resolve(true)
                                        }else{
                                            test = null;
                                        }
                                    }else{
                                        if (await module.hasEvent(openState)){
                                            resolve(false);
                                        }else if(await module.hasEvent(closedState)){
                                            resolve(true)
                                        }else{
                                            resolve(null);
                                        }
                                    }
                                }
                            })
                            /*const amount = await resourcesMod.amount(resource);
                            const max = await resourcesMod.max(resource)
                            resolve([amount, max]);*/
                        })
                    } else {
                        resolve(-1);
                    }
                })
            })
        }else{
            resolve(false)
        }
        
    })
}

const getTankState = async function (tag, target){
    return new Promise(resolve =>{
        if(tag && target){
            vehicleStore.objects.vessel.parts.then(parts => {
                parts.withTag(tag).then(async partList => {
                    if (partList.length == 1) {
                        const part = partList[0];
                        const resources = await part.resources;
                        
                        resources.withResource(target).then((resourceList =>{
                            if(resourceList.length == 1){
                                const resource = resourceList[0];
                                resource.enabled.then(state =>{
                                    resolve(state);
                                })
                            }else{
                                resolve(false);
                            }
                        }))
                            /*const amount = await resourcesMod.amount(resource);
                            const max = await resourcesMod.max(resource)
                            resolve([amount, max]);*/
                    } else {
                        resolve(-1);
                    }
                })
            })
        }else{
            resolve(false)
        }
        
    })
}

const getPartFuel = async function (tag, resource) {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.parts.then(parts => {
            parts.withTag(tag).then(part => {
                if (part.length == 1) {
                    part[0].resources.then(async resourcesMod => {
                        const amount = await resourcesMod.amount(resource);
                        const max = await resourcesMod.max(resource)
                        resolve([amount, max]);
                    })
                } else {
                    resolve(-1);
                }
            })
        })
    })
}

const getElec = async function () {
    return new Promise(resolve => {
        vehicleStore.objects.vessel.resources.then(async resources => {
            const amount = await resources.amount("ElectricCharge")
            const max = await resources.max("ElectricCharge")
            resolve([amount, max])
        })
    })
}

const getComms = async function () {
    return new Promise(async resolve => {
        let names = [];
        let name = "";
        let delay = 0;
        const antennas = await vehicleStore.objects.comms.antennas;
        /*antennas.forEach(async antenna =>{
            if(await antenna.hasConnection ){
                if(names.includes(await antenna.targetGroundStation) == false){
                    names.push(await antenna.targetGroundStation)
                    console.log(names)
                }else{
                    console.log(2)
                }
            }
        })*/

        console.log(antennas);
        console.log((await vehicleStore.objects.comms.signalDelay).toFixed(5))
        resolve({
            name: "look, I tried ok",
            delay: (await vehicleStore.objects.comms.signalDelay).toFixed(5)
        })
    })
}

const telemGetter = async () => {
    vehicleStore.objects.refFlights.surface.verticalSpeed.then(value => vehicleStore.telem.VSPD = value);
    vehicleStore.objects.refFlights.surface.meanAltitude.then(value => vehicleStore.telem.alt = value);
    vehicleStore.objects.refFlights.surface.trueAirSpeed.then(value => vehicleStore.telem.SSPD = value);
    vehicleStore.objects.refFrames.orbit.speed.then(value => vehicleStore.telem.OSPD = value);
    vehicleStore.objects.control.throttle.then(value => vehicleStore.telem.THRO = value * 100);
    vehicleStore.objects.refFrames.orbit.apoapsisAltitude.then(value => vehicleStore.telem.APO = value);
    vehicleStore.objects.refFrames.orbit.timeToApoapsis.then(value => vehicleStore.telem.TTA = value);
    vehicleStore.objects.refFrames.orbit.periapsisAltitude.then(value => vehicleStore.telem.PER = value);
    vehicleStore.objects.refFrames.orbit.timeToPeriapsis.then(value => vehicleStore.telem.TTP = value);
    vehicleStore.objects.refFrames.orbit.inclination.then(value => vehicleStore.telem.INC = value);
    vehicleStore.objects.refFlights.surface.pitch.then(value => vehicleStore.telem.attitude.PIT = value);
    vehicleStore.objects.control.sas.then(value => vehicleStore.telem.CONT.SAS = value);
    vehicleStore.objects.control.rcs.then(value => vehicleStore.telem.CONT.RCS = value);
    vehicleStore.objects.refFlights.surface.heading.then(value => vehicleStore.telem.attitude.YAW = value);
    vehicleStore.objects.refFlights.surface.roll.then(value => vehicleStore.telem.attitude.ROL = value);
    vehicleStore.objects.refFlights.surface.longitude.then(value => vehicleStore.telem.LOC.LON = value);
    vehicleStore.objects.refFlights.surface.latitude.then(value => vehicleStore.telem.LOC.LAT = value);
    vehicleStore.objects.vessel.met.then(value => vehicleStore.telem.met=value)
    //Fuel
    //LFB1
    //fuel
    getPartFuel("LFB1-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.LFB.LFB1.Fuel = value
    })
    //Ox
    getPartFuel("LFB1-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.LFB.LFB1.Ox = value
    })
    //LFB2
    //fuel
    getPartFuel("LFB2-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.LFB.LFB2.Fuel = value
    })
    //Ox
    getPartFuel("LFB2-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.LFB.LFB2.Ox = value
    })
    //LFB3
    //fuel
    getPartFuel("LFB3-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.LFB.LFB3.Fuel = value
    })
    //Ox
    getPartFuel("LFB3-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.LFB.LFB3.Ox = value
    })
    //LFB4
    //fuel
    getPartFuel("LFB4-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.LFB.LFB4.Fuel = value
    })
    //Ox
    getPartFuel("LFB4-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.LFB.LFB4.Ox = value
    })
    //S1
    //fuel
    getPartFuel("S1-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.S1.Fuel = value
    })
    //Ox
    getPartFuel("S1-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.S1.Ox = value
    })
    //S2
    //fuel
    getPartFuel("S2-1", "LiquidFuel").then(value => {
        vehicleStore.telem.fuel.S2.Fuel = value
    })
    //Ox
    getPartFuel("S2-1", "Oxidizer").then(value => {
        vehicleStore.telem.fuel.S2.Ox = value
    })
    //Mono
    getPartFuel("S2-M1", "MonoPropellant").then(value => {
        vehicleStore.telem.fuel.MONO = value
    })
    //Elec
    getElec().then(value => {
        vehicleStore.telem.fuel.ELEC = value
    })
    //Thrust
    getPartThrust("REI2").then(value => {
        vehicleStore.telem.THRUST.REI2 = value
    })
    getPartThrust("REM3").then(value => {
        vehicleStore.telem.THRUST.REM3T = value
    })
    getPartThrust("T30-1").then(value => {
        vehicleStore.telem.THRUST.T301 = value
    })
    getPartThrust("T30-2").then(value => {
        vehicleStore.telem.THRUST.T302 = value
    })
    getPartThrust("T30-3").then(value => {
        vehicleStore.telem.THRUST.T303 = value
    })
    getPartThrust("T30-4").then(value => {
        vehicleStore.telem.THRUST.T304 = value
    })
    //VALVES
    getValveState("LP", "ModuleGenerator", "Start Fueling", "Stop Fueling").then(state =>{
        vehicleStore.telem.VALVES.LPLFB = state;
    })
    getValveState("LP", "ModuleGenerator", "Activate Generator", "Shutdown Generator").then(state =>{
        vehicleStore.telem.VALVES.ELEC = state;
    })
    getTankState("S1-1", "LiquidFuel").then(state =>{
        vehicleStore.telem.VALVES.LFBS1 = state;
    })
    getValveState("VALVE-S1S2", "ModuleToggleCrossfeed", "Enable Crossfeed", "Disable Crossfeed").then(state =>{
        vehicleStore.telem.VALVES.S1S2 = state;
    })
    getValveState("VENT-LFB1", "makeSteam", "Show Vapor", "Hide Vapor").then(state =>{
        vehicleStore.telem.VENTS.LFB = state;
    })
    getValveState("VENT-S1-2", "makeSteam", "Show Vapor", "Hide Vapor").then(state =>{
        vehicleStore.telem.VENTS.S1 = state;
    })
    getValveState("VENT-S2-1", "makeSteam", "Show Vapor", "Hide Vapor").then(state =>{
        vehicleStore.telem.VENTS.S2 = state;
    })
    getValveState("VENT-LFB-TOWER-2", "makeSteam", "Show Vapor", "Hide Vapor").then(state =>{
        vehicleStore.telem.VENTS.GFLFB = state;
    })
    getValveState("VENT-CT-3", "makeSteam", "Show Vapor", "Hide Vapor").then(state =>{
        vehicleStore.telem.VENTS.GFCORE = state;
    })
    /*getComms().then(value =>{
        vehicleStore.telem.COMM.name = value.name;
        vehicleStore.telem.COMM.delay = value.delay;
    })*/
}
KRPCInit()


const app = express();

app.get("/vehicle", function(req,res){
    res.send(JSON.stringify(vehicleStore.telem));
})

//Express
let auth = "IKSA_AUTH_rg7euhgahiuo"
const expressApp = express();
expressApp.get("/telem", (req,res) =>{
    if(req.query){
        if(req.query.auth == auth){
            res.status(200).send(JSON.stringify(vehicleStore.telem, null, 2))
        }else{
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(401);
    }
})
expressApp.listen(3001, ()=>{
    console.log("IKSA Telemetry Hub listening on 3001");
});